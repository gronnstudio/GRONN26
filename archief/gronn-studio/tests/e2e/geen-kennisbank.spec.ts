import { expect, test } from "@playwright/test"

// Eigenaar, 4 okt 2026: "haal kennisbank weg". Bewaakt dat hij weg blijft:
// oude links leiden naar de veelgestelde vragen, en geen menu, voet of
// zoekfunctie wijst er nog heen.

test("oude kennisbanklinks leiden naar de veelgestelde vragen", async ({ request }) => {
  for (const [van, naar] of [
    ["/nl/kennisbank", "/nl/faq"],
    ["/kennisbank", "/faq"],
    ["/nl/kennisbank/voedselbos-in-je-tuin", "/nl/faq"],
  ]) {
    const r = await request.get(van, { maxRedirects: 0 })
    expect(r.status(), van).toBe(307)
    expect(new URL(r.headers().location, "http://x").pathname).toBe(naar)
  }
})

test("geen link naar de kennisbank op de site", async ({ page }) => {
  for (const pad of ["/nl", "/nl/services", "/nl/faq", "/nl/herfstbeurt"]) {
    await page.goto(pad)
    await expect(page.locator('a[href*="/kennisbank"]'), pad).toHaveCount(0)
  }
})

test("de sitemap noemt de kennisbank niet", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text()
  expect(xml).not.toContain("/kennisbank")
})
