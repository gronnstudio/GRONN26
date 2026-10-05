import type { Metadata } from "next"
import { DienstKolommen, DienstRij } from "@/components/diensten/dienst-rij"
import { Verder } from "@/components/wereld/verder"
import { aantalDiensten, diensten, eersteZin, nr } from "@/components/diensten/kies"
import { KopRegel, WerkBlok, WerkKop } from "@/components/diensten/werk-blok"
import { Foto } from "@/components/foto"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { FOTOS, VIJVER, type Foto as FotoData } from "@/lib/data/vijverrenovatie"

// WF-019 Vijvers, met de open rijen van WF-031, in de taal van de voorpagina:
// donkere opening, tekst die oplicht, blokken die zacht opkomen.
const VIJVERDIENSTEN = diensten(
  "pond-survey",
  "water-systems",
  "pond-autumn-service",
  "leaf-net",
  "winterising",
  "maintenance-subscription",
)

// De inleiding is de samenvatting van "Vijvers en water": de eerste zin in de
// opening, de rest licht op.
const INLEIDING = VIJVERDIENSTEN[1].summary.nl
const [ZIN, VERVOLG] = eersteZin(INLEIDING)

export const metadata: Metadata = {
  title: "Vijvers",
  description: INLEIDING,
}

const F01 = FOTOS.F01 as FotoData
const F05 = FOTOS.F05 as FotoData
const F10 = FOTOS.F10 as FotoData

export default function VijversPagina() {
  return (
    <>
      <Opening label="Diensten · water" titel="Vijvers" zin={ZIN} foto={F01} />

      <div className="wrap">
        {VERVOLG ? <Oplichten tekst={VERVOLG} className="m-0 pt-[clamp(64px,8vw,120px)]" /> : null}

        <section aria-labelledby="vijver-diensten" className="w-sectie">
          <KopRegel id="vijver-diensten" label="Vijverdiensten" aantal={aantalDiensten(VIJVERDIENSTEN.length)} />
          <div data-zie>
            <DienstKolommen />
            {VIJVERDIENSTEN.map((d, i) => (
              <DienstRij key={d.slug} nr={nr(i)} dienst={d} />
            ))}
          </div>
          <p className="lbl m-0 mt-[16px] max-w-[60ch] text-gedempt">Tik op een dienst: wat erbij hoort, wat niet, en alle prijzen.</p>
        </section>
      </div>

      <div className="relative my-[clamp(96px,12vw,180px)] aspect-[4/3] overflow-hidden md:aspect-[21/9]">
        <div data-v="0.5" className="absolute inset-x-0 -inset-y-[48px]">
          <Foto foto={F05} sizes="100vw" className="h-full" />
        </div>
      </div>

      <div className="wrap">
        <section aria-labelledby="vijver-werk">
          <WerkKop id="vijver-werk">Vijverwerk</WerkKop>
          <WerkBlok href="/werk/vijverrenovatie">
            <Foto foto={F10} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] md:col-span-5" />
            <div className="md:col-span-6 md:col-start-7">
              <p className="lbl m-0 text-gedempt">
                GR / 001 · {VIJVER.categorie} · {VIJVER.status}
              </p>
              <p className="syne m-0 mt-[16px] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]">{VIJVER.titel}</p>
              <p className="w-lijnlink mt-[28px] mb-0 inline-block">Bekijk het project →</p>
            </div>
          </WerkBlok>
        </section>

        <section aria-labelledby="vijver-vraag" className="w-sectie">
          <div className="w-kopregel">
            <p className="lbl m-0">Vraag</p>
          </div>
          <h2 id="vijver-vraag" className="w-titel max-w-[18ch]" data-zie>
            Kan ik alleen hulp met mijn vijver krijgen?
          </h2>
          <Oplichten tekst="Ja. Elk van deze diensten kun je los vragen." className="m-0 mt-[clamp(20px,2.5vw,36px)]" />
        </section>
      </div>

      <Verder voor="Ook" nadruk="de tuin" na="eromheen?" href="/tuinen" label="Naar Tuinen" />
    </>
  )
}
