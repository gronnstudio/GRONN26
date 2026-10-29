import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

// De 404 (eigenaar, 30 sep 2026: "maak een leuke custom 404 pagina!" en
// "maak hier een microspelletje? simulatie, voedselbossen, maak het
// onbeperkt speelbaar en gebruik local storage"): "Hier groeit nog
// niets." met het element `Voedselbos`. Bewaakt: de status blijft 404, de
// wegen terug werken, planten, groeien en plukken lopen met tik en
// toetsenbord, de stand overleeft een herlaadbeurt, pauze houdt de klok
// stil, en axe vindt niets in beide thema's.

const ADRES = "/nl/deze-pagina-bestaat-niet"
const SEIZOEN_MS = 5000

async function metPalet(page: Page, thema: "goldenhour" | "bluehour") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t)
      localStorage.setItem("gronn-theme-mode", "manual")
      localStorage.setItem("gronn-zoektip-gezien", "1")
      sessionStorage.setItem("gronn-intro", "1")
    } catch {}
  }, thema)
}

const vak = (page: Page, i: number) => page.locator(`[data-vak="${i}"]`)

test("404: de status, de kop en de wegen terug", async ({ page }) => {
  const antwoord = await page.goto(ADRES)
  expect(antwoord?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hier groeit nog niets.")
  await expect(page.getByRole("link", { name: /Naar de voorpagina/ })).toHaveAttribute("href", "/nl")
  const wegen = page.getByRole("navigation", { name: "Verder kijken" }).getByRole("link")
  await expect(wegen).toHaveCount(4)
  for (const href of ["/nl/services", "/nl/projects", "/nl/studio", "/nl/contact"]) {
    await expect(page.locator(`nav a[href="${href}"]`)).toHaveCount(1)
  }
  // Het adres dat niet bestond staat als perceel boven het veld.
  await expect(page.locator("[data-voedselbos-pad]")).toHaveText(ADRES)
  // Nooit iets over hoe de site gemaakt is.
  await expect(page.locator("main")).not.toContainText(/Claude/)
})

test("voedselbos: planten, een seizoen verder, plukken", async ({ page }) => {
  await page.clock.install()
  await page.goto(ADRES, { waitUntil: "networkidle" })
  await expect(page.locator("[data-vak]")).toHaveCount(36)
  await expect(page.locator('[data-voedselbos="zaden"]')).toHaveText("4")

  // Munt kiezen en planten met het toetsenbord.
  await page.getByRole("button", { name: /^Munt/ }).click()
  await expect(page.getByRole("button", { name: /^Munt/ })).toHaveAttribute("aria-pressed", "true")
  await vak(page, 7).focus()
  await page.keyboard.press("Enter")
  await expect(vak(page, 7)).toHaveAttribute("data-soort", "munt")
  await expect(vak(page, 7)).toHaveAccessibleName(/^B2: Munt, groeit/)
  await expect(page.locator('[data-voedselbos="zaden"]')).toHaveText("3")
  await expect(page.locator("[data-voedselbos-bericht]")).toHaveText("Munt geplant.")

  // Lente naar zomer: munt is volwassen en draagt.
  await page.clock.runFor(SEIZOEN_MS)
  await expect(page.locator('[data-voedselbos="seizoen"]')).toHaveText("Zomer")
  await expect(page.locator('[data-voedselbos="jaar"]')).toHaveText("1")
  await expect(vak(page, 7)).toHaveAttribute("data-rijp", "")
  await vak(page, 7).click()
  await expect(page.locator('[data-voedselbos="oogst"]')).not.toHaveText("0")
  await expect(page.locator("[data-voedselbos-bericht]")).toContainText("Munt geplukt")
  await expect(vak(page, 7)).not.toHaveAttribute("data-rijp", "")
  await expect(page.locator("[data-voedselbos-doel]")).toContainText("Plant drie lagen")
})

test("voedselbos: te weinig zaden zegt het, en pauze houdt de klok stil", async ({ page }) => {
  await page.clock.install()
  await page.goto(ADRES, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /^Walnoot/ }).click()
  await vak(page, 0).click()
  await expect(vak(page, 0)).toHaveAttribute("data-soort", "")
  await expect(page.locator("[data-voedselbos-bericht]")).toContainText("Te weinig zaden")

  await page.getByRole("button", { name: "Pauze" }).click()
  await page.clock.runFor(SEIZOEN_MS * 3)
  await expect(page.locator('[data-voedselbos="seizoen"]')).toHaveText("Lente")
  await page.getByRole("button", { name: "Volgend seizoen" }).click()
  await expect(page.locator('[data-voedselbos="seizoen"]')).toHaveText("Zomer")
})

test("voedselbos: de stand blijft na herladen, Opnieuw vraagt eerst", async ({ page }) => {
  await page.clock.install()
  await page.goto(ADRES, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /^Klaver/ }).click()
  await vak(page, 14).click()
  await expect(vak(page, 14)).toHaveAttribute("data-soort", "klaver")

  await page.reload({ waitUntil: "networkidle" })
  await expect(vak(page, 14)).toHaveAttribute("data-soort", "klaver")
  await expect(page.locator('[data-voedselbos="zaden"]')).toHaveText("3")

  const opnieuw = page.getByRole("button", { name: "Opnieuw" })
  await opnieuw.click()
  await expect(vak(page, 14)).toHaveAttribute("data-soort", "klaver")
  await page.getByRole("button", { name: "Zeker weten?" }).click()
  await expect(vak(page, 14)).toHaveAttribute("data-soort", "")
  await expect(page.locator('[data-voedselbos="zaden"]')).toHaveText("4")
})

test("voedselbos: een kapotte bewaarde stand geeft een leeg perceel", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gronn-voedselbos", "{kapot"))
  await page.goto(ADRES, { waitUntil: "networkidle" })
  await expect(page.locator("[data-vak]")).toHaveCount(36)
  await expect(page.locator('[data-voedselbos="zaden"]')).toHaveText("4")
})

test("voedselbos: bij minder beweging staat een plantje er meteen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(ADRES, { waitUntil: "networkidle" })
  await vak(page, 20).click()
  const lijn = vak(page, 20).locator("path[pathLength]").first()
  await expect(lijn).toHaveCSS("animation-name", "none")
  await expect(lijn).toHaveCSS("stroke-dashoffset", "0px")
})

for (const thema of ["goldenhour", "bluehour"] as const) {
  test(`404: axe vindt niets (${thema})`, async ({ page }) => {
    await metPalet(page, thema)
    await page.goto(ADRES, { waitUntil: "networkidle" })
    await vak(page, 3).click()
    await page.waitForTimeout(1200)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")
    ).toEqual([])
  })
}

test("404: niet breder dan een telefoon van 320px, vakken groot genoeg", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto(ADRES, { waitUntil: "networkidle" })
  const breedte = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(breedte).toBeLessThanOrEqual(320)
  await expect(vak(page, 0)).toBeVisible()
  const maat = (await vak(page, 0).boundingBox())!
  // WCAG 2.5.8: minstens 24 × 24; hier ruim daarboven.
  expect(Math.min(maat.width, maat.height)).toBeGreaterThanOrEqual(36)
})
