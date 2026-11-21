"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

// Veegrijen die meeschuiven met het scrollen (Nick, 21 nov 2026: "Laat zulke
// dingen automatisch scrollen bij scrollen met scrollsnap" en "Moet het wel
// eerst centraal in beeld zijn, anders zie ik het niet"). Alleen op de
// telefoon: de rij blijft midden in beeld staan (sticky) en schuift kaart voor
// kaart door terwijl je verder scrollt; elke stap klikt vast op een kaart. Na
// de laatste kaart scrolt de pagina gewoon verder. Vegen met de duim blijft
// werken; bij minder beweging staat alles stil en veeg je zelf.
const RIJEN = ".ls-werkraster, .ls-stappen, .ls-beeldrij"
const PER_KAART = 0.38 // zoveel schermhoogte scrollen per kaart

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

    const kaartenVan = (rij: HTMLElement) => [...rij.children].filter((k) => (k as HTMLElement).offsetParent) as HTMLElement[]
    const actief = (rij: HTMLElement) => smal.matches && !stil() && kaartenVan(rij).length > 1 && rij.scrollWidth > rij.clientWidth + 4

    const los = (rij: HTMLElement) => {
      for (const p of ["position", "top", "margin-top"]) rij.style.removeProperty(p)
      rij.parentElement?.style.removeProperty("display")
      rij.parentElement?.style.removeProperty("min-height")
    }
    // vastzetten: de rij plakt midden in beeld, de ruimte eronder is de scrollweg
    const zet = () => {
      for (const rij of rijen) {
        los(rij)
        if (!actief(rij)) continue
        // de ouder wordt een gewoon blok dat de scrollweg extra hoog is; daarbinnen plakt de rij
        const ouder = rij.parentElement!
        ouder.style.display = "block"
        const vh = innerHeight
        const top = Math.max(64, (vh - rij.offsetHeight) / 2)
        ouder.style.minHeight = `${Math.round(ouder.offsetHeight + (kaartenVan(rij).length - 1) * PER_KAART * vh)}px`
        rij.style.position = "sticky"
        rij.style.top = `${Math.round(top)}px`
        rij.style.marginTop = "32px"
      }
    }

    let frame = 0
    const stap = () => {
      frame = 0
      for (const rij of rijen) {
        if (!actief(rij)) continue
        if (Date.now() - (gerakt.get(rij) ?? 0) < 1500) continue
        const kaarten = kaartenVan(rij)
        const voor = rij.previousElementSibling as HTMLElement | null
        const vast = parseFloat(rij.style.top) || 0
        // hoe ver de rij al vaststaat: van 0 (net midden in beeld) tot de hele scrollweg
        const natuurlijk = voor ? voor.getBoundingClientRect().bottom : rij.getBoundingClientRect().top
        const weg = (kaarten.length - 1) * PER_KAART * innerHeight
        const p = Math.min(1, Math.max(0, (vast - natuurlijk) / weg))
        const i = Math.round(p * (kaarten.length - 1))
        if (stand.get(rij) === i) continue
        stand.set(rij, i)
        rij.scrollTo({ left: kaarten[i].offsetLeft - kaarten[0].offsetLeft, behavior: "smooth" })
      }
    }
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(stap)
    }
    // alleen bij een andere breedte opnieuw meten: op de iPhone verandert de hoogte bij elke adresbalk
    let breedte = innerWidth
    const maat = () => {
      if (innerWidth === breedte && smal.matches) return
      breedte = innerWidth
      zet()
      scroll()
    }
    zet()
    addEventListener("scroll", scroll, { passive: true })
    addEventListener("resize", maat)
    smal.addEventListener("change", maat)
    return () => {
      removeEventListener("scroll", scroll)
      removeEventListener("resize", maat)
      smal.removeEventListener("change", maat)
      rijen.forEach((r) => {
        r.removeEventListener("touchstart", raak)
        los(r)
      })
      cancelAnimationFrame(frame)
    }
  }, [pad])
  return null
}
