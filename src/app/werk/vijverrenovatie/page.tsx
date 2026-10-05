import type { Metadata } from "next"
import { GeenFoto } from "@/components/foto"
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
const REUSTITEL = "Twee vijvers.\nEén samen\u00adhangend\nwater\u00adsysteem."

export default function Vijverrenovatie() {
  return (
    <article>
      <div className="wk-opening wk-lang">
        <Opening
          label={`GR / 001 · ${VIJVER.categorie}`}
          titel={REUSTITEL}
          zin={VIJVER.ondertitel}
          foto={HELD}
          zij={[VIJVER.categorie, VIJVER.status]}
        />
      </div>

      <div className="wrap">
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

        <section aria-label="Inleiding" className="w-sectie">
          {VIJVER.intro.map((t) => (
            <Oplichten key={t.slice(0, 40)} tekst={t} className="m-0 mb-[1em]" />
          ))}
          <Lees className="mt-[clamp(24px,3vw,40px)]">
            <p className="lbl m-0 mt-6 text-gedempt">{VIJVER.auteur}</p>
          </Lees>
        </section>

        <nav aria-labelledby="inhoud-kop" className="w-sectie">
          <Kopregel id="inhoud-kop" links="Het hele verhaal" rechts={`${HOOFDSTUKKEN.length} hoofdstukken`} />
          <ol className="m-0 list-none columns-1 gap-x-8 p-0 md:columns-2">
            {HOOFDSTUKKEN.map((h, i) => (
              <li key={h.id} className="break-inside-avoid border-t border-lijn">
                <a href={`#${h.id}`} className="flex min-h-11 items-baseline gap-4 py-3 no-underline">
                  <span className="lbl tabular-nums text-gedempt">{nr(i)}</span>
                  <span className="w-lijnlink text-[17px] font-medium">{h.kort}</span>
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
                    {nr(i)} · {h.kort}
                  </p>
                  <span className="lbl tabular-nums text-gedempt">
                    {nr(i)} / {nr(HOOFDSTUKKEN.length - 1)}
                  </span>
                </div>
                <h2 id={`${h.id}-kop`} className="w-titel syne max-w-[22ch] [overflow-wrap:anywhere]" data-zie>
                  {h.kop}
                </h2>
                <Lees className="mt-[clamp(32px,4vw,56px)]">
                  <Alineas teksten={h.alineas} />
                  {h.planttabel ? (
                    <>
                      <div className="my-8 overflow-x-auto">
                        <table className="w-full border-collapse text-left tabular-nums">
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
                  <div className="mt-[clamp(48px,6vw,96px)]" data-zie>
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

        <section aria-labelledby="cijfers-kop" className="w-sectie">
          <Kopregel id="cijfers-kop" links="Het project in cijfers" rechts={`${CIJFERS.length} feiten`} />
          <dl className="m-0">
            {CIJFERS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-lijn py-3 last:border-b md:grid-cols-[3fr_9fr]">
                <dt className="lbl text-gedempt">{k}</dt>
                <dd className="m-0 tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 mb-0 text-sm text-gedempt">{CIJFERS_NOOT}</p>
        </section>
      </div>

      <div className="w-sectie">
        <Doorkijk foto={SLOTBEELD} sizes="100vw" className="h-[clamp(360px,70vh,820px)] w-full" eigen={false} v={1.5} />
      </div>

      <div className="wrap">
        <Slot kop={SLOT.kop} alineas={[...SLOT.alineas, SLOT.oproep]} knop={VIJVER.contactknop} />
        <Volgende hier="/werk/vijverrenovatie" />
      </div>
      <Verder voor="Zoiets voor" nadruk="jouw tuin" na="?" href="/kennismaken" label="Naar Kennismaken" />
    </article>
  )
}
