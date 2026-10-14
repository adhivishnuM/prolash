/** Copy the pinned local runtime; fetch the pinned model only if absent. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorRoot = join(projectRoot, "public/ar/vendor");
const packageRoot = join(projectRoot, "node_modules/@mediapipe/tasks-vision");
const runtimeVersion = "1.1.0";
const runtimeHashes = {
  "vision_bundle.js": "022cbbfcdb74bae18e4bbc722e429e046d5fdd35f6183f1359c56b652b8b87f7",
  "wasm/vision_wasm_internal.js": "7c652617b5bef832f42878ce8c5f752b0724bca6054e4bc1013a37d4b1949723",
  "wasm/vision_wasm_internal.wasm": "782eda3ec1f414fdb4f1d66a8b59093eb4d5ab437e06117796abf05962d68eef",
  "wasm/vision_wasm_nosimd_internal.js": "510fc70a170eb8b46767a7abab2af89a7a8341fa5b3ebfb8a5de41a79b7fa9df",
  "wasm/vision_wasm_nosimd_internal.wasm": "b802041d105876865d6a0806f2ff7c4419a7f1b80bc01340fe36e759c2030011",
};
const model = {
  file: "face-landmarker-f16-v1-64184e229b26.task",
  source: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  sha256: "64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff",
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifestFiles = [];

async function writeVerified(relativePath, data, hash, source) {
  if (sha256(data) !== hash) throw new Error(`AR asset integrity mismatch: ${relativePath}`);
  const destination = join(vendorRoot, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  let existing;
  try { existing = await readFile(destination); } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (!existing || sha256(existing) !== hash) await writeFile(destination, data);
  manifestFiles.push({ path: relativePath, bytes: data.byteLength, sha256: hash, source });
}

const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
if (packageJson.version !== runtimeVersion) {
  throw new Error(`Expected @mediapipe/tasks-vision ${runtimeVersion}, found ${packageJson.version}. Review hashes before upgrading.`);
}
for (const [relativePath, hash] of Object.entries(runtimeHashes)) {
  await writeVerified(`mediapipe-${runtimeVersion}/${relativePath}`,
    await readFile(join(packageRoot, relativePath)), hash,
    `npm:@mediapipe/tasks-vision@${runtimeVersion}/${relativePath}`);
}

let modelData;
try {
  modelData = await readFile(join(vendorRoot, model.file));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  console.log("Downloading the pinned MediaPipe face model (first setup only)…");
  const response = await fetch(model.source, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Model download failed: HTTP ${response.status}`);
  modelData = Buffer.from(await response.arrayBuffer());
}
await writeVerified(model.file, modelData, model.sha256, model.source);
await writeFile(join(vendorRoot, "manifest.json"), `${JSON.stringify({
  schemaVersion: 1,
  runtime: { package: "@mediapipe/tasks-vision", version: runtimeVersion, license: "Apache-2.0" },
  model: { name: "MediaPipe Face Landmarker", version: "float16/1", documentation: "https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker" },
  files: manifestFiles,
}, null, 2)}\n`);
console.log(`Verified ${manifestFiles.length} self-hosted AR files (${(manifestFiles.reduce((total, file) => total + file.bytes, 0) / 1024 / 1024).toFixed(1)} MiB; browsers load one WASM variant).`);
