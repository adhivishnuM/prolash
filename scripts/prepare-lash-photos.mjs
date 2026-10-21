import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// No generated pixels, retouching, sharpening or colour grading.
// The HEIC original is decoded to PNG with macOS sips before this step.
const sources = [
  ["wispy-hybrid.png", "wispy-hybrid.webp"],
  ["volume.png", "volume.webp"],
  ["line-effect.jpg", "line-effect.webp"],
  ["wispy-lash-lift.jpg", "wispy-lash-lift.webp"],
  ["classic.jpg", "classic.webp"],
  ["fox-eye.jpg", "fox-eye.webp"],
  ["anime-volume.jpg", "anime-volume.webp"],
  ["brown-set.png", "brown-set.webp"],
];
await mkdir("public/assets/lashes", { recursive: true });
for (const [source, name] of sources) {
  const original = await sharp(`assets/lashes/${source}`).rotate().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const output = `public/assets/lashes/${name}`;
  await sharp(original.data, { raw: original.info }).webp({ lossless: true, effort: 6 }).toFile(output);
  const decoded = await sharp(output).raw().toBuffer();
  if (!decoded.equals(original.data)) throw new Error(`Pixel preservation failed: ${source}`);
  // Smaller, lossless display copies save mobile bandwidth. The full original
  // export remains pixel-identical; none of these copies are enhanced.
  for (const width of [480, 900]) {
    await sharp(original.data, { raw: original.info })
      .resize({ width, withoutEnlargement: true })
      .webp({ lossless: true, effort: 6 })
      .toFile(output.replace(".webp", `-${width}.webp`));
  }
  console.log(`${name}: ${original.info.width}×${original.info.height}, decoded pixels preserved`);
}
