import { expect, test, type Page } from "@playwright/test";
import { assessFace } from "../../lib/ar/face-quality";
import type { TrackedFace } from "../../lib/ar/types";

type CameraState = { calls: number; stopped: number; audio: boolean; tracks: MediaStreamTrack[]; release?: () => Promise<void> };
type TestWindow = typeof window & { __cameraTest: CameraState };

const LOOKS = [
  { id: "natural-classic", name: "Natural classic" },
  { id: "doll-eye", name: "Doll eye" },
  { id: "wet-look", name: "Wet look" },
  { id: "wispy-hybrid", name: "Wispy hybrid" },
  { id: "russian-volume", name: "Russian volume" },
  { id: "eyeliner-effect", name: "Eyeliner effect" },
] as const;

/** An existing site photo is a deterministic camera fixture, never a realism benchmark. */
async function installCamera(page: Page, mode: "photo" | "denied" | "pending" = "photo", fixedFit = false) {
  await page.addInitScript(({ mode, fixedFit }) => {
    const state: CameraState = { calls: 0, stopped: 0, audio: true, tracks: [] };
    (window as TestWindow).__cameraTest = state;
    if (fixedFit) {
      // Keep one real detection's pose for visual comparisons. Otherwise tiny
      // tracker movement could make two identical lash styles look different
      // to a pixel test. Model startup, inference and timestamps remain real.
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        constructor(scriptURL: string | URL, options?: WorkerOptions) {
          super(scriptURL, options);
          if (!String(scriptURL).includes("/ar/face-tracker.worker.js")) return;
          let fit: TrackedFace | null = null;
          this.addEventListener("message", (event: MessageEvent<{ type: string; face?: TrackedFace | null }>) => {
            if (event.data.type !== "result" || !event.data.face) return;
            fit ??= structuredClone(event.data.face);
            event.data.face = { ...fit, timestamp: event.data.face.timestamp };
          });
        }
      };
    }
    async function cameraStream() {
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      canvas.height = 640;
      const context = canvas.getContext("2d")!;
      const image = new Image();
      image.src = "/assets/hero.webp";
      await image.decode();
      let tick = 0;
      const draw = () => {
        context.fillStyle = "#ccc4bc";
        context.fillRect(0, 0, 480, 640);
        context.drawImage(image, 250, 140, 500, 660, 0, 0, 480, 640);
        context.fillStyle = tick++ % 2 ? "#ccc4bc" : "#ccc4bd";
        context.fillRect(0, 0, 1, 1);
      };
      draw();
      const timer = setInterval(draw, 40);
      const stream = canvas.captureStream(25);
      for (const track of stream.getTracks()) {
        state.tracks.push(track);
        const original = track.stop.bind(track);
        track.stop = () => { state.stopped++; clearInterval(timer); original(); };
      }
      return stream;
    }
    // WebKit can recreate an unreferenced WebIDL wrapper. Patch the prototype
    // so the fixture cannot fall through to a real camera after wrapper GC.
    Object.defineProperty(Object.getPrototypeOf(navigator.mediaDevices), "getUserMedia", {
      configurable: true,
      value: async (constraints: MediaStreamConstraints) => {
        state.calls++;
        state.audio = constraints.audio !== false;
        if (mode === "denied") throw new DOMException("Permission denied", "NotAllowedError");
        if (mode === "pending") return new Promise<MediaStream>((resolve) => {
          state.release = async () => resolve(await cameraStream());
        });
        return cameraStream();
      },
    });
  }, { mode, fixedFit });
}

async function readLashSilhouette(page: Page) {
  return page.locator('canvas[data-layer="lashes"]').evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl2")!;
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // Compare in the fixture's source resolution, so an adaptive render-budget
    // change cannot itself look like a different eyelash shape.
    const width = 480;
    const height = Math.round(width * canvas.height / canvas.width);
    const alpha = new Float32Array(width * height);
    const samples = new Uint8Array(width * height);
    for (let y = 0; y < canvas.height; y++) {
      const row = Math.floor(y * height / canvas.height) * width;
      for (let x = 0; x < canvas.width; x++) {
        const index = row + Math.floor(x * width / canvas.width);
        alpha[index] += pixels[(y * canvas.width + x) * 4 + 3];
        samples[index]++;
      }
    }
    // Return only visible pixel locations, ignoring transparent antialiasing
    // fringes, so comparisons measure actual shape rather than byte hashes.
    const visible: number[] = [];
    for (let i = 0; i < alpha.length; i++) if (alpha[i] / samples[i] >= 64) visible.push(i);
    return { width, height, visible };
  });
}

test("landing is camera-free, keeps deep-linked style, and supports keyboard help", async ({ page }) => {
  await installCamera(page);
  const arRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/ar\/(?:vendor\/|face-tracker\.worker\.js)/.test(request.url())) arRequests.push(request.url());
  });
  await page.goto("/try-on/?style=russian-volume");
  await expect(page.getByRole("heading", { name: /Find your finish/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Russian volume/ })).toBeChecked();
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.calls)).toBe(0);
  expect(arRequests).toEqual([]);
  await page.getByRole("button", { name: "Help with your lash preview" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page).toHaveURL(/try-on/);
  await page.getByRole("radio", { name: /Eyeliner effect/ }).check();
  await expect(page).toHaveURL(/style=eyeliner-effect/);
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Open camera" })).toBeVisible();
});

test("all six deep links select their digital lash shape without opening the camera", async ({ page }) => {
  await installCamera(page);
  const runtimeRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/ar\/(?:vendor\/|face-tracker\.worker\.js)/.test(request.url())) runtimeRequests.push(request.url());
  });
  for (const look of LOOKS) {
    await test.step(look.name, async () => {
      await page.goto(`/try-on/?style=${look.id}`);
      await expect(page.getByRole("radio")).toHaveCount(LOOKS.length);
      const choice = page.getByRole("radio", { name: new RegExp(look.name) });
      await expect(choice).toBeChecked();
      await expect(choice).toHaveValue(look.id);
      const preview = page.locator(`img[src="/ar/lashes/${look.id}.preview.svg"]`).first();
      await expect(preview).toBeVisible();
      await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => (window as TestWindow).__cameraTest.calls)).toBe(0);
    });
  }
  expect(runtimeRequests).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/try-on/?style=wet-look");
  const wet = page.getByRole("radio", { name: /Wet look/ });
  await expect(wet).toBeChecked();
  await expect.poll(() => wet.evaluate((input) => {
    const card = input.closest("label")!;
    const rail = card.parentElement!;
    const a = card.getBoundingClientRect();
    const b = rail.getBoundingClientRect();
    return rail.scrollLeft > 0 && a.left >= b.left && a.right <= b.right;
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Native radio arrows wrap through all six looks and reveal the chosen card.
  await wet.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /Wispy hybrid/ })).toBeChecked();
});

test("permission denial offers recovery without downloading the model", async ({ page }) => {
  await installCamera(page, "denied");
  const modelRequests: string[] = [];
  page.on("request", (request) => { if (/\.task|\.wasm/.test(request.url())) modelRequests.push(request.url()); });
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.getByRole("heading", { name: "Camera access is off." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  expect(modelRequests).toEqual([]);
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.audio)).toBe(false);
});

test("cancelling a pending permission request stops a late camera stream", async ({ page }) => {
  await installCamera(page, "pending");
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "permission");
  await page.getByRole("button", { name: "Cancel preview" }).click();
  await page.evaluate(async () => { await (window as TestWindow).__cameraTest.release?.(); });
  await expect.poll(() => page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(1);
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "idle");
  expect(await page.locator("video").evaluate((video: HTMLVideoElement) => video.srcObject)).toBeNull();
});

test("local tracking renders 3D lashes, compares, captures, saves and restarts cleanly", async ({ page }) => {
  test.setTimeout(120_000);
  await installCamera(page, "photo", true);
  const pageErrors: string[] = [];
  const requests: { url: string; method: string }[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.context().on("request", (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live", { timeout: 60_000 });
  expect((await readLashSilhouette(page)).visible.length).toBeGreaterThan(100);
  await page.getByRole("button", { name: "Original", exact: true }).click();
  await expect(page.getByRole("button", { name: "Original", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('canvas[data-layer="lashes"]')).toBeHidden();
  await page.getByRole("button", { name: "With lashes", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Lash definition" })).toHaveValue("65");
  await page.getByRole("slider", { name: "Lash definition" }).fill("90");
  await expect(page.getByRole("slider", { name: "Lash definition" })).toHaveAttribute("aria-valuetext", "90% — bold");
  const runtimeDownloads = () => requests.filter(({ url }) => /\/ar\/(?:vendor\/|face-tracker\.worker\.js)/.test(url));
  const initialDownloads = runtimeDownloads().slice();
  expect(initialDownloads.some(({ url }) => url.includes(".task"))).toBe(true);
  const silhouettes: { name: string; mask: Awaited<ReturnType<typeof readLashSilhouette>> }[] = [];
  for (const look of LOOKS) {
    await test.step(`Live ${look.name}`, async () => {
      const choice = page.getByRole("radio", { name: new RegExp(look.name) });
      await choice.check();
      await expect(choice).toBeChecked();
      await expect(page.getByRole("heading", { name: look.name, exact: true })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`style=${look.id}(?:&|$)`));
      await expect(page.getByRole("slider", { name: "Lash definition" })).toHaveValue("90");
      await expect(page.locator("main")).toHaveAttribute("data-session-status", "live");
      const mask = await readLashSilhouette(page);
      expect(mask.visible.length, `${look.name} must draw visible lashes`).toBeGreaterThan(100);
      const current = new Set(mask.visible);
      for (const previous of silhouettes) {
        expect([mask.width, mask.height]).toEqual([previous.mask.width, previous.mask.height]);
        const intersection = previous.mask.visible.filter((pixel) => current.has(pixel)).length;
        const union = current.size + previous.mask.visible.length - intersection;
        const difference = (union - intersection) / union;
        expect(difference, `${look.name} and ${previous.name} must have visibly different silhouettes`).toBeGreaterThan(0.08);
      }
      silhouettes.push({ name: look.name, mask });
      expect(await page.evaluate(() => (window as TestWindow).__cameraTest.calls)).toBe(1);
      expect(runtimeDownloads()).toEqual(initialDownloads);
    });
  }
  await page.getByRole("radio", { name: /Russian volume/ }).check();
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.calls)).toBe(1);
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live");
  await page.screenshot({ path: `test-results/mirror-${test.info().project.name}-desktop-live.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live");
  await page.screenshot({ path: `test-results/mirror-${test.info().project.name}-mobile-live.png` });
  await page.getByRole("button", { name: "Capture a preview to review and save" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "review");
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(1);
  const styled = await page.getByRole("img", { name: /style preview/ }).getAttribute("src");
  await page.getByRole("button", { name: "Original", exact: true }).click();
  const original = await page.getByRole("img", { name: "Your original camera image" }).getAttribute("src");
  expect(original).not.toEqual(styled);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save image" }).click();
  expect((await download).suggestedFilename()).toBe("paolash-original-preview.jpg");
  await page.getByRole("button", { name: "Back to live" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live", { timeout: 60_000 });
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.calls)).toBe(2);
  await expect(page.getByRole("slider", { name: "Lash definition" })).toHaveValue("90");
  const foreignRequests = requests.filter(({ url }) => !url.startsWith("http://127.0.0.1:5182") && !url.startsWith("data:"));
  expect(foreignRequests).toEqual([]);
  expect(requests.filter(({ method }) => !["GET", "HEAD"].includes(method))).toEqual([]);
  expect(pageErrors).toEqual([]);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "paused");
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(2);
});

test("failed worker startup releases an already-granted camera", async ({ page }) => {
  await installCamera(page);
  await page.route("**/ar/face-tracker.worker.js*", (route) => route.abort());
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "error");
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(1);
});

test("face quality rejects missing, too-small, nonfinite, and extreme-profile landmarks", () => {
  const face: TrackedFace = {
    landmarks: Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.4, z: 0 })),
    blink: { left: 0, right: 0 }, timestamp: 1,
  };
  face.landmarks[33].x = 0.25;
  face.landmarks[133].x = 0.4;
  face.landmarks[362].x = 0.6;
  face.landmarks[263].x = 0.75;
  expect(assessFace(face).usable).toBe(true);
  face.blink = { left: 1, right: 1 };
  expect(assessFace(face).usable).toBe(true);
  expect(assessFace(null).usable).toBe(false);
  face.landmarks[263].x = 0.61;
  expect(assessFace(face).message).toContain("closer");
  face.landmarks[263].x = 0.65;
  expect(assessFace(face).message).toContain("towards");
  face.landmarks[263].x = NaN;
  expect(assessFace(face).usable).toBe(false);
});

test("eyes outside the visible object-fit crop cannot enable capture", () => {
  const face: TrackedFace = { landmarks: Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.4, z: 0 })), blink: { left: 0, right: 0 }, timestamp: 1 };
  face.landmarks[33].x = 0.1; face.landmarks[133].x = 0.25;
  face.landmarks[362].x = 0.55; face.landmarks[263].x = 0.70;
  expect(assessFace(face).usable).toBe(true);
  expect(assessFace(face, { sourceWidth: 960, sourceHeight: 720, width: 390, height: 500 }).message).toContain("inside");
});

test("a stalled video releases the camera and offers a restart", async ({ page }) => {
  await installCamera(page);
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live", { timeout: 60_000 });
  await page.locator("video").evaluate((video) => Object.defineProperty(video, "currentTime", { configurable: true, value: 42 }));
  await expect(page.getByRole("heading", { name: "Your camera stopped responding." })).toBeVisible({ timeout: 12_000 });
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(1);
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("an OS camera interruption pauses cleanly without reopening permission", async ({ page }) => {
  await installCamera(page);
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live", { timeout: 60_000 });
  await page.locator("video").evaluate((video: HTMLVideoElement) => (video.srcObject as MediaStream).getVideoTracks()[0].dispatchEvent(new Event("mute")));
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "paused");
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(1);
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.calls)).toBe(1);
});

test("closing a live mirror releases the stream before navigating", async ({ page }) => {
  await installCamera(page);
  await page.goto("/try-on/");
  await page.getByRole("button", { name: "Open camera" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-session-status", "live", { timeout: 60_000 });
  await page.getByRole("link", { name: "Close lash mirror" }).click();
  await expect(page).toHaveURL(/\/#services$/);
  expect(await page.evaluate(() => (window as TestWindow).__cameraTest.stopped)).toBe(1);
});

test("homepage navigation suspends analytics throughout the camera route", async ({ page }) => {
  await installCamera(page);
  await page.route(/https:\/\/(www\.)?(google-analytics|googletagmanager)\.com\//, (route) => route.fulfill({ status: 200, body: "" }));
  await page.goto("/");
  await page.getByRole("link", { name: "Try on our looks" }).click();
  await expect(page).toHaveURL(/try-on/);
  await expect.poll(() => page.evaluate(() => {
    const flags = window as unknown as Record<string, unknown>;
    return Object.keys(flags).filter((key) => key.startsWith("ga-disable-")).map((key) => flags[key]);
  })).toEqual([true]);
  await page.getByRole("link", { name: "Close lash mirror" }).click();
  await expect.poll(() => page.evaluate(() => {
    const flags = window as unknown as Record<string, unknown>;
    return Object.keys(flags).filter((key) => key.startsWith("ga-disable-")).map((key) => flags[key]);
  })).toEqual([]);
});
