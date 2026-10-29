import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test, type Locator } from "@playwright/test"

// De moestuinmarkee op de Studio-pagina (eigenaar, 24 sep 2026: "Maak
// een markee met twee tegenstrijdig lopende foto carousels"). Bewaakt:
// - twee rijen, twaalf unieke foto's met echte alt-teksten, de kopie
//   onzichtbaar voor schermlezers;
// - de rijen lopen tegengesteld (normal vs reverse);
// - bij minder beweging: niets beweegt, geen kopie, elke rij scrollt opzij;
// - geen horizontale pagina-overloop op de telefoon;
// - geen metadata (EXIF/GPS) in de bestanden.

const STUDIO = "/nl/studio"
const MAP = join(process.cwd(), "public", "studio", "moestuin")
const REGIO = '[data-markee][role="region"]'

/** JPEG-markers zoeken: APP1 (0xFFE1) is EXIF/XMP, daar zit GPS in. */
function heeftApp1(buf: Buffer) {
  let i = 2
  while (i < buf.length - 4 && buf[i] === 0xff) {
    const marker = buf[i + 1]
    if (marker === 0xda) return false // start of scan: geen headers meer
    if (marker === 0xe1) return true
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return false
}

test("de markee heeft twee rijen met twaalf unieke foto's en een verborgen kopie", async ({ page }) => {
  await page.goto(STUDIO)
  const regio = page.locator(REGIO)
  await expect(regio).toHaveCount(1)
  await expect(regio).toHaveAttribute("aria-label", "Foto's uit de moestuin")
  await expect(page.locator('section[aria-labelledby="moestuin-kop"] h2#moestuin-kop')).toHaveCount(1)

  const rijen = regio.locator("[data-markee-rij]")
  await expect(rijen).toHaveCount(2)

  const zichtbaar = regio.locator("ul:not([aria-hidden]) li:not([aria-hidden]) img")
  await expect(zichtbaar).toHaveCount(12)
  const bronnen = new Set<string>()
  for (let i = 0; i < 12; i++) {
    const img = zichtbaar.nth(i)
    const alt = (await img.getAttribute("alt")) ?? ""
    expect(alt.length, `alt van foto ${i + 1}`).toBeGreaterThanOrEqual(20)
    const src = decodeURIComponent((await img.getAttribute("src")) ?? "")
    const naam = src.match(/studio\/moestuin\/(M\d\d\.jpg)/)?.[1]
    expect(naam, src).toBeTruthy()
    bronnen.add(naam!)
  }
  expect(bronnen.size).toBe(12)

  const kopieen = regio.locator('ul[aria-hidden="true"]')
  await expect(kopieen).toHaveCount(2)
  // Alles behalve de twaalf echte foto's is decoratief: de kopie én de
  // herhaling binnen elke rij, samen 36 beelden, allemaal zonder alt.
  const decor = regio.locator('ul[aria-hidden="true"] img, li[aria-hidden="true"] img')
  await expect(decor).toHaveCount(36)
  for (let i = 0; i < 36; i++) {
    await expect(decor.nth(i)).toHaveAttribute("alt", "")
  }
})

test("de rijen lopen in tegengestelde richting", async ({ page }) => {
  await page.goto(STUDIO)
  const sporen = page.locator(`${REGIO} [data-markee-rij] .g-markee-spoor`)
  await expect(sporen).toHaveCount(2)
  const stijl = await sporen.evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el)
      return { naam: s.animationName, richting: s.animationDirection, duur: parseFloat(s.animationDuration) }
    }),
  )
  expect(stijl[0].naam).toBe("g-markee")
  expect(stijl[1].naam).toBe("g-markee")
  expect(stijl[0].richting).toBe("normal")
  expect(stijl[1].richting).toBe("reverse")
  // Rustig: anderhalve minuut per ronde.
  expect(stijl[0].duur).toBeGreaterThanOrEqual(60)
  // De kopie staat er, zodat de lus naadloos is.
  await expect(page.locator(`${REGIO} ul[aria-hidden="true"]`).first()).toHaveCSS("display", "flex")
  // Geen gat: één kopie is breder dan de rij zelf, op elke breedte.
  const sluit = await page.locator(`${REGIO} [data-markee-rij]`).evaluateAll((rijen) =>
    rijen.map((r) => [(r.querySelector("ul") as HTMLElement).getBoundingClientRect().width, r.getBoundingClientRect().width]),
  )
  for (const [kopie, rij] of sluit) expect(kopie).toBeGreaterThan(rij)
})

test.describe("minder beweging", () => {
  test("niets beweegt, geen kopie, en elke rij scrollt opzij", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(STUDIO)
    const rijen = page.locator(`${REGIO} [data-markee-rij]`)
    await expect(rijen).toHaveCount(2)
    for (let r = 0; r < 2; r++) {
      const rij = rijen.nth(r)
      await expect(rij.locator(".g-markee-spoor")).toHaveCSS("animation-name", "none")
      await expect(rij.locator('ul[aria-hidden="true"]')).toHaveCSS("display", "none")
      await expect(rij.locator(".g-markee-herhaal").first()).toHaveCSS("display", "none")
      await expect(rij).toHaveCSS("overflow-x", "auto")
      // Elke foto bereikbaar: staat hij niet in beeld, dan scrollt de rij.
      const { scroll, client, laatsteRechts, rijRechts } = await rij.evaluate((el) => ({
        scroll: el.scrollWidth,
        client: el.clientWidth,
        laatsteRechts: [...el.querySelectorAll("ul:not([aria-hidden]) li:not([aria-hidden])")].at(-1)!.getBoundingClientRect().right,
        rijRechts: el.getBoundingClientRect().right,
      }))
      if (laatsteRechts > rijRechts) expect(scroll).toBeGreaterThan(client)
    }
  })
})

test("geen horizontale pagina-overloop op de telefoon", async ({ page, isMobile }) => {
  test.skip(!isMobile, "de telefoonbreedte")
  for (const breedte of [320, 375]) {
    await page.setViewportSize({ width: breedte, height: 800 })
    await page.goto(STUDIO)
    await page.locator(REGIO).scrollIntoViewIfNeeded()
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }))
    expect(scroll, `${breedte}px`).toBeLessThanOrEqual(inner)
  }
})

// Twaalf namen zijn nog geen twaalf foto's: M03 en M09 waren eerst
// hetzelfde beeld (twee telefoons, één moment). Daarom ook op inhoud.
test("de moestuinfoto's zijn twaalf verschillende JPEG's zonder metadata", async ({ isMobile }) => {
  test.skip(isMobile, "de bestanden één keer controleren is genoeg")
  const namen = readdirSync(MAP).filter((n) => n.endsWith(".jpg")).sort()
  expect(namen).toEqual(Array.from({ length: 12 }, (_, i) => `M${String(i + 1).padStart(2, "0")}.jpg`))
  const hashes = new Set<string>()
  for (const naam of namen) {
    const buf = readFileSync(join(MAP, naam))
    expect(buf.subarray(0, 2).toString("hex"), naam).toBe("ffd8")
    expect(heeftApp1(buf), `${naam} bevat EXIF/XMP (GPS!)`).toBe(false)
    hashes.add(createHash("sha256").update(buf).digest("hex"))
  }
  expect(hashes.size, "twee bestanden zijn dezelfde foto").toBe(12)
})

// Eigenaar, 24 sep 2026, bij 260 px hoge tegels op de telefoon: "Wellicht
// kleiner maken?" Nu 160 hoog op de telefoon en 220 vanaf md, zodat een
// rij meerdere foto's laat zien in plaats van twee grote.
test("de tegels zijn klein: 160 px op de telefoon, 220 px vanaf md", async ({ page, isMobile }) => {
  await page.goto(STUDIO)
  const foto = page.locator(`${REGIO} ul:not([aria-hidden]) img`).first()
  await page.locator('section[aria-labelledby="moestuin-kop"]').evaluate((el) => el.scrollIntoView())
  const h = await foto.evaluate((el) => el.getBoundingClientRect().height)
  expect(h).toBe(isMobile ? 160 : 220)
})

// Eigenaar, 24 sep 2026: "the markee when touched on mobile stops
// spinning, prevent that". Een tik liet een plakkerige :hover achter en
// focuste de rij (tabIndex=0), en :hover/:focus-within zetten hem stil.
// Nu: muis alleen op een echte hover-aanwijzer, focus alleen als
// :focus-visible (toetsenbord). Beide kanten, want WCAG 2.2.2 wil dat een
// toetsenbordbezoeker hem wél stil kan zetten.
const speelt = (spoor: Locator) => spoor.evaluate((el) => getComputedStyle(el).animationPlayState)

test("een tik op de telefoon zet de markee niet stil", async ({ page, isMobile }) => {
  test.skip(!isMobile, "aanraken is de telefoon")
  await page.goto(STUDIO)
  const rij = page.locator(`${REGIO} [data-markee-rij]`).first()
  await rij.scrollIntoViewIfNeeded()
  const sporen = page.locator(`${REGIO} .g-markee-spoor`)
  await expect(sporen).toHaveCount(2)
  expect(await speelt(sporen.nth(0))).toBe("running")

  await rij.tap()
  // De tik focust de rij echt — precies de toestand die hem vroeger
  // stilzette (:focus-within) — maar niet als toetsenbordfocus.
  await expect(rij).toBeFocused()
  expect(await page.locator(REGIO).evaluate((el) => el.matches(":focus-within"))).toBe(true)
  expect(await rij.evaluate((el) => el.matches(":focus-visible"))).toBe(false)
  await page.waitForTimeout(300)
  for (let i = 0; i < 2; i++) expect(await speelt(sporen.nth(i)), `rij ${i + 1}`).toBe("running")
})

test("toetsenbordfocus zet beide rijen stil, de muis ook", async ({ page, isMobile }) => {
  test.skip(isMobile, "toetsenbord en muis op de desktop")
  await page.goto(STUDIO)
  await page.mouse.move(0, 0)
  const rijen = page.locator(`${REGIO} [data-markee-rij]`)
  const sporen = page.locator(`${REGIO} .g-markee-spoor`)
  await rijen.first().scrollIntoViewIfNeeded()
  for (let i = 0; i < 2; i++) expect(await speelt(sporen.nth(i)), `rij ${i + 1} vooraf`).toBe("running")

  // Echte Tab: van rij 1 naar rij 2, zoals een toetsenbordbezoeker.
  await rijen.first().focus()
  await page.keyboard.press("Tab")
  await expect(rijen.nth(1)).toBeFocused()
  expect(await rijen.nth(1).evaluate((el) => el.matches(":focus-visible"))).toBe(true)
  for (let i = 0; i < 2; i++) expect(await speelt(sporen.nth(i)), `rij ${i + 1} bij focus`).toBe("paused")

  // Focus weg: hij loopt weer. Dan de muis erop: stil.
  await page.keyboard.press("Tab")
  await expect(rijen.nth(1)).not.toBeFocused()
  expect(await speelt(sporen.nth(0))).toBe("running")
  await rijen.first().hover()
  expect(await speelt(sporen.nth(0))).toBe("paused")
})
