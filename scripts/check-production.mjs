import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Production has no AR surface. The future feature lives on its own branch.
const forbiddenPaths = ["app/try-on", "components/ar", "lib/ar", "public/ar", "out/try-on", "out/ar"];
const forbiddenCode = [/\/try-on(?:\/|\?)/i, /getUserMedia/, /@mediapipe/, /Lash Mirror/];
const failures = [];
for (const file of forbiddenPaths) {
  try { await access(file); failures.push(file); } catch (error) { if (error.code !== "ENOENT") throw error; }
}
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else if (/\.(?:[cm]?js|jsx|tsx?|html|css|json)$/.test(file)) {
      const content = await readFile(file, "utf8");
      if (forbiddenCode.some(pattern => pattern.test(content))) failures.push(file);
    }
  }
}
for (const directory of ["app", "components", "lib"]) await inspect(directory);
const manifest = JSON.parse(await readFile("package.json", "utf8"));
if (Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).some(name => /mediapipe/.test(name))) failures.push("package.json: AR dependency");
if (process.argv.includes("--export")) await inspect("out");
if (failures.length) throw new Error(`AR is excluded from production. Remove these entries:\n${[...new Set(failures)].join("\n")}`);
console.log("Production verified: no Try On routes, camera code, links, runtime dependencies or exported AR assets.");
