import { readFileSync } from "node:fs"

import { expect, test, type Page } from "@playwright/test"

import { BUSINESS } from "../../src/lib/business"

// De palet-opties (25 sep 2026): twee keuzes in het palet (terug met
// vegen, verder lezen waar je was), plus leestijd, offline-melding en
// de contactkaart. Alles tegen de echte build.

const VIJVER = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"
const VERDER_SLEUTEL = "gronn-verder:vijverrenovatie-twee-vijvers-waterval-beekloop"

async function zetAan(page: Page, sleutel: string) {
  await page.addInitScript((k) => {
    try {
      window.localStorage.setItem(k, "on")
    } catch {}
  }, sleutel)
}

/** Opent het palet: Weergave op de telefoon, het poppetje op desktop. */
async function openPalet(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: /Weergave/ }).first().click()
  else await page.getByRole("button", { name: /Conceptpaletten en toegankelijkheid/ }).click()
}

test.describe("palet-opties: de keuzes", () => {
  for (const naam of ["Pijlen voor terug en verder", "Verder lezen waar je was"]) {
    test(`"${naam}" staat standaard uit en blijft bewaard`, async ({ page, isMobile }) => {
      test.skip(!isMobile && naam.startsWith("Pijlen"), "de pijlen zijn telefoonchroom")
      await page.goto("/nl", { waitUntil: "networkidle" })
      await openPalet(page, isMobile)
      const knop = isMobile
        ? page.getByRole("switch", { name: new RegExp(naam) })
        : page.getByRole("button", { name: new RegExp(`^${naam.split(" ").slice(0, 2).join(" ")}`) })
      const stand = isMobile ? "aria-checked" : "aria-pressed"
      await expect(knop).toHaveAttribute(stand, "false")
      await knop.click()
      await expect(knop).toHaveAttribute(stand, "true")

      await page.reload({ waitUntil: "networkidle" })
      await openPalet(page, isMobile)
      const naReload = isMobile
        ? page.getByRole("switch", { name: new RegExp(naam) })
        : page.getByRole("button", { name: new RegExp(`^${naam.split(" ").slice(0, 2).join(" ")}.*: aan$`) })
      await expect(naReload).toHaveAttribute(stand, "true")
    })
  }
})

test.describe("palet-opties: pijlen voor terug en verder", () => {
  test("uit: geen pijlen", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.goto("/nl/contact", { waitUntil: "networkidle" })
    await expect(page.locator("[data-rand-pijlen]")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Terug", exact: true })).toHaveCount(0)
  })

  test("aan, telefoon: halverwege de rand, terug gaat terug, weg onder een paneel", async ({ page, isMobile }) => {
    test.skip(!isMobile, "de pijlen zijn telefoonchroom")
    await zetAan(page, "gronn-pref-pijlen")
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.goto("/nl/contact", { waitUntil: "networkidle" })
    const terug = page.getByRole("button", { name: "Terug", exact: true })
    await expect(terug).toBeVisible()
    const vp = page.viewportSize()!
    const b = (await terug.boundingBox())!
    expect(b.width).toBe(44)
    expect(b.height).toBe(44)
    expect(b.x).toBeCloseTo(8, 0)
    expect(Math.abs(b.y + b.height / 2 - vp.height / 2)).toBeLessThanOrEqual(2)

    // Zolang een hoekpaneel open is: weg.
    await page.getByRole("button", { name: /Weergave/ }).first().click()
    await expect(terug).toBeHidden()
    await page.keyboard.press("Escape")
    await expect(terug).toBeVisible()

    await terug.click()
    await expect(page).toHaveURL(/\/nl$/)
    // Nu is er iets om naar verder te gaan.
    const verder = page.getByRole("button", { name: "Verder", exact: true })
    await expect(verder).toBeVisible()
    const v = (await verder.boundingBox())!
    expect(v.x + v.width).toBeCloseTo(vp.width - 8, 0)
    await verder.click()
    await expect(page).toHaveURL(/\/nl\/contact$/)
  })

  test("aan, desktop: geen pijlen", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop")
    await zetAan(page, "gronn-pref-pijlen")
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.goto("/nl/contact", { waitUntil: "networkidle" })
    await expect(page.getByRole("button", { name: "Terug", exact: true })).toBeHidden()
  })
})
test.describe("palet-opties: verder lezen", () => {
  async function leesTot(page: Page, id: string) {
    await page.goto(VIJVER, { waitUntil: "networkidle" })
    await page.evaluate((id) => {
      const el = document.getElementById(id)!
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40)
    }, id)
    await page.waitForTimeout(400)
  }

  test("aan: na een reload staat 'Verder bij' met het hoofdstuk", async ({ page }) => {
    await zetAan(page, "gronn-pref-resume")
    await leesTot(page, "waterroute")
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), VERDER_SLEUTEL))
      .toBe("waterroute")
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.reload({ waitUntil: "networkidle" })
    const regel = page.locator("[data-verder-lezen]")
    await expect(regel).toBeVisible()
    await expect(regel).toContainText("Verder bij")
    await expect(regel).toContainText("De waterroute")
    await regel.getByRole("button", { name: /Ga verder/ }).click()
    await expect
      .poll(() => page.evaluate(() => Math.abs(document.getElementById("waterroute")!.getBoundingClientRect().top)))
      .toBeLessThan(200)
  })

  test("uit: niets bewaard, nooit een regel", async ({ page }) => {
    await leesTot(page, "waterroute")
    await page.reload({ waitUntil: "networkidle" })
    await expect(page.locator("[data-verder-lezen]")).toHaveCount(0)
    expect(await page.evaluate((k) => localStorage.getItem(k), VERDER_SLEUTEL)).toBeNull()
  })

  test("sluiten haalt de regel weg", async ({ page }) => {
    await zetAan(page, "gronn-pref-resume")
    await page.addInitScript((k) => localStorage.setItem(k, "filter"), VERDER_SLEUTEL)
    await page.goto(VIJVER, { waitUntil: "networkidle" })
    const regel = page.locator("[data-verder-lezen]")
    await expect(regel).toContainText("Het filter")
    await regel.getByRole("button", { name: "Sluiten" }).click()
    await expect(regel).toHaveCount(0)
  })
})

test("leestijd staat bij de titel", async ({ page }) => {
  await page.goto(VIJVER, { waitUntil: "networkidle" })
  const leestijd = page.locator("[data-leestijd]")
  await expect(leestijd).toBeVisible()
  await expect(leestijd).toHaveText(/^± \d+ min lezen$/)
  await expect(leestijd).toHaveClass(/tekst-annotatie/)
})

test("offline: een stille melding, weg zodra de verbinding terug is", async ({ page, context }) => {
  await page.goto("/nl", { waitUntil: "networkidle" })
  const melding = page.locator("[data-offline-melding]")
  await expect(melding).toHaveCount(0)
  await context.setOffline(true)
  await expect(melding).toBeVisible()
  await expect(melding).toHaveText("Geen verbinding — je ziet een eerdere versie")
  await expect(page.locator('[role="status"][aria-live="polite"]').filter({ has: melding })).toHaveCount(1)
  await context.setOffline(false)
  await expect(melding).toHaveCount(0)
})

test("contactkaart: de vCard komt uit business.ts", async ({ page }) => {
  await page.goto("/nl/contact", { waitUntil: "networkidle" })
  const knop = page.getByRole("link", { name: /Zet in je contacten/ })
  await expect(knop).toBeVisible()
  const [download] = await Promise.all([page.waitForEvent("download"), knop.click()])
  expect(download.suggestedFilename()).toBe("gronn-studio.vcf")
  const vcf = readFileSync((await download.path())!, "utf8")
  expect(vcf).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\n/)
  expect(vcf).toContain(`TEL;TYPE=WORK,VOICE:${BUSINESS.phoneHref.replace(/^tel:/, "")}`)
  expect(vcf).toContain(`EMAIL;TYPE=INTERNET,WORK:${BUSINESS.email}`)
  expect(vcf).toContain("N:Peters;Nick;;;")
  expect(vcf).toContain("FN:Nick Peters")
  expect(vcf).toContain(`ORG:${BUSINESS.name}`)
  expect(vcf).toContain("URL:https://gronn.studio")
  expect(vcf).toContain(BUSINESS.address.street)
  expect(vcf.trimEnd().endsWith("END:VCARD")).toBe(true)
})

// Eigenaar, 25 sep 2026: de twee panelen rechtsboven bijna schermbreed,
// 12px van beide randen. Gemeten op 375, met 4px speling.
test.describe("de hoekpanelen op de telefoon", () => {
  test.skip(({ isMobile }) => !isMobile, "de panelen zijn telefoonchroom")
  test.use({ viewport: { width: 375, height: 740 } })

  for (const knop of [/Weergave/, /Kleur/]) {
    test(`${knop.source}: bijna schermbreed, onder de balk, boven de dock`, async ({ page }) => {
      await page.goto("/nl", { waitUntil: "networkidle" })
      await page.getByRole("button", { name: knop }).first().click()
      const paneel = page.getByRole("group", { name: knop })
      await expect(paneel).toBeVisible()
      const p = (await paneel.boundingBox())!
      expect(p.x).toBeLessThanOrEqual(16)
      expect(p.x + p.width).toBeGreaterThanOrEqual(375 - 16)
      const balk = (await page.locator("[data-topbar-row]").boundingBox())!
      expect(p.y).toBeGreaterThanOrEqual(balk.y + balk.height)
      expect(p.y + p.height).toBeLessThanOrEqual(740 - 74)
    })
  }
})
