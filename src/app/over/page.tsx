import type { Metadata } from "next"
import { Foto } from "@/components/foto"
import { Verder } from "@/components/wereld/verder"
import { PORTRET } from "@/components/over/portret"
import { Werkwijze } from "@/components/voorpagina/werkwijze"
import "@/components/voorpagina/voorpagina.css"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
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
// staat; de laatste twee korte alinea's lopen zonder foto door naar het slot.
const VERHAAL_FOTOS: FotoData[] = [
  FOTOS.F01 as FotoData, // kijken naar licht, water en beplanting
  FOTOS.F11 as FotoData, // bouwen met de handen
  MOESTUIN, // buiten rust vinden
  fotosVoor("F09")[0], // zorgvuldig werken
  FOTOS.F10 as FotoData, // bodem, water en planten die bij de plek passen
  fotosVoor("F08")[1], // vaak ook modder
]
const HOOFDSTUKKEN = VERHAAL_FOTOS.length

// Over mij in de taal van de voorpagina: donkere opening met het portret
// groot, Nicks eigen tekst letterlijk, Zo werk ik als het raster van de voorpagina
// en het bosgroene Kennismaken-vlak.
export const metadata: Metadata = {
  title: "Over mij",
  description: OVER_MIJ[0].nl,
}

export default function Over() {
  const [eerste, ...rest] = OVER_MIJ
  return (
    <>
      <Opening label={{ nl: "Hovenier en ecologisch ontwerper", en: "Gardener and ecological designer" }} titel={{ nl: "Over mij", en: "About me" }}>
        {/* Het portret staat rechtop; daarom een eigen kader (3:2, op de
            telefoon 4:5) met het gezicht in beeld, in plaats van 16:9. */}
        <figure className="w-groei m-0">
          <Foto
            foto={PORTRET}
            priority
            sizes="100vw"
            className="aspect-[4/5] md:aspect-[3/2] [&_img]:object-[50%_30%]"
          />
          <figcaption className="lbl mt-4 text-gedempt">Nick Peters · GRØNN Studio</figcaption>
        </figure>
      </Opening>

      <section aria-labelledby="h-verhaal" className="wrap w-sectie">
        <div className="w-kopregel">
          <h2 id="h-verhaal" className="lbl m-0 font-normal">Nick Peters</h2>
          <span className="lbl text-gedempt">GRØNN Studio</span>
        </div>
        <Oplichten tekst={eerste} className="m-0" />
        {/* Het verhaal in hoofdstukken onder elkaar: elke alinea met haar
            foto, om en om links en rechts (versimpeld 24 okt 2026; schoof
            sinds 19 okt zijwaarts). */}
        <div className="mt-[clamp(40px,5vw,72px)]">
            {rest.slice(0, HOOFDSTUKKEN).map((alinea, i) => {
              const foto = VERHAAL_FOTOS[i]
              const boven = i % 2 === 0
              return (
                <div key={i} className="w-hoofdstuk">
                  <div className={`w-hoofdstuk-tekst ${boven ? "" : "md:order-2"}`}>
                    <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")} / {String(HOOFDSTUKKEN).padStart(2, "0")}</span>
                    <Oplichten tekst={alinea} className="mt-4 mb-0 text-[clamp(17px,1.5vw,23px)]! leading-[1.55]!" />
                  </div>
                  <figure className="w-hoofdstuk-foto">
                    <Foto foto={foto} sizes="(min-width: 768px) 50vw, 100vw" className="h-full" />
                    {foto.bijschrift ? (
                      <figcaption className="lbl absolute bottom-3 left-3 rounded-full bg-antraciet/80 px-2.5 py-1 text-gebroken-wit">
                        <T t={foto.en?.bijschrift ? { nl: foto.bijschrift, en: foto.en.bijschrift } : foto.bijschrift} />
                      </figcaption>
                    ) : null}
                  </figure>
                </div>
              )
            })}
          {rest.slice(HOOFDSTUKKEN).map((alinea, i) => (
            <div key={i} className="mx-auto max-w-[680px] py-[6svh]">
              <Oplichten tekst={alinea} className="m-0 text-[clamp(18px,1.6vw,24px)]! leading-[1.6]!" />
            </div>
          ))}
        </div>
      </section>

      <div className="vp-wortel">
        <Werkwijze />
      </div>

      <Verder
        voor={{ nl: "Zullen we", en: "Shall we" }}
        nadruk={{ nl: "kennismaken", en: "meet" }}
        na="?"
        href="/kennismaken"
        label={{ nl: "Naar Kennismaken", en: "To Get in touch" }}
      />
    </>
  )
}
