import type { FacePoint } from "./types";

type Eye = "left" | "right";

const EYE_POINTS = {
  left: { inner: 362, outer: 263, upper: 386, lower: 374 },
  right: { inner: 133, outer: 33, upper: 159, lower: 145 },
} as const;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * Resolve a lash hinge amount from the actual lid opening, with blendshapes as
 * supporting evidence. A raw eyeBlink score is not an eyelid rotation angle:
 * downward gaze and naturally narrow eyes can produce a score on an open eye.
 *
 * Ratios are conservative grooming calibration values, not an anatomical
 * classification. Measuring in 3D makes the ratio independent of camera size,
 * aspect ratio, head roll, and the foreshortening caused by head pitch.
 */
export function resolveEyeClosure(
  landmarks: readonly FacePoint[], eye: Eye, width: number, height: number, rawBlink: number,
): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 0;
  const indices = EYE_POINTS[eye];
  const points = [indices.inner, indices.outer, indices.upper, indices.lower].map((index) => landmarks[index]);
  if (points.some((point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z))) return 0;
  const [inner, outer, upper, lower] = points;
  // MediaPipe depth is normalized on image width, just like its x coordinate.
  const across = { x: (outer.x - inner.x) * width, y: (outer.y - inner.y) * height, z: (outer.z - inner.z) * width };
  const aperture = { x: (lower.x - upper.x) * width, y: (lower.y - upper.y) * height, z: (lower.z - upper.z) * width };
  const eyeWidth = Math.hypot(across.x, across.y, across.z);
  if (eyeWidth < 1) return 0;
  // Ignore sideways landmark offset: closure concerns separation across the lid.
  const parallel = (aperture.x * across.x + aperture.y * across.y + aperture.z * across.z) / eyeWidth;
  const perpendicularSquared = aperture.x ** 2 + aperture.y ** 2 + aperture.z ** 2 - parallel ** 2;
  const ratio = Math.sqrt(Math.max(0, perpendicularSquared)) / eyeWidth;
  const apertureClosure = 1 - smoothstep(0.025, 0.14, ratio);
  const blinkEvidence = Number.isFinite(rawBlink) ? smoothstep(0.3, 0.85, rawBlink) : 0;
  // Nearly touching lids remain closed even if the blendshape drops a frame.
  const touchingLids = 1 - smoothstep(0.025, 0.05, ratio);
  return Math.max(touchingLids, apertureClosure * (0.35 + 0.65 * blinkEvidence));
}
