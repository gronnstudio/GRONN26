import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

// De budgetvraag in het contactformulier (eigenaar, 23 sep 2026).
//
// Drie keuzes, verplicht, en bewust GEEN "weet ik niet" (Nick:
// "absoluut geen weet ik niet"). Zonder keuze gaat er niets de deur uit:
// de browser houdt het versturen tegen zoals bij de andere verplichte
// velden, de focus landt op de eerste pil en er staat een foutregel die
// aan de radio's hangt. Met een keuze reist het budget mee naar
// FormSubmit — als eigen veld én in de berichttekst, dezelfde tekst die
// bij een mislukte verzending het e-mailconcept vult.

const BUDGET = {
  nl: { legenda: "Wat is je budget?", keuzes: ["Tot € 5.000", "€ 5.000–15.000", "Meer dan € 15.000"], fout: "Kies je budget.", verstuur: "Verstuur", dank: "Dank je, je bericht is binnen." },
  en: { legenda: "What is your budget?", keuzes: ["Up to €5,000", "€5,000–15,000", "More than €15,000"], fout: "Choose your budget.", verstuur: "Send", dank: "Thank you, your message has arrived." },
} as const

const PAD = { nl: "/nl/contact", en: "/contact" } as const

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

/** Vangt elke verzending naar FormSubmit af en antwoordt "gelukt". */
async function vangFormSubmit(page: Page) {
  const verzonden: Record<string, string>[] = []
  await page.route("https://formsubmit.co/**", async (route) => {
    verzonden.push(JSON.parse(route.request().postData() ?? "{}"))
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' })
  })
  return verzonden
}

async function vulDeRest(page: Page, locale: "nl" | "en") {
  const form = page.locator("form").filter({ has: page.locator('input[name="budget"]') })
  await form.locator('input[name="naam"]').fill("Test Persoon")
  await form.locator('input[name="email"]').fill("test@voorbeeld.nl")
  await form.locator('textarea[name="bericht"]').fill(locale === "nl" ? "Een vijver van zes meter." : "A six metre pond.")
  return form
}

for (const locale of ["nl", "en"] as const) {
  const b = BUDGET[locale]

  test(`${locale}: drie budgetkeuzes, geen 'weet ik niet', niets vooraf gekozen`, async ({ page }) => {
    await page.goto(PAD[locale])
    const groep = page.getByRole("group", { name: b.legenda })
    await expect(groep).toBeVisible()
    const radios = groep.getByRole("radio")
    await expect(radios).toHaveCount(3)
    for (const [i, keuze] of b.keuzes.entries()) {
      await expect(radios.nth(i)).toHaveAccessibleName(keuze)
      await expect(radios.nth(i)).not.toBeChecked()
    }
    await expect(groep).not.toContainText(/weet ik|not sure|unknown|onbekend/i)
    // Dezelfde pillen als "Waar gaat het over?": rond, zelfde element.
    const soortPil = page.getByRole("group", { name: locale === "nl" ? "Waar gaat het over?" : "What is it about?" }).locator("label span").first()
    expect(await groep.locator("label span").first().getAttribute("class")).toBe(await soortPil.getAttribute("class"))
    expect(await soortPil.getAttribute("class")).toContain("rounded-full")
  })

  test(`${locale}: zonder budget gaat er niets weg — foutregel, focus op de eerste keuze`, async ({ page }) => {
    const verzonden = await vangFormSubmit(page)
    await page.goto(PAD[locale])
    const form = await vulDeRest(page, locale)
    await form.getByRole("button", { name: b.verstuur }).click()

    const eerste = page.getByRole("radio", { name: b.keuzes[0] })
    await expect(eerste).toBeFocused()
    const fout = page.getByText(b.fout, { exact: true })
    await expect(fout).toBeVisible()
    // De foutregel hangt aan elke radio: een schermlezer leest hem voor
    // zodra de focus op een keuze landt.
    const foutId = await fout.getAttribute("id")
    expect(foutId).toBeTruthy()
    for (const keuze of b.keuzes) {
      await expect(page.getByRole("radio", { name: keuze })).toHaveAttribute("aria-describedby", foutId!)
    }
    await expect(eerste).toHaveAccessibleDescription(b.fout)
    expect(await eerste.evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true)
    expect(verzonden).toHaveLength(0)

    // Een keuze maken haalt de fout weg.
    await page.locator("label", { hasText: b.keuzes[1] }).click()
    await expect(fout).toHaveCount(0)
    await expect(page.getByRole("radio", { name: b.keuzes[1] })).not.toHaveAttribute("aria-describedby", /.+/)
  })

  test(`${locale}: met budget reist de keuze mee naar FormSubmit`, async ({ page }) => {
    const verzonden = await vangFormSubmit(page)
    await page.goto(PAD[locale])
    const form = await vulDeRest(page, locale)
    await page.locator("label", { hasText: b.keuzes[2] }).click()
    await expect(page.getByRole("radio", { name: b.keuzes[2] })).toBeChecked()
    await form.getByRole("button", { name: b.verstuur }).click()
    await expect(page.getByText(b.dank)).toBeVisible()

    expect(verzonden).toHaveLength(1)
    expect(verzonden[0].budget).toBe(b.keuzes[2])
    // Ook in de berichttekst, die bij een mislukte verzending het
    // e-mailconcept vult.
    expect(verzonden[0].message).toContain(`Budget: ${b.keuzes[2]}`)
    expect(verzonden[0].email).toBe("test@voorbeeld.nl")
  })
}

test("axe: /nl/contact met de budgetfout zichtbaar", async ({ page }) => {
  await vangFormSubmit(page)
  await page.goto("/nl/contact", { waitUntil: "networkidle" })
  const form = await vulDeRest(page, "nl")
  await form.getByRole("button", { name: "Verstuur" }).click()
  await expect(page.getByText(BUDGET.nl.fout, { exact: true })).toBeVisible()
  const res = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
})
