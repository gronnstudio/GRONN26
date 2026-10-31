import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

// "Als de website op mobiel wordt geopend in browser moet er nog een
// melding komen dat deze ook als app te installeren is" (eigenaar, 24 sep
// 2026). Deze bezoekers hebben hem nog nooit weggeklikt.
test.use({ storageState: { cookies: [], origins: [] } })

const MELDING = "[data-app-melding]"

async function scrolNaarLezen(page: import("@playwright/test").Page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5))
}

test.describe("telefoon", () => {
  test.skip(({ isMobile }) => !isMobile, "de melding is er alleen op de telefoon")

  test("niet bij het openen, wel na ruim een scherm scrollen", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(1500)
    await expect(page.locator(MELDING)).toHaveCount(0)
    await scrolNaarLezen(page)
    const melding = page.getByRole("dialog", { name: "GRØNN op je beginscherm" })
    await expect(melding).toBeVisible()
    // Chromium zonder installatiegebeurtenis: de weg via het browsermenu.
    await expect(melding).toHaveAttribute("data-app-melding", "menu")
    await expect(melding).toContainText("Toevoegen aan startscherm")
  })

  test("boven de dock, binnen het scherm, knoppen van 44px", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await scrolNaarLezen(page)
    const melding = page.locator(MELDING)
    await expect(melding).toBeVisible()
    await page.waitForTimeout(400)
    const m = (await melding.boundingBox())!
    const vp = page.viewportSize()!
    expect(m.x).toBeGreaterThanOrEqual(0)
    expect(m.x + m.width).toBeLessThanOrEqual(vp.width)
    // De dock (of zijn drie cirkels) staat eronder, niet erachter.
    const dock = await page.evaluate(() => {
      const els = [...document.querySelectorAll("nav, div")].filter((e) => {
        const s = getComputedStyle(e)
        return s.position === "fixed" && s.zIndex === "61"
      })
      const tops = els.flatMap((e) => [...e.querySelectorAll("a, button")].map((k) => k.getBoundingClientRect())).filter((r) => r.height > 0).map((r) => r.top)
      return Math.min(...tops)
    })
    expect(m.y + m.height).toBeLessThanOrEqual(dock)
    const knop = melding.getByRole("button", { name: "Niet nu" })
    const k = (await knop.boundingBox())!
    expect(k.height).toBeGreaterThanOrEqual(44)
  })

  test("Niet nu: weg, en bij het volgende bezoek ook", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await scrolNaarLezen(page)
    await page.getByRole("button", { name: "Niet nu" }).click()
    await expect(page.locator(MELDING)).toHaveCount(0)
    const opgeslagen = await page.evaluate(() => Number(localStorage.getItem("gronn-install-dismissed")))
    expect(Date.now() - opgeslagen).toBeLessThan(60_000)
    await page.goto("/nl/services", { waitUntil: "networkidle" })
    await scrolNaarLezen(page)
    await page.waitForTimeout(1200)
    await expect(page.locator(MELDING)).toHaveCount(0)
  })

  for (const uur of ["goldenhour", "bluehour"] as const) {
    test(`axe (${uur}): de melding zelf`, async ({ page }) => {
      await page.addInitScript((u) => {
        localStorage.setItem("theme", u)
        localStorage.setItem("gronn-theme-mode", "manual")
      }, uur)
      await page.goto("/nl", { waitUntil: "networkidle" })
      await scrolNaarLezen(page)
      await expect(page.locator(MELDING)).toBeVisible()
      await page.waitForTimeout(400)
      const res = await new AxeBuilder({ page })
        .include(MELDING)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
      expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
    })
  }

  test("Engels op de Engelse site", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await scrolNaarLezen(page)
    await expect(page.getByRole("dialog", { name: "GRØNN on your home screen" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Not now" })).toBeVisible()
  })

  test("in de app zelf nooit", async ({ page }) => {
    await page.addInitScript(() => {
      const echt = window.matchMedia.bind(window)
      window.matchMedia = (q: string) =>
        q.includes("display-mode: standalone") ? ({ ...echt(q), matches: true, media: q } as MediaQueryList) : echt(q)
    })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await scrolNaarLezen(page)
    await page.waitForTimeout(1200)
    await expect(page.locator(MELDING)).toHaveCount(0)
  })
})

test("op desktop nooit", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop")
  await page.goto("/nl", { waitUntil: "networkidle" })
  await scrolNaarLezen(page)
  await page.waitForTimeout(1200)
  await expect(page.locator(MELDING)).toHaveCount(0)
})
