import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const source = new URL("../assets/portraits/", import.meta.url);
const destination = new URL("../public/assets/portraits/", import.meta.url);
await mkdir(destination, { recursive: true });

// Only encode for the web. No retouching, generative fill, cropping or upscaling.
for (const name of ["paola-standing", "paola-seated", "paola-educator", "paola-award"]) {
  const output = fileURLToPath(new URL(`${name}.webp`, destination));
  await sharp(fileURLToPath(new URL(`${name}.jpeg`, source)))
    .autoOrient()
    .webp({ quality: 92, effort: 6 })
    .toFile(output);
  console.log(output);
}

// Change transparency only. Never use RGB pixels from a generated image.
for (const name of ["paola-standing", "paola-seated", "paola-educator"]) {
  const original = fileURLToPath(new URL(`${name}.jpeg`, source));
  // Use only the refined extraction's alpha, never its regenerated colour data.
  const mask = fileURLToPath(new URL(`${name}-refined-mask.png`, source));
  const cutout = fileURLToPath(new URL(`${name}-cutout.png`, source));
  const { data: originalPixels, info } = await sharp(original).autoOrient().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // Contract the standing suit's matte by two source pixels to exclude the
  // pale studio fringe; keep thin tweezers in the other photos intact.
  // Antialias only transparency, never the photograph's colour/texture data.
  const { data: selection, info: maskInfo } = await sharp(mask).removeAlpha().greyscale()
    .threshold(210).raw().toBuffer({ resolveWithObject: true });
  let boundary = selection;
  if (name === "paola-standing") {
    boundary = Buffer.from(selection);
    for (let y = 2; y < maskInfo.height - 2; y++) {
      for (let x = 2; x < maskInfo.width - 2; x++) {
        if (!selection[y * maskInfo.width + x]) continue;
        outer: for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (!selection[(y + dy) * maskInfo.width + x + dx]) {
              boundary[y * maskInfo.width + x] = 0;
              break outer;
            }
          }
        }
      }
    }
  }
  const alpha = await sharp(boundary, { raw: { width: maskInfo.width, height: maskInfo.height, channels: 1 } })
    .greyscale().blur(0.3).raw().toBuffer();
  if (maskInfo.width !== info.width || maskInfo.height !== info.height) {
    throw new Error(`${name}: mask dimensions differ from the original photograph`);
  }
  await sharp(originalPixels, { raw: info })
    .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toFile(cutout);
  const output = fileURLToPath(new URL(`${name}-cutout.webp`, destination));
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (alpha[y * info.width + x] < 8) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  left = Math.max(0, left - 12); top = Math.max(0, top - 12);
  right = Math.min(info.width - 1, right + 12); bottom = Math.min(info.height - 1, bottom + 12);
  const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
  // Trim empty canvas only: consistent sizing without stretching or upscaling.
  await sharp(cutout)
    .extract(crop)
    .webp({ lossless: true, alphaQuality: 100, effort: 6 })
    .toFile(output);
  // Compare actual decoded delivery pixels, not a visual similarity score.
  const delivered = await sharp(output).ensureAlpha().raw().toBuffer();
  let checked = 0;
  for (let pixel = 0; pixel < crop.width * crop.height; pixel++) {
    if (!delivered[pixel * 4 + 3]) continue;
    checked++;
    for (let channel = 0; channel < 3; channel++) {
      const sourcePixel = (Math.floor(pixel / crop.width) + top) * info.width + (pixel % crop.width) + left;
      if (delivered[pixel * 4 + channel] !== originalPixels[sourcePixel * 3 + channel]) {
        throw new Error(`${name}: original colour changed at pixel ${pixel}`);
      }
    }
  }
  console.log(`${name}: verified ${checked} visible pixels match the original RGB exactly`);
  console.log(`Delivery dimensions: ${crop.width} × ${crop.height}`);
  console.log(output);
}
