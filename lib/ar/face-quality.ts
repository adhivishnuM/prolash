import type { FacePoint, TrackedFace } from "./types";

const distance = (a: FacePoint, b: FacePoint) => Math.hypot(a.x - b.x, a.y - b.y);

/** Conservative geometry checks, not a promise of precision or an occlusion classifier. */
export function assessFace(face: TrackedFace | null, viewport?: { sourceWidth: number; sourceHeight: number; width: number; height: number }): { usable: boolean; message: string } {
  if (!face || face.landmarks.length < 468) return { usable: false, message: "Bring your face into view." };
  const points = [33, 133, 362, 263, 1].map((index) => face.landmarks[index]);
  if (points.some((point) => !point || !Number.isFinite(point.x + point.y + point.z))) {
    return { usable: false, message: "Bring your face into view." };
  }
  const [rightOuter, rightInner, leftInner, leftOuter] = points;
  if (viewport && Object.values(viewport).every((value) => Number.isFinite(value) && value > 0)) {
    const scale = Math.max(viewport.width / viewport.sourceWidth, viewport.height / viewport.sourceHeight);
    const visibleWidth = viewport.width / (viewport.sourceWidth * scale);
    const visibleHeight = viewport.height / (viewport.sourceHeight * scale);
    const xMargin = (1 - visibleWidth) / 2 + visibleWidth * 0.04;
    const yMargin = (1 - visibleHeight) / 2 + visibleHeight * 0.04;
    if (points.slice(0, 4).some((point) => point.x < xMargin || point.x > 1 - xMargin || point.y < yMargin || point.y > 1 - yMargin)) {
      return { usable: false, message: "Keep both eyes inside the mirror." };
    }
  }
  const rightWidth = distance(rightOuter, rightInner);
  const leftWidth = distance(leftInner, leftOuter);
  if (Math.min(rightWidth, leftWidth) < 0.035) return { usable: false, message: "Move a little closer." };
  if (Math.max(rightWidth, leftWidth) / Math.min(rightWidth, leftWidth) > 2.2) {
    return { usable: false, message: "Turn gently towards the camera." };
  }
  if (points.slice(0, 4).some((point) => point.x < 0.06 || point.x > 0.94 || point.y < 0.09 || point.y > 0.9)) {
    return { usable: false, message: "Keep both eyes inside the mirror." };
  }
  return { usable: true, message: "" };
}
