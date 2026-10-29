import { readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// Het tweede echte project: een terras van 24 m² in Geulle (Nick, 24 sep
// 2026, met toestemming van de klant). Alles op de pagina komt uit zijn
// eigen woorden en zijn Instagrambericht; deze toetsen bewaken dat de
// cijfers, de werkvolgorde en de beelden er staan zoals afgesproken, en
// dat de foto's geen metadata (GPS = het adres van de klant) meedragen.

const PROJECT = "/nl/projects/terras-geulle-24-m2-betontegels"
const MAP = join(process.cwd(), "public", "projecten", "terras-geulle")

/** JPEG-markers zoeken: APP1 (0xFFE1) is EXIF/XMP, daar zit GPS in. */
function heeftApp1(buf: Buffer) {
  let i = 2
  while (i < buf.length - 4 && buf[i] === 0xff) {
    const marker = buf[i + 1]
    if (marker === 0xda) return false
    if (marker === 0xe1) return true
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return false
}

test("terras: kop, plaats, cijfers, acht stappen, citaat en contactdeur", async ({ page }) => {
  await page.goto(PROJECT)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Een terras van 24 m², gelegd in twee dagen.")
  await expect(page).toHaveTitle("Terras van 24 m² betontegels in Geulle — GRØNN Studio")
  await expect(page.locator("article header")).toContainText("Geulle, Limburg")
  await expect(page.locator("article header")).toContainText("Afgerond")
  await expect(page.getByText("Betontegels 60 × 60 × 4 cm")).toBeVisible()
  const stappen = page.locator('section[aria-labelledby="werk-kop"] ol > li')
  await expect(stappen).toHaveCount(8)
  await expect(stappen.first()).toContainText("Ondergrond ontgraven en voorbereiden")
  await expect(stappen.nth(6)).toContainText("afschot richting het gras")
  await expect(page.locator("blockquote")).toContainText("waar het water heen moet")
  await expect(page.getByRole("link", { name: /Bespreek jouw terras/ })).toHaveAttribute("href", "/nl/contact")
})

test("terras: vier foto's met alt, geen sfeerbeeld, en JSON-LD als artikel", async ({ page }) => {
  await page.goto(PROJECT)
  const fotos = page.locator("article [data-foto] img")
  await expect(fotos).toHaveCount(4)
  for (let i = 0; i < 4; i++) {
    expect(((await fotos.nth(i).getAttribute("alt")) ?? "").length).toBeGreaterThanOrEqual(20)
  }
  await expect(page.locator('img[src*="sfeer"]')).toHaveCount(0)
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  const artikel = ld.map((x) => JSON.parse(x)).find((d) => d["@type"] === "Article")
  expect(artikel?.headline).toBe("Een terras van 24 m², gelegd in twee dagen.")
  expect(artikel?.image).toMatch(/\/projecten\/terras-geulle\/T01\.jpg$/)
})

test("terras: de bestanden zijn JPEG's zonder metadata en klein genoeg", async ({ isMobile }) => {
  test.skip(isMobile, "de bestanden één keer controleren is genoeg")
  for (const naam of ["T01.jpg", "T02.jpg", "T03.jpg", "T04.jpg"]) {
    const buf = readFileSync(join(MAP, naam))
    expect(buf.subarray(0, 2).toString("hex"), naam).toBe("ffd8")
    expect(heeftApp1(buf), `${naam} bevat EXIF/XMP (GPS!)`).toBe(false)
    expect(statSync(join(MAP, naam)).size, naam).toBeLessThan(400_000)
  }
})

test("terras: in de sitemap, en geen zijwaartse overloop", async ({ page, request }) => {
  const xml = await (await request.get("/sitemap.xml")).text()
  expect(xml).toContain("/projects/terras-geulle-24-m2-betontegels")
  await page.goto(PROJECT)
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
  expect(sw).toBeLessThanOrEqual(iw)
})
