import type { SessionError } from "./types";

export function stopCamera(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** The permission prompt is not cancellable, so dispose streams that arrive after closing. */
export async function requestCamera(signal: AbortSignal): Promise<MediaStream> {
  if (signal.aborted) throw new DOMException("Preview cancelled", "AbortError");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } },
  });
  if (signal.aborted) {
    stopCamera(stream);
    throw new DOMException("Preview cancelled", "AbortError");
  }
  return stream;
}

/** A granted stream may never deliver a frame (busy driver, interrupted OS camera). */
export function playCamera(video: HTMLVideoElement, signal: AbortSignal, timeoutMs = 12_000): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("resize", ready);
      if (error) reject(error); else resolve();
    };
    const abort = () => finish(new DOMException("Preview cancelled", "AbortError"));
    const ready = () => { if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) finish(); };
    const timeout = setTimeout(() => finish(new DOMException("The camera did not deliver a video frame.", "NotReadableError")), timeoutMs);
    signal.addEventListener("abort", abort, { once: true });
    video.addEventListener("loadeddata", ready);
    video.addEventListener("resize", ready);
    if (signal.aborted) { abort(); return; }
    try { void video.play().then(ready, finish); } catch (error) { finish(error instanceof Error ? error : new Error("Camera playback failed")); }
  });
}

export function cameraError(error: unknown): SessionError {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return {
    title: "Camera access is off.",
    detail: "Allow the camera in your browser’s website settings, then try again. You can also explore our real results.",
    retryable: true,
  };
  if (name === "NotFoundError" || name === "OverconstrainedError") return {
    title: "We couldn’t find a camera.",
    detail: "Try a device with a front camera, or explore the collection through our real results.",
    retryable: true,
  };
  if (name === "NotReadableError") return {
    title: "Your camera is busy.",
    detail: "Close any other app using your camera, then try again.",
    retryable: true,
  };
  return {
    title: "The mirror couldn’t start.",
    detail: "Check your connection and try again in Safari or Chrome. Your camera has been stopped.",
    retryable: true,
  };
}
