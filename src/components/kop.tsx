"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Logo } from "./logo"

// Geen bovenbalk (eigenaar, 5 okt 2026). Vanaf 1024px zit het woordmerk in
// de menupil en Kennismaken linksonder; op de telefoon is daar geen plek, dus
// staan het woordmerk (de weg naar huis) en Kennismaken bovenaan. Ze scrollen
// mee weg en komen terug zodra je omhoog scrolt, in een glazen laag.
export function Kop() {
  const [stand, setStand] = useState<"boven" | "weg" | "terug">("boven")
  useEffect(() => {
    let vorige = scrollY, wacht = 0
    const meet = () => {
      wacht = 0
      const y = scrollY
      if (y < 24) setStand("boven")
      else if (y < vorige - 4) setStand("terug")
      else if (y > vorige + 4) setStand("weg")
      vorige = y
    }
    const plan = () => { if (!wacht) wacht = requestAnimationFrame(meet) }
    addEventListener("scroll", plan, { passive: true })
    return () => { removeEventListener("scroll", plan); cancelAnimationFrame(wacht) }
  }, [])
  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-300 lg:hidden ${
        stand === "weg" ? "-translate-y-full" : ""
      } ${stand === "terug" ? "bg-grond/85 backdrop-blur-md" : ""}`}
    >
      <div className="wrap flex items-center justify-between py-4">
        <Link href="/" aria-label="GRØNN Studio, naar de voorpagina">
          <Logo className="h-[18px] w-auto" />
        </Link>
        <Link
          href="/kennismaken"
          className="inline-flex h-9 items-center rounded-full bg-oranje px-3 text-[11px] font-bold tracking-[.06em] text-antraciet uppercase no-underline"
        >
          Kennismaken
        </Link>
      </div>
    </div>
  )
}
