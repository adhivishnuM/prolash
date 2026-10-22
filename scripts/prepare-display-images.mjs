import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";

// Resize only, lossless WebP: no sharpening, retouching or regenerated pixels.
// Full-resolution originals remain available for inspection and future exports.
let before = 0, after = 0;
for (const name of await readdir("public/assets/lashes")) {
  if (!/^(?!.*-\d+\.webp$).*\.webp$/.test(name)) continue;
  const source = `public/assets/lashes/${name}`;
  for (const width of [320, 640]) {
    const target = source.replace(".webp", `-${width}.webp`);
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toFile(target);
    if (width === 640) after += (await stat(target)).size;
  }
  before += (await stat(source.replace(".webp", "-900.webp"))).size;
}
for (const name of ["seated", "standing"]) {
  const source = `public/assets/portraits/paola-${name}-cutout-v3.webp`;
  for (const width of name === "seated" ? [480, 720] : [480]) {
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toFile(`public/assets/portraits/paola-${name}-display-${width}.webp`);
  }
}
console.log(`Lash display variants: 900px ${Math.round(before / 1024)}KB → 640px ${Math.round(after / 1024)}KB (${Math.round((1 - after / before) * 100)}% smaller). Originals preserved.`);
await sharp("public/assets/brand/paolash-logo.png").resize({ width: 480 }).webp({ lossless: true, effort: 6 }).toFile("public/assets/brand/paolash-logo-display.webp");
for (const width of [480, 800]) {
  await sharp("public/assets/aftercare-product.webp").resize({ width }).webp({ lossless: true, effort: 6 }).toFile(`public/assets/aftercare-product-${width}.webp`);
}
