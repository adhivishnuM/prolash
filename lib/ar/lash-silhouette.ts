import { BufferAttribute, BufferGeometry, Color, DoubleSide, DynamicDrawUsage, ShaderMaterial } from "three";
import type { LashGroom } from "./lash-geometry";

/**
 * Rasterize the groom's 3D centrelines as camera-facing, analytically feathered
 * fibres. Subpixel tube triangles flicker into dots; minimum-width coverage
 * preserves each strand's apparent mass without turning it into thick wire.
 * This is a render representation of the same 3D groom, not a flat lash sticker.
 */
export function createLashSilhouette(groom: LashGroom) {
  const sides = 4;
  const rings = groom.fibers[0].vertexCount / sides;
  const vertices = groom.fibers.length * rings * 2;
  const positions = new Float32Array(vertices * 3);
  const across = new Float32Array(vertices);
  const coverage = new Float32Array(vertices);
  const indices = new Uint16Array(groom.fibers.length * (rings - 1) * 6);
  const centres = new Float32Array(rings * 3);
  const radii = new Float32Array(rings);
  let index = 0;
  for (let f = 0; f < groom.fibers.length; f++) {
    for (let r = 0; r < rings; r++) {
      const vertex = (f * rings + r) * 2;
      across[vertex] = -1; across[vertex + 1] = 1;
      if (r < rings - 1) {
        indices.set([vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2], index);
        index += 6;
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3).setUsage(DynamicDrawUsage));
  geometry.setAttribute("strandAcross", new BufferAttribute(across, 1));
  geometry.setAttribute("strandCoverage", new BufferAttribute(coverage, 1).setUsage(DynamicDrawUsage));
  geometry.setIndex(new BufferAttribute(indices, 1));

  function update() {
    const tubes = groom.geometry.getAttribute("position").array;
    for (let f = 0; f < groom.fibers.length; f++) {
      const fiber = groom.fibers[f];
      centres.fill(0);
      for (let ring = 0; ring < rings; ring++) {
        const centre = ring * 3;
        const start = (fiber.vertexStart + ring * sides) * 3;
        for (let side = 0; side < sides; side++) {
          for (let axis = 0; axis < 3; axis++) centres[centre + axis] += tubes[start + side * 3 + axis] / sides;
        }
        radii[ring] = Math.hypot(tubes[start] - centres[centre], tubes[start + 1] - centres[centre + 1], tubes[start + 2] - centres[centre + 2]);
      }
      for (let ring = 0; ring < rings; ring++) {
        const centre = ring * 3;
        const before = Math.max(0, ring - 1) * 3;
        const after = Math.min(rings - 1, ring + 1) * 3;
        const dx = centres[after] - centres[before];
        const dy = centres[after + 1] - centres[before + 1];
        const length = Math.hypot(dx, dy);
        const halfWidth = Math.max(0.48, radii[ring]);
        const nx = length > 0.0001 ? -dy / length : 1;
        const ny = length > 0.0001 ? dx / length : 0;
        const vertex = (f * rings + ring) * 2;
        for (let side = 0; side < 2; side++) {
          const target = (vertex + side) * 3;
          const offset = (side === 0 ? -1 : 1) * halfWidth;
          positions[target] = centres[centre] + nx * offset;
          positions[target + 1] = centres[centre + 1] + ny * offset;
          positions[target + 2] = centres[centre + 2];
          coverage[vertex + side] = Math.min(1, radii[ring] / halfWidth * 1.45);
        }
      }
    }
    geometry.getAttribute("position").needsUpdate = true;
    geometry.getAttribute("strandCoverage").needsUpdate = true;
  }
  return { geometry, update, dispose: () => geometry.dispose() };
}

export function createLashMaterial() {
  return new ShaderMaterial({
    uniforms: { strandColor: { value: new Color(0x100b09) }, definition: { value: 1.3 } },
    vertexShader: `
      attribute float strandAcross;
      attribute float strandCoverage;
      varying float vAcross;
      varying float vCoverage;
      void main() {
        vAcross = strandAcross;
        vCoverage = strandCoverage;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 strandColor;
      uniform float definition;
      varying float vAcross;
      varying float vCoverage;
      void main() {
        float feather = 1.0 - smoothstep(0.45, 1.0, abs(vAcross));
        float alpha = 1.0 - pow(max(0.0, 1.0 - feather * vCoverage), definition);
        gl_FragColor = vec4(strandColor, alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true, depthWrite: false, depthTest: true, side: DoubleSide, toneMapped: false,
  });
}
