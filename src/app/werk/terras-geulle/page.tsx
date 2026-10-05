import type { CSSProperties } from "react"
import type { Metadata } from "next"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { Alineas, Citaat, Fiche, Figuur, Kopregel, Lees, Paar, Slot, Volgende } from "@/components/werk/delen"
import { Kennismaken } from "@/components/werk/kennismaken"
import "@/components/werk/werk.css"
import { TERRAS, TERRAS_CITAAT, TERRAS_FOTOS, TERRAS_SLOT, TERRAS_STAPPEN } from "@/lib/data/terras-geulle"

// WF-030: het terras in Geulle. Korter dan de vijver, zelfde systeem: opening
// met T01 die groeit, fiche, tekst, acht stappen, paar, citaat, slotbeeld,
// en het bosgroene Kennismaken-vlak zoals op de voorpagina.

const TITEL = TERRAS.seoTitel.replace(/ — GRØNN Studio$/, "")
const HELD = TERRAS_FOTOS.hoofd
// De titel uit de data, in regels voor de reuzenkop.
const REUSTITEL = "Een terras\nvan 24 m²,\ngelegd in\ntwee dagen."

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
        <Opening label="GR / 002 · Terras Geulle" titel={REUSTITEL} zin={TERRAS.ondertitel} foto={HELD} zij={[TERRAS.categorie, "Geulle"]} />
      </div>

      <div className="wrap">
        <Fiche
          kolommen="sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9"
          regels={[
            ["Code", "GR / 002"],
            ["Type", TERRAS.categorie],
            ["Plaats", "Geulle"],
            ["Wanneer", TERRAS.wanneer],
            ["Status", TERRAS.status],
            ["Oppervlak", "24 m²"],
            ["Tegels", "60 × 60 × 4 cm"],
            ["Leggen", "circa 8 uur"],
            ["Alles samen", "2 dagen"],
          ]}
        />

        <section aria-label="Inleiding" className="w-sectie">
          <Oplichten tekst={TERRAS.intro[0]} />
          <Lees className="mt-[clamp(40px,5vw,72px)]">
            <Alineas teksten={TERRAS.intro.slice(1)} />
            <p className="lbl m-0 mt-6 text-gedempt">{TERRAS.auteur}</p>
          </Lees>
        </section>

        <section aria-labelledby="werk-stappen" className="w-sectie">
          <Kopregel id="werk-stappen" links="De werkzaamheden" rechts={`${TERRAS_STAPPEN.length} stappen`} />
          <ol className="m-0 list-none p-0">
            {TERRAS_STAPPEN.map((s, i) => (
              <li
                key={s}
                data-zie
                style={{ "--i": i % 2 } as CSSProperties}
                className="grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-3 border-t border-lijn py-[18px] last:border-b md:grid-cols-[60px_minmax(0,1fr)] md:gap-x-8 md:py-[26px]"
              >
                <span className="lbl tabular-nums text-gedempt">{String(i + 1).padStart(2, "0")}</span>
                <span className="syne text-[clamp(20px,2.3vw,32px)] leading-[1.2] tracking-[-.02em]">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Het pad" className="w-sectie">
          <Paar fotos={TERRAS_FOTOS.reeks} />
        </section>

        <Citaat tekst={TERRAS_CITAAT.tekst} bron={TERRAS_CITAAT.bron} />

        <Lees className="w-sectie">
          <div data-zie>
            <Figuur foto={TERRAS_FOTOS.slot} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </Lees>

        <Slot kop={TERRAS_SLOT.kop} alineas={TERRAS_SLOT.alineas} knop={TERRAS.contactknop} />
        <Volgende hier="/werk/terras-geulle" />
      </div>
      <Kennismaken />
    </article>
  )
}
