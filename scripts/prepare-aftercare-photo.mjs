import sharp from "sharp";

// Lossless format conversion only: no cropping, retouching or generated pixels.
const source = "assets/aftercare/after-care-original.jpeg";
const output = "public/assets/aftercare-product.webp";
const original = await sharp(source).rotate().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
await sharp(original.data, { raw: original.info }).webp({ lossless: true, effort: 6 }).toFile(output);
const decoded = await sharp(output).raw().toBuffer();
if (!decoded.equals(original.data)) throw new Error("Aftercare pixel-preservation check failed");
console.log(`${output}: ${original.info.width}×${original.info.height}, decoded pixels preserved`);
