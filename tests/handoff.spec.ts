import { expect, test } from "./fixtures"

// De handoff "Website 2027" (12 nov 2026): de kop met menu, en de
// projectaanvraag in vier stappen (13 nov 2026), zowel de foutroute als de
// gelukte route. Op de telefoon staat het dock in plaats van de kop.

test("desktop @1440: het dock staat onderaan, Werk gaat naar /werk", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const nav = page.locator("nav[data-menu]")
  await expect(nav).toBeVisible()
  const box = await nav.boundingBox()
  expect(box!.y + box!.height).toBeGreaterThan(800)
  await expect(page.locator(".ho-kop")).toBeHidden()
  await nav.getByRole("link", { name: "Werk" }).click()
  await expect(page).toHaveURL(/\/werk$/)
})

test("donker thema werkt op de handoff-voorpagina", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gronn-weergave", JSON.stringify({ kleur: "donker" })))
  await page.goto("/")
  await expect(page.locator("html")).toHaveClass(/donker/)
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

test("Ontdek tuinrenovatie: de pagina schuift binnen met een view transition van het type schuif", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: string[] }
    w.__vt = []
    const orig = document.startViewTransition?.bind(document)
    if (!orig) return
    document.startViewTransition = ((arg: unknown) => {
      const types = (arg as { types?: string[] })?.types ?? []
      w.__vt.push(...types)
      return orig(arg as Parameters<typeof orig>[0])
    }) as typeof document.startViewTransition
  })
  await page.goto("/")
  await page.getByRole("link", { name: /Ontdek tuinrenovatie/ }).click()
  await expect(page).toHaveURL(/\/tuinen$/)
  expect(await page.evaluate(() => (window as unknown as { __vt: string[] }).__vt)).toContain("schuif")
})

test("donker: de voet onder de voorpagina blijft donker", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gronn-weergave", JSON.stringify({ kleur: "donker" })))
  await page.goto("/")
  const achtergrond = await page.locator("footer").last().evaluate((e) => getComputedStyle(e).backgroundColor)
  const [r, g, b] = achtergrond.match(/\d+/g)!.map(Number)
  expect(r + g + b).toBeLessThan(200)
})

test("voorpagina: de voet sluit direct aan op de eind-CTA, geen lege balk", async ({ page }) => {
  await page.goto("/")
  const gat = await page.evaluate(() => {
    const eind = document.querySelector("#ho-eind")!.getBoundingClientRect().bottom
    const voet = document.querySelector("footer.bos-vlak")!.getBoundingClientRect().top
    return Math.round(voet - eind)
  })
  expect(gat).toBe(0)
})
