import type { CSSProperties } from "react"
import { T } from "@/components/taal"
import type { L } from "@/lib/i18n"
import {
  DIENST_ICONEN,
  DIENST_VOLGORDE,
  PLANTGROEP_ICONEN,
  PLANTGROEP_VOLGORDE,
  contrast,
  vlakken,
  type Vorm,
} from "@/lib/iconen"

// De rest van de Brand Guide (Editie 01 en de aanvulling Editie 02 van 28 sep
// 2026), uitgeschreven voor /merk. Bron: wat de gids in de vorige site vastlegde
// (kleurschaal, iconen, letterschaal, raster, contrastparen); niets verzonnen.

function Kop({ id, label, aantal }: { id: string; label: L; aantal?: L }) {
  return (
    <div className="w-kopregel">
      <h2 id={id} className="lbl m-0 font-normal">
        <T t={label} />
      </h2>
      {aantal ? (
        <span className="lbl text-gedempt">
          <T t={aantal} />
        </span>
      ) : null}
    </div>
  )
}

const SCHAAL: { naam: L; vol: string; midden?: string; licht: string }[] = [
  { naam: { nl: "Oranje", en: "Orange" }, vol: "#A14312", midden: "#C49073", licht: "#E6D9D0" },
  { naam: { nl: "Bosgroen", en: "Forest green" }, vol: "#23483A", midden: "#7F9389", licht: "#D7DAD5" },
  { naam: { nl: "Mosgroen", en: "Moss green" }, vol: "#607A59", midden: "#A0AE9A", licht: "#DEE0D9" },
  { naam: { nl: "Antraciet", en: "Anthracite" }, vol: "#202020", midden: "#7D7D7B", licht: "#D6D5D2" },
  { naam: { nl: "Salie", en: "Sage" }, vol: "#B8C5A8", licht: "#E8E9E2" },
]

const LETTERS: { naam: string | L; maat: string; regel: string; voorbeeld: L; syne: boolean; px: number }[] = [
  { naam: "Display", maat: "44 → 88 px", regel: "46 → 92", voorbeeld: { nl: "Een tuin", en: "A garden" }, syne: true, px: 64 },
  { naam: "H1", maat: "40 → 64 px", regel: "44 → 68", voorbeeld: { nl: "Vijvers", en: "Ponds" }, syne: true, px: 48 },
  { naam: "H2", maat: "30 → 44 px", regel: "34 → 48", voorbeeld: { nl: "Zo werk ik", en: "How I work" }, syne: true, px: 36 },
  { naam: "H3", maat: "24 → 28 px", regel: "30 → 34", voorbeeld: { nl: "Advies op locatie", en: "Advice on site" }, syne: true, px: 26 },
  { naam: "Body", maat: "16 → 18 px", regel: "26 → 29", voorbeeld: { nl: "Ik kijk naar de bodem, het water en het licht.", en: "I look at the soil, the water and the light." }, syne: false, px: 17 },
  { naam: { nl: "Knop", en: "Button" }, maat: "15 px", regel: "20", voorbeeld: { nl: "KENNISMAKEN", en: "GET IN TOUCH" }, syne: false, px: 15 },
  { naam: { nl: "Annotatie", en: "Annotation" }, maat: "12 px", regel: "18", voorbeeld: { nl: "VIJVERS EN TUINEN · STEIN", en: "PONDS AND GARDENS · STEIN" }, syne: false, px: 12 },
]

const PAREN: { voor: string; achter: string; wat: L }[] = [
  { voor: "#202020", achter: "#DB6923", wat: { nl: "Antraciet op aarde-oranje (knop)", en: "Anthracite on earth orange (button)" } },
  { voor: "#A14312", achter: "#EFEEEA", wat: { nl: "Donker oranje op gebroken wit (link)", en: "Dark orange on off-white (link)" } },
  { voor: "#EFEEEA", achter: "#23483A", wat: { nl: "Gebroken wit op bosgroen", en: "Off-white on forest green" } },
  { voor: "#EFEEEA", achter: "#202020", wat: { nl: "Gebroken wit op antraciet", en: "Off-white on anthracite" } },
  { voor: "#DB6923", achter: "#202020", wat: { nl: "Aarde-oranje op antraciet", en: "Earth orange on anthracite" } },
]

function Icoon({ vormen, inkt, tint, grond, naam, i }: { vormen: readonly Vorm[]; inkt: string; tint: string; grond: string; naam: L; i: number }) {
  return (
    <li className="flex flex-col gap-2" data-zie style={{ "--i": i % 4 } as CSSProperties}>
      <svg viewBox="-0.75 -0.75 5.5 5.5" className="block aspect-square w-full ring-1 ring-lijn" aria-hidden="true">
        <rect x="-0.75" y="-0.75" width="5.5" height="5.5" fill={grond} />
        {vlakken(vormen, inkt, tint).map((v, n) => (
          <path key={n} d={v.d} fill={v.kleur} />
        ))}
      </svg>
      <span className="lbl">
        <T t={naam} />
      </span>
    </li>
  )
}

export function MerkGids() {
  return (
    <>
      <section aria-labelledby="h-schaal" className="w-sectie">
        <Kop id="h-schaal" label={{ nl: "Kleurschaal · Editie 02", en: "Colour scale · Edition 02" }} aantal={{ nl: "vol · midden · licht", en: "full · mid · light" }} />
        <div className="grid gap-3 md:grid-cols-5">
          {SCHAAL.map((k, i) => (
            <div key={k.vol} className="overflow-hidden rounded-2xl ring-1 ring-lijn" data-zie style={{ "--i": i } as CSSProperties}>
              {[k.vol, k.midden, k.licht].filter(Boolean).map((c) => (
                <div key={c} className="flex h-16 items-end p-2 text-[11px] font-semibold tabular-nums" style={{ background: c, color: contrast(c!, "#202020") >= 4.5 ? "#202020" : "#EFEEEA" }}>
                  {c}
                </div>
              ))}
              <p className="m-0 p-3 font-semibold">
                <T t={k.naam} />
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
          <T
            t={{
              nl: "Vol, midden en licht, en geen andere mengsels. Midden is 55 % en licht 12 % van de kleur in gebroken wit, zodat tinten van verschillende tegels altijd bij elkaar horen. In de schaal is oranje vol het donkere oranje #A14312; het felle aarde-oranje blijft voor knoppen en acties. Eén schaduw: mosgroen met 15 % antraciet (#566C50), alleen waar gebroken wit erop moet staan.",
              en: "Full, mid and light, and no other mixes. Mid is 55 % and light 12 % of the colour in off-white, so tints on different tiles always belong together. In the scale, full orange is the dark orange #A14312; the bright earth orange stays for buttons and actions. One shade: moss green with 15 % anthracite (#566C50), only where off-white has to sit on it.",
            }}
          />
        </p>
      </section>

      <section aria-labelledby="h-iconen" className="w-sectie">
        <Kop id="h-iconen" label={{ nl: "Iconen", en: "Icons" }} aantal={{ nl: "3 diensten · 8 plantgroepen", en: "3 services · 8 plant groups" }} />
        <p className="mt-0 mb-8 max-w-[66ch] text-[17px] leading-[1.6]">
          <T
            t={{
              nl: "Alle iconen komen uit één bouwsteen: de kwartcirkel uit de Ø van het woordmerk. Een raster van 4 × 4, elk vak een kwartcirkel in een van vier standen, het hele vlak of een blad. Twee tonen per tegel, de tegel zelf is de grond. Altijd vierkant, nooit afgerond, en zonder beweging.",
              en: "Every icon comes from one building block: the quarter circle from the Ø in the wordmark. A 4 × 4 grid, each cell a quarter circle in one of four positions, the whole cell or a leaf. Two tones per tile, the tile itself is the ground. Always square, never rounded, and without motion.",
            }}
          />
        </p>
        <p className="lbl mb-3 text-gedempt">
          <T t={{ nl: "Diensten", en: "Services" }} />
        </p>
        <ul className="m-0 grid max-w-[480px] list-none grid-cols-3 gap-3 p-0">
          {DIENST_VOLGORDE.map((id, i) => {
            const d = DIENST_ICONEN[id]
            return <Icoon key={id} vormen={d.vormen} inkt={d.inkt} tint={d.tint} grond={d.grond} naam={d.naam} i={i} />
          })}
        </ul>
        <p className="lbl mt-8 mb-3 text-gedempt">
          <T t={{ nl: "Plantgroepen", en: "Plant groups" }} />
        </p>
        <ul className="m-0 grid list-none grid-cols-4 gap-3 p-0 md:grid-cols-8">
          {PLANTGROEP_VOLGORDE.map((s, i) => {
            const p = PLANTGROEP_ICONEN[s]
            return <Icoon key={s} vormen={p.vormen} inkt={p.inkt} tint={p.tint} grond={p.grond} naam={p.naam} i={i} />
          })}
        </ul>
      </section>

      <section aria-labelledby="h-schaal-type" className="w-sectie">
        <Kop id="h-schaal-type" label={{ nl: "Letterschaal", en: "Type scale" }} aantal={{ nl: "telefoon → desktop", en: "phone → desktop" }} />
        <ul className="m-0 list-none border-t border-lijn p-0">
          {LETTERS.map((l, i) => (
            <li key={i} className="grid items-baseline gap-2 border-b border-lijn py-5 md:grid-cols-[160px_180px_1fr] md:gap-8">
              <span className="lbl"><T t={l.naam} /></span>
              <span className="text-[14px] text-gedempt tabular-nums">
                {l.maat} · <T t={{ nl: "regel", en: "line" }} /> {l.regel}
              </span>
              <span className={`${l.syne ? "syne tracking-[-.02em]" : l.px <= 15 ? "font-semibold tracking-[.06em]" : "font-light"} leading-[1.1] break-words`} style={{ fontSize: `${l.px}px` }}>
                <T t={l.voorbeeld} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
          <T
            t={{
              nl: "De maten lopen vloeiend mee met de schermbreedte, van de telefoonmaat bij 390 px tot de desktopmaat bij 1280 px. Koppen in Syne Bold met iets krappere letterafstand, annotaties in kleine hoofdletters met wat lucht.",
              en: "Sizes scale fluidly with the screen, from the phone size at 390 px to the desktop size at 1280 px. Headings in Syne Bold with slightly tighter spacing, annotations in small capitals with some air.",
            }}
          />
        </p>
      </section>

      <section aria-labelledby="h-raster" className="w-sectie">
        <Kop id="h-raster" label={{ nl: "Raster en vorm", en: "Grid and form" }} />
        <dl className="m-0 grid gap-x-8 border-t border-lijn md:grid-cols-2">
          {(
            [
              [{ nl: "Breedte", en: "Width" }, { nl: "Raster tot 1280 px breed", en: "Grid up to 1280 px wide" }],
              [{ nl: "Marge", en: "Margin" }, { nl: "24 px op de telefoon, 64 px op desktop", en: "24 px on phone, 64 px on desktop" }],
              [{ nl: "Knoppen", en: "Buttons" }, { nl: "Helemaal rond", en: "Fully round" }],
              [{ nl: "Kaarten", en: "Cards" }, { nl: "16 px hoeken", en: "16 px corners" }],
              [{ nl: "Foto's", en: "Photos" }, { nl: "6 px hoeken: zacht, niet rond", en: "6 px corners: soft, not round" }],
              [{ nl: "Iconen", en: "Icons" }, { nl: "Vierkant, nooit afgerond", en: "Square, never rounded" }],
            ] as [L, L][]
          ).map(([k, v], i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-4 border-b border-lijn py-4">
              <dt className="lbl text-gedempt">
                <T t={k} />
              </dt>
              <dd className="m-0">
                <T t={v} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="h-contrast" className="w-sectie">
        <Kop id="h-contrast" label={{ nl: "Contrast", en: "Contrast" }} aantal={{ nl: "minimaal 4,5 : 1", en: "at least 4.5 : 1" }} />
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-5">
          {PAREN.map((p, i) => (
            <li key={i} className="flex min-h-[150px] flex-col justify-between rounded-2xl p-4" style={{ background: p.achter, color: p.voor, boxShadow: "inset 0 0 0 1px rgba(32,32,32,.15)" }} data-zie>
              <span className="syne text-[32px] leading-none">Aa</span>
              <span className="text-[13px] leading-[1.4]">
                <span className="block font-semibold tabular-nums">{contrast(p.voor, p.achter).toFixed(2).replace(".", ",")} : 1</span>
                <T t={p.wat} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
          <T
            t={{
              nl: "Elke tekst haalt minstens 4,5 : 1. Aarde-oranje op gebroken wit haalt dat niet (2,99 : 1) en is daarom nooit een tekstpaar.",
              en: "All text reaches at least 4.5 : 1. Earth orange on off-white does not (2.99 : 1) and is therefore never a text pair.",
            }}
          />
        </p>
      </section>

      <section aria-labelledby="h-beeld" className="w-sectie">
        <Kop id="h-beeld" label={{ nl: "Beeld", en: "Imagery" }} />
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { src: "/sfeer/weide-tegenlicht.jpg", alt: { nl: "Sfeerbeeld: een weide in tegenlicht.", en: "Mood image: a meadow against the light." } },
            { src: "/sfeer/grashalm.jpg", alt: { nl: "Sfeerbeeld: een grashalm van dichtbij.", en: "Mood image: a blade of grass up close." } },
          ].map((b) => (
            <figure key={b.src} className="relative m-0" data-zie>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt={b.alt.nl} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <figcaption className="lbl absolute top-3 left-3 rounded-full bg-[#202020]/70 px-3 py-1 text-[#EFEEEA]">
                <T t={{ nl: "Sfeerbeeld", en: "Mood image" }} />
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
          <T
            t={{
              nl: "Sfeerbeelden uit de gids zijn geen bewijs van werk: ze dragen altijd het label Sfeerbeeld. Projecten tonen alleen foto's van dat project, met toestemming van de klant en zonder locatiegegevens. Nooit minderjarigen in beeld.",
              en: "Mood images from the guide are not proof of work: they always carry the label Mood image. Projects show only photos of that project, with the client's consent and without location data. Never minors in frame.",
            }}
          />
        </p>
      </section>
    </>
  )
}
