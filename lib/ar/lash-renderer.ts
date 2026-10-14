import {
  Mesh,
  OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from "three";
import { createLashGeometry, deformLashGeometry, type LashGroom, type Point3 } from "./lash-geometry";
import { resolveEyeClosure } from "./eye-pose";
import { createLashMaterial, createLashSilhouette } from "./lash-silhouette";
import { createFaceOccluder } from "./face-occluder";
import type { FacePoint, LashRenderer, LashStyleId, TrackedFace } from "./types";

/** MediaPipe anatomical mapping; ordered inner corner → outer corner. */
export const UPPER_LID_INDICES = {
  left: [362, 398, 384, 385, 386, 387, 388, 466, 263],
  right: [133, 173, 157, 158, 159, 160, 161, 246, 33],
} as const;

export function landmarkToWorld(point: FacePoint, width: number, height: number): Point3 {
  // MediaPipe z uses approximately the same scale as normalized x, NOT frame height.
  return { x: point.x * width, y: (1 - point.y) * height, z: -point.z * width };
}

function normalise(point: Point3): Point3 {
  const size = Math.hypot(point.x, point.y, point.z) || 1;
  return { x: point.x / size, y: point.y / size, z: point.z / size };
}

function faceNormal(landmarks: FacePoint[], width: number, height: number): Point3 {
  const outerRight = landmarkToWorld(landmarks[33], width, height);
  const outerLeft = landmarkToWorld(landmarks[263], width, height);
  const forehead = landmarkToWorld(landmarks[10], width, height);
  const chin = landmarkToWorld(landmarks[152], width, height);
  const across = { x: outerLeft.x - outerRight.x, y: outerLeft.y - outerRight.y, z: outerLeft.z - outerRight.z };
  const up = { x: forehead.x - chin.x, y: forehead.y - chin.y, z: forehead.z - chin.z };
  return normalise({ x: across.y * up.z - across.z * up.y, y: across.z * up.x - across.x * up.z, z: across.x * up.y - across.y * up.x });
}

function validLandmarks(face: TrackedFace) {
  const required = [...UPPER_LID_INDICES.left, ...UPPER_LID_INDICES.right, 374, 145, 10, 152];
  return required.every((index) => {
    const p = face.landmarks[index];
    return p && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z);
  });
}

/** Two merged fibre meshes, orthographic composite, no camera images leave this renderer. */
export function createLashRenderer(canvas: HTMLCanvasElement): LashRenderer {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  const occluder = createFaceOccluder();
  scene.add(occluder.mesh);
  const camera = new OrthographicCamera(0, 1, 1, 0, 0.1, 10000);
  // Subpixel fibres read as silhouettes in a webcam. Specular highlights on
  // tiny polygon rings produce silver dots, so keep their colour light-independent.
  const material = createLashMaterial();
  let style: LashStyleId = "wispy-hybrid";
  let disposed = false;
  let frameWidth = 0;
  let frameHeight = 0;
  let pixelBudget = 2_100_000;
  let lastTimestamp = 0;
  let smoothLandmarks: FacePoint[] = [];
  let groomLeft: LashGroom;
  let groomRight: LashGroom;
  let silhouetteLeft: ReturnType<typeof createLashSilhouette>;
  let silhouetteRight: ReturnType<typeof createLashSilhouette>;
  let meshLeft: Mesh;
  let meshRight: Mesh;

  function buildGrooms() {
    groomLeft = createLashGeometry(style);
    groomRight = createLashGeometry(style);
    silhouetteLeft = createLashSilhouette(groomLeft);
    silhouetteRight = createLashSilhouette(groomRight);
    meshLeft = new Mesh(silhouetteLeft.geometry, material);
    meshRight = new Mesh(silhouetteRight.geometry, material);
    meshLeft.name = `${style}-anatomical-left`;
    meshRight.name = `${style}-anatomical-right`;
    meshLeft.frustumCulled = meshRight.frustumCulled = false;
    scene.add(meshLeft, meshRight);
  }
  buildGrooms();

  return {
    setQuality(quality) {
      const budget = quality === "balanced" ? 1_000_000 : 2_100_000;
      if (disposed || pixelBudget === budget) return;
      pixelBudget = budget;
      frameWidth = 0;
    },
    setDefinition(amount) {
      if (disposed || !Number.isFinite(amount)) return;
      material.uniforms.definition.value = 0.65 + Math.min(100, Math.max(0, amount)) / 100;
    },
    setStyle(nextStyle) {
      if (disposed || style === nextStyle) return;
      scene.remove(meshLeft, meshRight);
      groomLeft.geometry.dispose();
      groomRight.geometry.dispose();
      silhouetteLeft.dispose();
      silhouetteRight.dispose();
      style = nextStyle;
      buildGrooms();
    },
    render(face, width, height) {
      if (disposed) return;
      if (!(width > 0 && height > 0) || !validLandmarks(face)) {
        renderer.clear();
        occluder.clear();
        smoothLandmarks = [];
        return;
      }
      if (width !== frameWidth || height !== frameHeight) {
        frameWidth = width;
        frameHeight = height;
        // Thin hairs need more samples than the inference frame. Cap the backing
        // buffer at ~2 MP: 2× for small feeds, 1.5× for a 960×720 camera.
        renderer.setPixelRatio(Math.min(2, Math.sqrt(pixelBudget / (width * height))));
        renderer.setSize(width, height, false);
        camera.right = width;
        camera.top = height;
        camera.position.z = width * 4;
        camera.far = width * 8;
        camera.updateProjectionMatrix();
        smoothLandmarks = [];
      }
      const delta = face.timestamp - lastTimestamp;
      // Short, time-aware smoothing (roughly 14 ms). Lid/blink movement remains responsive.
      const alpha = smoothLandmarks.length && delta > 0 && delta < 250 ? 1 - Math.exp(-delta / 14) : 1;
      // Use the same temporal fit for the depth surface and lash attachments.
      for (let index = 0; index < face.landmarks.length; index++) {
        const next = face.landmarks[index];
        const old = smoothLandmarks[index];
        smoothLandmarks[index] = old ? { x: old.x + (next.x - old.x) * alpha, y: old.y + (next.y - old.y) * alpha, z: old.z + (next.z - old.z) * alpha } : { ...next };
      }
      lastTimestamp = face.timestamp;
      occluder.update(smoothLandmarks, width, height);
      const normal = faceNormal(smoothLandmarks, width, height);
      for (const eye of ["left", "right"] as const) {
        const points = UPPER_LID_INDICES[eye].map((i) => landmarkToWorld(smoothLandmarks[i], width, height));
        const first = points[0];
        const last = points[points.length - 1];
        const eyeWidth = Math.hypot(last.x - first.x, last.y - first.y, last.z - first.z);
        const mesh = eye === "left" ? meshLeft : meshRight;
        // Hide extremely oblique or tiny eyes where landmark fitting is unreliable.
        const projectedWidth = Math.hypot(last.x - first.x, last.y - first.y);
        mesh.visible = eyeWidth > 8 && projectedWidth / eyeWidth > 0.48 && normal.z > 0.35;
        if (mesh.visible) {
          deformLashGeometry(eye === "left" ? groomLeft : groomRight, points, normal, eye, eyeWidth,
            resolveEyeClosure(smoothLandmarks, eye, width, height, face.blink[eye]));
          (eye === "left" ? silhouetteLeft : silhouetteRight).update();
        }
      }
      renderer.render(scene, camera);
    },
    clear() {
      if (disposed) return;
      renderer.clear();
      occluder.clear();
      smoothLandmarks = [];
      lastTimestamp = 0;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      groomLeft.geometry.dispose();
      groomRight.geometry.dispose();
      silhouetteLeft.dispose();
      silhouetteRight.dispose();
      material.dispose();
      occluder.dispose();
      scene.clear();
      renderer.clear();
      renderer.dispose();
      // Keep the mounted canvas's context reusable by the next camera session.
      smoothLandmarks = [];
    },
  };
}
