import { expect, test } from "@playwright/test"

import { isUnlocalized } from "@/lib/locale"
import { config as proxyConfig } from "@/proxy"

// GRØNN Command Center (/os) is the owner's alone.
//
// This suite runs against `next start`: production mode, no session. That
// is exactly a stranger on gronn.studio, so every /os address must answer
// with the panel's sign-in gate and carry none of the OS's data: no
// client name, no amount, no project photo.
//
// (Previews and `next dev` render the OS without a session on purpose;
// see src/app/os/layout.tsx. Nothing here runs in either.)

const OS_PATHS = ["/os", "/os/projects", "/os/projects/vijverklant", "/os/pipeline", "/os/finance"]

test.describe("the Command Center is closed to a signed-out visitor", () => {
  for (const path of OS_PATHS) {
    test(`${path} shows the sign-in gate and no OS data`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status(), `${path} should not 404 or 500`).toBe(200)
      await expect(page.getByRole("heading", { name: "Inloggen" })).toBeVisible()

      const html = await page.content()
      for (const secret of ["Vijverklant", "0,000", "0.000", "Klant", "Invoiced this year", "O-DEMO"]) {
        expect(html, `${path} leaked "${secret}"`).not.toContain(secret)
      }
      expect(html).not.toContain("/projecten/vijverrenovatie/")
    })
  }
})

test("/os stays out of the language redirect", async ({ page }) => {
  // Both lists must name it, or /os becomes /nl/os — a 404.
  expect(isUnlocalized("/os")).toBe(true)
  expect(isUnlocalized("/os/projects/vijverklant")).toBe(true)
  const matcher = new RegExp(`^${proxyConfig.matcher[0]}$`)
  expect(matcher.test("/os")).toBe(false)
  expect(matcher.test("/os/pipeline")).toBe(false)
  // A public page that merely starts with "os" is still localised.
  expect(matcher.test("/osteopathy")).toBe(true)

  const res = await page.request.get("/os", { maxRedirects: 0 })
  expect(res.status()).toBe(200)
})
