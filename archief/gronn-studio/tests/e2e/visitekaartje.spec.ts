import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import QRCode from "qrcode"

import { BUSINESS } from "../../src/lib/business"
import { VCARD_URL } from "../../src/lib/qr"

// Het visitekaartje op /nl/contact: echte gegevens uit business.ts, een
// knop die omdraait (klik en toetsenbord), geen rotatie onder
// verminderde beweging, en een QR die naar de vCard wijst.

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const kaart = (page: import("@playwright/test").Page) => page.locator("[data-visitekaartje]")

test("de voorkant toont telefoon en e-mail uit business.ts", async ({ page }) => {
  await page.goto("/nl/contact")
  const voor = kaart(page).locator('[data-zijde="voor"]')
  await expect(voor).toContainText(BUSINESS.phone)
  await expect(voor).toContainText(BUSINESS.email)
  await expect(voor).toContainText("Nick Peters")
})

test("klikken draait om en weer terug", async ({ page }) => {
  await page.goto("/nl/contact")
  const k = kaart(page)
  await expect(k).toHaveAttribute("aria-pressed", "false")
  await k.click()
  await expect(k).toHaveAttribute("aria-pressed", "true")
  await expect(k.locator('[data-zijde="achter"]')).toHaveAttribute("aria-hidden", "false")
  await expect(k.locator("[data-kaart-binnen]")).toHaveCSS("transform", /matrix3d/)
  await expect(k.getByText("Scan om me op te slaan")).toBeVisible()
  await k.click()
  await expect(k).toHaveAttribute("aria-pressed", "false")
  await expect(k.locator('[data-zijde="voor"]')).toHaveAttribute("aria-hidden", "false")
})

test("het toetsenbord draait het kaartje om", async ({ page }) => {
  await page.goto("/nl/contact")
  const k = kaart(page)
  await k.focus()
  await page.keyboard.press("Enter")
  await expect(k).toHaveAttribute("aria-pressed", "true")
  await page.keyboard.press("Space")
  await expect(k).toHaveAttribute("aria-pressed", "false")
})

test("verminderde beweging: geen transform-overgang, zijden wisselen direct", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/nl/contact")
  const k = kaart(page)
  const binnen = k.locator("[data-kaart-binnen]")
  await k.click()
  await expect(k).toHaveAttribute("aria-pressed", "true")
  const stijl = await binnen.evaluate((el) => {
    const s = getComputedStyle(el)
    return { transform: s.transform, duur: s.transitionDuration, prop: s.transitionProperty }
  })
  expect(stijl.transform).toBe("none")
  expect(stijl.prop.includes("transform") && stijl.duur !== "0s").toBe(false)
  await expect(k.locator('[data-zijde="achter"]')).toBeVisible()
  await expect(k.locator('[data-zijde="voor"]')).toBeHidden()
})

test("de QR is een inline SVG van de vCard-URL", async ({ page }) => {
  expect(VCARD_URL).toBe("https://gronn.studio/contact.vcf")
  await page.goto("/nl/contact")
  const qr = kaart(page).locator("[data-qr]")
  await expect(qr).toHaveAttribute("data-qr", VCARD_URL)
  await expect(qr).toHaveAttribute("aria-label", /QR/)
  await expect(qr.locator("svg")).toHaveCount(1)
  // Dezelfde matrix als de bibliotheek voor die URL bouwt, niveau M.
  const verwacht = QRCode.create(VCARD_URL, { errorCorrectionLevel: "M" })
  const paden = await qr.locator("svg path").last().getAttribute("d")
  expect(paden?.length).toBeGreaterThan(100)
  expect(verwacht.errorCorrectionLevel.bit).toBe(0) // M
  const viewBox = await qr.locator("svg").getAttribute("viewBox")
  expect(viewBox).toBe(`0 0 ${verwacht.modules.size + 8} ${verwacht.modules.size + 8}`)
})

test("axe slaagt op /nl/contact, voor- en achterkant", async ({ page }) => {
  await page.goto("/nl/contact")
  const voor = await new AxeBuilder({ page }).withTags(WCAG).exclude("canvas").analyze()
  expect(voor.violations).toEqual([])
  await kaart(page).click()
  const achter = await new AxeBuilder({ page }).withTags(WCAG).include("[data-visitekaartje]").analyze()
  expect(achter.violations).toEqual([])
})
