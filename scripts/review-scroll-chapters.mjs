import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, rename } from "node:fs/promises";

const origin = process.env.PREVIEW_URL || "http://127.0.0.1:5174";
await mkdir("outputs/chapters", { recursive: true });
const browser = await chromium.launch();
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, recordVideo: { dir: "outputs/chapters", size: { width, height: 900 } } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.waitForTimeout(1900);
    assert.ok(await page.locator(".site").evaluate(el => el.classList.contains("motion-chapters")));
    assert.equal(await page.locator(".ambient-waves, .wave").count(), 0);
    const chapters = ["#top", "#services", "#story", "#recognition", ".ritual", "#academy", ".trainer-credential", ".studio-notes", "#visit"];
    for (const [index, selector] of chapters.entries()) {
      await page.locator(selector).evaluate(el => window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - 120), behavior: "smooth" }));
      await page.waitForTimeout(2100);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow in ${selector}`);
      await page.screenshot({ path: `outputs/chapters/${width}-${index}.png` });
    }
    // Actual pointer gesture, open details, return to deck, then visit artist.
    await page.locator("[data-motion='collection-deck']").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const card = page.locator('button[aria-current="true"]');
    const before = await card.getAttribute("aria-label");
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * .7, box.y + box.height * .55);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .2, box.y + box.height * .55, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
    assert.notEqual(await card.getAttribute("aria-label"), before, "Swipe should change active treatment");
    await card.click();
    await page.getByRole("button", { name: "Choose another finish" }).click();
    await page.locator("#story").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    assert.deepEqual(errors, []);
    const video = page.video();
    await context.close();
    await rename(await video.path(), `outputs/chapters/scroll-${width}.webm`);
    console.log(`PASS ${width}: all chapters, no background ribbons, swipe and treatment navigation; walkthrough recorded.`);
  }
} finally { await browser.close(); }
