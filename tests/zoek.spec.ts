import { expect, test } from "@playwright/test"

// Zoeken en sneltoetsen (zoek.tsx): ⌘K/Ctrl K en "/" openen, typen geeft
// treffers, Enter opent, Esc sluit en geeft de focus terug, g + letter navigeert.
// Met "minder beweging": de paginawissel (overgang.tsx) heeft zijn eigen
// timing en valt buiten deze test; op CI liep hij over de wachttijd heen.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("gronn-intro", "1")
    localStorage.setItem("gronn-weergave", JSON.stringify({ beweging: true }))
  })
})

test("Ctrl K zoekt, Enter opent, Esc sluit", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(400)
  const zoek = page.getByRole("dialog", { name: "Zoek op deze site" })
  await page.keyboard.press("Control+k")
  await expect(zoek).toBeVisible()
  const veld = zoek.getByRole("combobox")
  await expect(veld).toBeFocused()
  await veld.fill("vlinder")
  await expect(zoek.getByRole("option").first()).toContainText("Vlinderborder")
  await page.keyboard.press("Escape")
  await expect(zoek).toBeHidden()

  await page.keyboard.press("/")
  await expect(zoek).toBeVisible()
  // Het openen met "/" kan het veld nog leegmaken nadat fill al typte (het
  // sluiten van de vorige keer zet de zoekterm terug); dan opnieuw typen.
  await expect(async () => {
    await zoek.getByRole("combobox").fill("najaars")
    await expect(zoek.getByRole("option").first()).toContainText("Najaarsbeurt", { timeout: 1000 })
  }).toPass({ timeout: 10_000 })
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/vijvers#pond-autumn-service$/, { timeout: 20_000 })
  await expect(zoek).toBeHidden()
})

test("vanuit het menu, g dan w gaat naar Werk, Backspace terug", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(400)
  await page.getByRole("button", { name: "Menu" }).click()
  await page.getByRole("button", { name: "Zoek op de site" }).click()
  const zoek = page.getByRole("dialog", { name: "Zoek op deze site" })
  await expect(zoek).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(zoek).toBeHidden()
  await expect(page.getByRole("button", { name: "Menu" })).toBeFocused()

  await page.locator("body").click({ position: { x: 5, y: 300 } })
  await page.keyboard.press("g")
  await page.keyboard.press("w")
  await expect(page).toHaveURL(/\/werk$/, { timeout: 20_000 })

  await page.waitForTimeout(400)
  await page.keyboard.press("Backspace")
  await expect(page).toHaveURL(/localhost:3210\/$/, { timeout: 20_000 })
})
