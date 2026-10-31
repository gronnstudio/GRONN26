import { expect, test, type Locator, type Page } from "@playwright/test"

import { BUSINESS } from "../../src/lib/business"
import { SEIZOEN } from "../../src/lib/data/seizoen"

// De zijbubbels op desktop (eigenaar, 27 sep 2026: "we hebben links en
// rechts op desktop plek zat, maak zoals in de oude site whatsapp en
// instagram links in een bubbel, en de kalender in een rechterbubbel plus
// de maan zon"). Alleen vanaf xl (1280): het desktopproject hier is 1280
// breed, de telefoon ziet ze niet.

const LINKS = '[data-element="ContactBubbel"]'
const RECHTS = '[data-element="HemelBubbel"]'

async function metOpslag(page: Page, items: Record<string, string> = {}) {
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("__zb_init")) return
    sessionStorage.setItem("__zb_init", "1")
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
    // Geen openingsdoek: dat ligt in de Blauwe Uur 2,45 s over de pagina
    // (lijnlogo, #215) en een pixelmeting zou het doek meten.
    sessionStorage.setItem("gronn-intro", "1")
    for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v)
  }, items)
}

async function naar(page: Page, schermen: number) {
  await page.evaluate((n) => window.scrollTo(0, window.innerHeight * n), schermen)
  await page.waitForTimeout(700)
}

/** WCAG-verhouding van het donkerste/lichtste punt in `doel` tegen de meest voorkomende kleur eromheen (zie dock-contrast.spec.ts). */
async function meet(page: Page, doel: Locator, ringPx = 3) {
  const v = (await doel.boundingBox())!
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  const shot = (await page.screenshot()).toString("base64")
  return page.evaluate(
    async ({ shot, v, dpr, ringPx }) => {
      const img = new Image()
      img.src = "data:image/png;base64," + shot
      await img.decode()
      const c = document.createElement("canvas")
      c.width = img.width
      c.height = img.height
      const g = c.getContext("2d")!
      g.drawImage(img, 0, 0)
      const lum = (px: number[]) => {
        const f = (x: number) => {
          const s = x / 255
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(px[0]) + 0.7152 * f(px[1]) + 0.0722 * f(px[2])
      }
      const X = Math.round(v.x * dpr), Y = Math.round(v.y * dpr)
      const W = Math.round(v.width * dpr), H = Math.round(v.height * dpr)
      const PAD = Math.round(ringPx * dpr)
      const buiten = g.getImageData(X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2)
      const tel = new Map<string, number>()
      for (let yy = 0; yy < buiten.height; yy++)
        for (let xx = 0; xx < buiten.width; xx++) {
          if (xx >= PAD && xx < PAD + W && yy >= PAD && yy < PAD + H) continue
          const i = (yy * buiten.width + xx) * 4
          const k = `${buiten.data[i]},${buiten.data[i + 1]},${buiten.data[i + 2]}`
          tel.set(k, (tel.get(k) ?? 0) + 1)
        }
      let grond = [0, 0, 0], max = 0
      for (const [k, n] of tel) if (n > max) { max = n; grond = k.split(",").map(Number) }
      const binnen = g.getImageData(X, Y, W, H).data
      let lijn = grond, verst = 0
      for (let i = 0; i < binnen.length; i += 4) {
        const px = [binnen[i], binnen[i + 1], binnen[i + 2]]
        const d = Math.abs(lum(px) - lum(grond))
        if (d > verst) { verst = d; lijn = px }
      }
      const [hi, lo] = [lum(lijn), lum(grond)].sort((a, b) => b - a)
      return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2))
    },
    { shot, v, dpr, ringPx }
  )
}

test.describe("zijbubbels, desktop", () => {
  test.skip(({ isMobile }) => !!isMobile, "alleen vanaf xl")

  test("pas na de opening, links en rechts in de zijkolom, met de echte links", async ({ page }) => {
    // Hoog genoeg voor de hele kalenderregel; lager gaat hij sr-only (zijkant-uitlijning.spec.ts).
    await page.setViewportSize({ width: 1280, height: 900 })
    await metOpslag(page)
    await page.clock.setFixedTime(new Date("2026-09-25T12:00:00+02:00"))
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await expect(page.locator(LINKS)).toHaveAttribute("inert", "")
    await expect(page.locator(RECHTS)).toHaveAttribute("inert", "")

    await naar(page, 1.5)
    const links = page.locator(LINKS)
    const rechts = page.locator(RECHTS)
    await expect(links).not.toHaveAttribute("inert", /.*/)
    await expect(rechts).not.toHaveAttribute("inert", /.*/)

    const vp = page.viewportSize()!
    const l = (await links.boundingBox())!
    const r = (await rechts.boundingBox())!
    // Links en rechts in de marge, niet over de tekstkolom (64px vanaf xl).
    expect(l.x).toBeGreaterThanOrEqual(8)
    expect(l.x + l.width).toBeLessThanOrEqual(64)
    expect(vp.width - r.x).toBeLessThanOrEqual(64)
    expect(vp.width - (r.x + r.width)).toBeGreaterThanOrEqual(8)
    // Verticaal in het midden, links en rechts op dezelfde middellijn
    // (eigenaar, 29 sep 2026; de volle meting staat in zijkant-uitlijning.spec.ts).
    expect(Math.abs(l.y + l.height / 2 - vp.height / 2)).toBeLessThanOrEqual(1)
    expect(Math.abs(r.y + r.height / 2 - vp.height / 2)).toBeLessThanOrEqual(1)

    const wa = links.getByRole("link", { name: /WhatsApp/ })
    const ig = links.getByRole("link", { name: /Instagram/ })
    await expect(wa).toHaveAttribute("href", BUSINESS.whatsapp)
    await expect(ig).toHaveAttribute("href", BUSINESS.instagram)
    await expect(wa).toHaveAttribute("target", "_blank")
    // Een zichtbaar label, niet alleen een icoon (ontwerpregel 1).
    await expect(wa).toContainText("WhatsApp")
    await expect(ig).toContainText("Instagram")

    await expect(rechts.locator('[data-hemel="kalender"]')).toContainText(SEIZOEN[9]!.nl)
    await expect(rechts.locator('[data-hemel="zon"]')).toContainText(/Zon op \d\d:\d\d, onder \d\d:\d\d/)
    await expect(rechts.locator('[data-hemel="zon"] [data-zon]')).toBeAttached()
    await expect(rechts.locator('[data-hemel="maan"]')).toContainText(/\d+ %/)

    // Elke pil is één liggende regel met meedraaiende iconen (eigenaar,
    // 28 sep 2026: "turn the icon with it", daarna "whatsapp en instagram
    // links is perfect, maar voor de rechterkant draai 180 graden").
    // Links: tekst 180° op vertical-rl, iconen -90°, icoon onder zijn woord,
    // WhatsApp onderaan — van onder naar boven. Rechts precies andersom:
    // tekst niet gedraaid, iconen +90°, icoon boven zijn woord, de kalender
    // bovenaan — van boven naar onder.
    const midden = async (l: Locator) => {
      const b = (await l.boundingBox())!
      return b.y + b.height / 2
    }
    const draai = (l: Locator) => l.evaluate((el) => getComputedStyle(el).rotate)
    const woord = (groep: Locator) => groep.locator(":scope > span:not(.sr-only):not([data-icoon])").last()
    for (const groep of [wa, ig]) {
      expect(await draai(woord(groep))).toBe("180deg")
      expect(await woord(groep).evaluate((el) => getComputedStyle(el).writingMode)).toBe("vertical-rl")
      expect(await draai(groep.locator("[data-icoon]"))).toBe("-90deg")
      expect(await midden(groep.locator("[data-icoon]"))).toBeGreaterThan(await midden(woord(groep)))
    }
    expect(await midden(wa)).toBeGreaterThan(await midden(ig))
    const hemel = (h: string) => rechts.locator(`[data-hemel="${h}"]`)
    for (const groep of ["kalender", "zon", "maan"].map(hemel)) {
      expect(await draai(woord(groep))).toBe("none")
      expect(await woord(groep).evaluate((el) => getComputedStyle(el).writingMode)).toBe("vertical-rl")
      expect(await draai(groep.locator("[data-icoon]"))).toBe("90deg")
      expect(await midden(groep.locator("[data-icoon]"))).toBeLessThan(await midden(woord(groep)))
    }
    expect(await midden(hemel("kalender"))).toBeLessThan(await midden(hemel("maan")))
  })

  test("ze gaan opzij zolang de voet in beeld is", async ({ page }) => {
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await page.locator("footer").scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    await expect(page.locator(LINKS)).toHaveAttribute("inert", "")
    await expect(page.locator(RECHTS)).toHaveAttribute("inert", "")
  })

  test("vanaf xl staan maan, zon en kalender niet meer in de voet", async ({ page }) => {
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await page.locator("footer").scrollIntoViewIfNeeded()
    for (const el of ["Maanfase", "Zonneboog", "Seizoenszaadje"]) {
      await expect(page.locator(`footer [data-element="${el}"]`)).toBeHidden()
    }
  })

  for (const palet of ["goldenhour", "bluehour"] as const) {
    test(`labels op het glas ≥ 4,5:1 (${palet})`, async ({ page }) => {
      // Hoog genoeg voor de hele kalenderregel (onder ~730 gaat hij sr-only).
      await page.setViewportSize({ width: 1280, height: 900 })
      await metOpslag(page, { theme: palet, "gronn-theme-mode": "manual" })
      await page.goto("/nl")
      await page.waitForLoadState("networkidle")
      for (const schermen of [1.5, 2.5]) {
        await naar(page, schermen)
        const teksten = [
          page.locator(`${LINKS} a`).nth(0).locator("span").nth(1),
          page.locator(`${LINKS} a`).nth(1).locator("span").nth(1),
          page.locator(`${RECHTS} [data-hemel="kalender"] span`).first(),
          page.locator(`${RECHTS} [data-hemel="maan"] span[aria-hidden]`),
        ]
        for (const [i, el] of teksten.entries()) {
          expect(await meet(page, el), `tekst ${i}, ${schermen} schermen`).toBeGreaterThanOrEqual(4.5)
        }
      }
    })
  }
})

test("telefoon: geen zijbubbels", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon")
  await metOpslag(page)
  await page.goto("/nl")
  await page.waitForLoadState("networkidle")
  await naar(page, 1.5)
  await expect(page.locator(LINKS)).toBeHidden()
  await expect(page.locator(RECHTS)).toBeHidden()
})
