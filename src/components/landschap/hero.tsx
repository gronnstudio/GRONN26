"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { Beeld } from "./beeld"
import { TUIN } from "./beelden"

// HeroLandscape (brief §06, beelden 01-03 en 19): dezelfde tuin trekt zich bij
// gewone scroll terug van schermrand naar het redactionele kader, hoeken van 0
// naar 6px. Alleen clip-path en transform; de ruimte ligt vast, dus niets
// verschuift. Bij minder beweging (instelling of systeem) staat het beeld
// meteen in zijn eindstand (beeld 03). De tekst eronder beweegt niet.
export function HeroLandschap({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const html = document.documentElement
    const stil = () => html.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let zichtbaar = true
    const zet = () => {
      frame = 0
      const p = stil() ? 1 : Math.min(1, Math.max(0, scrollY / (innerHeight * 0.6)))
      el.style.setProperty("--p", p.toFixed(3))
    }
    const vraag = () => {
      if (zichtbaar && !frame) frame = requestAnimationFrame(zet)
    }
    // alleen rekenen zolang de opening in beeld is
    const io = new IntersectionObserver(([e]) => {
      zichtbaar = e.isIntersecting
      if (zichtbaar) vraag()
    })
    io.observe(el)
    zet()
    addEventListener("scroll", vraag, { passive: true })
    addEventListener("resize", vraag)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      removeEventListener("scroll", vraag)
      removeEventListener("resize", vraag)
    }
  }, [])

  return (
    <section ref={ref} className="ls-hero" aria-labelledby="ls-titel">
      <div className="ls-hero-kader">
        <Beeld beeld={TUIN} sizes="100vw" priority className="ls-hero-beeld" />
      </div>
      {children}
    </section>
  )
}
