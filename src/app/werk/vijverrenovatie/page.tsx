import type { Metadata } from "next"
import { Foto, GeenFoto } from "@/components/foto"
import { Alineas, Cijfer, Citaat, Clip, Fiche, FotoReeks, Held, Lees, Slot, Titel, Volgende } from "@/components/werk/delen"
import { Waterroute } from "@/components/werk/waterroute"
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

export default function Vijverrenovatie() {
  return (
    <article>
      <Held foto={HELD} />

      <div className="wrap">
        <Titel label={`GR / 001 · ${VIJVER.categorie}`} titel={VIJVER.titel} ondertitel={VIJVER.ondertitel} />

        <Fiche
          kolommen="md:grid-cols-6"
          regels={[
            ["Code", "GR / 001"],
            ["Type", VIJVER.categorie],
            ["Jaar", "2026"],
            ["Status", VIJVER.status],
            ["Tijd", "circa 120 uur"],
            ["Water", "circa 5.000 l"],
          ]}
        />

        <section aria-label="Inleiding" className="sectie">
          <Lees>
            <Alineas teksten={VIJVER.intro} />
            <p className="lbl m-0 mt-6 text-gedempt">{VIJVER.auteur}</p>
          </Lees>
        </section>

        <nav aria-labelledby="inhoud-kop" className="sectie">
          <h2 id="inhoud-kop" className="lbl m-0 font-normal text-gedempt">
            Het hele verhaal · {HOOFDSTUKKEN.length} hoofdstukken
          </h2>
          <ol className="lbl m-0 mt-6 list-none columns-1 gap-x-8 p-0 md:columns-2">
            {HOOFDSTUKKEN.map((h, i) => (
              <li key={h.id} className="break-inside-avoid border-t border-lijn">
                <a href={`#${h.id}`} className="flex min-h-11 items-center gap-4 py-2.5 no-underline hover:underline">
                  <span className="text-gedempt">{nr(i)}</span>
                  <span>{h.kort}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {HOOFDSTUKKEN.map((h, i) => {
          const fotos = h.foto ? fotosVoor(h.foto) : []
          return (
            <div key={h.id}>
              <section id={h.id} aria-labelledby={`${h.id}-kop`} className="sectie scroll-mt-6">
                <p className="lbl m-0 mb-6 text-gedempt">
                  {nr(i)} · {h.kort}
                </p>
                <h2
                  id={`${h.id}-kop`}
                  className="syne m-0 max-w-[22ch] text-[clamp(30px,4vw,56px)] leading-[1.05] tracking-[-.03em] [overflow-wrap:anywhere]"
                >
                  {h.kop}
                </h2>
                <Lees className="mt-[clamp(32px,4vw,56px)]">
                  <Alineas teksten={h.alineas} />
                  {h.planttabel ? (
                    <>
                      <div className="my-8 overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <caption className="lbl pb-3 text-left text-gedempt">Oorspronkelijk beplantingsplan</caption>
                          <thead>
                            <tr className="lbl text-gedempt">
                              <th scope="col" className="border-t border-lijn py-3 pr-3 font-normal">Zone</th>
                              <th scope="col" className="border-t border-lijn py-3 pr-3 font-normal">Soorten</th>
                              <th scope="col" className="border-t border-lijn py-3 pr-3 text-right font-normal">Manden</th>
                              <th scope="col" className="border-t border-lijn py-3 text-right font-normal">Planten</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PLANTTABEL.rijen.map((r) => (
                              <tr key={r.zone}>
                                <th scope="row" className="border-t border-lijn py-3 pr-3 align-top font-normal">{r.zone}</th>
                                <td className="border-t border-lijn py-3 pr-3 align-top">{r.soorten.join(", ")}</td>
                                <td className="border-t border-lijn py-3 pr-3 text-right align-top">{r.manden}</td>
                                <td className="border-t border-lijn py-3 text-right align-top">{r.planten}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-semibold">
                              <th scope="row" className="border-y border-lijn py-3 pr-3 text-left">Totaal</th>
                              <td className="border-y border-lijn py-3 pr-3">{PLANTTABEL.totaal.soorten}</td>
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
                  <div className="mt-[clamp(48px,6vw,96px)]">
                    <Waterroute />
                  </div>
                ) : null}

                {fotos.length > 0 ? (
                  <div className="mt-[clamp(48px,6vw,96px)]">
                    <FotoReeks fotos={fotos} />
                  </div>
                ) : h.foto ? (
                  <GeenFoto wat={`foto ${h.foto} · ${h.kort.toLowerCase()}`} className="mt-[clamp(48px,6vw,96px)] aspect-[4/3] w-full max-w-[560px]" />
                ) : null}

                {h.video ? <Clip video={VIDEOS[h.video]} className="mt-[clamp(32px,4vw,56px)]" /> : null}
              </section>

              {h.id === "denkwerk" ? (
                <Cijfer getal="120" wat="uur, circa" uitleg="inclusief voorbereiding en denkwerk; ongeveer vijftien werkdagen" />
              ) : null}
              {h.id === "waterroute" ? <Cijfer getal="2" wat="vijvers" uitleg="verbonden binnen één watersysteem" /> : null}
            </div>
          )
        })}

        <Citaat tekst={CITAAT.tekst} bron={CITAAT.bron} />
        <Lees className="mt-8">
          <Alineas teksten={[NA_CITAAT]} />
        </Lees>

        <section aria-labelledby="cijfers-kop" className="sectie">
          <h2 id="cijfers-kop" className="lbl m-0 font-normal text-gedempt">
            Het project in cijfers
          </h2>
          <dl className="m-0 mt-6">
            {CIJFERS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-lijn py-3 last:border-b md:grid-cols-[3fr_9fr]">
                <dt className="lbl text-gedempt">{k}</dt>
                <dd className="m-0">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 mb-0 text-sm text-gedempt">{CIJFERS_NOOT}</p>
        </section>
      </div>

      <div className="sectie">
        <Foto foto={SLOTBEELD} sizes="100vw" className="h-[clamp(360px,60vh,720px)] w-full" />
      </div>

      <div className="wrap">
        <Slot kop={SLOT.kop} alineas={[...SLOT.alineas, SLOT.oproep]} knop={VIJVER.contactknop} />
        <Volgende hier="/werk/vijverrenovatie" />
      </div>
    </article>
  )
}
