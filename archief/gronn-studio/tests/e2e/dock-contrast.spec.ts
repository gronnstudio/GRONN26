import { expect, test, type Page } from "@playwright/test"

// Het contrast van de dock boven een foto, gemeten in pixels.
//
// ── WAAROM DIT BESTAAT ─────────────────────────────────────────────
//
// De dock en de twee knoppen bovenin staan in glas: weinig verf, veel
// blur, zodat wat eronder schuift zichtbaar blijft als kleur en
// onleesbaar wordt als vorm. Dat is een uitdrukkelijke wens van de
// eigenaar ("een vervormingsblur zoals Instagram dat heeft").
//
// Er is een goed bezwaar tegen doorzichtig chroom, en het conceptproject
// maakt zijn knoppen er dekkend om: de ondergrond van een icoon is dan
// wat er toevallig onder ligt, en dat kun je niet garanderen. Daar
// gemeten op 4,42:1 boven één foto — en boven een andere weer iets
// anders.
//
// Dat bezwaar wordt hier niet vermeden maar GEMETEN. Deze test
// decodeert een schermafdruk van de balk boven het zwaarste beeld dat
// de site heeft en rekent de WCAG-verhouding uit voor elk icoon.
//
// Wat dit al gevangen heeft, vóór het op een telefoon kon komen:
//
//   · de emberpijl (toen nog een zesde vak in het menu) op
//     `ember-strong` haalde 1,90:1. Pure ember op
//     hetzelfde vlak haalt 3,32 — en dat is bovendien wat CLAUDE.md
//     regel 3 voorschrijft voor een LIJN. ember-strong is voor een
//     gevuld vlak onder witte tekst.
//   · bij een tint van 60 % zakte diezelfde pijl naar 2,96. De tint
//     staat nu op 72 %, gekozen op deze meting en niet op het oog.
//
// ── DE METHODE, EN WAAROM ZE ZO IS ─────────────────────────────────
//
// De ondergrond komt uit de RING om elk icoon heen, niet uit het
// gemiddelde van de balk: het glas is een veeg van de foto en is onder
// elk vak anders. De lijn is de pixel in het icoonvak die het verst van
// die ondergrond ligt — zo werkt het voor donker-op-licht én
// licht-op-donker, en dat is nodig, want het actieve icoon is wit op
// groen en de rest is inkt op glas.
//
// Een eerdere versie nam "de donkerste pixel" als de lijn. Die had het
// bij het actieve icoon precies verkeerd om en gaf 1,00:1 terug voor een
// vak dat in werkelijkheid op 4,87 zat.

const DREMPEL = 3
/** Kleine tekst (de labels, 8px): WCAG 1.4.3, 4,5:1. */
const DREMPEL_TEKST = 4.5

/** Naar de leesstand: de laatste beweging omlaag. */
async function naarLeesstand(page: Page) {
  await page.evaluate(() => window.scrollBy(0, -200))
  await page.waitForTimeout(200)
  await page.evaluate(() => window.scrollBy(0, 200))
  await page.waitForTimeout(700)
  await expect(
    page.locator("nav[data-nav='dock'] [data-dock-compact]")
  ).toHaveCSS("opacity", "1")
}

/**
 * Het thema vastzetten vóór de eerste verf.
 *
 * Zonder dit volgt de site de klok van de machine waarop de test draait,
 * en meet elke run een ander palet — 's ochtends Gouden Uur op lichte
 * grond, 's avonds Blauwe Uur op donkere. Beide worden hieronder
 * gemeten, maar dan wel elk apart en met opzet.
 */
async function metPalet(page: Page, thema: string) {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t)
      localStorage.setItem("gronn-theme-mode", "manual")
      // Het openingsgordijn overslaan. Het is `fixed inset-0 z-[90]` en
      // ligt dus OVER de dock; een schermafdruk die te vroeg valt meet
      // het gordijn en niet de balk. Dat gaf hier eerst 1,3:1 voor
      // iconen die in werkelijkheid ruim boven de norm zaten.
      sessionStorage.setItem("gronn-intro", "1")
    } catch {}
  }, thema)
}

/** Wachten tot er niets meer over de dock ligt. */
async function gordijnWeg(page: Page) {
  await page
    .locator(".openingsdoek")
    .waitFor({ state: "detached", timeout: 8000 })
    .catch(() => {})
  await page.waitForTimeout(500)
}

/** Naar het zwaarste beeld scrollen: de fotoband op de voorpagina. */
async function naarDeFoto(page: Page) {
  await page.evaluate(() => {
    const label = [...document.querySelectorAll("*")].find(
      (e) =>
        e.children.length === 0 &&
        /BEWEGING|MOVEMENT|LICHT|LIGHT/i.test(e.textContent || "")
    )
    if (!label) return
    const r = label.getBoundingClientRect()
    window.scrollBy(0, r.top - (window.innerHeight - 80))
  })
  await page.waitForTimeout(700)
}

type Meting = { naam: string; lijn: string; grond: string; verhouding: number }

async function meetDock(
  page: Page,
  laag: "[data-dock-row]" | "[data-dock-compact]" = "[data-dock-row]",
  // Wat er gemeten wordt: het icoon (de ring 7px eromheen), of het
  // label (3px: daarboven ligt op 2px het icoon al).
  doel: "svg" | "[data-dock-label]" = "svg"
): Promise<Meting[]> {
  const ringPx = doel === "svg" ? 7 : 3
  const vakken = await page.evaluate(({ laag, doel }) => {
    const nav = document.querySelector("nav[data-nav='dock']")
    if (!nav) return []
    return [
      ...nav.querySelectorAll(`${laag} a, ${laag} button`),
    ].map((e) => {
      const s = e.querySelector(doel)!.getBoundingClientRect()
      return {
        naam: e.textContent?.trim() || "?",
        x: s.x,
        y: s.y,
        w: s.width,
        h: s.height,
      }
    })
  }, { laag, doel })
  expect(vakken.length, "geen dock gevonden").toBe(5)

  // De ECHTE pixelverhouding uit de pagina, niet een aangenomen 2. Het
  // Pixel 7-profiel waarop dit draait staat op 2,625, en met een 2
  // erin bemonstert deze test coördinaten die 31 % naast het icoon
  // liggen — wat een balk meet die er niet is. Dat heeft hier één keer
  // een "1,02:1" opgeleverd voor een icoon dat in werkelijkheid prima
  // stond.
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  const shot = (await page.screenshot()).toString("base64")
  // De schermafdruk in de pagina zelf decoderen: een canvas is de enige
  // PNG-lezer die hier zonder extra afhankelijkheid beschikbaar is, en
  // AGENTS.md §1 verbiedt er een toe te voegen.
  return await page.evaluate(
    async ({
      shot,
      vakken,
      dpr,
      ringPx,
    }: {
      shot: string
      vakken: { naam: string; x: number; y: number; w: number; h: number }[]
      dpr: number
      ringPx: number
    }) => {
      const img = new Image()
      img.src = "data:image/png;base64," + shot
      await img.decode()
      const c = document.createElement("canvas")
      c.width = img.width
      c.height = img.height
      const g = c.getContext("2d")!
      g.drawImage(img, 0, 0)

      const lum = (px: number[]) => {
        const f = (v: number) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(px[0]) + 0.7152 * f(px[1]) + 0.0722 * f(px[2])
      }
      const ratio = (a: number[], b: number[]) => {
        const hi = Math.max(lum(a), lum(b))
        const lo = Math.min(lum(a), lum(b))
        return (hi + 0.05) / (lo + 0.05)
      }

      return vakken.map((v) => {
        const X = Math.round(v.x * dpr)
        const Y = Math.round(v.y * dpr)
        const W = Math.round(v.w * dpr)
        const H = Math.round(v.h * dpr)
        const PAD = Math.round(ringPx * dpr)

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
        let grond: number[] = [0, 0, 0]
        let max = 0
        for (const [k, n] of tel) {
          if (n > max) {
            max = n
            grond = k.split(",").map(Number)
          }
        }
        const grondL = lum(grond)

        const binnen = g.getImageData(X, Y, W, H).data
        let lijn = grond
        let verst = 0
        for (let i = 0; i < binnen.length; i += 4) {
          const px = [binnen[i], binnen[i + 1], binnen[i + 2]]
          const d = Math.abs(lum(px) - grondL)
          if (d > verst) {
            verst = d
            lijn = px
          }
        }

        return {
          naam: v.naam,
          lijn: `rgb(${lijn.join(",")})`,
          grond: `rgb(${grond.join(",")})`,
          verhouding: Number(ratio(lijn, grond).toFixed(2)),
        }
      })
    },
    { shot, vakken, dpr, ringPx }
  )
}

test.describe("de dock boven een foto", () => {
  test.skip(({ isMobile }) => !isMobile, "de dock is telefoonchroom")

  // Allebei de standaardpaletten. Gouden Uur staat op lichte grond en
  // Blauwe Uur op donkere, en het glas gedraagt zich op die twee
  // verschillend — een tint die op de ene klopt, hoeft dat op de andere
  // niet te doen.
  for (const [palet, naam] of [
    ["goldenhour", "Gouden Uur"],
    ["bluehour", "Blauwe Uur"],
  ] as const) {
    test(`${naam}: elk icoon haalt 3:1 boven het zwaarste beeld`, async ({
      page,
    }) => {
      await metPalet(page, palet)
      await page.goto("/nl", { waitUntil: "networkidle" })
      await gordijnWeg(page)
      await naarDeFoto(page)

      const metingen = await meetDock(page)
      const regels = metingen
        .map((m) => `${m.naam}: ${m.verhouding}:1 (${m.lijn} op ${m.grond})`)
        .join("\n")
      console.log(`${naam} volle balk\n${regels}`)

      const gezakt = metingen.filter((m) => m.verhouding < DREMPEL)
      expect(
        gezakt.map((m) => m.naam),
        `${naam}, onder ${DREMPEL}:1 boven de foto.\n${regels}\n\nDe tint in \`@utility nav-glass\` gaat omhoog, niet deze drempel omlaag.`
      ).toEqual([])
    })

    // De leesstand: sinds 25 sep 2026 één pil met dezelfde glaslaag en
    // vijf knoppen (eigenaar: "maak dat ook maar een dock met een
    // comet"). Zelfde foto, zelfde drempel. Minder beweging staat aan
    // zodat de emberhalo achter de pijl onzichtbaar is: die is decoratie
    // en mag de ring rond het icoon niet vervuilen.
    test(`${naam}: elk icoon van de leesstand haalt 3:1 boven het zwaarste beeld`, async ({
      page,
    }) => {
      await metPalet(page, palet)
      await page.addInitScript(() => {
        try {
          localStorage.setItem("gronn-a11y-motion", "reduced")
        } catch {}
      })
      await page.goto("/nl", { waitUntil: "networkidle" })
      await gordijnWeg(page)
      // Naar de foto, en dan de laatste beweging OMLAAG: de leesstand
      // hangt aan de richting (`scroll-rest.ts`), en de sprong naar de
      // foto kan omhoog zijn. Netto staat de foto op dezelfde plek.
      await naarDeFoto(page)
      await page.evaluate(() => window.scrollBy(0, -200))
      await page.waitForTimeout(200)
      await page.evaluate(() => window.scrollBy(0, 200))
      await page.waitForTimeout(700)
      await expect(
        page.locator("nav[data-nav='dock'] [data-dock-compact]")
      ).toHaveCSS("opacity", "1")

      const metingen = await meetDock(page, "[data-dock-compact]")
      const regels = metingen
        .map((m) => `${m.naam}: ${m.verhouding}:1 (${m.lijn} op ${m.grond})`)
        .join("\n")
      console.log(`${naam} leesstand\n${regels}`)
      const gezakt = metingen.filter((m) => m.verhouding < DREMPEL)
      expect(
        gezakt.map((m) => m.naam),
        `${naam}, leesstand onder ${DREMPEL}:1 boven de foto.\n${regels}\n\nDe tint in \`@utility nav-glass\` gaat omhoog, niet deze drempel omlaag.`
      ).toEqual([])
    })

    // Sinds de volle opening (29 sep 2026) ligt de dock bij het openen
    // van home al OP de foto: onderaan de scrim, boven het water. Iconen
    // 3:1, labels 4,5:1, zonder te scrollen.
    test(`${naam}: iconen en labels halen hun drempel boven de volle opening`, async ({
      page,
    }) => {
      await metPalet(page, palet)
      await page.addInitScript(() => {
        try {
          localStorage.setItem("gronn-a11y-motion", "reduced")
        } catch {}
      })
      await page.goto("/nl", { waitUntil: "networkidle" })
      await gordijnWeg(page)
      await expect(
        page.locator("nav[data-nav='dock'] [data-dock-row]")
      ).toHaveCSS("opacity", "1")
      const iconen = await meetDock(page)
      const labels = await meetDock(page, "[data-dock-row]", "[data-dock-label]")
      const regels = [
        ...iconen.map((m) => `icoon ${m.naam}: ${m.verhouding}:1 (${m.lijn} op ${m.grond})`),
        ...labels.map((m) => `label ${m.naam}: ${m.verhouding}:1 (${m.lijn} op ${m.grond})`),
      ].join("\n")
      console.log(`${naam} boven de opening\n${regels}`)
      expect(
        [
          ...iconen.filter((m) => m.verhouding < DREMPEL).map((m) => `icoon ${m.naam}`),
          ...labels.filter((m) => m.verhouding < DREMPEL_TEKST).map((m) => `label ${m.naam}`),
        ],
        `${naam}, boven de volle opening.\n${regels}\n\nDe tint in \`@utility nav-glass\` gaat omhoog, niet deze drempel omlaag.`
      ).toEqual([])
    })

    // Dezelfde meting op een rustige ondergrond. Zakt hij dáár, dan is
    // er iets mis met de kleuren zelf en niet met het glas.
    test(`${naam}: elk icoon haalt 3:1 op een gewone ondergrond`, async ({
      page,
    }) => {
      await metPalet(page, palet)
      await page.goto("/nl/privacy", { waitUntil: "networkidle" })
      await gordijnWeg(page)

      const metingen = await meetDock(page)
      const gezakt = metingen.filter((m) => m.verhouding < DREMPEL)
      expect(
        gezakt.map((m) => m.naam),
        `${naam}\n` + metingen.map((m) => `${m.naam}: ${m.verhouding}:1`).join("\n")
      ).toEqual([])
    })

    // De labels onder de iconen (eigenaar, 25 sep 2026). Kleine tekst,
    // dus 4,5:1 — boven de foto en op gewone grond, in beide standen.
    for (const [grond, route] of [
      ["het zwaarste beeld", "/nl"],
      ["een gewone ondergrond", "/nl/privacy"],
    ] as const) {
      test(`${naam}: elk label haalt 4,5:1 op ${grond}, in beide standen`, async ({
        page,
      }) => {
        await metPalet(page, palet)
        await page.addInitScript(() => {
          try {
            localStorage.setItem("gronn-a11y-motion", "reduced")
          } catch {}
        })
        await page.goto(route, { waitUntil: "networkidle" })
        await gordijnWeg(page)
        if (route === "/nl") await naarDeFoto(page)
        else await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(300)

        const alle: Meting[] = []
        // De volle balk: eerst terug naar boven brengen als de sprong
        // naar de foto de leesstand al liet zien.
        if (route === "/nl") {
          await page.evaluate(() => window.scrollBy(0, 200))
          await page.waitForTimeout(200)
          await page.evaluate(() => window.scrollBy(0, -200))
          await page.waitForTimeout(700)
        }
        await expect(
          page.locator("nav[data-nav='dock'] [data-dock-row]")
        ).toHaveCSS("opacity", "1")
        const vol = await meetDock(page, "[data-dock-row]", "[data-dock-label]")
        alle.push(...vol.map((m) => ({ ...m, naam: `vol ${m.naam}` })))

        if (route === "/nl/privacy") await page.evaluate(() => window.scrollTo(0, 600))
        await naarLeesstand(page)
        const rust = await meetDock(page, "[data-dock-compact]", "[data-dock-label]")
        alle.push(...rust.map((m) => ({ ...m, naam: `rust ${m.naam}` })))

        const regels = alle
          .map((m) => `${m.naam}: ${m.verhouding}:1 (${m.lijn} op ${m.grond})`)
          .join("\n")
        console.log(`${naam} labels op ${grond}\n${regels}`)
        expect(
          alle.filter((m) => m.verhouding < DREMPEL_TEKST).map((m) => m.naam),
          `${naam}, labels onder ${DREMPEL_TEKST}:1 op ${grond}.\n${regels}\n\nDe labelkleur of de tint in \`@utility nav-glass\` gaat omhoog, niet deze drempel omlaag.`
        ).toEqual([])
      })
    }
  }
})
