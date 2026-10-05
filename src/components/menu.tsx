"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Weergave } from "./weergave"

// Het menu van bartoszkolenda.com, één op één (eigenaar, 5 okt 2026: "mimiek
// dit helemaal uit bartoszkolenda site"), met hun lichtgroen als ons ene
// oranje:
// - midden onderaan een donkere glazen pil met lichte woorden; hover = wit
//   vlak met donkere tekst;
//   de huidige pagina licht niet op; het woordmerk is de weg naar huis, de
//   regelaar zit achteraan;
// - linksonder (vanaf 1024px) Kennismaken ↗ in oranje;
// - rechtsonder de ronde pijl (omlaag bovenaan, omhoog tijdens het lezen) die
//   omkeert met de grond eronder: oranje op donker, antraciet op licht.
const MENU = [
  { href: "/vijvers", label: "Vijvers" },
  { href: "/tuinen", label: "Tuinen" },
  { href: "/werk", label: "Werk" },
  { href: "/over", label: "Over" },
]

const ITEM = "flex items-center rounded-full py-3 text-[12px] leading-4 font-bold tracking-[-.01em] uppercase no-underline transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit"
const RUST = "text-gebroken-wit hover:bg-gebroken-wit hover:text-antraciet"

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
      <nav aria-label="Hoofdmenu" data-menu className="fixed bottom-5 left-1/2 z-[101] -translate-x-1/2 lg:bottom-10">
        <ul className="m-0 flex list-none items-center gap-[3px] rounded-full bg-[rgba(32,32,32,.55)] p-[4px] shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] ring-1 ring-gebroken-wit/10 backdrop-blur-md">
          <li className="flex">
            {/* het woordmerk, altijd het primaire logo, zonder vlak (eigenaar, 5 okt 2026) */}
            <Link href="/" aria-label="GRØNN Studio, naar de voorpagina" className="flex items-center rounded-full px-2 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit min-[421px]:px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair.svg" alt="" className="h-[11px] w-auto min-[421px]:h-[13px]" />
            </Link>
          </li>
          {MENU.map((m) => {
            const actief = pad === m.href || pad.startsWith(m.href + "/")
            return (
              <li key={m.href} className="flex">
                <Link href={m.href} aria-current={actief ? "page" : undefined} className={`${ITEM} px-2 text-[11px] min-[421px]:px-3.5 min-[421px]:text-[13px] lg:px-5 ${RUST}`}>
                  {m.label}
                </Link>
              </li>
            )
          })}
          <li className="flex">
            <Weergave knopKlasse="text-gebroken-wit hover:bg-gebroken-wit hover:text-antraciet aria-expanded:bg-gebroken-wit aria-expanded:text-antraciet" />
          </li>
        </ul>
      </nav>

      <Link
        href="/kennismaken"
        data-menu
        className="group fixed bottom-10 left-10 z-[99] hidden items-center gap-9 rounded-full bg-oranje py-[15px] pr-5 pl-6 text-[13px] leading-4 font-bold tracking-[-.01em] text-antraciet uppercase no-underline shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-3 lg:inline-flex"
      >
        <span className="block h-4 overflow-hidden">
          <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">Kennismaken</span>
          <span aria-hidden className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">Kennismaken</span>
        </span>
        <svg viewBox="0 0 11 14" width="11" height="14" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
        </svg>
      </Link>

      <button
        type="button"
        onClick={pijl}
        data-menu
        data-pijl
        aria-label={boven ? "Naar beneden" : "Terug naar boven"}
        className={`fixed right-10 bottom-10 z-[99] hidden size-[52px] cursor-pointer place-items-center rounded-full shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 lg:grid ${
          pijlOpLicht ? "bg-antraciet text-oranje" : "bg-oranje text-antraciet"
        }`}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={`transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${boven ? "" : "rotate-180"}`}>
          <path d="M8 1.5v12M2.5 8 8 13.5 13.5 8" fill="none" stroke="currentColor" strokeWidth="1.9" />
        </svg>
      </button>
    </>
  )
}
