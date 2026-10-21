import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const origin = process.env.PREVIEW_URL || "http://127.0.0.1:5174";
const browser = await chromium.launch();
await mkdir("outputs/motion", { recursive: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [375, 621, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    for (const selector of ["#top", "#services", "#story", "#recognition", ".ritual", "#academy", ".studio-notes", "#visit"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}: ${selector}`);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `outputs/motion/home-${width}.png` });
  }
  // Confirm actual ribbon movement and identical endpoints of each loop.
  const loops = await page.locator(".wave").evaluateAll(elements => elements.map(element => {
    const animation = element.getAnimations()[0];
    const frames = animation.effect.getKeyframes();
    return { first: frames[0].transform, last: frames.at(-1).transform, state: animation.playState };
  }));
  assert.equal(loops.length, 4);
  loops.forEach(loop => { assert.equal(loop.first, loop.last); assert.equal(loop.state, "running"); });
  for (const route of ["/", "/collection/", "/artist/", "/academy/", "/visit/"]) {
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    assert.match(await page.locator('meta[property="og:image"]').getAttribute("content"), /paolash-social-burgundy-2026.png$/);
    assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute("content"), "summary_large_image");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(200);
  assert.equal(await page.locator(".wave").first().evaluate(element => getComputedStyle(element).animationName), "none");
  assert.equal(await page.locator(".site").evaluate(element => element.classList.contains("motion-enabled")), false);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(200);
  assert.equal(await page.locator(".site").evaluate(element => element.classList.contains("motion-enabled")), true);
  assert.deepEqual(errors, []);
  console.log("PASS: 4 responsive sizes, 8 sections, seamless loops, 5 route previews, live reduced-motion switching, no browser errors.");
} finally { await browser.close(); }
