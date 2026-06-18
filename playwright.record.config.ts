import { defineConfig, devices } from "@playwright/test"

const hrmsBaseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001"

/** Headed run with video — for demo / review recordings */
export default defineConfig({
  testDir: "./playwright/tests",
  testMatch: /playwright\/tests\/(?!bevy-admin\/).*\.spec\.ts/,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    baseURL: hrmsBaseURL,
    headless: false,
    video: "on",
    trace: "on",
    screenshot: "on",
    launchOptions: { slowMo: 300 },
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
})
