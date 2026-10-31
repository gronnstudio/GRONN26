import { expect, test } from "@playwright/test"

// "doe die vijf" (eigenaar, 3 okt 2026): vijf onderdelen op /diensten.
test("diensten tonen de vijf onderdelen, en het voedselbos claimt geen werk", async ({ page }) => {
  await page.goto("/nl/services")
  const sectie = page.locator("#onderdelen")
  await expect(sectie.locator("[data-showcase-kaart]")).toHaveCount(5)
  for (const naam of ["Vijver", "Natuurlijke oever", "Takkenril", "Stapelmuur", "Voedselbos"]) {
    await expect(sectie.getByRole("link", { name: new RegExp(naam) }).first()).toBeVisible()
  }
  await expect(sectie.getByRole("link", { name: /Voedselbos/ })).toHaveAttribute("href", "/nl/contact")
})
