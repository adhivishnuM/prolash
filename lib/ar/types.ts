export type LashStyleId = "wispy-hybrid" | "russian-volume" | "eyeliner-effect" | "natural-classic" | "doll-eye" | "wet-look";

export interface FacePoint { x: number; y: number; z: number }

/** Unmirrored source coordinates. Left/right always mean the wearer's eyes. */
export interface TrackedFace {
  landmarks: FacePoint[];
  blink: { left: number; right: number };
  timestamp: number;
}

export interface FaceTracker {
  detect(frame: ImageBitmap, timestamp: number): Promise<TrackedFace | null>;
  dispose(): void;
}

export interface LashRenderer {
  setStyle(style: LashStyleId): void;
  setDefinition(amount: number): void;
  setQuality(quality: "high" | "balanced"): void;
  render(face: TrackedFace, width: number, height: number): void;
  clear(): void;
  dispose(): void;
}

export type SessionStatus = "idle" | "permission" | "loading" | "positioning" | "live" | "paused" | "review" | "error";

export interface SessionError { title: string; detail: string; retryable: boolean }

export interface LashSnapshot {
  original: string;
  styled: string;
  styleId: LashStyleId;
}
