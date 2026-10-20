import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const dataUrl = async (file, type) => `data:${type};base64,${(await readFile(path.join(root, file))).toString("base64")}`;
// Render the layout with the site's real font, not AI-rendered lettering or faces.
const chunks = path.join(root, ".next/static/chunks");
let fontPath;
for (const file of await readdir(chunks)) {
  if (!file.endsWith(".css")) continue;
  const css = await readFile(path.join(chunks, file), "utf8");
  for (const [face] of css.matchAll(/@font-face\{[^}]+\}/g)) {
    if (face.includes("font-family:Manrope;") && face.includes("U+??,")) {
      fontPath = path.resolve(chunks, face.match(/url\(([^)]+)\)/)[1]);
    }
  }
}
if (!fontPath) throw new Error("Build the site first so the Manrope font is available.");
const font = (await readFile(fontPath)).toString("base64");
// Original studio photograph: crop in the layout, with no generated cutout,
// texture edits, colour grading or upscaling of the source file.
const photo = await dataUrl("assets/portraits/paola-seated.jpeg", "image/jpeg");
const logo = await dataUrl("public/assets/paolash-paper-logo.png", "image/png");
const outputPath = path.join(root, "public/paolash-social-white.png");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Manrope; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 200 800; }
    * { box-sizing: border-box; } body { margin: 0; width: 1200px; height: 630px; background: #fff; color: #481c26; font-family: Manrope,sans-serif; }
    main { position: relative; width: 100%; height: 100%; overflow: hidden; }
    .photograph { position: absolute; inset: 0 0 0 auto; width: 560px; overflow: hidden; mask-image: linear-gradient(to right,transparent 0%,#000 23%); }
    .portrait { position: absolute; left: -120px; top: -16px; width: 780px; height: 1170px; max-width: none; }
    .logo { position: absolute; z-index: 1; left: 62px; top: 42px; width: 148px; height: 99px; object-fit: contain; }
    h1 { position: absolute; z-index: 1; left: 68px; top: 220px; margin: 0; font-size: 88px; font-weight: 500; letter-spacing: -4.8px; line-height: 1.08; }
    h1 span { display: block; color: #a9695c; }
    .description { position: absolute; left: 72px; top: 442px; margin: 0; font-size: 23px; font-weight: 400; color: #776367; }
    .location { position: absolute; left: 72px; bottom: 49px; margin: 0; font-size: 16px; color: #7d1f2d; }
  </style></head><body><main>
    <div class="photograph"><img class="portrait" src="${photo}" alt="Original studio photograph of Paola Gutierrez" /></div>
    <img class="logo" src="${logo}" alt="PaoLash" />
    <h1>Entirely<span>you.</span></h1>
    <p class="description">Lash artistry &amp; academy</p>
    <p class="location">Dublin, Ireland</p>
  </main></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await page.screenshot({ path: outputPath });
  console.log(`Created ${outputPath}`);
} finally {
  await browser.close();
}
