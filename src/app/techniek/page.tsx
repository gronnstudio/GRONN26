import type { Metadata } from "next"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { T } from "@/components/taal"
import { AANTAL } from "@/lib/data/techniek"
import { Doorsnede } from "@/components/techniek/doorsnede"
import { Filter } from "@/components/techniek/filter"
import { Probeer } from "@/components/techniek/probeer"
import { JouwBezoek } from "@/components/techniek/bezoek"
import "./techniek.css"

export const metadata: Metadata = {
  title: "Techniek",
  description: "De techniek achter GRØNN Studio, getekend als een vijver: van de camera op de oever tot het filter dat elke wijziging controleert.",
  alternates: { canonical: "/techniek" },
}

// /techniek, opnieuw op 11 okt 2026: de site als vijver in doorsnede, drie
// dingen om aan te raken, het filter om zelf een wijziging door te sturen, en
// de peilschaal van je eigen bezoek.

function Kop({ id, label, rechts, zin }: { id: string; label: { nl: string; en: string }; rechts: { nl: string; en: string }; zin: { nl: string; en: string } }) {
  return (
    <>
      <div className="w-kopregel">
        <h2 id={id} className="lbl m-0 font-normal"><T t={label} /></h2>
        <span className="lbl text-gedempt"><T t={rechts} /></span>
      </div>
      <p className="tk-zin syne" data-zie><T t={zin} /></p>
    </>
  )
}

export default function Techniek() {
  return (
    <>
      <Opening
        label={{ nl: `Techniek · ${AANTAL} onderdelen`, en: `Technology · ${AANTAL} parts` }}
        titel={{ nl: "Gebouwd als\neen vijver", en: "Built like\na pond" }}
        zin={<T t={{ nl: "Een vijver heeft een oever, water, een filter en een peilschaal. Deze site ook. Tik op een deel van de tekening.", en: "A pond has a bank, water, a filter and a gauge. So does this site. Tap a part of the drawing." }} />}
      />

      <div className="wrap">
        <section aria-label="Doorsnede" className="tk-blok tk-eerste">
          <Doorsnede />
        </section>

        <section aria-labelledby="tk-probeer" className="tk-blok">
          <Kop id="tk-probeer" label={{ nl: "Probeer het", en: "Try it" }} rechts={{ nl: "3 stukken", en: "3 pieces" }} zin={{ nl: "Drie dingen die je zelf kunt aanraken.", en: "Three things you can touch yourself." }} />
          <Probeer />
        </section>

        <section aria-labelledby="tk-filter" className="tk-blok">
          <Kop id="tk-filter" label={{ nl: "Het filter", en: "The filter" }} rechts={{ nl: "6 stappen · elke keer", en: "6 steps · every time" }} zin={{ nl: "Stuur zelf een wijziging door het filter.", en: "Send a change through the filter yourself." }} />
          <Filter />
        </section>

        <section aria-labelledby="tk-peil" className="tk-blok">
          <Kop id="tk-peil" label={{ nl: "De peilschaal", en: "The gauge" }} rechts={{ nl: "nu, op dit scherm", en: "now, on this screen" }} zin={{ nl: "Wat je eigen browser over dit bezoek weet.", en: "What your own browser knows about this visit." }} />
          <JouwBezoek />
        </section>
      </div>

      <Verder voor={{ nl: "En hoe het", en: "And how it" }} nadruk={{ nl: "eruitziet", en: "looks" }} na="?" href="/merk" label={{ nl: "Naar het merk", en: "To the brand" }} />
    </>
  )
}
