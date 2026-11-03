import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

// axe-core over the pages a juror actually visits, both locales where
// the templates differ. The contrast auditor (scripts/check-contrast.mjs)
// already proves the token pairs; axe catches everything structural —
// names, roles, landmarks, order.
const PAGES = [
  "/",
  "/nl",
  "/projects",
  "/nl/studio",
  "/contact",
  "/nl/contact",
  // The questions page: eight native disclosures, one open, and the
  // FAQPage JSON-LD beside them.
  "/nl/faq",
  // The tech stack page (24 Sep 2026): radio pills, a search field, a
  // live count and native disclosures inside cards.
  "/nl/stack",
  "/stack",
  // The garden calendar (28 Sep 2026): twelve month cards, two sun/moon
  // cards filled in after hydration, and a stacking table.
  "/nl/calendar",
  "/calendar",
  // The knowledge base (3 Oct 2026): a search field, two rows of radio
  // pills, a live count and hidden cards; and one article page.
  // The priced surfaces: a service detail page carries a table, a text
  // input and a live result region that none of the other templates have.
  "/services",
  "/services/pond-autumn-service",
  "/nl/services/pond-autumn-service",
  // A detail page with a breadcrumb trail: a nav landmark whose only
  // content is an ordered list, one item of which is not a link.
  "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop",
  // The short project template (the terrace), since 24 Sep 2026.
  "/nl/projects/terras-geulle-24-m2-betontegels",
  // The bento link page for the Instagram bio (27 Sep 2026): outside
  // [locale], no site chrome, a grid of link tiles and one list of links.
  "/links",
  // The deep intake form, in both languages, and the reason it is worth
  // its own two entries: it is the longest form on the site, the one a
  // client is asked to sit down with, and it was never in this sweep.
  // Adding it found a closing band at 1.15:1 on five palettes, file
  // inputs with no accessible name at all, and an answer field whose own
  // translucent fill pushed its text under the floor. Three defects on
  // the page the studio most needs to work.
  "/contact/intake",
  "/nl/contact/intake",
]

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" })
    // Let the opening veil lift and entrances settle so axe scans the
    // page a visitor sees, not the boot state.
    await page.waitForTimeout(3500)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // The wireframe canvas is aria-hidden decoration; axe sometimes
      // flags the WebGL canvas element itself in emulated environments.
      .exclude("canvas")
      .analyze()
    expect(
      results.violations,
      results.violations
        .map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`)
        .join("\n")
    ).toEqual([])
  })
}

// The mega menu is only in the DOM once opened, so the loop above never
// sees it. Its panel carries two lists, prices and a photo card — worth
// its own scan in the state a visitor actually reads it in.
// Both bar variants are scanned: they carry different content behind
// different controls, and only one of them can ship.
// The shortcut help sheet is only in the DOM once "?" is pressed, so
// the loop above never sees it. It is a modal dialog with a focus trap —
// exactly the shape that goes wrong quietly.
test("axe: shortcut help, open", async ({ page, isMobile }) => {
  test.skip(isMobile, "single-key shortcuts are a keyboard surface")
  await page.goto("/", { waitUntil: "networkidle" })
  await page.waitForTimeout(3500)
  await page.keyboard.press("?")
  const sheet = page.locator("[role='dialog'][aria-labelledby='shortcut-help-title']")
  await expect(sheet).toBeVisible()
  // toBeVisible passes at opacity 0. Scanning mid-fade measured the text
  // blended into the backdrop (3.08:1) — a state nobody reads in.
  await expect(sheet).toHaveCSS("opacity", "1")
  await expect(sheet.locator("..")).toHaveCSS("opacity", "1")
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(
    results.violations,
    results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")
  ).toEqual([])
})

for (const [name, url, panel] of [
  ["services panel", "/", "bar-panel-services"],
  ["studio panel", "/", "bar-panel-studio"],
  ["concept menu", "/", "concept-menu"],
]) {
test(`axe: ${name}, open`, async ({ page, isMobile }) => {
  test.skip(isMobile, "the bar panels are desktop/tablet chrome")
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(3500)
  await page.locator(`button[aria-controls='${panel}']`).click()
  await expect(page.locator(`#${panel}`)).toBeVisible()
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(
    results.violations,
    results.violations
      .map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`)
      .join("\n")
  ).toEqual([])
})
}

// De telefoonnavigatie had lang geen axe-scan: de lus hierboven is
// desktop-only, en niemand opende het menu. Dat is nu twee oppervlakken
// — de dock onderaan en de twee hoekpanelen bovenin — en samen zijn ze
// alles wat een telefoon aan bediening heeft. Ze moeten dus alle drie
// schoon zijn.
//
// Weergave is het paneel dat gescand wordt omdat het het zwaarste is:
// zes knoppen die elk hun eigen toestand dragen, waarvan er twee een
// waarde in hun label meedragen. Welk toegankelijkheidsgebrek de
// gedeelde knop ook heeft, dit is het paneel waar het opvalt.
test("axe: de telefoonnavigatie, met een paneel open", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "de dock is telefoonchroom")
  await page.goto("/nl", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  await expect(page.locator("nav[data-nav='dock']")).toBeVisible()
  await page.getByRole("button", { name: /Weergave/ }).click()
  await expect(page.getByRole("group", { name: /Weergave/ })).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("canvas")
    .analyze()
  expect(
    results.violations,
    results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")
  ).toEqual([])
})

// Het andere hoekpaneel, in beide uren: sinds 23 sep 2026 draagt het de
// taalschakelaar met vlaggen, en de niet-gekozen helft staat in
// `--muted` op het glas van het paneel. Dat moet op licht én donker
// leesbaar blijven.
// Sinds 24 sep 2026 heten de twee standen voor de bezoeker Licht en Donker.
for (const uur of ["Licht", "Donker"]) {
  test(`axe: het kleurpaneel met de taalschakelaar, ${uur}`, async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "de hoekknoppen zijn telefoonchroom")
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    await page.getByRole("button", { name: /Kleur en taal/ }).click()
    const paneel = page.getByRole("group", { name: /Kleur en taal/ })
    await paneel.getByRole("button", { name: new RegExp(`^${uur}`) }).click()
    await expect(paneel.getByRole("group", { name: "Taal" })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("canvas")
      .analyze()
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")
    ).toEqual([])
  })
}

// ── De voorkeuren overleven de hydratie ───────────────────────────────
//
// DIT STOND AL OP PRODUCTIE EN NIEMAND ZAG HET. De pre-paint-regel in
// `layout.tsx` zet `data-motion`, `data-underline`, `data-text` en
// `data-contrast` op <html> vóór de eerste verf — precies zoals het
// hoort, want anders flitst de pagina in de verkeerde stand voorbij. Maar
// de server rendert <html> zónder die attributen, dus verzoende React ze
// er bij de hydratie weer af.
//
// Gemeten toen het misging: op t=0 stonden alle vier erop, op t=100ms
// geen enkele. Gevolg: "onderstreep elke link" en "minder beweging"
// gingen bij ÉLKE paginalading stilletjes uit — de twee instellingen die
// bestaan omdat de eigenaar zelf koppen niet van links kon onderscheiden.
//
// Niets crashte, geen enkele test viel om, en op het scherm was het
// alleen te zien als je wist waar je naar keek. Vandaar deze: hij meet
// niet dat de knop werkt, maar dat de uitkomst een seconde later nog
// steeds waar is.
test("a11y-voorkeuren overleven de hydratie", async ({ page }) => {
  await page.goto("/nl", { waitUntil: "domcontentloaded" })
  await page.evaluate(() => {
    localStorage.setItem("gronn-a11y-text", "large")
    localStorage.setItem("gronn-a11y-contrast", "more")
    localStorage.setItem("gronn-a11y-motion", "reduced")
    localStorage.setItem("gronn-a11y-underline", "on")
  })
  await page.reload({ waitUntil: "networkidle" })
  // Ruim voorbij het moment waarop ze verdwenen (~100ms na hydratie).
  await page.waitForTimeout(1500)

  const html = page.locator("html")
  await expect(html).toHaveAttribute("data-text", "large")
  await expect(html).toHaveAttribute("data-contrast", "more")
  await expect(html).toHaveAttribute("data-motion", "reduced")
  await expect(html).toHaveAttribute("data-underline", "on")

  // En ze doen ook echt iets: 125% wortelmaat is de hele reden dat
  // `data-text` bestaat.
  const size = await page.evaluate(
    () => parseFloat(getComputedStyle(document.documentElement).fontSize)
  )
  expect(size).toBeGreaterThan(17)
})

// Blauwe Uur: het actieve menu-item en de pijltjes in de balk waren
// bosgroen op antraciet, 1,6:1 (eigenaar, 23 sep 2026: "contrastwaardig
// moeilijk leesbaar"). De losse axe-rondes hierboven draaien in het uur
// van de klok, dus deze zet Blauwe Uur zelf aan.
test("axe: de kop in Blauwe Uur, met een actief menu-item", async ({ page, isMobile }) => {
  test.skip(isMobile, "de balk met menu-items is desktop/tablet")
  await page.addInitScript(() => {
    localStorage.setItem("theme", "bluehour")
    localStorage.setItem("gronn-theme-mode", "manual")
  })
  await page.goto("/nl/studio", { waitUntil: "networkidle" })
  await expect(page.locator("html")).toHaveClass(/bluehour/)
  await page.waitForTimeout(1500)
  const results = await new AxeBuilder({ page }).include("header").withTags(["wcag2aa"]).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}×`)).toEqual([])
})
