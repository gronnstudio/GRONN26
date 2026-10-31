import { expect, test, type Page } from "@playwright/test"

import { SEIZOEN } from "../../src/lib/data/seizoen"
import { klok, maanFase, zonTijden } from "../../src/lib/hemel"
import { seizoensRegel } from "../../src/components/gronn/elementen/seizoenszaadje"

// Maan, zon en tuinkalender: het rekenwerk in src/lib/hemel.ts en wat
// de voet ervan laat zien. Stond tot 1 okt 2026 in paaseieren.spec.ts; de
// easter eggs zijn weg (eigenaar: "Verwijder de easter eggs!"), dit niet.

/** Zet localStorage vóór het laden (de storageState hoort bij poort 3210). */
async function metOpslag(page: Page, items: Record<string, string>) {
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("__hemel_init")) return
    sessionStorage.setItem("__hemel_init", "1")
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
    for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v)
  }, items)
}

// ——— Rekenwerk (geen browser) ———————————————————————————————

test.describe("rekenwerk", () => {
  test.skip(({ isMobile }) => isMobile, "pure functies: één keer is genoeg")

  test("maanfase op drie bekende data", () => {
    // Volle maan 25 jan 2024 17:54 UTC; nieuwe maan 8 apr 2024 18:21 UTC
    // (de zonsverduistering); eerste kwartier 6 jan 2025 23:56 UTC.
    const vol = maanFase(new Date("2024-01-25T17:54:00Z"))
    expect(vol.verlicht).toBeGreaterThan(0.98)
    expect(vol.naam.nl).toBe("Volle maan")
    const nieuw = maanFase(new Date("2024-04-08T18:21:00Z"))
    expect(nieuw.verlicht).toBeLessThan(0.02)
    expect(nieuw.naam.nl).toBe("Nieuwe maan")
    const kwartier = maanFase(new Date("2025-01-06T23:56:00Z"))
    expect(kwartier.verlicht).toBeGreaterThan(0.4)
    expect(kwartier.verlicht).toBeLessThan(0.6)
    expect(kwartier.wassend).toBe(true)
    expect(kwartier.naam.nl).toBe("Eerste kwartier")
  })

  test("zonsopkomst en -ondergang in Stein, ±5 min", () => {
    // Referentie: de tabellen voor Maastricht (50,85 N 5,69 O), ~1 min
    // van Stein, Nederlandse tijd.
    const minuten = (s: string) => {
      const [h, m] = s.split(":").map(Number)
      return h * 60 + m
    }
    const gevallen: [string, string, string][] = [
      ["2024-06-21T12:00:00Z", "05:26", "21:59"],
      ["2024-12-21T12:00:00Z", "08:40", "16:34"],
      ["2024-03-20T12:00:00Z", "06:41", "18:50"],
    ]
    for (const [dag, op, onder] of gevallen) {
      const z = zonTijden(new Date(dag))!
      expect(Math.abs(minuten(klok(z.op)) - minuten(op))).toBeLessThanOrEqual(5)
      expect(Math.abs(minuten(klok(z.onder)) - minuten(onder))).toBeLessThanOrEqual(5)
    }
  })

  test("seizoen: null rendert niets, en elke maand is kort", () => {
    const leeg = Object.fromEntries(Object.keys(SEIZOEN).map((k) => [k, null])) as unknown as typeof SEIZOEN
    for (let m = 0; m < 12; m++) expect(seizoensRegel(new Date(2026, m, 15), leeg)).toBeNull()
    expect(seizoensRegel(null)).toBeNull()
    for (const regel of Object.values(SEIZOEN)) {
      expect(regel).not.toBeNull()
      expect(regel!.nl.length).toBeLessThanOrEqual(42)
      expect(regel!.en.length).toBeLessThanOrEqual(42)
    }
  })
})

// ——— Maan, zon en tuinkalender in de voet —————————————————————————
//
// Sinds 27 sep 2026 geen eieren meer maar informatie. Onder `xl` staan ze
// in de voet (hier: de telefoon); vanaf `xl` in de rechterbubbel
// (zij-bubbels.spec.ts).

for (const thema of ["bluehour", "goldenhour"] as const) {
  test(`voet: maan alleen op Blauwe Uur, zon alleen op Gouden Uur (${thema})`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "vanaf xl staan ze in de rechterbubbel")
    await metOpslag(page, { theme: thema, "gronn-theme-mode": "manual" })
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    const maan = page.locator('[data-element="Maanfase"]')
    const zon = page.locator('[data-element="Zonneboog"]')
    if (thema === "bluehour") {
      await expect(maan).toBeVisible()
      await expect(zon).toBeHidden()
      await expect(maan).toHaveAttribute("aria-label", /maan|kwartier/i)
      await expect(maan).toHaveAttribute("aria-label", /\d+ %$/)
    } else {
      await expect(zon).toBeVisible()
      await expect(maan).toBeHidden()
      await expect(zon).toHaveAttribute("aria-label", /^Zon op \d\d:\d\d, onder \d\d:\d\d$/)
    }
  })
}

test("zon 's nachts zonder stip, overdag met", async ({ page, isMobile }) => {
  test.skip(!isMobile, "vanaf xl staan ze in de rechterbubbel")
  await metOpslag(page, { theme: "goldenhour", "gronn-theme-mode": "manual" })
  await page.clock.setFixedTime(new Date("2026-09-25T12:00:00+02:00"))
  await page.goto("/nl")
  await expect(page.locator('[data-element="Zonneboog"] [data-zon]')).toBeAttached()
  await page.clock.setFixedTime(new Date("2026-09-25T23:30:00+02:00"))
  await page.reload()
  await expect(page.locator('[data-element="Zonneboog"]')).toBeAttached()
  await expect(page.locator('[data-element="Zonneboog"] [data-zon]')).toHaveCount(0)
})

test("voet: tuinkalender toont de regel van de maand", async ({ page, isMobile }) => {
  test.skip(!isMobile, "vanaf xl staat hij in de rechterbubbel")
  await metOpslag(page, {})
  await page.clock.setFixedTime(new Date("2026-09-25T12:00:00+02:00"))
  await page.goto("/nl")
  await expect(page.locator('[data-element="Seizoenszaadje"]')).toHaveText(SEIZOEN[9]!.nl)
})
