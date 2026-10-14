import { expect, test } from "@playwright/test";
import { playCamera } from "../../lib/ar/camera";

class VideoFixture extends EventTarget {
  readyState = 0;
  videoWidth = 0;
  videoHeight = 0;
  play = () => new Promise<void>(() => {});
  asVideo() { return this as unknown as HTMLVideoElement; }
}

test("camera startup times out instead of retaining a granted stream indefinitely", async () => {
  await expect(playCamera(new VideoFixture().asVideo(), new AbortController().signal, 20)).rejects.toHaveProperty("name", "NotReadableError");
});

test("camera startup cancellation rejects immediately even while play is pending", async () => {
  const controller = new AbortController();
  const starting = playCamera(new VideoFixture().asVideo(), controller.signal, 5000);
  controller.abort();
  await expect(starting).rejects.toHaveProperty("name", "AbortError");
});

test("camera startup requires a usable first frame and absorbs late playback errors", async () => {
  const video = new VideoFixture();
  let rejectPlayback!: (reason: Error) => void;
  video.play = () => new Promise((_resolve, reject) => { rejectPlayback = reject; });
  const starting = playCamera(video.asVideo(), new AbortController().signal, 100);
  video.readyState = 2; video.videoWidth = 960; video.videoHeight = 720;
  video.dispatchEvent(new Event("loadeddata"));
  await expect(starting).resolves.toBeUndefined();
  rejectPlayback(new Error("Interrupted after first frame"));
});
