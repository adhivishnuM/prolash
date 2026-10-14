import { BufferAttribute, BufferGeometry, DynamicDrawUsage } from "three";
import type { LashStyleId } from "./types";

/** Editable procedural groom. Units are relative to each eye's corner-to-corner width. */
export const LASH_ASSET_VERSION = "1.3.0-prototype";

interface GroomProfile {
  groups: number;
  fibersPerFan: number;
  radius: number;
  seed: number;
  /** Length map from the inner corner to the outer corner, at equal intervals. */
  lengths: readonly number[];
  startAngle: number;
  curl: number;
  fanWidth: number;
  rootSpread: number;
  sweep: number;
  radial: number;
  spikeEvery: number;
  spikeLength: number;
  underlayer: number;
  lengthVariation: number;
  clustered: boolean;
}

// Each look has its own silhouette, not just a different thickness/seed. All
// dimensions use eye width, so changing faces preserves the style's proportions.
export const LASH_GROOMS = {
  "wispy-hybrid": {
    groups: 28, fibersPerFan: 4, radius: 0.0037, seed: 41,
    lengths: [0.075, 0.16, 0.21, 0.24, 0.25, 0.235, 0.13],
    startAngle: 0.78, curl: 1.12, fanWidth: 0.082, rootSpread: 0.023,
    sweep: 0.04, radial: 0, spikeEvery: 4, spikeLength: 0.145,
    underlayer: 0.72, lengthVariation: 0.16, clustered: false,
  },
  "russian-volume": {
    groups: 32, fibersPerFan: 6, radius: 0.0031, seed: 67,
    lengths: [0.10, 0.245, 0.34, 0.39, 0.40, 0.355, 0.17],
    startAngle: 0.76, curl: 1.32, fanWidth: 0.115, rootSpread: 0.017,
    sweep: 0.025, radial: 0.045, spikeEvery: 0, spikeLength: 0,
    underlayer: 0.78, lengthVariation: 0.16, clustered: false,
  },
  "eyeliner-effect": {
    groups: 30, fibersPerFan: 4, radius: 0.0039, seed: 89,
    lengths: [0.055, 0.085, 0.125, 0.19, 0.285, 0.405, 0.31],
    startAngle: 0.76, curl: 0.82, fanWidth: 0.055, rootSpread: 0.018,
    sweep: 0.22, radial: 0, spikeEvery: 0, spikeLength: 0,
    underlayer: 0.84, lengthVariation: 0.12, clustered: false,
  },
  "natural-classic": {
    groups: 36, fibersPerFan: 2, radius: 0.0029, seed: 103,
    lengths: [0.07, 0.135, 0.19, 0.225, 0.22, 0.185, 0.10],
    startAngle: 0.84, curl: 0.82, fanWidth: 0.032, rootSpread: 0.012,
    sweep: 0.025, radial: 0.018, spikeEvery: 0, spikeLength: 0,
    underlayer: 1, lengthVariation: 0.18, clustered: false,
  },
  "doll-eye": {
    groups: 28, fibersPerFan: 4, radius: 0.0036, seed: 127,
    lengths: [0.075, 0.15, 0.30, 0.47, 0.30, 0.15, 0.08],
    startAngle: 0.91, curl: 1.28, fanWidth: 0.075, rootSpread: 0.020,
    sweep: 0, radial: 0.11, spikeEvery: 0, spikeLength: 0,
    underlayer: 0.85, lengthVariation: 0.12, clustered: false,
  },
  "wet-look": {
    groups: 20, fibersPerFan: 4, radius: 0.0035, seed: 151,
    lengths: [0.085, 0.195, 0.28, 0.345, 0.345, 0.285, 0.17],
    startAngle: 0.80, curl: 1.08, fanWidth: 0.006, rootSpread: 0.018,
    sweep: 0.065, radial: 0.025, spikeEvery: 3, spikeLength: 0.06,
    underlayer: 1, lengthVariation: 0.025, clustered: true,
  },
} as const satisfies Record<LashStyleId, GroomProfile>;

const SEGMENTS = 9;
const SIDES = 4;
const STRAND_VERTICES = (SEGMENTS + 1) * SIDES;
const TAU = Math.PI * 2;

export interface Point3 { x: number; y: number; z: number }
export interface LashFiber { root: number; vertexStart: number; vertexCount: number }
export interface LashGroom {
  geometry: BufferGeometry;
  restPositions: Float32Array;
  restNormals: Float32Array;
  fibers: LashFiber[];
  triangleCount: number;
}

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function mappedLength(lengths: readonly number[], root: number) {
  const position = clamp(root, 0, 1) * (lengths.length - 1);
  const index = Math.min(lengths.length - 2, Math.floor(position));
  const t = position - index;
  const blend = t * t * (3 - 2 * t);
  return lengths[index] + (lengths[index + 1] - lengths[index]) * blend;
}

function unit(x: number, y: number, z: number): Point3 {
  const length = Math.hypot(x, y, z) || 1;
  return { x: x / length, y: y / length, z: z / length };
}

function cross(a: Point3, b: Point3): Point3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

/** Catmull-Rom interpolation preserves every supplied eyelid landmark. */
export function sampleLid(points: readonly Point3[], amount: number): Point3 {
  if (points.length < 2) throw new Error("An eyelid curve requires at least two points.");
  const index = clamp(amount, 0, 1) * (points.length - 1);
  const base = Math.min(points.length - 2, Math.floor(index));
  const t = index - base;
  const t2 = t * t;
  const t3 = t2 * t;
  const p0 = points[Math.max(0, base - 1)];
  const p1 = points[base];
  const p2 = points[base + 1];
  const p3 = points[Math.min(points.length - 1, base + 2)];
  const result = { x: 0, y: 0, z: 0 };
  for (const axis of ["x", "y", "z"] as const) {
    result[axis] = 0.5 * ((2 * p1[axis]) + (-p0[axis] + p2[axis]) * t
      + (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2
      + (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3);
  }
  return result;
}

/** Creates actual tapered four-sided tubes; there are no texture cards or strip bands. */
export function createLashGeometry(styleId: LashStyleId): LashGroom {
  const config = LASH_GROOMS[styleId];
  const rng = random(config.seed);
  const strandCount = config.groups * config.fibersPerFan;
  const positions = new Float32Array(strandCount * STRAND_VERTICES * 3);
  const normals = new Float32Array(positions.length);
  const indices = new Uint16Array(strandCount * SEGMENTS * SIDES * 6);
  const fibers: LashFiber[] = [];
  let vertex = 0;
  let index = 0;

  for (let group = 0; group < config.groups; group++) {
    // Inner roots stay delicate. Outer roots stop just inside the corner.
    const root = 0.045 + ((group + 0.35 * (rng() - 0.5)) / (config.groups - 1)) * 0.9;
    const spike = config.spikeEvery > 0 && group % config.spikeEvery === 2 && root > 0.12 && root < 0.91;
    const length = mappedLength(config.lengths, root) + (spike ? config.spikeLength : 0);
    // Wispy accents stay narrow above the softer, broad underlayer. Wet clusters
    // converge to a shared tip instead of opening into a volume fan.
    const fanWidth = spike && !config.clustered ? config.fanWidth * 0.28 : config.fanWidth;
    const startAngle = config.startAngle;

    for (let strand = 0; strand < config.fibersPerFan; strand++) {
      const spread = config.fibersPerFan > 1 ? strand / (config.fibersPerFan - 1) - 0.5 : 0;
      // A short underlayer fills the lash line; longer tips keep each finish airy.
      const underlayer = strand === 0 && !spike ? config.underlayer : 1;
      const strandLength = length * (0.97 + (rng() - 0.5) * config.lengthVariation)
        * (1 - Math.abs(spread) * (config.clustered ? 0.015 : 0.10)) * underlayer;
      const strandCurl = config.curl + (rng() - 0.5) * (config.clustered ? 0.025 : 0.14);
      // A sweep away from the nose; cat-eye gets an increasingly pronounced outer direction.
      const sweep = config.sweep * root * root + config.radial * (root - 0.5)
        + spread * (fanWidth - (config.clustered ? config.rootSpread : 0));
      const depthVariation = (rng() - 0.5) * 0.015;
      const radius = config.radius * (0.88 + rng() * 0.2);
      const start = vertex;
      fibers.push({ root: clamp(root + spread * config.rootSpread + (rng() - 0.5) * (config.clustered ? 0.001 : 0.004), 0.025, 0.97), vertexStart: start, vertexCount: STRAND_VERTICES });

      for (let segment = 0; segment <= SEGMENTS; segment++) {
        const t = segment / SEGMENTS;
        const angle = startAngle + t * strandCurl;
        const arcRadius = strandLength / strandCurl;
        const cx = sweep * Math.pow(t, 1.35);
        const cy = arcRadius * (Math.cos(startAngle) - Math.cos(angle));
        const cz = arcRadius * (Math.sin(angle) - Math.sin(startAngle)) + depthVariation * t;
        const tangent = unit(sweep * 1.35 * Math.pow(Math.max(t, 0.001), 0.35),
          strandLength * Math.sin(angle), strandLength * Math.cos(angle) + depthVariation);
        const ringY = unit(0, tangent.z, -tangent.y);
        const ringX = cross(ringY, tangent);
        // A nonzero microscopic tip avoids singular normals while remaining visually tapered.
        const thickness = radius * (0.012 + 0.988 * Math.pow(1 - t, 0.58));
        for (let side = 0; side < SIDES; side++) {
          const theta = side / SIDES * TAU;
          const nx = ringX.x * Math.cos(theta) + ringY.x * Math.sin(theta);
          const ny = ringX.y * Math.cos(theta) + ringY.y * Math.sin(theta);
          const nz = ringX.z * Math.cos(theta) + ringY.z * Math.sin(theta);
          positions[vertex * 3] = cx + nx * thickness;
          positions[vertex * 3 + 1] = cy + ny * thickness;
          positions[vertex * 3 + 2] = cz + nz * thickness;
          normals[vertex * 3] = nx;
          normals[vertex * 3 + 1] = ny;
          normals[vertex * 3 + 2] = nz;
          vertex++;
        }
      }

      for (let segment = 0; segment < SEGMENTS; segment++) {
        for (let side = 0; side < SIDES; side++) {
          const a = start + segment * SIDES + side;
          const b = start + segment * SIDES + (side + 1) % SIDES;
          const c = a + SIDES;
          const d = b + SIDES;
          indices[index++] = a; indices[index++] = b; indices[index++] = c;
          indices[index++] = b; indices[index++] = d; indices[index++] = c;
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions.slice(), 3).setUsage(DynamicDrawUsage));
  geometry.setAttribute("normal", new BufferAttribute(normals.slice(), 3).setUsage(DynamicDrawUsage));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.name = `${styleId}-individual-fibres`;
  geometry.userData = { styleId, assetVersion: LASH_ASSET_VERSION, approvalStatus: "prototype", strandCount };
  return { geometry, restPositions: positions, restNormals: normals, fibers, triangleCount: indices.length / 3 };
}

/**
 * Fits roots to the tracked lid and rotates each fibre through a blink without shrinking it.
 * normal points out of the face; points run from the inner to the outer eye corner.
 * Wearer's left eye runs toward image-right in an unmirrored camera frame.
 */
export function deformLashGeometry(
  groom: LashGroom, points: readonly Point3[], faceNormal: Point3,
  eye: "left" | "right", eyeWidth: number, blink: number,
) {
  // The right-eye basis is a reflection. Reverse topology once to preserve outward faces.
  const hand = eye === "left" ? 1 : -1;
  if ((groom.geometry.userData.deformationHand ?? 1) !== hand) {
    const index = groom.geometry.getIndex()!;
    for (let i = 0; i < index.count; i += 3) {
      const second = index.getX(i + 1);
      index.setX(i + 1, index.getX(i + 2));
      index.setX(i + 2, second);
    }
    index.needsUpdate = true;
  }
  groom.geometry.userData.deformationHand = hand;
  const positions = groom.geometry.getAttribute("position") as BufferAttribute;
  const normals = groom.geometry.getAttribute("normal") as BufferAttribute;
  const positionArray = positions.array as Float32Array;
  const normalArray = normals.array as Float32Array;
  const rotation = clamp(blink, 0, 1) * 1.4;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  for (const fiber of groom.fibers) {
    const root = sampleLid(points, fiber.root);
    const before = sampleLid(points, fiber.root - 0.008);
    const after = sampleLid(points, fiber.root + 0.008);
    const tangent = unit(after.x - before.x, after.y - before.y, after.z - before.z);
    // Gram-Schmidt keeps fibre length stable even when lid tangent has a depth component.
    const dot = tangent.x * faceNormal.x + tangent.y * faceNormal.y + tangent.z * faceNormal.z;
    const forward = unit(faceNormal.x - tangent.x * dot, faceNormal.y - tangent.y * dot, faceNormal.z - tangent.z * dot);
    const upCross = cross(forward, tangent);
    const up = { x: upCross.x * hand, y: upCross.y * hand, z: upCross.z * hand };

    for (let v = fiber.vertexStart; v < fiber.vertexStart + fiber.vertexCount; v++) {
      const i = v * 3;
      const localX = groom.restPositions[i];
      const localY = groom.restPositions[i + 1] * cos - groom.restPositions[i + 2] * sin;
      const localZ = groom.restPositions[i + 1] * sin + groom.restPositions[i + 2] * cos;
      positionArray[i] = root.x + eyeWidth * (tangent.x * localX + up.x * localY + forward.x * localZ);
      positionArray[i + 1] = root.y + eyeWidth * (tangent.y * localX + up.y * localY + forward.y * localZ);
      positionArray[i + 2] = root.z + eyeWidth * (tangent.z * localX + up.z * localY + forward.z * localZ);
      const nx = groom.restNormals[i];
      const ny = groom.restNormals[i + 1] * cos - groom.restNormals[i + 2] * sin;
      const nz = groom.restNormals[i + 1] * sin + groom.restNormals[i + 2] * cos;
      normalArray[i] = tangent.x * nx + up.x * ny + forward.x * nz;
      normalArray[i + 1] = tangent.y * nx + up.y * ny + forward.y * nz;
      normalArray[i + 2] = tangent.z * nx + up.z * ny + forward.z * nz;
    }
  }
  positions.needsUpdate = true;
  normals.needsUpdate = true;
}

/** Neutral pair for portable GLB previews. This is an authoring proxy, not measured anatomy. */
export function neutralEyelid(eye: "left" | "right"): Point3[] {
  return Array.from({ length: 9 }, (_, index) => {
    const u = index / 8;
    return { x: (eye === "left" ? 1 : -1) * (0.18 + u), y: 0.13 * Math.sin(u * Math.PI), z: 0.025 * Math.sin(u * Math.PI) };
  });
}
