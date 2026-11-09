import { Figuur, LijnLink, Markering } from "@/components/ontwerp"
import { T, type Tekst } from "@/components/taal"
import { F09_2 } from "./beelden"

// 01 Studio: wie het doet en hoe hij denkt. Een kop over negen kolommen, de
// leesalinea eronder, rechts Nick tussen de oeverplanten (staat verschoven,
// schuift zacht mee). Daaronder drie uitgangspunten als regels, geen kaarten.
// Alles uit bestaande tekst van de site; niets bedacht.

const PUNTEN: { kop: Tekst; tekst: Tekst }[] = [
  {
    kop: { nl: "Eén aanspreekpunt", en: "One point of contact" },
    tekst: { nl: "Je spreekt mij, van het eerste gesprek tot het onderhoud. Ik ontwerp, leg aan en onderhoud zelf.", en: "You talk to me, from the first conversation to the maintenance. I design, build and maintain myself." },
  },
  {
    kop: { nl: "Vaste prijs vooraf", en: "Fixed price up front" },
    tekst: { nl: "Waar het kan. Wat niet blind te prijzen is, bekijk ik eerst ter plaatse.", en: "Wherever possible. What can’t be priced blind, I look at on site first." },
  },
  {
    kop: { nl: "Stein en omgeving", en: "Stein and surroundings" },
    tekst: { nl: "Tot ongeveer 30 km: Sittard-Geleen, Maastricht, Heerlen, Kerkrade.", en: "Up to about 30 km: Sittard-Geleen, Maastricht, Heerlen, Kerkrade." },
  },
]

export function Studio() {
  return (
    <section className="wrap studio" aria-labelledby="h-studio">
      <Markering nr="01" naam="Studio" />
      <div className="raster studio-raster">
        <div className="studio-tekst">
          <h2 id="h-studio" className="t-h2 m-0 opkomst">
            <T t={{ nl: "Eén persoon, van het eerste gesprek tot de laatste plant.", en: "One person, from the first conversation to the last plant." }} />
          </h2>
          <p className="t-lead studio-lead opkomst">
            <T
              t={{
                nl: "Ik ben Nick Peters. Ik begin bij het water, de bodem en het licht van jouw plek, en kies daarna pas de planten. Zo blijft een vijver gezond en draagt een tuin zichzelf.",
                en: "I’m Nick Peters. I start with the water, the soil and the light of your place, and only then choose the plants. That way a pond stays healthy and a garden carries itself.",
              }}
            />
          </p>
          <LijnLink href="/over" className="meta">
            <T t={{ nl: "Meer over de studio", en: "More about the studio" }} />
          </LijnLink>
        </div>
        <div className="studio-beeld" data-v="0.6">
          <Figuur
            foto={F09_2}
            sizes="(min-width: 768px) 30vw, 70vw"
            vorm="aspect-[4/5]"
            code="F09"
            bijschrift={{ nl: "Nick Peters, aan het werk in de vijver", en: "Nick Peters, at work in the pond" }}
          />
        </div>
      </div>
      <ol className="studio-punten">
        {PUNTEN.map((p, i) => (
          <li key={i} className="opkomst">
            <span className="meta text-gedempt">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="t-h3 m-0"><T t={p.kop} /></h3>
            <p className="m-0 text-gedempt"><T t={p.tekst} /></p>
          </li>
        ))}
      </ol>
    </section>
  )
}
