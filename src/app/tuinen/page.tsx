import type { Metadata } from "next"
import Link from "next/link"
import { DienstRij } from "@/components/diensten/dienst-rij"
import { Verder } from "@/components/wereld/verder"
import { aantalDiensten, diensten, eersteZinL } from "@/components/diensten/kies"
import { KopRegel, WerkBlok, WerkKop } from "@/components/diensten/werk-blok"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
import { SFEER_WEIDE } from "@/components/voorpagina/beelden"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { BORDERPAKKETTEN } from "@/lib/data/borderpakketten"

// WF-020 Tuinen: de rijen per fase (kijken, ontwerpen, aanleggen), die
// openklappen zoals op Vijvers (WF-031), in de taal van de voorpagina.
const FASEN = [
  { id: "fase-kijken", kop: { nl: "A · Kijken", en: "A · Looking" }, diensten: diensten("consultancy") },
  { id: "fase-ontwerpen", kop: { nl: "B · Ontwerpen", en: "B · Designing" }, diensten: diensten("garden-design", "planting-habitat") },
  { id: "fase-aanleggen", kop: { nl: "C · Aanleggen", en: "C · Building" }, diensten: diensten("garden-transformation", "implementation") },
]

// De inleiding is de samenvatting van Tuinontwerp: de eerste zin in de
// opening, de rest licht op.
const INLEIDING = FASEN[1].diensten[0].summary.nl
const [ZIN, VERVOLG] = eersteZinL(FASEN[1].diensten[0].summary)

export const metadata: Metadata = {
  title: "Tuinen",
  description: INLEIDING,
}

const T02 = TERRAS_FOTOS.reeks[0]
const BORDER_FOTO = {
  src: "/borderpakketten/plukborder.jpg",
  width: 1600,
  height: 1200,
  alt: BORDERPAKKETTEN[5].alt.nl,
  label: "Sfeerbeeld",
  en: { alt: BORDERPAKKETTEN[5].alt.en, label: "Mood image" },
}
const PLAATS = TERRAS.plaats.split(",")[0]

export default function TuinenPagina() {
  // startnummer per fase, zodat de diensten doorlopen (01…05)
  const START = FASEN.map((_, i) => FASEN.slice(0, i).reduce((t, f) => t + f.diensten.length, 0))
  return (
    <>
      {/* Tuinen heeft nog geen eigen foto: het sfeerbeeld draagt zijn label. */}
      <Opening label={{ nl: "Diensten · tuin", en: "Services · garden" }} titel={{ nl: "Tuinen", en: "Gardens" }} zin={<T t={ZIN} />} foto={SFEER_WEIDE} />

      <div className="wrap">
        {VERVOLG.nl ? <Oplichten tekst={VERVOLG} className="m-0 pt-[clamp(64px,8vw,120px)]" /> : null}

        {FASEN.map((f, i) => (
          <section key={f.id} aria-labelledby={f.id} className={i === 0 ? "w-sectie" : "pt-[clamp(56px,7vw,96px)]"}>
            <KopRegel id={f.id} label={f.kop} aantal={aantalDiensten(f.diensten.length)} />
            <div data-zie>
              {f.diensten.map((d, k) => (
                <DienstRij key={d.slug} nr={String(START[i] + k + 1).padStart(2, "0")} dienst={d} />
              ))}
            </div>
          </section>
        ))}
        <p className="lbl m-0 mt-[16px] max-w-[60ch] text-gedempt">
          <T t={{ nl: "Tik op een dienst: wat erbij hoort, wat niet, en de prijs.", en: "Tap a service: what it includes, what it doesn’t, and the price." }} />
        </p>

        <section aria-labelledby="tuin-borders" className="w-sectie">
          <Link href="/tuinen/borderpakketten" className="group grid gap-x-8 gap-y-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className="lbl m-0 text-gedempt"><T t={{ nl: `Nieuw · ${BORDERPAKKETTEN.length} pakketten`, en: `New · ${BORDERPAKKETTEN.length} packages` }} /></p>
              <h2 id="tuin-borders" className="syne mt-4 mb-0 text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={{ nl: "Borderpakketten", en: "Border packages" }} /></h2>
              <p className="mt-5 mb-0 max-w-[48ch] text-[17px] leading-[1.55]">
                <T t={{ nl: "Een kant-en-klare border voor zon, schaduw, vijverrand of droge grond. Aangeplant of opgestuurd, met het plan erbij.", en: "A ready-made border for sun, shade, a pond edge or dry soil. Planted or shipped, with the plan included." }} />
              </p>
              <p className="w-lijnlink mt-[28px] mb-0 inline-block"><T t={{ nl: "Bekijk de pakketten →", en: "See the packages →" }} /></p>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <Foto foto={BORDER_FOTO} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/3] rounded-[16px]" />
            </div>
          </Link>
        </section>

        <section aria-labelledby="tuin-werk" className="w-sectie">
          <WerkKop id="tuin-werk">
            <T t={{ nl: "Tuinwerk", en: "Garden work" }} />
          </WerkKop>
          <WerkBlok href="/werk/terras-geulle">
            <div className="md:col-span-6 md:col-start-1 md:row-start-1">
              <p className="lbl m-0 text-gedempt">
                GR / 002 · <T t={TERRAS.categorie} /> · {PLAATS}
              </p>
              <p className="syne m-0 mt-[16px] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={TERRAS.titel} /></p>
              <p className="w-lijnlink mt-[28px] mb-0 inline-block">
                <T t={{ nl: "Bekijk het project →", en: "View the project →" }} />
              </p>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden md:col-span-5 md:col-start-8 md:row-start-1">
              <div data-v="0.5" className="absolute inset-x-0 -inset-y-[48px]">
                <Foto foto={T02} sizes="(min-width: 768px) 40vw, 100vw" className="h-full" />
              </div>
            </div>
          </WerkBlok>
        </section>
      </div>

      <Verder voor={{ nl: "Benieuwd naar", en: "Curious about" }}
        nadruk={{ nl: "het werk", en: "the work" }}
        na={{ nl: "zelf?", en: "itself?" }}
        href="/werk"
        label={{ nl: "Naar Werk", en: "To Work" }} />
    </>
  )
}
