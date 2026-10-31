import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { BUSINESS } from "@/lib/business"
import { PRICING } from "@/lib/data/pricing"
import { consumerPrice } from "@/lib/format"

// De najaarsactie (/herfstbeurt, 29 sep 2026). Bewaakt: de prijzen komen
// uit PRICING (geen overgetypt bedrag), de WhatsApp-knop draagt het
// bericht al, geen horizontale overloop op de telefoon, en axe is schoon.

const PAGINA = "/nl/herfstbeurt"

test("elk bedrag komt uit PRICING", async ({ page }) => {
  await page.goto(PAGINA)
  const tekst = await page.locator("main").innerText()
  for (const slug of ["leaf-net", "pond-autumn-service", "winterising", "maintenance-subscription"]) {
    for (const tier of PRICING[slug].tiers) {
      expect(tekst, `${slug} ${tier.amount}`).toContain(consumerPrice(tier.amount, "nl"))
    }
  }
})

test("de WhatsApp-knop opent een ingevuld bericht", async ({ page }) => {
  await page.goto(PAGINA)
  const knop = page.getByRole("link", { name: /Stuur een foto via WhatsApp/ }).first()
  const href = await knop.getAttribute("href")
  expect(href).toContain(`${BUSINESS.whatsapp}?text=`)
  expect(decodeURIComponent(href!.split("?text=")[1])).toContain("herfstbeurt")
})

test("geen horizontale pagina-overloop op de telefoon", async ({ page }) => {
  for (const breedte of [320, 375]) {
    await page.setViewportSize({ width: breedte, height: 800 })
    await page.goto(PAGINA)
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }))
    expect(scroll, `${breedte}px`).toBeLessThanOrEqual(inner)
  }
})

test("axe: geen overtredingen", async ({ page }) => {
  await page.goto(PAGINA)
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(results.violations, results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")).toEqual([])
})
