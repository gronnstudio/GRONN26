import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { encode } from "next-auth/jwt"

// DEV-laag (25 sep 2026): een verborgen gereedschapslaag voor de eigenaar.
// Wat hier bewaakt wordt: het gezag komt ALLEEN uit de NextAuth-sessie.
// Een bezoeker die localStorage met de hand zet, krijgt niets — geen
// paneel, geen flags, geen luisteraars. De eigenaar (een echte, door de
// server ondertekende sessie) krijgt het paneel.

const PAD = "/nl/stack"
// Dezelfde WCAG-set als a11y.spec (de best-practice `region` hoort daar niet bij).
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

async function openToegang(page: Page) {
  await page.goto(PAD)
  const knop = page.locator("[data-dev-toegang]")
  await knop.scrollIntoViewIfNeeded()
  await knop.click()
  return page.locator("[data-dev-toegang-paneel]")
}

test("dev-laag: /api/dev/sessie zegt eigenaar:false zonder sessie", async ({ request }) => {
  const res = await request.get("/api/dev/sessie")
  expect(res.status()).toBe(200)
  expect(await res.json()).toEqual({ eigenaar: false })
  // Een query of een verzonnen cookie verandert daar niets aan.
  const nep = await request.get("/api/dev/sessie?eigenaar=true", {
    headers: { cookie: "next-auth.session-token=nep; gronn-dev-laag=aan" },
  })
  expect(await nep.json()).toEqual({ eigenaar: false })
})

test("dev-laag: bezoeker ziet 'Alleen voor de eigenaar', ook met de vlag met de hand gezet", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("gronn-dev-laag", "aan")
    localStorage.setItem("gronn-dev-flags", JSON.stringify({ winkel: true }))
  })
  const paneel = await openToegang(page)
  await expect(paneel.getByText("Alleen voor de eigenaar")).toBeVisible()
  await expect(paneel.getByRole("link", { name: "Inloggen" })).toHaveAttribute("href", "/editor")
  await expect(page.locator("[data-dev-schakelaar]")).toHaveCount(0)
  await expect(page.locator("[data-dev-paneel]")).toHaveCount(0)
  // useFlag("winkel") blijft de standaard voor bezoekers.
  await expect(page.locator("[data-flag-winkel]")).toHaveAttribute("data-flag-winkel", "false")
  // Een zelfgestuurd DEV-event doet niets: er luistert niemand.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("gronn:dev", { detail: { soort: "offline", aan: true } })))
  await expect(page.locator("[data-offline-melding]")).toHaveCount(0)
})

test("dev-laag: axe op /nl/stack, dicht en met de toegang open", async ({ page }) => {
  await page.goto(PAD, { waitUntil: "networkidle" })
  await page.waitForTimeout(3500)
  const dicht = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(dicht.violations.map((v) => v.id)).toEqual([])
  // Open: de knop en het paneel zelf.
  await openToegang(page)
  await expect(page.getByText("Alleen voor de eigenaar")).toBeVisible()
  const open = await new AxeBuilder({ page }).withTags(TAGS).include("[data-dev-toegang]").include("[data-dev-toegang-paneel]").analyze()
  expect(open.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([])
})

// De eigenaar: geen login-helper in de suite, dus een echte NextAuth-JWT,
// ondertekend met hetzelfde NEXTAUTH_SECRET als de server. Zonder dat
// geheim in de testomgeving wordt deze test overgeslagen.
test("dev-laag: de eigenaar krijgt schakelaar, paneel, flag en meldingen", async ({ page, context, baseURL }) => {
  const secret = process.env.NEXTAUTH_SECRET
  test.skip(!secret, "NEXTAUTH_SECRET ontbreekt in de testomgeving")
  const email = (process.env.EDITOR_ALLOWED_EMAIL ?? "hello@gronn.studio").toLowerCase()
  const token = await encode({ token: { email, name: "Nick", sub: "eigenaar" }, secret: secret! })
  await context.addCookies([{ name: "next-auth.session-token", value: token, url: baseURL! }])

  expect(await (await page.request.get("/api/dev/sessie")).json()).toEqual({ eigenaar: true })

  const paneel = await openToegang(page)
  const schakelaar = paneel.locator("[data-dev-schakelaar]")
  await expect(schakelaar).toBeVisible()
  await schakelaar.check()
  const dev = page.locator("[data-dev-paneel]")
  await expect(dev).toBeVisible()
  // Build-stempel: buiten Vercel "lokaal".
  await expect(dev.locator("[data-dev-build]")).toContainText("lokaal")

  await expect(page.locator("[data-flag-winkel]")).toHaveAttribute("data-flag-winkel", "false")
  await dev.locator("[data-dev-flag=winkel]").check()
  await expect(page.locator("[data-flag-winkel]")).toHaveAttribute("data-flag-winkel", "true")

  await dev.getByRole("button", { name: "Offline" }).click()
  await expect(page.locator("[data-offline-melding]")).toBeVisible()
  await dev.getByRole("button", { name: "Weer online" }).click()
  await expect(page.locator("[data-offline-melding]")).toHaveCount(0)

  // Na herladen: de schakelaar staat nog aan en de server bevestigt opnieuw.
  await page.reload()
  await expect(page.locator("[data-dev-paneel]")).toBeVisible()

  // Uitloggen (cookie weg) → niets meer, ook al staat localStorage aan.
  await context.clearCookies()
  await page.reload()
  await expect(page.locator("[data-dev-schakelaar]")).toHaveCount(0)
  await expect(page.locator("[data-dev-paneel]")).toHaveCount(0)
  await expect(page.locator("[data-flag-winkel]")).toHaveAttribute("data-flag-winkel", "false")
})
