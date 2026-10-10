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
      {/* een pol siergras op de rand, wuift zacht in de wind (eigenaar, 10 okt 2026); stil bij minder beweging */}
      <span className="gras" aria-hidden>
        <svg viewBox="0 0 140 120" width="140" height="120">
            <g className="gras-1">
              <path d="M62.6 120.1 L59.8 117.4 L57.1 114.7 L54.3 112.0 L51.5 109.3 L48.6 106.7 L45.7 104.2 L42.7 101.7 L39.7 99.4 L36.5 97.1 L33.3 95.0 L30.0 93.0 L26.6 91.1 L23.1 89.5 L19.5 88.0 L19.5 88.0 L22.9 89.8 L26.1 91.8 L29.3 94.0 L32.3 96.3 L35.2 98.7 L38.0 101.2 L40.8 103.9 L43.4 106.6 L46.0 109.3 L48.5 112.2 L51.0 115.1 L53.4 118.0 L55.8 120.9 L58.2 123.9Z" />
              <path d="M66.1 121.0 L63.9 116.7 L61.7 112.4 L59.4 108.2 L57.0 103.9 L54.5 99.8 L51.8 95.7 L49.0 91.7 L46.0 87.9 L42.8 84.2 L39.4 80.8 L35.8 77.5 L32.0 74.5 L27.9 71.9 L23.7 69.6 L23.7 69.6 L27.8 72.1 L31.6 75.0 L35.1 78.2 L38.4 81.7 L41.5 85.3 L44.4 89.1 L47.1 93.0 L49.6 97.1 L51.9 101.2 L54.1 105.5 L56.1 109.8 L58.1 114.2 L60.0 118.5 L61.9 123.0Z" />
              <path d="M70.3 121.4 L68.9 116.3 L67.5 111.2 L66.0 106.1 L64.4 101.0 L62.6 96.0 L60.7 91.1 L58.6 86.2 L56.3 81.4 L53.7 76.7 L50.9 72.2 L47.8 67.9 L44.4 63.8 L40.8 59.9 L36.8 56.4 L36.8 56.4 L40.5 60.2 L43.8 64.3 L46.8 68.5 L49.5 73.0 L52.0 77.6 L54.1 82.3 L56.0 87.2 L57.7 92.1 L59.2 97.1 L60.6 102.1 L61.8 107.2 L62.9 112.3 L63.9 117.4 L64.9 122.6Z" />
              <path d="M73.8 122.3 L74.2 117.4 L74.7 112.6 L75.3 107.7 L75.9 102.9 L76.7 98.1 L77.6 93.3 L78.6 88.5 L79.8 83.8 L81.2 79.1 L82.8 74.5 L84.7 70.0 L86.8 65.6 L89.2 61.3 L91.9 57.2 L91.9 57.2 L88.9 61.1 L86.1 65.3 L83.7 69.5 L81.5 74.0 L79.5 78.5 L77.7 83.2 L76.1 87.9 L74.7 92.6 L73.4 97.4 L72.3 102.2 L71.3 107.1 L70.3 112.0 L69.5 116.8 L68.6 121.7Z" />
              <path d="M77.3 122.9 L78.5 118.9 L79.6 115.0 L80.9 111.1 L82.1 107.2 L83.5 103.4 L84.9 99.5 L86.4 95.7 L88.0 92.0 L89.8 88.3 L91.7 84.7 L93.7 81.2 L95.9 77.7 L98.2 74.4 L100.8 71.1 L100.8 71.1 L97.9 74.1 L95.3 77.3 L92.7 80.6 L90.4 84.0 L88.1 87.4 L86.0 91.0 L84.0 94.7 L82.1 98.4 L80.3 102.1 L78.6 105.9 L77.0 109.7 L75.4 113.5 L73.8 117.3 L72.3 121.1Z" />
              <path d="M80.8 123.8 L82.8 120.7 L84.9 117.6 L87.1 114.6 L89.2 111.6 L91.5 108.7 L93.8 105.9 L96.3 103.1 L98.8 100.5 L101.5 98.0 L104.3 95.6 L107.3 93.4 L110.4 91.4 L113.6 89.7 L117.0 88.1 L117.0 88.1 L113.5 89.3 L110.0 90.7 L106.6 92.4 L103.3 94.3 L100.1 96.4 L97.1 98.6 L94.2 101.0 L91.3 103.6 L88.6 106.2 L86.0 108.9 L83.4 111.7 L80.9 114.5 L78.4 117.4 L76.0 120.2Z" />
              <path className="halm" d="M66.8 122 Q63.0 85.0 54.0 48" />
              <path className="pluim" d="M54.0 48 c-5 -8 -5 -22 0 -32 c5 10 5 24 0 32Z" transform="rotate(-14 54.0 48)" />
              <path className="halm" d="M74.8 122 Q80.6 89.0 94.0 56" />
              <path className="pluim" d="M94.0 56 c-5 -8 -5 -22 0 -32 c5 10 5 24 0 32Z" transform="rotate(22 94.0 56)" />
            </g>
            <g className="gras-2">
              <path d="M63.4 120.6 L60.5 117.3 L57.5 114.1 L54.5 110.9 L51.4 107.8 L48.3 104.7 L45.0 101.8 L41.6 99.1 L38.0 96.5 L34.3 94.1 L30.5 91.9 L26.5 90.1 L22.4 88.5 L18.2 87.4 L13.9 86.6 L13.9 86.6 L18.1 87.7 L22.1 89.1 L26.1 90.9 L29.8 93.0 L33.4 95.4 L36.8 98.0 L40.1 100.8 L43.2 103.7 L46.2 106.8 L49.1 110.0 L51.8 113.2 L54.6 116.6 L57.2 120.0 L59.8 123.4Z" />
              <path d="M67.9 120.9 L66.1 116.9 L64.2 113.0 L62.2 109.1 L60.2 105.2 L58.1 101.4 L55.8 97.6 L53.4 93.9 L50.9 90.3 L48.2 86.8 L45.4 83.4 L42.3 80.3 L39.1 77.3 L35.7 74.6 L32.1 72.1 L32.1 72.1 L35.4 74.9 L38.5 77.9 L41.4 81.1 L44.1 84.5 L46.5 88.0 L48.8 91.6 L50.9 95.3 L52.8 99.2 L54.7 103.0 L56.4 107.0 L58.0 111.0 L59.5 115.0 L61.0 119.0 L62.5 123.1Z" />
              <path d="M71.2 121.8 L70.5 116.8 L69.8 111.8 L69.0 106.9 L68.2 101.9 L67.2 97.0 L66.1 92.0 L64.9 87.1 L63.6 82.3 L62.0 77.5 L60.2 72.8 L58.2 68.2 L56.0 63.6 L53.5 59.3 L50.8 55.1 L50.8 55.1 L53.2 59.4 L55.4 63.9 L57.3 68.5 L58.9 73.2 L60.4 78.0 L61.6 82.8 L62.6 87.6 L63.5 92.5 L64.2 97.4 L64.8 102.4 L65.3 107.3 L65.7 112.3 L66.1 117.2 L66.4 122.2Z" />
              <path d="M74.7 122.3 L75.3 116.7 L75.9 111.2 L76.6 105.7 L77.5 100.2 L78.5 94.8 L79.8 89.4 L81.2 84.0 L83.0 78.8 L85.0 73.6 L87.4 68.6 L90.1 63.8 L93.2 59.2 L96.7 54.8 L100.6 50.8 L100.6 50.8 L96.5 54.6 L92.7 58.8 L89.3 63.3 L86.2 68.0 L83.5 73.0 L81.1 78.1 L79.1 83.3 L77.2 88.7 L75.7 94.1 L74.3 99.6 L73.1 105.1 L72.0 110.6 L71.0 116.2 L70.1 121.7Z" />
              <path d="M78.7 123.2 L80.1 119.4 L81.5 115.6 L83.0 111.9 L84.5 108.2 L86.2 104.5 L87.9 100.9 L89.7 97.4 L91.7 93.9 L93.9 90.6 L96.2 87.3 L98.7 84.2 L101.4 81.2 L104.3 78.4 L107.4 75.8 L107.4 75.8 L104.0 78.1 L100.8 80.6 L97.7 83.3 L94.9 86.3 L92.2 89.3 L89.6 92.6 L87.2 95.9 L84.9 99.3 L82.8 102.8 L80.7 106.4 L78.8 110.0 L76.9 113.6 L75.1 117.2 L73.3 120.8Z" />
              <path d="M81.4 123.5 L83.9 120.1 L86.4 116.9 L88.9 113.6 L91.5 110.4 L94.2 107.3 L97.0 104.3 L99.8 101.4 L102.8 98.6 L106.0 96.0 L109.3 93.5 L112.7 91.3 L116.2 89.2 L120.0 87.4 L123.8 85.9 L123.8 85.9 L119.8 87.1 L115.9 88.6 L112.2 90.4 L108.5 92.4 L105.0 94.7 L101.6 97.1 L98.3 99.7 L95.1 102.4 L92.0 105.3 L89.0 108.2 L86.1 111.3 L83.3 114.3 L80.5 117.4 L77.8 120.5Z" />
              <path className="halm" d="M69.6 122 Q69.1 78.0 68.0 34" />
              <path className="pluim" d="M68.0 34 c-5 -8 -5 -22 0 -32 c5 10 5 24 0 32Z" transform="rotate(-2 68.0 34)" />
            </g>
            <g className="gras-3">
              <path d="M64.9 120.7 L62.3 116.6 L59.6 112.6 L56.9 108.5 L54.1 104.5 L51.3 100.5 L48.3 96.6 L45.3 92.8 L42.2 89.0 L38.9 85.4 L35.6 81.8 L32.1 78.4 L28.4 75.2 L24.6 72.1 L20.7 69.2 L20.7 69.2 L24.4 72.4 L27.9 75.7 L31.3 79.2 L34.5 82.8 L37.6 86.5 L40.5 90.3 L43.3 94.3 L46.0 98.3 L48.6 102.3 L51.1 106.4 L53.5 110.6 L55.9 114.8 L58.3 119.0 L60.7 123.3Z" />
              <path d="M69.1 121.3 L67.3 115.4 L65.4 109.5 L63.5 103.7 L61.5 97.8 L59.3 92.0 L57.0 86.3 L54.5 80.7 L51.8 75.1 L48.9 69.6 L45.7 64.3 L42.2 59.2 L38.5 54.3 L34.5 49.7 L30.1 45.3 L30.1 45.3 L34.1 49.9 L37.8 54.8 L41.2 59.9 L44.3 65.1 L47.1 70.5 L49.6 76.1 L51.9 81.7 L54.0 87.4 L55.9 93.2 L57.7 99.0 L59.3 104.9 L60.8 110.8 L62.3 116.8 L63.7 122.7Z" />
              <path d="M72.9 121.9 L72.6 114.7 L72.2 107.6 L72.0 100.4 L71.9 93.2 L71.9 86.1 L72.1 78.9 L72.5 71.8 L73.1 64.7 L73.9 57.5 L75.1 50.5 L76.6 43.5 L78.4 36.5 L80.6 29.7 L83.2 23.0 L83.2 23.0 L80.2 29.6 L77.6 36.3 L75.3 43.2 L73.5 50.2 L71.9 57.2 L70.6 64.4 L69.6 71.5 L68.8 78.7 L68.2 86.0 L67.7 93.2 L67.4 100.4 L67.3 107.6 L67.1 114.9 L67.1 122.1Z" />
              <path d="M76.4 122.8 L77.5 118.3 L78.6 113.9 L79.8 109.5 L81.1 105.1 L82.5 100.8 L84.0 96.5 L85.6 92.2 L87.5 88.1 L89.5 84.0 L91.8 80.1 L94.3 76.3 L97.0 72.6 L100.0 69.1 L103.3 65.9 L103.3 65.9 L99.7 68.9 L96.4 72.1 L93.2 75.5 L90.4 79.2 L87.7 83.0 L85.2 87.0 L83.0 91.1 L80.9 95.2 L78.9 99.5 L77.1 103.8 L75.4 108.1 L73.8 112.5 L72.3 116.8 L70.8 121.2Z" />
              <path d="M79.2 123.2 L81.3 119.3 L83.4 115.4 L85.6 111.6 L87.9 107.9 L90.3 104.2 L92.8 100.6 L95.4 97.1 L98.2 93.7 L101.1 90.5 L104.2 87.4 L107.5 84.5 L111.0 81.9 L114.7 79.5 L118.6 77.4 L118.6 77.4 L114.6 79.2 L110.7 81.3 L106.9 83.8 L103.4 86.4 L100.0 89.3 L96.7 92.4 L93.6 95.7 L90.7 99.0 L87.9 102.5 L85.2 106.1 L82.6 109.7 L80.1 113.4 L77.7 117.1 L75.2 120.8Z" />
              <path className="halm" d="M72.4 122 Q75.3 82.0 82.0 42" />
              <path className="pluim" d="M82.0 42 c-5 -8 -5 -22 0 -32 c5 10 5 24 0 32Z" transform="rotate(11 82.0 42)" />
            </g>
        </svg>
      </span>
      {/* een regenworm steekt af en toe zijn kop uit de grond (eigenaar, 10 okt 2026, naar grnfix); stil bij minder beweging */}
      <span className="worm" aria-hidden>
        <svg viewBox="0 0 88 46" width="88" height="46">
          <g className="worm-kop">
            <path className="lijf" d="M14 56V30c0-9 2-16 6-21" />
            <path className="ring" d="M14 56V30c0-9 2-16 6-21" />
            <circle cx="21.5" cy="12" r="1.3" />
          </g>
          <path className="lijf" d="M32 56c0-14 5-22 11-22s11 8 11 22" />
          <path className="ring" d="M32 56c0-14 5-22 11-22s11 8 11 22" />
          <path className="lijf" d="M62 56c0-8 3-13 7-13s7 5 7 13" />
          <path className="ring" d="M62 56c0-8 3-13 7-13s7 5 7 13" />
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
