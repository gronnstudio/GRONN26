import { expect, test } from "./fixtures"

// Geen straat, huisnummer of postcode op de openbare site (eigenaar, 11 nov
// 2026: "haal openlijke adresgegevens van de website, ivm stalking"). Het
// adres zelf staat bewust niet in deze test: de repo is openbaar. We zoeken
// naar de vorm van een Nederlandse postcode en naar een straatadres in JSON-LD.
const POSTCODE = /\b\d{4} ?[A-Z]{2}\b/
const PAGINAS = ["/", "/kennismaken", "/colofon", "/privacy", "/voorwaarden", "/herroeping", "/drukwerk/voorwaarden", "/drukwerk/herroeping", "/drukwerk/privacy"]

for (const pad of PAGINAS) {
  test(`${pad}: geen postcode of straatadres`, async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
    await page.goto(pad)
    expect(await page.locator("body").innerText()).not.toMatch(POSTCODE)
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ld.join("")).not.toMatch(/streetAddress|postalCode/)
  })
}

test("visitekaartje (vCard) zonder straat of postcode", async ({ request }) => {
  const vcf = await (await request.get("/contact.vcf")).text()
  expect(vcf).toMatch(/ADR;TYPE=WORK:;;;Stein;/)
  expect(vcf).not.toMatch(POSTCODE)
})
