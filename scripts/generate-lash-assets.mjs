/**
 * Regenerate portable GLB reference assets from the SAME procedural source used by AR.
 * Run: node scripts/generate-lash-assets.mjs
 * Validate without touching deliverables: node scripts/generate-lash-assets.mjs --check
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const cacheRoot = path.join(root, "node_modules", ".cache");
await mkdir(cacheRoot, { recursive: true });
const temporary = await mkdtemp(path.join(cacheRoot, "lash-export-"));

// GLTFExporter expects this browser primitive, even for texture-free geometry.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.({ target: this });
    }).catch((error) => this.onerror?.(error));
  }
};

try {
  const source = await readFile(path.join(root, "lib/ar/lash-geometry.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  const modulePath = path.join(temporary, "lash-geometry.mjs");
  await writeFile(modulePath, compiled.outputText);
  const { createLashGeometry, deformLashGeometry, neutralEyelid, sampleLid, LASH_ASSET_VERSION, LASH_GROOMS } = await import(pathToFileURL(modulePath).href);
  const destination = path.join(root, "public/ar/lashes");
  if (!checkOnly) await mkdir(destination, { recursive: true });
  const manifest = {
    assetVersion: LASH_ASSET_VERSION,
    approvalStatus: "prototype-requires-live-calibration-and-artist-approval",
    authoringSource: "lib/ar/lash-geometry.ts",
    generator: "scripts/generate-lash-assets.mjs (three 0.186.1)",
    sourceSha256: createHash("sha256").update(source).digest("hex"),
    coordinateConvention: "Y up, Z out of the face, neutral eye width = 1. Left/right are anatomical, before selfie mirroring.",
    runtime: "Procedural geometry is generated locally from the same source. GLBs are portable reference meshes; the browser does not fetch them.",
    deformation: "Roots run inner-to-outer on nine upper-lid landmarks. Each fibre has a root u and contiguous vertex range. Lid-aperture closure rotates profile 0..1.4 radians without shortening it. Runtime rasterizes the same 3D centrelines with feathered camera-facing fibres. Root maps are mesh extras.",
    styles: [],
  };
  const assertClose = (a, b, message) => assert.ok(Math.abs(a - b) < 0.000002, `${message}: ${a} vs ${b}`);
  const outward = { x: 0, y: 0, z: 1 };

  for (const styleId of Object.keys(LASH_GROOMS)) {
    const pair = new Group();
    pair.name = `paolash-${styleId}-${LASH_ASSET_VERSION}`;
    pair.userData = { styleId, assetVersion: LASH_ASSET_VERSION, approvalStatus: manifest.approvalStatus };
    const material = new MeshStandardMaterial({ color: 0x191317, roughness: 0.76, metalness: 0.025 });
    material.name = "soft-black-fibre";
    const left = createLashGeometry(styleId);
    const right = createLashGeometry(styleId);
    const repeated = createLashGeometry(styleId);
    assert.deepEqual(left.restPositions, repeated.restPositions, "Groom must regenerate deterministically");
    assert.deepEqual(left.restNormals, repeated.restNormals, "Normals must regenerate deterministically");
    repeated.geometry.dispose();
    assert.ok(left.triangleCount * 2 >= 10000 && left.triangleCount * 2 <= 30000, "Standard pair triangle budget");
    assert.equal(left.fibers.length, LASH_GROOMS[styleId].groups * LASH_GROOMS[styleId].fibersPerFan);

    for (const [eye, groom] of [["left", left], ["right", right]]) {
      const lid = neutralEyelid(eye);
      assert.deepEqual(sampleLid(lid, 0), lid[0], "Inner corner must interpolate exactly");
      for (let i = 0; i < lid.length; i++) {
        const sample = sampleLid(lid, i / (lid.length - 1));
        for (const axis of ["x", "y", "z"]) assertClose(sample[axis], lid[i][axis], "Tracked lid interpolation");
      }
      deformLashGeometry(groom, lid, outward, eye, 1, 0);
      const open = Float32Array.from(groom.geometry.getAttribute("position").array);
      deformLashGeometry(groom, lid, outward, eye, 1, 1);
      const closed = groom.geometry.getAttribute("position").array;
      for (const fiber of groom.fibers) {
        const anchor = sampleLid(lid, fiber.root);
        const tip = (fiber.vertexStart + fiber.vertexCount - 1) * 3;
        const distance = (array) => Math.hypot(array[tip] - anchor.x, array[tip + 1] - anchor.y, array[tip + 2] - anchor.z);
        assertClose(distance(open), distance(closed), "Blink must rotate, not shrink, fibre length");
        assert.ok(closed[tip + 1] < open[tip + 1], "Blink should turn the fibre downward");
      }
      deformLashGeometry(groom, lid, outward, eye, 1, 0);
      const position = groom.geometry.getAttribute("position");
      const normals = groom.geometry.getAttribute("normal");
      assert.ok(position.array.every(Number.isFinite), "All fitted coordinates must be finite");
      for (let i = 0; i < normals.count; i++) assert.ok(Math.abs(Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)) - 1) < 0.00001, "Unit normals");
      const indices = groom.geometry.getIndex();
      assert.ok(indices.array.every((value) => value < position.count), "Indices must address existing vertices");
      for (let i = 0; i < indices.count; i += 3) {
        const a = indices.getX(i); const b = indices.getX(i + 1); const c = indices.getX(i + 2);
        const ab = [position.getX(b) - position.getX(a), position.getY(b) - position.getY(a), position.getZ(b) - position.getZ(a)];
        const ac = [position.getX(c) - position.getX(a), position.getY(c) - position.getY(a), position.getZ(c) - position.getZ(a)];
        const cross = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
        const dot = cross[0] * normals.getX(a) + cross[1] * normals.getY(a) + cross[2] * normals.getZ(a);
        assert.ok(dot > 0, "Both anatomical eyes must keep outward triangle winding");
      }
      groom.geometry.computeBoundingBox();
      groom.geometry.computeBoundingSphere();
      const mesh = new Mesh(groom.geometry, material);
      mesh.name = `anatomical-${eye}`;
      mesh.userData = { eye, attachmentDirection: "inner-to-outer", fibers: groom.fibers };
      pair.add(mesh);
    }
    const leftPositions = left.geometry.getAttribute("position").array;
    const rightPositions = right.geometry.getAttribute("position").array;
    for (let i = 0; i < leftPositions.length; i += 3) {
      assertClose(leftPositions[i], -rightPositions[i], "Pair mirror x");
      assertClose(leftPositions[i + 1], rightPositions[i + 1], "Pair mirror y");
      assertClose(leftPositions[i + 2], rightPositions[i + 2], "Pair mirror z");
    }
    const buffer = await new GLTFExporter().parseAsync(pair, { binary: true, onlyVisible: true });
    assert.ok(buffer instanceof ArrayBuffer, "Exporter must produce a GLB buffer");
    assert.ok(buffer.byteLength <= 1_500_000, "Standard delivery size ceiling");
    const reloaded = await new GLTFLoader().parseAsync(buffer, "");
    let reloadedTriangles = 0;
    let reloadedMeshes = 0;
    reloaded.scene.traverse((object) => {
      if (!object.isMesh) return;
      reloadedMeshes++;
      reloadedTriangles += object.geometry.index.count / 3;
      assert.ok(object.geometry.attributes.position.array.every(Number.isFinite));
      assert.equal(object.userData.fibers.length, left.fibers.length, "Attachment maps survive export and reload");
      object.geometry.dispose();
      object.material.dispose();
    });
    assert.equal(reloadedMeshes, 2, "One draw per eye");
    assert.equal(reloadedTriangles, left.triangleCount * 2, "GLB round-trip triangle count");
    // The selector previews project the actual fitted groom at the same eye
    // width. They cannot silently drift into unrelated reference photographs.
    const previewName = `${styleId}.preview.svg`;
    const previewPaths = left.fibers.map((fiber) => {
      const rings = [];
      for (let start = fiber.vertexStart; start < fiber.vertexStart + fiber.vertexCount; start += 4) {
        const center = { x: 0, y: 0 };
        for (let side = 0; side < 4; side++) {
          center.x += leftPositions[(start + side) * 3] / 4;
          center.y += leftPositions[(start + side) * 3 + 1] / 4;
        }
        let radius = 0;
        for (let side = 0; side < 4; side++) {
          radius = Math.max(radius, Math.hypot(leftPositions[(start + side) * 3] - center.x, leftPositions[(start + side) * 3 + 1] - center.y));
        }
        rings.push({ x: 40 + (center.x - 0.18) * 200, y: 133 - center.y * 200, radius: radius * 200 });
      }
      const sides = [[], []];
      for (let i = 0; i < rings.length; i++) {
        const before = rings[Math.max(0, i - 1)];
        const after = rings[Math.min(rings.length - 1, i + 1)];
        const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
        const dx = -(after.y - before.y) / length * rings[i].radius;
        const dy = (after.x - before.x) / length * rings[i].radius;
        for (let side = 0; side < 2; side++) {
          const hand = side === 0 ? 1 : -1;
          const x = rings[i].x + dx * hand;
          const y = rings[i].y + dy * hand;
          assert.ok(x > 3 && x < 317 && y > 3 && y < 147, `Selector preview must keep the entire ${styleId} groom in frame: ${x}, ${y}`);
          sides[side].push(`${x.toFixed(2)},${y.toFixed(2)}`);
        }
      }
      return `<path d="M${[...sides[0], ...sides[1].reverse()].join("L")}Z"/>`;
    });
    const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="150" viewBox="0 0 320 150"><title>${styleId.replaceAll("-", " ")} digital lash shape</title><g fill="#211311">${previewPaths.join("")}</g></svg>\n`;
    if (checkOnly) assert.equal(await readFile(path.join(destination, previewName), "utf8"), preview, "Selector SVG must match the actual groom");
    else await writeFile(path.join(destination, previewName), preview);

    const filename = `${styleId}.v1.glb`;
    const bytes = Buffer.from(buffer);
    if (checkOnly) {
      const existing = await readFile(path.join(destination, filename));
      assert.deepEqual(existing, bytes, "Committed GLB must match current procedural source");
    } else await writeFile(path.join(destination, filename), bytes);
    manifest.styles.push({
      styleId, tier: "standard", url: `/ar/lashes/${filename}`, bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      preview: { url: `/ar/lashes/${previewName}`, bytes: Buffer.byteLength(preview), sha256: createHash("sha256").update(preview).digest("hex") },
      strandsPerEye: left.fibers.length, trianglesPerPair: left.triangleCount * 2, drawCalls: 2, textures: 0,
    });
    left.geometry.dispose(); right.geometry.dispose(); material.dispose();
    console.log(`${checkOnly ? "PASS" : "EXPORTED"} ${styleId}: ${left.fibers.length} fibres/eye, ${left.triangleCount * 2} triangles/pair, ${bytes.length} bytes; attachment, blink, winding, mirror and GLB round-trip verified`);
  }
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  if (checkOnly) assert.equal(await readFile(path.join(destination, "manifest.v1.json"), "utf8"), manifestText, "Manifest matches source and assets");
  else await writeFile(path.join(destination, "manifest.v1.json"), manifestText);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
