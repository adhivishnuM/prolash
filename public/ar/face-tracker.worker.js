/* global Vision */
/* MediaPipe is deliberately loaded only inside this dedicated classic worker. */
"use strict";

let landmarker = null;
let initializing = false;
let failed = false;
const runtimeBase = new URL("./vendor/mediapipe-1.1.0/", self.location.href).href;
const modelUrl = new URL("./vendor/face-landmarker-f16-v1-64184e229b26.task", self.location.href).href;

function sendError(message) {
  failed = true;
  self.postMessage({ type: "error", message });
}

async function initialize() {
  if (initializing || landmarker || failed) return;
  initializing = true;
  try {
    if (typeof OffscreenCanvas === "undefined") {
      throw new Error("Background graphics are unavailable.");
    }
    self.postMessage({ type: "progress", message: "Preparing your private camera preview…" });
    importScripts(`${runtimeBase}vision_bundle.js`);
    const fileset = await Vision.FilesetResolver.forVisionTasks(`${runtimeBase}wasm`);
    self.postMessage({ type: "progress", message: "Loading the eye-tracking model…" });
    landmarker = await Vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: modelUrl, delegate: "CPU" },
      runningMode: "VIDEO",
      numFaces: 1,
      minFaceDetectionConfidence: 0.6,
      minFacePresenceConfidence: 0.6,
      minTrackingConfidence: 0.6,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
    });
    self.postMessage({ type: "ready" });
  } catch {
    sendError("The try-on engine could not load. Check your connection, or try the latest Safari or Chrome.");
  }
}

function detect(message) {
  const { frame, id, timestamp } = message;
  try {
    if (!landmarker || failed) {
      self.postMessage({ type: "result", id, face: null });
      return;
    }
    const result = landmarker.detectForVideo(frame, timestamp);
    const landmarks = result.faceLandmarks[0];
    let face = null;
    if (landmarks?.length >= 468 && landmarks.every((point) => (
      Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z)
    ))) {
      const categories = result.faceBlendshapes[0]?.categories || [];
      const score = (name) => Math.min(1, Math.max(0,
        categories.find((category) => category.categoryName === name)?.score || 0));
      face = {
        landmarks: landmarks.map(({ x, y, z }) => ({ x, y, z })),
        // MediaPipe's left/right refer to the wearer, before selfie mirroring.
        blink: { left: score("eyeBlinkLeft"), right: score("eyeBlinkRight") },
        timestamp,
      };
    }
    self.postMessage({ type: "result", id, face });
  } catch {
    sendError("Face tracking stopped. Close the camera and try again.");
  } finally {
    // The worker owns the transferred bitmap. Do not retain any camera frames.
    frame?.close();
  }
}

self.onmessage = (event) => {
  const message = event.data;
  if (message.type === "init") void initialize();
  else if (message.type === "detect") detect(message);
};
