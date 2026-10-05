import type { Metadata } from "next"
import { DienstKolommen, DienstRij } from "@/components/diensten/dienst-rij"
import { Verder } from "@/components/wereld/verder"
import { aantalDiensten, diensten, eersteZinL, nr } from "@/components/diensten/kies"
import { KopRegel, WerkBlok, WerkKop } from "@/components/diensten/werk-blok"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
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
const [ZIN, VERVOLG] = eersteZinL(VIJVERDIENSTEN[1].summary)

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
      <Opening label={{ nl: "Diensten · water", en: "Services · water" }} titel={{ nl: "Vijvers", en: "Ponds" }} zin={<T t={ZIN} />} foto={F01} />

      <div className="wrap">
        {VERVOLG.nl ? <Oplichten tekst={VERVOLG} className="m-0 pt-[clamp(64px,8vw,120px)]" /> : null}

        <section aria-labelledby="vijver-diensten" className="w-sectie">
          <KopRegel id="vijver-diensten" label={{ nl: "Vijverdiensten", en: "Pond services" }} aantal={aantalDiensten(VIJVERDIENSTEN.length)} />
          <div data-zie>
            <DienstKolommen />
            {VIJVERDIENSTEN.map((d, i) => (
              <DienstRij key={d.slug} nr={nr(i)} dienst={d} />
            ))}
          </div>
          <p className="lbl m-0 mt-[16px] max-w-[60ch] text-gedempt">
            <T t={{ nl: "Tik op een dienst: wat erbij hoort, wat niet, en alle prijzen.", en: "Tap a service: what it includes, what it doesn’t, and all the prices." }} />
          </p>
        </section>
      </div>

      <div className="relative my-[clamp(96px,12vw,180px)] aspect-[4/3] overflow-hidden md:aspect-[21/9]">
        <div data-v="0.5" className="absolute inset-x-0 -inset-y-[48px]">
          <Foto foto={F05} sizes="100vw" className="h-full" />
        </div>
      </div>

      <div className="wrap">
        <section aria-labelledby="vijver-werk">
          <WerkKop id="vijver-werk">
            <T t={{ nl: "Vijverwerk", en: "Pond work" }} />
          </WerkKop>
          <WerkBlok href="/werk/vijverrenovatie">
            <Foto foto={F10} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] md:col-span-5" />
            <div className="md:col-span-6 md:col-start-7">
              <p className="lbl m-0 text-gedempt">
                GR / 001 · <T t={VIJVER.categorie} /> · <T t={VIJVER.status} />
              </p>
              <p className="syne m-0 mt-[16px] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={VIJVER.titel} /></p>
              <p className="w-lijnlink mt-[28px] mb-0 inline-block">
                <T t={{ nl: "Bekijk het project →", en: "View the project →" }} />
              </p>
            </div>
          </WerkBlok>
        </section>

        <section aria-labelledby="vijver-vraag" className="w-sectie">
          <div className="w-kopregel">
            <p className="lbl m-0">
              <T t={{ nl: "Vraag", en: "Question" }} />
            </p>
          </div>
          <h2 id="vijver-vraag" className="w-titel max-w-[18ch]" data-zie>
            <T t={{ nl: "Kan ik alleen hulp met mijn vijver krijgen?", en: "Can I get help with just my pond?" }} />
          </h2>
          <Oplichten tekst={{ nl: "Ja. Elk van deze diensten kun je los vragen.", en: "Yes. You can ask for each of these services on its own." }} className="m-0 mt-[clamp(20px,2.5vw,36px)]" />
        </section>
      </div>

      <Verder voor={{ nl: "Ook", en: "The garden" }}
        nadruk={{ nl: "de tuin", en: "around it" }}
        na={{ nl: "eromheen?", en: "too?" }}
        href="/tuinen"
        label={{ nl: "Naar Tuinen", en: "To Gardens" }} />
    </>
  )
}
