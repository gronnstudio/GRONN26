"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { KENNISMAKEN, NAV } from "@/data/site"

// Het menu onderaan, op elke pagina in dezelfde vorm.
//
//   [ KENNISMAKEN ]      [ VIJVERS  TUINEN  WERK  OVER ]      [ ↓ ]
//
// Links de ene oranje actie, in het midden het glas met de vier woorden
// (het actieve woord op salie), rechts een ronde pijl: omlaag zolang je
// bovenaan staat (verder lezen), omhoog zodra je leest (terug naar boven).
// Op de telefoon is de pil schermbreed; Kennismaken staat dan bovenin en
// de pijl valt weg — daar is scrollen met de duim al de snelste weg.

const actiefIndex = (pad: string) =>
  NAV.findIndex((item) => pad === item.href || pad.startsWith(`${item.href}/`))

function useBovenaan() {
  const [bovenaan, setBovenaan] = useState(true)
  useEffect(() => {
    let frame = 0
    const meet = () => {
      frame = 0
      setBovenaan(window.scrollY < 48)
    }
    const opScroll = () => {
      if (!frame) frame = requestAnimationFrame(meet)
    }
    meet()
    window.addEventListener("scroll", opScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", opScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return bovenaan
}

const rustig = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.dataset.motion === "reduced"

export function BottomNavigation() {
  const pad = usePathname()
  const actief = actiefIndex(pad)
  const bovenaan = useBovenaan()

  const pijl = () => {
    const behavior: ScrollBehavior = rustig() ? "auto" : "smooth"
    if (bovenaan) window.scrollBy({ top: window.innerHeight * 0.85, behavior })
    else window.scrollTo({ top: 0, behavior })
  }

  return (
    <nav
      aria-label="Hoofdmenu"
      className="fixed inset-x-0 z-40 bottom-[calc(var(--dock-onder)+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto grid max-w-[calc(1520px+var(--goot)*2)] grid-cols-1 items-center px-[12px] sm:grid-cols-[1fr_auto_1fr] sm:px-[var(--goot)]">
        <Link
          href={KENNISMAKEN.href}
          aria-current={pad === KENNISMAKEN.href ? "page" : undefined}
          className="hidden h-[var(--dock-hoogte)] items-center justify-self-start rounded-full bg-gronn-oranje px-[24px] text-[12px] font-semibold uppercase tracking-[0.1em] text-gronn-antraciet transition-[background-color,transform] duration-300 hover:-translate-y-[2px] sm:inline-flex"
        >
          {KENNISMAKEN.label}
        </Link>

        <ul className="dock-glas relative grid h-[var(--dock-hoogte)] w-full grid-cols-4 rounded-full p-[5px] sm:w-[440px]">
          {/* De salie vulling glijdt naar het actieve woord. */}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-[5px] left-[5px] w-[calc((100%-10px)/4)] rounded-full bg-gronn-salie transition-[transform,opacity] duration-500 ease-[var(--ease-rust)] motion-reduce:transition-none"
            style={{
              transform: `translateX(${Math.max(actief, 0) * 100}%)`,
              opacity: actief < 0 ? 0 : 1,
            }}
          />
          {NAV.map((item, i) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={i === actief ? "page" : undefined}
                className="group flex h-full items-center justify-center rounded-full text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 aria-[current=page]:text-gronn-bos [&:not([aria-current])]:text-gronn-wit/85 [&:not([aria-current])]:hover:text-gronn-wit"
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-[1px]">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={pijl}
          aria-label={bovenaan ? "Verder naar beneden" : "Terug naar boven"}
          className="dock-glas hidden size-[var(--dock-hoogte)] place-items-center justify-self-end rounded-full transition-transform duration-300 hover:-translate-y-[2px] sm:grid"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            aria-hidden="true"
            className="transition-transform duration-500 ease-[var(--ease-rust)] motion-reduce:transition-none"
            style={{ transform: bovenaan ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <path d="M9 2.5v13M3.5 10 9 15.5 14.5 10" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
