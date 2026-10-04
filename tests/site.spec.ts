import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/vijvers", "/tuinen", "/werk", "/over", "/werk/vijverrenovatie"]

test("het menu heeft precies vier woorden en markeert de pagina", async ({ page }) => {
  await page.goto("/werk")
  const menu = page.getByRole("navigation", { name: "Hoofdmenu" })
  await expect(menu.getByRole("list").getByRole("link")).toHaveText(["Vijvers", "Tuinen", "Werk", "Over"])
  await expect(menu.getByRole("link", { name: "Werk" })).toHaveAttribute("aria-current", "page")
  await menu.getByRole("link", { name: "Vijvers" }).click()
  await expect(page).toHaveURL(/\/vijvers$/)
  await expect(menu.getByRole("link", { name: "Vijvers" })).toHaveAttribute("aria-current", "page")
})

test("Kennismaken is altijd bereikbaar, en het logo gaat naar home", async ({ page, isMobile }) => {
  await page.goto("/over")
  const cta = isMobile ? page.locator("header").getByRole("link", { name: "Kennismaken" }) : page.getByRole("navigation", { name: "Hoofdmenu" }).getByRole("link", { name: "Kennismaken" })
  await expect(cta).toBeVisible()
  await page.getByRole("link", { name: /naar de voorpagina/ }).click()
  await expect(page).toHaveURL(/\/$/)
})

test("de pijl wijst omlaag bovenaan en omhoog tijdens het lezen", async ({ page, isMobile }) => {
  test.skip(isMobile, "op de telefoon is er geen pijl")
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Verder naar beneden" })).toBeVisible()
  await page.mouse.wheel(0, 900)
  await expect(page.getByRole("button", { name: "Terug naar boven" })).toBeVisible()
})

test("niets loopt horizontaal buiten het scherm", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(over, route).toBeLessThanOrEqual(0)
  }
})

test("Weergave onthoudt Donker, ook na herladen", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Weergave" }).click()
  await page.getByText("Donker", { exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/donker/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/donker/)
})

test("een onbekende pagina geeft een echte 404", async ({ page }) => {
  const res = await page.goto("/bestaat-niet")
  expect(res?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hier groeit nog niets.")
})

for (const kleur of ["licht", "donker"]) {
  test(`geen toegankelijkheidsfouten (${kleur})`, async ({ page }) => {
    await page.addInitScript((k) => localStorage.setItem("gronn-weergave", k), kleur)
    await page.emulateMedia({ reducedMotion: "reduce" })
    for (const route of ROUTES) {
      await page.goto(route)
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`), route).toEqual([])
    }
  })
}
