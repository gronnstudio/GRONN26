"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Het verhaal op Over mij schuift zijwaarts terwijl je gewoon naar beneden
// scrolt (eigenaar, 19 okt 2026: "verticaal is normaal scrollen, ik was in
// de war"). Het paneel blijft staan (sticky) en het spoor met de hoofdstukken
// schuift naar links, één schermhoogte scrollen per hoofdstuk. Bij minder
// beweging staan de hoofdstukken gewoon onder elkaar (wereld.css).
// Komt het scrollen binnen het verhaal tot rust, dan schuift de pagina door
// naar het volgende (of vorige) hoofdstuk (eigenaar, 21 okt 2026: "scroll
// snap zodat als ik scroll dat ie snapt op de volgende"). Geen CSS-snap:
// die zou je aan het eind van het verhaal terugtrekken in plaats van door
// te laten naar de rest van de pagina.
export function Zijwaarts({ aantal, children }: { aantal: number; children: ReactNode }) {
  const buiten = useRef<HTMLDivElement>(null)
  const spoor = useRef<HTMLDivElement>(null)
  const lijn = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const b = buiten.current, s = spoor.current
    if (!b || !s) return
    const html = document.documentElement
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    let wacht = 0, rust = 0, vinger = false
    let vanaf = 0 // het hoofdstuk waar het scrollen begon
    const stil = () => mq.matches || html.classList.contains("stil")
    const stand = () => {
      const r = b.getBoundingClientRect(), baan = Math.max(1, r.height - innerHeight)
      return { y: -r.top, baan, t: (-r.top / baan) * (aantal - 1) }
    }
    const zet = () => {
      wacht = 0
      if (stil()) { s.style.transform = ""; return }
      const r = b.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)))
      // elk hoofdstuk blijft even stilstaan om te lezen en schuift dan door
      const t = p * (aantal - 1), k = Math.min(Math.floor(t), aantal - 2), f = t - k
      const g = Math.min(1, Math.max(0, (f - 0.25) / 0.5)), zacht = g * g * (3 - 2 * g)
      const stap = (s.scrollWidth - b.clientWidth) / Math.max(1, aantal - 1)
      s.style.transform = `translate3d(${(-(k + zacht) * stap).toFixed(1)}px,0,0)`
      lijn.current?.style.setProperty("--p", ((k + zacht + 1) / aantal).toFixed(3))
    }
    const snap = () => {
      rust = 0
      if (vinger || stil()) return
      const { y, baan, t } = stand()
      if (y <= 0 || y >= baan) { vanaf = t; return }
      const d = t - vanaf
      // al een klein stukje scrollen is genoeg voor het volgende hoofdstuk
      let doel = Math.abs(d) <= 0.08 ? Math.round(t)
        : d > 0 ? Math.max(Math.ceil(vanaf + 0.08), Math.round(t))
        : Math.min(Math.floor(vanaf - 0.08), Math.round(t))
      doel = Math.min(aantal - 1, Math.max(0, doel))
      vanaf = doel
      const naar = (doel / (aantal - 1)) * baan - y
      if (Math.abs(naar) > 1) scrollBy({ top: naar, behavior: "smooth" })
    }
    const plan = () => {
      if (!wacht) wacht = requestAnimationFrame(zet)
      clearTimeout(rust)
      rust = window.setTimeout(snap, 140)
    }
    const neer = () => { vinger = true; clearTimeout(rust) }
    const op = () => { vinger = false; clearTimeout(rust); rust = window.setTimeout(snap, 140) }
    vanaf = stand().t
    addEventListener("scroll", plan, { passive: true })
    addEventListener("touchstart", neer, { passive: true })
    addEventListener("touchend", op, { passive: true })
    addEventListener("touchcancel", op, { passive: true })
    addEventListener("resize", plan)
    mq.addEventListener("change", plan)
    zet()
    return () => {
      removeEventListener("scroll", plan)
      removeEventListener("touchstart", neer)
      removeEventListener("touchend", op)
      removeEventListener("touchcancel", op)
      clearTimeout(rust)
      removeEventListener("resize", plan)
      mq.removeEventListener("change", plan)
      cancelAnimationFrame(wacht)
    }
  }, [aantal])

  return (
    <div ref={buiten} className="w-zijwaarts" style={{ "--n": aantal } as React.CSSProperties}>
      <div className="w-paneel">
        <div ref={lijn} className="w-voortgang" aria-hidden="true"><span /></div>
        <div ref={spoor} className="w-spoor">{children}</div>
      </div>
    </div>
  )
}
