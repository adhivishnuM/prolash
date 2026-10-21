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
// Use the approved transparent portrait and supplied logo unchanged. All
// typography and decoration are rendered as layout, never generated faces.
const photo = await dataUrl("public/assets/portraits/paola-seated-cutout-v3.webp", "image/webp");
const logo = await dataUrl("public/assets/brand/paolash-logo.png", "image/png");
const outputPath = path.join(root, "public/paolash-social-burgundy-v3.png");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Manrope; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 200 800; }
    * { box-sizing: border-box; } body { margin: 0; width: 1200px; height: 630px; background: #fff; color: #481c26; font-family: Manrope,sans-serif; }
    main { position: relative; width: 100%; height: 100%; overflow: hidden; }
    .portrait { position: absolute; right: 58px; bottom: -190px; width: 455px; height: auto; }
    .logo { position: absolute; left: 54px; top: 32px; width: 180px; height: 120px; object-fit: contain; }
    h1 { position: absolute; left: 72px; top: 194px; margin: 0; font-size: 92px; font-weight: 600; letter-spacing: -5.5px; line-height: 1.03; }
    h1 span { display: block; color: #7d1f2d; font-weight: 400; }
    .description { position: absolute; left: 76px; top: 424px; margin: 0; font-size: 24px; line-height: 1.6; color: #776367; }
    .location { position: absolute; left: 76px; bottom: 49px; margin: 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #7d1f2d; }
    .ribbon { position: absolute; inset: 0; width: 100%; height: 100%; }
  </style></head><body><main>
    <svg class="ribbon" viewBox="0 0 1200 630" fill="none" aria-hidden="true"><defs><linearGradient id="foil"><stop stop-color="#be806c"/><stop offset=".45" stop-color="#f1d4c7"/><stop offset="1" stop-color="#b97963"/></linearGradient></defs><path d="M845 -30C920 69 1080 84 1230 195L1230 202C1072 89 916 76 840 -30Z" fill="url(#foil)" opacity=".6"/><path d="M-25 414C13 529 33 587 160 658L166 658C40 584 17 524-20 413Z" fill="url(#foil)" opacity=".45"/></svg>
    <img class="portrait" src="${photo}" alt="Paola Gutierrez in her burgundy suit, seated with lash tweezers" />
    <img class="logo" src="${logo}" alt="PaoLash" />
    <h1>Entirely<span>you.</span></h1>
    <p class="description">Lash artistry. Personal by design.<br />Professional education, with Paola.</p>
    <p class="location">PaoLash Lounge &amp; Academy · Dublin</p>
  </main></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await page.screenshot({ path: outputPath });
  console.log(`Created ${outputPath}`);
} finally {
  await browser.close();
}
