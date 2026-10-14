import type { FaceTracker, TrackedFace } from "./types";

const INITIALIZATION_TIMEOUT_MS = 45_000;
const INFERENCE_TIMEOUT_MS = 8_000;

type WorkerReply =
  | { type: "ready" }
  | { type: "progress"; message: string }
  | { type: "result"; id: number; face: TrackedFace | null }
  | { type: "error"; message: string };

interface PendingFrame {
  id: number;
  resolve: (face: TrackedFace | null) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

function abortError() {
  return new DOMException("The camera session has ended.", "AbortError");
}

/**
 * All inference runs in a dedicated worker. Input must be an UNMIRRORED camera
 * frame. Calling detect transfers ownership of the bitmap, even when it drops
 * a busy frame. Never reuse a bitmap after calling this method.
 */
export async function createFaceTracker(options: {
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
} = {}): Promise<FaceTracker> {
  if (options.signal?.aborted) throw abortError();
  if (
    typeof Worker === "undefined" ||
    typeof WebAssembly === "undefined" ||
    typeof OffscreenCanvas === "undefined" ||
    typeof createImageBitmap !== "function"
  ) {
    throw new Error("Live try-on needs a browser with camera and background graphics support. Try the latest Safari or Chrome.");
  }

  // A classic worker supports the package's importScripts-based WASM loader.
  // Serving this file from public also works with Next's static export.
  const worker = new Worker("/ar/face-tracker.worker.js?v=1", {
    name: "paolash-face-tracker",
  });
  let disposed = false;
  let initialized = false;
  let sequence = 0;
  let lastTimestamp = -1;
  let pending: PendingFrame | null = null;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const initializationTimeout = setTimeout(() => {
    shutdown(new Error("The try-on engine took too long to load. Check your connection and try again."));
  }, INITIALIZATION_TIMEOUT_MS);

  function shutdown(error: Error) {
    if (disposed) return;
    disposed = true;
    clearTimeout(initializationTimeout);
    options.signal?.removeEventListener("abort", onAbort);
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    // Termination also releases transferred frames and the worker's WASM heap,
    // including when synchronous inference is stuck and cannot handle messages.
    worker.terminate();
    if (pending) {
      clearTimeout(pending.timeout);
      pending.reject(error);
      pending = null;
    }
    if (!initialized) rejectReady(error);
  }

  function onAbort() {
    shutdown(abortError());
  }

  worker.onmessage = (event: MessageEvent<WorkerReply>) => {
    if (disposed) return;
    const reply = event.data;
    if (reply.type === "progress") {
      options.onProgress?.(reply.message);
    } else if (reply.type === "ready") {
      initialized = true;
      clearTimeout(initializationTimeout);
      resolveReady();
    } else if (reply.type === "error") {
      shutdown(new Error(reply.message));
    } else if (reply.type === "result" && pending?.id === reply.id) {
      const completed = pending;
      pending = null;
      clearTimeout(completed.timeout);
      completed.resolve(reply.face);
    }
  };
  worker.onerror = (event) => {
    event.preventDefault();
    shutdown(new Error("The try-on engine could not start on this browser. Please update your browser and try again."));
  };
  worker.onmessageerror = () => {
    shutdown(new Error("Your browser could not share a camera frame with the try-on engine."));
  };
  options.signal?.addEventListener("abort", onAbort, { once: true });
  // Re-check after installing the listener to cover cancellation during setup.
  if (options.signal?.aborted) onAbort();
  if (!disposed) {
    try {
      worker.postMessage({ type: "init" });
    } catch {
      shutdown(new Error("Your browser could not start the background try-on engine."));
    }
  }
  await ready;
  if (disposed) throw abortError();

  return {
    detect(frame, timestamp) {
      if (disposed) {
        frame.close();
        return Promise.reject(abortError());
      }
      if (!Number.isFinite(timestamp) || timestamp < 0) {
        frame.close();
        return Promise.reject(new Error("A camera frame requires a valid timestamp."));
      }
      // Do not queue frames: a delayed preview is worse than a skipped frame.
      if (pending) {
        frame.close();
        return Promise.resolve(null);
      }
      const id = ++sequence;
      const frameTimestamp = Math.max(timestamp, lastTimestamp + 0.01);
      lastTimestamp = frameTimestamp;
      return new Promise<TrackedFace | null>((resolve, reject) => {
        pending = {
          id, resolve, reject,
          timeout: setTimeout(() => {
            shutdown(new Error("Face tracking stopped responding. Close the camera and try again."));
          }, INFERENCE_TIMEOUT_MS),
        };
        try {
          worker.postMessage({ type: "detect", id, frame, timestamp: frameTimestamp }, [frame]);
        } catch {
          frame.close();
          shutdown(new Error("Your browser could not transfer a camera frame. Please try again."));
        }
      });
    },
    dispose() {
      shutdown(abortError());
    },
  };
}
