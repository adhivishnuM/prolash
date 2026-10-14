import {
  BufferAttribute, BufferGeometry, DoubleSide, DynamicDrawUsage,
  Mesh, MeshBasicMaterial, NoBlending,
} from "three";
import { FACE_TRIANGLE_INDICES, FACE_VERTEX_COUNT } from "./face-topology";
import type { FacePoint } from "./types";

export interface FaceOccluder {
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  /** Returns false and hides the mesh if any required landmark is invalid. */
  update(landmarks: readonly FacePoint[], width: number, height: number): boolean;
  clear(): void;
  dispose(): void;
}

/**
 * One invisible depth draw lets the tracked nose/cheek obscure far-side lashes.
 * This follows facial geometry only: it does not detect hair, hands or glasses.
 */
export function createFaceOccluder(): FaceOccluder {
  const coordinates = new Float32Array(FACE_VERTEX_COUNT * 3);
  const nextCoordinates = new Float32Array(coordinates.length);
  const position = new BufferAttribute(coordinates, 3).setUsage(DynamicDrawUsage);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", position);
  geometry.setIndex(new BufferAttribute(FACE_TRIANGLE_INDICES.slice(), 1));
  const material = new MeshBasicMaterial({
    colorWrite: false,
    depthWrite: true,
    depthTest: true,
    side: DoubleSide,
    blending: NoBlending,
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = "tracked-face-depth-occluder";
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  mesh.visible = false;
  let disposed = false;

  const clear = () => { mesh.visible = false; };

  return {
    mesh,
    update(landmarks, width, height) {
      if (disposed || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || landmarks.length < FACE_VERTEX_COUNT) {
        clear();
        return false;
      }
      // Move the depth surface slightly away from the +Z camera to protect
      // roots that lie on the eyelid seam. This remains resolution-independent.
      const depthBias = width * 0.0006;
      for (let i = 0; i < FACE_VERTEX_COUNT; i++) {
        const point = landmarks[i];
        if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z)) {
          clear();
          return false;
        }
        // Same coordinate convention as lash-renderer.landmarkToWorld. Depth
        // is normalized by source width, including for portrait camera frames.
        nextCoordinates[i * 3] = point.x * width;
        nextCoordinates[i * 3 + 1] = (1 - point.y) * height;
        nextCoordinates[i * 3 + 2] = -point.z * width - depthBias;
        if (!Number.isFinite(nextCoordinates[i * 3]) || !Number.isFinite(nextCoordinates[i * 3 + 1]) || !Number.isFinite(nextCoordinates[i * 3 + 2])) {
          clear();
          return false;
        }
      }
      // Commit atomically: an invalid late landmark never leaves an uploaded
      // partial frame or NaN/Infinity inside the visible geometry buffer.
      coordinates.set(nextCoordinates);
      position.needsUpdate = true;
      mesh.visible = true;
      return true;
    },
    clear,
    dispose() {
      if (disposed) return;
      disposed = true;
      clear();
      mesh.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}
