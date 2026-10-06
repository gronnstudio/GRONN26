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
    <footer className="border-t border-lijn mt-[clamp(40px,12vw,180px)] mb-[-110px] bg-grond pt-[clamp(56px,7vw,96px)] pb-[calc(110px+clamp(28px,4vw,48px))] text-inkt">
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
                {/* als iconen in hun eigen merkkleur, naast elkaar (eigenaar, 5 okt 2026) */}
                <span className="mt-1 flex gap-3">
                  <a href={BUSINESS.instagram} aria-label="Instagram" className="grid size-11 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white transition-transform hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a href={BUSINESS.whatsapp} aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full bg-[#25D366] text-white transition-transform hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z" />
                      <path d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a href={BUSINESS.linkedin} aria-label="LinkedIn" className="grid size-11 place-items-center rounded-full bg-[#0A66C2] text-white transition-transform hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                      <path d="M5.2 8.6h3.1V19H5.2zM6.8 3.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10.3 8.6h3v1.4h.1c.4-.8 1.4-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.8V19h-3.1v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V19h-3.1z" />
                    </svg>
                  </a>
                </span>
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
            <ul className="mt-4 mb-0 list-none space-y-1.5 p-0 leading-[1.6]">
              {(
                [
                  ["/privacy", { nl: "Privacy", en: "Privacy" }],
                  ["/voorwaarden", { nl: "Voorwaarden", en: "Terms" }],
                  ["/herroeping", { nl: "Herroeping", en: "Withdrawal" }],
                  ["/colofon", { nl: "Colofon", en: "Colophon" }],
                  ["/merk", { nl: "Merk", en: "Brand" }],
                  ["/techniek", { nl: "Techniek", en: "Technology" }],
                ] as const
              ).map(([h, t]) => (
                <li key={h}>
                  <Link href={h} className="w-lijnlink"><T t={t} /></Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* het reuzenwoordmerk, met rechts in de lege ruimte KVK en BTW om te kopiëren (eigenaar, 5 okt 2026) */}
        <div className="mt-[clamp(56px,8vw,120px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t border-lijn pt-[clamp(28px,4vw,48px)]">
          <Logo className="h-auto w-full max-w-[1100px] lg:w-[68%]" />
          <div className="flex flex-col items-start gap-2 text-sm lg:items-end lg:pb-[1%]">
            {/* Alleen voor de eigenaar: Google-login, daarna de offertemaker (zie src/proxy.ts). */}
            <a href="/offertes" rel="nofollow" className="w-lijnlink mb-2 text-gedempt"><T t={{ nl: "Inloggen", en: "Log in" }} /></a>
            <Kopieer label="KVK" waarde={BUSINESS.kvk} />
            <Kopieer label="BTW" waarde={BUSINESS.btw} />
          </div>
        </div>
      </div>
    </footer>
  )
}
