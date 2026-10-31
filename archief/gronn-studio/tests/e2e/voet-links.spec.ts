import { expect, test } from "@playwright/test"

// Eigenaar, 29 sep 2026: "twee keer contact?". De voet had "Contact" onder
// Site en "Contactformulier" onder Contact, allebei naar /contact. Elke
// bestemming staat nu één keer in de linkkolommen van de voet.

test("de voet noemt elke pagina één keer", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
  await page.goto("/nl")
  const hrefs = await page
    .locator("footer [data-element='LinkKolom'] a[href^='/']")
    .evaluateAll((els) => els.map((a) => (a as HTMLAnchorElement).getAttribute("href")!))
  const dubbel = hrefs.filter((h, i) => hrefs.indexOf(h) !== i)
  expect(dubbel, `dubbel in de voet: ${dubbel.join(", ")}`).toEqual([])
  // Het contactformulier blijft bereikbaar, onder Contact.
  expect(hrefs.filter((h) => h === "/nl/contact")).toHaveLength(1)
  // En het colofon (adres, KvK) ook, onder Contact.
  expect(hrefs.filter((h) => h === "/nl/colofon")).toHaveLength(1)
})
