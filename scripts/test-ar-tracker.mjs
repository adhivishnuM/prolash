import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the public tracker API without real cameras or network. Real worker
// initialization/inference is additionally smoke-tested in browsers.
const source = await readFile(new URL("../lib/ar/face-tracker.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness() {
  const workers = [];
  const timers = new Map();
  let nextTimer = 0;
  class MockWorker {
    constructor() { this.sent = []; this.terminated = false; workers.push(this); }
    postMessage(message, transfers) {
      if (this.failTransfer && message.type === "detect") throw new Error("Transfer failed");
      this.sent.push({ message, transfers });
    }
    terminate() { this.terminated = true; }
    reply(message) { this.onmessage?.({ data: message }); }
  }
  const context = vm.createContext({
    exports: {}, Worker: MockWorker, OffscreenCanvas: class {},
    createImageBitmap() {}, WebAssembly, DOMException,
    setTimeout(callback, milliseconds) {
      const id = ++nextTimer;
      timers.set(id, { callback, milliseconds });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(compiled, context);
  return {
    create: context.exports.createFaceTracker,
    workers, timers,
    fireTimeout(milliseconds) {
      const entry = [...timers].find(([, timer]) => timer.milliseconds === milliseconds);
      assert.ok(entry, `Expected a ${milliseconds}ms timeout`);
      timers.delete(entry[0]);
      entry[1].callback();
    },
  };
}

function bitmap() {
  return { closed: 0, close() { this.closed += 1; } };
}

async function initialized(options) {
  const h = harness();
  const initializing = h.create(options);
  const worker = h.workers[0];
  assert.equal(worker.sent[0].message.type, "init");
  worker.reply({ type: "ready" });
  return { ...h, worker, tracker: await initializing };
}

test("transfers one frame, drops busy frames, and uses increasing timestamps", async () => {
  const { tracker, worker, timers } = await initialized();
  const first = bitmap();
  const detecting = tracker.detect(first, 100);
  assert.equal(worker.sent[1].transfers[0], first);
  const skipped = bitmap();
  assert.equal(await tracker.detect(skipped, 101), null);
  assert.equal(skipped.closed, 1);
  assert.equal(worker.sent.length, 2);
  const face = { landmarks: [{ x: 0.5, y: 0.4, z: 0 }], blink: { left: 0, right: 0 }, timestamp: 100 };
  worker.reply({ type: "result", id: 1, face });
  assert.equal(await detecting, face);
  assert.equal(timers.size, 0);
  const secondDetection = tracker.detect(bitmap(), 100);
  assert.ok(worker.sent[2].message.timestamp > 100);
  worker.reply({ type: "result", id: 1, face }); // Late, unrelated reply.
  assert.equal(timers.size, 1);
  worker.reply({ type: "result", id: 2, face: null });
  assert.equal(await secondDetection, null);
  tracker.dispose();
});

test("abort before initialization creates no worker", async () => {
  const h = harness();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(h.create({ signal: controller.signal }), { name: "AbortError" });
  assert.equal(h.workers.length, 0);
});

test("abort during initialization terminates worker and ignores a late ready reply", async () => {
  const h = harness();
  const controller = new AbortController();
  const loading = h.create({ signal: controller.signal });
  const worker = h.workers[0];
  const rejection = assert.rejects(loading, { name: "AbortError" });
  controller.abort();
  worker.reply({ type: "ready" });
  await rejection;
  assert.equal(worker.terminated, true);
  assert.equal(h.timers.size, 0);
});

test("abort after ready rejects pending work and releases worker", async () => {
  const controller = new AbortController();
  const { tracker, worker, timers } = await initialized({ signal: controller.signal });
  const pending = tracker.detect(bitmap(), 1);
  const rejection = assert.rejects(pending, { name: "AbortError" });
  controller.abort();
  await rejection;
  assert.equal(worker.terminated, true);
  assert.equal(timers.size, 0);
});

test("cancellation in the ready microtask never returns an already-disposed tracker", async () => {
  const h = harness();
  const controller = new AbortController();
  const pending = h.create({ signal: controller.signal });
  const rejection = assert.rejects(pending, { name: "AbortError" });
  h.workers[0].reply({ type: "ready" });
  controller.abort();
  await rejection;
  assert.equal(h.workers[0].terminated, true);
});

test("dispose rejects pending work, ignores late replies, and closes future frames", async () => {
  const { tracker, worker, timers } = await initialized();
  const pending = tracker.detect(bitmap(), 1);
  const rejection = assert.rejects(pending, { name: "AbortError" });
  tracker.dispose();
  tracker.dispose();
  worker.reply({ type: "result", id: 1, face: { stale: true } });
  await rejection;
  const frame = bitmap();
  await assert.rejects(tracker.detect(frame, 2), { name: "AbortError" });
  assert.equal(frame.closed, 1);
  assert.equal(worker.terminated, true);
  assert.equal(timers.size, 0);
});

test("failed transfers close the untransferred bitmap and terminate tracker", async () => {
  const { tracker, worker, timers } = await initialized();
  worker.failTransfer = true;
  const frame = bitmap();
  await assert.rejects(tracker.detect(frame, 1), /transfer a camera frame/);
  assert.equal(frame.closed, 1);
  assert.equal(worker.terminated, true);
  assert.equal(timers.size, 0);
});

test("initialization timeout rejects and terminates", async () => {
  const h = harness();
  const pending = h.create();
  const rejection = assert.rejects(pending, /took too long/);
  h.fireTimeout(45_000);
  await rejection;
  assert.equal(h.workers[0].terminated, true);
  assert.equal(h.timers.size, 0);
});

test("inference timeout rejects and terminates instead of accumulating frames", async () => {
  const { tracker, worker, timers, fireTimeout } = await initialized();
  const pending = tracker.detect(bitmap(), 1);
  const rejection = assert.rejects(pending, /stopped responding/);
  fireTimeout(8_000);
  await rejection;
  assert.equal(worker.terminated, true);
  assert.equal(timers.size, 0);
});

test("invalid timestamps close the frame without sending it", async () => {
  const { tracker, worker } = await initialized();
  for (const timestamp of [NaN, Infinity, -1]) {
    const frame = bitmap();
    await assert.rejects(tracker.detect(frame, timestamp), /valid timestamp/);
    assert.equal(frame.closed, 1);
  }
  assert.equal(worker.sent.length, 1);
  tracker.dispose();
});

test("worker failure rejects current work and forwards progress without camera data", async () => {
  const progress = [];
  const { tracker, worker, timers } = await initialized({ onProgress: (message) => progress.push(message) });
  worker.reply({ type: "progress", message: "Loading model" });
  assert.deepEqual(progress, ["Loading model"]);
  const pending = tracker.detect(bitmap(), 1);
  const rejection = assert.rejects(pending, /Engine failed/);
  worker.reply({ type: "error", message: "Engine failed" });
  await rejection;
  assert.equal(worker.terminated, true);
  assert.equal(timers.size, 0);
});
