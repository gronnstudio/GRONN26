"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Het verhaal op Over mij schuift zijwaarts terwijl je gewoon naar beneden
// scrolt (eigenaar, 19 okt 2026: "verticaal is normaal scrollen, ik was in
// de war"). Het paneel blijft staan (sticky); één schermhoogte scrollen per
// hoofdstuk. Het spoor volgt de scroll niet stap voor stap maar springt in
// één zachte beweging naar het hoofdstuk waar je bent (eigenaar, 21 okt 2026:
// "scroll snap zodat als ik scroll dat ie snapt op de volgende", en daarna
// "werkt niet mooi, beetje clunky"): zo blijft een hoofdstuk nooit half in
// beeld hangen, waar je ook ophoudt met scrollen. Bij minder beweging staan
// de hoofdstukken gewoon onder elkaar (wereld.css).
export function Zijwaarts({ aantal, children }: { aantal: number; children: ReactNode }) {
  const buiten = useRef<HTMLDivElement>(null)
  const spoor = useRef<HTMLDivElement>(null)
  const lijn = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const b = buiten.current, s = spoor.current
    if (!b || !s) return
    const html = document.documentElement
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    let wacht = 0
    const zet = () => {
      wacht = 0
      if (mq.matches || html.classList.contains("stil")) { s.style.transform = ""; return }
      const r = b.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)))
      const k = Math.round(p * (aantal - 1))
      const stap = (s.scrollWidth - b.clientWidth) / Math.max(1, aantal - 1)
      s.style.transform = `translate3d(${(-k * stap).toFixed(1)}px,0,0)`
      lijn.current?.style.setProperty("--p", ((k + 1) / aantal).toFixed(3))
    }
    const plan = () => { if (!wacht) wacht = requestAnimationFrame(zet) }
    addEventListener("scroll", plan, { passive: true })
    addEventListener("resize", plan)
    mq.addEventListener("change", plan)
    zet()
    return () => {
      removeEventListener("scroll", plan)
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
