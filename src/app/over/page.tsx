import type { Metadata } from "next"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Beeld } from "@/components/landschap/beeld"
import { Opkomst } from "@/components/landschap/opkomst"
import { NICK, type Beeld as BeeldData } from "@/components/landschap/beelden"
import { LandschapWerkwijze } from "@/components/landschap/voorpagina"
import "@/components/landschap/landschap.css"
import { OVER_MIJ } from "@/lib/data/teksten"
import { FOTOS, fotosVoor, type Foto as FotoData } from "@/lib/data/vijverrenovatie"

const MOESTUIN: FotoData = {
  src: "/studio/moestuin/M01.jpg",
  width: 600,
  height: 800,
  alt: "Nick gehurkt in de moestuin, lachend, met een handvol pas gerooide aardappels.",
  bijschrift: "In de moestuin.",
  en: { alt: "Nick crouching in the vegetable garden, laughing, with a handful of freshly dug potatoes.", bijschrift: "In the vegetable garden." },
}

// Na elke alinea één echte foto van Nick of zijn werk, passend bij wat er
// staat; de laatste korte alinea loopt zonder foto door naar het slot.
const VERHAAL_FOTOS: FotoData[] = [
  FOTOS.F01 as FotoData, // kijken naar licht, water en beplanting
  FOTOS.F11 as FotoData, // bouwen met de handen
  MOESTUIN, // buiten rust vinden
  fotosVoor("F09")[0], // zorgvuldig werken
  FOTOS.F10 as FotoData, // bodem, water en planten die bij de plek passen
  fotosVoor("F08")[1], // vaak ook modder
]
const eigen = (f: FotoData): BeeldData => ({ ...f, soort: f.src.includes("/studio/") ? "studio" : "project" })

// Studio in de taal van de voorpagina (bouwbrief, 21 nov 2026): opening met
// Nicks eerste zin en het portret, daarna zijn eigen tekst letterlijk in
// hoofdstukken met een eigen foto, om en om, en de werkwijze van de voorpagina.
// Bijschriften staan onder de foto, nooit erop.
export const metadata: Metadata = {
  title: "Over mij",
  description: OVER_MIJ[0].nl,
}

export default function Over() {
  const [eerste, ...rest] = OVER_MIJ
  const metFoto = rest.slice(0, VERHAAL_FOTOS.length)
  const zonder = rest.slice(VERHAAL_FOTOS.length)
  return (
    <div className="ls">
      <Opkomst />
      <Opening
        label="Studio"
        titel={{ nl: "Van ontwerp tot uitvoering: één aanspreekpunt.", en: "From design to build: one point of contact." }}
        zin={<T t={{ nl: "Hovenier en ecologisch ontwerper, in Stein en omgeving.", en: "Gardener and ecological designer, in and around Stein." }} />}
      >
        <div className="ls-portret-opening">
          <p className="w-onthul"><T t={eerste} /></p>
          <Beeld beeld={NICK} priority sizes="(min-width: 1024px) 50vw, 100vw" className="ls-portret-beeld" />
        </div>
      </Opening>

      <section className="ls-raster ls-sectie" aria-labelledby="h-verhaal">
        <div className="ls-sectiekop ls-op">
          <div>
            <p className="ls-label">Nick Peters</p>
            <h2 id="h-verhaal" className="ls-h1"><T t={{ nl: "Waar ik vandaan kom.", en: "Where I come from." }} /></h2>
          </div>
        </div>
        <div className="ls-verhaal">
          {metFoto.map((alinea, i) => {
            const foto = VERHAAL_FOTOS[i]
            return (
              <div key={i} className="ls-hoofdstuk">
                <p className="ls-body ls-hoofdstuk-tekst ls-hoofdstuk-groot ls-op"><T t={alinea} /></p>
                <figure className="ls-hoofdstuk-fig ls-op">
                  <Beeld beeld={eigen(foto)} sizes="(min-width: 1024px) 50vw, 100vw" className="ls-hoofdstuk-beeld" />
                  {foto.bijschrift ? (
                    <figcaption className="ls-annotatie">
                      <T t={foto.en?.bijschrift ? { nl: foto.bijschrift, en: foto.en.bijschrift } : foto.bijschrift} />
                    </figcaption>
                  ) : null}
                </figure>
              </div>
            )
          })}
        </div>
        {zonder.map((alinea, i) => (
          <p key={i} className="ls-h2 ls-verhaal-slot ls-op"><T t={alinea} /></p>
        ))}
      </section>

      <LandschapWerkwijze />
    </div>
  )
}
