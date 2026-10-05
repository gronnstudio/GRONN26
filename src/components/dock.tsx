"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// Het menu van het prototype (WF-019…025): links Kennismaken in het ene oranje,
// midden de pil met vier woorden, rechts de pijl (omlaag bovenaan, omhoog
// tijdens het lezen). Op de telefoon alleen de pil.
const MENU = [
  { href: "/vijvers", label: "VIJVERS" },
  { href: "/tuinen", label: "TUINEN" },
  { href: "/werk", label: "WERK" },
  { href: "/over", label: "OVER" },
]

export function Dock() {
  const pad = usePathname()
  const [boven, setBoven] = useState(true)
  useEffect(() => {
    const zet = () => setBoven(scrollY < 48)
    zet()
    addEventListener("scroll", zet, { passive: true })
    return () => removeEventListener("scroll", zet)
  }, [])
  const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
  const pijl = () =>
    boven
      ? scrollBy({ top: innerHeight * 0.85, behavior: stil() ? "auto" : "smooth" })
      : scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" })

  return (
    <nav aria-label="Hoofdmenu" className="fixed inset-x-0 bottom-4 z-50 mx-auto grid max-w-[1440px] grid-cols-1 items-center px-3 md:grid-cols-[1fr_auto_1fr] md:px-[var(--goot)]">
      <Link
        href="/kennismaken"
        className="hidden h-[52px] items-center justify-self-start rounded-full bg-oranje px-6 text-xs font-semibold tracking-[.1em] text-antraciet no-underline md:flex"
      >
        KENNISMAKEN
      </Link>
      <div className="grid h-[52px] w-full grid-cols-4 rounded-full bg-antraciet/90 p-[5px] text-[11px] font-semibold tracking-[.1em] text-gebroken-wit ring-1 ring-gebroken-wit/15 backdrop-blur md:w-[440px] md:text-xs">
        {MENU.map((m) => {
          const actief = pad === m.href || pad.startsWith(m.href + "/")
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={actief ? "page" : undefined}
              className={`grid place-items-center rounded-full no-underline ${actief ? "bg-gebroken-wit text-antraciet" : ""}`}
            >
              {m.label}
            </Link>
          )
        })}
      </div>
      <button
        type="button"
        onClick={pijl}
        aria-label={boven ? "Naar beneden" : "Terug naar boven"}
        className="hidden size-[52px] cursor-pointer place-items-center justify-self-end rounded-full bg-antraciet/90 text-gebroken-wit ring-1 ring-gebroken-wit/15 md:grid"
      >
        <span aria-hidden className={`transition-transform duration-300 ${boven ? "" : "rotate-180"}`}>↓</span>
      </button>
    </nav>
  )
}
