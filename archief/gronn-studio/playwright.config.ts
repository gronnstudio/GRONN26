import { existsSync } from "node:fs"

import { defineConfig, devices } from "@playwright/test"

// Cloud dev environments ship a system Chromium and block downloads
// (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD); CI installs the matching browser
// itself. Use the system binary only when it exists and we're not in CI.
const systemChromium = "/opt/pw-browsers/chromium"
const launchOptions =
  !process.env.CI && existsSync(systemChromium)
    ? { executablePath: systemChromium }
    : {}

// Real specs against the real production build — AGENTS.md forbids
// placeholder tests, so every spec here drives actual pages. The
// webServer builds nothing: CI (and local runs) must `npm run build`
// first, which also catches the stale-server trap documented in
// docs/perf/README.md.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3210",
    trace: "on-first-retry",
    launchOptions,
    // Iedere test is een bezoeker die de app-melding al wegklikte: die
    // verschijnt na scrollen boven de dock en zou tikken onderaan het
    // scherm onderscheppen. app-melding.spec.ts begint zonder dit.
    storageState: "tests/e2e/terugkerende-bezoeker.json",
  },
  webServer: {
    command: "npx next start -p 3210",
    url: "http://localhost:3210",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    // `landscape` runs ONE file, and the other two skip it.
    //
    // A rotated phone is 863 × 360 — wider than the 768px `md`
    // breakpoint — so it leaves the dock behind and gets the tablet
    // menu, in a viewport under 400px tall. That surface had never been
    // measured at any height. It cannot simply join the `mobile`
    // project: Playwright reports `isMobile: true` for it, and every
    // `test.skip(({ isMobile }) => !isMobile)` in the suite assumes the
    // dock is on screen. One file of its own is the honest split.
    {
      name: "desktop",
      testIgnore: /landscape\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      testIgnore: /landscape\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "landscape",
      testMatch: /landscape\.spec\.ts/,
      use: { ...devices["Pixel 7 landscape"] },
    },
  ],
})
