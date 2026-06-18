import { defineConfig, devices } from "@playwright/test"

const hrmsBaseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001"
const bevyAdminBaseURL = process.env.PLAYWRIGHT_BEVY_ADMIN_URL || "http://localhost:3002"

export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "hrms",
      testMatch: /playwright\/tests\/(?!bevy-admin\/).*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        baseURL: hrmsBaseURL,
      },
    },
    {
      name: "bevy-admin",
      testDir: "./playwright/tests/bevy-admin",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        baseURL: bevyAdminBaseURL,
      },
    },
  ],
})
