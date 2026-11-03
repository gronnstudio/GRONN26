import { expect, test, type Locator, type Page } from "@playwright/test"

// Tweede Qi-ronde (eigenaar, 24 sep 2026): de Stappenlijn (process /
// timeline) op het terras en de FaseBalk (progress, zonder percentages)
// op de projectkaarten, het uitgelichte blok op home en de kop van de
// vijverpagina. Wat hier vastligt: de lijn vult en de nummers worden
// oranje terwijl je leest, bij minder beweging staat alles meteen in de
// eindstand, de fasen zeggen eerlijk waar een project staat (één huidige
// fase, of klaar zonder huidige fase), en niets loopt zijwaarts weg.

const TERRAS = "/nl/projects/terras-geulle-24-m2-betontegels"
const VIJVER = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"

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

/** De kleur die een CSS-variabele op deze pagina echt oplevert. */
function tokenKleur(page: Page, token: string) {
  return page.evaluate((v) => {
    const p = document.createElement("span")
    p.style.color = `var(${v})`
    document.querySelector("main")!.append(p)
    const c = getComputedStyle(p).color
    p.remove()
    return c
  }, token)
}

const nummerKleuren = (lijst: Locator) =>
  lijst.evaluate((ol) => [...ol.querySelectorAll(".g-stap-nummer")].map((n) => getComputedStyle(n).color))

/** Verticale schaal van de vullijn (::after): "none" is heel. */
const lijnSchaal = (lijst: Locator) =>
  lijst.evaluate((ol) => {
    const s = getComputedStyle(ol, "::after").scale
    if (s === "none") return 1
    const [x, y] = s.split(" ").map(Number)
    return y ?? x
  })

// ── Stappenlijn ────────────────────────────────────────────────────────
test("stappenlijn: acht stappen, de lijn vult en elk nummer wordt oranje bij het lezen", async ({ page }) => {
  await page.goto(TERRAS, { waitUntil: "networkidle" })
  const lijst = page.locator('section[aria-labelledby="werk-kop"] ol[data-stappenlijn]')
  await expect(lijst.locator(":scope > li")).toHaveCount(8)
  await expect(lijst.locator(":scope > li").first()).toContainText("01")
  await expect(lijst.locator(":scope > li").nth(7)).toContainText("Afwerken en het geheel controleren")

  const [oranje, gedempt] = [await tokenKleur(page, "--ember-text"), await tokenKleur(page, "--muted")]
  expect(oranje).not.toBe(gedempt)

  // Bovenaan de pagina: de lijst ligt nog onder de leeslijn.
  expect(await lijnSchaal(lijst)).toBeLessThan(0.05)
  expect((await nummerKleuren(lijst)).at(-1)).toBe(gedempt)

  // Lees de lijst uit: de onderkant voorbij de bovenrand van het scherm.
  await lijst.evaluate((ol) => window.scrollTo(0, ol.getBoundingClientRect().bottom + scrollY))
  await expect.poll(() => nummerKleuren(lijst)).toEqual(Array(8).fill(oranje))
  await expect.poll(() => lijnSchaal(lijst)).toBeGreaterThan(0.99)
})

test("stappenlijn: bosgroen op licht, salie op Blauwe Uur, 24px van de rand", async ({ page }) => {
  await page.goto(TERRAS, { waitUntil: "networkidle" })
  const lijst = page.locator("ol[data-stappenlijn]")
  const lijn = () => lijst.evaluate((ol) => getComputedStyle(ol, "::after").backgroundColor)
  const bos = await page.evaluate(() => {
    const p = document.createElement("span")
    p.style.backgroundColor = "var(--gronn-forest)"
    document.body.append(p)
    return getComputedStyle(p).backgroundColor
  })
  expect(await lijn()).toBe(bos)
  // Het midden van elk nummer ligt op de lijn.
  const posities = await lijst.evaluate((ol) => {
    const r = ol.getBoundingClientRect()
    const na = getComputedStyle(ol, "::after")
    const lijnMidden = parseFloat(na.left) + parseFloat(na.width) / 2
    return [...ol.querySelectorAll(".g-stap-nummer")].map((n) => {
      const b = n.getBoundingClientRect()
      return Math.abs(b.left + b.width / 2 - r.left - lijnMidden)
    }).concat(lijnMidden - 24)
  })
  for (const p of posities) expect(Math.abs(p)).toBeLessThanOrEqual(1)

  // Een later init-script wint: nu Blauwe Uur.
  await thema(page, "bluehour")
  await page.reload({ waitUntil: "networkidle" })
  const salie = await page.evaluate(() => {
    const p = document.createElement("span")
    p.style.backgroundColor = "var(--gronn-light)"
    document.body.append(p)
    return getComputedStyle(p).backgroundColor
  })
  await expect.poll(lijn).toBe(salie)
})

for (const [naam, zet] of [
  ["systeem (prefers-reduced-motion)", (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })],
  [
    "eigen keuze (gronn-a11y-motion)",
    (page: Page) => page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced")),
  ],
] as const) {
  test(`minder beweging, ${naam}: lijn getekend, nummers oranje, fasen gevuld — zonder te scrollen`, async ({ page }) => {
    await zet(page)
    await page.goto(TERRAS, { waitUntil: "networkidle" })
    const lijst = page.locator("ol[data-stappenlijn]")
    const oranje = await tokenKleur(page, "--ember-text")
    // Niet gescrold: de lijst staat onder de vouw, en toch al in de eindstand.
    expect(await lijst.evaluate((ol) => ol.getBoundingClientRect().top > innerHeight * 0.6)).toBe(true)
    await expect.poll(() => nummerKleuren(lijst)).toEqual(Array(8).fill(oranje))
    expect(await lijnSchaal(lijst)).toBe(1)
    expect(await lijst.evaluate((ol) => getComputedStyle(ol, "::after").animationName)).toBe("none")

    await page.goto("/nl/projects", { waitUntil: "networkidle" })
    const vullingen = await page.locator(".g-fase-vul").evaluateAll((els) =>
      els.map((e) => `${getComputedStyle(e).animationName}|${getComputedStyle(e).scale}`)
    )
    // Vijver: drie vakken (tot en met Afronding); terras: alle vier.
    expect(vullingen).toEqual(Array(7).fill("none|none"))
  })
}

// ── FaseBalk ───────────────────────────────────────────────────────────
async function vijverBalk(balk: Locator, huidig = "Afronding") {
  await expect(balk).toHaveAttribute("data-fasebalk", "bezig")
  await expect(balk.locator(":scope > li")).toHaveCount(4)
  const nu = balk.locator('li[aria-current="step"]')
  await expect(nu).toHaveCount(1)
  await expect(nu).toContainText(huidig)
  // De oranje stip van Status, alleen bij de huidige fase.
  await expect(nu.locator('[class*="gronn-ember"]')).toHaveCount(1)
  await expect(balk.locator('[class*="gronn-ember"]')).toHaveCount(1)
  await expect(balk.locator('li[data-fase="gedaan"]')).toHaveCount(2)
  await expect(balk.locator('li[data-fase="straks"]')).toHaveCount(1)
  // Vakken gevuld tot en met de huidige fase, niet verder.
  await expect(balk.locator(".g-fase-vul")).toHaveCount(3)
  await expect(balk.locator(":scope > li").nth(3).locator(".g-fase-vul")).toHaveCount(0)
  // Geen percentage, nergens.
  expect(await balk.textContent()).not.toMatch(/%/)
}

test("fasebalk op /nl/projects: vijver in Afronding, terras helemaal klaar", async ({ page }) => {
  await page.goto("/nl/projects", { waitUntil: "networkidle" })
  const vijver = page.locator(`main a[href="${VIJVER}"] ol[data-fasebalk]`)
  await expect(page.getByRole("list", { name: "Projectfasen" })).toHaveCount(2)
  await vijverBalk(vijver)
  await expect(vijver.locator(":scope > li").nth(3)).toContainText("Beplanting")
  await expect(vijver.locator(":scope > li").nth(3)).toContainText("voorjaar 2027")
  await expect(vijver.locator('li[data-fase="straks"] .sr-only')).toHaveText("(nog niet begonnen)")

  // Het terras is afgerond: alles gevuld, en er is geen fase meer "nu".
  const terras = page.locator(`main a[href="${TERRAS}"] ol[data-fasebalk]`)
  await expect(terras).toHaveAttribute("data-fasebalk", "klaar")
  await expect(terras.locator(":scope > li")).toHaveCount(4)
  await expect(terras.locator("[aria-current]")).toHaveCount(0)
  await expect(terras.locator('li[data-fase="gedaan"]')).toHaveCount(4)
  await expect(terras.locator(".g-fase-vul")).toHaveCount(4)
  await expect(terras.locator(".sr-only")).toHaveText(Array(4).fill("(afgerond)"))
  await expect(terras.locator(":scope > li")).toHaveText([/Grondwerk/, /Zandbed en banden/, /Tegels/, /Afwerking/])

  // Normale beweging: in beeld gescrold staan alle vullingen vol.
  for (const balk of [vijver, terras]) {
    await balk.evaluate((el) => el.scrollIntoView({ block: "center" }))
    await expect
      .poll(() => balk.locator(".g-fase-vul").evaluateAll((els) => els.every((e) => /^(none|1|1 1)$/.test(getComputedStyle(e).scale))))
      .toBe(true)
  }
})

test("fasebalk in het Engels: dezelfde stand, Engelse namen", async ({ page }) => {
  await page.goto("/projects", { waitUntil: "networkidle" })
  const balk = page.locator('main a[href="/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"] ol[data-fasebalk]')
  await expect(balk).toHaveAttribute("aria-label", "Project phases")
  await vijverBalk(balk, "Finishing")
  await expect(balk.locator(":scope > li").nth(3)).toContainText("spring 2027")
})

test("fasebalk in de kop van de vijverpagina: Afronding, en stil boven de vouw", async ({ page }) => {
  await page.goto(VIJVER, { waitUntil: "networkidle" })
  const balk = page.locator("article header ol[data-fasebalk]")
  await vijverBalk(balk)
  // Boven de vouw beweegt hij niet: een half gevulde balk zou iets
  // zeggen wat niet waar is.
  expect(await balk.locator(".g-fase-vul").evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName))).toEqual(
    Array(3).fill("none")
  )
})

test("fasebalk in het uitgelichte blok op home", async ({ page }) => {
  await page.goto("/nl", { waitUntil: "networkidle" })
  await vijverBalk(page.locator('section[aria-labelledby="project-kop"] ol[data-fasebalk]'))
})

// ── Smalle schermen ────────────────────────────────────────────────────
for (const breedte of [320, 375]) {
  test(`${breedte}px: niets loopt zijwaarts weg, fasen staan 2 × 2`, async ({ page }) => {
    // Vier volledige paginaladingen met networkidle; zie dock.spec.
    test.setTimeout(60_000)
    await page.setViewportSize({ width: breedte, height: 740 })
    for (const pad of ["/nl", "/nl/projects", VIJVER, TERRAS]) {
      // "load" + fonts, niet networkidle: die bleef in de volle ronde op
      // /nl/projects bij 320px hangen (25 sep 2026); de meting is opmaak.
      await page.goto(pad, { waitUntil: "load" })
      await page.evaluate(() => document.fonts.ready)
      // Tegen de gezette breedte, niet innerWidth: een telefoon (isMobile)
      // rekt zijn layout-viewport op tot wat er te breed staat.
      const sw = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(sw, pad).toBeLessThanOrEqual(breedte)
      const balken = page.locator("ol[data-fasebalk]")
      for (let b = 0; b < (await balken.count()); b++) {
        const vakken = await balken.nth(b).locator(":scope > li").evaluateAll((lis) =>
          lis.map((li) => {
            const r = li.getBoundingClientRect()
            return { links: Math.round(r.left), top: Math.round(r.top), rechts: r.right }
          })
        )
        expect(vakken[0].top, pad).toBe(vakken[1].top)
        expect(vakken[2].top, pad).toBeGreaterThan(vakken[0].top)
        expect(vakken[2].links, pad).toBe(vakken[0].links)
        for (const v of vakken) expect(v.rechts, pad).toBeLessThanOrEqual(breedte)
      }
    }
  })
}
