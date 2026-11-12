import { expect, test } from "./fixtures"

// De handoff "Website 2027" (12 nov 2026): de kop met menu, en de
// projectaanvraag in zes stappen, zowel de foutroute als de gelukte route.

test("kop @1440: vier links en Start een project; Projecten gaat naar /werk", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Hoofdmenu" })
  for (const naam of ["Specialismen", "Projecten", "Werkwijze", "Studio"]) await expect(nav.getByRole("link", { name: naam })).toBeVisible()
  await nav.getByRole("link", { name: "Projecten" }).click()
  await expect(page).toHaveURL(/\/werk$/)
  await expect(nav.getByRole("link", { name: "Projecten" })).toHaveAttribute("aria-current", "page")
})

test("menu @390: schermvullend, Escape sluit en de focus gaat terug", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  const knop = page.getByRole("button", { name: "Menu" })
  await knop.click()
  const menu = page.getByRole("dialog", { name: "Menu" })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole("link", { name: "Projecten" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(menu).toBeHidden()
  await expect(knop).toBeFocused()
})

test("FAQ: knop met aria-expanded, antwoord blijft in de DOM", async ({ page }) => {
  await page.goto("/")
  const knop = page.getByRole("button", { name: "Wat kost een traject?" })
  await expect(knop).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByText("De intake vraagt om een bandbreedte")).toBeAttached()
  await knop.click()
  await expect(knop).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("De intake vraagt om een bandbreedte")).toBeVisible()
})

test("aanvraag: verder zonder keuze geeft een fout en blijft op stap 1", async ({ page }) => {
  await page.goto("/start-een-project")
  await expect(page.getByText("Stap 1 van 6")).toBeVisible()
  await page.getByRole("button", { name: /Volgende stap/ }).click()
  await expect(page.locator(".hw-samenvatting")).toContainText("Kies wat je wilt realiseren")
  await expect(page.getByText("Stap 1 van 6")).toBeVisible()
})

test("aanvraag: zes stappen tot de bevestiging, met referentie", async ({ page }) => {
  let body = ""
  await page.route("**/formsubmit.co/**", (r) => {
    body = r.request().postData() ?? ""
    r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' })
  })
  await page.route("**/api/aanvraag", (r) => r.fulfill({ status: 200, body: '{"ok":true}' }))
  await page.goto("/start-een-project")
  const verder = page.getByRole("button", { name: /Volgende stap/ })
  await page.getByText("Een vijver renoveren of verbeteren").click()
  await verder.click()
  await expect(page.getByText("Stap 2 van 6")).toBeVisible()
  await page.getByLabel("Korte toelichting").fill("De vijver is groen en het filter is oud.")
  await page.getByLabel("Postcode").fill("6171 AB")
  await verder.click()
  await page.getByText("€ 5.000 – 10.000").click()
  await verder.click()
  await page.getByText("Binnen 3 maanden").click()
  await verder.click()
  await expect(page.getByText("Stap 5 van 6")).toBeVisible()
  await verder.click()
  await page.getByRole("textbox", { name: "Naam" }).fill("Test Persoon")
  await page.getByRole("textbox", { name: "E-mail" }).fill("test@voorbeeld.nl")
  await page.getByRole("button", { name: /Verstuur aanvraag/ }).click()
  await expect(page.locator(".hw-samenvatting")).toContainText("privacyverklaring")
  await page.getByLabel(/Ik ga akkoord/).check()
  await page.getByRole("button", { name: /Verstuur aanvraag/ }).click()
  await expect(page.getByRole("heading", { name: /Bedankt/ })).toBeVisible()
  await expect(page.locator(".hw-referentie")).toContainText(/GR-\d{8}-/)
  expect(body).toContain("Budget: € 5.000 – 10.000")
  expect(body).toContain("Planning: Binnen 3 maanden")
})
