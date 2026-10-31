import { expect, test, type Page } from "./fixtures"

const ROUTES = ["/", "/vijvers", "/tuinen", "/tuinen/borderpakketten", "/tuinen/borderpakketten/bestellen", "/tuinen/materialen", "/werk", "/werk/vijverrenovatie", "/werk/terras-geulle", "/over", "/kennismaken", "/faq", "/privacy", "/techniek", "/journaal", "/journaal/vijver-winterklaar-maken", "/journaal/levende-tuin"]
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
      await expect(page.locator("h1:visible")).toHaveCount(1)
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
  await page.click('nav[data-menu] a[href="/werk"]')
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

// Auto volgt de klok van de bezoeker: 's avonds donker, overdag licht.
for (const [uur, donker] of [["12:00", false], ["21:00", true]] as const) {
  test(`weergave: Auto om ${uur} is ${donker ? "donker" : "licht"}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(`2026-10-21T${uur}:00`))
    await zonderIntro(page)
    await page.goto("/over")
    await expect(page.locator("html")).toHaveClass(donker ? /donker/ : /^(?!.*donker)/)
  })
}

// Elke breedte een eigen test: twee keer goto op één pagina brak op CI af met ERR_ABORTED.
for (const b of [390, 1440]) {
  test(`menu @${b}: Home, Werk, Studio, Shop en een hamburger met het megamenu`, async ({ page }) => {
    await zonderIntro(page)
    await page.setViewportSize({ width: b, height: 800 })
    await page.goto("/werk/terras-geulle", { waitUntil: "domcontentloaded" })
    const nav = page.locator("nav[data-menu]")
    for (const naam of ["Home", "Werk", "Studio", "Shop"]) await expect(nav.getByRole("link", { name: naam, exact: true })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Werk", exact: true })).toHaveAttribute("aria-current", "page")
    // Journaal (was Blog) staat vanaf desktop in de pil, op de telefoon in het megamenu (eigenaar, 21 okt 2026)
    await expect(nav.getByRole("link", { name: "Journaal", exact: true })).toBeVisible({ visible: b >= 1024 })
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
    await expect(page.locator("#megamenu").getByRole("link", { name: "Journaal", exact: true })).toBeVisible({ visible: b < 1024 })
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
  await expect(page).toHaveURL(/\/kennismaken\/bedankt$/)
  await expect(page.getByRole("heading", { name: /Bedankt/ })).toBeVisible()
  expect(body).toContain("Borderpakket: Plukborder")
  expect(body).toContain("Pakket: Plukborder")
})

// Eén hoek voor elke foto en video (eigenaar, 21 okt 2026: "waarom is dit niet
// op elke foto universeel via variabelen geregeld?"). Telt de hoek die je ZIET:
// snijdt een kader de foto bij (parallax, schaal), dan moet dát kader rond zijn.
for (const route of [...ROUTES, "/shop"]) {
  test(`fotohoek ${route}: elke foto en video heeft de hoek van --foto-hoek`, async ({ page }) => {
    await zonderIntro(page)
    for (const b of [1440, 390]) {
      await page.setViewportSize({ width: b, height: 900 })
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const afwijkend = await page.evaluate(() => {
        const hoek = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--foto-hoek"))
        const rond = (e: Element) => Math.abs(parseFloat(getComputedStyle(e).borderTopLeftRadius) - hoek) < 0.5
        return [...document.querySelectorAll<HTMLElement>("main img, main video")].flatMap((m) => {
          const r = m.getBoundingClientRect()
          // logo's, iconen, planten en tekeningen zijn geen foto
          if (r.width < 120 || r.height < 120 || m.closest("[aria-hidden='true']") || /\.svg|\/brand\//.test((m as HTMLImageElement).currentSrc || m.getAttribute("src") || "") || m.classList.contains("rounded-full")) return []
          // het kader dat de foto zichtbaar bijsnijdt, anders de foto zelf
          let zichtbaar: Element = m
          for (let e = m.parentElement; e && e.tagName !== "MAIN"; e = e.parentElement) {
            const cs = getComputedStyle(e), k = e.getBoundingClientRect()
            if (cs.overflowX === "visible" && cs.overflowY === "visible") continue
            if (k.width < r.width - 1 || k.height < r.height - 1) { zichtbaar = e; break }
          }
          const k = zichtbaar.getBoundingClientRect()
          if (k.width >= innerWidth - 1) return [] // schermvullend beeld: geen hoeken te zien
          return rond(zichtbaar) ? [] : [`${(m.getAttribute("alt") || m.getAttribute("src") || "video").slice(0, 40)}: ${getComputedStyle(zichtbaar).borderTopLeftRadius}`]
        })
      })
      expect(afwijkend, `${route} @${b}`).toEqual([])
    }
  })
}

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

test("het slot: geen dagpauwoog en geen planten", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/", { waitUntil: "domcontentloaded" })
  // de vlinder is weggehaald (eigenaar, 22 okt 2026: "Verwijder dagpauwoog vlinder")
  await expect(page.locator(".w-verder img.plant")).toHaveCount(0)
  await expect(page.locator(".vlinder")).toHaveCount(0)
})

test("beveiliging: de basisheaders staan op elke pagina", async ({ request }) => {
  const r = await request.get("/")
  expect(r.headers()["x-frame-options"]).toBe("SAMEORIGIN")
  expect(r.headers()["x-content-type-options"]).toBe("nosniff")
  expect(r.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin")
  expect(r.headers()["permissions-policy"]).toContain("camera=()")
})

for (const breed of [390, 1440]) {
  test(`groen @${breed}: geen losse takken, klimop of bloemen midden op de pagina`, async ({ page }) => {
    await zonderIntro(page)
    await page.setViewportSize({ width: breed, height: 900 })
    for (const pad of ["/", "/over", "/privacy"]) {
      await page.goto(pad, { waitUntil: "load" })
      // geen bloemen meer boven de voet (eigenaar, 22 okt 2026)
      await expect(page.locator("main img[src*='klaproos'], main img[src*='korenbloem'], main img[src*='vingerhoed'], .boeket")).toHaveCount(0)
      // geen tak die midden op de pagina nergens aan hangt ("wat moet dit
      // voorstellen?") en geen klimop ("ovreselijk die klimop, weg!")
      await expect(page.locator("main .plant-hang:not(.w-opening .plant-hang), img[src*='klimop']")).toHaveCount(0)
    }
  })
}


test("kruimelpad: op subpagina's met BreadcrumbList, niet op de voorpagina", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/tuinen/cadeaubon", { waitUntil: "domcontentloaded" })
  const pad = page.getByRole("navigation", { name: "Kruimelpad" })
  await expect(pad.getByRole("listitem")).toHaveText(["Home", "Shop", /^Cadeaubon/]) // beide talen staan in de pagina
  await expect(pad.locator('[aria-current="page"]')).toHaveText(/^Cadeaubon/)
  const ld = JSON.parse((await pad.locator('script[type="application/ld+json"]').textContent()) ?? "{}")
  expect(ld["@type"]).toBe("BreadcrumbList")
  expect(ld.itemListElement.map((s: { name: string }) => s.name)).toEqual(["Home", "Shop", "Cadeaubon"])
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("navigation", { name: "Kruimelpad" })).toHaveCount(0)
})

// ── Layout Blueprint (Weergave → Layout, 25 okt 2026) ──────────────────
async function alsPlan(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("gronn-intro", "1")
    localStorage.setItem("gronn-weergave", JSON.stringify({ layout: "plan" }))
  })
}

test("layout: de wissel in de voet zet Blueprint aan en weer uit, en het blijft bewaard", async ({ page }) => {
  await zonderIntro(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  await expect(page.locator("nav[data-menu]")).toBeVisible()
  await expect(page.locator(".bk")).toBeHidden()
  await page.getByRole("button", { name: "Bekijk als blueprint" }).click()
  await expect(page.locator("html")).toHaveClass(/\bplan\b/)
  await expect(page.locator(".bk")).toBeVisible()
  await expect(page.locator("nav[data-menu]")).toBeHidden()
  await expect(page.locator("h1:visible")).toHaveCount(1)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/\bplan\b/)
  await page.getByRole("button", { name: "Klassieke layout" }).click()
  await expect(page.locator("html")).not.toHaveClass(/\bplan\b/)
})

test("layout: Blueprint kiezen in Weergave via het megamenu", async ({ page }) => {
  await zonderIntro(page)
  await page.goto("/over")
  await page.getByRole("button", { name: "Menu" }).click()
  await page.click('#megamenu label:has(input[value="plan"])')
  await expect(page.locator("html")).toHaveClass(/\bplan\b/)
  await expect(page.locator(".bk")).toBeVisible()
})

test("tuinplan, index: een blad kiezen gaat naar die pagina", async ({ page }) => {
  await alsPlan(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  await page.getByRole("button", { name: "Index" }).click()
  const index = page.getByRole("dialog", { name: "Index" })
  await expect(index).toBeVisible()
  await index.locator('a[href="/werk"]').click()
  await expect(page).toHaveURL(/\/werk$/, { timeout: 10_000 })
  await expect(index).toBeHidden()
  await expect(page.locator(".bk-blad")).toContainText("B-05")
})

for (const b of [390, 1440]) {
  test(`tuinplan, index @${b}: acht bladen, het huidige gemarkeerd, Esc sluit`, async ({ page }) => {
    await alsPlan(page)
    await page.setViewportSize({ width: b, height: 800 })
    await page.goto("/werk/terras-geulle", { waitUntil: "domcontentloaded" })
    const knop = page.getByRole("button", { name: "Index" })
    await page.mouse.wheel(0, 1200)
    await page.waitForTimeout(300)
    await expect(knop).toBeInViewport()
    await knop.click()
    const index = page.getByRole("dialog", { name: "Index" })
    await expect(index.locator("nav ol > li")).toHaveCount(8)
    await expect(index.getByRole("link", { name: /Werk/ })).toHaveAttribute("aria-current", "page")
    await expect(index.locator('input[value="donker"]')).toBeAttached()
    await page.keyboard.press("Escape")
    await expect(index).toBeHidden()
    await expect(knop).toBeFocused()
  })
}

test("tuinplan, uitlijning: logo, kop en stempelvak op één lijn", async ({ page }) => {
  await alsPlan(page)
  await page.setViewportSize({ width: 1920, height: 900 })
  for (const route of ["/", "/vijvers", "/over"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    const [h1, voet, logo] = await page.evaluate(() => {
      const links = (e: Element) => Math.round(e.getBoundingClientRect().left)
      const kop = [...document.querySelectorAll("main h1")].find((e) => (e as HTMLElement).offsetParent)!
      const wrap = document.querySelector("footer.stempel")!
      return [links(kop), Math.round(wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft)), links(document.querySelector(".bk-merk")!)]
    })
    expect([h1, logo], route).toEqual([voet, voet])
  }
})

test("blueprint: terug naar boven verschijnt tijdens het lezen en brengt je bovenaan", async ({ page }) => {
  await alsPlan(page)
  for (const b of [390, 1440]) {
    await page.setViewportSize({ width: b, height: 800 })
    await page.goto("/vijvers", { waitUntil: "domcontentloaded" })
    const omhoog = page.getByRole("button", { name: "Terug naar boven" })
    await expect(omhoog).toBeHidden()
    await page.mouse.wheel(0, 1600)
    await expect(omhoog).toBeVisible()
    await omhoog.click()
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5)
  }
})

test("trekken om te vernieuwen in de app-weergave @390", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium")
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    const echt = window.matchMedia.bind(window)
    window.matchMedia = (q: string) => (q.includes("display-mode: standalone") ? ({ ...echt("all"), matches: true, media: q, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList) : echt(q))
  })
  await page.goto("/")
  await expect(page.locator("[data-trek]")).toBeAttached()
  const cdp = await page.context().newCDPSession(page)
  const raak = (type: "touchStart" | "touchMove" | "touchEnd", y: number) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: 195, y }] })
  await raak("touchStart", 150)
  for (let y = 160; y <= 420; y += 20) await raak("touchMove", y)
  await expect(page.locator("[data-trek]")).toHaveAttribute("data-trek", "pulling")
  const herladen = page.waitForEvent("framenavigated")
  await raak("touchEnd", 420)
  await herladen
})
