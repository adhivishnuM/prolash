// Deterministic brand composition using the client's supplied logo.
// No generated photography, third-party assets, or external requests.
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const logo = (await readFile(new URL("../public/assets/paolash-burgundy-logo.png", import.meta.url))).toString("base64");
const artwork = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <filter id="ink" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0.8 1 0.6 0 -0.38"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <radialGradient id="glow"><stop stop-color="#601a2b"/><stop offset="1" stop-color="#3c0a17"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" filter="url(#grain)" opacity=".035"/>
  <image x="70" y="70" width="460" height="460" xlink:href="data:image/png;base64,${logo}" filter="url(#ink)"/>
  <path d="M573 155v310" stroke="#e5cbb9" stroke-opacity=".2"/>
  <text x="643" y="206" fill="#e5cbb9" font-family="Arial, sans-serif" font-size="11" letter-spacing="3">LASH &amp; BROW ATELIER</text>
  <text x="640" y="299" fill="#f2e9df" font-family="Baskerville, Georgia, serif" font-size="76" letter-spacing="-3">The art of</text>
  <text x="640" y="380" fill="#e5cbb9" font-family="Baskerville, Georgia, serif" font-size="78" font-style="italic" letter-spacing="-3">being you.</text>
  <text x="643" y="445" fill="#e5cbb9" font-family="Arial, sans-serif" font-size="12" letter-spacing="2">DUBLIN, IRELAND</text>
  <path d="M64 556h1072" stroke="#e5cbb9" stroke-opacity=".2"/>
  <text x="64" y="589" fill="#e5cbb9" font-family="Arial, sans-serif" font-size="10" letter-spacing="2">PAOLASH LOUNGE &amp; ACADEMY</text>
  <text x="1136" y="589" text-anchor="end" fill="#e5cbb9" font-family="Arial, sans-serif" font-size="10" letter-spacing="2">AN EYE FOR THE INDIVIDUAL</text>
</svg>`;

await sharp(Buffer.from(artwork)).png().toFile(new URL("../public/og-burgundy.png", import.meta.url).pathname);
console.log("Created public/og-burgundy.png (1200 × 630).");
