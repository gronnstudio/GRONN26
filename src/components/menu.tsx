"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Weergave } from "./weergave"
import { T } from "./taal"
import { useTaal } from "./taal-klant"

// Het menu van bartoszkolenda.com (eigenaar, 5 okt 2026), met hun lichtgroen
// als ons ene oranje:
// - midden onderaan een donkere glazen pil met Vijvers, Tuinen, Projecten,
//   Over en FAQ; hover = wit vlak met donkere tekst; de huidige pagina krijgt
//   een donker vlak op Licht en een wit vlak op Donker; vanaf 1024px staat het
//   woordmerk voorop als de weg naar huis;
// - zodra je scrolt schuiven links Weergave en rechts Omhoog erbij, twee ronde
//   oranje knoppen (eigenaar, 10 okt 2026); bovenaan staat de pil alleen;
// - linksonder (vanaf 1024px) Kennismaken ↗ in oranje; tot 1280px schuift
//   de rij naar rechts zodat Weergave er niet tegenaan komt.
// Op de telefoon draagt de pil alleen lijniconen, zonder woorden (eigenaar,
// 10 okt 2026: "Haal de woorden weg op de pil"); het woord blijft voor
// schermlezers. Vanaf 1024px blijft het tekst.
const MENU = [
  { href: "/vijvers", label: { nl: "Vijvers", en: "Ponds" }, icoon: "M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" },
  { href: "/tuinen", label: { nl: "Tuinen", en: "Gardens" }, icoon: "M11 20V9M11 13c-4 0-6-2-6-6 4 0 6 2 6 6zM11 10c0-4 2-6 6-6 0 4-2 6-6 6z" },
  { href: "/werk", label: { nl: "Projecten", en: "Projects" }, icoon: "M3 5h16v12H3zM3 14l5-4 4 3 3-2 4 3" },
  { href: "/over", label: { nl: "Over", en: "About" }, icoon: "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 19c1-4 4-5.5 7-5.5s6 1.5 7 5.5" },
  { href: "/faq", label: { nl: "FAQ", en: "FAQ" }, icoon: "M11 19.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM8.6 8.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.8M11 15.6v.1" },
]

const ITEM = "flex items-center rounded-full py-3 text-[12px] leading-4 font-bold tracking-[-.01em] uppercase no-underline transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
const RUST = "text-gebroken-wit hover:bg-gebroken-wit hover:text-antraciet aria-[current=page]:bg-antraciet aria-[current=page]:text-gebroken-wit dark:aria-[current=page]:bg-white dark:aria-[current=page]:text-antraciet"

export function Menu() {
  const pad = usePathname()
  const taal = useTaal()
  const [boven, setBoven] = useState(true)

  useEffect(() => {
    const meet = () => setBoven(scrollY < 48)
    meet()
    addEventListener("scroll", meet, { passive: true })
    return () => removeEventListener("scroll", meet)
  }, [pad])

  const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
  // de twee knoppen schuiven open naast de pil; bovenaan dicht en onbereikbaar
  const schuif = `relative shrink-0 transition-[width,margin,opacity,scale] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${
    boven ? "pointer-events-none w-0 scale-0 opacity-0" : "pointer-events-auto w-[var(--knop)] scale-100 opacity-100"
  }`
  const rond = "grid size-[var(--knop)] cursor-pointer place-items-center rounded-full bg-oranje text-antraciet shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-2"

  return (
    <>
      <div data-menu className="pointer-events-none fixed inset-x-[var(--goot)] bottom-5 z-[101] flex items-center justify-center lg:bottom-10 lg:max-xl:justify-end">
        <div inert={boven} className={`${schuif} ${boven ? "" : "mr-2"}`}>
          <Weergave knopKlasse={rond} />
        </div>
        <nav aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"} data-menu className="pointer-events-auto max-lg:min-w-0 max-lg:flex-1">
          <ul className="relative m-0 flex list-none items-center justify-between gap-[3px] rounded-full bg-[rgba(32,32,32,.55)] p-[4px] shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] ring-1 ring-gebroken-wit/10 backdrop-blur-md">
            <li aria-hidden className="komeet" />
            <li className="hidden lg:flex">
              {/* het woordmerk, altijd het primaire logo, zonder vlak (eigenaar, 5 okt 2026); op de telefoon staat hij linksboven (kop.tsx) */}
              <Link href="/" aria-label={taal === "en" ? "GRØNN Studio, to the home page" : "GRØNN Studio, naar de voorpagina"} className="flex items-center rounded-full px-2 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit min-[421px]:px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/woordmerk-primair.svg" alt="" className="h-[11px] w-auto min-[421px]:h-[13px]" />
              </Link>
            </li>
            {MENU.map((m) => {
              const actief = pad === m.href || pad.startsWith(m.href + "/")
              return (
                <li key={m.href} className="flex max-lg:min-w-0 max-lg:flex-1">
                  <Link href={m.href} aria-current={actief ? "page" : undefined} className={`${ITEM} max-lg:h-10 max-lg:w-full max-lg:justify-center max-lg:px-1.5 max-lg:py-0 lg:px-3.5 lg:text-[13px] xl:px-5 ${RUST}`}>
                    <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="lg:hidden">
                      <path d={m.icoon} />
                    </svg>
                    <span className="max-lg:sr-only"><T t={m.label} /></span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div inert={boven} className={`${schuif} ${boven ? "" : "ml-2"}`}>
          <button
            type="button"
            onClick={() => scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" })}
            aria-label={taal === "en" ? "Back to top" : "Terug naar boven"}
            className={rond}
          >
            <svg aria-hidden viewBox="0 0 40 40" className="ring-voortgang"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
              <path d="M8 14.5v-12M2.5 8 8 2.5 13.5 8" fill="none" stroke="currentColor" strokeWidth="1.9" />
            </svg>
          </button>
        </div>
      </div>

      <Link
        href="/kennismaken"
        data-menu
        className="group knop fixed bottom-10 left-[var(--rand)] z-[99] gap-9 bg-oranje text-antraciet max-lg:hidden shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-3"
      >
        <span className="block h-4 overflow-hidden leading-4">
          <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
          <span aria-hidden className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
        </span>
        <svg viewBox="0 0 11 14" width="11" height="14" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
        </svg>
      </Link>
    </>
  )
}
