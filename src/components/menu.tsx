"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Komeet } from "./komeet"
import { Instellingen } from "./weergave"
import { OPEN_ZOEK } from "./zoek"
import { T, kies, type Tekst } from "./taal"
import { useTaal } from "./taal-klant"

// Het menu, versimpeld (eigenaar, 18 okt 2026: "home, werk, studio, shop,
// hamburger (hierin breng je alles onder wat in menu niet staat zoals
// weergave etc.) maak er een mega menu en op mobiel zero.university achtig").
// De hamburger opent een megamenu met alle pagina's, contact en Weergave; op de
// telefoon groeit de pil zelf uit tot dat menu, zoals bij zero.university.
// De pil zelf houdt de stijl van daarvoor (eigenaar, 18 okt 2026: "de styling
// terug, menu blijft verder zo"): ronde iconen zonder woorden die om de beurt
// even bewegen, de huidige pagina als kiezelknopje, op de telefoon altijd
// groot. Tijdens het lezen komt Omhoog achteraan, na de hamburger, in de
// ronding van de pil ("hamburger en dan oranje back to top achteraan").
// Shop is een kruiwagen (eigenaar, 19 okt 2026).
// Blog alleen vanaf desktop in de pil; op telefoon en tablet staat hij in het
// megamenu, zodat de pil vier vakken plus menu houdt (eigenaar, 21 okt 2026:
// "Blogs in eigen menu, dat past op desktop. Op mobiel waarschijnlijk niet").
const HOOFD: { href: string; label: Tekst; bij: string[]; beweging: string; icoon: string; groot?: true }[] = [
  { href: "/", label: "Home", bij: [], beweging: "plop", icoon: "M11 19.5v-7M11 13.5c0-4-2.6-6.5-7-6.5 0 4 2.6 6.5 7 6.5zM11 11c0-4 2.6-6.5 7-6.5 0 4-2.6 6.5-7 6.5z" },
  { href: "/werk", label: { nl: "Werk", en: "Work" }, bij: ["/werk"], beweging: "spit", icoon: "M8 2.5h6M11 2.5v9M7 11.5h8v4a4 4 0 0 1-8 0z" },
  { href: "/over", label: "Studio", bij: ["/over", "/techniek"], beweging: "knik", icoon: "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 19c1-4 4-5.5 7-5.5s6 1.5 7 5.5" },
  { href: "/shop", label: "Shop", bij: ["/shop", "/tuinen/borderpakketten", "/tuinen/cadeaubon"], beweging: "groei", icoon: "M3 8h3l2 7h9l2-6H6.5M15.5 18.5a1.8 1.8 0 1 0 0-.1M8 15l-1 4.5" },
  { href: "/blog", label: "Blog", bij: ["/blog"], beweging: "knik", icoon: "M3 5.5c3-1 5.5-.5 8 1.5 2.5-2 5-2.5 8-1.5v12c-3-1-5.5-.5-8 1.5-2.5-2-5-2.5-8-1.5zM11 7v12", groot: true },
]

// de huidige pagina: een licht kiezelknopje met reliëf achter een donker icoon
const RUST = "text-gebroken-wit hover:not-aria-[current=page]:bg-gebroken-wit/10 aria-[current=page]:kiezel"

const isHier = (pad: string, href: string) => pad === href || pad.startsWith(href + "/")

export function Menu() {
  const pad = usePathname()
  const taal = useTaal()
  const [open, setOpen] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const knop = useRef<HTMLButtonElement>(null)
  const vlak = useRef<HTMLDivElement>(null)

  // boven = geen Omhoog: bovenaan de pagina en zodra je een stukje omhoog
  // scrollt (zoals Instagram); tijdens het lezen staat Omhoog erin
  const [boven, setBoven] = useState(true)
  // bovenaan = de brede balk van desktop (zoals uncoded.life); daaronder een smalle pil.
  // Sinds 18 okt 2026 staat hij ook op desktop onderaan (eigenaar: "make the dock on desktop also bottom").
  const [bovenaan, setBovenaan] = useState(true)
  useEffect(() => {
    let vorige = 0
    const meet = () => {
      const y = scrollY
      setBovenaan(y < 24)
      if (y < 48) setBoven(true)
      else if (y - vorige > 6) setBoven(false)
      else if (vorige - y > 6) setBoven(true)
      else return
      vorige = y
    }
    const t = setTimeout(meet, 0)
    addEventListener("scroll", meet, { passive: true })
    return () => { clearTimeout(t); removeEventListener("scroll", meet) }
  }, [pad])
  const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches

  // een andere pagina: het menu gaat dicht
  const [vorigPad, setVorigPad] = useState(pad)
  if (pad !== vorigPad) {
    setVorigPad(pad)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const toets = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), knop.current?.focus())
    const klik = (e: MouseEvent) => {
      const t = e.target as Node
      if (!nav.current?.contains(t) && !vlak.current?.contains(t)) setOpen(false)
    }
    document.addEventListener("keydown", toets)
    document.addEventListener("click", klik)
    // op de telefoon vult het menu het scherm: de pagina eronder staat stil
    const oud = document.documentElement.style.overflow
    if (!matchMedia("(min-width: 1024px)").matches) document.documentElement.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", toets)
      document.removeEventListener("click", klik)
      document.documentElement.style.overflow = oud
    }
  }, [open])

  const linkKlasse = "flex min-h-[var(--raak)] items-center text-gebroken-wit no-underline transition-colors hover:text-oranje focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"

  return (
    <>
      {/* het megamenu: één glazen vlak dat de pil omsluit en er op de telefoon
          uit omhoog groeit (clip-path van de pil naar het hele vlak) */}
      <div
        ref={vlak}
        id="megamenu"
        inert={!open}
        className={`donker fixed z-[100] overflow-y-auto overscroll-contain rounded-[32px] glas-diep text-gebroken-wit transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none
          inset-x-[var(--goot)] bottom-5 max-h-[calc(100dvh-36px)] px-6 pt-8 pb-[96px]
          lg:left-1/2 lg:right-auto lg:max-h-[calc(100dvh-40px)] lg:w-[min(1120px,calc(100vw-2*var(--goot)))] lg:-translate-x-1/2 lg:px-10 lg:pt-10 lg:pb-[100px] ${
          open ? "opacity-100 [clip-path:inset(0_0_0_0_round_32px)]" : "pointer-events-none opacity-0 [clip-path:inset(calc(100%-64px)_0_0_0_round_32px)]"
        }`}
      >
        <div className="grid gap-y-8">
          {/* zoeken (eigenaar, 21 okt 2026); het venster zelf staat in zoek.tsx. De focus
              gaat eerst naar de menuknop, zodat hij daar terugkomt als het venster sluit. */}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              knop.current?.focus()
              dispatchEvent(new Event(OPEN_ZOEK))
            }}
            className="flex h-[var(--knop)] w-full cursor-pointer items-center gap-3 rounded-full border border-gebroken-wit/25 bg-gebroken-wit/5 px-5 text-left text-[15px] text-gebroken-wit/80 transition-colors hover:border-gebroken-wit/50 hover:text-gebroken-wit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
          >
            <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-oranje">
              <circle cx="9.5" cy="9.5" r="6" />
              <path d="m14 14 5 5" />
            </svg>
            <span className="flex-1"><T t={{ nl: "Zoek op de site", en: "Search the site" }} /></span>
          </button>
          {/* op telefoon en tablet staat Kennismaken hier, zodat de kop bovenaan de ruimte heeft (eigenaar, 18 okt 2026) */}
          <Link href="/kennismaken" className="knop w-full bg-oranje text-antraciet lg:hidden">
            <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
          </Link>
          <Link href="/blog" className={`${linkKlasse} syne text-[28px] leading-[1.2] tracking-[-.02em] lg:hidden`}>Blog</Link>
          <div>
            <p className="lbl m-0 mb-4 text-gebroken-wit/60"><T t={{ nl: "Weergave", en: "Display" }} /></p>
            <Instellingen />
          </div>
        </div>
      </div>

      <nav ref={nav} aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"} data-menu data-open={open || undefined} data-bovenaan={bovenaan || undefined} className="group fixed inset-x-[var(--goot)] bottom-5 z-[101] lg:inset-x-0 lg:flex lg:justify-center lg:pointer-events-none">
        {/* onder 1024px altijd groot, 64 hoog met rondjes van 48 en iconen van 32
            (eigenaar, 18 okt 2026: "zonder dock te verkleinen"); vanaf 1024px
            ook 64 hoog met 48 en 22, met het woordmerk ("maak dock op desktop ook iets groter", 18 okt 2026) */}
        <ul className="relative z-10 m-0 flex list-none items-center justify-between rounded-full glas p-[8px] [--komeet-r:32px] transition-[background-color,box-shadow] duration-500 motion-reduce:transition-none group-data-[open]:bg-transparent group-data-[open]:shadow-none max-lg:p-[8px] max-lg:[--komeet-r:32px] lg:pointer-events-auto lg:w-[1000px] lg:justify-start lg:gap-1 lg:transition-[width,background-color,box-shadow] lg:group-data-[bovenaan]:w-[calc(100vw-2*var(--rand))]">
          <Komeet as="li" />
          <li className="hidden lg:mr-auto lg:flex">
            {/* het woordmerk, altijd het primaire logo, zonder vlak (eigenaar, 5 okt 2026); op de telefoon staat hij linksboven (kop.tsx) */}
            <Link href="/" aria-label={taal === "en" ? "GRØNN Studio, to the home page" : "GRØNN Studio, naar de voorpagina"} className="flex h-12 items-center rounded-full px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair.svg" alt="" className="h-[16px] w-auto" />
            </Link>
          </li>
          {HOOFD.map((m) => {
            const actief = m.href === "/" ? pad === "/" : m.bij.some((b) => isHier(pad, b))
            return (
              <li key={m.href} className={`min-w-0 justify-center ${m.groot ? "hidden lg:flex" : "flex"}`}>
                <Link href={m.href} title={kies(m.label, taal)} aria-current={actief ? "page" : undefined} data-beweging={m.beweging} className={`menu-icoon grid size-[var(--knop)] place-items-center rounded-full transition-[background-color,color,width,height] duration-500 motion-reduce:transition-none aria-[current=page]:w-[48px] max-lg:size-[var(--knop)] lg:flex lg:w-auto lg:items-center lg:gap-[8px] lg:px-[16px] lg:text-[15px] lg:font-medium lg:aria-[current=page]:w-auto max-lg:aria-[current=page]:w-[64px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit ${RUST}`}>
                  <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[22px] transition-[width,height] duration-500 motion-reduce:transition-none max-lg:size-[32px]">
                    <path d={m.icoon} />
                  </svg>
                  {/* op desktop staat het woord naast het icoon (eigenaar, 18 okt 2026) */}
                  <span className="max-lg:sr-only"><T t={m.label} /></span>
                </Link>
              </li>
            )
          })}
          {/* Kennismaken rechts in de balk, alleen vanaf 1024px (op de telefoon staat hij bovenaan, kop.tsx) */}
          <li className="hidden lg:ml-auto lg:flex lg:pl-2">
    <Link
      href="/kennismaken"
      className="group knop inline-flex h-[var(--knop)] items-center gap-4 rounded-full bg-oranje px-[var(--knop-binnen)] text-[var(--knop-tekst)] font-semibold tracking-[var(--knop-letter)] text-antraciet uppercase no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
    >
      <span className="block h-4 overflow-hidden leading-4">
        <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
        <span aria-hidden className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
      </span>
      <svg viewBox="0 0 11 14" width="11" height="14" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
      </svg>
    </Link>
          </li>
          <li className="flex justify-center">
            <button
              ref={knop}
              type="button"
              aria-expanded={open}
              aria-controls="megamenu"
              aria-label="Menu"
              title="Menu"
              className={`grid size-[var(--knop)] cursor-pointer place-items-center rounded-full border-0 bg-transparent transition-[background-color,width,height] duration-500 motion-reduce:transition-none max-lg:size-[var(--knop)] lg:flex lg:w-auto lg:items-center lg:gap-[8px] lg:px-[18px] lg:text-[15px] lg:font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit ${RUST}`}
              onClick={() => setOpen(!open)}
            >
              {/* vier stippen als vier perkjes (eigenaar, 18 okt 2026: "for hamburger
                  something else"); open worden ze een kruis */}
              <svg viewBox="0 0 22 22" aria-hidden fill="currentColor" className="size-[22px] transition-[width,height] duration-500 motion-reduce:transition-none max-lg:size-[30px]">
                <g className="group-data-[open]:hidden">
                  <circle cx="6.5" cy="6.5" r="2.2" /><circle cx="15.5" cy="6.5" r="2.2" /><circle cx="6.5" cy="15.5" r="2.2" /><circle cx="15.5" cy="15.5" r="2.2" />
                </g>
                <path className="hidden group-data-[open]:inline" d="M5 5l12 12M17 5 5 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span aria-hidden className="max-lg:hidden">Menu</span>
            </button>
          </li>
          {/* Omhoog: alleen tijdens het lezen, rond en oranje met glasranden, achteraan
              na de hamburger, concentrisch in de ronding van de pil */}
          <li hidden={boven || open} className="justify-center [&:not([hidden])]:flex">
            <button
              type="button"
              onClick={() => scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" })}
              aria-label={taal === "en" ? "Back to top" : "Terug naar boven"}
              title={taal === "en" ? "Back to top" : "Terug naar boven"}
              className="omhoog-in glasrand relative grid size-[var(--knop)] max-lg:size-[var(--knop)] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
            >
              <svg aria-hidden viewBox="0 0 40 40" className="ring-voortgang"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
              <svg viewBox="0 0 22 22" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 18V4M5 10l6-6 6 6" />
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
