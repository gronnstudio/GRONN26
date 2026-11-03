import { readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// Het echte beeldmateriaal van de vijverrenovatie (Nick, 24 sep 2026,
// met toestemming van de klant). Wat hier bewaakt wordt:
// - elk bestand bestaat en is een JPEG of MP4;
// - GEEN metadata in de foto's: een telefoonfoto draagt GPS-coördinaten
//   van de tuin, en dat is het adres van de klant;
// - elke foto heeft een echte alt-tekst, en een AI-visualisatie draagt
//   zichtbaar haar label;
// - de clips spelen stil, en niet vanzelf bij minder beweging.

const PROJECT = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"
const MAP = join(process.cwd(), "public", "projecten", "vijverrenovatie")

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

test.describe("vijverrenovatie: beeldmateriaal", () => {
  test.skip(({ isMobile }) => isMobile, "de bestanden één keer controleren is genoeg")

  test("elke foto op de pagina bestaat, is een JPEG zonder metadata, en heeft een alt", async ({ page }) => {
    await page.goto(PROJECT)
    const fotos = page.locator("article [data-foto] img, section [data-foto] img")
    const n = await fotos.count()
    expect(n).toBeGreaterThanOrEqual(12)
    for (let i = 0; i < n; i++) {
      const img = fotos.nth(i)
      const alt = (await img.getAttribute("alt")) ?? ""
      expect(alt.length, "alt-tekst").toBeGreaterThanOrEqual(20)
      const src = decodeURIComponent((await img.getAttribute("src")) ?? "")
      const naam = src.match(/projecten\/vijverrenovatie\/([^&?]+\.jpg)/)?.[1]
      expect(naam, src).toBeTruthy()
      const buf = readFileSync(join(MAP, naam!))
      expect(buf.subarray(0, 2).toString("hex"), naam).toBe("ffd8")
      expect(heeftApp1(buf), `${naam} bevat EXIF/XMP (GPS!)`).toBe(false)
      expect(statSync(join(MAP, naam!)).size, `${naam} is te groot`).toBeLessThan(800_000)
    }
  })

  // Wat geen foto is, gaat nooit door voor werk: het label staat op het
  // beeld, het staat alleen bij het denkwerk en draagt geen fase.
  test("elke AI-visualisatie draagt zichtbaar haar label en staat bij het denkwerk", async ({ page }) => {
    await page.goto(PROJECT)
    const vis = page.locator('[data-foto] figure:has(img[alt^="AI-visualisatie"])')
    await expect(vis).toHaveCount(2)
    for (let i = 0; i < 2; i++) {
      const f = vis.nth(i)
      await f.scrollIntoViewIfNeeded()
      await expect(f.locator("[data-concept-label]")).toHaveText("AI-visualisatie")
      await expect(f.locator("xpath=ancestor::*[@data-foto][1]")).toHaveAttribute("data-foto", "F03")
      await expect(f.locator("figcaption")).not.toContainText(/uitvoering|proces|bestaande situatie/i)
    }
  })
})

test("de clips spelen stil in een lus, met poster en beschrijving", async ({ page }) => {
  await page.goto(PROJECT)
  const clips = page.locator("[data-video] video")
  await expect(clips).toHaveCount(2)
  for (let i = 0; i < 2; i++) {
    const v = clips.nth(i)
    const s = await v.evaluate((el: HTMLVideoElement) => ({ muted: el.muted, loop: el.loop, inline: el.playsInline, poster: el.poster, label: el.getAttribute("aria-label") }))
    expect(s.muted && s.loop && s.inline).toBe(true)
    expect(s.poster).toMatch(/poster\.jpg$/)
    expect(s.label?.length ?? 0).toBeGreaterThan(20)
    await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.autoplay)).toBe(true)
    const src = (await v.getAttribute("src"))!
    const res = await page.request.get(src)
    expect(res.status(), src).toBe(200)
    expect(res.headers()["content-type"]).toContain("video/mp4")
  }
})

test.describe("minder beweging", () => {
  test("de clips starten niet vanzelf en tonen de bediening", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(PROJECT)
    const v = page.locator("[data-video] video").first()
    await expect(v).toHaveAttribute("controls", "")
    await expect(v).toHaveJSProperty("autoplay", false)
    await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true)
  })

  // De server kent de voorkeur niet: in de HTML mag geen autoplay staan,
  // anders loopt de clip tot de hydratie toch.
  test("de HTML van de server speelt niets vanzelf af", async ({ page }) => {
    const html = await (await page.request.get(PROJECT)).text()
    expect(html).toContain("<video")
    expect(html).not.toMatch(/<video[^>]*autoplay/i)
  })
})
