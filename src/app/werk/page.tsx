import type { Metadata } from "next"
import Link from "next/link"
import { ViewTransition } from "react"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import { CirkelWoord } from "@/components/landschap/cirkel-link"
import { Opening } from "@/components/wereld/opening"
import { WERK } from "@/components/werk/projecten"
import { Beeld } from "@/components/landschap/beeld"
import { Opkomst } from "@/components/landschap/opkomst"
import type { Beeld as BeeldData } from "@/components/landschap/beelden"
import "@/components/landschap/landschap.css"

const BESCHRIJVING =
  "Echt werk van GRØNN Studio: een vijverrenovatie in Elsloo met twee vijvers, een waterval en een beekloop, en een terras van 24 m² in Geulle."

export const metadata: Metadata = {
  title: "Werk",
  description: BESCHRIJVING,
  alternates: { canonical: "/werk" },
  openGraph: {
    title: "Werk · GRØNN Studio",
    description: BESCHRIJVING,
    url: "/werk",
    images: [{ url: "/projecten/vijverrenovatie/F01.jpg", width: 2000, height: 1500 }],
  },
}

// Werk in de taal van de voorpagina (bouwbrief, 21 nov 2026): per project één
// groot eigen beeld met de naam eronder, om en om breed en smal, en de korte
// feiten op een lijn. Alleen eigen projectfotografie.
export default function WerkPagina() {
  return (
    <div className="ls">
      <Opkomst />
      <Opening
        label={{ nl: "Werk", en: "Work" }}
        titel={{ nl: "Van eerste idee naar buiten.", en: "From first idea to outside." }}
        zin={<T t={{ nl: BESCHRIJVING, en: "Real work by GRØNN Studio: a pond renovation in Elsloo with two ponds, a waterfall and a stream, and a 24 m² patio in Geulle." }} />}
      />

      {WERK.map((p, i) => {
        const beeld: BeeldData = { ...p.foto, soort: "project" }
        return (
          <section key={p.href} className="ls-raster ls-sectie" aria-labelledby={`werk-${i}`}>
            <Link href={p.href} className={`ls-werkkaart ls-werkpagina ${i % 2 ? "ls-werkpagina-rechts" : ""} ls-op`} transitionTypes={["schuif"]}>
              <ViewTransition name={p.morph} share="morph" default="none">
                <Beeld beeld={beeld} sizes="(min-width: 1024px) 66vw, 100vw" className="ls-werkbeeld" decoratief priority={i === 0} />
              </ViewTransition>
              <span className="ls-werkpagina-tekst">
                <span className="ls-label"><T t={p.type} />{p.plaats !== "—" ? ` · ${p.plaats}` : ""} · {p.jaar}</span>
                <span id={`werk-${i}`} className="ls-h1 ls-werknaam"><T t={p.titel} /></span>
                <CirkelWoord voor={{ nl: "Bekijk het", en: "View the" }} woord={{ nl: "project", en: "project" }} />
              </span>
            </Link>
          </section>
        )
      })}

      <section className="ls-raster ls-sectie" aria-label="Noot">
        <p className="ls-annotatie ls-werk-noot">
          <T t={{ nl: "Uitsluitend eigen projectfotografie, met toestemming van de klant. Er komen projecten bij zodra ze af zijn.", en: "Only my own project photography, with the client's permission. More projects follow as they are finished." }} />
        </p>
      </section>
    </div>
  )
}
