import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// AI supplies a selection only. No generated subject RGB is ever delivered.
const source = "assets/portraits";
const destination = "public/assets/portraits";
const rawMasks = {
  seated: process.argv[2] || "outputs/cutouts/seated-ai.png",
  standing: process.argv[3] || "outputs/cutouts/standing-ai.png",
  educator: process.argv[4] || "outputs/cutouts/educator-ai.png",
};
await mkdir(destination, { recursive: true });
const report = {};
for (const [name, generated] of Object.entries(rawMasks)) {
  const original = `${source}/paola-${name}.jpeg`;
  const maskPath = `${source}/paola-${name}-mask-v3.png`;
  const { data: rgb, info } = await sharp(original).autoOrient().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let alpha;
  try {
    const { data, info: maskInfo } = await sharp(generated).extractChannel("alpha").raw().toBuffer({ resolveWithObject: true });
    if (maskInfo.width !== info.width || maskInfo.height !== info.height) throw new Error(`${name}: extraction moved/resized the source canvas`);
    // Remove near-transparent diffusion noise and restore opaque interiors with
    // a continuous curve. Preserve the entire intermediate antialias range:
    // no binary threshold, erosion, blur, or changes to the photograph.
    alpha = Buffer.from(data.map(value => Math.round(Math.max(0, Math.min(1, (value - 8) / (248 - 8))) * 255)));
    await sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toFile(maskPath);
  } catch (error) {
    // Saved masks make the approved asset pipeline reproducible without
    // requiring another image generation run or an ignored raw tool output.
    if (error.code !== "ENOENT" && !String(error.message).includes("Input file is missing")) throw error;
    alpha = await sharp(maskPath).greyscale().raw().toBuffer();
  }
  if (alpha.length !== info.width * info.height) throw new Error(`${name}: incorrect mask size`);
  const rgba = Buffer.alloc(info.width * info.height * 4);
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let p = 0; p < alpha.length; p++) {
    rgba[p * 4] = rgb[p * 3]; rgba[p * 4 + 1] = rgb[p * 3 + 1]; rgba[p * 4 + 2] = rgb[p * 3 + 2]; rgba[p * 4 + 3] = alpha[p];
    if (alpha[p] >= 8) {
      const x = p % info.width, y = Math.floor(p / info.width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  const fullCanvas = `${source}/paola-${name}-cutout-v3.png`;
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(fullCanvas);
  left = Math.max(0, left - 12); top = Math.max(0, top - 12);
  right = Math.min(info.width - 1, right + 12); bottom = Math.min(info.height - 1, bottom + 12);
  const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
  const delivery = `${destination}/paola-${name}-cutout-v3.webp`;
  await sharp(fullCanvas).extract(crop).webp({ lossless: true, alphaQuality: 100, effort: 6 }).toFile(delivery);
  const pixels = await sharp(delivery).ensureAlpha().raw().toBuffer();
  let checked = 0;
  for (let p = 0; p < crop.width * crop.height; p++) {
    if (!pixels[p * 4 + 3]) continue;
    checked++;
    const sourcePixel = (Math.floor(p / crop.width) + top) * info.width + (p % crop.width) + left;
    for (let c = 0; c < 3; c++) if (pixels[p * 4 + c] !== rgb[sourcePixel * 3 + c]) throw new Error(`${name}: changed original RGB at pixel ${p}`);
  }
  report[name] = { source: original, sourceSha256: createHash("sha256").update(await readFile(original)).digest("hex"), mask: maskPath, fullCanvas, delivery, crop, visiblePixelsVerified: checked, rgbDifference: 0 };
  console.log(`${name}: ${crop.width}×${crop.height}; ${checked} visible pixels match original RGB exactly`);
}
await writeFile(`${source}/cutout-v3-provenance.json`, `${JSON.stringify(report, null, 2)}\n`);
