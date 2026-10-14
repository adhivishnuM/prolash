import { expect, test } from "@playwright/test";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { Scene } from "three";
import { createFaceOccluder } from "../../lib/ar/face-occluder";
import { FACE_TRIANGLE_INDICES, FACE_VERTEX_COUNT } from "../../lib/ar/face-topology";
import type { FacePoint } from "../../lib/ar/types";

const face = (): FacePoint[] => Array.from({ length: 478 }, (_, index) => ({
  x: 0.2 + (index % 20) / 40,
  y: 0.2 + Math.floor(index / 20) / 50,
  z: -0.03 + (index % 7) / 1000,
}));

test("local face triangles match the pinned MediaPipe topology and preserve eye holes", () => {
  const edges = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
  expect(edges).toHaveLength(2556);
  const expectedIndices: number[] = [];
  const edgeUses = new Map<string, number>();
  for (let i = 0; i < edges.length; i += 3) {
    const [a, b, c] = edges.slice(i, i + 3);
    expect([a.end, b.end, c.end]).toEqual([b.start, c.start, a.start]);
    const triangle = [a.start, b.start, c.start];
    expect(new Set(triangle).size).toBe(3);
    expectedIndices.push(...triangle);
    for (const edge of [a, b, c]) {
      const key = [edge.start, edge.end].sort((x, y) => x - y).join(":");
      edgeUses.set(key, (edgeUses.get(key) ?? 0) + 1);
    }
  }
  expect(Array.from(FACE_TRIANGLE_INDICES)).toEqual(expectedIndices);
  expect(Math.max(...FACE_TRIANGLE_INDICES)).toBe(FACE_VERTEX_COUNT - 1);
  expect(Math.min(...FACE_TRIANGLE_INDICES)).toBe(0);
  expect([...edgeUses.values()].every((count) => count <= 2)).toBe(true);
  for (const edge of [...FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, ...FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE]) {
    const key = [edge.start, edge.end].sort((a, b) => a - b).join(":");
    expect(edgeUses.get(key)).toBe(1);
  }
});

test("face depth uses camera coordinates and a small backward bias without writing color", () => {
  const occluder = createFaceOccluder();
  expect(occluder.mesh.visible).toBe(false);
  expect(occluder.mesh.material.colorWrite).toBe(false);
  expect(occluder.mesh.material.depthWrite).toBe(true);
  expect(occluder.mesh.material.depthTest).toBe(true);
  expect(occluder.mesh.renderOrder).toBeLessThan(0);
  const landmarks = face();
  expect(occluder.update(landmarks, 480, 640)).toBe(true);
  const positions = occluder.mesh.geometry.getAttribute("position");
  expect(positions.count).toBe(468);
  expect(occluder.mesh.geometry.getIndex()?.count).toBe(852 * 3);
  for (let i = 0; i < positions.count; i++) {
    const point = landmarks[i];
    expect(positions.getX(i)).toBeCloseTo(point.x * 480, 4);
    expect(positions.getY(i)).toBeCloseTo((1 - point.y) * 640, 4);
    expect(positions.getZ(i)).toBeCloseTo(-point.z * 480 - 0.288, 4);
    expect(positions.getZ(i)).toBeLessThan(-point.z * 480);
  }
  occluder.clear();
  expect(occluder.mesh.visible).toBe(false);
  occluder.dispose();
});

test("invalid coordinates hide the surface and never corrupt a valid uploaded frame", () => {
  const occluder = createFaceOccluder();
  expect(occluder.update(face(), 960, 720)).toBe(true);
  const positions = occluder.mesh.geometry.getAttribute("position");
  const previous = Array.from(positions.array);
  for (const badValue of [NaN, Infinity, 1e40]) {
    const invalid = face();
    invalid[467].z = badValue;
    expect(occluder.update(invalid, 960, 720)).toBe(false);
    expect(occluder.mesh.visible).toBe(false);
    expect(Array.from(positions.array)).toEqual(previous);
    expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
  }
  expect(occluder.update([], 960, 720)).toBe(false);
  expect(occluder.update(face(), 0, 720)).toBe(false);
  expect(occluder.update(face(), 960, Infinity)).toBe(false);
  expect(occluder.update(face(), 960, 720)).toBe(true);
  expect(occluder.mesh.visible).toBe(true);
  occluder.dispose();
});

test("dispose frees each resource once, detaches the mesh and prevents later updates", () => {
  const occluder = createFaceOccluder();
  const scene = new Scene();
  scene.add(occluder.mesh);
  let geometryDisposals = 0;
  let materialDisposals = 0;
  occluder.mesh.geometry.addEventListener("dispose", () => geometryDisposals++);
  occluder.mesh.material.addEventListener("dispose", () => materialDisposals++);
  occluder.dispose();
  occluder.dispose();
  expect(geometryDisposals).toBe(1);
  expect(materialDisposals).toBe(1);
  expect(occluder.mesh.parent).toBeNull();
  expect(occluder.update(face(), 960, 720)).toBe(false);
  expect(occluder.mesh.visible).toBe(false);
});
