import type { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/business"
import { VIJVER } from "@/lib/data/vijverrenovatie"
import { TERRAS } from "@/lib/data/terras-geulle"

export const metadata: Metadata = {
  title: "Links",
  description: "Alle wegen naar GRØNN Studio op één plek.",
  robots: { index: false, follow: true },
}

const TEGEL = "group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-[6px] border border-lijn bg-vlak p-5 no-underline text-inkt transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
const NAAM = "syne text-[clamp(19px,1.8vw,24px)] leading-[1.1] tracking-[-.02em]"
const Pijl = () => <span aria-hidden className="self-end text-[18px] transition-transform duration-300 group-hover:translate-x-1">→</span>

// De linkpagina (eigenaar: "een soort bentobox linktree"), in de taal van de
// nieuwe site. Zonder menu en voet: zie [data-links] in globals.css.
export default function Links() {
  return (
    <div data-links className="mx-auto max-w-[760px] px-4 pt-[clamp(24px,6vw,64px)] pb-12">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="col-span-2 flex items-center gap-4 rounded-[6px] bg-antraciet p-5 text-gebroken-wit md:col-span-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nick/portret-espresso.jpg" alt="Nick Peters" className="size-[72px] shrink-0 rounded-full object-cover" />
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="mb-2 h-[15px] w-auto" />
            <p className="m-0 text-[14px] leading-[1.5] opacity-80">Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.</p>
          </div>
        </div>

        <Link href="/kennismaken" className={`${TEGEL} col-span-2 border-0 bg-oranje! text-antraciet!`}>
          <span className="lbl">Vrijblijvend</span>
          <span className={NAAM}>Kennismaken</span>
          <Pijl />
        </Link>
        <a href={BUSINESS.whatsapp} className={TEGEL}><span className="lbl text-gedempt">Bericht</span><span className={NAAM}>WhatsApp</span></a>
        <a href={BUSINESS.emailHref} className={TEGEL}><span className="lbl text-gedempt">Mail</span><span className={`${NAAM} break-all text-[16px]!`}>{BUSINESS.email}</span></a>

        <Link href="/werk/vijverrenovatie" className={`${TEGEL} col-span-2 min-h-[220px] border-0 p-0 text-gebroken-wit! md:row-span-2`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/projecten/vijverrenovatie/F01.jpg" alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-x-0 bottom-0 rounded-b-[6px] bg-gradient-to-t from-black/75 to-transparent p-5 pt-16">
            <span className="lbl block opacity-80">Project · Vijverrenovatie</span>
            <span className={`${NAAM} block`}>{VIJVER.titel}</span>
          </span>
        </Link>
        <Link href="/werk/terras-geulle" className={`${TEGEL} col-span-2 min-h-[160px] border-0 p-0 text-gebroken-wit!`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/projecten/terras-geulle/T01.jpg" alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-x-0 bottom-0 rounded-b-[6px] bg-gradient-to-t from-black/75 to-transparent p-5 pt-16">
            <span className="lbl block opacity-80">Project · Geulle</span>
            <span className={`${NAAM} block`}>{TERRAS.titel}</span>
          </span>
        </Link>
        <a href={BUSINESS.phoneHref} className={TEGEL}><span className="lbl text-gedempt">Bellen</span><span className={`${NAAM} text-[17px]!`}>{BUSINESS.phone}</span></a>
        <a href={BUSINESS.instagram} className={TEGEL}><span className="lbl text-gedempt">Volgen</span><span className={NAAM}>Instagram</span></a>

        <Link href="/" className={`${TEGEL} col-span-2 border-0 bg-antraciet! text-gebroken-wit! md:col-span-4 md:min-h-0 md:flex-row md:items-center`}>
          <span className={NAAM}>Naar de website</span>
          <Pijl />
        </Link>
      </div>
    </div>
  )
}
