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
// de site: bosgroen met de donkere tokens (eigenaar, 10 okt 2026), Montserrat
// met Syne Bold alleen in het woordmerk, links die aangroeien. Sluit naadloos
// aan op het bosgroene Kennismaken-vlak (#h-kennis); staat dat er niet, dan
// komt er ruimte boven. De ruimte onder de body (voor het menu) valt binnen
// de voet, zodat er onderaan geen lichte rand overblijft.
export function Voet() {
  const a = BUSINESS.address
  return (
    <footer className="donker bos-vlak relative border-t border-lijn mt-[clamp(40px,12vw,180px)] mb-[-110px] bg-grond pt-[clamp(56px,7vw,96px)] pb-[calc(110px+clamp(28px,4vw,48px))] text-inkt">
      {/* de voet is het water van een vijver (eigenaar, 10 okt 2026: eigen beeld in plaats van de worm van grnfix):
          lisdodde aan de rand, twee lelibladen met een kring in het water ertussen; stil bij minder beweging */}
      <span className="lisdodde" aria-hidden>
        <svg viewBox="0 0 120 150" width="120" height="150">
            <g className="lis-1">
              <path d="M53.9 150.7 L51.0 145.0 L48.0 139.3 L45.0 133.6 L41.9 127.9 L38.7 122.2 L35.5 116.7 L32.1 111.1 L28.6 105.7 L24.9 100.4 L21.1 95.1 L17.1 90.0 L13.0 85.1 L8.6 80.3 L4.1 75.7 L3.7 76.1 L7.9 80.9 L11.9 85.9 L15.7 91.1 L19.4 96.3 L22.8 101.7 L26.1 107.2 L29.2 112.8 L32.3 118.4 L35.1 124.1 L37.9 129.9 L40.7 135.7 L43.3 141.5 L45.9 147.4 L48.5 153.3Z" />
              <path d="M58.4 151.4 L56.9 145.1 L55.4 138.8 L53.8 132.5 L52.2 126.3 L50.5 120.0 L48.8 113.7 L47.1 107.5 L45.2 101.3 L43.3 95.1 L41.3 88.9 L39.2 82.8 L37.0 76.7 L34.7 70.6 L32.2 64.6 L31.7 64.8 L33.8 70.9 L35.7 77.1 L37.6 83.3 L39.3 89.5 L41.0 95.7 L42.5 102.0 L44.0 108.3 L45.4 114.6 L46.7 120.9 L48.0 127.2 L49.2 133.5 L50.4 139.9 L51.6 146.2 L52.8 152.6Z" />
              <path d="M63.2 151.9 L62.9 145.0 L62.6 138.1 L62.4 131.2 L62.3 124.3 L62.3 117.5 L62.5 110.6 L62.8 103.7 L63.4 96.9 L64.2 90.1 L65.2 83.3 L66.6 76.5 L68.3 69.8 L70.3 63.3 L72.7 56.8 L72.1 56.5 L69.3 62.9 L66.9 69.5 L64.8 76.1 L63.0 82.8 L61.5 89.7 L60.3 96.5 L59.3 103.4 L58.6 110.4 L58.0 117.3 L57.5 124.3 L57.2 131.2 L57.0 138.2 L56.9 145.1 L56.8 152.1Z" />
              <path d="M67.2 152.6 L68.3 146.6 L69.5 140.6 L70.7 134.6 L71.9 128.6 L73.3 122.6 L74.8 116.7 L76.5 110.9 L78.3 105.1 L80.3 99.3 L82.6 93.7 L85.1 88.1 L87.8 82.6 L90.8 77.3 L94.1 72.2 L93.6 71.8 L90.0 76.8 L86.6 82.0 L83.5 87.4 L80.7 92.8 L78.1 98.4 L75.7 104.1 L73.5 109.9 L71.4 115.8 L69.5 121.6 L67.8 127.6 L66.1 133.5 L64.5 139.5 L63.0 145.4 L61.6 151.4Z" />
              <path d="M71.5 153.2 L73.8 147.5 L76.1 141.9 L78.5 136.3 L80.9 130.7 L83.3 125.1 L85.9 119.5 L88.5 114.0 L91.2 108.6 L94.0 103.2 L96.9 97.9 L100.0 92.6 L103.2 87.4 L106.6 82.3 L110.2 77.4 L109.7 77.0 L105.8 81.8 L102.1 86.7 L98.5 91.7 L95.1 96.8 L91.8 101.9 L88.6 107.2 L85.6 112.5 L82.6 117.9 L79.7 123.3 L76.9 128.8 L74.1 134.3 L71.4 139.8 L68.7 145.3 L66.1 150.8Z" />
              <path className="steel" d="M57.6 152 Q55.2 105.0 52.0 58" />
              <rect x="48.0" y="30" width="8" height="28" rx="4" />
              <path className="steel" d="M52.0 30 v-11" />
              <path className="steel" d="M64.5 152 Q69.0 109.0 75.0 66" />
              <rect x="71.0" y="38" width="8" height="28" rx="4" />
              <path className="steel" d="M75.0 38 v-11" />
            </g>
            <g className="lis-2">
              <path d="M56.2 151.0 L53.6 144.1 L51.0 137.3 L48.3 130.4 L45.5 123.6 L42.6 116.9 L39.6 110.1 L36.4 103.5 L33.0 96.9 L29.4 90.5 L25.6 84.1 L21.6 77.9 L17.3 71.9 L12.8 66.1 L8.0 60.6 L7.5 61.0 L12.0 66.7 L16.2 72.7 L20.1 78.9 L23.7 85.2 L27.2 91.6 L30.3 98.2 L33.3 104.8 L36.1 111.6 L38.8 118.4 L41.3 125.2 L43.7 132.1 L46.1 139.0 L48.3 146.0 L50.6 153.0Z" />
              <path d="M60.6 151.7 L59.7 145.3 L58.9 138.8 L57.9 132.3 L56.9 125.9 L55.8 119.4 L54.6 113.0 L53.2 106.6 L51.7 100.2 L49.9 93.9 L47.9 87.7 L45.8 81.5 L43.3 75.4 L40.6 69.5 L37.6 63.7 L37.1 63.9 L39.8 69.8 L42.1 75.9 L44.2 82.0 L46.0 88.2 L47.6 94.5 L49.0 100.8 L50.2 107.2 L51.2 113.5 L52.1 120.0 L52.8 126.4 L53.5 132.8 L54.0 139.3 L54.6 145.8 L55.0 152.3Z" />
              <path d="M65.0 152.4 L65.9 144.3 L66.8 136.2 L67.8 128.1 L68.8 120.1 L69.8 112.0 L70.9 103.9 L72.1 95.9 L73.4 87.9 L74.8 79.9 L76.3 71.9 L78.0 64.0 L79.8 56.0 L81.8 48.2 L83.9 40.3 L83.4 40.2 L80.9 47.9 L78.5 55.7 L76.4 63.6 L74.3 71.5 L72.4 79.4 L70.7 87.4 L69.0 95.4 L67.4 103.4 L65.9 111.4 L64.5 119.4 L63.2 127.5 L61.9 135.5 L60.6 143.6 L59.4 151.6Z" />
              <path d="M69.8 153.0 L71.7 145.8 L73.7 138.7 L75.6 131.6 L77.6 124.5 L79.7 117.4 L81.8 110.3 L84.1 103.3 L86.4 96.3 L88.8 89.3 L91.4 82.4 L94.0 75.5 L96.9 68.7 L99.9 62.0 L103.0 55.3 L102.4 55.0 L98.9 61.5 L95.5 68.1 L92.2 74.8 L89.1 81.5 L86.2 88.3 L83.3 95.2 L80.6 102.1 L77.9 109.0 L75.4 116.0 L72.9 123.0 L70.5 130.0 L68.1 137.0 L65.7 144.0 L63.4 151.0Z" />
              <path className="steel" d="M61.2 152 Q62.4 97.0 64.0 42" />
              <rect x="60.0" y="14" width="8" height="28" rx="4" />
              <path className="steel" d="M64.0 14 v-11" />
            </g>
        </svg>
      </span>
      <span className="kring" aria-hidden />
      <span className="leliblad" aria-hidden>
        <svg viewBox="0 0 80 24" width="80" height="24">
          <path d="M40 12 77.6 10A38 10 0 1 0 77.6 14Z" />
          <path className="bloem" d="M52 9c-2-4-1-7 1-8 2 1 3 4 1 8Zm-1 0c-4-1-6-3-6-5 2-1 5 0 7 4Zm3 0c2-4 5-5 7-4 0 2-2 4-6 5Z" />
        </svg>
      </span>
      <span className="leliblad leliblad-klein" aria-hidden>
        <svg viewBox="0 0 80 24" width="48" height="14">
          <path d="M40 12 2.4 10A38 10 0 1 1 2.4 14Z" />
        </svg>
      </span>
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
                  <a href={BUSINESS.instagram} aria-label="Instagram" className="grid size-[var(--knop)] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white transition-transform hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a href={BUSINESS.whatsapp} aria-label="WhatsApp" className="grid size-[var(--knop)] place-items-center rounded-full bg-[#25D366] text-white transition-transform hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z" />
                      <path d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a href={BUSINESS.linkedin} aria-label="LinkedIn" className="grid size-[var(--knop)] place-items-center rounded-full bg-[#0A66C2] text-white transition-transform hover:-translate-y-0.5">
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
            {/* Alleen voor de eigenaar: Google-login, daarna het dashboard (zie src/proxy.ts). */}
            <a
              href="/dashboard"
              rel="nofollow"
              className="mb-2 inline-flex items-center gap-2.5 h-[var(--knop-klein)] rounded-full border border-dashed border-lijn px-[var(--knop-binnen-klein)] text-gedempt transition-colors hover:border-inkt hover:text-inkt"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
              <span>
                <T t={{ nl: "Inloggen", en: "Log in" }} />
                <span className="ml-2 text-[11px] uppercase tracking-[.12em] opacity-70">
                  <T t={{ nl: "alleen eigenaar", en: "owner only" }} />
                </span>
              </span>
            </a>
            <Kopieer label="KVK" waarde={BUSINESS.kvk} />
            <Kopieer label="BTW" waarde={BUSINESS.btw} />
          </div>
        </div>
      </div>
    </footer>
  )
}
