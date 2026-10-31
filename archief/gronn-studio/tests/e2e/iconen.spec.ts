import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { IcoonTegel, type IcoonTegelProps } from "@/components/gronn/elementen/icoon-tegel"
import { IcoonVlak, type IcoonVlakProps } from "@/components/gronn/elementen/icoon-vlak"
import {
  DIENST_ICONEN,
  DIENST_PANEEL,
  DIENST_VOLGORDE,
  DONKER_GRONDEN,
  LICHT_GRONDEN,
  PANEEL_ANTRACIET,
  PANEEL_MOS,
  PANEEL_ORANJE,
  PANEEL_SALIE,
  RAND_DREMPEL,
  randInDonker,
  randInLicht,
  PLANTGROEP_ICONEN,
  PLANTGROEP_VOLGORDE,
  vlakken,
  vorm,
} from "@/lib/iconen"

// De iconen van huisstijl Editie 02 en de borden waar ze vandaan komen.
//
// De vormen en kleuren in `src/lib/iconen.ts` zijn overgenomen van twee
// borden (Diensten: NIVEAUS; Plantgroepen: GROEPEN en VOLGORDE). Wat hier
// staat is wat de borden beloven: de aantallen, de dambordvolgorde, alleen
// kleuren uit de schaal, geen antraciet in de plantgroepen (eigenaar,
// 28 sep 2026) en een naam die ≥ 4,5:1 haalt op zijn tegel ("vormen in een
// icoon hoeven geen 4,5:1; hun naam wel"). Geen browser nodig: data en
// server-HTML.

test.skip(({ isMobile }) => isMobile, "geen browser nodig; één keer is genoeg")

/* ---------- WCAG 2.x, zoals scripts/check-contrast.mjs ---------- */

const kanalen = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const luminantie = (hex: string) => {
  const [r, g, b] = kanalen(hex).map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminantie(a), luminantie(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
/** sRGB-menging zoals de kleurschaal: `aandeel` van `kleur` in `grond`. */
const meng = (kleur: string, grond: string, aandeel: number) =>
  "#" +
  kanalen(kleur)
    .map((v, i) => Math.round(v * aandeel + kanalen(grond)[i] * (1 - aandeel)))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()

/* ---------- de kleurschaal van het bord ---------- */

const GEBROKEN_WIT = "#EFEEEA"
const SCHAAL = {
  oranje: ["#A14312", "#C49073", "#E6D9D0"],
  bos: ["#23483A", "#7F9389", "#D7DAD5"],
  mos: ["#607A59", "#A0AE9A", "#DEE0D9"],
  antraciet: ["#202020", "#7D7D7B", "#D6D5D2"],
} as const
const MOS_SCHADUW = "#566C50"
const SALIE = "#B8C5A8"
const SIERGRASSEN_PANEEL = "#E8E9E2"
const TOEGESTAAN = new Set<string>([
  ...Object.values(SCHAAL).flat(),
  MOS_SCHADUW,
  SALIE,
  GEBROKEN_WIT,
  SIERGRASSEN_PANEEL,
])
const ANTRACIET = new Set<string>(SCHAAL.antraciet)

const diensten = DIENST_VOLGORDE.map((id) => DIENST_ICONEN[id])
const plantgroepen = Object.values(PLANTGROEP_ICONEN)
const KLEURVELDEN = ["inkt", "tint", "grond", "tekst", "paneel", "rand"] as const
const kleurenVan = (icoon: object) =>
  KLEURVELDEN.flatMap((k) => {
    const v = (icoon as Record<string, unknown>)[k]
    return typeof v === "string" ? [[k, v] as const] : []
  })

test.describe("iconen: de data klopt met de borden", () => {
  test("drie diensten en acht plantgroepen", () => {
    expect(Object.keys(DIENST_ICONEN)).toEqual(["ontwerp", "aanleg", "onderhoud"])
    expect(DIENST_VOLGORDE).toEqual(["ontwerp", "aanleg", "onderhoud"])
    expect(diensten.map((d) => [d.naam.nl, d.naam.en])).toEqual([
      ["Ontwerp", "Design"],
      ["Aanleg", "Build"],
      ["Onderhoud", "Care"],
    ])
    // De nummering van tegel en fiche volgt GROEPEN.
    expect(plantgroepen.map((g) => [g.nummer, g.slug, g.naam.nl, g.naam.en])).toEqual([
      ["01", "bomen", "Bomen", "Trees"],
      ["02", "heesters", "Heesters", "Shrubs"],
      ["03", "vaste-planten", "Vaste planten", "Perennials"],
      ["04", "siergrassen", "Siergrassen", "Ornamental grasses"],
      ["05", "klimplanten", "Klimplanten", "Climbers"],
      ["06", "bodembedekkers", "Bodembedekkers", "Ground cover"],
      ["07", "bollen-en-knollen", "Bollen & knollen", "Bulbs & tubers"],
      ["08", "water-en-oeverplanten", "Water- en oeverplanten", "Water and marginal plants"],
    ])
    for (const [slug, g] of Object.entries(PLANTGROEP_ICONEN)) expect(g.slug).toBe(slug)
    for (const [id, d] of Object.entries(DIENST_ICONEN)) expect(d.id).toBe(id)
  })

  test("de volgorde van het overzicht is het dambord van het bord", () => {
    // Bord: ['Bomen', 'Siergrassen', 'Heesters', 'Vaste planten',
    // 'Bodembedekkers', 'Water- en oeverplanten', 'Bollen & knollen', 'Klimplanten']
    expect(PLANTGROEP_VOLGORDE.map((s) => PLANTGROEP_ICONEN[s].naam.nl)).toEqual([
      "Bomen",
      "Siergrassen",
      "Heesters",
      "Vaste planten",
      "Bodembedekkers",
      "Water- en oeverplanten",
      "Bollen & knollen",
      "Klimplanten",
    ])
    expect(new Set(PLANTGROEP_VOLGORDE).size).toBe(8)
  })

  test("elke vorm ligt op het raster van 4 × 4 en gebruikt beide tonen", () => {
    for (const icoon of [...diensten, ...plantgroepen]) {
      for (const [x, y, s] of icoon.vormen) {
        expect([x, y, s].every(Number.isInteger), `${icoon.naam.nl}: ${[x, y, s]}`).toBe(true)
        expect(x >= 0 && y >= 0 && x + s <= 4 && y + s <= 4, `${icoon.naam.nl}: ${[x, y, s]}`).toBe(true)
      }
      expect(new Set(icoon.vormen.map((v) => v[4])), icoon.naam.nl).toEqual(new Set(["a", "b"]))
    }
  })

  test("vorm en vlakken geven de paden van het bord", () => {
    expect(vorm("tl", 0, 0, 2)).toBe("M0,0 L2,0 A2,2 0 0 1 0,2 Z")
    expect(vorm("tr", 2, 0, 2)).toBe("M4,0 L4,2 A2,2 0 0 1 2,0 Z")
    expect(vorm("br", 2, 2, 2)).toBe("M4,4 L2,4 A2,2 0 0 1 4,2 Z")
    expect(vorm("bl", 0, 0, 4)).toBe("M0,4 L0,0 A4,4 0 0 1 4,4 Z")
    expect(vorm("vol", 1, 3, 1)).toBe("M1,3 H2 V4 H1 Z")

    const k = PLANTGROEP_ICONEN.klimplanten
    expect(vlakken(k.vormen, k.inkt, k.tint)).toEqual([
      { kleur: "#23483A", d: "M4,0 A4,4 0 0 1 0,4 A4,4 0 0 1 4,0 Z" },
      { kleur: "#7F9389", d: "M0,0 L2,0 A2,2 0 0 1 0,2 Z" },
      { kleur: "#7F9389", d: "M4,4 L2,4 A2,2 0 0 1 4,2 Z" },
    ])
    const o = DIENST_ICONEN.ontwerp
    expect(vlakken(o.vormen, o.inkt, o.tint)).toEqual([
      { kleur: "#EFEEEA", d: "M0,4 L0,0 A4,4 0 0 1 4,4 Z" },
      { kleur: "#A14312", d: "M0,4 L0,2 A2,2 0 0 1 2,4 Z" },
    ])
  })
})

test.describe("iconen: kleuren uit de schaal", () => {
  test("de schaal zelf: midden 55 % en licht 12 % in gebroken wit", () => {
    for (const [naam, [vol, midden, licht]] of Object.entries(SCHAAL)) {
      expect(meng(vol, GEBROKEN_WIT, 0.55), `${naam} midden`).toBe(midden)
      expect(meng(vol, GEBROKEN_WIT, 0.12), `${naam} licht`).toBe(licht)
    }
    expect(meng(SALIE, GEBROKEN_WIT, 0.12)).toBe(SIERGRASSEN_PANEEL)
  })

  test("elke kleur in iconen.ts komt uit de toegestane set", () => {
    const vreemd = [...diensten, ...plantgroepen].flatMap((icoon) =>
      kleurenVan(icoon)
        .filter(([, v]) => !TOEGESTAAN.has(v))
        .map(([k, v]) => `${icoon.naam.nl}.${k} = ${v}`),
    )
    expect(vreemd, vreemd.join(" · ")).toEqual([])
    // Fel aarde-oranje is voor knoppen en acties, niet voor het beeldsysteem.
    expect(JSON.stringify([DIENST_ICONEN, PLANTGROEP_ICONEN]).toUpperCase()).not.toContain("#DB6923")
  })

  test("geen antraciet in de plantgroepen (eigenaar, 28 sep 2026)", () => {
    const antraciet = plantgroepen.flatMap((g) =>
      kleurenVan(g)
        .filter(([, v]) => ANTRACIET.has(v))
        .map(([k, v]) => `${g.naam.nl}.${k} = ${v}`),
    )
    expect(antraciet, antraciet.join(" · ")).toEqual([])
  })

  test("elke kleur staat als merkconstante in globals.css", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")
    const merk = new Set([...css.matchAll(/--merk-[\w-]+:\s*(#[0-9a-f]{6});/gi)].map((m) => m[1].toUpperCase()))
    const ontbreekt = [...TOEGESTAAN].filter((k) => !merk.has(k))
    expect(ontbreekt, `niet in --merk-*: ${ontbreekt.join(", ")}`).toEqual([])
  })
})

test.describe("iconen: contrast dat het bord belooft", () => {
  test("gebroken wit op de Heesters-grond haalt 4,5:1 (bord: 4,95:1)", () => {
    const h = PLANTGROEP_ICONEN.heesters
    expect(h.grond).toBe(MOS_SCHADUW)
    expect(h.inkt).toBe(GEBROKEN_WIT)
    const c = contrast(GEBROKEN_WIT, MOS_SCHADUW)
    expect(c).toBeGreaterThanOrEqual(4.5)
    expect(c.toFixed(2)).toBe("4.95")
  })

  test("de naam van elke dienst haalt 4,5:1 op zijn tegel", () => {
    for (const d of diensten) {
      expect(contrast(d.tekst, d.grond), `${d.naam.nl}: ${d.tekst} op ${d.grond}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test("de naam van elke plantgroep (in de inkt) haalt 4,5:1 op zijn tegel", () => {
    for (const g of plantgroepen) {
      expect(contrast(g.inkt, g.grond), `${g.naam.nl}: ${g.inkt} op ${g.grond}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test("de paren van het bord Contrast", () => {
    expect(contrast("#A14312", "#E6D9D0").toFixed(2)).toBe("4.57") // donkeroranje op oranje-licht
    expect(contrast("#C49073", "#202020").toFixed(2)).toBe("5.88") // oranje-midden op antraciet
    expect(contrast(GEBROKEN_WIT, "#23483A").toFixed(2)).toBe("8.78") // wit op bosgroen
  })
})

test.describe("IcoonTegel: het element zelf", () => {
  const render = (props: IcoonTegelProps) => renderToStaticMarkup(createElement(IcoonTegel, props))

  test("zonder label: een benoemd beeld in de taal van de pagina", () => {
    const nl = render({ soort: "plantgroep", id: "bollen-en-knollen", locale: "nl" })
    expect(nl).toContain('role="img"')
    expect(nl).toContain('aria-label="Bollen &amp; knollen"')
    expect(nl).not.toContain("aria-hidden")
    const en = render({ soort: "dienst", id: "onderhoud", locale: "en" })
    expect(en).toContain('aria-label="Care"')
  })

  test("met label of decoratief: de tegel zwijgt, de naam staat er zichtbaar", () => {
    const metLabel = render({ soort: "dienst", id: "aanleg", locale: "nl", label: true })
    expect(metLabel).toContain('aria-hidden="true"')
    expect(metLabel).not.toContain('role="img"')
    expect(metLabel).toMatch(/>Aanleg<\/span>/)
    const decoratief = render({ soort: "dienst", id: "aanleg", locale: "nl", decoratief: true })
    expect(decoratief).toContain('aria-hidden="true"')
    expect(decoratief).not.toContain("aria-label")
  })

  test("viewBox met marge rondom het icoon, grond als vlak, kleuren als fill-attribuut en nooit in style", () => {
    const g = PLANTGROEP_ICONEN.bodembedekkers
    const html = render({ soort: "plantgroep", id: "bodembedekkers", locale: "nl" })
    // Ruimer gesneden (eigenaar, 29 sep 2026): 0,75 grond rondom het 4 × 4-icoon.
    expect(html).toContain('viewBox="-0.75 -0.75 5.5 5.5"')
    expect(html).toContain('width="64" height="64"')
    expect(html).toContain(`<rect x="-0.75" y="-0.75" width="5.5" height="5.5" fill="${g.grond}"></rect>`)
    for (const v of vlakken(g.vormen, g.inkt, g.tint)) expect(html).toContain(`<path d="${v.d}" fill="${v.kleur}"></path>`)
    expect(html.match(/<path /g)).toHaveLength(g.vormen.length)
    // Geen style-prop: geen kleur (framer-motion-gotcha) en geen afronding.
    expect(html).not.toContain("style=")
  })

  test("vierkant: geen clip-path en geen rx, ook niet op de randen (eigenaar, 29 sep 2026)", () => {
    for (const html of [
      render({ soort: "dienst", id: "ontwerp", locale: "nl" }),
      render({ soort: "dienst", id: "aanleg", locale: "nl", maat: 120 }),
      render({ soort: "plantgroep", id: "bollen-en-knollen", locale: "nl", maat: 40 }),
    ]) {
      expect(html).not.toContain("clip-path")
      expect(html).not.toMatch(/\brx=/)
    }
  })

  test("een lichte tegel op gebroken wit krijgt de rand van het bord, een donkere niet", () => {
    expect(render({ soort: "dienst", id: "aanleg", locale: "nl" })).toContain('stroke="#D6D5D2"')
    expect(render({ soort: "plantgroep", id: "bollen-en-knollen", locale: "nl" })).toContain('stroke="#E6D9D0"')
    expect(render({ soort: "plantgroep", id: "bomen", locale: "nl" })).not.toContain("stroke=")
  })
})

test.describe("Donker: een tegel die in de grond verdwijnt, krijgt een rand", () => {
  const render = (props: IcoonTegelProps) => renderToStaticMarkup(createElement(IcoonTegel, props))

  test("DONKER_GRONDEN zijn de grond, het vlak en de panelen van .bluehour", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")
    const blok = css.match(/\.bluehour\s*\{([^}]*)\}/)?.[1] ?? ""
    const waarde = (naam: string) => blok.match(new RegExp(`--${naam}:\\s*(#[0-9a-f]{6});`, "i"))?.[1].toUpperCase()
    const uitCss = ["background", "surface", "paneel-oranje", "paneel-bos", "paneel-mos", "paneel-salie", "paneel-antraciet"].map(waarde)
    expect(uitCss).toEqual([...DONKER_GRONDEN])
  })

  test("alleen Ontwerp zakt onder 1,3:1 op een donkere grond", () => {
    const alle = [...Object.values(DIENST_ICONEN), ...Object.values(PLANTGROEP_ICONEN)]
    const metRand = alle.filter((i) => randInDonker(i.grond)).map((i) => ("id" in i ? i.id : i.slug))
    expect(metRand).toEqual(["ontwerp"])
    // En wat geen rand krijgt, haalt de drempel zelf op elke donkere grond.
    for (const i of alle.filter((x) => !randInDonker(x.grond))) {
      for (const g of DONKER_GRONDEN) expect(contrast(i.grond, g)).toBeGreaterThanOrEqual(RAND_DREMPEL)
    }
  })

  test("de rand van 1px in --line 20 % haalt 1,3:1 op elke donkere grond", () => {
    // --line in Donker is gebroken wit; 20 % daarvan over de grond, zoals
    // de browser `stroke-line/20` mengt (in sRGB nagerekend; oklab geeft
    // een iets lichtere tint, dus dit is de ondergrens).
    for (const g of DONKER_GRONDEN) {
      const rand = meng(GEBROKEN_WIT, g, 0.2)
      expect(contrast(rand, g), g).toBeGreaterThanOrEqual(RAND_DREMPEL)
    }
  })

  test("de rand is een klasse (token), alleen in Donker, en `rand={false}` zet hem uit", () => {
    const html = render({ soort: "dienst", id: "ontwerp", locale: "nl" })
    expect(html).toMatch(/<rect data-donkerrand=""[^>]*class="hidden dark:inline stroke-line\/20"/)
    expect(html).not.toMatch(/data-donkerrand=""[^>]*stroke="/)
    expect(render({ soort: "dienst", id: "ontwerp", locale: "nl", rand: false })).not.toContain("data-donkerrand")
    expect(render({ soort: "dienst", id: "aanleg", locale: "nl", rand: false })).not.toContain("stroke=")
    expect(render({ soort: "plantgroep", id: "bomen", locale: "nl" })).not.toContain("data-donkerrand")
  })
})

// Eigenaar, 29 sep 2026 ("alle punten zijn prima!"): de Onderhoud-tegel
// kwam in Licht te weinig los van de lichte grond. Dezelfde regel als in
// Donker, gespiegeld: < 1,3:1 op een lichte ondergrond = een lijn van 1px.
test.describe("Licht: een tegel die in de lichte grond verdwijnt, krijgt een rand", () => {
  const render = (props: IcoonTegelProps) => renderToStaticMarkup(createElement(IcoonTegel, props))
  const alle = [...Object.values(DIENST_ICONEN), ...Object.values(PLANTGROEP_ICONEN)]
  const naam = (i: (typeof alle)[number]) => ("id" in i ? i.id : i.slug)
  /** Wat van de tegel aan de rand te zien is: de rand van het bord als die afwijkt, anders de grond. */
  const randVan = (i: (typeof alle)[number]) => (i.rand !== i.grond ? i.rand : i.grond)

  test("LICHT_GRONDEN zijn de grond, het vlak en de panelen van .goldenhour", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")
    const blok = css.match(/\.goldenhour\s*\{([^}]*)\}/)?.[1] ?? ""
    const waarde = (n: string) => blok.match(new RegExp(`--${n}:\\s*(#[0-9a-f]{6});`, "i"))?.[1].toUpperCase()
    const uitCss = ["background", "surface", "paneel-oranje", "paneel-bos", "paneel-mos", "paneel-salie", "paneel-antraciet"].map(waarde)
    expect(uitCss).toEqual([...LICHT_GRONDEN])
  })

  test("de lichte tegels zakken onder 1,3:1 op een lichte grond, de donkere niet", () => {
    const metRand = alle.filter((i) => randInLicht(i.grond, randVan(i))).map(naam)
    expect(metRand).toEqual([
      "aanleg",
      "onderhoud",
      "vaste-planten",
      "siergrassen",
      "klimplanten",
      "bodembedekkers",
      "bollen-en-knollen",
    ])
    // Onderhoud, de aanleiding: #E6D9D0 op gebroken wit is 1,19:1.
    expect(contrast(DIENST_ICONEN.onderhoud.grond, LICHT_GRONDEN[0]).toFixed(2)).toBe("1.19")
    // Wat geen rand krijgt, haalt de drempel zelf op elke lichte grond.
    for (const i of alle.filter((x) => !randInLicht(x.grond, randVan(x)))) {
      for (const g of LICHT_GRONDEN) expect(contrast(i.grond, g), `${naam(i)} op ${g}`).toBeGreaterThanOrEqual(RAND_DREMPEL)
    }
  })

  test("de rand van 1px in --line 20 % haalt 1,3:1 op elke lichte grond", () => {
    // --line in Licht is antraciet; 20 % daarvan over de buitenste pixel
    // van de tegel (de rand van het bord of de grond), zoals de browser
    // `stroke-line/20` mengt (in sRGB nagerekend).
    for (const i of alle.filter((x) => randInLicht(x.grond, randVan(x)))) {
      const lijn = meng("#202020", randVan(i), 0.2)
      for (const g of LICHT_GRONDEN) expect(contrast(lijn, g), `${naam(i)} op ${g}`).toBeGreaterThanOrEqual(RAND_DREMPEL)
    }
  })

  test("de rand is een klasse (token), alleen in Licht voor een lichte tegel, in beide voor geen enkele", () => {
    const klasse = (props: IcoonTegelProps) => render(props).match(/<rect data-donkerrand=""[^>]*class="([^"]*)"/)?.[1]
    expect(klasse({ soort: "dienst", id: "onderhoud", locale: "nl" })).toBe("dark:hidden stroke-line/20")
    expect(klasse({ soort: "dienst", id: "aanleg", locale: "nl" })).toBe("dark:hidden stroke-line/20")
    expect(klasse({ soort: "plantgroep", id: "bodembedekkers", locale: "nl", maat: 40 })).toBe("dark:hidden stroke-line/20")
    expect(klasse({ soort: "dienst", id: "ontwerp", locale: "nl" })).toBe("hidden dark:inline stroke-line/20")
    for (const id of ["bomen", "heesters", "water-en-oeverplanten"] as const) {
      expect(render({ soort: "plantgroep", id, locale: "nl" }), id).not.toContain("data-donkerrand")
    }
    expect(render({ soort: "dienst", id: "onderhoud", locale: "nl", rand: false })).not.toContain("data-donkerrand")
    // Nog steeds vierkant: de lijn heeft geen rx.
    expect(render({ soort: "dienst", id: "onderhoud", locale: "nl" })).not.toMatch(/\brx=/)
  })
})

test.describe("op een paneel: de lijn ook in Licht, waar de tegel wegvalt", () => {
  const render = (props: IcoonTegelProps) => renderToStaticMarkup(createElement(IcoonTegel, props))

  test("PANEEL_MOS, _ANTRACIET, _SALIE en _ORANJE zijn de --paneel-* in Licht en in Donker", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")
    const licht = css.match(/\.goldenhour\s*\{([^}]*)\}/)?.[1] ?? ""
    const donker = css.match(/\.bluehour\s*\{([^}]*)\}/)?.[1] ?? ""
    for (const [naam, waarde] of [
      ["mos", PANEEL_MOS],
      ["antraciet", PANEEL_ANTRACIET],
      ["salie", PANEEL_SALIE],
      ["oranje", PANEEL_ORANJE],
    ] as const) {
      const lees = (blok: string) => blok.match(new RegExp(`--paneel-${naam}:\\s*(#[0-9a-f]{6});`, "i"))?.[1].toUpperCase()
      expect({ licht: lees(licht), donker: lees(donker) }, naam).toEqual({ ...waarde })
    }
    // Elk niveau een eigen paneel.
    expect(new Set(DIENST_VOLGORDE.map((id) => DIENST_PANEEL[id].naam)).size).toBe(3)
  })

  test("elke plantgroep op het mospaneel haalt 1,3:1 met grond, bordrand of lijn, in beide thema's", () => {
    for (const slug of PLANTGROEP_VOLGORDE) {
      const i = PLANTGROEP_ICONEN[slug]
      const html = render({ soort: "plantgroep", id: slug, locale: "nl", ondergrond: PANEEL_MOS })
      const klasse = html.match(/data-donkerrand=""[^>]*class="([^"]*)"/)?.[1]
      const bord = i.rand !== i.grond
      for (const [thema, grond, lijnKleur] of [
        ["licht", PANEEL_MOS.licht, "#202020"],
        ["donker", PANEEL_MOS.donker, GEBROKEN_WIT],
      ] as const) {
        const lijnAan = klasse !== undefined && (thema === "licht" ? !klasse.includes("hidden dark:inline") : !klasse.includes("dark:hidden"))
        const beste = Math.max(
          contrast(i.grond, grond),
          bord ? contrast(i.rand, grond) : 0,
          lijnAan ? contrast(meng(lijnKleur, grond, 0.2), grond) : 0
        )
        expect(beste, `${slug} in ${thema}`).toBeGreaterThanOrEqual(RAND_DREMPEL)
      }
    }
    // Wie de lijn niet nodig heeft, krijgt hem niet: Bomen op het lichte paneel.
    expect(render({ soort: "plantgroep", id: "bomen", locale: "nl", ondergrond: PANEEL_MOS })).not.toContain("data-donkerrand")
  })
})

test.describe("IcoonVlak", () => {
  const render = (props: IcoonVlakProps) => renderToStaticMarkup(createElement(IcoonVlak, props))

  // Sinds 29 sep 2026 (coördinator namens de eigenaar: de lichte vlakken
  // waren in Donker "te zwaar") staat de tegel op het paneel van zijn
  // niveau, een thema-token, en niet meer op zijn eigen grond als vlak.
  test("dienst: op het paneel van het niveau (token), decoratief, geen conceptlabel, 88px op 44 %", () => {
    for (const id of DIENST_VOLGORDE) {
      const html = render({ soort: "dienst", id, locale: "nl" })
      const paneel = DIENST_PANEEL[id]
      expect(html).toContain('aria-hidden="true"')
      expect(html).toContain(`data-vlak="dienst:${id}"`)
      expect(html).toContain(`data-paneel="${paneel.naam}"`)
      const vlak = html.match(/<span[^>]*data-element="IcoonVlak"[^>]*>/)?.[0] ?? ""
      const klassen = vlak.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? []
      expect(klassen, id).toContain(`bg-paneel-${paneel.naam}`)
      // Geen vaste kleur meer als grond van het vlak.
      expect(vlak, id).not.toContain("background-color")
      expect(html).toContain("aspect-ratio:16/10")
      expect(html).toContain("top-[44%]")
      expect(html).toContain('width="88" height="88"')
      expect(html).not.toContain("data-concept-label")
      expect(html).not.toContain('role="img"')
      // Het paneel komt in geen van beide thema's los van de kaart: onderaan de lijn, in beide.
      expect(randInLicht(paneel.licht) && randInDonker(paneel.donker), id).toBe(true)
      expect(klassen).toEqual(expect.arrayContaining(["border-b", "border-line/20"]))
      expect(klassen.some((k) => k.startsWith("dark:")), id).toBe(false)
    }
  })

  test("dienst: de tegel haalt 1,3:1 op zijn paneel, in beide thema's (grond, bordrand of lijn)", () => {
    for (const id of DIENST_VOLGORDE) {
      const html = render({ soort: "dienst", id, locale: "nl" })
      const i = DIENST_ICONEN[id]
      const paneel = DIENST_PANEEL[id]
      const klasse = html.match(/data-donkerrand=""[^>]*class="([^"]*)"/)?.[1]
      const bord = i.rand.toLowerCase() !== i.grond.toLowerCase()
      const rand = bord ? i.rand : i.grond
      for (const [thema, grond, lijnKleur] of [
        ["licht", paneel.licht, "#202020"],
        ["donker", paneel.donker, GEBROKEN_WIT],
      ] as const) {
        const lijnAan = klasse !== undefined && (thema === "licht" ? !klasse.includes("hidden dark:inline") : !klasse.includes("dark:hidden"))
        const beste = Math.max(
          contrast(i.grond, grond),
          bord ? contrast(i.rand, grond) : 0,
          lijnAan ? contrast(meng(lijnKleur, rand, 0.2), grond) : 0,
        )
        expect(beste, `${id} in ${thema}`).toBeGreaterThanOrEqual(RAND_DREMPEL)
      }
    }
  })

  test("plantgroepen: vier tegels van 40px in 2 × 2", () => {
    const ids = ["bomen", "vaste-planten", "siergrassen", "water-en-oeverplanten"] as const
    const html = render({ soort: "plantgroepen", ids, locale: "en" })
    expect(html).toContain('data-vlak="plantgroepen"')
    expect(html).toContain("grid-cols-2")
    expect(html.match(/<svg /g)).toHaveLength(4)
    expect(html.match(/width="40" height="40"/g)).toHaveLength(4)
    for (const id of ids) expect(html).toContain(`data-icoon="plantgroep:${id}"`)
    expect(html).not.toContain("data-concept-label")
  })

  // Eigenaar, 29 sep 2026 ("alle punten zijn prima!"): het vaste lichte
  // vlak (#DEE0D9) was in Donker het felste blok op /services. Nu het
  // mospaneel, dat per thema meegaat: licht in Licht (ongewijzigd), de
  // donkere mostint in Donker.
  test("plantgroepen: op het mospaneel (token), niet op een vaste kleur", () => {
    const ids = ["bomen", "vaste-planten", "siergrassen", "water-en-oeverplanten"] as const
    const html = render({ soort: "plantgroepen", ids, locale: "nl" })
    const vlak = html.match(/<span[^>]*data-element="IcoonVlak"[^>]*>/)?.[0] ?? ""
    const klassen = vlak.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? []
    expect(klassen).toContain("bg-paneel-mos")
    expect(vlak).not.toContain("background-color")
    expect(html.toUpperCase()).not.toContain("#DEE0D9")
    // Het paneel komt in geen van beide thema's los van de kaart
    // (bg-background): onderaan de lijn, in beide.
    expect(randInLicht(PANEEL_MOS.licht) && randInDonker(PANEEL_MOS.donker)).toBe(true)
    expect(klassen).toEqual(expect.arrayContaining(["border-b", "border-line/20"]))
    expect(klassen.some((k) => k.startsWith("dark:"))).toBe(false)
  })

  test("plantgroepen: elke tegel haalt 1,3:1 op het mospaneel, in beide thema's", () => {
    const ids = ["bomen", "vaste-planten", "siergrassen", "water-en-oeverplanten"] as const
    const html = render({ soort: "plantgroepen", ids, locale: "nl" })
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/g) ?? []
    expect(svgs).toHaveLength(4)
    for (const svg of svgs) {
      const slug = svg.match(/data-icoon="plantgroep:([^"]+)"/)![1] as keyof typeof PLANTGROEP_ICONEN
      const i = PLANTGROEP_ICONEN[slug]
      const klasse = svg.match(/data-donkerrand=""[^>]*class="([^"]*)"/)?.[1]
      const bord = i.rand !== i.grond
      const rand = bord ? i.rand : i.grond
      for (const [thema, grond, lijnKleur] of [
        ["licht", PANEEL_MOS.licht, "#202020"],
        ["donker", PANEEL_MOS.donker, GEBROKEN_WIT],
      ] as const) {
        const lijnAan = klasse !== undefined && (thema === "licht" ? !klasse.includes("hidden dark:inline") : !klasse.includes("dark:hidden"))
        const beste = Math.max(
          contrast(i.grond, grond),
          bord ? contrast(i.rand, grond) : 0,
          lijnAan ? contrast(meng(lijnKleur, rand, 0.2), grond) : 0,
        )
        expect(beste, `${slug} in ${thema}`).toBeGreaterThanOrEqual(RAND_DREMPEL)
      }
    }
    // Bomen en Water- en oeverplanten halen op de donkere mostint zelf
    // 1,41:1: geen lijn in Donker. Vaste planten valt in Licht weg op
    // het lichte paneel: daar wel.
    const klasseVan = (slug: string) => html.match(new RegExp(`data-icoon="plantgroep:${slug}"[\\s\\S]*?(?:data-donkerrand=""[^>]*class="([^"]*)"|</svg>)`))?.[1]
    expect(klasseVan("bomen")).toBeUndefined()
    expect(klasseVan("water-en-oeverplanten")).toBeUndefined()
    expect(klasseVan("vaste-planten")).toBe("dark:hidden stroke-line/20")
  })
})
