import { expect, test, type Locator, type Page } from "@playwright/test"

import { ZIJ, ZIJ_BOVEN_VRIJ_PX } from "../../src/components/gronn/elementen/zij-kolom"

// De zijkolommen op desktop, in pixels gemeten (eigenaar, 28 sep 2026:
// "knop voor naar boven is uit de maat met de docks"). Rechts staan de
// HemelBubbel en NaarBovenKnop in één kolom: even breed (de ring
// inbegrepen), hetzelfde midden, dezelfde afstand tot de rand, en een
// middenlijn. Verticaal staan beide bubbels in het midden van het scherm
// (eigenaar, 29 sep 2026: "de zijbalken centreren in midden aan de
// randen"), links en rechts op dezelfde middellijn.
// Maten uit `zij-kolom.ts`; dit bestand meet of de pagina ze haalt.

const RECHTS = '[data-element="HemelBubbel"]'
const LINKS = '[data-element="ContactBubbel"]'
const KNOP = '[data-naar-boven="los"]'

/** Afronding van de layout: hooguit een halve pixel. */
const HALF = 0.5

type Vak = { x: number; y: number; width: number; height: number }

async function bereid(page: Page, palet: string, datum = "2026-09-25T12:00:00+02:00") {
  await page.clock.setFixedTime(new Date(datum))
  await page.addInitScript((palet) => {
    if (sessionStorage.getItem("__zk_init")) return
    sessionStorage.setItem("__zk_init", "1")
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
    localStorage.setItem("theme", palet)
    localStorage.setItem("gronn-theme-mode", "manual")
  }, palet)
}

/** Het vak zodra de overgang (opacity/translate) klaar is: twee keer dezelfde meting. */
async function rustig(l: Locator): Promise<Vak> {
  let vorige = ""
  let vak: Vak | null = null
  await expect
    .poll(async () => {
      vak = await l.boundingBox()
      const nu = JSON.stringify(vak)
      const klaar = nu === vorige && (await l.evaluate((el) => getComputedStyle(el).opacity)) === "1"
      vorige = nu
      return klaar
    }, { intervals: [150], timeout: 5000 })
    .toBe(true)
  return vak!
}

async function omlaag(page: Page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6))
  await expect(page.locator(KNOP)).not.toHaveAttribute("inert", /.*/)
}

const midden = (v: Vak) => v.x + v.width / 2
const rechts = (page: Page, v: Vak) => page.viewportSize()!.width - (v.x + v.width)
const onder = (page: Page, v: Vak) => page.viewportSize()!.height - (v.y + v.height)
const overlapt = (a: Vak, b: Vak) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

test.describe("zijkant: bubbels en naar-bovenknop in één kolom", () => {
  test.skip(({ isMobile }) => !!isMobile, "alleen desktop; de telefoon heeft de dock")

  for (const breed of [1024, 1280, 1440, 1920, 2000]) {
    for (const hoog of [800, 1000]) {
      for (const palet of ["goldenhour", "bluehour"] as const) {
        test(`${breed} × ${hoog}, ${palet === "goldenhour" ? "Licht" : "Donker"}`, async ({ page }) => {
          await page.setViewportSize({ width: breed, height: hoog })
          await bereid(page, palet)
          await page.goto("/nl")
          await page.waitForLoadState("networkidle")
          await expect(page.locator("html")).toHaveClass(new RegExp(palet))
          await omlaag(page)

          // De knop: 44 × 44 met de ring erin, op de rand van de kolom.
          const knop = await rustig(page.locator(KNOP))
          const ring = (await page.locator(`${KNOP} svg[data-ring]`).boundingBox())!
          expect(knop.width).toBe(ZIJ.breedte)
          expect(knop.height).toBe(ZIJ.breedte)
          expect(Math.abs(ring.x - knop.x)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(ring.y - knop.y)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(ring.width - knop.width)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(ring.height - knop.height)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(rechts(page, knop) - ZIJ.rand)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(onder(page, knop) - ZIJ.rand)).toBeLessThanOrEqual(HALF)

          // Aanklikbaar over de volle 44: vier punten net binnen de rand.
          const raak = await page.evaluate(
            ({ v, sel }) => {
              const k = document.querySelector(sel)
              const cx = v.x + v.width / 2, cy = v.y + v.height / 2, r = v.width / 2 - 1
              return [[cx - r, cy], [cx + r, cy], [cx, cy - r], [cx, cy + r]].every(([x, y]) => {
                const e = document.elementFromPoint(x, y)
                return !!e && (e === k || k!.contains(e))
              })
            },
            { v: knop, sel: KNOP }
          )
          expect(raak).toBe(true)

          if (breed < 1280) {
            // Onder xl geen bubbels; de knop staat alleen in de hoek.
            await expect(page.locator(RECHTS)).toBeHidden()
            await expect(page.locator(LINKS)).toBeHidden()
            return
          }

          // Rechts: september past bij 800 en 1000 hoog helemaal.
          await expect(page.locator(RECHTS)).toHaveAttribute("data-stand", "vol")
          await expect(page.locator(RECHTS)).not.toHaveAttribute("inert", /.*/)
          const bubbel = await rustig(page.locator(RECHTS))

          // Even breed, hetzelfde midden, dezelfde rand: afwijking 0.
          expect(Math.abs(bubbel.width - knop.width)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(midden(bubbel) - midden(knop))).toBeLessThanOrEqual(HALF)
          expect(Math.abs(rechts(page, bubbel) - rechts(page, knop))).toBeLessThanOrEqual(HALF)

          // Verticaal in het midden: boven even veel lucht als onder.
          expect(Math.abs(bubbel.y - onder(page, bubbel))).toBeLessThanOrEqual(1)

          // Geen overlap: niet met de knop (minstens de tussenmaat erboven),
          // niet met de kopbalk.
          expect(overlapt(bubbel, knop)).toBe(false)
          expect(knop.y - (bubbel.y + bubbel.height)).toBeGreaterThanOrEqual(ZIJ.tussen - HALF)
          expect(bubbel.y).toBeGreaterThanOrEqual(ZIJ_BOVEN_VRIJ_PX - HALF)

          // Links: dezelfde kolom gespiegeld, op dezelfde middellijn.
          await expect(page.locator(LINKS)).not.toHaveAttribute("inert", /.*/)
          const contact = await rustig(page.locator(LINKS))
          expect(Math.abs(contact.width - ZIJ.breedte)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(contact.x - ZIJ.rand)).toBeLessThanOrEqual(HALF)
          expect(Math.abs(midden(contact) - (breed - midden(bubbel)))).toBeLessThanOrEqual(HALF)
          expect(Math.abs(contact.y + contact.height / 2 - (bubbel.y + bubbel.height / 2))).toBeLessThanOrEqual(1)
          expect(Math.abs(contact.y - onder(page, contact))).toBeLessThanOrEqual(1)
          expect(contact.y).toBeGreaterThanOrEqual(ZIJ_BOVEN_VRIJ_PX - HALF)
        })
      }
    }
  }

  test("een lange kalenderregel op 800 hoog: zonder tekst, nooit over de knop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 })
    await bereid(page, "goldenhour", "2026-06-15T12:00:00+02:00")
    await page.goto("/en")
    await page.waitForLoadState("networkidle")
    await omlaag(page)
    const r = page.locator(RECHTS)
    const stand = await r.getAttribute("data-stand")
    expect(["vol", "kort"]).toContain(stand)
    // Schermlezers houden de regel, ook als hij uit beeld gaat.
    await expect(r.locator('[data-hemel="kalender"]')).toContainText("fish blanket weed")
    const bubbel = await rustig(r)
    const knop = await rustig(page.locator(KNOP))
    expect(overlapt(bubbel, knop)).toBe(false)
    expect(knop.y - (bubbel.y + bubbel.height)).toBeGreaterThanOrEqual(ZIJ.tussen - HALF)
    expect(bubbel.y).toBeGreaterThanOrEqual(ZIJ_BOVEN_VRIJ_PX - HALF)
  })

  test("te laag voor de bubbel: hij gaat weg, de knop blijft", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 400 })
    await bereid(page, "bluehour")
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await omlaag(page)
    for (const sel of [RECHTS, LINKS]) {
      await expect(page.locator(sel)).toHaveAttribute("data-stand", "weg")
      await expect(page.locator(sel)).toHaveAttribute("inert", "")
      await expect(page.locator(sel)).toHaveCSS("opacity", "0")
    }
    await expect(page.getByRole("button", { name: "Omhoog" })).toBeVisible()

    // Weer hoog genoeg: terug, vol.
    await page.setViewportSize({ width: 1440, height: 1000 })
    await expect(page.locator(RECHTS)).toHaveAttribute("data-stand", "vol")
    await expect(page.locator(RECHTS)).not.toHaveAttribute("inert", /.*/)
  })

  test("de ring loopt nog vol in de kleinere knop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 })
    await bereid(page, "goldenhour")
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    const cirkel = page.locator(`${KNOP} svg[data-ring] circle`)
    const offset = () => cirkel.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset))
    expect(await offset()).toBeGreaterThan(98)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect.poll(offset).toBeLessThan(2)
  })

})
