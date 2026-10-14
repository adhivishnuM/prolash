import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const portraitPath = path.join(root, "public/assets/paola-original.jpg");
const logoPath = path.join(root, "public/assets/paolash-logo-transparent.png");
const outputPath = path.join(root, "public/paolash-social-clean.png");

const roundedMask = Buffer.from(`
  <svg width="500" height="550" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="550" rx="46" fill="white"/>
  </svg>
`);

const portrait = await sharp(portraitPath)
  .resize(500, 550, { fit: "cover", position: "north" })
  .composite([{ input: roundedMask, blend: "dest-in" }])
  .png()
  .toBuffer();

const logo = await sharp(logoPath).resize({ width: 170 }).png().toBuffer();

const typography = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="soft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4c0b1a"/>
        <stop offset="1" stop-color="#310610"/>
      </linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#190207" flood-opacity=".32"/>
      </filter>
    </defs>
    <rect width="1200" height="630" fill="url(#soft)"/>
    <circle cx="1060" cy="70" r="235" fill="#e8c979" opacity=".08"/>
    <rect x="650" y="40" width="500" height="550" rx="46" fill="#f5eadb" opacity=".13" filter="url(#shadow)"/>
    <text x="72" y="282" fill="#fbf1e5" font-family="Arial, Helvetica, sans-serif" font-size="70" font-weight="500" letter-spacing="-3">Lash artistry.</text>
    <text x="72" y="360" fill="#e5c879" font-family="Arial, Helvetica, sans-serif" font-size="70" font-weight="500" letter-spacing="-3">Made personal.</text>
    <text x="75" y="420" fill="#e8d9d1" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="400">Bespoke lashes · Professional education</text>
    <rect x="72" y="485" width="186" height="48" rx="24" fill="#f4d997"/>
    <text x="102" y="516" fill="#3a0713" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="600" letter-spacing="1.6">DUBLIN 2</text>
    <text x="72" y="575" fill="#c7aeb2" font-family="Arial, Helvetica, sans-serif" font-size="16" letter-spacing="1.2">PAOLASH LOUNGE &amp; ACADEMY</text>
  </svg>
`);

await sharp(typography)
  .composite([
    { input: logo, left: 70, top: 40 },
    { input: portrait, left: 650, top: 40 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Created ${outputPath}`);
