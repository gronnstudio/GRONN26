import type { Metadata } from "next"
import { DienstKolommen, DienstRij } from "@/components/diensten/dienst-rij"
import { Einde } from "@/components/diensten/einde"
import { diensten, nr } from "@/components/diensten/kies"
import { WerkBlok, WerkKop } from "@/components/diensten/werk-blok"
import { Foto } from "@/components/foto"
import { FOTOS, VIJVER, type Foto as FotoData } from "@/lib/data/vijverrenovatie"

// WF-019 Vijvers, met de open rijen van WF-031.
const VIJVERDIENSTEN = diensten(
  "pond-survey",
  "water-systems",
  "pond-autumn-service",
  "leaf-net",
  "winterising",
  "maintenance-subscription",
)

// De inleiding is de samenvatting van "Vijvers en water".
const INLEIDING = VIJVERDIENSTEN[1].summary.nl

export const metadata: Metadata = {
  title: "Vijvers",
  description: INLEIDING,
}

const F05 = FOTOS.F05 as FotoData
const F10 = FOTOS.F10 as FotoData

export default function VijversPagina() {
  return (
    <div className="wrap">
      <section className="grid grid-cols-1 gap-y-[16px] pt-[clamp(56px,9vw,140px)] md:grid-cols-[3fr_9fr] md:gap-x-[32px] md:gap-y-0">
        <p className="lbl m-0 text-gedempt">Diensten · water</p>
        <h1 className="syne m-0 text-[clamp(48px,7.5vw,104px)] leading-none tracking-[-.04em]">Vijvers</h1>
        <p className="m-0 mt-[8px] max-w-[38ch] text-[clamp(18px,1.7vw,24px)] leading-[1.5] text-gedempt md:col-start-2 md:mt-[28px]">
          {INLEIDING}
        </p>
      </section>

      <section aria-label="Vijverdiensten" className="mt-[clamp(56px,7vw,96px)]">
        <DienstKolommen />
        {VIJVERDIENSTEN.map((d, i) => (
          <DienstRij key={d.slug} nr={nr(i)} dienst={d} />
        ))}
      </section>
      <p className="lbl m-0 mt-[16px] max-w-[60ch] text-gedempt">Tik op een dienst: wat erbij hoort, wat niet, en alle prijzen.</p>

      <div className="mx-[calc(var(--goot)*-1)] my-[clamp(56px,7vw,96px)]">
        <Foto foto={F05} sizes="100vw" className="aspect-[4/3] md:aspect-[21/9]" />
      </div>

      <section aria-labelledby="vijver-werk">
        <WerkKop id="vijver-werk">Vijverwerk</WerkKop>
        <WerkBlok href="/werk/vijverrenovatie">
          <Foto foto={F10} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] md:col-span-5" />
          <div className="md:col-span-6 md:col-start-7">
            <p className="lbl m-0 text-gedempt">
              GR / 001 · {VIJVER.categorie} · {VIJVER.status}
            </p>
            <p className="syne m-0 mt-[16px] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]">{VIJVER.titel}</p>
            <p className="lnk mt-[28px] mb-0 inline-block">Bekijk het project →</p>
          </div>
        </WerkBlok>
      </section>

      <section aria-labelledby="vijver-vraag" className="sectie">
        <p className="lbl m-0 text-gedempt">Vraag</p>
        <h2 id="vijver-vraag" className="syne m-0 mt-[16px] text-[clamp(24px,2.6vw,36px)] tracking-[-.02em]">
          Kan ik alleen hulp met mijn vijver krijgen?
        </h2>
        <p className="m-0 mt-[12px] text-gedempt">Ja. Elk van deze diensten kun je los vragen.</p>
      </section>

      <Einde />
    </div>
  )
}
