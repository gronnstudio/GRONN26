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
    // De service worker staat niet onder test; op CI liet hij een tweede goto
    // af en toe hangen (ERR_ABORTED na 30 s), 11 okt 2026.
    serviceWorkers: "block",
    ...(process.env.CI ? {} : { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium" } }),
  },
  webServer: {
    command: "npx next start -p 3210",
    url: "http://localhost:3210",
    reuseExistingServer: !process.env.CI,
    // Het dashboard onder test (tests/crm.spec.ts): een testinlog en opslag
    // in .crm-data/ op schijf in plaats van Blob. Alleen voor deze server.
    env: { GOOGLE_CLIENT_ID: "test", AUTH_SECRET: "alleen-voor-tests", CRM_LOKAAL: "1", EDITOR_ALLOWED_EMAIL: "hello@gronn.studio" },
    timeout: 60_000,
  },
})
