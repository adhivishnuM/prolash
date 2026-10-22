import test from "node:test";
import assert from "node:assert/strict";
import { carouselDepth } from "../lib/carousel-depth.ts";

test("depth is continuous, centered and symmetric across the infinite seam", () => {
  assert.equal(carouselDepth(0, 0, 8), 0);
  assert.equal(carouselDepth(1/8, 0, 8), 1);
  assert.equal(carouselDepth(7/8, 0, 8), 1);
  assert.equal(carouselDepth(0, 1, 8), 0);
  assert.equal(carouselDepth(0, 1/16, 8), .5);
  assert.equal(carouselDepth(1/8, 1/16, 8), .5);
  assert.ok(Math.abs(carouselDepth(0, -.01, 8) - .08) < 1e-9);
});
