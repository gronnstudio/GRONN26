import { defineConfig, devices } from "@playwright/test"

// Klein gehouden: een desktop en een telefoon, tegen de productiebuild.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: "list",
  // In een omgeving met een vooraf geïnstalleerde Chromium: PW_CHROMIUM=/pad/naar/chrome.
  use: { baseURL: "http://localhost:3200", launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined } },
  webServer: { command: "npm run build && npx next start -p 3200", url: "http://localhost:3200", reuseExistingServer: true, timeout: 180_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "telefoon", use: { ...devices["Pixel 7"] } },
  ],
})
