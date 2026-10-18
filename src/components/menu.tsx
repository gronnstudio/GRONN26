"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { BUSINESS } from "@/lib/business"
import { Komeet } from "./komeet"
import { Instellingen } from "./weergave"
import { T, type Tekst } from "./taal"
import { useTaal } from "./taal-klant"

// Het menu, versimpeld (eigenaar, 18 okt 2026: "home, werk, studio, shop,
// hamburger (hierin breng je alles onder wat in menu niet staat zoals
// weergave etc.) maak er een mega menu en op mobiel zero.university achtig").
// Onderaan blijft de glazen pil, nu met vier woorden en een hamburger. De
// hamburger opent een megamenu met alle pagina's, contact en Weergave. Op de
// telefoon groeit de pil zelf uit tot dat menu, zoals bij zero.university.
const HOOFD: { href: string; label: Tekst; bij: string[] }[] = [
  { href: "/", label: "Home", bij: [] },
  { href: "/werk", label: { nl: "Werk", en: "Work" }, bij: ["/werk"] },
  { href: "/over", label: "Studio", bij: ["/over", "/techniek"] },
  { href: "/tuinen/borderpakketten", label: "Shop", bij: ["/tuinen/borderpakketten"] },
]

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
          open ? "opacity-100 [clip-path:inset(0_0_0_0_round_32px)]" : "pointer-events-none opacity-0 [clip-path:inset(calc(100%-60px)_0_0_0_round_32px)]"
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
        <ul className="relative z-10 m-0 flex list-none items-center gap-1 rounded-full glas p-[6px] [--komeet-r:30px] transition-[background-color,box-shadow] duration-500 group-data-[open]:bg-transparent group-data-[open]:shadow-none">
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
              <li key={m.href} className="flex min-w-0 flex-1 lg:flex-none">
                <Link
                  href={m.href}
                  aria-current={actief ? "page" : undefined}
                  className="flex h-[var(--knop)] w-full items-center justify-center rounded-full px-2 text-[13px] font-semibold text-gebroken-wit no-underline transition-colors hover:not-aria-[current=page]:bg-gebroken-wit/10 aria-[current=page]:kiezel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit lg:px-5"
                >
                  <T t={m.label} />
                </Link>
              </li>
            )
          })}
          <li className="flex">
            <button
              ref={knop}
              type="button"
              aria-expanded={open}
              aria-controls="megamenu"
              onClick={() => setOpen(!open)}
              className="flex h-[var(--knop)] min-w-[var(--knop)] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gebroken-wit/90 px-0 text-antraciet lg:px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
            >
              {/* twee streepjes die een kruis worden, zoals bij zero.university */}
              <span aria-hidden className="relative block h-[10px] w-[18px]">
                <span className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-current transition-transform duration-300 group-data-[open]:translate-y-[4px] group-data-[open]:rotate-45" />
                <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-current transition-transform duration-300 group-data-[open]:-translate-y-[4px] group-data-[open]:-rotate-45" />
              </span>
              <span className="text-[13px] font-semibold max-lg:sr-only">{open ? (taal === "en" ? "Close" : "Sluiten") : "Menu"}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
