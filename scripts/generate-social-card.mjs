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
const photo = await dataUrl("assets/portraits/paola-seated-cutout.png", "image/png");
const logo = await dataUrl("public/assets/paolash-paper-logo.png", "image/png");
const outputPath = path.join(root, "public/paolash-social-portraits.png");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Manrope; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 200 800; }
    * { box-sizing: border-box; } body { margin: 0; width: 1200px; height: 630px; background: #420c19; color: #f6eadb; font-family: Manrope,sans-serif; }
    main { position: relative; width: 100%; height: 100%; padding: 48px 64px; }
    .logo { width: 142px; height: 95px; object-fit: contain; }
    .portrait { position: absolute; right: 30px; bottom: 18px; width: 400px; height: 600px; object-fit: contain; }
    h1 { position: absolute; left: 64px; top: 226px; margin: 0; font-size: 68px; font-weight: 500; letter-spacing: -3.6px; line-height: 1.12; }
    h1 span { display: block; color: #e6cf9c; }
    .description { position: absolute; left: 68px; top: 407px; margin: 0; font-size: 20px; color: #ccb9b8; }
    .location { position: absolute; left: 68px; bottom: 50px; margin: 0; font-size: 13px; letter-spacing: 2px; color: #e6cf9c; }
  </style></head><body><main>
    <img class="logo" src="${logo}" alt="PaoLash" />
    <h1>Lash artistry.<span>Made personal.</span></h1>
    <p class="description">Bespoke lashes. Professional education.</p>
    <p class="location">DUBLIN · LOUNGE &amp; ACADEMY</p>
    <img class="portrait" src="${photo}" alt="Paola Gutierrez" />
  </main></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await page.screenshot({ path: outputPath });
  console.log(`Created ${outputPath}`);
} finally {
  await browser.close();
}
