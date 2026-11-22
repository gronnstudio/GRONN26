import { expect, test } from "@playwright/test"

// Wat AI-assistenten en zoekmachines lezen: /llms.txt en de JSON-LD.
test("llms.txt noemt positionering, prijzen, journaal en geen adres", async ({ request }) => {
  const r = await request.get("/llms.txt")
  expect(r.status()).toBe(200)
  expect(r.headers()["content-type"]).toContain("text/plain")
  const t = await r.text()
  expect(t).toContain("vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving")
  expect(t).toMatch(/Prijs: (vanaf )?€/)
  expect(t).toContain("/journaal/tuin-in-de-winter")
  expect(t).not.toMatch(/\b\d{4} ?[A-Z]{2}(?!\p{L})/u)
})

for (const pad of ["/vijvers", "/tuinen"]) {
  test(`${pad} beschrijft de diensten als Service`, async ({ page }) => {
    await page.goto(pad)
    const blokken = await page.locator('script[type="application/ld+json"]').allTextContents()
    const graaf = blokken.map((b) => JSON.parse(b)).find((d) => d["@graph"])
    expect(graaf["@graph"].length).toBeGreaterThan(2)
    for (const s of graaf["@graph"]) {
      expect(s["@type"]).toBe("Service")
      expect(s.provider["@id"]).toBe("https://gronn.studio/#organisation")
    }
  })
}

test("een journaalstuk noemt de auteur met profiel", async ({ page }) => {
  await page.goto("/journaal/tuin-in-de-winter")
  const blokken = await page.locator('script[type="application/ld+json"]').allTextContents()
  const stuk = blokken.map((b) => JSON.parse(b)).find((d) => d["@type"] === "BlogPosting")
  expect(stuk.author.url).toBe("https://gronn.studio/over")
  expect(stuk.author.sameAs.length).toBeGreaterThan(0)
})
