import type { CSSProperties } from "react"
import type { Metadata } from "next"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { Alineas, Citaat, Fiche, Figuur, Kopregel, Lees, Paar, Slot, Volgende } from "@/components/werk/delen"
import { Verder } from "@/components/wereld/verder"
import "@/components/werk/werk.css"
import { TERRAS, TERRAS_CITAAT, TERRAS_FOTOS, TERRAS_SLOT, TERRAS_STAPPEN } from "@/lib/data/terras-geulle"

// WF-030: het terras in Geulle. Korter dan de vijver, zelfde systeem: opening
// met T01 die groeit, fiche, tekst, acht stappen, paar, citaat, slotbeeld,
// en het bosgroene Kennismaken-vlak zoals op de voorpagina.

const TITEL = TERRAS.seoTitel.replace(/ — GRØNN Studio$/, "")
const HELD = TERRAS_FOTOS.hoofd
// De titel uit de data, in regels voor de reuzenkop.
const REUSTITEL = {
  nl: "Een terras\nvan 24 m²,\ngelegd in\ntwee dagen.",
  en: "A patio\nof 24 m²,\nlaid in\ntwo days.",
}
const EN = TERRAS.en
const nlEn = (nl: string, en: string) => ({ nl, en })

export const metadata: Metadata = {
  title: TITEL,
  description: TERRAS.omschrijving,
  alternates: { canonical: "/werk/terras-geulle" },
  openGraph: {
    type: "article",
    title: TERRAS.seoTitel,
    description: TERRAS.omschrijving,
    url: "/werk/terras-geulle",
    images: [{ url: HELD.src, width: HELD.width, height: HELD.height, alt: HELD.alt }],
  },
}

export default function TerrasGeulle() {
  return (
    <article>
      <div className="wk-opening wk-opening-terras">
        <Opening
          label={nlEn("GR / 002 · Terras Geulle", "GR / 002 · Patio Geulle")}
          titel={REUSTITEL}
          zin={<T t={nlEn(TERRAS.ondertitel, EN.ondertitel)} />}
          foto={HELD}
          zij={[nlEn(TERRAS.categorie, EN.categorie), "Geulle"]}
        />
      </div>

      <div className="wrap">
        <Fiche
          kolommen="sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9"
          regels={[
            [nlEn("Code", "Code"), "GR / 002"],
            [nlEn("Type", "Type"), nlEn(TERRAS.categorie, EN.categorie)],
            [nlEn("Plaats", "Location"), "Geulle"],
            [nlEn("Wanneer", "When"), nlEn(TERRAS.wanneer, EN.wanneer)],
            [nlEn("Status", "Status"), nlEn(TERRAS.status, EN.status)],
            [nlEn("Oppervlak", "Area"), "24 m²"],
            [nlEn("Tegels", "Tiles"), "60 × 60 × 4 cm"],
            [nlEn("Leggen", "Laying"), nlEn("circa 8 uur", "about 8 hours")],
            [nlEn("Alles samen", "All in all"), nlEn("2 dagen", "2 days")],
          ]}
        />

        <section aria-labelledby="inleiding-kop" className="w-sectie">
          <span id="inleiding-kop" className="sr-only"><T t={nlEn("Inleiding", "Introduction")} /></span>
          {TERRAS.intro.map((t, i) => (
            <Oplichten key={t.slice(0, 40)} tekst={nlEn(t, EN.intro[i])} className="m-0 mb-[1em]" />
          ))}
          <Lees className="mt-[clamp(24px,3vw,40px)]">
            <p className="lbl m-0 mt-6 text-gedempt">{TERRAS.auteur}</p>
          </Lees>
        </section>

        <section aria-labelledby="werk-stappen" className="w-sectie">
          <Kopregel id="werk-stappen" links={<T t={nlEn("De werkzaamheden", "The work")} />}
            rechts={<T t={nlEn(`${TERRAS_STAPPEN.length} stappen`, `${TERRAS_STAPPEN.length} steps`)} />} />
          <ol className="m-0 list-none p-0">
            {TERRAS_STAPPEN.map((s, i) => (
              <li
                key={s.nl}
                data-zie
                style={{ "--i": i % 2 } as CSSProperties}
                className="grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-3 border-t border-lijn py-[18px] last:border-b md:grid-cols-[60px_minmax(0,1fr)] md:gap-x-8 md:py-[26px]"
              >
                <span className="lbl tabular-nums text-gedempt">{String(i + 1).padStart(2, "0")}</span>
                <span className="syne text-[clamp(20px,2.3vw,32px)] leading-[1.2] tracking-[-.02em]"><T t={s} /></span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pad-kop" className="w-sectie">
          <span id="pad-kop" className="sr-only"><T t={nlEn("Het pad", "The path")} /></span>
          <Paar fotos={TERRAS_FOTOS.reeks} />
        </section>

        <Citaat tekst={TERRAS_CITAAT.tekst} bron={TERRAS_CITAAT.bron} />

        <Lees className="w-sectie">
          <div data-zie>
            <Figuur foto={TERRAS_FOTOS.slot} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </Lees>

        <Slot kop={TERRAS_SLOT.kop} alineas={TERRAS_SLOT.alineas} knop={nlEn(TERRAS.contactknop, EN.contactknop)} />
        <Volgende hier="/werk/terras-geulle" />
      </div>
      <Verder
        voor={nlEn("Zoiets voor", "Something like this for")}
        nadruk={nlEn("jouw tuin", "your garden")}
        na="?"
        href="/kennismaken"
        label={nlEn("Naar Kennismaken", "To Get in touch")}
      />
    </article>
  )
}
