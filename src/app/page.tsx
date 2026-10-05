import type { Metadata } from "next"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { Atelier } from "@/components/voorpagina/atelier"
import { Beweging } from "@/components/voorpagina/beweging"
import { WatIkDoe } from "@/components/voorpagina/wat-ik-doe"
import { Werkwijze } from "@/components/voorpagina/werkwijze"
import "@/components/voorpagina/voorpagina.css"
import { BUSINESS } from "@/lib/business"

// De voorpagina (eigenaar, 5 okt 2026): een samenstelling van wireframes.
// 1 WF-058 opening t/m fotocollage (altijd donker), 2 Zo werk ik uit WF-059,
// 3 Wat ik doe uit WF-057, 4 Kennismaken. Geen werk/projecten, wel foto's.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
}

// WF-058 zet de grote tekst in Montserrat 300; de layout laadt 400–600.
const licht = Montserrat({ subsets: ["latin"], weight: ["300"], variable: "--vp-montserrat-licht" })

export default function Voorpagina() {
  return (
    <>
      <div data-voorpagina className={`vp-wortel ${licht.variable}`}>
        <Atelier />
        <Werkwijze />
        <WatIkDoe />
      </div>

      <section
        aria-labelledby="h-kennis"
        className="mt-[clamp(96px,12vw,180px)] flex flex-col items-center bg-bos px-[var(--goot)] pt-[clamp(56px,7vw,96px)] pb-[clamp(72px,9vw,140px)] text-center text-gebroken-wit"
      >
        <h2 id="h-kennis" className="lbl m-0 font-normal">Kennismaken</h2>
        <Link href="/kennismaken" className="syne mt-5 text-[clamp(44px,6.5vw,88px)] leading-none tracking-[-.035em] no-underline">
          Kennismaken
        </Link>
        <p className="lbl mt-7 mb-0">
          <a href={BUSINESS.emailHref} className="no-underline">{BUSINESS.email}</a> ·{" "}
          <a href={BUSINESS.phoneHref} className="no-underline">{BUSINESS.phone}</a> · {BUSINESS.address.city} en omgeving
        </p>
      </section>
      <Beweging />
    </>
  )
}
