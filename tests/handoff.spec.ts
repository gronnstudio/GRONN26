import { expect, test } from "./fixtures"

// De kop, het menu en de voorpagina uit de visuele bouwbrief (21 nov 2026), en
// de projectaanvraag in vier stappen (13 nov 2026), zowel de foutroute als de
// gelukte route.

test("desktop @1440: het logo bovenaan, het dock onderin, Werk gaat naar /werk", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  await expect(page.getByRole("link", { name: /GRØNN Studio, naar de voorpagina/ }).first()).toBeVisible()
  const nav = page.getByRole("navigation", { name: "Hoofdmenu" })
  const box = (await nav.boundingBox())!
  expect(box.y + box.height).toBeGreaterThan(900 - 120)
  await nav.getByRole("link", { name: "Werk", exact: true }).click()
  await expect(page).toHaveURL(/\/werk$/)
})

test("donker thema werkt op de voorpagina", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gronn-weergave", JSON.stringify({ kleur: "donker" })))
  await page.goto("/")
  await expect(page.locator("html")).toHaveClass(/donker/)
})

// Het dock van de live site (eigenaar, 22 nov 2026), met een groot uitklappend menu waarin ook Shop staat.
test("telefoon @390: het logo bovenin, het dock onderin, Menu klapt groot uit met Shop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await expect(page.getByRole("link", { name: /GRØNN Studio, naar de voorpagina/ }).first()).toBeVisible()
  const nav = page.getByRole("navigation", { name: "Hoofdmenu" })
  const menu = nav.getByRole("button", { name: "Menu" })
  await expect(menu).toBeInViewport()
  const vak = (await menu.boundingBox())!
  expect(vak.y + vak.height).toBeGreaterThan(844 - 90)
  await menu.click()
  const shop = page.locator("#ar-dock-menu").getByRole("link", { name: "Shop", exact: true })
  await expect(shop).toBeVisible()
  const woord = await shop.locator(".ar-dock-naam").evaluate((e) => parseFloat(getComputedStyle(e).fontSize))
  expect(woord).toBeGreaterThanOrEqual(28)
  await page.keyboard.press("Escape")
  await expect(menu).toBeFocused()
})

// De opening uit de bouwbrief: de gekozen tuin met label, Kennismaken en Bekijk het werk.
test("voorpagina: de opening met Kennismaken en Bekijk het werk", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("#ls-titel")).toContainText("Een tuin die met je meegroeit.")
  await expect(page.locator(".ls-hero").getByRole("link", { name: "Kennismaken" })).toHaveAttribute("href", "/kennismaken")
  await expect(page.locator(".ls-hero").getByRole("link", { name: "Bekijk het werk" })).toHaveAttribute("href", "/werk")
})

// Sfeer en AI dragen altijd hun label; een projectkaart nooit (brief §08).
// Geen herkomstlabels op beelden (eigenaar, 21 nov 2026: "ai visualisatie wil ik nergens zien!").
for (const pad of ["/", "/vijvers", "/tuinen", "/werk/vijverrenovatie"]) {
  test(`${pad}: geen labels op de beelden`, async ({ page }) => {
    await page.goto(pad)
    await expect(page.locator(".ls-herkomst")).toHaveCount(0)
    await expect(page.locator("main")).not.toContainText(/AI-visualisatie|Sfeerbeeld/i)
  })
}

test("minder beweging: de opening staat meteen in het kader", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const p = await page.locator(".ls-hero").evaluate((e) => getComputedStyle(e).getPropertyValue("--p").trim())
  expect(p).toBe("1")
})

test("aanvraag: verder zonder keuze geeft een fout en blijft op stap 1", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/start-een-project")
  await expect(page.getByText("Stap 1 van 4")).toBeVisible()
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

test("Tuinen in de kop: de pagina schuift binnen met een view transition van het type schuif", async ({ page }) => {
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
  await page.getByRole("navigation", { name: "Hoofdmenu" }).getByRole("link", { name: "Tuinen" }).click()
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

test("pijlen zijn getekend (svg), geen ↗-teken dat op iPhone een emoji wordt", async ({ page }) => {
  await page.goto("/")
  const tekst = await page.locator("main").innerText()
  expect(tekst).not.toMatch(/[↗↓↑]/)
})

test("voorpagina: onder de voet staat geen lege strook", async ({ page }) => {
  await page.goto("/")
  const gat = await page.evaluate(() => Math.round(document.documentElement.scrollHeight - (document.querySelector("footer.ls-voet")!.getBoundingClientRect().bottom + scrollY)))
  expect(gat).toBeLessThanOrEqual(0)
})
