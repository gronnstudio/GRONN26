import { expect, test } from "@playwright/test"

import { BUSINESS } from "../../src/lib/business"
import { HANDTEKENING_BEELDEN } from "../../src/lib/handtekening"

// De e-mailhandtekening op gronn.studio/handtekening (eigenaar, 28 sep
// 2026: "zet deze op de website"; "dan kan ik de html weergave kopieren
// en plakken in gmail"). Buiten `[locale]`, zonder menu en voet.

test("de pagina staat op /handtekening, in het Nederlands, zonder de omlijsting van de site", async ({ page }) => {
  const res = await page.goto("/handtekening")
  expect(res?.status()).toBe(200)
  expect(new URL(page.url()).pathname).toBe("/handtekening")
  await expect(page.locator("html")).toHaveAttribute("lang", "nl")
  await expect(page.locator("footer")).toHaveCount(0)
  await expect(page.locator("nav[data-nav='dock']")).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
})

test("de handtekening draagt de gegevens uit business.ts en werkende links", async ({ page }) => {
  await page.goto("/handtekening")
  const h = page.locator("[data-handtekening]")
  await expect(h).toContainText("Nick Peters")
  await expect(h).toContainText(BUSINESS.phone)
  await expect(h).toContainText(BUSINESS.email)
  await expect(h).toContainText(`KVK ${BUSINESS.kvk}`)
  await expect(h.locator(`a[href="${BUSINESS.phoneHref}"]`)).toHaveCount(1)
  await expect(h.locator(`a[href="${BUSINESS.emailHref}"]`)).toHaveCount(1)
  await expect(h.locator(`a[href="${BUSINESS.whatsapp}"]`)).toHaveCount(1)
})

test("elk beeld is een absolute URL op gronn.studio en bestaat echt", async ({ page, request }) => {
  await page.goto("/handtekening")
  const bronnen = await page.locator("[data-handtekening] img").evaluateAll((imgs) =>
    imgs.map((img) => img.getAttribute("src") ?? ""),
  )
  // Een mail haalt zijn beelden van internet: een relatief pad werkt daar nooit.
  for (const src of bronnen) expect(src).toMatch(/^https:\/\/gronn\.studio\/brand\/mail\/[a-z]+\.png$/)
  expect(new Set(bronnen.map((s) => new URL(s).pathname))).toEqual(new Set(HANDTEKENING_BEELDEN))
  for (const pad of HANDTEKENING_BEELDEN) {
    const r = await request.get(pad)
    expect(r.status(), pad).toBe(200)
    expect(r.headers()["content-type"]).toContain("image/png")
  }
})

test("het portret blijft een ronde foto van 64 × 64, ook op een smal scherm", async ({ page }) => {
  // Een krimpende tabelcel drukte de foto tot een ovaal (eigenaar, 28 sep 2026).
  await page.goto("/handtekening")
  const foto = page.locator('[data-handtekening] img[alt="Nick Peters"]')
  await expect(foto).toBeVisible()
  const vak = await foto.boundingBox()
  expect(vak?.width).toBe(64)
  expect(vak?.height).toBe(64)
})

test("de knop zet de handtekening als HTML op het klembord", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "klembordrechten alleen in Chromium te verlenen")
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/handtekening")
  await page.getByRole("button", { name: "Kopieer handtekening" }).click()
  await expect(page.getByRole("status")).toHaveText("Gekopieerd. Plak hem nu in Gmail.")
  const html = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read()
    return (await item.getType("text/html")).text()
  })
  expect(html).toContain("Nick Peters")
  expect(html).toContain("https://gronn.studio/brand/mail/portret.png")
})
