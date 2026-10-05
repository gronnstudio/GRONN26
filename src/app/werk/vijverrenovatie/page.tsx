import type { Metadata } from "next"
import { GeenFoto } from "@/components/foto"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { Alineas, Cijfer, Citaat, Clip, Doorkijk, Fiche, FotoReeks, Kopregel, Lees, Slot, Volgende } from "@/components/werk/delen"
import { Verder } from "@/components/wereld/verder"
import { Waterroute } from "@/components/werk/waterroute"
import "@/components/werk/werk.css"
import {
  CIJFERS,
  CIJFERS_NOOT,
  CITAAT,
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

// WF-021: de casestudy van de vijverrenovatie, met de volledige projecttekst
// uit de data. Alle twaalf hoofdstukken, met hun foto's, clips, de tekening
// van de waterroute en het beplantingsplan; twee cijfers als momenten.
// Opent met de gedeelde <Opening> (donker, reuzenkop, F10 die groeit) en
// eindigt met het bosgroene Kennismaken-vlak, zoals de voorpagina.

const TITEL = VIJVER.seoTitel.replace(/ — GRØNN Studio$/, "")
const HELD = FOTOS.F10 as FotoData
const SLOTBEELD = FOTOS.F01 as FotoData

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

const nr = (i: number) => String(i + 1).padStart(2, "0")

// De titel uit de data, in regels voor de reuzenkop; de zachte koppeltekens
// laten de twee lange woorden op de telefoon netjes afbreken.
const REUSTITEL = {
  nl: "Twee vijvers.\nEén samen\u00adhangend\nwater\u00adsysteem.",
  en: "Two ponds.\nOne connected\nwater system.",
}
const EN = VIJVER.en
const nlEn = (nl: string, en: string) => ({ nl, en })

export default function Vijverrenovatie() {
  return (
    <article>
      <div className="wk-opening wk-lang">
        <Opening
          label={{ nl: `GR / 001 · ${VIJVER.categorie}`, en: `GR / 001 · ${EN.categorie}` }}
          titel={REUSTITEL}
          zin={<T t={nlEn(VIJVER.ondertitel, EN.ondertitel)} />}
          foto={HELD}
          zij={[nlEn(VIJVER.categorie, EN.categorie), nlEn(VIJVER.status, EN.status)]}
        />
      </div>

      <div className="wrap">
        <Fiche
          kolommen="md:grid-cols-6"
          regels={[
            [nlEn("Code", "Code"), "GR / 001"],
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

        <nav aria-labelledby="inhoud-kop" className="w-sectie">
          <Kopregel id="inhoud-kop" links={<T t={nlEn("Het hele verhaal", "The whole story")} />}
            rechts={<T t={nlEn(`${HOOFDSTUKKEN.length} hoofdstukken`, `${HOOFDSTUKKEN.length} chapters`)} />} />
          <ol className="m-0 list-none columns-1 gap-x-8 p-0 md:columns-2">
            {HOOFDSTUKKEN.map((h, i) => (
              <li key={h.id} className="break-inside-avoid border-t border-lijn">
                <a href={`#${h.id}`} className="flex min-h-11 items-baseline gap-4 py-3 no-underline">
                  <span className="lbl tabular-nums text-gedempt">{nr(i)}</span>
                  <span className="w-lijnlink text-[17px] font-medium"><T t={h.kort} /></span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {HOOFDSTUKKEN.map((h, i) => {
          const fotos = h.foto ? fotosVoor(h.foto) : []
          return (
            <div key={h.id}>
              <section id={h.id} aria-labelledby={`${h.id}-kop`} className="w-sectie scroll-mt-6">
                <div className="w-kopregel">
                  <p className="lbl m-0">
                    {nr(i)} · <T t={h.kort} />
                  </p>
                  <span className="lbl tabular-nums text-gedempt">
                    {nr(i)} / {nr(HOOFDSTUKKEN.length - 1)}
                  </span>
                </div>
                <h2 id={`${h.id}-kop`} className="w-titel syne max-w-[22ch] [overflow-wrap:anywhere]" data-zie>
                  <T t={h.kop} />
                </h2>
                <Lees className="mt-[clamp(32px,4vw,56px)]">
                  <Alineas teksten={h.alineas} />
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
                ) : h.foto ? (
                  <GeenFoto wat={`foto ${h.foto} · ${h.kort.nl.toLowerCase()}`} className="mt-[clamp(48px,6vw,96px)] aspect-[4/3] w-full max-w-[560px]" />
                ) : null}

                {h.video ? <Clip video={VIDEOS[h.video]} className="mt-[clamp(32px,4vw,56px)]" /> : null}
              </section>

              {h.id === "denkwerk" ? (
                <Cijfer
                  getal="120"
                  wat={nlEn("uur, circa", "hours, approx.")}
                  uitleg={nlEn(
                    "inclusief voorbereiding en denkwerk; ongeveer vijftien werkdagen",
                    "including preparation and thinking time; about fifteen working days",
                  )}
                />
              ) : null}
              {h.id === "waterroute" ? (
                <Cijfer getal="2" wat={nlEn("vijvers", "ponds")} uitleg={nlEn("verbonden binnen één watersysteem", "connected within one water system")} />
              ) : null}
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
      </div>

      <div className="w-sectie">
        <Doorkijk foto={SLOTBEELD} sizes="100vw" className="h-[clamp(360px,70vh,820px)] w-full" eigen={false} v={1.5} />
      </div>

      <div className="wrap">
        <Slot kop={SLOT.kop} alineas={[...SLOT.alineas, SLOT.oproep]} knop={nlEn(VIJVER.contactknop, EN.contactknop)} />
        <Volgende hier="/werk/vijverrenovatie" />
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
