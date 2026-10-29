import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { WINKEL_DIENSTEN } from "@/components/gronn/winkel"
import { PRICING } from "@/lib/data/pricing"
import { WINKEL_LIVE } from "@/lib/data/winkel"

// De winkel is een CONCEPT (Nick, 25 sep 2026): hij mag nooit doorgaan
// voor echt. Noindex, nergens gelinkt, gelabelde plaatshouders, geen knop
// die betaalt en geen bedrag dat niet in pricing.ts staat.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

const PADEN = ["/winkel", "/nl/winkel"]

for (const pad of PADEN) {
  test(`concept: banner, noindex, plaatshouders, geen betaalknop (${pad})`, async ({ page }) => {
    await page.goto(pad)
    const banner = page.locator("[data-winkel-concept]")
    await expect(banner).toBeVisible()
    await expect(banner).toContainText(pad.startsWith("/nl") ? "Concept — nog niet te koop" : "Concept — not for sale yet")

    const robots = await page.locator('meta[name="robots"]').getAttribute("content")
    expect(robots).toContain("noindex")
    expect(robots).toContain("nofollow")

    const main = page.locator("main")

    // Elk beeld draagt een plaatshouderlabel; geen project- of sfeerfoto.
    const beelden = main.locator("[data-product-beeld]")
    const aantal = await beelden.count()
    expect(aantal).toBeGreaterThan(0)
    for (let i = 0; i < aantal; i++) {
      await expect(beelden.nth(i).locator("[data-concept-label]")).toHaveText(/Plaatshouder|Placeholder/i)
    }
    const imgs = await main.locator("img").evaluateAll((els) =>
      els.map((e) => ({ src: e.getAttribute("src") ?? "", inKaart: !!e.closest("[data-product-beeld]") }))
    )
    for (const img of imgs) {
      expect(img.inKaart, `beeld zonder label: ${img.src}`).toBe(true)
      const bron = decodeURIComponent(img.src)
      expect(bron).not.toContain("/projecten/")
      expect(bron).not.toContain("/sfeer/")
    }

    // Geen knop betaalt.
    const knoppen = main.locator("[data-bestellen]")
    const n = await knoppen.count()
    expect(n).toBeGreaterThan(0)
    for (let i = 0; i < n; i++) {
      await expect(knoppen.nth(i)).toBeDisabled()
      await expect(knoppen.nth(i)).toHaveAttribute("aria-disabled", "true")
      await expect(knoppen.nth(i)).toContainText("(concept)")
    }
    expect(await main.locator('a[href*="mollie"]').count()).toBe(0)

    // Alleen bedragen die in pricing.ts staan, voor de getoonde diensten.
    const toegestaan = new Set(
      WINKEL_DIENSTEN.flatMap((slug) => PRICING[slug].tiers.flatMap((t) => [t.amount, ...(t.amountMax ? [t.amountMax] : [])]))
    )
    const tekst = await main.innerText()
    const bedragen = [...tekst.matchAll(/€\s?([\d.,]+)/g)].map((m) => Number(m[1].replace(/[.,]/g, "")))
    expect(bedragen.length).toBeGreaterThan(0)
    for (const b of bedragen) expect(toegestaan.has(b), `verzonnen bedrag: €${b}`).toBe(true)
    await expect(main).toContainText(pad.startsWith("/nl") ? "Prijs volgt" : "Price to follow")
    await expect(main.locator('a[href$="/herroeping"]').first()).toBeVisible()
  })

  test(`axe: ${pad}`, async ({ page }) => {
    // De eerste Sectie staat hier al half in beeld en loopt op een
    // scroll-timeline in (g-in); axe zou die tussenstand meten. Met minder
    // beweging staat alles in de eindstand — de kleuren die blijven.
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(pad, { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("canvas")
      .analyze()
    expect(results.violations, results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")).toEqual([])
  })
}

test("niet in de sitemap", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text()
  expect(xml).not.toContain("winkel")
})

for (const pad of ["/", "/nl"]) {
  test(`niet in nav of voet (${pad})`, async ({ page }) => {
    await page.goto(pad)
    expect(await page.locator('a[href*="winkel"]').count()).toBe(0)
  })
}

test("WINKEL_LIVE uit: de ingeklapte dock houdt Home, zonder /winkel", async ({ page }) => {
  expect(WINKEL_LIVE).toBe(false)
  await page.goto("/nl")
  const compact = page.locator("[data-dock-compact]")
  await expect(compact.locator('a[href="/nl"]')).toHaveCount(1)
  await expect(compact.locator("[data-dock-label]").first()).toHaveText(/home/i)
  expect(await compact.locator('a[href*="winkel"]').count()).toBe(0)
})

test("niet in de zoekfunctie", () => {
  // De zoekfunctie (command palette) en de nav-bron bouwen hun doelen uit
  // de broncode; nergens mag /winkel in staan.
  const bestanden = [
    ...readdirSync("src/components/search").map((f) => join("src/components/search", f)),
    "src/lib/nav.ts",
    "src/components/gronn/voet.tsx",
  ]
  for (const f of bestanden) expect(readFileSync(f, "utf8"), f).not.toContain("winkel")
})
