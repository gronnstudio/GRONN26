import { expect, test, type Page } from "@playwright/test"

// Twee animaties uit de oude site die de eigenaar terug wilde (23 sep
// 2026): het openingsdoek ("een doek met het GRØNN-logo dat optilt, één
// keer per sessie") en de letterrol op de menulinks van de desktopbalk.
//
// Het doek speelt in CSS vóór de hydratatie en duurt 1,35 s. Om daar
// niet tegen de klok in te meten, zet `pauzeer()` de animaties van het
// doek al vóór het eerste beeld stil; de test zet de tijd dan zelf, of
// laat ze met `play()` weer lopen en meet vanaf dat moment.

const DOEK = ".openingsdoek"

/** Alle animaties van het doek stil, vóór er iets geschilderd is. */
async function pauzeer(page: Page) {
  await page.addInitScript(() => {
    const css = ".openingsdoek,.openingsdoek *{animation-play-state:paused!important}"
    const zet = () => {
      const s = document.createElement("style")
      s.textContent = css
      document.documentElement.appendChild(s)
    }
    if (document.documentElement) zet()
    else
      new MutationObserver((_, o) => {
        if (!document.documentElement) return
        o.disconnect()
        zet()
      }).observe(document, { childList: true })
  })
}

/** Wat het doek deed op het moment dat de HTML binnen was. */
async function noteerBijDcl(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const d = document.querySelector(".openingsdoek")
      ;(window as unknown as { __doek: string }).__doek = d
        ? getComputedStyle(d).display
        : "afwezig"
    })
  })
}

async function zetUur(page: Page, uur: "goldenhour" | "bluehour") {
  await page.addInitScript((u) => {
    localStorage.setItem("theme", u)
    localStorage.setItem("gronn-theme-mode", "manual")
  }, uur)
}

/** De gepauzeerde animaties op een vast tijdstip (ms vanaf het begin). */
async function zetTijd(page: Page, ms: number) {
  await page.evaluate((t) => {
    const doek = document.querySelector(".openingsdoek")!
    for (const a of doek.getAnimations({ subtree: true })) a.currentTime = t
  }, ms)
}

test.describe("openingsdoek", () => {
  test("eerste bezoek: het doek speelt, vangt geen klik en is na 1,35 s weg", async ({ page }) => {
    // Gouden Uur vast: zonder keuze beslist de klok van de runner, en de
    // Blauwe Uur heeft zijn eigen, langere tijdlijn (test hieronder).
    await zetUur(page, "goldenhour")
    await pauzeer(page)
    await page.goto("/nl", { waitUntil: "domcontentloaded" })
    const doek = page.locator(DOEK)
    await expect(doek).toBeVisible()
    await expect(doek).toHaveAttribute("aria-hidden", "true")
    await expect(doek).toHaveCSS("pointer-events", "none")

    const timing = await doek.evaluate((el) =>
      el.getAnimations({ subtree: true }).map((a) => ({
        naam: (a as CSSAnimation).animationName,
        eind: Number(a.effect!.getComputedTiming().endTime),
      }))
    )
    expect(timing.map((t) => t.naam).sort()).toEqual(["doek-merk", "doek-op"])
    // Kort en rustig: ruim onder de 2,9 s van het oude doek.
    expect(Math.max(...timing.map((t) => t.eind))).toBeLessThanOrEqual(1400)

    // Klikken gaan erdoorheen: onder het midden van een zichtbare link
    // ligt die link, niet het doek.
    const doorheen = await page.evaluate(() => {
      const link = [...document.querySelectorAll("main a[href]")].find((a) => {
        const r = a.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight
      })
      if (!link) return "geen link"
      const r = link.getBoundingClientRect()
      const raak = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return raak && link.contains(raak) ? "link" : raak?.className?.toString() ?? "niets"
    })
    expect(doorheen).toBe("link")

    // Laten lopen: binnen de animatieduur (plus marge voor een drukke
    // runner) is het doek opgetild en uit de DOM.
    const start = Date.now()
    await doek.evaluate((el) => el.getAnimations({ subtree: true }).forEach((a) => a.play()))
    await expect(doek).toHaveCount(0, { timeout: 4000 })
    expect(Date.now() - start).toBeGreaterThanOrEqual(1200)
  })

  test("Blauwe Uur: het primaire logo tekent zichzelf, dan tilt het doek op", async ({ page }) => {
    // Nicks lijnlogo (stroke_logo_intro.svg uit Drive, 28 sep 2026): 1,2 s
    // lijnen en 0,5 s vulling. Het doek wacht tot het logo vol staat en
    // tilt dan op; geen masker, dus alleen `doek-op` loopt.
    await zetUur(page, "bluehour")
    await pauzeer(page)
    await page.goto("/nl", { waitUntil: "domcontentloaded" })
    const doek = page.locator(DOEK)
    await expect(doek).toBeVisible()
    await expect(doek).toHaveCSS("pointer-events", "none")

    const timing = await doek.evaluate((el) =>
      el.getAnimations({ subtree: true }).map((a) => ({
        naam: (a as CSSAnimation).animationName,
        begin: Number(a.effect!.getComputedTiming().delay ?? a.effect!.getTiming().delay),
        eind: Number(a.effect!.getComputedTiming().endTime),
      }))
    )
    expect(timing.map((t) => t.naam)).toEqual(["doek-op"])
    // Pas op na lijnen + vulling (1,7 s), en weg binnen 2,5 s.
    expect(timing[0].begin).toBeGreaterThanOrEqual(1700)
    expect(timing[0].eind).toBeLessThanOrEqual(2500)

    // Het getekende logo: één zichtbaar beeld, de intro met zijn SMIL.
    const merk = doek.locator("img:visible")
    await expect(merk).toHaveCount(1)
    await expect(merk).toHaveAttribute("src", /woordmerk-intro\.svg/)
    const svg = await page.request.get("/brand/woordmerk-intro.svg")
    const bron = await svg.text()
    expect(bron).toContain('viewBox="120 266 784 167"')
    expect(bron).toMatch(/<animate [^>]*stroke-dashoffset[^>]*dur="1\.2s"/)
    expect(bron).toMatch(/<animate [^>]*opacity[^>]*dur="0\.5s"[^>]*begin="1\.2s"/)
  })

  test("tweede pagina in dezelfde sessie: geen doek", async ({ page }) => {
    await page.goto("/nl")
    await expect(page.locator(DOEK)).toHaveCount(0, { timeout: 5000 })

    await pauzeer(page)
    await noteerBijDcl(page)
    for (const pad of ["/nl/projects", "/nl"]) {
      await page.goto(pad, { waitUntil: "domcontentloaded" })
      await expect(page.locator("html")).toHaveClass(/intro-seen/)
      expect(await page.evaluate(() => (window as unknown as { __doek: string }).__doek)).toMatch(
        /^(none|afwezig)$/
      )
      // Gepauzeerd en toch weg: dan heeft het nooit gespeeld.
      await expect(page.locator(DOEK)).toHaveCount(0)
    }
  })

  test.describe("minder beweging (systeem)", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } })
    test("geen doek, ook niet bij het eerste bezoek", async ({ page }) => {
      await pauzeer(page)
      await noteerBijDcl(page)
      await page.goto("/nl", { waitUntil: "domcontentloaded" })
      expect(await page.evaluate(() => (window as unknown as { __doek: string }).__doek)).toMatch(
        /^(none|afwezig)$/
      )
      await expect(page.locator(DOEK)).toHaveCount(0)
    })
  })

  test("minder beweging (eigen keuze op de site): geen doek", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced"))
    await pauzeer(page)
    await noteerBijDcl(page)
    await page.goto("/nl", { waitUntil: "domcontentloaded" })
    expect(await page.evaluate(() => (window as unknown as { __doek: string }).__doek)).toMatch(
      /^(none|afwezig)$/
    )
    await expect(page.locator(DOEK)).toHaveCount(0)
  })

  test("geïnstalleerde app: geen doek, het beginscherm deed dat al", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "standalone", { get: () => true })
    })
    await pauzeer(page)
    await noteerBijDcl(page)
    await page.goto("/nl", { waitUntil: "domcontentloaded" })
    await expect(page.locator("html")).toHaveClass(/intro-seen/)
    expect(await page.evaluate(() => (window as unknown as { __doek: string }).__doek)).toMatch(
      /^(none|afwezig)$/
    )
    await expect(page.locator(DOEK)).toHaveCount(0)
  })

  const UREN = [
    { uur: "goldenhour", grond: "rgb(239, 238, 234)", merk: /woordmerk-antraciet\.svg/ },
    { uur: "bluehour", grond: "rgb(32, 32, 32)", merk: /woordmerk-intro\.svg/ },
  ] as const

  for (const { uur, grond, merk } of UREN) {
    test(`${uur}: vlakke grond en het woordmerk uit public/brand`, async ({ page }) => {
      await zetUur(page, uur)
      await pauzeer(page)
      await page.goto("/nl", { waitUntil: "domcontentloaded" })
      await expect(page.locator("html")).toHaveClass(new RegExp(uur))
      // Het woordmerk staat, het doek is nog niet begonnen op te tillen.
      await zetTijd(page, 700)

      const doek = page.locator(DOEK)
      await expect(doek).toHaveCSS("background-color", grond)
      // Geen foto en geen gloed: alleen het woordmerk.
      await expect(doek).toHaveCSS("background-image", "none")
      await expect(doek.locator("img")).toHaveCount(2)
      const zichtbaar = doek.locator("img:visible")
      await expect(zichtbaar).toHaveCount(1)
      await expect(zichtbaar).toHaveAttribute("src", merk)
      await expect
        .poll(() => zichtbaar.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0)
      const box = await zichtbaar.boundingBox()
      expect(box!.height).toBeCloseTo(56, 0)
    })
  }
})

test.describe("letterrol in de menubalk", () => {
  test.skip(({ isMobile }) => isMobile, "de menubalk met letterrol is desktop")

  const LINKS = ["Studio", "Diensten", "Projecten"]
  const ORANJE = { goldenhour: "rgb(161, 67, 18)", bluehour: "rgb(226, 123, 60)" } as const

  async function open(page: Page, uur: keyof typeof ORANJE) {
    await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
    await zetUur(page, uur)
    await page.goto("/nl", { waitUntil: "networkidle" })
  }

  test("naam blijft het woord, de rollaag is verborgen voor schermlezers", async ({ page }) => {
    await open(page, "goldenhour")
    for (const woord of LINKS) {
      const knop = page.getByRole("button", { name: woord, exact: true })
      await expect(knop).toHaveAccessibleName(woord)
      const rol = knop.locator(".letter-flip")
      await expect(rol).toHaveAttribute("aria-hidden", "true")
      await expect(rol.locator(".letter-flip-in")).toHaveCount(woord.length)
      await expect(rol.locator(".letter-flip-uit")).toHaveCount(woord.length)
    }
  })

  for (const uur of ["goldenhour", "bluehour"] as const) {
    test(`${uur}: hover rolt de letters naar --ember-text`, async ({ page }) => {
      await open(page, uur)
      const knop = page.getByRole("button", { name: "Diensten", exact: true })
      const rol = knop.locator(".letter-flip")
      const eersteIn = rol.locator(".letter-flip-in").first()
      const eersteUit = rol.locator(".letter-flip-uit").first()
      const rust = (await rol.boundingBox())!

      await expect(async () => {
        await knop.hover()
        // De oranje kopie staat op de plek van het woord, het woord is
        // er boven uit gerold.
        const bIn = (await eersteIn.boundingBox())!
        const bUit = (await eersteUit.boundingBox())!
        expect(Math.abs(bIn.y - rust.y)).toBeLessThan(1)
        expect(bUit.y).toBeLessThan(rust.y - rust.height + 1)
      }).toPass({ timeout: 10_000 })
      await expect(eersteIn).toHaveCSS("color", ORANJE[uur])
    })
  }

  const MINDER = [
    { hoe: "systeem", zet: async (page: Page) => page.emulateMedia({ reducedMotion: "reduce" }) },
    {
      hoe: "eigen keuze",
      zet: async (page: Page) =>
        page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced")),
    },
  ]

  for (const { hoe, zet } of MINDER) {
    test(`minder beweging (${hoe}): geen rol, alleen de kleur`, async ({ page }) => {
      await zet(page)
      await open(page, "goldenhour")
      const knop = page.getByRole("button", { name: "Diensten", exact: true })
      const rol = knop.locator(".letter-flip")
      const eersteUit = rol.locator(".letter-flip-uit").first()
      await expect(rol.locator(".letter-flip-in-rij")).toBeHidden()
      const voor = (await eersteUit.boundingBox())!

      await expect(async () => {
        await knop.hover()
        await expect(eersteUit).toHaveCSS("color", ORANJE.goldenhour, { timeout: 1000 })
      }).toPass({ timeout: 10_000 })
      const na = (await eersteUit.boundingBox())!
      expect(na.y).toBeCloseTo(voor.y, 0)
      await expect(knop).toHaveAccessibleName("Diensten")
    })
  }
})
