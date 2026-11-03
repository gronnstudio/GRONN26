import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

import { BEGRIPPEN, CIJFERS, HOOFDSTUKKEN } from "@/lib/data/vijverrenovatie"

// Begrip (eigenaar, 25 sep 2026: "Bouw ze"): een vakterm met een
// stippellijn; een tik opent een kaartje met de uitleg. De uitleg komt
// letterlijk uit de projecttekst zelf, en het woord staat alleen waar die
// uitleg er NIET naast staat — "Het project in cijfers" — want anders
// herhaalt het kaartje de zin die de lezer net las (review 25 sep 2026).

const PROJECT = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"
// De Feitenlijst, na de CijferRij in dezelfde sectie.
const TABEL = 'article section[aria-labelledby="cijfers"] > dl:last-of-type'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("gronn-intro", "1")
    // Onafhankelijk van de poort: de app-melding hoort hier niet in beeld.
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
  })
})

const bronTekst = (id: string) => HOOFDSTUKKEN.find((h) => h.id === id)!.alineas.join(" ")
// Alleen de rand mag afwijken: een hoofdletter vooraan, een punt achteraan.
const kern = (s: string) => s.replace(/[.;:]$/, "").replace(/^./, (c) => c.toLowerCase())

test("elke uitleg staat letterlijk in zijn eigen hoofdstuk, het woord in de cijfers zonder die uitleg", () => {
  expect(BEGRIPPEN.length).toBeGreaterThanOrEqual(3)
  for (const b of BEGRIPPEN) {
    const bron = bronTekst(b.bron)
    const zacht = bron.replace(/(^|[.;:]\s+)(\p{Lu})/gu, (_, voor: string, c: string) => voor + c.toLowerCase())
    expect(bron.includes(kern(b.uitleg)) || zacht.includes(kern(b.uitleg)), `${b.term}: "${b.uitleg}"`).toBe(true)
    const waarde = CIJFERS.map(([, v]) => v).find((v) => v.includes(b.woord))
    expect(waarde, `${b.woord} staat in CIJFERS`).toBeTruthy()
    expect(waarde!.toLowerCase(), b.term).not.toContain(kern(b.uitleg).toLowerCase())
  }
})

async function openKaart(page: Page, knop: Locator) {
  await knop.evaluate((el) => el.scrollIntoView({ block: "center" }))
  await knop.click()
  const id = await knop.getAttribute("aria-controls")
  const kaart = page.locator(`#${id}`)
  await expect(kaart).toBeVisible()
  expect(await kaart.evaluate((el) => el.matches(":popover-open"))).toBe(true)
  return kaart
}

test("de begrippen zijn knoppen met een stippellijn in de cijfers, één keer per woord", async ({ page }) => {
  await page.goto(PROJECT)
  await expect(page.locator("article button[data-begrip]")).toHaveCount(BEGRIPPEN.length)
  await expect(page.locator(`${TABEL} dd button[data-begrip]`)).toHaveCount(BEGRIPPEN.length)
  for (const b of BEGRIPPEN) {
    const knop = page.locator(`${TABEL} button[data-begrip="${b.term}"]`)
    await expect(knop, b.term).toHaveCount(1)
    await expect(knop).toHaveText(b.woord)
    await expect(knop).toHaveAttribute("type", "button")
    await expect(knop).toHaveAttribute("aria-expanded", "false")
    const stijl = await knop.evaluate((el) => {
      const s = getComputedStyle(el)
      return { lijn: s.textDecorationLine, soort: s.textDecorationStyle }
    })
    expect(stijl, b.term).toEqual({ lijn: "underline", soort: "dotted" })
  }
})

test("een gemarkeerd woord staat nooit in dezelfde alinea als zijn uitleg", async ({ page }) => {
  await page.goto(PROJECT)
  // Geen enkel Begrip in de lopende tekst van de hoofdstukken of in een kop.
  await expect(page.locator("article section[id] p button[data-begrip]")).toHaveCount(0)
  await expect(page.locator("article :is(h1, h2, h3) button[data-begrip]")).toHaveCount(0)
  for (const b of BEGRIPPEN) {
    const blok = await page
      .locator(`article button[data-begrip="${b.term}"]`)
      .evaluate((el) => (el.closest("p, dd, li, td, figcaption") as HTMLElement).innerText)
    expect(blok.toLowerCase(), b.term).not.toContain(kern(b.uitleg).toLowerCase())
  }
})

test("de tekst in de cijfers blijft letter voor letter gelijk, en de regel verschuift niet", async ({ page }) => {
  await page.goto(PROJECT)
  const zichtbaar = await page.locator(`${TABEL} dd`).evaluateAll((dds) => dds.map((d) => (d as HTMLElement).innerText))
  expect(zichtbaar).toEqual(CIJFERS.map(([, v]) => v))
  // Niet hoger dan één regel: de knop duwt de regels niet uit elkaar.
  const maten = await page.locator("article button[data-begrip]").evaluateAll((ks) =>
    ks.map((k) => ({ h: k.getBoundingClientRect().height, regel: parseFloat(getComputedStyle(k.closest("dd")!).lineHeight) }))
  )
  for (const m of maten) expect(m.h).toBeLessThanOrEqual(m.regel + 1)
})

test("klik opent de uitleg, Escape sluit hem en de focus blijft op het woord", async ({ page }) => {
  await page.goto(PROJECT)
  for (const b of BEGRIPPEN) {
    const knop = page.locator(`article button[data-begrip="${b.term}"]`)
    const kaart = await openKaart(page, knop)
    await expect(kaart).toContainText(b.uitleg)
    await expect(kaart).toContainText("Begrip")
    await expect(kaart).toHaveAttribute("role", "note")
    await expect(knop).toHaveAttribute("aria-expanded", "true")
    await page.keyboard.press("Escape")
    await expect(kaart).toBeHidden()
    await expect(knop).toHaveAttribute("aria-expanded", "false")
    await expect(knop).toBeFocused()
  }
})

test("Enter opent, Sluiten sluit, en een tweede begrip sluit het eerste", async ({ page }) => {
  await page.goto(PROJECT)
  const [a, z] = [BEGRIPPEN[0], BEGRIPPEN[1]]
  const knopA = page.locator(`article button[data-begrip="${a.term}"]`)
  const knopZ = page.locator(`article button[data-begrip="${z.term}"]`)
  await knopA.evaluate((el) => el.scrollIntoView({ block: "center" }))
  await knopA.focus()
  await page.keyboard.press("Enter")
  const kaartA = page.locator(`#${await knopA.getAttribute("aria-controls")}`)
  await expect(kaartA).toBeVisible()
  await expect(knopA).toHaveAttribute("aria-expanded", "true")

  // De knop "Sluiten" in de kaart; de focus gaat terug naar het woord.
  await kaartA.getByRole("button", { name: "Sluiten" }).click()
  await expect(kaartA).toBeHidden()
  await expect(knopA).toBeFocused()

  const kaartZ = await openKaart(page, knopZ)
  await expect(kaartZ).toContainText(z.uitleg)
  await openKaart(page, knopA)
  await expect(kaartZ).toBeHidden()
  await expect(knopZ).toHaveAttribute("aria-expanded", "false")
})

test("het raakvlak is 44px hoog zonder de tekst te verschuiven", async ({ page }) => {
  await page.goto(PROJECT)
  const knop = page.locator(`article button[data-begrip="Bypass"]`)
  await knop.evaluate((el) => el.scrollIntoView({ block: "center" }))
  const raak = await knop.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const treft = (dy: number, dx = 0) => document.elementFromPoint(x + dx, y + dy) === el
    return { boven: treft(-21), onder: treft(21), links: treft(0, -21), rechts: treft(0, 21) }
  })
  expect(raak).toEqual({ boven: true, onder: true, links: true, rechts: true })
})

test("desktop: de kaart staat bij het woord, binnen het scherm", async ({ page, isMobile }) => {
  test.skip(isMobile, "op de telefoon staat de kaart onderin")
  await page.goto(PROJECT)
  for (const b of BEGRIPPEN) {
    const knop = page.locator(`article button[data-begrip="${b.term}"]`)
    const kaart = await openKaart(page, knop)
    const k = (await knop.boundingBox())!
    const c = (await kaart.boundingBox())!
    const vp = page.viewportSize()!
    // Eronder (of erboven als er geen plek is), met 8px lucht.
    const eronder = Math.abs(c.y - (k.y + k.height) - 8) <= 2
    const erboven = Math.abs(k.y - (c.y + c.height) - 8) <= 2
    expect(eronder || erboven, `${b.term}: kaart ${c.y}, woord ${k.y}`).toBe(true)
    expect(c.width).toBeLessThanOrEqual(320)
    expect(c.x).toBeGreaterThanOrEqual(0)
    expect(c.x + c.width).toBeLessThanOrEqual(vp.width)
    await page.keyboard.press("Escape")
  }
})

for (const breedte of [320, 375]) {
  test(`telefoon ${breedte}px: de kaart staat boven de dock en binnen het scherm`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "de dock bestaat alleen onder md")
    await page.setViewportSize({ width: breedte, height: 740 })
    await page.goto(PROJECT, { waitUntil: "networkidle" })
    for (const b of BEGRIPPEN) {
      const knop = page.locator(`article button[data-begrip="${b.term}"]`)
      const kaart = await openKaart(page, knop)
      const c = (await kaart.boundingBox())!
      const dock = (await page.locator('nav[data-nav="dock"]').boundingBox())!
      expect(c.y + c.height, `${b.term}: onderkant kaart vs dock`).toBeLessThanOrEqual(dock.y)
      expect(c.y).toBeGreaterThanOrEqual(0)
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.x + c.width).toBeLessThanOrEqual(breedte)
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
      expect(sw, b.term).toBeLessThanOrEqual(iw)
      // Buiten de kaart tikken sluit hem (light dismiss). In de zijmarge
      // van 24px, waar geen link of knop staat.
      await page.mouse.click(6, 300)
      await expect(kaart).toBeHidden()
      await expect(knop).toHaveAttribute("aria-expanded", "false")
    }
  })
}

test("axe: geen fouten met een geopende kaart, geen zijwaartse overloop", async ({ page }) => {
  await page.goto(PROJECT, { waitUntil: "networkidle" })
  const knop = page.locator(`article button[data-begrip="${BEGRIPPEN[0].term}"]`)
  await openKaart(page, knop)
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
  expect(sw).toBeLessThanOrEqual(iw)
  const res = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
})
