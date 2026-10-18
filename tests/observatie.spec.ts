import { test, expect, type Page } from "@playwright/test"

// Observatiekaders (prototype, 18 okt 2026), op /proef/observatie.

/** Scroll de foto in beeld tot de kaders vastklikken (de pagina kan na het laden nog verspringen). */
async function inBeeld(page: Page, timeout = 8000) {
  const fig = page.locator("figure[data-observatie]")
  await page.waitForLoadState("networkidle")
  await expect(async () => {
    await fig.locator(".o-vak").scrollIntoViewIfNeeded()
    await expect(fig.locator(".o-kader.o-aan")).toHaveCount(5, { timeout: 4000 })
  }).toPass({ timeout })
  return fig
}

test("observatie: alle kaders klikken vast en de lijst eronder noemt ze", async ({ page }) => {
  await page.goto("/proef/observatie")
  const fig = await inBeeld(page, 15000)
  await expect(fig.locator(".o-kader.o-kern")).toHaveCount(1)
  await expect(fig.locator("figcaption li")).toHaveCount(5)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
})

test("observatie: minder beweging toont alles meteen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/proef/observatie")
  await inBeeld(page)
  // Zonder animatie: geen enkel kader is nog bezig met vastklikken.
  await expect(page.locator(".o-kader.o-aan").first()).toHaveCSS("animation-name", "none")
})

test("observatie: een kader kiezen dimt de rest, Escape zet het terug", async ({ page }) => {
  await page.goto("/proef/observatie")
  const fig = await inBeeld(page, 15000)
  await fig.locator(".o-kader").nth(1).click()
  await expect(fig.locator(".o-kader").nth(1)).toHaveAttribute("aria-pressed", "true")
  await expect(fig.locator(".o-vak")).toHaveClass(/o-kiest/)
  await page.keyboard.press("Escape")
  await expect(fig.locator(".o-vak")).not.toHaveClass(/o-kiest/)
})
