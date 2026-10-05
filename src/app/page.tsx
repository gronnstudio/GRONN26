import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { Stappen } from "@/components/stappen"
import { Hoofdstuk } from "@/components/voorpagina/hoofdstuk"
import { Waterroute } from "@/components/voorpagina/waterroute"
import { PORTRET } from "@/components/over/portret"
import { BUSINESS } from "@/lib/business"
import { fotosVoor } from "@/lib/data/vijverrenovatie"

// WF-025, zonder werk (eigenaar, 4 okt 2026): opening met F10, drie foto's
// zonder projectnamen, de waterroute, 01 Over, 02 Zo werk ik, 03 Kennismaken.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
}

const F01 = fotosVoor("F01")[0]
const F08_2 = fotosVoor("F08")[1]
const F11 = fotosVoor("F11")[0]
const F10 = fotosVoor("F10")[0]

export default function Voorpagina() {
  return (
    <>
      <div className="wrap">
        <section aria-labelledby="kop" className="grid items-end gap-8 pt-[clamp(48px,7vw,96px)] md:grid-cols-[7fr_5fr]">
          <div>
            <p className="lbl m-0 text-gedempt">Vijvers en tuinen · Stein en omgeving</p>
            <h1 id="kop" className="syne mt-5 mb-0 text-[clamp(44px,7.2vw,104px)] leading-[.98] tracking-[-.04em]">
              Een vijver en tuin die gezond blijven.
            </h1>
          </div>
          <div className="flex flex-col gap-5 max-md:order-first">
            <Foto foto={F10} priority sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/3]" />
            <p className="m-0 text-[clamp(16px,1.25vw,18px)] leading-[1.6] text-gedempt">
              Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf.
            </p>
          </div>
        </section>

        <section aria-label="Beeld" className="sectie">
          <Foto foto={F01} sizes="100vw" className="aspect-[4/3] md:aspect-[21/9]" />
          <div className="mt-3 grid grid-cols-2 items-end gap-3 md:mt-8 md:grid-cols-[5fr_7fr] md:gap-8">
            <Foto foto={F08_2} sizes="(min-width: 768px) 40vw, 50vw" className="aspect-[3/4] md:aspect-[4/5]" />
            <Foto foto={F11} sizes="(min-width: 768px) 55vw, 50vw" className="aspect-[3/4] md:aspect-[4/3]" />
          </div>
        </section>

        <section aria-labelledby="h-route" className="sectie">
          <div className="grid gap-y-6 md:grid-cols-[7fr_1fr_4fr] md:items-center">
            <figure className="m-0">
              <Waterroute />
              <figcaption className="lbl mt-4 flex flex-wrap gap-x-6 gap-y-2 text-gedempt">
                <span>— aanvoer onder druk</span>
                <span>- - - terug onder vrij verval</span>
              </figcaption>
            </figure>
            <div className="md:col-start-3">
              <h2 id="h-route" className="lbl m-0 font-normal">De waterroute</h2>
              <p className="mt-4 mb-0 leading-[1.6] text-gedempt">
                Vanuit vijver B gaat het water via de pomp naar het driekamerfilter. Na de filtratie wordt het verdeeld over twee takken: één richting vijver A en één richting de waterval.
              </p>
              <p className="mt-4 mb-0 leading-[1.6] text-gedempt">
                Het water van de waterval loopt via de beekloop terug naar vijver B. Vijver A voert via de afvoer- en overloopverbinding terug naar vijver B.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="h-over" className="sectie">
          <Hoofdstuk id="h-over">01 — Over</Hoofdstuk>
          <div className="grid gap-y-8 md:grid-cols-[4fr_1fr_7fr] md:items-center">
            <Foto foto={PORTRET} sizes="(min-width: 768px) 30vw, 70vw" className="aspect-[4/5] w-[70%] md:w-auto" />
            <div className="md:col-start-3">
              <p className="syne m-0 text-[clamp(36px,5vw,72px)] leading-[1.02] tracking-[-.03em]">
                Ik denk in beelden, patronen en verbanden.
              </p>
              <p className="mt-6 mb-0 max-w-[44ch] leading-[1.6] text-gedempt">
                Als ik naar een tuin kijk, zie ik hoe licht, water, materialen en beplanting elkaar beïnvloeden.
              </p>
              <p className="mt-8 mb-0">
                <Link href="/over" className="lnk">Meer over GRØNN →</Link>
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="h-stappen" className="sectie">
          <Hoofdstuk id="h-stappen" rechts="6 stappen" onder={false}>02 — Zo werk ik</Hoofdstuk>
          <Stappen />
        </section>
      </div>

      <section
        aria-labelledby="h-kennis"
        className="mt-[clamp(96px,12vw,180px)] flex flex-col items-center bg-bos px-[var(--goot)] pt-[clamp(56px,7vw,96px)] pb-[clamp(72px,9vw,140px)] text-center text-gebroken-wit"
      >
        <h2 id="h-kennis" className="lbl m-0 font-normal">03 — Kennismaken</h2>
        <Link href="/kennismaken" className="syne mt-5 text-[clamp(44px,6.5vw,88px)] leading-none tracking-[-.035em] no-underline">
          Kennismaken
        </Link>
        <p className="lbl mt-7 mb-0">
          <a href={BUSINESS.emailHref} className="no-underline">{BUSINESS.email}</a> ·{" "}
          <a href={BUSINESS.phoneHref} className="no-underline">{BUSINESS.phone}</a> · {BUSINESS.address.city} en omgeving
        </p>
      </section>
    </>
  )
}
