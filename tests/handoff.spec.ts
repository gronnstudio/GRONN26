import { expect, test } from "./fixtures"

// De handoff "Website 2027" (12 nov 2026): de kop met menu, en de
// projectaanvraag in vier stappen (13 nov 2026), zowel de foutroute als de
// gelukte route. Op de telefoon staat het dock in plaats van de kop.

test("kop @1440: vier links en Start een project; Projecten gaat naar /werk", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Hoofdmenu" })
  for (const naam of ["Specialismen", "Projecten", "Werkwijze", "Studio"]) await expect(nav.getByRole("link", { name: naam })).toBeVisible()
  await nav.getByRole("link", { name: "Projecten" }).click()
  await expect(page).toHaveURL(/\/werk$/)
  await expect(nav.getByRole("link", { name: "Projecten" })).toHaveAttribute("aria-current", "page")
})

test("telefoon @390: het dock onderaan, geen handoff-kop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await expect(page.locator("nav[data-menu]")).toBeVisible()
  await expect(page.locator(".ho-kop")).toBeHidden()
})

test("voorpagina: prijzen, foto via WhatsApp, voor/nu met review", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("vanaf € 3.000", { exact: false }).first()).toBeVisible()
  await expect(page.getByText("€ 45 per maand", { exact: false })).toBeVisible()
  await expect(page.getByText("Vijverdoorlichting € 195", { exact: false })).toBeVisible()
  const foto = page.getByRole("link", { name: /Stuur een foto/ }).first()
  await expect(foto).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/)
  await expect(page.getByText("Plan nu, dan begin ik in maart.")).toBeVisible()
  await expect(page.locator(".ho-citaat")).toContainText("Veronique")
  expect(await page.locator("#ho-titel").innerText()).toMatch(/^Buitenruimte die natuurlijk aanvoelt\.$/)
})

test("FAQ: knop met aria-expanded, antwoord blijft in de DOM", async ({ page }) => {
  await page.goto("/")
  const knop = page.getByRole("button", { name: "Wat kost een traject?" })
  await expect(knop).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByText("Je krijgt altijd een vaste prijs vooraf")).toBeAttached()
  await knop.click()
  await expect(knop).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("Je krijgt altijd een vaste prijs vooraf")).toBeVisible()
})

test("aanvraag: verder zonder keuze geeft een fout en blijft op stap 1", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/start-een-project")
  await expect(page.getByText("Stap 1 van 4")).toBeVisible()
  await expect(page.locator("nav[data-menu]")).toBeHidden()
  await page.getByRole("button", { name: /Volgende stap/ }).click()
  await expect(page.locator(".hw-samenvatting")).toContainText("Kies wat je wilt laten doen")
  await expect(page.getByText("Stap 1 van 4")).toBeVisible()
})

test("aanvraag: vier stappen tot de bevestiging, met referentie", async ({ page }) => {
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
  await expect(page.getByText("Stap 2 van 4")).toBeVisible()
  await page.getByLabel("Korte toelichting").fill("De vijver is groen en het filter is oud.")
  await page.getByLabel("Postcode").fill("6171 AB")
  await verder.click()
  await expect(page.getByText("Stap 3 van 4")).toBeVisible()
  await page.getByText("€ 5.000 – 10.000").click()
  await verder.click()
  await expect(page.locator(".hw-samenvatting")).toContainText("Kies wanneer je wilt beginnen")
  await page.getByText("Binnen 3 maanden").click()
  await verder.click()
  await expect(page.getByText("Stap 4 van 4")).toBeVisible()
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

test("voor/nu: de schuif werkt met het toetsenbord en verschuift de grens", async ({ page }) => {
  await page.goto("/")
  const schuif = page.getByRole("slider", { name: "Schuif tussen voor en nu" })
  await schuif.focus()
  await expect(schuif).toHaveValue("50")
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowLeft")
  await expect(schuif).toHaveValue("40")
  const pos = await page.locator(".ho-vergelijk").evaluate((e) => getComputedStyle(e).getPropertyValue("--pos").trim())
  expect(pos).toBe("40%")
})
