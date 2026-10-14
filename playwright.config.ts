import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ar",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  projects: [
    { name: "unit", testIgnore: "**/mirror.spec.ts" },
    { name: "chromium", testMatch: "**/mirror.spec.ts", use: { browserName: "chromium", launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } } },
    { name: "webkit", testMatch: "**/mirror.spec.ts", use: { browserName: "webkit" } },
  ],
  use: {
    baseURL: "http://127.0.0.1:5182",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "PORT=5182 npm start",
    url: "http://127.0.0.1:5182/try-on/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
