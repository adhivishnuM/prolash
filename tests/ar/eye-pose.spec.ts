import { expect, test } from "@playwright/test";
import { resolveEyeClosure } from "../../lib/ar/eye-pose";
import type { FacePoint } from "../../lib/ar/types";

type Eye = "left" | "right";

function faceWithAperture(ratio: number, eye: Eye = "left", width = 960, height = 720, pitch = 0, roll = 0) {
  const face: FacePoint[] = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const indices = eye === "left" ? [362, 263, 386, 374] : [133, 33, 159, 145];
  const sign = eye === "left" ? 1 : -1;
  const eyeWidth = width * 0.12;
  const positions = [[-sign * eyeWidth / 2, 0], [sign * eyeWidth / 2, 0], [0, -ratio * eyeWidth / 2], [0, ratio * eyeWidth / 2]];
  for (let i = 0; i < indices.length; i++) {
    const [x, y] = positions[i];
    const pitchedY = y * Math.cos(pitch);
    const z = y * Math.sin(pitch);
    const rotatedX = x * Math.cos(roll) - pitchedY * Math.sin(roll);
    const rotatedY = x * Math.sin(roll) + pitchedY * Math.cos(roll);
    face[indices[i]] = { x: 0.5 + rotatedX / width, y: 0.5 + rotatedY / height, z: z / width };
  }
  return face;
}

test("visibly open eyes never fold lashes even with a false high blink score", () => {
  for (const eye of ["left", "right"] as const) {
    for (const ratio of [0.14, 0.2, 0.3]) {
      expect(resolveEyeClosure(faceWithAperture(ratio, eye), eye, 960, 720, 1)).toBeCloseTo(0, 12);
    }
  }
});

test("a narrow open eye gets a small adjustment while genuinely closed lids fold", () => {
  const narrow = faceWithAperture(0.11);
  expect(resolveEyeClosure(narrow, "left", 960, 720, 0.9)).toBeLessThan(0.2);
  expect(resolveEyeClosure(narrow, "left", 960, 720, 0.1)).toBeLessThan(0.07);
  for (const rawBlink of [0, 0.5, 1]) {
    expect(resolveEyeClosure(faceWithAperture(0.02), "left", 960, 720, rawBlink)).toBe(1);
  }
});

test("lid closure is unchanged by source resolution, aspect ratio, pitch, roll or anatomical side", () => {
  const expected = resolveEyeClosure(faceWithAperture(0.085), "left", 960, 720, 0.75);
  for (const [width, height] of [[480, 640], [1920, 1080], [720, 1280]]) {
    for (const eye of ["left", "right"] as const) {
      const tilted = faceWithAperture(0.085, eye, width, height, 0.7, 0.5);
      expect(resolveEyeClosure(tilted, eye, width, height, 0.75)).toBeCloseTo(expected, 12);
    }
  }
});

test("closure changes continuously and monotonically with lid separation", () => {
  let previous = 1;
  for (let i = 0; i <= 200; i++) {
    const current = resolveEyeClosure(faceWithAperture(i / 1000), "left", 960, 720, 0.8);
    expect(current).toBeGreaterThanOrEqual(0);
    expect(current).toBeLessThanOrEqual(previous + 1e-12);
    expect(previous - current).toBeLessThan(0.065);
    previous = current;
  }
});

test("sideways landmark drift does not reopen a closed lid", () => {
  const face = faceWithAperture(0.02);
  face[374].x += 0.03;
  expect(resolveEyeClosure(face, "left", 960, 720, 0.9)).toBe(1);
});

test("invalid or absent tracking returns a finite neutral pose", () => {
  expect(resolveEyeClosure([], "left", 960, 720, 1)).toBe(0);
  const face = faceWithAperture(0.1);
  expect(resolveEyeClosure(face, "left", 0, 720, 1)).toBe(0);
  expect(resolveEyeClosure(face, "left", Infinity, 720, 1)).toBe(0);
  expect(Number.isFinite(resolveEyeClosure(face, "left", 960, 720, NaN))).toBe(true);
  face[386].z = NaN;
  expect(resolveEyeClosure(face, "left", 960, 720, 1)).toBe(0);
  const collapsed = faceWithAperture(0.1);
  collapsed[263] = { ...collapsed[362] };
  expect(resolveEyeClosure(collapsed, "left", 960, 720, 1)).toBe(0);
});
