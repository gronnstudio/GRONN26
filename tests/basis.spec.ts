import { expect, test, type Page } from "@playwright/test"

const ROUTES = ["/", "/vijvers", "/tuinen", "/tuinen/borderpakketten", "/werk", "/werk/vijverrenovatie", "/werk/terras-geulle", "/over", "/kennismaken", "/faq", "/privacy"]
const BREEDTES = [1440, 834, 390]

// De intro speelt één keer per bezoek; in tests slaan we hem over.
async function zonderIntro(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
}

for (const route of ROUTES) {
  test(`${route}: geen overloop, geen fouten, één h1`, async ({ page }) => {
    await zonderIntro(page)
    const fouten: string[] = []
    page.on("pageerror", (e) => fouten.push(e.message))
    for (const b of BREEDTES) {
      await page.setViewportSize({ width: b, height: 900 })
      // "load" wacht op elke foto en video; op CI liep dat over de 30 s (3 breedtes)
      const r = await page.goto(route, { waitUntil: "domcontentloaded" })
      expect(r?.status(), `${route} @${b}`).toBe(200)
      await page.waitForTimeout(400)
      const overloop = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overloop, `${route} @${b} overloop`).toBe(0)
      await expect(page.locator("h1")).toHaveCount(1)
    }
    expect(fouten).toEqual([])
  })
}

test("404 geeft status 404", async ({ page }) => {
  await zonderIntro(page)
  const r = await page.goto("/bestaat-niet")
  expect(r?.status()).toBe(404)
  await expect(page.locator("h1")).toContainText("Hier groeit")
})

test("menu: paginawissel komt aan en de nieuwe h1 krijgt focus", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  await page.click('nav[aria-label="Hoofdmenu"] a[href="/vijvers"]')
  await expect(page).toHaveURL(/\/vijvers$/, { timeout: 10_000 })
  await expect(page.locator("h1")).toHaveText(/Vijvers/, { timeout: 10_000 })
  await expect(page.locator(".og")).toBeHidden({ timeout: 10_000 })
})

test("minder beweging: geen doek, alles zichtbaar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await expect(page.locator(".og")).toBeHidden()
  const dim = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".vp-wd")].filter((w) => w.style.opacity && +w.style.opacity < 1).length)
  expect(dim).toBe(0)
})

test("kennismaken: lege verzending toont fouten en verstuurt niets", async ({ page }) => {
  await zonderIntro(page)
  let verzonden = false
  await page.route("**/formsubmit.co/**", (r) => { verzonden = true; r.fulfill({ status: 200, body: "{}" }) })
  await page.goto("/kennismaken")
  await page.click('button[type="submit"]')
  await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible()
  expect(verzonden).toBe(false)
})

test("weergave: donker kiezen zet html.donker en blijft bewaard", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/over")
  await page.mouse.wheel(0, 600)
  await page.click('button[aria-label="Weergave en toegankelijkheid"]')
  await page.click('label:has(input[value="donker"])')
  await expect(page.locator("html")).toHaveClass(/donker/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/donker/)
})

test("menu: vijf ronde iconen; bij scrollen alleen Weergave links en Omhoog rechts", async ({ page }) => {
  await zonderIntro(page)
  for (const b of [390, 1440]) {
    await page.setViewportSize({ width: b, height: 800 })
    await page.goto("/over")
    const nav = page.locator("nav[data-menu]")
    const links = ["Vijvers", "Tuinen", "Projecten", "Over", "FAQ"].map((naam) => nav.getByRole("link", { name: naam, exact: true }))
    const weergave = page.getByRole("button", { name: "Weergave en toegankelijkheid" })
    const omhoog = page.getByRole("button", { name: "Terug naar boven" })
    for (const l of links) await expect(l).toBeVisible()
    await expect(weergave).toBeHidden()
    await expect(omhoog).toBeHidden()
    await page.mouse.wheel(0, 600)
    await expect(omhoog).toBeVisible()
    await expect(weergave).toBeVisible()
    await expect(nav).toBeHidden()
    await expect.poll(async () => (await omhoog.boundingBox())?.height).toBe(48)
    const [w, o] = await Promise.all([weergave.boundingBox(), omhoog.boundingBox()])
    expect(w!.x + w!.width, `@${b}`).toBeLessThan(b / 2)
    expect(o!.x, `@${b}`).toBeGreaterThan(b / 2)
  }
})

test("uitlijning: kop, voet en menu-hoeken op één lijn, ook op een breed scherm", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 1920, height: 900 })
  for (const route of ["/", "/vijvers", "/over"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    const [h1, voet, kennis] = await page.evaluate(() => {
      const links = (s: string) => Math.round(document.querySelector(s)!.getBoundingClientRect().left)
      const wrap = document.querySelector("footer .wrap")!
      const voet = Math.round(wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft))
      return [links("main h1"), voet, links('[data-menu] a[href="/kennismaken"]')]
    })
    expect([h1, kennis], route).toEqual([voet, voet])
  }
})

test("knoppen: elke ronde knop is 36, 48 of 64 hoog (--knop-klein, --knop, --knop-groot)", async ({ page }) => {
  await zonderIntro(page)
  for (const b of [1440, 390]) {
    await page.setViewportSize({ width: b, height: 900 })
    for (const route of ["/", "/vijvers", "/werk", "/kennismaken", "/merk"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const afwijkend = await page.evaluate(() =>
        [...document.querySelectorAll("a, button")].flatMap((e) => {
          const cs = getComputedStyle(e), h = Math.round(e.getBoundingClientRect().height)
          const knop = h > 0 && parseFloat(cs.borderTopLeftRadius) >= 16 && (!/rgba\(0, 0, 0, 0\)/.test(cs.backgroundColor) || parseFloat(cs.borderTopWidth) > 0)
          return knop && !e.closest("nav[data-menu]") && ![36, 48, 64].includes(h) ? [`${(e.textContent || "").trim().slice(0, 30)}: ${h}px`] : []
        }),
      )
      expect(afwijkend, `${route} @${b}`).toEqual([])
    }
  }
})

test("borderpakket: de knop vult het pakket in en de mail noemt het", async ({ page }) => {
  await zonderIntro(page)
  let body = ""
  await page.route("**/formsubmit.co/**", (r) => { body = r.request().postData() ?? ""; r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' }) })
  await page.goto("/tuinen/borderpakketten")
  await page.click('a[href="/kennismaken?pakket=plukborder"]')
  await expect(page).toHaveURL(/pakket=plukborder/)
  await expect(page.locator('input[name="pakket"][value="plukborder"]')).toBeChecked()
  await page.fill('input[name="naam"]', "Test Persoon")
  await page.fill('input[name="email"]', "test@voorbeeld.nl")
  await page.fill('input[name="plaats"]', "6171 Stein")
  await page.click('label:has(input[name="budget"]) >> nth=0')
  await page.fill('textarea[name="bericht"]', "Een strook van zes meter langs het terras.")
  await page.click('button[type="submit"]')
  await expect(page.getByRole("heading", { name: /Dank je/ })).toBeVisible()
  expect(body).toContain("Borderpakket: Plukborder")
  expect(body).toContain("Pakket: Plukborder")
})
