import { expect, test } from "@playwright/test"

import { BUSINESS } from "../../src/lib/business"
import { ZELF_DOEN } from "../../src/lib/data/zelf-doen"

// Naar Langenegger Naturgärten (eigenaar, 2 okt 2026: "nee precies dat"):
// Nicks WhatsApp naast zijn portret op Studio en Contact, en korte
// how-to's op /herfstbeurt.

const NICK = '[data-element="WhatsAppNick"]'

for (const pad of ["/nl/studio", "/nl/contact"]) {
  test(`${pad}: WhatsApp Nick naast het portret, uit business.ts`, async ({ page }) => {
    await page.goto(pad)
    const blok = page.locator(NICK)
    await expect(blok).toHaveCount(1)
    const knop = blok.getByRole("link", { name: "WhatsApp Nick" })
    await expect(knop).toHaveAttribute("href", BUSINESS.whatsapp)
    await expect(knop).toHaveAttribute("target", "_blank")
    await knop.scrollIntoViewIfNeeded()
    const box = await knop.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
}

test("/nl/studio: het blok staat direct onder het grote portret", async ({ page }) => {
  await page.goto("/nl/studio")
  const [portret, blok] = await page.evaluate((sel) => {
    const img = document.querySelector('img[src*="portret"], img[srcset*="portret"]')!.getBoundingClientRect()
    const b = document.querySelector(sel)!.getBoundingClientRect()
    return [{ onder: img.bottom + scrollY }, { boven: b.top + scrollY }]
  }, NICK)
  expect(blok.boven - portret.onder).toBeGreaterThanOrEqual(0)
  expect(blok.boven - portret.onder).toBeLessThanOrEqual(80)
})

test("/nl/contact: een rond portret erbij, en WhatsApp niet nog eens in de lijst", async ({ page }) => {
  await page.goto("/nl/contact")
  const img = page.locator(`${NICK} img`)
  await expect(img).toHaveCount(1)
  const r = await img.evaluate((el) => getComputedStyle(el).borderRadius)
  expect(r).not.toBe("0px")
  await expect(page.locator('[data-element="ContactKanalen"] a[href^="https://wa.me"]')).toHaveCount(0)
})

test("/nl/herfstbeurt: drie how-to's, elk met een eigen anker", async ({ page }) => {
  await page.goto("/nl/herfstbeurt")
  const sectie = page.locator("#zelf-doen")
  await expect(sectie.getByRole("heading", { level: 2 })).toHaveAccessibleName("Drie dingen die je zelf kunt doen.")
  const kaarten = sectie.locator('[data-element="ZelfDoenKaarten"] > li')
  await expect(kaarten).toHaveCount(ZELF_DOEN.length)
  for (const k of ZELF_DOEN) {
    await expect(page.locator(`#${k.id}`).getByRole("heading", { level: 3 })).toHaveText(k.titel.nl)
  }
})
