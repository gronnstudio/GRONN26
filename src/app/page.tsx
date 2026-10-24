import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T, type Tekst } from "@/components/taal"
import { Plan } from "@/components/blad/plan"
import "@/components/blad/plan.css"
import { WERK } from "@/components/werk/projecten"
import { F08_2 } from "@/components/voorpagina/beelden"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// Blad B-01, de plattegrond (tuinplan, 24 okt 2026): bovenaan de kop van de
// tekening, dan de tuin van boven met legenda, de toelichting in genummerde
// opmerkingen, het uitgevoerde werk als detailbladen en de poort naar
// Kennismaken.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
}

const OPMERKINGEN: Tekst[] = [
  { nl: "Ik ontwerp, leg aan en onderhoud zelf. Eén persoon van het eerste gesprek tot de laatste plant.", en: "I design, build and maintain myself. One person from the first conversation to the last plant." },
  { nl: "Een vaste prijs vooraf, waar het kan. Wat niet blind te prijzen is, bekijk ik eerst ter plaatse.", en: "A fixed price up front, wherever possible. What can’t be priced blind, I look at on site first." },
  { nl: "Ik begin bij water, bodem en licht van jouw plek, en kies daarna pas de planten.", en: "I start with the water, soil and light of your place, and only then choose the plants." },
  { nl: "Werkgebied: Stein en omgeving, tot ongeveer 30 km (Maastricht, Heerlen, Kerkrade).", en: "Area: Stein and surroundings, up to about 30 km (Maastricht, Heerlen, Kerkrade)." },
]

const Sectiekop = ({ code, t }: { code: string; t: Tekst }) => (
  <div className="b-sectiekop">
    <span className="b-code">{code}</span>
    <h2><T t={t} /></h2>
  </div>
)

export default function Voorpagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema()).replace(/</g, "\\u003c") }} />

      <section className="wrap b-titel" aria-labelledby="kop">
        <p className="lbl m-0"><T t={{ nl: "Blad B-01 · Plattegrond · Stein en omgeving", en: "Sheet B-01 · Site plan · Stein and surroundings" }} /></p>
        <h1 id="kop">
          <T t={{ nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.", en: "I build and maintain ponds and natural gardens for homeowners in Stein and the surrounding area, with a fixed price up front." }} />
        </h1>
        <Link href="/kennismaken" className="knop bg-oranje text-antraciet b-knop">
          <T t={{ nl: "Kennismaken →", en: "Get in touch →" }} />
        </Link>
      </section>

      <section className="wrap b-sectie" aria-label="Plattegrond">
        <Plan />
      </section>

      <section className="wrap b-sectie" aria-labelledby="h-opm">
        <div className="b-sectiekop">
          <span className="b-code">A</span>
          <h2 id="h-opm"><T t={{ nl: "Opmerkingen", en: "Notes" }} /></h2>
        </div>
        <div className="b-twee">
          <ol className="b-opmerkingen">
            {OPMERKINGEN.map((o, i) => (
              <li key={i}><span className="b-code">{String(i + 1).padStart(2, "0")}</span><p className="m-0"><T t={o} /></p></li>
            ))}
          </ol>
          <figure className="b-foto m-0">
            <Foto foto={F08_2} sizes="(min-width: 1024px) 30vw, 90vw" className="aspect-[4/5]" />
            <figcaption><span className="b-code">Foto 01</span> Nick Peters, <T t={{ nl: "aan het werk bij de vijverrenovatie", en: "at work on the pond renovation" }} /></figcaption>
          </figure>
        </div>
      </section>

      <section className="wrap b-sectie" aria-label="Werk">
        <Sectiekop code="B" t={{ nl: "Uitgevoerd werk", en: "Completed work" }} />
        <ul className="b-detail">
          {WERK.map((p, i) => (
            <li key={p.href}>
              <Link href={p.href} className="b-detail-blad">
                <div className="b-detail-kop">
                  <span className="b-code">Detail {String.fromCharCode(65 + i)}</span>
                  <span className="b-code">{p.code} · {p.jaar}</span>
                </div>
                <Foto foto={p.foto} sizes="(min-width: 768px) 45vw, 90vw" className="aspect-[4/3]" />
                <div className="b-detail-voet">
                  <h3><T t={p.titel} /></h3>
                  <p className="m-0"><T t={p.type} /> · {p.plaats === "—" ? <T t={{ nl: "Limburg", en: "Limburg" }} /> : p.plaats}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap b-sectie" aria-labelledby="h-poort">
        <Sectiekop code="C" t={{ nl: "De poort", en: "The gate" }} />
        <div className="b-poort">
          <p id="h-poort" className="b-poort-zin">
            <T t={{ nl: "Elke tuin hier begon met een gesprek bij de poort. Vertel waar je aan denkt, dan teken ik mee.", en: "Every garden here began with a conversation at the gate. Tell me what you have in mind and I’ll draw along." }} />
          </p>
          <div className="b-poort-acties">
            <Link href="/kennismaken" className="knop bg-oranje text-antraciet">
              <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
            </Link>
            <a href={BUSINESS.whatsapp} className="knop b-knop-lijn">WhatsApp</a>
            <a href={BUSINESS.phoneHref} className="knop b-knop-lijn tabular-nums">{BUSINESS.phone}</a>
          </div>
        </div>
      </section>
    </>
  )
}
