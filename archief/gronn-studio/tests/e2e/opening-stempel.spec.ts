import { expect, test, type Page } from "@playwright/test"

// De opening zegt wie, wat en WAAR (eigenaar, 23 sep 2026, naar Dan
// Hoye; sinds 3 okt 2026 ook voor wie), is sinds 2 okt 2026 rustig (één knop, geen stempel), en de © in
// de voet wordt even het Ø van het woordmerk.

test.beforeEach(async ({ page }) => {
  // Sla het openingsdoek over: het hoort niet bij deze toets.
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

const OPENING = 'section[aria-labelledby="opening-kop"]'
const VOET_COPY = "footer [data-voet-copy]"
const JAAR = String(new Date().getFullYear())

// Sinds 3 okt 2026 zegt de opening wat en voor wie (eigenaar: "Vijvers en
// tuinen"): vijvers en tuinen, huiseigenaren, Stein en omgeving.
test("de opening zegt wat, voor wie en waar", async ({ page }) => {
  await page.goto("/nl")
  const opening = page.locator(OPENING)
  await expect(opening.getByText("Vijvers en tuinen · Stein en omgeving", { exact: true })).toBeVisible()
  await expect(opening.getByText("Stein, Limburg")).toHaveCount(1)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Een vijver en tuin die gezond blijven.")
  const zin = opening.locator("p.tekst-body")
  await expect(zin).toHaveText(
    "Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf."
  )

  await page.goto("/")
  await expect(page.locator(OPENING).getByText("Ponds and gardens · Stein and around", { exact: true })).toBeVisible()
  await expect(page.locator(OPENING).locator("p.tekst-body")).toHaveText(/^I’m Nick\. I renovate and maintain ponds /)
})

test("het portret onder de knoppen is een deur naar Over mij", async ({ page }) => {
  await page.goto("/nl")
  const link = page.locator(OPENING).getByRole("link", { name: /^Over Nick Peters/ })
  await expect(link).toHaveAttribute("href", "/nl/studio")
  await expect(link).toHaveAccessibleName("Over Nick Peters · Stein, Limburg")
  await expect(link).toHaveAttribute("data-cursor", "about")
  const box = (await link.boundingBox())!
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.width).toBeGreaterThanOrEqual(44)
  // Het ene goedgekeurde portret, als cirkel van 72px (44 was "erg klein").
  const foto = link.locator("img")
  await expect(foto).toHaveAttribute("src", /portret-espresso/)
  const maat = await foto.evaluate((n) => {
    const r = n.getBoundingClientRect()
    return [r.width, r.height, getComputedStyle(n).borderRadius]
  })
  expect(maat.slice(0, 2)).toEqual([72, 72])
  expect(maat[2]).not.toBe("0px")

  await page.goto("/")
  await expect(page.locator(OPENING).getByRole("link", { name: /^About Nick Peters/ })).toHaveAttribute("href", "/studio")
})

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "de aanwijzer is voor een muis")

  test("boven het portret zegt de aanwijzer Over mij (EN: About me)", async ({ page }) => {
    for (const [pad, woord, naam] of [
      ["/nl", "Over mij", /^Over Nick Peters/],
      ["/", "About me", /^About Nick Peters/],
    ] as const) {
      await page.goto(pad, { waitUntil: "networkidle" })
      await page.waitForTimeout(800)
      await page.mouse.move(40, 600)
      await page.locator(OPENING).getByRole("link", { name: naam }).hover()
      await expect(page.locator('[data-aanwijzer="ring"]')).toHaveText(woord)
    }
  })
})

// De stempel en de projectkaart staan sinds 2 okt 2026 niet meer in de
// opening (eigenaar: "Rustiger", naar Dan Hoye: "fewer things per page").
// Eén knop, het portret, en verder niets op de foto.
test("de opening is rustig: één knop, geen stempel, geen projectkaart", async ({ page }) => {
  await page.goto("/nl")
  const opening = page.locator(OPENING)
  await expect(opening.locator("[data-stempel]")).toHaveCount(0)
  await expect(opening.locator('a[href^="/nl/projects"]')).toHaveCount(0)
  await expect(opening.getByRole("link", { name: /Plan een kennismaking/ })).toHaveCount(1)
  await expect(opening.getByRole("link", { name: "Bekijk het werk" })).toHaveCount(0)
  await expect(opening.locator('a[href="/nl/studio"]')).toBeVisible()
})

test("de voet: de zin in beide talen, en een schermlezer hoort één ©", async ({ page }) => {
  await page.goto("/nl")
  const regel = page.locator(VOET_COPY)
  await expect(regel).toBeVisible()
  const nl = await regel.ariaSnapshot()
  expect(nl).toContain(`© ${JAAR} GRØNN Studio.`)
  expect(nl).toContain("Pixels en code beschermd door pure wilskracht.")
  expect(nl.split("©").length - 1).toBe(1)
  // Beide tekens zijn verborgen voor de schermlezer; het Ø rolt eronder.
  await expect(regel.locator("[data-auteursrecht]")).toHaveAttribute("aria-hidden", "true")
  const rol = await regel.locator(".copy-wissel-rol").evaluate((n) => [getComputedStyle(n).animationName, n.textContent])
  expect(rol).toEqual(["copy-wissel", "©Ø"])

  await page.goto("/")
  const en = await page.locator(VOET_COPY).ariaSnapshot()
  expect(en).toContain(`© ${JAAR} GRØNN Studio.`)
  expect(en).toContain("Pixels and code protected by sheer willpower.")
  expect(en.split("©").length - 1).toBe(1)
})

for (const [naam, zet] of [
  ["systeem (prefers-reduced-motion)", (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })],
  [
    "eigen keuze (gronn-a11y-motion)",
    (page: Page) => page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced")),
  ],
] as const) {
  test(`minder beweging, ${naam}: de © staat stil`, async ({ page }) => {
    await zet(page)
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(300)
    const stand = await page.evaluate(() => {
      const rol = document.querySelector("footer .copy-wissel-rol")!
      return { copy: `${getComputedStyle(rol).animationName}|${getComputedStyle(rol).translate}` }
    })
    expect(stand).toEqual({ copy: "none|none" })
    // Wat er zichtbaar staat is het ©, niet het Ø.
    const zichtbaar = await page.locator("footer [data-auteursrecht]").evaluate((n) => {
      const kader = n.getBoundingClientRect()
      const [c, o] = [...n.querySelectorAll(".copy-wissel-rol > span")].map((s) => s.getBoundingClientRect())
      return { copy: c.top >= kader.top - 0.5 && c.bottom <= kader.bottom + 0.5, oe: o.top >= kader.bottom - 0.5 }
    })
    expect(zichtbaar).toEqual({ copy: true, oe: true })
  })
}
