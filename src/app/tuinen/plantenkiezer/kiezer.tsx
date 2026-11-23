"use client"

import Link from "next/link"
import { useState } from "react"
import { T, type Tekst } from "@/components/taal"
import { BORDER_PRIJS } from "@/lib/data/borderpakketten"
import { BLOEI, GROND, LICHT, WENSEN, aantalVoor, kiesPakketten, type Grond, type Licht, type Wens } from "@/lib/data/plantenkiezer"
import { priceLabel } from "@/lib/format"

const MAANDEN: { nl: string; en: string }[] = [
  { nl: "j", en: "J" }, { nl: "f", en: "F" }, { nl: "m", en: "M" }, { nl: "a", en: "A" },
  { nl: "m", en: "M" }, { nl: "j", en: "J" }, { nl: "j", en: "J" }, { nl: "a", en: "A" },
  { nl: "s", en: "S" }, { nl: "o", en: "O" }, { nl: "n", en: "N" }, { nl: "d", en: "D" },
]

const KEUZE =
  "inline-flex min-h-[var(--knop)] flex-col justify-center rounded-[16px] border border-gedempt px-4 py-2.5 text-left text-[15px] leading-[1.3] peer-checked:border-inkt peer-checked:bg-inkt peer-checked:text-grond peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inkt"

function Vraag({ kop, children }: { kop: Tekst; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 border-0 border-t border-lijn p-0 pt-6">
      <legend className="float-left mb-4 w-full p-0">
        <span className="syne block text-[clamp(22px,2.4vw,30px)] leading-[1.1] tracking-[-.02em]"><T t={kop} /></span>
      </legend>
      <div className="clear-both flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

export function Plantenkiezer() {
  const [licht, setLicht] = useState<Licht | "">("")
  const [grond, setGrond] = useState<Grond | "">("")
  const [wensen, setWensen] = useState<Wens[]>([])
  const [m2, setM2] = useState(10)

  const klaar = licht !== "" && grond !== ""
  const [beste, ...rest] = klaar ? kiesPakketten({ licht, grond, wensen }) : []
  const planten = beste?.planten.map((x) => ({ ...x, totaal: aantalVoor(x.aantal, m2), bloei: BLOEI[x.lat] ?? [] })) ?? []
  const totaal = planten.reduce((t, x) => t + x.totaal, 0)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-[clamp(48px,6vw,96px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()} aria-label="Plantenkiezer">
        <Vraag kop={{ nl: "Hoeveel zon krijgt de plek?", en: "How much sun does the spot get?" }}>
          {LICHT.map((k) => (
            <label key={k.id} className="cursor-pointer">
              <input type="radio" name="licht" value={k.id} checked={licht === k.id} onChange={() => setLicht(k.id)} className="peer sr-only" />
              <span className={KEUZE}>
                <T t={k.label} />
                <span className="text-[13px] opacity-70"><T t={k.uitleg} /></span>
              </span>
            </label>
          ))}
        </Vraag>

        <Vraag kop={{ nl: "Hoe is de grond?", en: "What is the soil like?" }}>
          {GROND.map((k) => (
            <label key={k.id} className="cursor-pointer">
              <input type="radio" name="grond" value={k.id} checked={grond === k.id} onChange={() => setGrond(k.id)} className="peer sr-only" />
              <span className={KEUZE}>
                <T t={k.label} />
                <span className="text-[13px] opacity-70"><T t={k.uitleg} /></span>
              </span>
            </label>
          ))}
        </Vraag>

        <Vraag kop={{ nl: "Wat vind je belangrijk?", en: "What matters to you?" }}>
          {WENSEN.map((k) => (
            <label key={k.id} className="cursor-pointer">
              <input
                type="checkbox"
                name="wens"
                value={k.id}
                checked={wensen.includes(k.id)}
                onChange={(e) => setWensen((w) => (e.target.checked ? [...w, k.id] : w.filter((x) => x !== k.id)))}
                className="peer sr-only"
              />
              <span className={`${KEUZE} rounded-full`}><T t={k.label} /></span>
            </label>
          ))}
        </Vraag>

        <div className="border-t border-lijn pt-6">
          <label htmlFor="pk-m2" className="block">
            <span className="syne block text-[clamp(22px,2.4vw,30px)] leading-[1.1] tracking-[-.02em]"><T t={{ nl: "Hoe groot is de border?", en: "How big is the border?" }} /></span>
          </label>
          <div className="mt-4 flex items-center gap-4">
            <input id="pk-m2" type="range" min={1} max={40} step={1} value={m2} onChange={(e) => setM2(Number(e.target.value))} className="min-w-0 flex-1 accent-[var(--inkt)]" />
            <output htmlFor="pk-m2" className="syne w-[4.5ch] text-right text-[28px] tabular-nums">{m2} m²</output>
          </div>
          <p className="mt-2 mb-0 text-[13px] text-gedempt"><T t={{ nl: "Lengte × breedte. Een border van 5 × 2 meter is 10 m².", en: "Length × width. A border of 5 × 2 metres is 10 m²." }} /></p>
        </div>
      </form>

      <section aria-live="polite" aria-labelledby="pk-uitkomst" className="lg:sticky lg:top-6 lg:self-start">
        {!beste ? (
          <div className="rounded-[16px] bg-vlak p-6 sm:p-8">
            <h2 id="pk-uitkomst" className="lbl m-0 text-gedempt"><T t={{ nl: "Jouw border", en: "Your border" }} /></h2>
            <p className="syne mt-4 mb-0 text-[clamp(24px,2.8vw,36px)] leading-[1.1] tracking-[-.02em]">
              <T t={{ nl: "Kies zon en grond, dan zie je hier welke border past.", en: "Pick sun and soil, and you’ll see which border fits." }} />
            </p>
          </div>
        ) : (
          <div className="rounded-[16px] bg-vlak p-6 sm:p-8">
            <p className="lbl m-0 text-gedempt"><T t={{ nl: "Past het best", en: "Fits best" }} /></p>
            <h2 id="pk-uitkomst" className="syne mt-3 mb-0 text-[clamp(32px,3.6vw,52px)] leading-[1.02] tracking-[-.025em]">
              <T t={beste.naam} /><b className="ar-punt" aria-hidden>.</b>
            </h2>
            <p className="mt-4 mb-0 max-w-[56ch] text-[16px] leading-[1.5]"><T t={beste.zin} /></p>

            <h3 className="lbl mt-8 mb-0 text-gedempt"><T t={{ nl: `${totaal} planten voor ${m2} m²`, en: `${totaal} plants for ${m2} m²` }} /></h3>
            {/* Bloeikalender: per plant de maanden waarin hij bloeit (of te oogsten is). */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-[13px] sm:text-[14px] leading-[1.3]">
                <thead>
                  <tr>
                    <th scope="col" className="lbl py-2 pr-3 text-left font-normal text-gedempt"><T t={{ nl: "Plant", en: "Plant" }} /></th>
                    <th scope="col" className="lbl py-2 pr-3 text-right font-normal text-gedempt"><T t={{ nl: "Aantal", en: "Qty" }} /></th>
                    {MAANDEN.map((m, i) => (
                      <th key={i} scope="col" className="lbl w-[13px] py-2 text-center text-[9px] sm:w-[22px] sm:text-[11px] font-normal text-gedempt"><T t={m} /></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planten.map((x) => (
                    <tr key={x.lat} className="border-t border-lijn">
                      <th scope="row" className="py-2.5 pr-3 text-left font-normal">
                        <T t={x.naam} />
                        <span className="hidden text-[12px] italic text-gedempt sm:block">{x.lat}</span>
                      </th>
                      <td className="py-2.5 pr-2 text-right tabular-nums sm:pr-3">{x.totaal}×</td>
                      {MAANDEN.map((_, i) => (
                        <td key={i} className="px-[1px] py-2.5">
                          <span className={`block h-3 rounded-full ${x.bloei.includes(i + 1) ? "bg-inkt" : "bg-lijn opacity-40"}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 mb-0 text-[12px] text-gedempt">
              <T t={{ nl: "Gevulde balk = in bloei, of te oogsten bij eetbare planten. Een rij zonder balk is een bladplant.", en: "Filled bar = in flower, or ready to harvest for edible plants. A row with no bar is a foliage plant." }} />
            </p>

            <dl className="mt-8 mb-0 grid grid-cols-2 gap-3">
              <div className="rounded-[12px] border border-lijn p-4">
                <dt className="lbl text-gedempt"><T t={{ nl: "Opgestuurd", en: "Shipped" }} /></dt>
                <dd className="syne m-0 mt-2 text-[clamp(24px,2.6vw,34px)] leading-none tabular-nums">{priceLabel(m2 * BORDER_PRIJS.opgestuurd)}</dd>
                <dd className="m-0 mt-1 text-[13px] text-gedempt"><T t={{ nl: "planten + plan, zelf planten", en: "plants + plan, you plant" }} /></dd>
              </div>
              <div className="rounded-[12px] border border-lijn p-4">
                <dt className="lbl text-gedempt"><T t={{ nl: "Aangeplant", en: "Planted" }} /></dt>
                <dd className="syne m-0 mt-2 text-[clamp(24px,2.6vw,34px)] leading-none tabular-nums">{priceLabel(m2 * BORDER_PRIJS.aangeplant)}</dd>
                <dd className="m-0 mt-1 text-[13px] text-gedempt"><T t={{ nl: "ik plant hem, Stein en omgeving", en: "I plant it, in and around Stein" }} /></dd>
              </div>
            </dl>
            <p className="mt-2 mb-0 text-[12px] text-gedempt"><T t={{ nl: "Inclusief btw. Indicatie: de echte prijs hoor je na een korte blik op de plek.", en: "Including VAT. An estimate: you get the real price after a quick look at the spot." }} /></p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={`/kennismaken?pakket=${beste.slug}`}
                className="knop bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
              >
                <T t={{ nl: "Vraag deze border aan", en: "Ask about this border" }} />
              </Link>
              <Link href={`/tuinen/borderpakketten#open-${beste.slug}`} className="lnk text-[15px]">
                <T t={{ nl: "Plan van boven bekijken", en: "See the planting plan" }} />
              </Link>
            </div>

            {rest.length > 0 ? (
              <p className="mt-8 mb-0 border-t border-lijn pt-5 text-[14px] leading-[1.6] text-gedempt">
                <T t={{ nl: "Past ook: ", en: "Also fits: " }} />
                {rest.slice(0, 2).map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 ? " · " : null}
                    <Link href={`/tuinen/borderpakketten#open-${p.slug}`} className="lnk"><T t={p.naam} /></Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}
