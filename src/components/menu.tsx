"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Weergave } from "./weergave"
import { T } from "./taal"
import { useTaal } from "./taal-klant"

// Het menu van bartoszkolenda.com, één op één (eigenaar, 5 okt 2026: "mimiek
// dit helemaal uit bartoszkolenda site"), met hun lichtgroen als ons ene
// oranje:
// - midden onderaan een donkere glazen pil met lichte woorden; hover = wit
//   vlak met donkere tekst;
//   de huidige pagina krijgt een donker vlak op Licht en een wit vlak op
//   Donker (eigenaar, 5 okt 2026); de pijl en zijn ring zijn wit op Licht en
//   antraciet op Donker; het woordmerk is de weg naar huis, de
//   regelaar zit achteraan;
// - linksonder (vanaf 1024px) Kennismaken ↗ in oranje;
// - rechtsonder de ronde pijl (omlaag bovenaan, omhoog tijdens het lezen) die
//   omkeert met de grond eronder: oranje op donker, antraciet op licht.
// Op de telefoon draagt elk woord een lijnicoon met een klein label eronder
// (eigenaar, 5 okt 2026; zichtbaar en heel klein sinds 10 okt 2026, "zonder
// menu te veranderen": de pil blijft even hoog); vanaf 1024px blijft het tekst.
const MENU = [
  { href: "/vijvers", label: { nl: "Vijvers", en: "Ponds" }, icoon: "M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" },
  { href: "/tuinen", label: { nl: "Tuinen", en: "Gardens" }, icoon: "M11 20V9M11 13c-4 0-6-2-6-6 4 0 6 2 6 6zM11 10c0-4 2-6 6-6 0 4-2 6-6 6z" },
  { href: "/werk", label: { nl: "Werk", en: "Work" }, icoon: "M3 5h16v12H3zM3 14l5-4 4 3 3-2 4 3" },
  { href: "/over", label: { nl: "Over", en: "About" }, icoon: "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 19c1-4 4-5.5 7-5.5s6 1.5 7 5.5" },
  { href: "/faq", label: { nl: "FAQ", en: "FAQ" }, icoon: "M11 19.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM8.6 8.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.8M11 15.6v.1" },
]

const ITEM = "flex items-center rounded-full py-3 text-[12px] leading-4 font-bold tracking-[-.01em] uppercase no-underline transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
const RUST = "text-gebroken-wit hover:bg-gebroken-wit hover:text-antraciet aria-[current=page]:bg-antraciet aria-[current=page]:text-gebroken-wit dark:aria-[current=page]:bg-white dark:aria-[current=page]:text-antraciet"

/** Helderheid van de grond onder een punt: 0 donker … 1 licht; een foto telt als donker. */
function grondOnder(x: number, y: number): number {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest("[data-menu]")) continue
    if (el.tagName === "IMG" || el.tagName === "VIDEO") return 0.3
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)
    if (m && (m[3] === undefined || +m[3] > 0.5)) {
      const [r, g, b] = m.map(Number)
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    }
  }
  return 1
}

export function Menu() {
  const pad = usePathname()
  const taal = useTaal()
  const [boven, setBoven] = useState(true)
  const [pijlOpLicht, setPijlOpLicht] = useState(false)

  useEffect(() => {
    let wacht = 0
    const meet = () => {
      wacht = 0
      setBoven(scrollY < 48)
      const p = document.querySelector<HTMLElement>("[data-pijl]")
      if (p && p.offsetParent) {
        const r = p.getBoundingClientRect()
        setPijlOpLicht(grondOnder(r.left + r.width / 2, r.top + r.height / 2) > 0.5)
      }
    }
    const plan = () => { if (!wacht) wacht = requestAnimationFrame(meet) }
    meet()
    addEventListener("scroll", plan, { passive: true })
    addEventListener("resize", plan)
    const mo = new MutationObserver(plan)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    const t = setTimeout(meet, 400)
    return () => { removeEventListener("scroll", plan); removeEventListener("resize", plan); mo.disconnect(); clearTimeout(t); cancelAnimationFrame(wacht) }
  }, [pad])

  const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
  const pijl = () => (boven ? scrollBy({ top: innerHeight * 0.85, behavior: stil() ? "auto" : "smooth" }) : scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" }))

  return (
    <>
      <nav aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"} data-menu className="fixed bottom-5 left-[var(--goot)] z-[101] max-lg:right-[calc(var(--goot)+56px)] lg:left-1/2 lg:-translate-x-1/2 lg:bottom-10">
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
                <Link href={m.href} aria-current={actief ? "page" : undefined} className={`${ITEM} max-lg:h-10 max-lg:w-full max-lg:flex-col max-lg:justify-center max-lg:gap-[3px] max-lg:px-1.5 max-lg:py-0 lg:px-3.5 lg:text-[13px] xl:px-5 ${RUST}`}>
                  <svg viewBox="0 0 22 22" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="lg:hidden">
                    <path d={m.icoon} />
                  </svg>
                  <span className="max-lg:text-[9px] max-[380px]:text-[8px] max-lg:leading-[10px] max-lg:font-medium max-lg:tracking-normal max-lg:normal-case"><T t={m.label} /></span>
                </Link>
              </li>
            )
          })}
          <li className="flex max-lg:min-w-0 max-lg:flex-[1.3]">
            <Weergave knopKlasse="text-gebroken-wit hover:bg-gebroken-wit hover:text-antraciet aria-expanded:bg-gebroken-wit aria-expanded:text-antraciet" />
          </li>
        </ul>
      </nav>

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

      {/* op de telefoon: de oranje pijl naast de pil, altijd zichtbaar; omlaag
          bovenaan, omhoog tijdens het lezen (zoals Kolenda; eigenaar, 5 okt 2026) */}
      <button
        type="button"
        onClick={pijl}
        data-menu
        aria-label={taal === "en" ? (boven ? "Scroll down" : "Back to top") : (boven ? "Naar beneden" : "Terug naar boven")}
        className="fixed right-[var(--goot)] bottom-5 z-[101] grid size-[var(--knop)] cursor-pointer place-items-center rounded-full bg-oranje text-antraciet shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
      >
        <svg aria-hidden viewBox="0 0 40 40" className="ring-voortgang"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden className={`transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${boven ? "" : "rotate-180"}`}>
          <path d="M8 1.5v12M2.5 8 8 13.5 13.5 8" fill="none" stroke="currentColor" strokeWidth="1.9" />
        </svg>
      </button>
      <button
        type="button"
        onClick={pijl}
        data-menu
        data-pijl
        aria-label={taal === "en" ? (boven ? "Scroll down" : "Back to top") : (boven ? "Naar beneden" : "Terug naar boven")}
        className={`fixed right-[var(--rand)] bottom-10 z-[99] hidden size-[var(--knop)] cursor-pointer place-items-center rounded-full shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 lg:grid ${
          pijlOpLicht ? "bg-antraciet text-oranje" : "bg-oranje text-antraciet"
        }`}
      >
        <svg aria-hidden viewBox="0 0 40 40" className="ring-voortgang"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={`transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${boven ? "" : "rotate-180"}`}>
          <path d="M8 1.5v12M2.5 8 8 13.5 13.5 8" fill="none" stroke="currentColor" strokeWidth="1.9" />
        </svg>
      </button>
    </>
  )
}
