import { expect, test } from "@playwright/test";
import { createLashGeometry, deformLashGeometry, LASH_GROOMS, neutralEyelid, sampleLid } from "../../lib/ar/lash-geometry";
import { createLashSilhouette } from "../../lib/ar/lash-silhouette";
import type { LashStyleId } from "../../lib/ar/types";

test("the collection preserves visibly different length maps, density and cluster shapes", () => {
  const profiles = Object.fromEntries((Object.keys(LASH_GROOMS) as LashStyleId[]).map((style) => {
    const groom = createLashGeometry(style);
    const tips = groom.fibers.map((fiber) => {
      let x = 0; let y = 0;
      for (let v = fiber.vertexStart + fiber.vertexCount - 4; v < fiber.vertexStart + fiber.vertexCount; v++) {
        x += groom.restPositions[v * 3] / 4;
        y += groom.restPositions[v * 3 + 1] / 4;
      }
      return { root: fiber.root, x, y };
    });
    const height = (low: number, high: number) => {
      const region = tips.filter((tip) => tip.root > low && tip.root < high);
      return region.reduce((sum, tip) => sum + tip.y, 0) / region.length;
    };
    const widths: number[] = [];
    const size = LASH_GROOMS[style].fibersPerFan;
    for (let i = 0; i < tips.length; i += size) {
      // Include attachment positions: genuinely converging tips must stay close
      // after the root spread, not merely share a local-space direction.
      const group = tips.slice(i, i + size).map((tip) => tip.root + tip.x);
      widths.push(Math.max(...group) - Math.min(...group));
    }
    const profile = { count: tips.length, mean: height(0, 1), inner: height(0.15, 0.35), centre: height(0.4, 0.6), outer: height(0.72, 0.92), clusterWidth: widths.reduce((a, b) => a + b, 0) / widths.length };
    groom.geometry.dispose();
    return [style, profile];
  }));
  expect(profiles["russian-volume"].count).toBeGreaterThan(profiles["natural-classic"].count * 2);
  expect(profiles["natural-classic"].mean).toBeLessThan(profiles["russian-volume"].mean * 0.7);
  expect(profiles["eyeliner-effect"].outer).toBeGreaterThan(profiles["eyeliner-effect"].inner * 2.5);
  expect(profiles["doll-eye"].centre).toBeGreaterThan(profiles["doll-eye"].outer * 2);
  expect(profiles["wet-look"].clusterWidth).toBeLessThan(profiles["wispy-hybrid"].clusterWidth * 0.2);
});

for (const style of Object.keys(LASH_GROOMS) as LashStyleId[]) {
  test(`${style} stays lifted under downward head pitch and keeps subpixel strand coverage`, () => {
    const groom = createLashGeometry(style);
    const pitch = Math.PI / 6;
    const lid = neutralEyelid("left").map(({ x, y, z }) => ({ x: x * 90, y: (y * Math.cos(pitch) - z * Math.sin(pitch)) * 90, z: (y * Math.sin(pitch) + z * Math.cos(pitch)) * 90 }));
    deformLashGeometry(groom, lid, { x: 0, y: -Math.sin(pitch), z: Math.cos(pitch) }, "left", 90, 0);
    const positions = groom.geometry.getAttribute("position");
    for (const fiber of groom.fibers.filter((fiber) => fiber.root > 0.3 && fiber.root < 0.7)) {
      const root = sampleLid(lid, fiber.root);
      let tipY = 0;
      for (let i = fiber.vertexStart + fiber.vertexCount - 4; i < fiber.vertexStart + fiber.vertexCount; i++) tipY += positions.getY(i) / 4;
      // Regression: old fibres became an end-on dotted lid outline at this pitch.
      // Eyeliner intentionally starts shorter before its long outer wing.
      expect(tipY - root.y).toBeGreaterThan(90 * (style === "eyeliner-effect" ? 0.045 : 0.075));
    }
    const silhouette = createLashSilhouette(groom);
    silhouette.update();
    const ribbon = silhouette.geometry.getAttribute("position");
    const coverage = silhouette.geometry.getAttribute("strandCoverage");
    expect(Array.from(ribbon.array).every(Number.isFinite)).toBe(true);
    expect(Array.from(coverage.array).every((value) => value > 0 && value <= 1)).toBe(true);
    // Every segment keeps a rasterizable cross-section, with alpha carrying its
    // true thickness instead of widening tiny tips into opaque blunt hairs.
    for (let i = 0; i < ribbon.count; i += 2) {
      expect(Math.hypot(ribbon.getX(i) - ribbon.getX(i + 1), ribbon.getY(i) - ribbon.getY(i + 1))).toBeGreaterThan(0.959);
    }
    expect(coverage.getX(18)).toBeLessThan(coverage.getX(0) * 0.05);
    silhouette.dispose(); groom.geometry.dispose();
  });
}
