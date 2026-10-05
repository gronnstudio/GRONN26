import { defineConfig } from "@playwright/test"

// Bewust klein (eigenaar, 5 okt 2026): alleen wat echt stuk kan gaan, zodat
// CI onder tien minuten blijft. Draait tegen de productiebuild.
export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3210",
    ...(process.env.CI ? {} : { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium" } }),
  },
  webServer: {
    command: "npx next start -p 3210",
    url: "http://localhost:3210",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
