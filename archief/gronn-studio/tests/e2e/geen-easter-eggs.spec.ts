import { expect, test } from "@playwright/test"

// Eigenaar, 1 okt 2026: "Verwijder de easter eggs! Er reageert geen hond
// op de post". Bewaakt dat ze weg blijven: de oude verzamelkaart leidt om
// naar de voorpagina, de servercontrole bestaat niet meer, en wat ooit een
// ei was (de kikker, de voetgrap, de verborgen sneltoets) is er niet.

const VIJVER = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"

test("de oude verzamelkaart leidt naar de voorpagina", async ({ request }) => {
  for (const [van, naar] of [
    ["/nl/easter-eggs", "/nl"],
    ["/easter-eggs", "/"],
  ]) {
    const r = await request.get(van, { maxRedirects: 0 })
    expect(r.status(), van).toBe(307)
    expect(new URL(r.headers().location, "http://x").pathname).toBe(naar)
  }
})

test("de servercontrole van de eieren is weg", async ({ request }) => {
  const r = await request.post("/api/eieren/vind", { data: {} })
  expect(r.status()).toBe(404)
})

test("geen kikker, geen voetgrap, geen verborgen regel bij de sneltoetsen", async ({ page }) => {
  await page.goto(`${VIJVER}?kikker`, { waitUntil: "networkidle" })
  await expect(page.locator("[data-kikker]")).toHaveCount(0)
  await expect(page.locator("[data-voet-grap]")).toHaveCount(0)
  await expect(page.locator("[data-voet-copy]")).toContainText("Pixels en code beschermd door pure wilskracht.")
  await expect(page.locator("main")).not.toContainText(/easter egg/i)
})
