import type { CSSProperties } from "react"
import type { Metadata } from "next"
import { GeenFoto } from "@/components/foto"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { Alineas, Citaat, Clip, Fiche, Figuur, FotoReeks, Kopregel, Lees, Meer, Paar, Slot, Volgende } from "@/components/werk/delen"
import { Waterroute } from "@/components/werk/waterroute"
import "@/components/werk/werk.css"
import { Pijl } from "@/components/pijl"
import {
  CIJFERS,
  CIJFERS_NOOT,
  CITAAT,
  KLANT_CITAAT,
  FOTOS,
  HOOFDSTUKKEN,
  NA_CITAAT,
  NA_PLANTTABEL,
  PLANTTABEL,
  SLOT,
  VIDEOS,
  VIJVER,
  fotosVoor,
  type Foto as FotoData,
} from "@/lib/data/vijverrenovatie"

// Zelfde opbouw als het terras (eigenaar, 14 nov 2026: "terras is mooi, vijverrenovatie
// wijkt teveel af"): opening, fiche, tekst, stappen, paar, citaat, hoofdstukken, slotbeeld.
// WF-021: de casestudy van de vijverrenovatie, met de volledige projecttekst
// uit de data. Alle twaalf hoofdstukken, met hun foto's, clips, de tekening
// van de waterroute en het beplantingsplan; twee cijfers als momenten.
// Opent met de gedeelde <Opening> (donker, reuzenkop, F10 die groeit) en
// eindigt met het bosgroene Kennismaken-vlak, zoals de voorpagina.

const TITEL = VIJVER.seoTitel.replace(/ — GRØNN Studio$/, "")
const HELD = FOTOS.F10 as FotoData
const SLOTBEELD = FOTOS.F01 as FotoData
// twee beelden naast elkaar, zoals op de terraspagina
const PAAR = [...fotosVoor("F08"), ...fotosVoor("F09")].slice(0, 2)

export const metadata: Metadata = {
  title: TITEL,
  description: VIJVER.omschrijving,
  alternates: { canonical: "/werk/vijverrenovatie" },
  openGraph: {
    type: "article",
    title: VIJVER.seoTitel,
    description: VIJVER.omschrijving,
    url: "/werk/vijverrenovatie",
    images: [{ url: HELD.src, width: HELD.width, height: HELD.height, alt: HELD.alt }],
  },
}


// De titel uit de data, in regels voor de reuzenkop; de zachte koppeltekens
// laten de twee lange woorden op de telefoon netjes afbreken.
const REUSTITEL = {
  nl: "Twee vijvers.\nEén samen\u00adhangend\nwater\u00adsysteem",
  en: "Two ponds.\nOne connected\nwater system",
}
const EN = VIJVER.en
const nlEn = (nl: string, en: string) => ({ nl, en })

export default function Vijverrenovatie() {
  return (
    <article>
      <div className="wk-opening wk-lang">
        <Opening
          label={{ nl: VIJVER.categorie, en: EN.categorie }}
          titel={REUSTITEL}
          zin={<T t={nlEn(VIJVER.ondertitel, EN.ondertitel)} />}
          foto={HELD}
          morph="project-vijverrenovatie"
        />
      </div>

      <div className="wrap">
        <Fiche
          kolommen="sm:grid-cols-3 md:grid-cols-5"
          regels={[
            [nlEn("Type", "Type"), nlEn(VIJVER.categorie, EN.categorie)],
            [nlEn("Jaar", "Year"), "2026"],
            [nlEn("Status", "Status"), nlEn(VIJVER.status, EN.status)],
            [nlEn("Tijd", "Time"), nlEn("circa 120 uur", "about 120 hours")],
            [nlEn("Water", "Water"), nlEn("circa 5.000 l", "about 5,000 l")],
          ]}
        />

        <section aria-labelledby="inleiding-kop" className="w-sectie">
          <span id="inleiding-kop" className="sr-only"><T t={nlEn("Inleiding", "Introduction")} /></span>
          {VIJVER.intro.map((t, i) => (
            <Oplichten key={t.slice(0, 40)} tekst={nlEn(t, EN.intro[i])} className="m-0 mb-[1em]" />
          ))}
          <Lees className="mt-[clamp(24px,3vw,40px)]">
            <p className="lbl m-0 mt-6 text-gedempt">{VIJVER.auteur}</p>
          </Lees>
        </section>

        <nav aria-labelledby="inhoud-kop" className="w-sectie max-md:hidden">
          <Kopregel id="inhoud-kop" links={<T t={nlEn("De werkzaamheden", "The work")} />}
            rechts={<T t={nlEn(`${HOOFDSTUKKEN.length} stappen`, `${HOOFDSTUKKEN.length} steps`)} />} />
          <ol className="m-0 list-none p-0">
            {HOOFDSTUKKEN.map((h, i) => (
              <li key={h.id} data-zie style={{ "--i": i % 2 } as CSSProperties} className="block border-t border-lijn last:border-b">
                <a href={`#${h.id}`} className="block py-[18px] text-inherit no-underline md:py-[26px]">
                  <span className="syne text-[clamp(20px,2.3vw,32px)] leading-[1.2] tracking-[-.02em]"><T t={h.kort} /></span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {PAAR.length === 2 ? (
          <section aria-labelledby="paar-kop" className="w-sectie">
            <span id="paar-kop" className="sr-only"><T t={nlEn("Beelden", "Images")} /></span>
            <Paar fotos={PAAR} />
          </section>
        ) : null}

        <Citaat tekst={KLANT_CITAAT.tekst} bron={KLANT_CITAAT.bron} />

        {HOOFDSTUKKEN.map((h) => {
          // AI-visualisaties staan niet tussen het werk (eigenaar, 21 nov 2026: "ai visualisatie wil ik nergens zien!")
          const alle = h.foto ? fotosVoor(h.foto) : []
          const fotos = alle.filter((f) => !f.label)
          return (
            <div key={h.id}>
              <section id={h.id} aria-labelledby={`${h.id}-kop`} className="w-sectie scroll-mt-6">
                <div className="w-kopregel">
                  <p className="lbl m-0">
                    <T t={h.kort} />
                  </p>
                </div>
                <h2 id={`${h.id}-kop`} className="syne m-0 max-w-[26ch] text-[clamp(20px,2.3vw,32px)] leading-[1.2] tracking-[-.02em] [overflow-wrap:anywhere]" data-zie>
                  <T t={h.kop} />
                </h2>
                <Lees className="mt-[clamp(32px,4vw,56px)]">
                  <Alineas teksten={h.alineas.slice(0, 1)} />
                  {h.alineas.length > 1 || h.planttabel ? (
                  <Meer>
                  <Alineas teksten={h.alineas.slice(1)} />
                  {h.planttabel ? (
                    <>
                      <div className="my-8 overflow-x-auto">
                        <table className="w-full border-collapse text-left tabular-nums">
                          <caption className="lbl pb-3 text-left text-gedempt"><T t={nlEn("Oorspronkelijk beplantingsplan", "Original planting plan")} /></caption>
                          <thead>
                            <tr className="lbl text-gedempt">
                              <th scope="col" className="border-t border-lijn py-3 pr-3 font-normal"><T t={nlEn("Zone", "Zone")} /></th>
                              <th scope="col" className="border-t border-lijn py-3 pr-3 font-normal"><T t={nlEn("Soorten", "Species")} /></th>
                              <th scope="col" className="border-t border-lijn py-3 pr-3 text-right font-normal"><T t={nlEn("Manden", "Baskets")} /></th>
                              <th scope="col" className="border-t border-lijn py-3 text-right font-normal"><T t={nlEn("Planten", "Plants")} /></th>
                            </tr>
                          </thead>
                          <tbody>
                            {PLANTTABEL.rijen.map((r) => (
                              <tr key={r.zone.nl}>
                                <th scope="row" className="border-t border-lijn py-3 pr-3 align-top font-normal"><T t={r.zone} /></th>
                                <td className="border-t border-lijn py-3 pr-3 align-top"><T t={nlEn(r.soorten.map((x) => x.nl).join(", "), r.soorten.map((x) => x.en).join(", "))} /></td>
                                <td className="border-t border-lijn py-3 pr-3 text-right align-top">{r.manden}</td>
                                <td className="border-t border-lijn py-3 text-right align-top">{r.planten}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-semibold">
                              <th scope="row" className="border-y border-lijn py-3 pr-3 text-left"><T t={nlEn("Totaal", "Total")} /></th>
                              <td className="border-y border-lijn py-3 pr-3"><T t={PLANTTABEL.totaal.soorten} /></td>
                              <td className="border-y border-lijn py-3 pr-3 text-right">{PLANTTABEL.totaal.manden}</td>
                              <td className="border-y border-lijn py-3 text-right">{PLANTTABEL.totaal.planten}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <Alineas teksten={NA_PLANTTABEL} />
                    </>
                  ) : null}
                  </Meer>
                  ) : null}
                </Lees>

                {h.schema ? (
                  <div className="mt-[clamp(48px,6vw,96px)]" data-zie>
                    <Waterroute />
                  </div>
                ) : null}

                {fotos.length > 0 ? (
                  <div className="mt-[clamp(48px,6vw,96px)]">
                    <FotoReeks fotos={fotos} />
                  </div>
                ) : h.foto && alle.length === 0 ? (
                  <GeenFoto wat={`foto ${h.foto} · ${h.kort.nl.toLowerCase()}`} className="mt-[clamp(48px,6vw,96px)] aspect-[4/3] w-full max-w-[560px]" />
                ) : null}

                {h.video ? <Clip video={VIDEOS[h.video]} className="mt-[clamp(32px,4vw,56px)]" /> : null}
              </section>

            </div>
          )
        })}

        <Citaat tekst={CITAAT.tekst} bron={CITAAT.bron} />
        <Lees className="mt-8">
          <Alineas teksten={[NA_CITAAT]} />
        </Lees>

        <section aria-labelledby="cijfers-kop" className="w-sectie">
          <Kopregel id="cijfers-kop" links={<T t={nlEn("Het project in cijfers", "The project in numbers")} />}
            rechts={<T t={nlEn(`${CIJFERS.length} feiten`, `${CIJFERS.length} facts`)} />} />
          <dl className="m-0">
            {CIJFERS.map(([k, v]) => (
              <div key={k.nl} className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-lijn py-3 last:border-b md:grid-cols-[3fr_9fr]">
                <dt className="lbl text-gedempt"><T t={k} /></dt>
                <dd className="m-0 tabular-nums"><T t={v} /></dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 mb-0 text-sm text-gedempt"><T t={CIJFERS_NOOT} /></p>
        </section>

        <Lees className="w-sectie">
          <div data-zie>
            <Figuur foto={SLOTBEELD} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </Lees>

        <Slot kop={SLOT.kop} alineas={[...SLOT.alineas, SLOT.oproep]} knop={nlEn(VIJVER.contactknop, EN.contactknop)} />
        <Volgende hier="/werk/vijverrenovatie" />
      </div>
    </article>
  )
}
