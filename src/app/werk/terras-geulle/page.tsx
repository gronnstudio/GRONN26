import type { Metadata } from "next"
import { Alineas, Citaat, Fiche, Figuur, FotoReeks, Held, Lees, Slot, Titel, Volgende } from "@/components/werk/delen"
import { TERRAS, TERRAS_CITAAT, TERRAS_FOTOS, TERRAS_SLOT, TERRAS_STAPPEN } from "@/lib/data/terras-geulle"

// WF-030: het terras in Geulle. Korter dan de vijver, zelfde systeem: foto,
// fiche, tekst, acht stappen, paar, citaat, slotbeeld.

const TITEL = TERRAS.seoTitel.replace(/ — GRØNN Studio$/, "")
const HELD = TERRAS_FOTOS.hoofd

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
      <Held foto={HELD} />

      <div className="wrap">
        <Titel label="GR / 002 · Terras Geulle" titel={TERRAS.titel} ondertitel={TERRAS.ondertitel} />

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

        <section aria-label="Inleiding" className="sectie">
          <Lees>
            <Alineas teksten={TERRAS.intro} />
            <p className="lbl m-0 mt-6 text-gedempt">{TERRAS.auteur}</p>
          </Lees>
        </section>

        <section aria-labelledby="werk-stappen" className="sectie">
          <h2 id="werk-stappen" className="lbl m-0 font-normal text-gedempt">
            De werkzaamheden · {TERRAS_STAPPEN.length} stappen
          </h2>
          <ol className="lbl m-0 mt-6 list-none p-0">
            {TERRAS_STAPPEN.map((s, i) => (
              <li
                key={s}
                className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 border-t border-lijn py-3.5 last:border-b md:grid-cols-[60px_minmax(0,1fr)] md:gap-x-8"
              >
                <span className="text-gedempt">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Het pad" className="sectie">
          <FotoReeks fotos={TERRAS_FOTOS.reeks} />
        </section>

        <Citaat tekst={TERRAS_CITAAT.tekst} bron={TERRAS_CITAAT.bron} />

        <Lees className="sectie">
          <Figuur foto={TERRAS_FOTOS.slot} sizes="(min-width: 768px) 50vw, 100vw" />
        </Lees>

        <Slot kop={TERRAS_SLOT.kop} alineas={TERRAS_SLOT.alineas} knop={TERRAS.contactknop} />
        <Volgende hier="/werk/terras-geulle" />
      </div>
    </article>
  )
}
