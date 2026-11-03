import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

// De invulvelden van het contactformulier (eigenaar, 28 sep 2026: "voor
// invulvelden geef een licht gedrukt voorbeeld op en verbeter als het
// veld niet juist word ingevuld").
//
//   · elk veld heeft een licht gedrukt VOORBEELD, en het label blijft;
//   · controle bij blur (niet tijdens het typen), na een fout bij invoer;
//   · de foutregel staat onder het veld en hangt eraan (aria-invalid,
//     aria-describedby); kleine fouten worden rechtgezet en dat staat er;
//   · versturen wordt tegengehouden met de focus op het eerste foute veld;
//   · FormSubmit, honeypot en mailto-terugval blijven zoals ze waren.
// FormSubmit wordt altijd afgevangen: deze spec verstuurt nooit echt.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

async function vangFormSubmit(page: Page, status = 200) {
  const verzonden: Record<string, string>[] = []
  await page.route("https://formsubmit.co/**", async (route) => {
    verzonden.push(JSON.parse(route.request().postData() ?? "{}"))
    await route.fulfill({
      status,
      contentType: "application/json",
      body: status === 200 ? '{"success":"true"}' : '{"success":"false"}',
    })
  })
  return verzonden
}

const formulier = (page: Page) => page.locator("form").filter({ has: page.locator('input[name="budget"]') })

/** De melding die via aria-describedby aan het veld hangt. */
async function melding(page: Page, veld: Locator) {
  const id = await veld.getAttribute("aria-describedby")
  expect(id, "het veld verwijst naar een melding").toBeTruthy()
  return page.locator(`[id="${id}"]`)
}

const VOORBEELDEN = {
  nl: {
    pad: "/nl/contact",
    velden: [
      ["naam", "Naam", "bijv. Anna de Vries"],
      ["email", "E-mail", "bijv. naam@voorbeeld.nl"],
      ["telefoon", "Telefoon", "bijv. 06 12 34 56 78"],
      ["plaats", "Plaats of postcode", "bijv. Stein of 6171 AB"],
      ["bericht", "Vertel kort over je tuin of vijver", /^bijv\. Een vijver van zo’n 3 × 4 meter/],
    ],
  },
  en: {
    pad: "/contact",
    velden: [
      ["naam", "Name", "e.g. Anna de Vries"],
      ["email", "E-mail", "e.g. name@example.com"],
      ["telefoon", "Phone", "e.g. +31 6 12 34 56 78"],
      ["plaats", "Town or postcode", "e.g. Stein or 6171 AB"],
      ["bericht", "Tell me briefly about your garden or pond", /^e\.g\. A pond of about 3 × 4 metres/],
    ],
  },
} as const

for (const locale of ["nl", "en"] as const) {
  test(`${locale}: elk veld heeft een voorbeeld, en het label blijft zichtbaar`, async ({ page }) => {
    await page.goto(VOORBEELDEN[locale].pad)
    const form = formulier(page)
    for (const [naam, label, voorbeeld] of VOORBEELDEN[locale].velden) {
      const veld = form.locator(`[name="${naam}"]`)
      await expect(veld).toHaveAttribute("placeholder", voorbeeld)
      // Het voorbeeld is nooit het label: het veld heet nog steeds naar
      // het zichtbare label erboven.
      const labelEl = form.locator(`label[for="${await veld.getAttribute("id")}"]`)
      await expect(labelEl).toBeVisible()
      await expect(labelEl).toContainText(label)
      await expect(veld).toHaveAccessibleName(new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`))
      expect(await veld.getAttribute("placeholder")).not.toBe(label)
    }
  })
}

for (const uur of ["goldenhour", "bluehour"] as const) {
  test(`${uur}: het voorbeeld is licht gedrukt — stiller dan muted, toch 4,5:1 op de veldgrond`, async ({ page }) => {
    await page.addInitScript((u) => {
      localStorage.setItem("theme", u)
      localStorage.setItem("gronn-theme-mode", "manual")
    }, uur)
    await page.goto("/nl/contact")
    await expect(page.locator("html")).toHaveClass(new RegExp(uur))
    const maat = await formulier(page)
      .locator('input[name="naam"]')
      .evaluate((el) => {
        const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => {
            const s = v / 255
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
          }
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
        }
        const c = (a: number[], b: number[]) => {
          const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
          return (x + 0.05) / (y + 0.05)
        }
        const grond = rgb(getComputedStyle(el).backgroundColor)
        const voorbeeld = rgb(getComputedStyle(el, "::placeholder").color)
        const muted = rgb(getComputedStyle(document.documentElement).getPropertyValue("--muted").trim().replace(/^#(..)(..)(..)$/, (_, r, g, b) => `${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)}`))
        return { voorbeeld: c(voorbeeld, grond), muted: c(muted, grond) }
      })
    expect(maat.voorbeeld).toBeGreaterThanOrEqual(4.5)
    expect(maat.voorbeeld).toBeLessThan(maat.muted)
  })
}

test("fout bij blur, niet tijdens het typen; de melding verdwijnt na correctie", async ({ page }) => {
  await page.goto("/nl/contact")
  const form = formulier(page)
  const email = form.locator('input[name="email"]')

  // Met Tab door een leeg veld: nog geen fout.
  await email.focus()
  await email.press("Tab")
  await expect(email).not.toHaveAttribute("aria-invalid", /.*/)

  // Tijdens het typen: nog geen fout.
  await email.focus()
  await email.pressSequentially("anna.voorbeeld")
  await expect(email).not.toHaveAttribute("aria-invalid", /.*/)
  await expect(form.locator('[data-veld-melding="fout"]')).toHaveCount(0)

  // Bij blur wel, direct onder het veld, met wat er wél verwacht wordt.
  await email.blur()
  await expect(email).toHaveAttribute("aria-invalid", "true")
  const fout = await melding(page, email)
  await expect(fout).toHaveText("Er mist een @. Een e-mailadres ziet eruit als naam@voorbeeld.nl.")
  await expect(email).toHaveAccessibleDescription("Er mist een @. Een e-mailadres ziet eruit als naam@voorbeeld.nl.")
  // Direct onder het veld en links gelijk ermee.
  const v = (await email.boundingBox())!
  const m = (await fout.boundingBox())!
  expect(Math.round(m.x)).toBe(Math.round(v.x))
  expect(m.y).toBeGreaterThan(v.y + v.height)
  expect(m.y - (v.y + v.height)).toBeLessThanOrEqual(12)

  // Na de eerste fout: hertoetsen bij invoer, zonder blur. De melding
  // past zich aan en verdwijnt zodra het adres klopt.
  await email.focus()
  await email.press("End")
  await email.pressSequentially("@voorbeeld")
  await expect(fout).toHaveText("Na de @ mist nog iets, zoals voorbeeld.nl in naam@voorbeeld.nl.")
  await email.pressSequentially(".nl")
  await expect(email).toBeFocused()
  await expect(email).not.toHaveAttribute("aria-invalid", /.*/)
  await expect(email).not.toHaveAttribute("aria-describedby", /.*/)
  await expect(form.locator('[data-veld-melding="fout"]')).toHaveCount(0)
})

test("telefoon: te kort zegt hoeveel cijfers, zoals welk voorbeeld", async ({ page }) => {
  await page.goto("/nl/contact")
  const tel = formulier(page).locator('input[name="telefoon"]')
  await tel.fill("06 1234")
  await tel.blur()
  await expect(tel).toHaveAttribute("aria-invalid", "true")
  await expect(await melding(page, tel)).toHaveText("Dit telefoonnummer is te kort: 10 cijfers, zoals 06 12 34 56 78.")
  await tel.fill("06 12 34 56 78")
  await expect(tel).not.toHaveAttribute("aria-invalid", /.*/)
  // Leeg mag: het veld is optioneel.
  await tel.fill("")
  await tel.blur()
  await expect(tel).not.toHaveAttribute("aria-invalid", /.*/)
})

test("kleine fouten worden rechtgezet, en dat staat er: postcode en spaties rond het adres", async ({ page }) => {
  await page.goto("/nl/contact")
  const form = formulier(page)

  const plaats = form.locator('input[name="plaats"]')
  await plaats.fill("6171ab")
  await plaats.blur()
  await expect(plaats).toHaveValue("6171 AB")
  await expect(plaats).not.toHaveAttribute("aria-invalid", /.*/)
  const opm = await melding(page, plaats)
  await expect(opm).toHaveText("Genoteerd als 6171 AB.")
  await expect(opm).toHaveAttribute("data-veld-melding", "opmerking")

  // Geen postcode en geen plaats: zeggen wat er verwacht wordt.
  await plaats.fill("617")
  await plaats.blur()
  await expect(plaats).toHaveAttribute("aria-invalid", "true")
  await expect(await melding(page, plaats)).toHaveText("Een postcode is 4 cijfers, eventueel met 2 letters: 6171 of 6171 AB. Of vul je plaats in.")
  // Een plaatsnaam is altijd goed.
  await plaats.fill("Stein")
  await expect(plaats).not.toHaveAttribute("aria-invalid", /.*/)

  const email = form.locator('input[name="email"]')
  await email.fill("  anna@voorbeeld.nl  ")
  await email.blur()
  await expect(email).toHaveValue("anna@voorbeeld.nl")
  await expect(await melding(page, email)).toHaveText("De spaties rond het adres zijn weggehaald.")
})

// Eigenaar, 29 sep 2026 ("alle punten zijn prima!"): vier cijfers wijzen
// de buurt al aan. Minder vragen, minder gedoe, minder gegevens.
test("alleen de vier cijfers van de postcode is goed, zonder fout of opmerking", async ({ page }) => {
  await page.goto("/nl/contact")
  const plaats = formulier(page).locator('input[name="plaats"]')
  for (const goed of ["6171", " 6171 ", "6171 Stein"]) {
    await plaats.fill(goed)
    await plaats.blur()
    await expect(plaats, goed).toHaveValue(goed.trim())
    await expect(plaats, goed).not.toHaveAttribute("aria-invalid", /.*/)
    await expect(plaats, goed).not.toHaveAttribute("aria-describedby", /.*/)
  }
  // Half getypt blijft een fout: een losse letter, een vijfde cijfer, een 0 vooraan.
  for (const fout of ["6171 a", "6171b", "61712", "0171"]) {
    await plaats.fill(fout)
    await plaats.blur()
    await expect(plaats, fout).toHaveAttribute("aria-invalid", "true")
    await expect(await melding(page, plaats), fout).toHaveText("Een postcode is 4 cijfers, eventueel met 2 letters: 6171 of 6171 AB. Of vul je plaats in.")
  }
})

test("een formulier met alleen de vier cijfers gaat gewoon weg", async ({ page }) => {
  const verzonden = await vangFormSubmit(page)
  await page.goto("/nl/contact")
  const form = formulier(page)
  await form.locator('input[name="naam"]').fill("Anna de Vries")
  await form.locator('input[name="email"]').fill("anna@voorbeeld.nl")
  await form.locator('input[name="plaats"]').fill("6171")
  await page.locator("label", { hasText: "Tot € 5.000" }).click()
  await form.locator('textarea[name="bericht"]').fill("Een vijver die groen blijft.")
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(page.getByText("Dank je, je bericht is binnen.")).toBeVisible()
  expect(verzonden).toHaveLength(1)
  expect(verzonden[0].message).toContain("Plaats of postcode: 6171")
})

test("versturen geblokkeerd: focus op het eerste foute veld, alle fouten zichtbaar, niets verstuurd", async ({ page }) => {
  const verzonden = await vangFormSubmit(page)
  await page.goto("/nl/contact")
  const form = formulier(page)
  // Naam leeg, e-mail fout, bericht leeg, geen budget.
  await form.locator('input[name="email"]').fill("anna@")
  await form.getByRole("button", { name: "Verstuur" }).click()

  const naam = form.locator('input[name="naam"]')
  await expect(naam).toBeFocused()
  await expect(naam).toHaveAttribute("aria-invalid", "true")
  await expect(naam).toHaveAccessibleDescription("Vul je naam in, zoals Anna de Vries.")
  for (const n of ["email", "bericht"]) {
    await expect(form.locator(`[name="${n}"]`)).toHaveAttribute("aria-invalid", "true")
  }
  // Optionele lege velden blijven rustig.
  for (const n of ["telefoon", "plaats"]) {
    await expect(form.locator(`[name="${n}"]`)).not.toHaveAttribute("aria-invalid", /.*/)
  }
  await expect(page.getByText("Kies je budget.", { exact: true })).toBeVisible()

  // Naam ingevuld: nu landt de focus op het volgende foute veld.
  await naam.fill("Anna de Vries")
  await expect(naam).not.toHaveAttribute("aria-invalid", /.*/)
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(form.locator('input[name="email"]')).toBeFocused()
  expect(verzonden).toHaveLength(0)
})

test("een goed formulier gaat naar FormSubmit, met de rechtgezette waarden", async ({ page }) => {
  const verzonden = await vangFormSubmit(page)
  await page.goto("/nl/contact")
  const form = formulier(page)
  await form.locator('input[name="naam"]').fill("Anna de Vries")
  await form.locator('input[name="email"]').fill(" anna@voorbeeld.nl ")
  await form.locator('input[name="telefoon"]').fill("+31 6 12 34 56 78")
  await form.locator('input[name="plaats"]').fill("6171ab")
  await page.locator("label", { hasText: "Tot € 5.000" }).click()
  await form.locator('textarea[name="bericht"]').fill("Een vijver die groen blijft.")
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(page.getByText("Dank je, je bericht is binnen.")).toBeVisible()
  expect(verzonden).toHaveLength(1)
  expect(verzonden[0].email).toBe("anna@voorbeeld.nl")
  expect(verzonden[0].message).toContain("Plaats of postcode: 6171 AB")
  expect(verzonden[0].message).toContain("Telefoon: +31 6 12 34 56 78")
})

test("honeypot: een ingevuld verborgen veld krijgt een bedankje en verstuurt niets", async ({ page }) => {
  const verzonden = await vangFormSubmit(page)
  await page.goto("/nl/contact")
  const form = formulier(page)
  await form.locator('input[name="website"]').evaluate((el) => ((el as HTMLInputElement).value = "http://spam.example"))
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(page.getByText("Dank je, je bericht is binnen.")).toBeVisible()
  expect(verzonden).toHaveLength(0)
})

test("lukt verzenden niet, dan de mailto-terugval — nooit een valse bevestiging", async ({ page }) => {
  const verzonden = await vangFormSubmit(page, 500)
  await page.goto("/nl/contact")
  const form = formulier(page)
  await form.locator('input[name="naam"]').fill("Anna de Vries")
  await form.locator('input[name="email"]').fill("anna@voorbeeld.nl")
  await page.locator("label", { hasText: "Tot € 5.000" }).click()
  await form.locator('textarea[name="bericht"]').fill("Een vijver.")
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(page.getByText("Verzenden lukte niet — er staat een e-mail voor je klaar.")).toBeVisible()
  expect(verzonden).toHaveLength(1)
})

test("axe: /nl/contact in Blauwe Uur met foutregels en een opmerking zichtbaar", async ({ page }) => {
  await vangFormSubmit(page)
  await page.addInitScript(() => {
    localStorage.setItem("theme", "bluehour")
    localStorage.setItem("gronn-theme-mode", "manual")
  })
  await page.goto("/nl/contact", { waitUntil: "networkidle" })
  const form = formulier(page)
  await form.locator('input[name="plaats"]').fill("6171ab")
  await form.locator('input[name="plaats"]').blur()
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(form.locator('[data-veld-melding="fout"]').first()).toBeVisible()
  await expect(form.locator('[data-veld-melding="opmerking"]')).toHaveText("Genoteerd als 6171 AB.")
  const res = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
})
