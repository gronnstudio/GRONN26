import { expect, test, type Page } from "@playwright/test"

// De uitlijnronde van 28 sep 2026. De eigenaar vond op een breed scherm
// dat het logo en de knoppenpil niet op de paginabreedte stonden, dat het
// megamenu tegen de balk plakte en breder was dan de pagina, dat de
// veelgestelde vragen op twee derde stopten, dat het portret uit de lijn
// stond, dat de tekst in de voet ongelijke lucht had en dat het
// Studio-menu twee markeerkleuren had. Allemaal op het oog "bijna goed",
// en daarom hier in pixels.
//
// De paginabreedte is BREEDTE (src/components/gronn/elementen/breedte.tsx):
// een raster van hooguit 1280px, met 24px marge onder lg en 64px vanaf lg.

test.skip(({ isMobile }) => !!isMobile, "de balk, het megamenu en de tweekoloms-indeling zijn desktop")

const BREEDTES = [1024, 1280, 1440, 1920, 2000]
/** Een pagina met de gewone balk (home heeft de pil). */
const BINNENPAGINA = "/nl/services"

/** De binnenkant van BREEDTE bij een schermbreedte, zoals de CSS hem rekent. */
function raster(w: number) {
  const marge = w >= 1024 ? 64 : 24
  const binnen = Math.min(w - 2 * marge, 1280)
  const links = (w - binnen) / 2
  return { links, rechts: links + binnen }
}

async function open(page: Page, w: number, pad = "/nl") {
  await page.setViewportSize({ width: w, height: 900 })
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
  await page.goto(pad, { waitUntil: "networkidle" })
}

const rand = async (page: Page, sel: string) => {
  const box = await page.locator(`${sel} >> visible=true`).first().boundingBox()
  expect(box, `${sel} staat niet in beeld`).not.toBeNull()
  return box!
}

for (const w of BREEDTES) {
  test.describe(`${w}px breed`, () => {
    // De balk op de paginabreedte geldt op elke pagina BEHALVE home: daar
    // zweeft sinds 29 sep 2026 de menupil in het midden over de foto
    // (VolleOpening). Dus hier gemeten op /nl/services.
    test("logo en knoppenpil staan op de lijnen van de pagina", async ({ page }) => {
      await open(page, w, BINNENPAGINA)
      const { links, rechts } = raster(w)
      const logo = await rand(page, "header [data-woordmerk] img")
      expect(Math.abs(logo.x - links), `logo links ${logo.x} ≠ ${links}`).toBeLessThanOrEqual(1)
      const pil = await rand(page, "header .glass.rounded-full")
      expect(Math.abs(pil.x + pil.width - rechts), `pil rechts ${pil.x + pil.width} ≠ ${rechts}`).toBeLessThanOrEqual(1)
      // En de pagina zelf staat op dezelfde lijnen.
      const kop = await rand(page, "main h1")
      expect(Math.abs(kop.x - links)).toBeLessThanOrEqual(1)
    })

    test("home: de menupil in het midden, 16px van boven, de kop op de linkerlijn", async ({ page }) => {
      await open(page, w)
      const { links } = raster(w)
      const pil = await rand(page, "header [data-pil]")
      expect(Math.abs(pil.x + pil.width / 2 - w / 2), `pil midden ${pil.x + pil.width / 2} ≠ ${w / 2}`).toBeLessThanOrEqual(1)
      expect(Math.round(pil.y)).toBe(16)
      expect(Math.round(pil.height)).toBe(60)
      // Het hele menu in de pil: logo, de secties, de CTA en de schakelaars.
      for (const sel of ["[data-woordmerk] img", "button[aria-controls='bar-panel-services']", "a[href$='/contact']", "button[aria-label='Zoek op deze site']"]) {
        const b = await rand(page, `header [data-pil] ${sel}`)
        expect(b.x).toBeGreaterThanOrEqual(pil.x)
        expect(b.x + b.width).toBeLessThanOrEqual(pil.x + pil.width)
      }
      // Geen kopruimte: de foto begint op de bovenkant van het scherm.
      const opening = (await page.locator("[data-element='VolleOpening']").boundingBox())!
      expect(opening.y).toBe(0)
      expect(Math.round(opening.height)).toBeGreaterThanOrEqual(900)
      const kop = await rand(page, "main h1")
      expect(Math.abs(kop.x - links)).toBeLessThanOrEqual(1)
      // Ook na het scrollen blijft het de pil (geen balk op de paginabreedte).
      await page.evaluate(() => window.scrollTo(0, 1200))
      await page.waitForTimeout(400)
      const later = await rand(page, "header [data-pil]")
      expect(Math.abs(later.x - pil.x)).toBeLessThanOrEqual(1)
      expect(Math.round(later.y)).toBe(16)
    })

    test("het megamenu: 16px lucht, op de paginabreedte, en de lucht houdt het open", async ({ page }) => {
      await open(page, w, BINNENPAGINA)
      const { links, rechts } = raster(w)
      const knop = page.locator("header button[aria-controls='bar-panel-services']")
      const k = (await knop.boundingBox())!
      await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2)
      const paneel = page.locator("#bar-panel-services > div > div > div:not([data-menu-brug])")
      await expect(paneel).toBeVisible()
      await page.waitForTimeout(400) // de openingsbeweging
      const p = (await paneel.boundingBox())!
      const balk = (await page.locator("header > div").first().boundingBox())!
      expect(Math.round(p.y - (balk.y + balk.height)), "lucht tussen balk en paneel").toBe(16)
      expect(Math.abs(p.x - links)).toBeLessThanOrEqual(1)
      expect(Math.abs(p.x + p.width - rechts)).toBeLessThanOrEqual(1)

      // Midden in de lucht blijven hangen, langer dan de sluittijd: open.
      await page.mouse.move(k.x + k.width / 2, balk.y + balk.height + 8, { steps: 4 })
      await page.waitForTimeout(600)
      await expect(paneel).toBeVisible()
      // En door naar het paneel: nog steeds open.
      await page.mouse.move(k.x + k.width / 2, p.y + 40, { steps: 4 })
      await page.waitForTimeout(400)
      await expect(paneel).toBeVisible()
    })

    test("home: het megamenu uit de pil, op de paginabreedte, en de lucht houdt het open", async ({ page }) => {
      await open(page, w)
      const { links, rechts } = raster(w)
      const knop = page.locator("header [data-pil] button[aria-controls='bar-panel-services']")
      const k = (await knop.boundingBox())!
      await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2)
      const paneel = page.locator("#bar-panel-services > div > div > div:not([data-menu-brug])")
      await expect(paneel).toBeVisible()
      await page.waitForTimeout(400)
      const p = (await paneel.boundingBox())!
      const pil = (await page.locator("header [data-pil]").boundingBox())!
      expect(p.y, "het paneel hangt onder de pil").toBeGreaterThan(pil.y + pil.height)
      expect(Math.abs(p.x - links)).toBeLessThanOrEqual(1)
      expect(Math.abs(p.x + p.width - rechts)).toBeLessThanOrEqual(1)
      await page.mouse.move(k.x + k.width / 2, (pil.y + pil.height + p.y) / 2, { steps: 4 })
      await page.waitForTimeout(600)
      await expect(paneel).toBeVisible()
      await page.mouse.move(k.x + k.width / 2, p.y + 40, { steps: 4 })
      await page.waitForTimeout(400)
      await expect(paneel).toBeVisible()
    })

    test("veelgestelde vragen tot de rechterlijn, portret op de linkerlijn", async ({ page }) => {
      await open(page, w)
      const { links, rechts } = raster(w)
      await page.locator("#vragen").scrollIntoViewIfNeeded()
      const lijst = await rand(page, "[data-vragen-lijst]")
      expect(Math.abs(lijst.x + lijst.width - rechts), `vragen rechts ${lijst.x + lijst.width} ≠ ${rechts}`).toBeLessThanOrEqual(1)
      const kop = await rand(page, "#vragen-kop")
      expect(Math.abs(kop.x - links)).toBeLessThanOrEqual(1)
      // Twee kolommen: de vragen staan naast de kop, niet eronder.
      expect(lijst.x).toBeGreaterThan(kop.x + 200)

      await page.locator("#nick-kop").scrollIntoViewIfNeeded()
      const portret = await rand(page, "section[aria-labelledby='nick-kop'] img")
      // Het beeld schuift mee (parallax) maar alleen verticaal.
      const kader = await page.locator("section[aria-labelledby='nick-kop'] img").first().evaluate((img) => {
        let el: HTMLElement | null = img as HTMLElement
        while (el && el.parentElement && !el.parentElement.matches("section > div")) el = el.parentElement
        return el!.getBoundingClientRect().left
      })
      expect(Math.abs(kader - links), `portret links ${kader} ≠ ${links}`).toBeLessThanOrEqual(1)
      expect(portret.width).toBeGreaterThan(0)
    })

    test("/faq: de vragen op de linkerlijn, het zijvlak tot de rechterlijn", async ({ page }) => {
      // Eigenaar, 29 sep 2026: "voor FAQ gebruik je maar 2/3 van de
      // plek, waarom?" De lijst stond op 880px met een leeg derde rechts.
      await open(page, w, "/nl/faq")
      const { links, rechts } = raster(w)
      const lijst = await rand(page, "[data-vragen-lijst]")
      expect(Math.abs(lijst.x - links), `vragen links ${lijst.x} ≠ ${links}`).toBeLessThanOrEqual(1)
      const zij = await rand(page, "[data-vragen-zij]")
      expect(Math.abs(zij.x + zij.width - rechts), `zijvlak rechts ${zij.x + zij.width} ≠ ${rechts}`).toBeLessThanOrEqual(1)
      // Twee kolommen vanaf lg: het zijvlak staat naast de vragen, niet eronder.
      expect(zij.x).toBeGreaterThan(lijst.x + lijst.width)
    })

    test("de voet: tekst en knoppen met evenveel lucht boven als onder", async ({ page }) => {
      await open(page, w)
      await page.locator("footer").scrollIntoViewIfNeeded()
      const voet = (await page.locator("footer").boundingBox())!
      const cta = await rand(page, "[data-voet-cta]")
      const tekst = await rand(page, "[data-voet-cta] > p")
      const knoppen = await rand(page, "[data-voet-cta] > div")
      const binnenBoven = voet.y + 1 // de rand van 1px
      const binnenOnder = cta.y + cta.height - 1 // de scheidingslijn
      const boven = (b: { y: number }) => b.y - binnenBoven
      const onder = (b: { y: number; height: number }) => binnenOnder - (b.y + b.height)
      expect(Math.abs(boven(knoppen) - onder(knoppen)), `knoppen ${boven(knoppen)} / ${onder(knoppen)}`).toBeLessThanOrEqual(2)
      expect(Math.abs(boven(tekst) - onder(tekst)), `tekst ${boven(tekst)} / ${onder(tekst)}`).toBeLessThanOrEqual(2)
    })
  })
}

test("het Studio-menu: cijfers en pijlen in één kleur", async ({ page }) => {
  await open(page, 1440)
  const knop = page.locator("header button[aria-controls='bar-panel-studio']")
  await knop.click()
  const paneel = page.locator("#bar-panel-studio")
  await expect(paneel).toBeVisible()
  const kleur = (sel: string) => paneel.locator(sel).first().evaluate((el) => getComputedStyle(el).color)
  const pijl = await kleur("span[aria-hidden]:text('→')")
  const cijfer = await kleur("span[aria-hidden]:text('01')")
  expect(cijfer).toBe(pijl)
})

// Eigenaar, 29 sep 2026: "dit meer centreren op midden?" De regel onder de
// voet (© en de KvK- en btw-knop) staat vanaf xl in het midden van de pagina.
for (const w of [1280, 1440, 1920]) {
  test(`${w}px: de regel onder de voet staat in het midden`, async ({ page }) => {
    await open(page, w)
    await page.locator("[data-voet-regel]").scrollIntoViewIfNeeded()
    const delen = await page.locator("[data-voet-regel] > *").evaluateAll((els) =>
      els
        .map((e) => e.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({ l: r.left, r: r.right })),
    )
    const links = Math.min(...delen.map((d) => d.l))
    const rechts = Math.max(...delen.map((d) => d.r))
    expect(Math.abs((links + rechts) / 2 - w / 2), `midden ${(links + rechts) / 2} ≠ ${w / 2}`).toBeLessThanOrEqual(1)
  })
}
