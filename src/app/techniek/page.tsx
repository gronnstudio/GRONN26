import type { Metadata } from "next"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { T } from "@/components/taal"
import { AANTAL } from "@/lib/data/techniek"
import { Stapel } from "@/components/techniek/stapel"
import { Filter } from "@/components/techniek/filter"
import { Probeer } from "@/components/techniek/probeer"
import { JouwBezoek } from "@/components/techniek/bezoek"
import "./techniek.css"

export const metadata: Metadata = {
  title: "Techniek",
  description: "De techniek achter de site van GRØNN Studio, laag voor laag: van je scherm tot de controle die elke wijziging doorloopt. Om zelf aan te raken.",
  alternates: { canonical: "/techniek" },
}

// /techniek, 14 okt 2026 (eigenaar: "niet werk gerelateerd maar wel
// interactief"): de site als stapel van vijf lagen, drie dingen om aan te
// raken, de controle om zelf een wijziging door te sturen, en je eigen bezoek.

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
        titel={{ nl: "Waar deze\nsite op draait", en: "What this\nsite runs on" }}
        zin={<T t={{ nl: "Vijf lagen, van je scherm tot de controle achter elke wijziging. Tik op een laag, typ, schuif en stuur zelf iets door.", en: "Five layers, from your screen to the checks behind every change. Tap a layer, type, slide and send something through yourself." }} />}
      />

      <div className="wrap">
        <section aria-label="De lagen van de site" className="tk-blok tk-eerste">
          <Stapel />
        </section>

        <section aria-labelledby="tk-probeer" className="tk-blok">
          <Kop id="tk-probeer" label={{ nl: "Probeer het", en: "Try it" }} rechts={{ nl: "3 stukken", en: "3 pieces" }} zin={{ nl: "Drie dingen die je zelf kunt aanraken.", en: "Three things you can touch yourself." }} />
          <Probeer />
        </section>

        <section aria-labelledby="tk-filter" className="tk-blok">
          <Kop id="tk-filter" label={{ nl: "De controle", en: "The checks" }} rechts={{ nl: "6 stappen · elke keer", en: "6 steps · every time" }} zin={{ nl: "Stuur zelf een wijziging door de controle.", en: "Send a change through the checks yourself." }} />
          <Filter />
        </section>

        <section aria-labelledby="tk-peil" className="tk-blok">
          <Kop id="tk-peil" label={{ nl: "Jouw bezoek", en: "Your visit" }} rechts={{ nl: "nu, op dit scherm", en: "now, on this screen" }} zin={{ nl: "Wat je eigen browser over dit bezoek weet.", en: "What your own browser knows about this visit." }} />
          <JouwBezoek />
        </section>
      </div>

      <Verder voor={{ nl: "En hoe het", en: "And how it" }} nadruk={{ nl: "eruitziet", en: "looks" }} na="?" href="/merk" label={{ nl: "Naar het merk", en: "To the brand" }} />
    </>
  )
}
