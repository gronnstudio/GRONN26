import Link from "next/link"
import { BUSINESS } from "@/lib/business"
import { Logo } from "./logo"
import { Kopieer } from "./kopieer"
import { T, type Tekst } from "./taal"

const PAGINAS: [string, Tekst][] = [
  ["/vijvers", { nl: "Vijvers", en: "Ponds" }],
  ["/tuinen", { nl: "Tuinen", en: "Gardens" }],
  ["/werk", { nl: "Werk", en: "Work" }],
  ["/over", { nl: "Over", en: "About" }],
  ["/kennismaken", { nl: "Kennismaken", en: "Get in touch" }],
  ["/faq", { nl: "Veelgestelde vragen", en: "FAQ" }],
]

// Voet A uit de wireframes (WF-027, colofon in vier kolommen), in de taal van
// de site: donker zoals de opening (de voet van Kolenda/Uncode), Montserrat
// met Syne Bold alleen in het woordmerk, links die aangroeien. Sluit naadloos
// aan op het bosgroene Kennismaken-vlak (#h-kennis); staat dat er niet, dan
// komt er ruimte boven. De ruimte onder de body (voor het menu) valt binnen
// de voet, zodat er onderaan geen lichte rand overblijft.
export function Voet() {
  const a = BUSINESS.address
  return (
    <footer className="border-t border-lijn mt-[clamp(96px,12vw,180px)] mb-[-110px] bg-grond pt-[clamp(56px,7vw,96px)] pb-[calc(110px+clamp(28px,4vw,48px))] text-inkt">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
          <div>
            <p className="lbl m-0 text-gedempt">Studio</p>
            <p className="mt-4 mb-0 leading-[1.75]">
              {BUSINESS.name}
              <br />
              {a.street}
              <br />
              {a.postalCode} {a.city}
            </p>
          </div>
          <div className="min-w-0">
            <p className="lbl m-0 text-gedempt">Contact</p>
            <ul className="mt-4 mb-0 list-none space-y-1.5 p-0 leading-[1.6]">
              <li>
                <a href={BUSINESS.emailHref} className="w-lijnlink [overflow-wrap:anywhere]">{BUSINESS.email}</a>
              </li>
              <li>
                <a href={BUSINESS.phoneHref} className="w-lijnlink tabular-nums">{BUSINESS.phone}</a>
              </li>
              <li>
                <a href={BUSINESS.instagram} className="w-lijnlink">Instagram</a> ·{" "}
                <a href={BUSINESS.whatsapp} className="w-lijnlink">WhatsApp</a>
              </li>
            </ul>
          </div>
          <nav aria-labelledby="voet-paginas">
            <p id="voet-paginas" className="lbl m-0 text-gedempt"><T t={{ nl: "Pagina’s", en: "Pages" }} /></p>
            <ul className="mt-4 mb-0 list-none space-y-1.5 p-0 leading-[1.6]">
              {PAGINAS.map(([h, t]) => (
                <li key={h}>
                  <Link href={h} className="w-lijnlink"><T t={t} /></Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="lbl m-0 text-gedempt"><T t={{ nl: "Klein", en: "Small print" }} /></p>
            <p className="mt-4 mb-0 leading-[1.75]">
              <Link href="/privacy" className="w-lijnlink text-inkt">Privacy</Link>
              <br />
              <Link href="/voorwaarden" className="w-lijnlink text-inkt"><T t={{ nl: "Voorwaarden", en: "Terms" }} /></Link>
              <br />
              <Link href="/herroeping" className="w-lijnlink text-inkt"><T t={{ nl: "Herroeping", en: "Withdrawal" }} /></Link>
              <br />
              <Link href="/colofon" className="w-lijnlink text-inkt"><T t={{ nl: "Colofon", en: "Colophon" }} /></Link>
              <br />
              <Link href="/merk" className="w-lijnlink text-inkt"><T t={{ nl: "Merk", en: "Brand" }} /></Link>
            </p>
          </div>
        </div>

        {/* het reuzenwoordmerk, met rechts in de lege ruimte KVK en BTW om te kopiëren (eigenaar, 5 okt 2026) */}
        <div className="mt-[clamp(56px,8vw,120px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t border-lijn pt-[clamp(28px,4vw,48px)]">
          <Logo className="h-auto w-full max-w-[1100px] lg:w-[68%]" />
          <div className="flex flex-col items-start gap-2 text-sm lg:items-end lg:pb-[1%]">
            <Kopieer label="KVK" waarde={BUSINESS.kvk} />
            <Kopieer label="BTW" waarde={BUSINESS.btw} />
          </div>
        </div>
      </div>
    </footer>
  )
}
