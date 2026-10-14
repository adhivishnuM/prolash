"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getLashStyle, LASH_STYLES } from "@/lib/ar/catalog";
import { cameraError, playCamera, requestCamera, stopCamera } from "@/lib/ar/camera";
import { assessFace } from "@/lib/ar/face-quality";
import type { FaceTracker, LashRenderer, LashSnapshot, LashStyleId, SessionError, SessionStatus, TrackedFace } from "@/lib/ar/types";

interface Runtime {
  controller: AbortController;
  stream: MediaStream | null;
  tracker: FaceTracker | null;
  renderer: LashRenderer | null;
  timer: ReturnType<typeof setTimeout> | null;
  staleTimer: ReturnType<typeof setTimeout> | null;
  watchdog: ReturnType<typeof setInterval> | null;
  face: TrackedFace | null;
  sample: HTMLCanvasElement;
  inference: HTMLCanvasElement;
  captured: HTMLCanvasElement;
}

const subscribeLocation = () => () => {};
const queryStyle = () => getLashStyle(new URLSearchParams(window.location.search).get("style")).id;
const defaultStyle = () => LASH_STYLES[0].id;

function releaseRuntime(runtime: Runtime | null) {
  if (!runtime) return;
  runtime.controller.abort();
  if (runtime.timer) clearTimeout(runtime.timer);
  if (runtime.staleTimer) clearTimeout(runtime.staleTimer);
  if (runtime.watchdog) clearInterval(runtime.watchdog);
  stopCamera(runtime.stream);
  runtime.tracker?.dispose();
  runtime.renderer?.dispose();
  runtime.sample.width = runtime.captured.width = runtime.inference.width = 0;
  runtime.sample.height = runtime.captured.height = runtime.inference.height = 0;
}

export function useLashSession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const generation = useRef(0);
  const statusRef = useRef<SessionStatus>("idle");
  const explicitStyleRef = useRef<LashStyleId | null>(null);
  const originalRef = useRef(false);
  const definitionRef = useRef(65);
  const lastGuidance = useRef("Bring your face into view.");
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<SessionError | null>(null);
  const [guidance, setGuidance] = useState("Bring your face into view.");
  const [selectedId, setSelectedId] = useState<LashStyleId | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [snapshot, setSnapshot] = useState<LashSnapshot | null>(null);
  const [definition, setDefinition] = useState(65);
  const initialId = useSyncExternalStore(subscribeLocation, queryStyle, defaultStyle);
  const style = getLashStyle(selectedId ?? initialId);

  const publishStatus = useCallback((next: SessionStatus) => {
    if (statusRef.current === next) return;
    statusRef.current = next;
    setStatus(next);
  }, []);

  const release = useCallback(() => {
    generation.current += 1;
    const runtime = runtimeRef.current;
    runtimeRef.current = null;
    releaseRuntime(runtime);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }, []);

  const stop = useCallback(() => {
    release();
    setSnapshot(null);
    setError(null);
    setPhase("");
    publishStatus("idle");
  }, [release, publishStatus]);

  const start = useCallback(async () => {
    if (["permission", "loading", "positioning", "live"].includes(statusRef.current)) return;
    release();
    setError(null);
    setSnapshot(null);
    setShowOriginal(false);
    originalRef.current = false;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const display = frameRef.current;
    if (!video || !canvas || !display || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.Worker || !window.createImageBitmap || !window.OffscreenCanvas || !window.WebAssembly) {
      setError({ title: "Try the mirror in another browser.", detail: "Open this website directly in an up-to-date Safari or Chrome browser with camera access. Our real results are always available.", retryable: false });
      publishStatus("error");
      return;
    }
    const run = generation.current;
    const runtime: Runtime = {
      controller: new AbortController(), stream: null, tracker: null, renderer: null,
      timer: null, staleTimer: null, watchdog: null, face: null,
      sample: document.createElement("canvas"), inference: document.createElement("canvas"), captured: document.createElement("canvas"),
    };
    runtimeRef.current = runtime;
    const isCurrent = () => generation.current === run && !runtime.controller.signal.aborted;
    const fail = (failure: SessionError) => {
      if (!isCurrent()) return;
      release();
      setError(failure);
      publishStatus("error");
    };
    try {
      publishStatus("permission");
      setPhase("Waiting for camera permission…");
      runtime.stream = await requestCamera(runtime.controller.signal);
      if (!isCurrent()) { stopCamera(runtime.stream); return; }
      runtime.stream.getVideoTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          fail({ title: "Your camera was interrupted.", detail: "Your camera is off. Restart when you’re ready.", retryable: true });
        }, { once: true, signal: runtime.controller.signal });
        track.addEventListener("mute", () => {
          if (!isCurrent()) return;
          release();
          publishStatus("paused");
        }, { once: true, signal: runtime.controller.signal });
      });
      video.srcObject = runtime.stream;
      await playCamera(video, runtime.controller.signal);
      if (!isCurrent()) return;
      publishStatus("loading");
      setPhase("Preparing your lash preview…");
      const [tracking, rendering] = await Promise.all([import("@/lib/ar/face-tracker"), import("@/lib/ar/lash-renderer")]);
      if (!isCurrent()) return;
      runtime.renderer = rendering.createLashRenderer(canvas);
      runtime.renderer.setStyle(explicitStyleRef.current ?? queryStyle());
      runtime.renderer.setDefinition(definitionRef.current);
      const tracker = await tracking.createFaceTracker({
        signal: runtime.controller.signal,
        onProgress: (message: string) => { if (isCurrent()) setPhase(message); },
      });
      if (!isCurrent()) { tracker.dispose(); return; }
      runtime.tracker = tracker;
      publishStatus("positioning");
      setPhase("");
      let lastVideoTime = -1;
      let interval = 1000 / 24;
      let lastValidAt = 0;
      let inferenceEdge = 640;
      let slowFrames = 0;
      let watchdogVideoTime = video.currentTime;
      let lastFrameAt = performance.now();
      runtime.watchdog = setInterval(() => {
        if (!isCurrent()) return;
        if (video.readyState >= 2 && video.currentTime !== watchdogVideoTime) {
          watchdogVideoTime = video.currentTime;
          lastFrameAt = performance.now();
        } else if (performance.now() - lastFrameAt >= 6_000) {
          fail({ title: "Your camera stopped responding.", detail: "Your camera has been stopped. Restart the mirror to reconnect.", retryable: true });
        }
      }, 1_000);
      const updateGuidance = (message: string) => {
        if (lastGuidance.current !== message) {
          lastGuidance.current = message;
          setGuidance(message);
        }
      };
      const step = async () => {
        if (!isCurrent()) return;
        const started = performance.now();
        if (video.readyState < 2 || video.currentTime === lastVideoTime) {
          runtime.timer = setTimeout(() => void step(), 25);
          return;
        }
        lastVideoTime = video.currentTime;
        // A bounded inference frame keeps lower-end phones usable; CSS transforms
        // apply the same crop/mirroring to video and the source-sized overlay.
        const scale = Math.min(1, 960 / video.videoWidth);
        const width = Math.max(1, Math.round(video.videoWidth * scale));
        const height = Math.max(1, Math.round(video.videoHeight * scale));
        if (runtime.sample.width !== width || runtime.sample.height !== height) {
          runtime.sample.width = runtime.captured.width = width;
          runtime.sample.height = runtime.captured.height = height;
        }
        const sampleContext = runtime.sample.getContext("2d");
        if (!sampleContext) { fail(cameraError(new Error("Camera frame unavailable"))); return; }
        sampleContext.drawImage(video, 0, 0, width, height);
        try {
          // Tracking may use fewer pixels on slower devices while the matched
          // visible frame and saved image retain their original preview detail.
          const inferenceScale = Math.min(1, inferenceEdge / Math.max(width, height));
          const iw = Math.max(1, Math.round(width * inferenceScale));
          const ih = Math.max(1, Math.round(height * inferenceScale));
          if (runtime.inference.width !== iw || runtime.inference.height !== ih) { runtime.inference.width = iw; runtime.inference.height = ih; }
          const inferenceContext = runtime.inference.getContext("2d");
          if (!inferenceContext) throw new Error("Tracking surface unavailable");
          inferenceContext.drawImage(runtime.sample, 0, 0, iw, ih);
          const bitmap = await createImageBitmap(runtime.inference);
          if (!isCurrent()) { bitmap.close(); return; }
          const face = await tracker.detect(bitmap, started);
          if (!isCurrent()) return;
          const rect = display.getBoundingClientRect();
          const assessment = assessFace(face, { sourceWidth: width, sourceHeight: height, width: rect.width, height: rect.height });
          const age = performance.now() - started;
          // Keep the visible background and the fitted lashes on the same source
          // frame. A raw video behind an async overlay drifts during motion.
          if (display.width !== width || display.height !== height) { display.width = width; display.height = height; }
          const displayContext = display.getContext("2d");
          if (!displayContext) throw new Error("Preview surface unavailable");
          displayContext.drawImage(age < 450 ? runtime.sample : video, 0, 0, width, height);
          if (assessment.usable && face && age < 450) {
            runtime.face = face;
            lastValidAt = performance.now();
            runtime.captured.getContext("2d")?.drawImage(runtime.sample, 0, 0);
            if (originalRef.current) runtime.renderer?.clear();
            else runtime.renderer?.render(face, width, height);
            publishStatus("live");
            updateGuidance(assessment.message);
          } else {
            runtime.face = null;
            runtime.renderer?.clear();
            publishStatus("positioning");
            updateGuidance(age >= 450 ? "Hold still for a moment." : assessment.message);
          }
          slowFrames = age > 100 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
          if (slowFrames >= 4 && inferenceEdge > 384) {
            inferenceEdge = inferenceEdge === 640 ? 512 : 384;
            runtime.renderer?.setQuality("balanced");
            slowFrames = 0;
          }
          // Lower inference rate rather than accumulating camera frames.
          interval = Math.min(100, Math.max(1000 / 24, interval * 0.85 + age * 1.1 * 0.15));
          if (runtime.staleTimer) clearTimeout(runtime.staleTimer);
          runtime.staleTimer = setTimeout(() => {
            if (isCurrent() && performance.now() - lastValidAt >= 440) {
              runtime.face = null;
              runtime.renderer?.clear();
              publishStatus("positioning");
              updateGuidance("Bring your face into view.");
            }
          }, 450);
          runtime.timer = setTimeout(() => void step(), Math.max(0, interval - (performance.now() - started)));
        } catch (failure) {
          fail(cameraError(failure));
        }
      };
      void step();
    } catch (failure) {
      if (isCurrent()) fail(cameraError(failure));
    }
  }, [publishStatus, release]);

  const selectStyle = useCallback((id: LashStyleId) => {
    if (statusRef.current === "review") return;
    const next = getLashStyle(id);
    explicitStyleRef.current = next.id;
    setSelectedId(next.id);
    const runtime = runtimeRef.current;
    runtime?.renderer?.setStyle(next.id);
    if (runtime?.face && !originalRef.current) runtime.renderer?.render(runtime.face, runtime.captured.width, runtime.captured.height);
    const url = new URL(window.location.href);
    url.searchParams.set("style", next.id);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const changeDefinition = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || statusRef.current === "review") return;
    const next = Math.min(100, Math.max(0, amount));
    definitionRef.current = next;
    setDefinition(next);
    const runtime = runtimeRef.current;
    runtime?.renderer?.setDefinition(next);
    if (runtime?.face && !originalRef.current) runtime.renderer?.render(runtime.face, runtime.captured.width, runtime.captured.height);
  }, []);

  const toggleOriginal = useCallback(() => {
    originalRef.current = !originalRef.current;
    setShowOriginal(originalRef.current);
    const runtime = runtimeRef.current;
    if (originalRef.current) runtime?.renderer?.clear();
    else if (runtime?.face) runtime.renderer?.render(runtime.face, runtime.captured.width, runtime.captured.height);
  }, []);

  const capture = useCallback(() => {
    const runtime = runtimeRef.current;
    const overlay = canvasRef.current;
    if (!runtime?.face || !overlay || statusRef.current !== "live") return;
    try {
      const width = runtime.captured.width;
      const height = runtime.captured.height;
      const output = document.createElement("canvas");
      output.width = width;
      output.height = height;
      const context = output.getContext("2d");
      if (!context) return;
      context.translate(width, 0);
      context.scale(-1, 1);
      context.drawImage(runtime.captured, 0, 0);
      const original = output.toDataURL("image/jpeg", 0.94);
      // Both versions use the displayed processed frame and its exact fit.
      runtime.renderer?.render(runtime.face, width, height);
      context.drawImage(overlay, 0, 0, width, height);
      const styled = output.toDataURL("image/jpeg", 0.94);
      const styleId = explicitStyleRef.current ?? queryStyle();
      release();
      setSnapshot({ original, styled, styleId });
      originalRef.current = false;
      setShowOriginal(false);
      publishStatus("review");
    } catch {
      release();
      setError({ title: "Your preview couldn’t be saved.", detail: "Restart the mirror to try again. Your camera has been stopped.", retryable: true });
      publishStatus("error");
    }
  }, [release, publishStatus]);

  const saveSnapshot = useCallback(() => {
    if (!snapshot) return;
    try {
      const link = document.createElement("a");
      link.href = showOriginal ? snapshot.original : snapshot.styled;
      link.download = `paolash-${showOriginal ? "original" : snapshot.styleId}-preview.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError({ title: "Your browser couldn’t save the image.", detail: "Try the mirror in Safari or Chrome to save a local copy.", retryable: false });
      publishStatus("error");
    }
  }, [snapshot, showOriginal, publishStatus]);

  const discardSnapshot = useCallback(() => {
    setSnapshot(null);
    originalRef.current = false;
    setShowOriginal(false);
    publishStatus("idle");
  }, [publishStatus]);

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && runtimeRef.current) {
        release();
        publishStatus("paused");
      }
    };
    const onPageHide = () => {
      if (runtimeRef.current) { release(); publishStatus("paused"); }
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (!runtimeRef.current) return;
      release();
      setError({ title: "The mirror needs a fresh start.", detail: "Your device paused the preview. Your camera is off; restart when you’re ready.", retryable: true });
      publishStatus("error");
    };
    const canvas = canvasRef.current;
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    canvas?.addEventListener("webglcontextlost", onContextLost);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
      canvas?.removeEventListener("webglcontextlost", onContextLost);
      release();
    };
  }, [release, publishStatus]);

  return { videoRef, canvasRef, frameRef, status, phase, error, guidance, style, definition, changeDefinition, showOriginal, snapshot, start, stop, selectStyle, toggleOriginal, capture, saveSnapshot, discardSnapshot };
}
