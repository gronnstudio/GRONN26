import Link from "next/link"
import { BUSINESS } from "@/lib/business"
import { Logo } from "./logo"

const PAGINAS: [string, string][] = [
  ["/vijvers", "Vijvers"],
  ["/tuinen", "Tuinen"],
  ["/werk", "Werk"],
  ["/over", "Over"],
  ["/kennismaken", "Kennismaken"],
  ["/faq", "Veelgestelde vragen"],
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
    <footer className="donker border-t border-lijn mt-[clamp(96px,12vw,180px)] mb-[-110px] bg-grond pt-[clamp(56px,7vw,96px)] pb-[calc(110px+clamp(28px,4vw,48px))] text-inkt [main:has(#h-kennis)+&]:mt-0">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
          <div>
            <p className="lbl m-0 text-salie">Studio</p>
            <p className="mt-4 mb-0 leading-[1.75]">
              {BUSINESS.name}
              <br />
              {a.street}
              <br />
              {a.postalCode} {a.city}
            </p>
          </div>
          <div className="min-w-0">
            <p className="lbl m-0 text-salie">Contact</p>
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
          <nav aria-label="Pagina's">
            <p className="lbl m-0 text-salie">Pagina&apos;s</p>
            <ul className="mt-4 mb-0 list-none space-y-1.5 p-0 leading-[1.6]">
              {PAGINAS.map(([h, t]) => (
                <li key={h}>
                  <Link href={h} className="w-lijnlink">{t}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="lbl m-0 text-salie">Klein</p>
            <p className="mt-4 mb-0 leading-[1.75] text-gedempt tabular-nums">
              KVK {BUSINESS.kvk}
              <br />
              BTW {BUSINESS.btw}
              <br />
              <Link href="/privacy" className="w-lijnlink text-inkt">Privacy</Link>
            </p>
          </div>
        </div>

        <div className="mt-[clamp(56px,8vw,120px)] border-t border-lijn pt-[clamp(28px,4vw,48px)]">
          <Logo className="h-auto w-full max-w-[1100px]" />
        </div>
      </div>
    </footer>
  )
}
