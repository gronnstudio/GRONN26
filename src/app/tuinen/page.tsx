import type { Metadata } from "next"
import { DienstRij } from "@/components/diensten/dienst-rij"
import { Einde } from "@/components/diensten/einde"
import { diensten } from "@/components/diensten/kies"
import { WerkBlok, WerkKop } from "@/components/diensten/werk-blok"
import { Foto, GeenFoto } from "@/components/foto"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"

// WF-020 Tuinen: eerst het beeld, dan de rijen per fase (kijken, ontwerpen,
// aanleggen). De rijen klappen open zoals op Vijvers (WF-031).
const FASEN = [
  { id: "fase-kijken", kop: "A · Kijken", diensten: diensten("consultancy") },
  { id: "fase-ontwerpen", kop: "B · Ontwerpen", diensten: diensten("garden-design", "planting-habitat") },
  { id: "fase-aanleggen", kop: "C · Aanleggen", diensten: diensten("garden-transformation", "implementation") },
]

// De inleiding is de samenvatting van Tuinontwerp.
const INLEIDING = FASEN[1].diensten[0].summary.nl

export const metadata: Metadata = {
  title: "Tuinen",
  description: INLEIDING,
}

const T02 = TERRAS_FOTOS.reeks[0]
const PLAATS = TERRAS.plaats.split(",")[0]

export default function TuinenPagina() {
  let n = 0
  return (
    <div className="wrap">
      <section className="grid grid-cols-1 items-end gap-y-[32px] pt-[clamp(56px,9vw,140px)] md:grid-cols-12 md:gap-x-[32px] md:gap-y-0">
        <div className="md:col-span-5 md:col-start-1 md:row-start-1">
          <p className="lbl m-0 text-gedempt">Diensten · tuin</p>
          <h1 className="syne m-0 mt-[16px] text-[clamp(48px,7.5vw,104px)] leading-none tracking-[-.04em]">Tuinen</h1>
          <p className="m-0 mt-[28px] text-[clamp(18px,1.7vw,22px)] leading-[1.5] text-gedempt">{INLEIDING}</p>
        </div>
        <GeenFoto wat="foto voor Tuinen" className="aspect-[4/5] md:col-span-7 md:col-start-6 md:row-start-1" />
      </section>

      {FASEN.map((f) => (
        <section key={f.id} aria-labelledby={f.id} className="mt-[clamp(56px,7vw,96px)]">
          <h2 id={f.id} className="lbl m-0 mb-[12px] font-normal">
            {f.kop}
          </h2>
          {f.diensten.map((d) => {
            n += 1
            return <DienstRij key={d.slug} nr={String(n).padStart(2, "0")} dienst={d} />
          })}
        </section>
      ))}
      <p className="lbl m-0 mt-[16px] max-w-[60ch] text-gedempt">Tik op een dienst: wat erbij hoort, wat niet, en de prijs.</p>

      <section aria-labelledby="tuin-werk" className="sectie">
        <WerkKop id="tuin-werk">Tuinwerk</WerkKop>
        <WerkBlok href="/werk/terras-geulle">
          <div className="md:col-span-6 md:col-start-1 md:row-start-1">
            <p className="lbl m-0 text-gedempt">
              GR / 002 · {TERRAS.categorie} · {PLAATS}
            </p>
            <p className="syne m-0 mt-[16px] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]">{TERRAS.titel}</p>
            <p className="lnk mt-[28px] mb-0 inline-block">Bekijk het project →</p>
          </div>
          <Foto foto={T02} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[3/4] md:col-span-5 md:col-start-8 md:row-start-1" />
        </WerkBlok>
      </section>

      <Einde />
    </div>
  )
}
