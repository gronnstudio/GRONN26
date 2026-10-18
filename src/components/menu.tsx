"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { BUSINESS } from "@/lib/business"
import { Komeet } from "./komeet"
import { Instellingen } from "./weergave"
import { T, kies, type Tekst } from "./taal"
import { useTaal } from "./taal-klant"

// Het menu, versimpeld (eigenaar, 18 okt 2026: "home, werk, studio, shop,
// hamburger (hierin breng je alles onder wat in menu niet staat zoals
// weergave etc.) maak er een mega menu en op mobiel zero.university achtig").
// De hamburger opent een megamenu met alle pagina's, contact en Weergave; op de
// telefoon groeit de pil zelf uit tot dat menu, zoals bij zero.university.
// De pil zelf houdt de stijl van daarvoor (eigenaar, 18 okt 2026: "de styling
// terug, menu blijft verder zo"): ronde iconen zonder woorden die om de beurt
// even bewegen, de huidige pagina als kiezelknopje, op de telefoon groot
// bovenaan en klein tijdens het lezen. Dan schuift Omhoog naast de hamburger
// de pil in ("de back to top moet naast hamburger in het dock verschijnen").
const HOOFD: { href: string; label: Tekst; bij: string[]; beweging: string; icoon: string }[] = [
  { href: "/", label: "Home", bij: [], beweging: "plop", icoon: "M3.5 10 11 3.5l7.5 6.5v8a1 1 0 0 1-1 1H14v-5.5H8V19H4.5a1 1 0 0 1-1-1z" },
  { href: "/werk", label: { nl: "Werk", en: "Work" }, bij: ["/werk"], beweging: "spit", icoon: "M8 2.5h6M11 2.5v9M7 11.5h8v4a4 4 0 0 1-8 0z" },
  { href: "/over", label: "Studio", bij: ["/over", "/techniek"], beweging: "knik", icoon: "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 19c1-4 4-5.5 7-5.5s6 1.5 7 5.5" },
  { href: "/tuinen/borderpakketten", label: "Shop", bij: ["/tuinen/borderpakketten"], beweging: "groei", icoon: "M4.5 8h13l-1 11h-11zM8 8V6.5a3 3 0 0 1 6 0V8" },
]

// de huidige pagina: een licht kiezelknopje met reliëf achter een donker icoon
const RUST = "text-gebroken-wit hover:not-aria-[current=page]:bg-gebroken-wit/10 aria-[current=page]:kiezel"

const MEGA: { kop: Tekst; links: [string, Tekst][] }[] = [
  {
    kop: { nl: "Diensten", en: "Services" },
    links: [
      ["/vijvers", { nl: "Vijvers", en: "Ponds" }],
      ["/tuinen", { nl: "Tuinen", en: "Gardens" }],
      ["/tuinen/borderpakketten", { nl: "Borderpakketten", en: "Border packages" }],
    ],
  },
  {
    kop: { nl: "Werk", en: "Work" },
    links: [
      ["/werk", { nl: "Alle projecten", en: "All projects" }],
      ["/werk/vijverrenovatie", { nl: "Vijverrenovatie", en: "Pond renovation" }],
      ["/werk/terras-geulle", { nl: "Terras in Geulle", en: "Terrace in Geulle" }],
    ],
  },
  {
    kop: "Studio",
    links: [
      ["/over", { nl: "Over Nick", en: "About Nick" }],
      ["/faq", { nl: "Veelgestelde vragen", en: "FAQ" }],
      ["/techniek", { nl: "Techniek", en: "Technology" }],
    ],
  },
  {
    kop: "Contact",
    links: [
      ["/kennismaken", { nl: "Kennismaken", en: "Get in touch" }],
      [BUSINESS.whatsapp, "WhatsApp"],
      [BUSINESS.emailHref, BUSINESS.email],
    ],
  },
]

const isHier = (pad: string, href: string) => pad === href || pad.startsWith(href + "/")

export function Menu() {
  const pad = usePathname()
  const taal = useTaal()
  const [open, setOpen] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const knop = useRef<HTMLButtonElement>(null)
  const vlak = useRef<HTMLDivElement>(null)

  // boven = de grote pil: bovenaan de pagina en zodra je een stukje omhoog
  // scrollt (zoals Instagram); tijdens het lezen klein, met Omhoog erin
  const [boven, setBoven] = useState(true)
  useEffect(() => {
    let vorige = 0
    const meet = () => {
      const y = scrollY
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
      {/* linksonder vanaf 1024px: Kennismaken (op de telefoon staat hij bovenaan, kop.tsx) */}
      <div data-menu className="fixed bottom-10 left-[var(--rand)] z-[101] max-lg:hidden">
        <Link
          href="/kennismaken"
          className="group knop gap-9 bg-oranje text-antraciet shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-3"
        >
          <span className="block h-4 overflow-hidden leading-4">
            <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
            <span aria-hidden className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
          </span>
          <svg viewBox="0 0 11 14" width="11" height="14" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
          </svg>
        </Link>
      </div>

      {/* het megamenu: één glazen vlak dat de pil omsluit en er op de telefoon
          uit omhoog groeit (clip-path van de pil naar het hele vlak) */}
      <div
        ref={vlak}
        id="megamenu"
        inert={!open}
        className={`donker fixed z-[100] overflow-y-auto overscroll-contain rounded-[32px] glas-diep text-gebroken-wit transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none
          inset-x-[var(--goot)] top-[max(16px,env(safe-area-inset-top))] bottom-5 px-6 pt-8 pb-[96px]
          lg:top-auto lg:bottom-10 lg:left-1/2 lg:right-auto lg:max-h-[calc(100dvh-80px)] lg:w-[min(1120px,calc(100vw-2*var(--goot)))] lg:-translate-x-1/2 lg:px-10 lg:pt-10 lg:pb-[100px] ${
          open ? "opacity-100 [clip-path:inset(0_0_0_0_round_32px)]" : "pointer-events-none opacity-0 [clip-path:inset(calc(100%-64px)_0_0_0_round_32px)]"
        }`}
      >
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-4">
          {MEGA.map((kolom) => (
            <div key={kolom.links[0][0]}>
              <p className="lbl m-0 mb-2 text-gebroken-wit/60"><T t={kolom.kop} /></p>
              <ul className="m-0 list-none p-0">
                {kolom.links.map(([href, label]) => {
                  const extern = !href.startsWith("/")
                  const klasse = `${linkKlasse} syne text-[26px] leading-[1.15] lg:text-[20px] ${extern ? "!font-sans !text-[15px] !font-medium [overflow-wrap:anywhere]" : ""}`
                  return (
                    <li key={href}>
                      {extern ? (
                        <a href={href} className={klasse} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}><T t={label} /></a>
                      ) : (
                        <Link href={href} aria-current={pad === href ? "page" : undefined} className={`${klasse} aria-[current=page]:text-oranje`}><T t={label} /></Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          <div className="border-t border-gebroken-wit/15 pt-6 lg:col-span-4">
            <p className="lbl m-0 mb-4 text-gebroken-wit/60"><T t={{ nl: "Weergave", en: "Display" }} /></p>
            <Instellingen />
          </div>
        </div>
      </div>

      <nav ref={nav} aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"} data-menu data-open={open || undefined} className="group fixed inset-x-[var(--goot)] bottom-5 z-[101] lg:right-auto lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2">
        {/* onder 1024px: groot 64 hoog met rondjes van 48 en iconen van 32, tijdens
            het lezen 48 hoog met 36 en 20; vanaf 1024px altijd klein, met het woordmerk */}
        <ul data-groot={boven || undefined} className="group/pil relative z-10 m-0 flex list-none items-center justify-between gap-1 rounded-full glas p-[6px] [--komeet-r:24px] transition-[padding,background-color,box-shadow] duration-500 motion-reduce:transition-none group-data-[open]:bg-transparent group-data-[open]:shadow-none max-lg:data-[groot]:p-[8px] max-lg:data-[groot]:[--komeet-r:32px] lg:justify-start">
          <Komeet as="li" />
          <li className="hidden lg:flex">
            {/* het woordmerk, altijd het primaire logo, zonder vlak (eigenaar, 5 okt 2026); op de telefoon staat hij linksboven (kop.tsx) */}
            <Link href="/" aria-label={taal === "en" ? "GRØNN Studio, to the home page" : "GRØNN Studio, naar de voorpagina"} className="flex h-10 items-center rounded-full px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair.svg" alt="" className="h-[13px] w-auto" />
            </Link>
          </li>
          {HOOFD.map((m) => {
            const actief = m.href === "/" ? pad === "/" : m.bij.some((b) => isHier(pad, b))
            return (
              <li key={m.href} className="flex min-w-0 justify-center">
                <Link href={m.href} title={kies(m.label, taal)} aria-current={actief ? "page" : undefined} data-beweging={m.beweging} className={`menu-icoon grid size-[var(--knop-klein)] place-items-center rounded-full transition-[background-color,color,width,height] duration-500 motion-reduce:transition-none aria-[current=page]:w-[48px] max-lg:group-data-[groot]/pil:size-[var(--knop)] max-lg:group-data-[groot]/pil:aria-[current=page]:w-[64px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit ${RUST}`}>
                  <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[20px] transition-[width,height] duration-500 motion-reduce:transition-none max-lg:group-data-[groot]/pil:size-[32px]">
                    <path d={m.icoon} />
                  </svg>
                  <span className="sr-only"><T t={m.label} /></span>
                </Link>
              </li>
            )
          })}
          {/* Omhoog: alleen tijdens het lezen, rond en oranje met glasranden, naast de hamburger */}
          <li inert={boven || open} className={`flex justify-center overflow-hidden transition-[width,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${boven || open ? "w-0 opacity-0" : "w-[var(--knop-klein)] opacity-100"}`}>
            <button
              type="button"
              onClick={() => scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" })}
              aria-label={taal === "en" ? "Back to top" : "Terug naar boven"}
              title={taal === "en" ? "Back to top" : "Terug naar boven"}
              className="glasrand relative grid size-[var(--knop-klein)] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
            >
              <svg aria-hidden viewBox="0 0 40 40" className="ring-voortgang"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
              <svg viewBox="0 0 22 22" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 18V4M5 10l6-6 6 6" />
              </svg>
            </button>
          </li>
          <li className="flex justify-center">
            <button
              ref={knop}
              type="button"
              aria-expanded={open}
              aria-controls="megamenu"
              aria-label="Menu"
              title="Menu"
              className={`grid size-[var(--knop-klein)] cursor-pointer place-items-center rounded-full border-0 bg-transparent transition-[background-color,width,height] duration-500 motion-reduce:transition-none max-lg:group-data-[groot]/pil:size-[var(--knop)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit ${RUST}`}
              onClick={() => setOpen(!open)}
            >
              {/* twee streepjes die een kruis worden, zoals bij zero.university */}
              <span aria-hidden className="relative block h-[8px] w-[18px] transition-[width,height] duration-500 max-lg:group-data-[groot]/pil:h-[12px] max-lg:group-data-[groot]/pil:w-[26px]">
                <span className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-current transition-transform duration-300 group-data-[open]:top-1/2 group-data-[open]:-translate-y-1/2 group-data-[open]:rotate-45" />
                <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-current transition-transform duration-300 group-data-[open]:bottom-1/2 group-data-[open]:translate-y-1/2 group-data-[open]:-rotate-45" />
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
