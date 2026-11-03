import { expect, test, type Page } from "@playwright/test"

import { SEIZOEN } from "../../src/lib/data/seizoen"

// /calendar, de tuinkalender achter de rechterbubbel (eigenaar, 28 sep
// 2026: "make this also clickable so it opens a link, to a page with
// advanced info?"). Alles uitgerekend of uit SEIZOEN; niets verzonnen.

const NU = new Date("2026-09-25T12:00:00+02:00")

async function metOpslag(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("__tk_init")) return
    sessionStorage.setItem("__tk_init", "1")
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
  })
}

/** De datum in de cel, terug naar een Date in 2026 (NL- of EN-schrijfwijze, zonder jaar). */
function leesDatum(tekst: string, locale: "nl" | "en"): Date {
  const maanden =
    locale === "nl"
      ? ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
      : ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
  const m = tekst.toLowerCase().match(/(\d{1,2}) ([a-z]+)/)!
  return new Date(Date.UTC(2026, maanden.indexOf(m[2]), Number(m[1])))
}

for (const [pad, locale] of [["/nl/calendar", "nl"], ["/calendar", "en"]] as const) {
  test(`tuinkalender ${locale}: twaalf maanden, deze maand gemarkeerd, zon en maan`, async ({ page }) => {
    await metOpslag(page)
    await page.clock.setFixedTime(NU)
    const res = await page.goto(pad)
    expect(res?.status()).toBe(200)
    await expect(page.locator("h1")).toContainText(locale === "nl" ? "Tuinkalender" : "Garden calendar")
    await expect(page).toHaveTitle(locale === "nl" ? /Tuinkalender/ : /Garden calendar/)

    // Twaalf maanden, elk met de regel uit SEIZOEN; september is nu.
    const maanden = page.locator('[data-element="JaarKalender"] > li')
    await expect(maanden).toHaveCount(12)
    for (const m of [1, 9, 12] as const) {
      const regel = SEIZOEN[m]![locale].split(" · ")[1]
      await expect(page.locator(`[data-maand="${m}"]`)).toContainText(regel)
    }
    await expect(page.locator('[data-maand][aria-current="date"]')).toHaveCount(1)
    await expect(page.locator('[data-maand="9"]')).toHaveAttribute("aria-current", "date")
    await expect(page.locator('[data-maand="9"]')).toContainText(locale === "nl" ? "Deze maand" : "This month")

    // De zon vandaag: tijden als 07:31, een daglengte, de stip op de boog (12:00 is dag).
    const hemel = page.locator('[data-element="HemelVandaag"]')
    for (const h of ["op", "onder", "middag"]) {
      await expect(hemel.locator(`[data-hemel="${h}"]`)).toHaveText(/^\d\d:\d\d$/)
    }
    await expect(hemel.locator('[data-hemel="daglengte"]')).toHaveText(locale === "nl" ? /^\d{1,2} u \d\d min$/ : /^\d{1,2} h \d\d min$/)
    await expect(hemel.locator("[data-zon]")).toBeAttached()
    const op = await hemel.locator('[data-hemel="op"]').textContent()
    const onder = await hemel.locator('[data-hemel="onder"]').textContent()
    expect(op! < onder!).toBe(true)

    // De maan: naam, percentage, en de volgende volle en nieuwe maan ná vandaag, binnen een maand.
    await expect(hemel.locator('[data-hemel="fase"]')).not.toHaveText("—")
    await expect(hemel.locator('[data-hemel="verlicht"]')).toHaveText(locale === "nl" ? /^\d{1,3} %$/ : /^\d{1,3}%$/)
    const vandaag = Date.UTC(2026, 8, 25)
    for (const h of ["volle-maan", "nieuwe-maan"]) {
      const d = leesDatum((await hemel.locator(`[data-hemel="${h}"]`).textContent())!, locale)
      expect(d.getTime(), h).toBeGreaterThanOrEqual(vandaag)
      expect(d.getTime() - vandaag, h).toBeLessThanOrEqual(31 * 86_400_000)
    }

    // Zon per maand: twaalf rijen met tijden, en de plek staat erbij.
    const rijen = page.locator('[data-element="ZonJaarTabel"] tbody tr')
    await expect(rijen).toHaveCount(12)
    await expect(rijen.first().locator("td").first()).toHaveText(/^\d\d:\d\d$/)
    await expect(page.locator("[data-uitleg]")).toContainText("Stein")
    await expect(page.locator("[data-uitleg]")).toContainText(locale === "nl" ? "51,0° N, 5,77° O" : "51.0° N, 5.77° E")
  })
}

test("tuinkalender: de server-HTML heeft de maanden maar geen markering", async ({ request }) => {
  const html = await (await request.get("/nl/calendar")).text()
  expect(html).toContain(SEIZOEN[3]!.nl.split(" · ")[1])
  expect(html).not.toContain('aria-current="date"')
})

test("tuinkalender: in de sitemap, onder Studio in het kruimelpad", async ({ page, request }) => {
  const xml = await (await request.get("/sitemap.xml")).text()
  expect(xml).toContain("https://gronn.studio/calendar<")
  expect(xml).toContain("https://gronn.studio/nl/calendar<")
  await page.goto("/nl/calendar")
  const pad = page.locator('[data-element="Kruimelpad"]')
  await expect(pad.getByRole("link", { name: "Studio" })).toBeVisible()
  await expect(pad.locator('[aria-current="page"]')).toHaveText("Tuinkalender")
})

for (const breed of [320, 375, 430]) {
  test(`tuinkalender: geen horizontale scroll op ${breed}px`, async ({ page }) => {
    await metOpslag(page)
    await page.setViewportSize({ width: breed, height: 800 })
    await page.clock.setFixedTime(NU)
    await page.goto("/nl/calendar")
    await expect(page.locator('[data-element="ZonJaarTabel"] tbody tr')).toHaveCount(12)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(over).toBeLessThanOrEqual(0)
  })
}

test.describe("de rechterbubbel linkt naar de tuinkalender", () => {
  test.skip(({ isMobile }) => !!isMobile, "de bubbel staat er alleen vanaf xl")

  test("kalender, zon en maan zijn elk een link naar /nl/calendar", async ({ page }) => {
    await metOpslag(page)
    await page.clock.setFixedTime(NU)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5))
    const bubbel = page.locator('[data-element="HemelBubbel"]')
    await expect(bubbel).not.toHaveAttribute("inert", /.*/)
    for (const h of ["kalender", "zon", "maan"]) {
      const a = bubbel.locator(`a[data-hemel="${h}"]`)
      await expect(a).toHaveAttribute("href", "/nl/calendar")
    }
    await expect(bubbel.getByRole("link", { name: /^Tuinkalender: / })).toHaveCount(1)
    await expect(bubbel.getByRole("link", { name: /^Zon op \d\d:\d\d, onder \d\d:\d\d$/ })).toHaveCount(1)
    await expect(bubbel.getByRole("link", { name: /maan|kwartier/i })).toHaveCount(1)
    await bubbel.locator('a[data-hemel="maan"]').click()
    await expect(page).toHaveURL(/\/nl\/calendar$/)
    await expect(page.locator("h1")).toContainText("Tuinkalender")
  })

  test("verborgen is de bubbel niet te bereiken met Tab", async ({ page }) => {
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    const bubbel = page.locator('[data-element="HemelBubbel"]')
    await expect(bubbel).toHaveAttribute("inert", "")
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab")
      expect(await page.evaluate(() => !!document.activeElement?.closest('[data-element="HemelBubbel"]'))).toBe(false)
    }
  })
})

test("voet onder xl: de hemelregel linkt naar de tuinkalender", async ({ page, isMobile }) => {
  test.skip(!isMobile, "vanaf xl staat hij in de rechterbubbel")
  await metOpslag(page)
  await page.clock.setFixedTime(NU)
  await page.goto("/nl")
  const link = page.locator("footer a[data-voet-kalender]")
  await expect(link).toHaveAttribute("href", "/nl/calendar")
  await expect(link.locator('[data-element="Seizoenszaadje"]')).toHaveText(SEIZOEN[9]!.nl)
})
