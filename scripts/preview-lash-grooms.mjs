/** Local visual review; never opens a camera or uploads the supplied reference. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const option = (name, fallback) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const source = resolve(option("image", "public/assets/hero.webp"));
const output = resolve(option("output", "test-results/lash-grooms"));
const crop = option("crop", "250,140,500,660").split(",").map(Number);
const origin = option("origin", "http://127.0.0.1:5173");
await mkdir(output, { recursive: true });
const bundle = await build({
  stdin: { contents: `
    import { createFaceTracker } from './lib/ar/face-tracker';
    import { createLashRenderer } from './lib/ar/lash-renderer';
    import { LASH_GROOMS } from './lib/ar/lash-geometry';
    window.lashReview = { createFaceTracker, createLashRenderer, styles: Object.keys(LASH_GROOMS) };
  `, resolveDir: process.cwd(), loader: "ts" },
  bundle: true, write: false, format: "iife", platform: "browser",
});
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`${origin}/__lash-lab`, (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><body style="margin:0;background:#eee8e1"><canvas id="source" style="display:none"></canvas><canvas id="overlay" style="display:none"></canvas><canvas id="result"></canvas></body></html>` }));
  const reference = await readFile(source);
  await page.route(`${origin}/__lash-fixture`, (route) => route.fulfill({ body: reference }));
  await page.goto(`${origin}/__lash-lab`);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const measurements = await page.evaluate(async ({ crop }) => {
    const source = document.querySelector("#source");
    const overlay = document.querySelector("#overlay");
    const result = document.querySelector("#result");
    const width = 960;
    const height = Math.round(width * crop[3] / crop[2]);
    source.width = width; source.height = height;
    const image = new Image(); image.src = "/__lash-fixture"; await image.decode();
    source.getContext("2d").drawImage(image, ...crop, 0, 0, width, height);
    const tracker = await window.lashReview.createFaceTracker({});
    let face;
    for (let i = 0; i < 5; i++) face = await tracker.detect(await createImageBitmap(source), performance.now());
    tracker.dispose();
    if (!face) throw new Error("No face detected in reference crop.");
    const renderer = window.lashReview.createLashRenderer(overlay);
    window.reviewState = { source, overlay, result, face, renderer, width, height };
    const eye = (indices) => indices.map((i) => face.landmarks[i]);
    const xs = eye([33,263]).map((p) => p.x * width);
    const ys = eye([159,386]).map((p) => p.y * height);
    const eyeRegion = [Math.min(...xs) - 30, Math.min(...ys) - 65, Math.abs(xs[1] - xs[0]) + 60, 155];
    return { blink: face.blink, eyeRegion, left: eye([362,263,386,374]), right: eye([133,33,159,145]), pose: eye([33,263,10,152]) };
  }, { crop });
  const styles = await page.evaluate(() => window.lashReview.styles);
  for (const style of ["original", ...styles]) {
    await page.evaluate(({ style, eyeRegion }) => {
      const { source, overlay, result, face, renderer, width, height } = window.reviewState;
      const composite = document.createElement("canvas");
      composite.width = width; composite.height = height;
      const ctx = composite.getContext("2d");
      ctx.drawImage(source, 0, 0);
      if (style !== "original") { renderer.setStyle(style); renderer.render(face, width, height); ctx.drawImage(overlay, 0, 0, width, height); }
      result.width = 1100; result.height = 700;
      const out = result.getContext("2d");
      out.fillStyle = "#eee8e1"; out.fillRect(0, 0, 1100, 700);
      out.fillStyle = "#351017"; out.font = "22px sans-serif";
      out.fillText(style, 30, 42);
      out.drawImage(composite, 30, 70, 520, 520 * height / width);
      out.drawImage(composite, ...eyeRegion, 580, 80, 490, 490 * eyeRegion[3] / eyeRegion[2]);
      out.font = "14px sans-serif"; out.fillText("Eye detail · reference fixture, not live-device validation", 580, 66);
      if (style !== "original") {
        const scale = overlay.width / width;
        out.fillStyle = "#ffffff"; out.fillRect(580, 340, 490, 250);
        out.drawImage(overlay, ...eyeRegion.map((v) => v * scale), 580, 350, 490, 490 * eyeRegion[3] / eyeRegion[2]);
        out.fillStyle = "#351017"; out.fillText("Isolated 3D fibres · same scale", 580, 326);
      }
    }, { style, eyeRegion: measurements.eyeRegion });
    await page.locator("#result").screenshot({ path: `${output}/${style}.png` });
  }
  // Same tracked face, scale and definition in every cell. This makes shape
  // comparisons reviewable without relying on UI names or different photographs.
  await page.evaluate(({ styles, eyeRegion }) => {
    const { source, overlay, result, face, renderer, width, height } = window.reviewState;
    const eyeHeight = 545 * eyeRegion[3] / eyeRegion[2];
    const cellHeight = Math.ceil(eyeHeight * 2 + 65);
    result.width = 1200; result.height = 85 + Math.ceil(styles.length / 2) * cellHeight;
    const out = result.getContext("2d");
    out.fillStyle = "#eee8e1"; out.fillRect(0, 0, result.width, result.height);
    out.fillStyle = "#351017"; out.font = "24px sans-serif";
    out.fillText("Six lash shapes · same face, scale and definition", 30, 40);
    const composite = document.createElement("canvas");
    composite.width = width; composite.height = height;
    const ctx = composite.getContext("2d");
    styles.forEach((style, i) => {
      renderer.setStyle(style); renderer.render(face, width, height);
      ctx.drawImage(source, 0, 0); ctx.drawImage(overlay, 0, 0, width, height);
      const x = 30 + i % 2 * 590;
      const y = 85 + Math.floor(i / 2) * cellHeight;
      out.fillStyle = "#351017"; out.font = "18px sans-serif";
      out.fillText(style, x, y);
      out.drawImage(composite, ...eyeRegion, x, y + 15, 545, eyeHeight);
      const scale = overlay.width / width;
      out.fillStyle = "#fff"; out.fillRect(x, y + 25 + eyeHeight, 545, eyeHeight);
      out.drawImage(overlay, ...eyeRegion.map((v) => v * scale), x, y + 25 + eyeHeight, 545, eyeHeight);
    });
  }, { styles, eyeRegion: measurements.eyeRegion });
  await page.locator("#result").screenshot({ path: `${output}/comparison.png` });
  await writeFile(`${output}/measurements.json`, JSON.stringify(measurements, null, 2));
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`Rendered ${styles.length + 1} local review boards and a comparison in ${output}`);
  console.log(JSON.stringify(measurements));
} finally { await browser.close(); }
