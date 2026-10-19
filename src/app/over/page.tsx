import type { Metadata } from "next"
import { Foto } from "@/components/foto"
import { Verder } from "@/components/wereld/verder"
import { PORTRET } from "@/components/over/portret"
import { Zijwaarts } from "@/components/over/zijwaarts"
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
// als groeiende foto, Nicks eigen tekst letterlijk (de eerste alinea licht
// op, de rest rustig leesbaar), Zo werk ik als het raster van de voorpagina
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
        <figure className="w-groei m-0" data-groei>
          <Foto
            foto={PORTRET}
            priority
            sizes="100vw"
            className="aspect-[4/5] md:aspect-[3/2] [&_img]:object-[50%_30%]"
          />
          <figcaption className="lbl mt-4 text-[#a9a8a3]">Nick Peters · GRØNN Studio</figcaption>
        </figure>
      </Opening>

      <section aria-labelledby="h-verhaal" className="wrap w-sectie">
        <div className="w-kopregel">
          <h2 id="h-verhaal" className="lbl m-0 font-normal">Nick Peters</h2>
          <span className="lbl text-gedempt">GRØNN Studio</span>
        </div>
        {/* het hele verhaal licht woord voor woord op (eigenaar, 5 okt 2026: "ga alle teksten na") */}
        <Oplichten tekst={eerste} className="m-0" />
        {/* Het verhaal schuift zijwaarts in hoofdstukken terwijl je naar
            beneden scrolt (eigenaar, 19 okt 2026). Elk hoofdstuk is een alinea
            met haar foto; de tekst licht letter voor letter op en de foto
            schuift om en om van boven en van onder in (18 okt). */}
        <div className="mt-[clamp(40px,5vw,72px)]">
          <Zijwaarts aantal={HOOFDSTUKKEN}>
            {rest.slice(0, HOOFDSTUKKEN).map((alinea, i) => {
              const foto = VERHAAL_FOTOS[i]
              const boven = i % 2 === 0
              return (
                <div key={i} className="w-hoofdstuk">
                  <div className={`w-hoofdstuk-tekst ${boven ? "" : "md:order-2"}`}>
                    <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")} / {String(HOOFDSTUKKEN).padStart(2, "0")}</span>
                    <Oplichten tekst={alinea} className="mt-4 mb-0 text-[clamp(17px,1.5vw,23px)]! leading-[1.55]!" />
                  </div>
                  <figure data-zie={boven ? "boven" : "onder"} className="w-hoofdstuk-foto">
                    <Foto foto={foto} sizes="(min-width: 768px) 50vw, 100vw" className="rounded-[16px]" />
                    {foto.bijschrift ? (
                      <figcaption className="lbl absolute bottom-3 left-3 rounded-full bg-antraciet/80 px-2.5 py-1 text-gebroken-wit">
                        <T t={foto.en?.bijschrift ? { nl: foto.bijschrift, en: foto.en.bijschrift } : foto.bijschrift} />
                      </figcaption>
                    ) : null}
                  </figure>
                </div>
              )
            })}
          </Zijwaarts>
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
