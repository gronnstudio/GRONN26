import type { Metadata } from "next"
import Link from "next/link"
import { DienstKolommen, DienstRij } from "@/components/diensten/dienst-rij"
import { diensten, eersteZinL } from "@/components/diensten/kies"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import { CirkelWoord } from "@/components/landschap/cirkel-link"
import { TelLink } from "@/components/handoff/klant"
import { Opening } from "@/components/wereld/opening"
import { Beeld } from "@/components/landschap/beeld"
import { Opkomst } from "@/components/landschap/opkomst"
import { POEL, REGENTUIN, VIJVER_TERRAS, type Beeld as BeeldData } from "@/components/landschap/beelden"
import "@/components/landschap/landschap.css"
import { FOTOS, VIJVER, type Foto as FotoData } from "@/lib/data/vijverrenovatie"

// Vijvers in de taal van de voorpagina (bouwbrief, 21 nov 2026): opening met
// eigen werk, één standpunt, de diensten als lijnlijst, sfeer met label, het
// eigen vijverproject en één vraag met één knop.
const VIJVERDIENSTEN = diensten(
  "pond-survey",
  "water-systems",
  "pond-autumn-service",
  "leaf-net",
  "winterising",
  "maintenance-subscription",
)

const INLEIDING = VIJVERDIENSTEN[1].summary.nl
const [ZIN, VERVOLG] = eersteZinL(VIJVERDIENSTEN[1].summary)

export const metadata: Metadata = {
  title: "Vijvers",
  description: INLEIDING,
}

const F01 = FOTOS.F01 as FotoData
const F10: BeeldData = { ...(FOTOS.F10 as FotoData), soort: "project" }

export default function VijversPagina() {
  return (
    <div className="ls">
      <Opkomst />
      <Opening label={{ nl: "Vijvers & water", en: "Ponds & water" }} titel={{ nl: "Water dat werkt.", en: "Water that works." }} zin={<T t={ZIN} />} foto={F01} />

      <section className="ls-raster ls-sectie ls-twee ls-mob-weg" aria-labelledby="vijver-standpunt">
        <div className="ls-twee-kop ls-op">
          <p className="ls-label"><T t={{ nl: "Standpunt", en: "Point of view" }} /></p>
          <h2 id="vijver-standpunt" className="ls-h2"><T t={{ nl: "Ik bekijk de vijver als geheel: water, techniek en beplanting.", en: "I look at the pond as a whole: water, technology and planting." }} /></h2>
        </div>
        <div className="ls-twee-inhoud ls-op">
          {VERVOLG.nl ? <p className="w-onthul"><T t={VERVOLG} /></p> : null}
        </div>
      </section>

      <section className="ls-raster ls-sectie" aria-labelledby="vijver-diensten">
        <div className="ls-sectiekop ls-op">
          <div>
            <p className="ls-label"><T t={{ nl: "Vijverdiensten", en: "Pond services" }} /></p>
            <h2 id="vijver-diensten" className="ls-h1"><T t={{ nl: "Wat ik voor je vijver doe.", en: "What I do for your pond." }} /></h2>
          </div>
        </div>
        <div className="ls-op">
          <DienstKolommen />
          {VIJVERDIENSTEN.map((d) => (
            <DienstRij key={d.slug} dienst={d} />
          ))}
        </div>
        <p className="ls-annotatie ls-diensten-noot">
          <T t={{ nl: "Tik op een dienst: wat erbij hoort, wat niet, en alle prijzen.", en: "Tap a service: what it includes, what it doesn’t, and all the prices." }} />
        </p>
      </section>

      <section className="ls-raster ls-sectie" aria-labelledby="vijver-helder">
        <div className="ls-sectiekop ls-op">
          <div>
            <p className="ls-label"><T t={{ nl: "Helder water", en: "Clear water" }} /></p>
            <h2 id="vijver-helder" className="ls-h1"><T t={{ nl: "Helder water, zonder filter schoonmaken.", en: "Clear water, no filter cleaning." }} /></h2>
          </div>
          <p className="ls-body ls-lees"><T t={{ nl: "Natuurlijke waterval, beekloop en biofiltersysteem. Planten en pomp doen het zware werk.", en: "A natural waterfall, stream and biofilter system. Plants and pump do the heavy lifting." }} /></p>
        </div>
        <div className="ls-beeldrij" tabIndex={0} role="region" aria-label="Beelden van helder water">
          <Beeld beeld={VIJVER_TERRAS} sizes="(min-width: 768px) 58vw, 100vw" className="ls-op" />
          <Beeld beeld={POEL} sizes="(min-width: 768px) 40vw, 50vw" className="ls-op" labelRechts />
          <Beeld beeld={REGENTUIN} sizes="(min-width: 768px) 40vw, 50vw" className="ls-op" labelRechts />
        </div>
      </section>

      <section className="ls-raster ls-sectie" aria-labelledby="vijver-werk">
        <Link href="/werk/vijverrenovatie" className="ls-werkkaart ls-werkpagina ls-op" transitionTypes={["schuif"]}>
          <Beeld beeld={F10} sizes="(min-width: 1024px) 66vw, 100vw" className="ls-werkbeeld" decoratief />
          <span className="ls-werkpagina-tekst">
            <span className="ls-label"><T t={{ nl: "Vijverwerk", en: "Pond work" }} /> · <T t={{ nl: VIJVER.status, en: VIJVER.en.status }} /></span>
            <span id="vijver-werk" className="ls-h1 ls-werknaam"><T t={{ nl: VIJVER.titel, en: VIJVER.en.titel }} /></span>
            <CirkelWoord voor={{ nl: "Bekijk het", en: "View the" }} woord={{ nl: "project", en: "project" }} />
          </span>
        </Link>
      </section>

      <section className="ls-raster ls-sectie ls-twee ls-mob-weg" aria-labelledby="vijver-vraag">
        <div className="ls-twee-kop ls-op">
          <p className="ls-label"><T t={{ nl: "Vraag", en: "Question" }} /></p>
          <h2 id="vijver-vraag" className="ls-h2"><T t={{ nl: "Kan ik alleen hulp met mijn vijver krijgen?", en: "Can I get help with just my pond?" }} /></h2>
        </div>
        <div className="ls-twee-inhoud ls-op ls-vraag">
          <p className="w-onthul"><T t={{ nl: "Ja. Elk van deze diensten kun je los vragen.", en: "Yes. You can ask for each of these services on its own." }} /></p>
          <TelLink href="/kennismaken" gebeurtenis="cta_kennismaken" plek="vijvers" className="ls-knop ls-knop-actie">
            <T t={{ nl: "Kennismaken", en: "Get in touch" }} /> <Pijl richting="ne" />
          </TelLink>
        </div>
      </section>
    </div>
  )
}
