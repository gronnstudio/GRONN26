import { expect, test, type Locator, type Page } from "@playwright/test"

// Leesdraad en VolgendProject (eigenaar, 25 sep 2026: "Bouw ze").
//
// Leesdraad: een lijn van 2px bovenaan het scherm die volloopt terwijl
// je leest — pure CSS op scroll(root block). Eerst alleen op de lange
// vijverpagina, sinds 28 sep 2026 op elke pagina (eigenaar, uit zijn
// CodePen: "Voortgangsbalk bovenaan"), maar niet op de linkpagina. Alleen
// met beweging (anders display: none), decoratie (aria-hidden), en nooit
// over de knoppen van de bovenbalk.
//
// VolgendProject: onderaan elke projectpagina één kaart naar het andere
// echte project (vijver ↔ terras, rondlopend), met een duidelijke
// linknaam, een foto met alt, en niets dat zijwaarts wegloopt.

const VIJVER = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"
const TERRAS = "/nl/projects/terras-geulle-24-m2-betontegels"
const VIJVER_TITEL = "Twee vijvers. Eén samenhangend watersysteem."
const TERRAS_TITEL = "Een terras van 24 m², gelegd in twee dagen."

function thema(page: Page, naam: "goldenhour" | "bluehour") {
  return page.addInitScript((t) => {
    try {
      sessionStorage.setItem("gronn-intro", "1")
      localStorage.setItem("theme", t)
      localStorage.setItem("gronn-theme-mode", "manual")
    } catch {}
  }, naam)
}

test.beforeEach(async ({ page }) => {
  await thema(page, "goldenhour")
})

/** Horizontale schaal van de draad: "none" is heel. */
const schaalX = (draad: Locator) =>
  draad.evaluate((el) => {
    const s = getComputedStyle(el).scale
    return s === "none" ? 1 : Number(s.split(" ")[0])
  })

const kleurVan = (page: Page, token: string) =>
  page.evaluate((v) => {
    const p = document.createElement("span")
    p.style.backgroundColor = `var(${v})`
    document.body.append(p)
    const c = getComputedStyle(p).backgroundColor
    p.remove()
    return c
  }, token)

// ── Leesdraad ──────────────────────────────────────────────────────────
test("leesdraad: aria-hidden, loopt vol tijdens het lezen", async ({ page }) => {
  await page.goto(VIJVER, { waitUntil: "networkidle" })
  const draad = page.locator("[data-leesdraad]")
  await expect(draad).toHaveCount(1)
  await expect(draad).toHaveAttribute("aria-hidden", "true")

  const stijl = await draad.evaluate((el) => {
    const s = getComputedStyle(el)
    return {
      naam: s.animationName,
      display: s.display,
      positie: s.position,
      hoogte: s.height,
      top: s.top,
      z: s.zIndex,
      wijzer: s.pointerEvents,
      oorsprong: s.transformOrigin,
    }
  })
  expect(stijl).toMatchObject({
    naam: "g-leesdraad",
    display: "block",
    positie: "fixed",
    hoogte: "2px",
    top: "0px",
    z: "55",
    wijzer: "none",
  })
  // Van links: de oorsprong ligt op x = 0.
  expect(stijl.oorsprong.startsWith("0px")).toBe(true)

  // Bovenaan: (bijna) leeg. Halverwege: ertussenin. Onderaan: vol.
  expect(await schaalX(draad)).toBeLessThan(0.05)
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2))
  await expect.poll(() => schaalX(draad)).toBeGreaterThan(0.4)
  expect(await schaalX(draad)).toBeLessThan(0.6)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(() => schaalX(draad)).toBeGreaterThan(0.98)

  // Bosgroen op licht — geen oranje.
  expect(await draad.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await kleurVan(page, "--gronn-forest"))

})

test("leesdraad: op elke pagina precies één, leeg bovenaan; niet op de linkpagina", async ({ page }) => {
  for (const pad of [TERRAS, "/nl/projects", "/nl", "/nl/studio", "/nl/services", "/nl/contact", "/en"]) {
    await page.goto(pad, { waitUntil: "networkidle" })
    const draad = page.locator("[data-leesdraad]")
    await expect(draad, pad).toHaveCount(1)
    expect(await schaalX(draad), pad).toBeLessThan(0.05)
  }
  await page.goto("/links", { waitUntil: "networkidle" })
  await expect(page.locator("[data-leesdraad]")).toHaveCount(0)
})

test("leesdraad: salie op Blauwe Uur", async ({ page }) => {
  await thema(page, "bluehour")
  await page.goto(VIJVER, { waitUntil: "networkidle" })
  const draad = page.locator("[data-leesdraad]")
  await expect.poll(() => draad.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await kleurVan(page, "--gronn-light"))
})

test("leesdraad: ligt boven de bovenbalk, niet erop, en onder elk menu", async ({ page, isMobile }) => {
  await page.goto(VIJVER, { waitUntil: "networkidle" })
  await page.evaluate(() => window.scrollTo(0, 2400))
  const draad = page.locator("[data-leesdraad]")
  await expect.poll(() => schaalX(draad)).toBeGreaterThan(0)
  const onder = await draad.evaluate((el) => el.getBoundingClientRect().bottom)
  if (isMobile) {
    // De pil van de bovenbalk begint 12px onder de rand: de draad erboven.
    const balk = await page.locator("[data-topbar-row]").evaluate((el) => el.getBoundingClientRect().top)
    expect(onder).toBeLessThanOrEqual(balk)
    const z = await page.locator("[data-nav='topbar']").evaluate((el) => Number(getComputedStyle(el).zIndex))
    expect(z).toBeGreaterThan(55)
  } else {
    // De desktopbalk (z 50) ligt eronder; het logo begint ver onder 2px.
    const logo = await page.locator('header a[aria-label="GRØNN — Home"]').evaluate((el) => el.getBoundingClientRect().top)
    expect(onder).toBeLessThanOrEqual(logo)
  }
})

for (const [naam, zet] of [
  ["systeem (prefers-reduced-motion)", (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })],
  [
    "eigen keuze (gronn-a11y-motion)",
    (page: Page) => page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced")),
  ],
] as const) {
  test(`minder beweging, ${naam}: geen leesdraad, volgende foto meteen heel`, async ({ page }) => {
    await zet(page)
    await page.goto(VIJVER, { waitUntil: "networkidle" })
    const draad = page.locator("[data-leesdraad]")
    await expect(draad).toHaveCount(1)
    await expect.poll(() => draad.evaluate((el) => getComputedStyle(el).display)).toBe("none")
    expect(await draad.evaluate((el) => getComputedStyle(el).animationName)).toBe("none")

    const beeld = page.locator("[data-volgend-project] .g-volgend-beeld")
    expect(await beeld.evaluate((el) => getComputedStyle(el).animationName)).toBe("none")
    expect(await beeld.evaluate((el) => getComputedStyle(el).clipPath)).toBe("none")
  })
}

// ── VolgendProject ─────────────────────────────────────────────────────
for (const [van, naar, titel, andereTitel] of [
  [VIJVER, TERRAS, TERRAS_TITEL, VIJVER_TITEL],
  [TERRAS, VIJVER, VIJVER_TITEL, TERRAS_TITEL],
] as const) {
  test(`volgend project op ${van.split("/").at(-1)}: één kaart naar het andere project`, async ({ page }) => {
    await page.goto(van, { waitUntil: "networkidle" })
    const blok = page.locator("main [data-volgend-project]")
    await expect(blok).toHaveCount(1)
    await expect(blok).toHaveAttribute("aria-label", "Volgend project")

    const kaart = blok.locator(`a[href="${naar}"]`)
    await expect(kaart).toHaveCount(1)
    await expect(kaart).toHaveAccessibleName(`Volgend project ${titel}`)
    await expect(kaart.locator("#volgend-titel")).toHaveText(titel)
    await expect(kaart).not.toContainText(andereTitel)
    await expect(kaart.locator('[class*="gronn-ember"]')).toHaveCount(1) // de ene stip van Status

    const img = kaart.locator("img")
    await expect(img).toHaveCount(1)
    const alt = await img.getAttribute("alt")
    expect(alt?.length ?? 0).toBeGreaterThan(20)
    // 16px, zoals elke foto.
    expect(await kaart.locator(".g-volgend-beeld").evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("16px")

    // Daaronder de regel naar alle projecten.
    await expect(blok.getByRole("link", { name: "alle projecten" })).toHaveAttribute("href", "/nl/projects")

    // Beweging: de foto opent vanuit een inzet; in beeld gescrold staat hij helemaal open.
    const beeld = kaart.locator(".g-volgend-beeld")
    expect(await beeld.evaluate((el) => getComputedStyle(el).animationName)).toBe("g-volgend-beeld")
    // Nog onder de vouw: ingezet (4 %, vanaf md 8 %).
    expect(await beeld.evaluate((el) => getComputedStyle(el).clipPath)).toMatch(/^inset\([48]% round 16px\)$/)
    await beeld.evaluate((el) => el.scrollIntoView({ block: "start" }))
    await expect.poll(() => beeld.evaluate((el) => getComputedStyle(el).clipPath)).toMatch(/^inset\(0(px|%)? round 16px\)$/)

    // En de klik landt echt op dat project.
    await kaart.click()
    await expect(page).toHaveURL(new RegExp(`${naar}$`))
    await expect(page.locator("h1")).toContainText(titel.split(".")[0])
  })
}

test("volgend project in het Engels: Next project, Engelse routes", async ({ page }) => {
  await page.goto("/projects/terras-geulle-24-m2-betontegels", { waitUntil: "networkidle" })
  const kaart = page.locator('main [data-volgend-project] a[href="/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"]')
  await expect(kaart).toHaveAccessibleName(`Next project ${VIJVER_TITEL}`)
  await expect(page.locator("main [data-volgend-project]").getByRole("link", { name: "all projects" })).toHaveAttribute(
    "href",
    "/projects"
  )
})

for (const breedte of [320, 375]) {
  test(`${breedte}px: de kaart staat gestapeld en niets loopt zijwaarts weg`, async ({ page }) => {
    await page.setViewportSize({ width: breedte, height: 740 })
    for (const pad of [VIJVER, TERRAS]) {
      await page.goto(pad, { waitUntil: "networkidle" })
      const sw = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(sw, pad).toBeLessThanOrEqual(breedte)
      const kaart = page.locator("main [data-volgend-project] a").first()
      await kaart.scrollIntoViewIfNeeded()
      const [beeld, titel] = await Promise.all([
        kaart.locator(".g-volgend-beeld").boundingBox(),
        kaart.locator("#volgend-titel").boundingBox(),
      ])
      const doos = await kaart.boundingBox()
      expect(doos!.x, pad).toBeGreaterThanOrEqual(0)
      expect(doos!.x + doos!.width, pad).toBeLessThanOrEqual(breedte)
      // Gestapeld: de titel staat onder de foto.
      expect(titel!.y, pad).toBeGreaterThan(beeld!.y + beeld!.height - 1)
    }
  })
}
