import { expect, test, type Page } from "@playwright/test"

// Het contrast van de volle opening op home, gemeten in pixels.
//
// Sinds 29 sep 2026 staat de tekst van de opening (label, kop, zin,
// naam en plaats) in gebroken wit OP de foto (VolleOpening, variant A;
// eigenaar: "A volle opening"). Wat eronder ligt is een foto, dus of het
// leesbaar is hangt af van waar de letters toevallig vallen. Net als bij
// de dock (dock-contrast.spec.ts) wordt dat hier niet aangenomen maar
// GEMETEN, op de drie schermen die ertoe doen.
//
// ── DE METHODE ─────────────────────────────────────────────────────
//
// 1. Het masker: de fotolaag onzichtbaar, zodat de letters in gebroken
//    wit op het effen antraciet van de sectie staan. Elke pixel die
//    daar voor ≥ 90 % letter is, hoort bij de kern van een letter.
// 2. De ondergrond: de foto terug, de letters doorzichtig. Wat er dan
//    onder elke kernpixel ligt, is precies wat die letter als achtergrond
//    heeft: foto + photo-glass + scrim.
// 3. Per kernpixel de WCAG-verhouding tussen de tekstkleur (met zijn
//    eigen alfa over die pixel gemengd) en die ondergrond. Getoetst wordt
//    het 1e percentiel — de lichtste 1 % van wat achter de letters ligt —
//    en het slechtste plekje wordt gelogd.
//
// Gedecodeerd met een canvas in de pagina, zoals dock-contrast: AGENTS.md
// §1 verbiedt een extra PNG-afhankelijkheid.
//
// Zakt er iets onder de drempel, dan gaat de scrim (`.opening-scrim` in
// globals.css) of het glas omhoog — nooit de drempel omlaag (CLAUDE.md).

/** Grote tekst (de kop, ≥ 24px): WCAG 1.4.3, 3:1. */
const DREMPEL_KOP = 3
/** Gewone en kleine tekst: 4,5:1. */
const DREMPEL_TEKST = 4.5

// Een foto van 1920 breed decoderen, twee keer, kost tijd op een drukke machine.
test.describe.configure({ timeout: 90_000 })

const OPENING = '[data-element="VolleOpening"]'
const TEKSTEN = {
  label: `${OPENING} [data-opening-label]`,
  kop: `${OPENING} h1`,
  zin: `${OPENING} [data-opening-zin]`,
  naam: `${OPENING} [data-opening-naam]`,
  plaats: `${OPENING} [data-opening-plaats]`,
} as const

async function metPalet(page: Page, thema: "goldenhour" | "bluehour") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t)
      localStorage.setItem("gronn-theme-mode", "manual")
      localStorage.setItem("gronn-zoektip-gezien", "1")
      sessionStorage.setItem("gronn-intro", "1")
    } catch {}
  }, thema)
}

async function klaar(page: Page) {
  await page.locator(".openingsdoek").waitFor({ state: "detached", timeout: 8000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  // De kop golft woord voor woord uit zijn masker (Kop direct).
  await page.waitForTimeout(1600)
}

type Uitslag = { naam: string; p01: number; slechtst: number; pixels: number }

async function meetOpening(page: Page): Promise<Uitslag[]> {
  const vakken = await page.evaluate((teksten) => {
    const cv = document.createElement("canvas")
    cv.width = cv.height = 1
    const cx = cv.getContext("2d", { willReadFrequently: true })!
    // De berekende kleur kan oklab() of color-mix() zijn; een canvas maakt er rgba van.
    const rgba = (c: string) => {
      cx.clearRect(0, 0, 1, 1)
      cx.fillStyle = "#000"
      cx.fillStyle = c
      cx.fillRect(0, 0, 1, 1)
      const d = cx.getImageData(0, 0, 1, 1).data
      return [d[0], d[1], d[2], d[3] / 255]
    }
    return Object.entries(teksten).map(([naam, sel]) => {
      const el = document.querySelector<HTMLElement>(sel)!
      const r = el.getBoundingClientRect()
      return { naam, x: r.x, y: r.y, w: r.width, h: r.height, kleur: rgba(getComputedStyle(el).color) }
    })
  }, TEKSTEN)

  const stijl = (css: string) => page.addStyleTag({ content: css })
  // 1. Het masker: zonder foto, de letters op effen antraciet.
  const zonderFoto = await stijl(`${OPENING} > div:first-child { visibility: hidden !important; }`)
  await page.waitForTimeout(150)
  const masker = (await page.screenshot()).toString("base64")
  await zonderFoto.evaluate((n) => (n as Element).remove())
  // 2. De ondergrond: de foto terug, de letters doorzichtig.
  const selectors = Object.values(TEKSTEN).map((s) => `${s}, ${s} *`).join(", ")
  const zonderTekst = await stijl(`${selectors} { color: transparent !important; text-shadow: none !important; }`)
  await page.waitForTimeout(150)
  const grond = (await page.screenshot()).toString("base64")
  await zonderTekst.evaluate((n) => (n as Element).remove())
  const dpr = await page.evaluate(() => window.devicePixelRatio)

  return page.evaluate(
    async ({ masker, grond, vakken, dpr }) => {
      const lees = async (b64: string) => {
        const img = new Image()
        img.src = "data:image/png;base64," + b64
        await img.decode()
        const c = document.createElement("canvas")
        c.width = img.width
        c.height = img.height
        const g = c.getContext("2d", { willReadFrequently: true })!
        g.drawImage(img, 0, 0)
        return g
      }
      const [gm, gg] = await Promise.all([lees(masker), lees(grond)])
      const f = (v: number) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      const lum = (r: number, g: number, b: number) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      const verhouding = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

      return vakken.map((v) => {
        const X = Math.max(0, Math.floor(v.x * dpr))
        const Y = Math.max(0, Math.floor(v.y * dpr))
        const W = Math.ceil(v.w * dpr)
        const H = Math.ceil(v.h * dpr)
        const m = gm.getImageData(X, Y, W, H).data
        const o = gg.getImageData(X, Y, W, H).data
        const [tr, tg, tb, ta] = v.kleur
        // Het effen antraciet van de sectie in het masker: de meest
        // voorkomende kleur in het vak (de letters zijn in de minderheid).
        const tel = new Map<string, number>()
        for (let i = 0; i < m.length; i += 4) {
          const k = `${m[i]},${m[i + 1]},${m[i + 2]}`
          tel.set(k, (tel.get(k) ?? 0) + 1)
        }
        const leeg = [...tel.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number)
        const lLeeg = lum(leeg[0], leeg[1], leeg[2])
        const lVol = lum(tr * ta + leeg[0] * (1 - ta), tg * ta + leeg[1] * (1 - ta), tb * ta + leeg[2] * (1 - ta))
        const waarden: number[] = []
        for (let i = 0; i < m.length; i += 4) {
          const dekking = (lum(m[i], m[i + 1], m[i + 2]) - lLeeg) / (lVol - lLeeg)
          if (dekking < 0.9) continue
          const [br, bg, bb] = [o[i], o[i + 1], o[i + 2]]
          const lt = lum(tr * ta + br * (1 - ta), tg * ta + bg * (1 - ta), tb * ta + bb * (1 - ta))
          waarden.push(verhouding(lt, lum(br, bg, bb)))
        }
        waarden.sort((a, b) => a - b)
        return {
          naam: v.naam,
          p01: Number((waarden[Math.floor(waarden.length * 0.01)] ?? 0).toFixed(2)),
          slechtst: Number((waarden[0] ?? 0).toFixed(2)),
          pixels: waarden.length,
        }
      })
    },
    { masker, grond, vakken, dpr }
  )
}

const SCHERMEN = [
  { naam: "1440 × 900", width: 1440, height: 900, telefoon: false },
  { naam: "1920 × 1080", width: 1920, height: 1080, telefoon: false },
  { naam: "390 × 844", width: 390, height: 844, telefoon: true },
] as const

test.describe("de tekst van de volle opening op de foto", () => {
  // Op 2× zijn de kernen van kleine letters (label 12px, plaats 14px)
  // groot genoeg om te tellen; op 1× haalde "Stein, Limburg" er 30.
  test.use({ deviceScaleFactor: 2 })
  for (const scherm of SCHERMEN) {
    test(`${scherm.naam}: kop ≥ 3:1, label, zin en naam ≥ 4,5:1`, async ({ page, isMobile }) => {
      test.skip(isMobile !== scherm.telefoon, scherm.telefoon ? "telefoonscherm" : "desktopscherm")
      await page.setViewportSize({ width: scherm.width, height: scherm.height })
      // De foto en de scrim zijn themavast; Licht is genoeg.
      await metPalet(page, "goldenhour")
      await page.goto("/nl", { waitUntil: "networkidle" })
      await klaar(page)

      const uitslag = await meetOpening(page)
      const regels = uitslag
        .map((u) => `${u.naam}: ${u.p01}:1 (slechtste plek ${u.slechtst}:1, ${u.pixels} px)`)
        .join("\n")
      console.log(`opening ${scherm.naam}\n${regels}`)
      for (const u of uitslag) expect(u.pixels, `${u.naam}: geen letters gevonden`).toBeGreaterThan(50)
      const gezakt = uitslag.filter((u) => u.p01 < (u.naam === "kop" ? DREMPEL_KOP : DREMPEL_TEKST))
      expect(
        gezakt.map((u) => u.naam),
        `${scherm.naam}, onder de drempel.\n${regels}\n\nDe scrim (.opening-scrim) gaat omhoog, niet de drempel omlaag.`
      ).toEqual([])
    })
  }
})

// ── DE MENUPIL OP DE FOTO ──────────────────────────────────────────
//
// Op home zweeft het desktopmenu als glazen pil over de foto. Zelfde
// methode als de dock: de ondergrond is de meest voorkomende kleur in een
// ring om elk woord, de letter is de pixel die daar het verst van ligt.

async function meetPil(page: Page) {
  const vakken = await page.evaluate(() => {
    const pil = document.querySelector("header [data-pil]")!
    const woorden = [
      ...pil.querySelectorAll<HTMLElement>("button[aria-controls^='bar-panel-'] .letter-flip"),
    ]
    // De zoekknop draagt het woord "Zoeken" (vanaf xl).
    const zoek = [...pil.querySelectorAll<HTMLElement>("button span")].find((s) => /^(Zoeken|Search)$/.test(s.textContent ?? ""))
    const alle = [...woorden, ...(zoek ? [zoek] : [])].filter((e) => e.getBoundingClientRect().width > 0)
    const gezien = new Set<string>()
    return alle
      .map((e) => {
        const r = e.getBoundingClientRect()
        return { naam: e.textContent?.trim() || "?", x: r.x, y: r.y, w: r.width, h: r.height }
      })
      .filter((v) => (gezien.has(v.naam) ? false : (gezien.add(v.naam), true)))
  })
  expect(vakken.length, "geen woorden in de pil").toBeGreaterThanOrEqual(4)
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  const shot = (await page.screenshot()).toString("base64")
  return page.evaluate(
    async ({ shot, vakken, dpr }) => {
      const img = new Image()
      img.src = "data:image/png;base64," + shot
      await img.decode()
      const c = document.createElement("canvas")
      c.width = img.width
      c.height = img.height
      const g = c.getContext("2d", { willReadFrequently: true })!
      g.drawImage(img, 0, 0)
      const f = (v: number) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      const lum = (p: number[]) => 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2])
      return vakken.map((v) => {
        const PAD = Math.round(3 * dpr)
        const X = Math.round(v.x * dpr)
        const Y = Math.round(v.y * dpr)
        const W = Math.round(v.w * dpr)
        const H = Math.round(v.h * dpr)
        const buiten = g.getImageData(X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2)
        const tel = new Map<string, number>()
        for (let yy = 0; yy < buiten.height; yy++) {
          for (let xx = 0; xx < buiten.width; xx++) {
            if (xx >= PAD && xx < PAD + W && yy >= PAD && yy < PAD + H) continue
            const i = (yy * buiten.width + xx) * 4
            const k = `${buiten.data[i]},${buiten.data[i + 1]},${buiten.data[i + 2]}`
            tel.set(k, (tel.get(k) ?? 0) + 1)
          }
        }
        const grond = [...tel.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number)
        const lg = lum(grond)
        const binnen = g.getImageData(X, Y, W, H).data
        let verst = 0
        let lijn = grond
        for (let i = 0; i < binnen.length; i += 4) {
          const px = [binnen[i], binnen[i + 1], binnen[i + 2]]
          const d = Math.abs(lum(px) - lg)
          if (d > verst) {
            verst = d
            lijn = px
          }
        }
        const [a, b] = [lum(lijn), lg]
        return {
          naam: v.naam,
          verhouding: Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)),
          lijn: `rgb(${lijn.join(",")})`,
          grond: `rgb(${grond.join(",")})`,
        }
      })
    },
    { shot, vakken, dpr }
  )
}

test.describe("de menupil op de foto", () => {
  test.skip(({ isMobile }) => !!isMobile, "de pil is desktopchroom")

  for (const [palet, naam] of [
    ["goldenhour", "Licht"],
    ["bluehour", "Donker"],
  ] as const) {
    for (const scherm of SCHERMEN.filter((s) => !s.telefoon)) {
      test(`${naam}, ${scherm.naam}: elk woord in de pil haalt 4,5:1`, async ({ page }) => {
        await page.setViewportSize({ width: scherm.width, height: scherm.height })
        await metPalet(page, palet)
        await page.goto("/nl", { waitUntil: "networkidle" })
        await klaar(page)
        // Weg met de muis: een aangewezen woord verandert van kleur.
        await page.mouse.move(scherm.width / 2, scherm.height - 10)
        await page.waitForTimeout(300)
        const metingen = await meetPil(page)
        const regels = metingen.map((m) => `${m.naam}: ${m.verhouding}:1 (${m.lijn} op ${m.grond})`).join("\n")
        console.log(`pil ${naam} ${scherm.naam}\n${regels}`)
        expect(
          metingen.filter((m) => m.verhouding < DREMPEL_TEKST).map((m) => m.naam),
          `${naam}, ${scherm.naam}: woorden in de pil onder ${DREMPEL_TEKST}:1.\n${regels}\n\nHet glas (nav-glass) gaat omhoog, niet de drempel omlaag.`
        ).toEqual([])
      })
    }
  }
})

// Geen logo op de opening (eigenaar, 29 sep 2026: "haal gronn primary
// logo van de hero af"). De kop blijft de eerste stem op de foto.
test("opening: geen logo op de foto", async ({ page }) => {
  await page.goto("/nl")
  await expect(page.locator("#opening-kop")).toBeVisible()
  await expect(page.locator("[data-opening-merk]")).toHaveCount(0)
  await expect(page.locator('main section img[src*="woordmerk"]')).toHaveCount(0)
})

// Het primaire logo in de menubalk bovenaan, ook op Licht (eigenaar, 29
// sep 2026: "use primary in the dock on top!"): antraciet letters met de
// oranje P, zonder de grijze verloopschaduw.
test("menubalk: het primaire logo op Licht", async ({ page, request }) => {
  await metPalet(page, "goldenhour")
  await page.goto("/nl")
  const logo = page.locator('[data-woordmerk] img[src*="woordmerk-primair-antraciet"]').filter({ visible: true })
  await expect(logo.first()).toBeVisible()
  const svg = await (await request.get("/brand/woordmerk-primair-antraciet.svg")).text()
  expect(svg).toContain("fill: rgb(255,91,4)")
  expect(svg).not.toContain("fill: rgb(255,255,255)")
  expect(svg).not.toContain("url(#")
  const origineel = await (await request.get("/brand/woordmerk-primair.svg")).text()
  const paden = (t: string) => (t.match(/<path\b/g) ?? []).length
  expect(paden(svg)).toBe(paden(origineel) - 1)
})
