import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import content from "../../content/site-content.json"
import { THUIS_VRAGEN, thuisVragen, vragen } from "@/components/gronn/vragen-lijst"
import type { Service } from "@/lib/data/services"
import type { Locale } from "@/lib/i18n"

// Veelgestelde vragen op home (eigenaar, 25 sep 2026: "Veelgestelde
// vragen staat enkel in de footer, kunnen we dat niet op HOME
// toevoegen?"). Geen eigen tekst: elke vraag op home is letterlijk een
// vraag van /faq, en de FAQPage-JSON-LD blijft alleen op /faq staan.

const services = (content as unknown as { services: Service[] }).services

for (const [pad, locale, faq] of [
  ["/nl", "nl", "/nl/faq"],
  ["/", "en", "/faq"],
] as [string, Locale, string][]) {
  test.describe(`home-vragen ${pad}`, () => {
    test("vier of vijf vragen uit de FAQ-lijst", async ({ page }) => {
      await page.goto(pad)
      const sectie = page.locator("section#vragen")
      await expect(sectie).toHaveCount(1)
      const koppen = sectie.locator("summary h3")
      const n = await koppen.count()
      expect(n).toBeGreaterThanOrEqual(4)
      expect(n).toBeLessThanOrEqual(5)
      expect(n).toBeLessThanOrEqual(THUIS_VRAGEN.length)
      const alle = vragen(services, locale).map((v) => v.vraag)
      const verwacht = thuisVragen(vragen(services, locale)).map((v) => v.vraag)
      const gezien = (await koppen.allTextContents()).map((s) => s.trim())
      for (const v of gezien) expect(alle).toContain(v)
      expect(gezien).toEqual(verwacht)
    })

    test("klik en Enter openen het antwoord", async ({ page }) => {
      await page.goto(pad)
      const lijst = page.locator("section#vragen details")
      const eerste = lijst.nth(0)
      await expect(eerste).not.toHaveAttribute("open")
      await eerste.locator("summary").click()
      await expect(eerste).toHaveAttribute("open", "")
      await expect(eerste.locator("[data-antwoord]")).toBeVisible()

      const tweede = lijst.nth(1)
      await tweede.locator("summary").focus()
      await page.keyboard.press("Enter")
      await expect(tweede).toHaveAttribute("open", "")
      await expect(tweede.locator("[data-antwoord]")).toBeVisible()
    })

    test("Alle vragen gaat naar de FAQ-pagina", async ({ page }) => {
      await page.goto(pad)
      const link = page.locator("section#vragen").getByRole("link", { name: locale === "nl" ? "Alle vragen" : "All questions" })
      await expect(link).toHaveAttribute("href", faq)
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${faq}$`))
    })

    test("geen FAQPage-JSON-LD op home, wel op de FAQ-pagina", async ({ page }) => {
      const ld = () =>
        page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => e.textContent ?? ""))
      await page.goto(faq)
      expect((await ld()).some((s) => s.includes('"FAQPage"'))).toBe(true)
      await page.goto(pad)
      expect((await ld()).some((s) => s.includes('"FAQPage"'))).toBe(false)
    })

    test("axe", async ({ page }) => {
      await page.goto(pad, { waitUntil: "networkidle" })
      const sectie = page.locator("section#vragen")
      // Bovenaan het scherm, zoals een lezer er staat. Met alleen
      // "IfNeeded" stond de sectie half onderin: de kop links (twee
      // kolommen sinds 28 sep 2026) was dan nog midden in zijn
      // binnenkomst (`g-in`, scroll-gestuurd), en axe mat een overgang in
      // plaats van de tekst.
      await sectie.locator("details").first().locator("summary").click()
      // Playwright scrolt bij de klik het vraagveld naar het midden; zet
      // de sectie daarna bovenaan.
      await sectie.evaluate((el) => el.scrollIntoView({ block: "start" }))
      await page.waitForTimeout(1500)
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .include("section#vragen")
        .analyze()
      expect(results.violations, results.violations.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([])
    })
  })
}
