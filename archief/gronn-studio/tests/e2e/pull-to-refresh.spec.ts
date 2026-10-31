import { expect, test, type Page } from "@playwright/test"

// Pull-to-refresh in de app-weergave (eigenaar, 23 sep 2026: "Op mobiel
// (app view) is dat wel zo makkelijk omdat de browser niet aanwezig is").
// Vanaf het beginscherm draait gronn.studio zonder browserbalk, dus zonder
// het gewone omlaagtrekken om te verversen. In een gewone tab hoort de
// component niets te doen.
//
// De app-weergave wordt nagebootst met iOS' `navigator.standalone`, dat
// `pull-to-refresh.tsx` naast `(display-mode: standalone)` leest.

test.skip(({ isMobile }) => !isMobile, "alleen op de telefoon")

async function trek(page: Page, afstand: number) {
  await page.evaluate((dy) => {
    const maak = (y: number) =>
      new Touch({ identifier: 1, target: document.body, clientX: 180, clientY: y })
    const start = 120
    document.body.dispatchEvent(new TouchEvent("touchstart", { touches: [maak(start)], bubbles: true }))
    for (let y = start + 10; y <= start + dy; y += 10) {
      document.body.dispatchEvent(
        new TouchEvent("touchmove", { touches: [maak(y)], bubbles: true, cancelable: true }),
      )
    }
  }, afstand)
}

test("app-weergave: omlaagtrekken bovenaan toont 'Loslaten om te vernieuwen'", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "standalone", { get: () => true })
  })
  await page.goto("/nl")
  await expect(page.getByText("Trek om te vernieuwen")).toBeAttached()

  await trek(page, 240)
  await expect(page.getByText("Loslaten om te vernieuwen")).toBeVisible()
})

test("gewone browsertab: geen eigen pull-to-refresh", async ({ page }) => {
  await page.goto("/nl")
  await trek(page, 240)
  await expect(page.getByText(/om te vernieuwen/)).toHaveCount(0)
})
