"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

// Veegrijen die meeschuiven met het scrollen (Nick, 21 nov 2026: "Laat zulke
// dingen automatisch scrollen bij scrollen met scrollsnap"). Alleen op de
// telefoon: terwijl een rij van onder naar boven door het scherm gaat, schuift
// hij kaart voor kaart door, en elke stap klikt vast op een kaart (de rij
// heeft scroll-snap). Vegen met de duim blijft werken; na een veeg wacht het
// meeschuiven even. Bij minder beweging gebeurt er niets vanzelf.
const RIJEN = ".ls-werkraster, .ls-stappen, .ls-beeldrij"

export function AutoVegen() {
  const pad = usePathname()
  useEffect(() => {
    const smal = matchMedia("(max-width: 767px)")
    const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
    const rijen = [...document.querySelectorAll<HTMLElement>(RIJEN)]
    if (!rijen.length) return
    const stand = new Map<HTMLElement, number>()
    const gerakt = new Map<HTMLElement, number>()
    const raak = (e: Event) => gerakt.set(e.currentTarget as HTMLElement, Date.now())
    rijen.forEach((r) => r.addEventListener("touchstart", raak, { passive: true }))

    let frame = 0
    const stap = () => {
      frame = 0
      if (!smal.matches || stil()) return
      const vh = innerHeight
      for (const rij of rijen) {
        const kaarten = [...rij.children] as HTMLElement[]
        if (kaarten.length < 2 || rij.scrollWidth <= rij.clientWidth + 4) continue
        if (Date.now() - (gerakt.get(rij) ?? 0) < 1500) continue
        const top = rij.getBoundingClientRect().top
        // van 75 % tot 10 % van de schermhoogte loopt de rij van de eerste naar de laatste kaart
        const p = Math.min(1, Math.max(0, (vh * 0.75 - top) / (vh * 0.65)))
        const i = Math.round(p * (kaarten.length - 1))
        if (stand.get(rij) === i) continue
        stand.set(rij, i)
        const links = kaarten[i].offsetLeft - kaarten[0].offsetLeft
        rij.scrollTo({ left: links, behavior: "smooth" })
      }
    }
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(stap)
    }
    addEventListener("scroll", scroll, { passive: true })
    return () => {
      removeEventListener("scroll", scroll)
      rijen.forEach((r) => r.removeEventListener("touchstart", raak))
      cancelAnimationFrame(frame)
    }
  }, [pad])
  return null
}
