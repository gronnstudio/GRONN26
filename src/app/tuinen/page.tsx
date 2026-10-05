import type { Metadata } from "next"
import { DienstRij } from "@/components/diensten/dienst-rij"
import { Verder } from "@/components/wereld/verder"
import { aantalDiensten, diensten, eersteZin } from "@/components/diensten/kies"
import { KopRegel, WerkBlok, WerkKop } from "@/components/diensten/werk-blok"
import { Foto } from "@/components/foto"
import { SFEER_WEIDE } from "@/components/voorpagina/beelden"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"

// WF-020 Tuinen: de rijen per fase (kijken, ontwerpen, aanleggen), die
// openklappen zoals op Vijvers (WF-031), in de taal van de voorpagina.
const FASEN = [
  { id: "fase-kijken", kop: "A · Kijken", diensten: diensten("consultancy") },
  { id: "fase-ontwerpen", kop: "B · Ontwerpen", diensten: diensten("garden-design", "planting-habitat") },
  { id: "fase-aanleggen", kop: "C · Aanleggen", diensten: diensten("garden-transformation", "implementation") },
]

// De inleiding is de samenvatting van Tuinontwerp: de eerste zin in de
// opening, de rest licht op.
const INLEIDING = FASEN[1].diensten[0].summary.nl
const [ZIN, VERVOLG] = eersteZin(INLEIDING)

export const metadata: Metadata = {
  title: "Tuinen",
  description: INLEIDING,
}

const T02 = TERRAS_FOTOS.reeks[0]
const PLAATS = TERRAS.plaats.split(",")[0]

export default function TuinenPagina() {
  // startnummer per fase, zodat de diensten doorlopen (01…05)
  const START = FASEN.map((_, i) => FASEN.slice(0, i).reduce((t, f) => t + f.diensten.length, 0))
  return (
    <>
      {/* Tuinen heeft nog geen eigen foto: het sfeerbeeld draagt zijn label. */}
      <Opening label="Diensten · tuin" titel="Tuinen" zin={ZIN} foto={SFEER_WEIDE} />

      <div className="wrap">
        {VERVOLG ? <Oplichten tekst={VERVOLG} className="m-0 pt-[clamp(64px,8vw,120px)]" /> : null}

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
        <p className="lbl m-0 mt-[16px] max-w-[60ch] text-gedempt">Tik op een dienst: wat erbij hoort, wat niet, en de prijs.</p>

        <section aria-labelledby="tuin-werk" className="w-sectie">
          <WerkKop id="tuin-werk">Tuinwerk</WerkKop>
          <WerkBlok href="/werk/terras-geulle">
            <div className="md:col-span-6 md:col-start-1 md:row-start-1">
              <p className="lbl m-0 text-gedempt">
                GR / 002 · {TERRAS.categorie} · {PLAATS}
              </p>
              <p className="syne m-0 mt-[16px] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]">{TERRAS.titel}</p>
              <p className="w-lijnlink mt-[28px] mb-0 inline-block">Bekijk het project →</p>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden md:col-span-5 md:col-start-8 md:row-start-1">
              <div data-v="0.5" className="absolute inset-x-0 -inset-y-[48px]">
                <Foto foto={T02} sizes="(min-width: 768px) 40vw, 100vw" className="h-full" />
              </div>
            </div>
          </WerkBlok>
        </section>
      </div>

      <Verder voor="Benieuwd naar" nadruk="het werk" na="zelf?" href="/werk" label="Naar Werk" />
    </>
  )
}
