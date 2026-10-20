import type { Metadata } from "next"
import Link from "next/link"
import { KopRegel } from "@/components/diensten/werk-blok"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { MATERIAALGROEPEN } from "@/lib/data/materialen"

export const metadata: Metadata = {
  title: "Materialen",
  description: "Welke bestrating, tegels, stenen en randen er mogelijk zijn in je tuin, elk in één zin uitgelegd. Samen kijken in een showtuin bij Sittard.",
  alternates: { canonical: "/tuinen/materialen" },
}

// Materialen (eigenaar, 20 okt 2026): wat er aan steen en buitenmateriaal kan,
// zodat een klant ziet wat mogelijk is. Alleen naam en één zin, net als de
// elementen op Tuinen; geen beelden zolang er geen eigen foto's zijn.
export default function MaterialenPagina() {
  const aantal = MATERIAALGROEPEN.reduce((t, g) => t + g.materialen.length, 0)
  return (
    <>
      <Opening
        label={{ nl: "Diensten · tuin", en: "Services · garden" }}
        titel={{ nl: "Materialen", en: "Materials" }}
        zin={<T t={{ nl: `${aantal} soorten steen en buitenmateriaal, elk in één zin. Zo zie je wat er in jouw tuin kan.`, en: `${aantal} kinds of stone and outdoor material, each in one sentence. So you can see what is possible in your garden.` }} />}
      />

      <div className="wrap">
        {MATERIAALGROEPEN.map((g, i) => (
          <section key={g.id} aria-labelledby={`materiaal-${g.id}`} className={i === 0 ? "pt-[48px]" : "w-sectie"}>
            <KopRegel id={`materiaal-${g.id}`} label={g.kop} aantal={{ nl: `${g.materialen.length} soorten`, en: `${g.materialen.length} kinds` }} />
            <ul data-zie className="m-0 grid list-none grid-cols-1 gap-x-[16px] p-0 sm:grid-cols-2 md:gap-x-[32px] lg:grid-cols-3">
              {g.materialen.map((m) => (
                <li key={m.naam.nl} className="border-t border-lijn py-[16px] md:py-[24px]">
                  <span className="syne block text-[clamp(17px,1.8vw,24px)] leading-[1.15] tracking-[-.015em] [overflow-wrap:anywhere]"><T t={m.naam} /></span>
                  <span className="mt-[6px] block max-w-[40ch] text-[.875rem] leading-[1.5] text-gedempt md:mt-[8px] md:text-base md:leading-[1.6]"><T t={m.zin} /></span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="materiaal-kijken" className="w-sectie">
          <h2 id="materiaal-kijken" className="syne m-0 max-w-[20ch] text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]">
            <T t={{ nl: "Liever zien en voelen?", en: "Rather see and feel it?" }} />
          </h2>
          <p className="mt-5 mb-0 max-w-[52ch] text-[17px] leading-[1.55]">
            <T t={{ nl: "Bij Sittard ligt een showtuin met bijna alles van deze pagina. We gaan er samen kijken, dan kies je met de steen in je hand.", en: "Near Sittard there is a show garden with almost everything on this page. We go and look together, so you choose with the stone in your hand." }} />
          </p>
          <Link href="/kennismaken" className="knop mt-[28px] inline-flex bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">
            <T t={{ nl: "Plan een kennismaking →", en: "Plan an introduction →" }} />
          </Link>
        </section>
      </div>

      <Verder voor={{ nl: "Meer over", en: "More about" }}
        nadruk={{ nl: "natuurlijke tuinen", en: "natural gardens" }}
        href="/tuinen"
        label={{ nl: "Naar Tuinen", en: "To Gardens" }} />
    </>
  )
}
