import type { Metadata } from "next"
import Link from "next/link"
import { DienstRij } from "@/components/diensten/dienst-rij"
import { diensten, eersteZinL } from "@/components/diensten/kies"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import { Opening } from "@/components/wereld/opening"
import { Beeld } from "@/components/landschap/beeld"
import { Opkomst } from "@/components/landschap/opkomst"
import { BEPLANTING, type Beeld as BeeldData } from "@/components/landschap/beelden"
import "@/components/landschap/landschap.css"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import type { L } from "@/lib/i18n"

// Tuinen in de taal van de voorpagina (bouwbrief, 21 nov 2026): opening met
// een gelabeld sfeerbeeld (er is nog geen eigen tuinfoto), de drie fasen als
// lijnlijsten, wat er in een natuurlijke tuin kan, de borderpakketten en het
// eigen terras als bewijs.
const FASEN = [
  { id: "fase-kijken", kop: { nl: "Kijken", en: "Looking" }, diensten: diensten("consultancy") },
  { id: "fase-ontwerpen", kop: { nl: "Ontwerpen", en: "Designing" }, diensten: diensten("garden-design", "planting-habitat") },
  { id: "fase-aanleggen", kop: { nl: "Aanleggen", en: "Building" }, diensten: diensten("garden-transformation", "implementation") },
]

const INLEIDING = FASEN[1].diensten[0].summary.nl
const [ZIN, VERVOLG] = eersteZinL(FASEN[1].diensten[0].summary)

export const metadata: Metadata = {
  title: "Tuinen",
  description: INLEIDING,
}

const ELEMENTEN: { naam: L; zin: L; href?: string }[] = [
  { naam: { nl: "Vijver of poel", en: "Pond" }, zin: { nl: "Water trekt binnen een seizoen kikkers, libellen en vogels.", en: "Within a season, water draws frogs, dragonflies and birds." }, href: "/vijvers" },
  { naam: { nl: "Inheemse border", en: "Native border" }, zin: { nl: "Planten die hier thuishoren. Insecten kennen ze al.", en: "Plants that belong here. Insects already know them." }, href: "/tuinen/borderpakketten" },
  { naam: { nl: "Bloemenweide", en: "Flower meadow" }, zin: { nl: "Eén of twee keer per jaar maaien in plaats van elke week.", en: "Mown once or twice a year instead of every week." } },
  { naam: { nl: "Stapelmuurtje", en: "Dry stone wall" }, zin: { nl: "Losse stenen met planten in de kieren: hoogte en schuilplek in één.", en: "Loose stones with plants in the gaps: height and shelter in one." } },
  { naam: { nl: "Gemengde haag", en: "Mixed hedge" }, zin: { nl: "Inheemse struiken in plaats van een schutting: bloesem, bessen en nestplek.", en: "Native shrubs instead of a fence: blossom, berries and nesting space." } },
  { naam: { nl: "Grind en regenwater", en: "Gravel and rainwater" }, zin: { nl: "Minder tegels, zodat de regen in je eigen tuin wegzakt.", en: "Fewer tiles, so the rain soaks into your own garden." } },
  { naam: { nl: "Steen en bestrating", en: "Stone and paving" }, zin: { nl: "Klinkers, tegels, muurtjes en randen: alles wat er kan, elk in één zin.", en: "Pavers, tiles, walls and edges: everything that’s possible, each in one sentence." }, href: "/tuinen/materialen" },
]

const BORDER: BeeldData = {
  soort: "sfeer",
  src: "/borderpakketten/plukborder.jpg",
  width: 1600,
  height: 1200,
  alt: BORDERPAKKETTEN[5].alt.nl,
  en: { alt: BORDERPAKKETTEN[5].alt.en },
}
const TERRASBEELD: BeeldData = { ...TERRAS_FOTOS.reeks[0], soort: "project" }

export default function TuinenPagina() {
  return (
    <div className="ls">
      <Opkomst />
      <Opening label={{ nl: "Tuinen", en: "Gardens" }} titel={{ nl: "Tuinen & renovatie.", en: "Gardens & renovation." }} zin={<T t={ZIN} />} beeld={BEPLANTING} />

      {VERVOLG.nl ? (
        <section className="ls-raster ls-sectie ls-twee" aria-labelledby="tuin-standpunt">
          <div className="ls-twee-kop ls-op">
            <p className="ls-label"><T t={{ nl: "Standpunt", en: "Point of view" }} /></p>
            <h2 id="tuin-standpunt" className="ls-h2"><T t={{ nl: "Eerst kijken. Dan keuzes maken.", en: "First look. Then make choices." }} /></h2>
          </div>
          <div className="ls-twee-inhoud ls-op">
            <p className="w-onthul"><T t={VERVOLG} /></p>
          </div>
        </section>
      ) : null}

      <section className="ls-raster ls-sectie" aria-labelledby="tuin-diensten">
        <div className="ls-sectiekop ls-op">
          <div>
            <p className="ls-label"><T t={{ nl: "Tuindiensten", en: "Garden services" }} /></p>
            <h2 id="tuin-diensten" className="ls-h1"><T t={{ nl: "Van eerste blik tot aanleg.", en: "From first look to build." }} /></h2>
          </div>
        </div>
        {FASEN.map((f) => (
          <div key={f.id} id={f.id} className="ls-fase ls-op">
            <h3 className="ls-label ls-fase-kop"><T t={f.kop} /></h3>
            <div>
              {f.diensten.map((d) => (
                <DienstRij key={d.slug} dienst={d} />
              ))}
            </div>
          </div>
        ))}
        <p className="ls-annotatie ls-diensten-noot">
          <T t={{ nl: "Tik op een dienst: wat erbij hoort, wat niet, en de prijs.", en: "Tap a service: what it includes, what it doesn’t, and the price." }} />
        </p>
      </section>

      <section className="ls-raster ls-sectie" aria-labelledby="tuin-elementen">
        <div className="ls-sectiekop ls-op">
          <div>
            <p className="ls-label"><T t={{ nl: "In een natuurlijke tuin", en: "In a natural garden" }} /></p>
            <h2 id="tuin-elementen" className="ls-h1"><T t={{ nl: "Wat er in een natuurlijke tuin kan.", en: "What a natural garden can hold." }} /></h2>
          </div>
        </div>
        <ul className="ls-elementen">
          {ELEMENTEN.map((e) => {
            const inhoud = (
              <>
                <span className="ls-h3"><T t={e.naam} /></span>
                <span className="ls-body"><T t={e.zin} /></span>
                {e.href ? <Pijl richting="e" className="ls-route-pijl" /> : null}
              </>
            )
            return (
              <li key={e.naam.nl} className="ls-op">
                {e.href ? <Link href={e.href} className="ls-element" transitionTypes={["schuif"]}>{inhoud}</Link> : <div className="ls-element">{inhoud}</div>}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="ls-raster ls-sectie ls-zelf" aria-labelledby="tuin-borders">
        <div className="ls-zelf-tekst ls-op">
          <p className="ls-label"><T t={{ nl: "Zelf aan de slag", en: "Do it yourself" }} /></p>
          <h2 id="tuin-borders" className="ls-h1"><T t={{ nl: "Borderpakketten.", en: "Border packages." }} /></h2>
          <p className="ls-body ls-lees">
            <T t={{ nl: "Een kant-en-klare border voor zon, schaduw, vijverrand of droge grond. Aangeplant of opgestuurd, met het plan erbij.", en: "A ready-made border for sun, shade, a pond edge or dry soil. Planted or shipped, with the plan included." }} />
          </p>
          <ul className="ls-lijnlijst">
            <li><Link href="/tuinen/borderpakketten" transitionTypes={["schuif"]}><T t={{ nl: `Bekijk de ${BORDERPAKKETTEN.length} pakketten`, en: `See the ${BORDERPAKKETTEN.length} packages` }} /> <Pijl richting="e" /></Link></li>
            <li><Link href="/tuinen/materialen" transitionTypes={["schuif"]}><T t={{ nl: "Materialen", en: "Materials" }} /> <Pijl richting="e" /></Link></li>
          </ul>
        </div>
        <Beeld beeld={BORDER} sizes="(min-width: 1024px) 40vw, 100vw" className="ls-zelf-beeld ls-op" labelRechts />
      </section>

      <section className="ls-raster ls-sectie" aria-labelledby="tuin-werk">
        <Link href="/werk/terras-geulle" className="ls-werkkaart ls-werkpagina ls-werkpagina-rechts ls-op" transitionTypes={["schuif"]}>
          <Beeld beeld={TERRASBEELD} sizes="(min-width: 1024px) 66vw, 100vw" className="ls-werkbeeld" decoratief />
          <span className="ls-werkpagina-tekst">
            <span className="ls-label"><T t={{ nl: "Tuinwerk", en: "Garden work" }} /> · {TERRAS.plaats.split(",")[0]}</span>
            <span id="tuin-werk" className="ls-h1 ls-werknaam"><T t={{ nl: TERRAS.titel, en: TERRAS.en.titel }} /></span>
            <span className="ls-tekstlink"><T t={{ nl: "Bekijk het project", en: "View the project" }} /> <Pijl richting="e" /></span>
          </span>
        </Link>
      </section>
    </div>
  )
}
