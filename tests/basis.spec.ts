import { expect, test, type Page } from "@playwright/test"

const ROUTES = ["/", "/vijvers", "/tuinen", "/tuinen/borderpakketten", "/tuinen/borderpakketten/bestellen", "/tuinen/materialen", "/werk", "/werk/vijverrenovatie", "/werk/terras-geulle", "/over", "/kennismaken", "/faq", "/privacy", "/techniek"]
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
  // pas klikken als er geen doek meer ligt; op CI viel de klik soms nog onder de opening
  await expect(page.locator(".og")).toBeHidden({ timeout: 10_000 })
  await page.click('nav[aria-label="Hoofdmenu"] a[href="/werk"]')
  await expect(page).toHaveURL(/\/werk$/, { timeout: 10_000 })
  await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 })
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
  await page.getByRole("button", { name: "Menu" }).click()
  await page.click('#megamenu label:has(input[value="donker"])')
  await expect(page.locator("html")).toHaveClass(/donker/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/donker/)
})

// Elke breedte een eigen test: twee keer goto op één pagina brak op CI af met ERR_ABORTED.
for (const b of [390, 1440]) {
  test(`menu @${b}: Home, Werk, Studio, Shop en een hamburger met het megamenu`, async ({ page }) => {
    await zonderIntro(page)
    await page.setViewportSize({ width: b, height: 800 })
    await page.goto("/werk/terras-geulle", { waitUntil: "domcontentloaded" })
    const nav = page.locator("nav[data-menu]")
    for (const naam of ["Home", "Werk", "Studio", "Shop"]) await expect(nav.getByRole("link", { name: naam, exact: true })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Werk", exact: true })).toHaveAttribute("aria-current", "page")
    const vijvers = page.locator('#megamenu label:has(input[value="donker"])')
    await expect(page.locator("#megamenu")).toHaveCSS("opacity", "0")
    // de pil blijft op het scherm, ook tijdens het lezen
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(300)
    await expect(nav.getByRole("link", { name: "Shop", exact: true })).toBeInViewport()
    const omhoog = page.getByRole("button", { name: "Terug naar boven" })
    await expect(omhoog).toBeVisible()
    if (b < 1024) {
      // de pil krimpt niet, en Omhoog ligt achteraan concentrisch in de ronding
      const [p, o] = await Promise.all([nav.locator("ul").first().boundingBox(), omhoog.boundingBox()])
      expect(Math.round(p!.height)).toBe(64)
      expect(Math.round(p!.x + p!.width - o!.x - o!.width)).toBe(Math.round(o!.y - p!.y))
    }
    await page.getByRole("button", { name: "Menu" }).click()
    await expect(page.locator("#megamenu")).toHaveCSS("opacity", "1")
    await expect(vijvers).toBeVisible()
    await expect(page.locator('#megamenu input[value="donker"]')).toBeAttached()
    await page.keyboard.press("Escape")
    await expect(page.locator("#megamenu")).toHaveCSS("opacity", "0")
  })
}

test("uitlijning: kop, voet en de brede menubalk op één lijn, ook op een breed scherm", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 1920, height: 900 })
  for (const route of ["/", "/vijvers", "/over"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    const [h1, voet, kennis] = await page.evaluate(() => {
      const links = (s: string) => Math.round(document.querySelector(s)!.getBoundingClientRect().left)
      const wrap = document.querySelector("footer .wrap")!
      const voet = Math.round(wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft))
      return [links("main h1"), voet, links("nav[data-menu] > ul")]
    })
    expect([h1, kennis], route).toEqual([voet, voet])
  }
})

// Elke route een eigen pagina, zoals bij tikvlak hieronder.
for (const route of ["/", "/vijvers", "/werk", "/kennismaken", "/merk"]) {
  test(`knoppen ${route}: elke ronde knop is 36, 48 of 64 hoog (--knop-klein, --knop, --knop-groot)`, async ({ page }) => {
    await zonderIntro(page)
    for (const b of [1440, 390]) {
      await page.setViewportSize({ width: b, height: 900 })
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const afwijkend = await page.evaluate(() =>
        [...document.querySelectorAll("a, button")].flatMap((e) => {
          // offsetHeight: de maat zelf, zonder schaal (de grote menupil is de kleine, opgeschaald)
          const cs = getComputedStyle(e), h = (e as HTMLElement).offsetHeight
          const knop = h > 0 && parseFloat(cs.borderTopLeftRadius) >= 16 && (!/rgba\(0, 0, 0, 0\)/.test(cs.backgroundColor) || parseFloat(cs.borderTopWidth) > 0)
          return knop && ![36, 48, 64].includes(h) ? [`${(e.textContent || "").trim().slice(0, 30)}: ${h}px`] : []
        }),
      )
      expect(afwijkend, `${route} @${b}`).toEqual([])
    }
  })
}

test("borderpakket @390: een tik op de kaart opent het pakket onder de stapel", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/tuinen/borderpakketten")
  await expect(page.locator("#open-plukborder")).toBeHidden()
  await page.click('a[href="#open-plukborder"]')
  await expect(page.locator("#open-plukborder")).toBeVisible()
  await expect(page.locator('#open-plukborder img[src="/borderpakketten/plan-plukborder.svg"]')).toBeVisible()
})

test("borderpakket @1280: het pakket schuift over de foto bij hover", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto("/tuinen/borderpakketten")
  const kaart = page.locator("article", { has: page.locator("#pakket-vlinderborder") })
  const paneel = kaart.locator(".bp-paneel")
  await kaart.scrollIntoViewIfNeeded()
  await expect(paneel).toHaveCSS("opacity", "0")
  await kaart.hover()
  await expect(paneel).toHaveCSS("opacity", "1")
})

test("borderpakket: de knop vult het pakket in en de mail noemt het", async ({ page }) => {
  await zonderIntro(page)
  let body = ""
  await page.route("**/formsubmit.co/**", (r) => { body = r.request().postData() ?? ""; r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' }) })
  await page.goto("/tuinen/borderpakketten")
  // Desktop: het pakket schuift over de foto zodra de muis erop staat.
  const kaart = page.locator("article", { has: page.locator("#pakket-plukborder") })
  await kaart.hover()
  await kaart.locator('a[href="/kennismaken?pakket=plukborder"]').click()
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

// Elke route een eigen test (en dus een verse pagina): twee keer achter elkaar
// goto op één pagina brak op CI af met ERR_ABORTED na de voorpagina.
for (const route of ["/", "/over"]) {
  test(`tikvlak ${route}: tekstlinks, kleine knoppen en voetlinks raken op minstens --raak (44px)`, async ({ page }) => {
    await zonderIntro(page)
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto(route, { waitUntil: "domcontentloaded" })
    const te_klein = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".lnk, .raak, .knop-klein")]
        .filter((el) => el.getClientRects().length)
        .map((el) => ({ wat: (el.innerText || el.getAttribute("aria-label") || "").slice(0, 30), h: Math.max(el.getBoundingClientRect().height, parseFloat(getComputedStyle(el, "::after").height) || 0) }))
        .filter((r) => r.h < 43.5),
    )
    expect(te_klein, route).toEqual([])
  })
}

test("planten: de hangende tak is decoratief, de voet heeft er geen", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/privacy", { waitUntil: "domcontentloaded" })
  const tak = page.locator("img.plant-hang")
  await expect(tak).toHaveCount(1)
  await expect(tak).toHaveAttribute("alt", "")
  await expect(tak).toHaveAttribute("aria-hidden", "true")
  await expect(page.locator("footer img.plant")).toHaveCount(0)
  // ook geen tuinsilhouet boven de voet (eigenaar, 21 okt 2026: "Haal dit weg")
  await expect(page.locator("footer > svg")).toHaveCount(0)
})

test("inheemse bloemen en de dagpauwoog in het slot: decoratief", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/", { waitUntil: "domcontentloaded" })
  const bloemen = page.locator(".w-verder img.plant")
  await expect(bloemen).toHaveCount(3)
  for (const b of await bloemen.all()) {
    await expect(b).toHaveAttribute("alt", "")
    await expect(b).toHaveAttribute("aria-hidden", "true")
  }
})

test("hommel: niet bij minder beweging", async ({ page }) => {
  await zonderIntro(page)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(1500)
  await expect(page.locator("canvas.hommel-doek")).toHaveCount(0)
})

test("beveiliging: de basisheaders staan op elke pagina", async ({ request }) => {
  const r = await request.get("/")
  expect(r.headers()["x-frame-options"]).toBe("SAMEORIGIN")
  expect(r.headers()["x-content-type-options"]).toBe("nosniff")
  expect(r.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin")
  expect(r.headers()["permissions-policy"]).toContain("camera=()")
})

test("hommelbloemen: alleen in de marges van een breed scherm, decoratief, met landingsplekken", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 1680, height: 950 })
  await page.goto("/over", { waitUntil: "domcontentloaded" })
  const bloemen = page.locator(".hommel-bloemen img")
  await expect(bloemen).toHaveCount(2)
  await expect(bloemen.first()).toBeVisible()
  await expect(page.locator(".hommel-bloemen")).toHaveAttribute("aria-hidden", "true")
  for (const b of await bloemen.all()) await expect(b).toHaveAttribute("data-landing", /^[\d.]+,[\d.]+/)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(bloemen.first()).toBeHidden()
})

test("over @390: het verhaal snapt na een korte scroll op het volgende hoofdstuk", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/over", { waitUntil: "domcontentloaded" })
  const stand = () => page.evaluate(() => {
    const b = document.querySelector(".w-zijwaarts")!.getBoundingClientRect()
    return (-b.top / (b.height - innerHeight)) * (Number(getComputedStyle(document.querySelector(".w-zijwaarts")!).getPropertyValue("--n")) - 1)
  })
  // naar het begin van het verhaal, dan een klein stukje verder
  await page.evaluate(() => scrollTo(0, scrollY + document.querySelector(".w-zijwaarts")!.getBoundingClientRect().top))
  await page.waitForTimeout(600)
  expect(Math.abs(await stand())).toBeLessThan(0.02)
  await page.mouse.move(195, 400)
  await page.mouse.wheel(0, 200)
  await expect.poll(stand, { timeout: 4000 }).toBeCloseTo(1, 1)
  await page.mouse.wheel(0, -200)
  await expect.poll(stand, { timeout: 4000 }).toBeCloseTo(0, 1)
})

test("webhook van Mollie weigert een ongeldige id", async ({ request }) => {
  const r = await request.post("/api/mollie", { form: { id: "niet-mollie" } })
  expect(r.status()).toBe(400)
})

test("kopieerslot: tekst niet selecteerbaar, formuliervelden wel", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/kennismaken", { waitUntil: "domcontentloaded" })
  expect(await page.evaluate(() => getComputedStyle(document.body).userSelect)).toBe("none")
  expect(await page.locator('input[name="naam"]').evaluate((e) => getComputedStyle(e).userSelect)).toBe("text")
  await page.fill('input[name="naam"]', "Test")
  await expect(page.locator('input[name="naam"]')).toHaveValue("Test")
})
