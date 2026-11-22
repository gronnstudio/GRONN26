"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

// Veegrijen die meeschuiven met het scrollen (Nick, 21 nov 2026: "Laat zulke
// dingen automatisch scrollen bij scrollen met scrollsnap" en "Moet het wel
// eerst centraal in beeld zijn, anders zie ik het niet"). Alleen op de
// telefoon: de rij blijft midden in beeld staan (sticky) en schuift kaart voor
// kaart door terwijl je verder scrollt; elke stap klikt vast op een kaart. Na
// de laatste kaart scrolt de pagina gewoon verder. Vegen met de duim blijft
// werken; bij minder beweging staat alles stil en veeg je zelf. De kop erboven
// reist mee, zodat je ziet waar de kaarten bij horen (geen leeg scherm).
const RIJEN = ".ls-werkraster, .ls-beeldrij, .ls-beeldkaarten"
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

    const kopVan = (rij: HTMLElement) => {
      const k = rij.previousElementSibling as HTMLElement | null
      return k && k.offsetParent ? k : null
    }
    const verschoven = new Map<HTMLElement, number>()
    const wegVan = new Map<HTMLElement, number>()
    const los = (rij: HTMLElement) => {
      for (const p of ["position", "top", "margin-top"]) rij.style.removeProperty(p)
      kopVan(rij)?.style.removeProperty("transform")
      verschoven.delete(rij)
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
        // kop + rij samen midden in beeld
        const kop = kopVan(rij)
        const kopH = kop ? kop.offsetHeight + 32 : 0
        const top = Math.max(64, (vh - rij.offsetHeight - kopH) / 2) + kopH
        const weg = (kaartenVan(rij).length - 1) * PER_KAART * vh
        wegVan.set(rij, weg)
        ouder.style.minHeight = `${Math.round(ouder.offsetHeight + weg)}px`
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
        const kaarten = kaartenVan(rij)
        const kop = kopVan(rij)
        const vast = parseFloat(rij.style.top) || 0
        const weg = wegVan.get(rij) ?? (kaarten.length - 1) * PER_KAART * innerHeight
        // hoe ver de rij al vaststaat: van 0 (net midden in beeld) tot de hele scrollweg
        const nu = verschoven.get(rij) ?? 0
        const natuurlijk = kop ? kop.getBoundingClientRect().bottom - nu + 32 : rij.getBoundingClientRect().top
        // de kop volgt de echte plek van de rij (niet een rekensom met de schermhoogte:
        // op de iPhone verandert die met de adresbalk en schoot de kop over de kaarten)
        const d = Math.max(0, rij.getBoundingClientRect().top - natuurlijk)
        if (kop && Math.abs(d - nu) > 0.5) {
          kop.style.transform = d ? `translateY(${Math.round(d)}px)` : ""
          verschoven.set(rij, d)
        }
        if (Date.now() - (gerakt.get(rij) ?? 0) < 1500) continue
        const p = Math.min(1, d / weg)
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
