import { expect, test, type Page } from "@playwright/test"

// De eenmalige zoektip (eigenaar, 28 sep 2026, uit zijn CodePen van 2022:
// "Tip voor nieuwe bezoekers"): onderin het midden, na 1,8 s, 5 s lang,
// één keer per browser, alleen vanaf md met een muis.

const TIP = '[data-element="ZoekTip"]'

async function eersteBezoek(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("__zt_init")) return
    sessionStorage.setItem("__zt_init", "1")
    sessionStorage.setItem("gronn-intro", "1")
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
  })
  await page.clock.install()
}

test.describe("zoektip, desktop", () => {
  test.skip(({ isMobile }) => !!isMobile, "alleen vanaf md met een muis")

  test("verschijnt één keer, onderin het midden, en gaat na 5 s weg", async ({ page }) => {
    await eersteBezoek(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await expect(page.locator(TIP)).toHaveCount(0)

    await page.clock.runFor(2000)
    const tip = page.locator(TIP)
    await expect(tip).toHaveAttribute("data-zoektip", "zichtbaar")
    await expect(tip).toHaveAttribute("role", "status")
    await expect(tip).toContainText(/Tip: druk (⌘K|Ctrl K) om te zoeken/)
    const b = (await tip.boundingBox())!
    const vp = page.viewportSize()!
    expect(Math.abs(b.x + b.width / 2 - vp.width / 2)).toBeLessThanOrEqual(1)
    expect(vp.height - (b.y + b.height)).toBeLessThanOrEqual(40)
    // Zit niet op de Omhoog-knop.
    const knop = (await page.locator('[data-naar-boven="los"]').boundingBox())!
    expect(b.x + b.width).toBeLessThan(knop.x)

    await page.clock.runFor(5200)
    await expect(tip).toHaveAttribute("data-zoektip", "weg")
    await expect(tip).toHaveText("")

    // Daarna nooit meer, ook niet na een andere pagina.
    await page.goto("/nl/services")
    await page.waitForLoadState("networkidle")
    await page.clock.runFor(8000)
    await expect(page.locator(TIP)).toHaveCount(0)
  })

  test("de toets klopt en werkt: ⌘K opent het zoeken", async ({ page }) => {
    await eersteBezoek(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await page.clock.runFor(2000)
    const mac = await page.evaluate(() => /Mac|iPhone|iPad/.test(navigator.userAgent))
    await expect(page.locator(`${TIP} kbd`)).toHaveText(mac ? "⌘K" : "Ctrl K")
    await page.keyboard.press(mac ? "Meta+k" : "Control+k")
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test.describe("op een Mac", () => {
    test.use({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    })
    test("⌘K", async ({ page }) => {
      await eersteBezoek(page)
      await page.goto("/nl")
      await page.waitForLoadState("networkidle")
      await page.clock.runFor(2000)
      await expect(page.locator(`${TIP} kbd`)).toHaveText("⌘K")
    })
  })

})

test("telefoon: geen zoektip", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon")
  await eersteBezoek(page)
  await page.goto("/nl")
  await page.waitForLoadState("networkidle")
  await page.clock.runFor(3000)
  await expect(page.locator(TIP)).toHaveCount(0)
})
