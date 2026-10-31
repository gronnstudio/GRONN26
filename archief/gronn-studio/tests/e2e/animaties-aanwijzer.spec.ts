import { expect, test, type Locator, type Page } from "@playwright/test"

// De animaties van de oude site in V5 (eigenaar, 23 sep 2026: "Knoppen en
// cursor" en "Kaarten"): de knop trekt naar de muis, een aanwijzer die
// boven een project "Bekijk" zegt, en kaarten die naar de muis kantelen.
// Alleen met een muis; niets op touch en niets bij minder beweging.

test.beforeEach(async ({ page }) => {
  // Sla de openingssluier over: hij hoort niet bij deze toets.
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

const transform = (el: Locator) => el.evaluate((n) => getComputedStyle(n).transform)

/** Wacht tot de pagina gehydrateerd is: de aanwijzer bestaat pas daarna. */
async function klaar(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
}

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "de aanwijzer is voor een muis")

  test("de aanwijzer zegt Bekijk boven de projectkaart en Lees boven een dienst", async ({ page }) => {
    await klaar(page, "/nl/projects")
    const ring = page.locator('[data-aanwijzer="ring"]')
    await expect(ring).toHaveCount(1)
    await expect(page.locator('[data-aanwijzer="zaadje"]')).toHaveCount(1)
    // De ring bloeit alleen; nog geen woord.
    await page.mouse.move(40, 400)
    await expect(ring.locator("[data-aanwijzer-label]")).toHaveCount(0)

    await page.locator('main a[data-cursor="view"]').first().hover()
    await expect(ring).toHaveText("Bekijk")
    // Oranje vlak, antraciet tekst — nooit wit op oranje.
    const kleuren = await ring.evaluate((n) => ({
      vlak: getComputedStyle(n).backgroundColor,
      tekst: getComputedStyle(n.querySelector("[data-aanwijzer-label]")!).color,
    }))
    expect(kleuren).toEqual({ vlak: "rgb(219, 105, 35)", tekst: "rgb(32, 32, 32)" })

    await klaar(page, "/nl/services")
    await page.locator('main a[data-cursor="read"]').first().hover()
    await expect(page.locator('[data-aanwijzer="ring"]')).toHaveText("Lees")
  })

  test("in het Engels spreekt de aanwijzer Engels", async ({ page }) => {
    await klaar(page, "/projects")
    await page.locator('main a[data-cursor="view"]').first().hover()
    await expect(page.locator('[data-aanwijzer="ring"]')).toHaveText("View")
  })

  test("een knop trekt naar de muis en veert terug", async ({ page }) => {
    await klaar(page, "/nl")
    const magneet = page.locator("main [data-magneet]").first()
    await expect(magneet).toHaveText(/Plan een kennismaking/)
    const box = (await magneet.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.move(box.x + box.width - 3, box.y + 3, { steps: 4 })
    await expect.poll(() => transform(magneet)).not.toBe("none")
    // Nooit meer dan 6px: de knop blijft een knop.
    const verschuiving = await magneet.evaluate((n) => {
      const m = new DOMMatrix(getComputedStyle(n).transform)
      return Math.max(Math.abs(m.m41), Math.abs(m.m42))
    })
    expect(verschuiving).toBeLessThanOrEqual(6.01)
    await page.mouse.move(5, box.y + 300)
    await expect.poll(() => transform(magneet), { timeout: 5000 }).toBe("none")
  })

  test("een kaart kantelt naar de muis en staat daarna weer recht", async ({ page }) => {
    await klaar(page, "/nl/services")
    const kaart = page.locator("main [data-kanteling]").first()
    await kaart.scrollIntoViewIfNeeded()
    await expect.poll(() => transform(kaart)).toBe("none")
    const box = (await kaart.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.move(box.x + 12, box.y + 12, { steps: 5 })
    await expect.poll(() => transform(kaart)).not.toBe("none")
    // Weg van de kaart: terug naar precies `none`, geen 3D-voorouder in rust.
    await page.mouse.move(box.x + box.width + 400, box.y - 60)
    await expect.poll(() => transform(kaart), { timeout: 5000 }).toBe("none")
  })
})

test("telefoon: geen eigen aanwijzer, ook niet na een tik", async ({ page, isMobile }) => {
  test.skip(!isMobile, "gaat over touch")
  await klaar(page, "/nl/services")
  await page.getByRole("heading", { level: 1 }).tap()
  await page.waitForTimeout(300)
  await expect(page.locator("[data-aanwijzer]")).toHaveCount(0)
  // Een tik laat geen knop of kaart scheef staan.
  await expect.poll(() => transform(page.locator("main [data-kanteling]").first())).toBe("none")
})

test.describe("minder beweging", () => {
  test.skip(({ isMobile }) => isMobile, "de muisanimaties zijn desktop")

  test("geen aanwijzer, geen magneet, geen kanteling, geen drift", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await klaar(page, "/nl")
    await page.mouse.move(200, 300, { steps: 3 })
    await expect(page.locator("[data-aanwijzer]")).toHaveCount(0)

    const magneet = page.locator("main [data-magneet]").first()
    const box = (await magneet.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.move(box.x + box.width - 3, box.y + 3, { steps: 4 })
    await page.waitForTimeout(500)
    expect(await transform(magneet)).toBe("none")
    expect(await transform(magneet.locator("a").first())).toBe("none")

    await klaar(page, "/nl/services")
    const kaart = page.locator("main [data-kanteling]").first()
    await kaart.scrollIntoViewIfNeeded()
    const k = (await kaart.boundingBox())!
    await page.mouse.move(k.x + 12, k.y + 12, { steps: 5 })
    await page.waitForTimeout(500)
    expect(await transform(kaart)).toBe("none")
  })
})

// Eigenaar, 29 sep 2026: "waarom zit hier hoogte verschil?" — elke kaart
// dreef in een eigen tempo mee, dus stonden kaarten in één rij nooit gelijk.
// Het dienstenraster is nu een metroraster en drijft niet meer.
test("desktop: kaarten in het dienstenraster drijven niet meer", async ({ page, isMobile }) => {
  test.skip(isMobile, "op de telefoon is het één kolom: geen raster")
  await klaar(page, "/nl/services")
  await expect(page.locator("main [data-drijf]")).toHaveCount(0)
  const eerste = page.locator("main li[data-metro-rol]").first()
  await eerste.evaluate((n) => n.scrollIntoView({ block: "end" }))
  await page.waitForTimeout(400)
  const y = await page.locator("main li[data-metro-rol] > div").evaluateAll((els) =>
    els.slice(0, 3).map((n) => getComputedStyle(n).transform)
  )
  expect(new Set(y)).toEqual(new Set(["none"]))
})
