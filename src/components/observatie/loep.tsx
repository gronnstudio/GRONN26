"use client"

import { useEffect, useRef } from "react"

// Loep (18 okt 2026, eigenaar: "maak een looking glass ergens op de foto
// wanneer je met cursor erop staat, maak dit enkel op desktop"). Een ronde
// lens volgt de cursor en vergroot de foto eronder, met een vizier en de
// positie in procenten. Alleen met een echte muis op een breed scherm; op
// een telefoon of tablet bestaat hij niet. De lens ligt ónder de kaders,
// zodat hoekhaken en labels er gewoon overheen blijven staan.

const ZOOM = 2.5
const DESKTOP = "(hover: hover) and (pointer: fine) and (min-width: 900px)"

export function Loep({ src }: { src: string }) {
  const lens = useRef<HTMLDivElement>(null)
  const pos = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const l = lens.current
    const vak = l?.parentElement
    if (!l || !vak) return
    const mq = matchMedia(DESKTOP)
    let raf = 0
    let laatst: PointerEvent | null = null
    let geladen = false

    const teken = () => {
      raf = 0
      const e = laatst
      if (!e) return
      const r = vak.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const half = l.offsetWidth / 2
      l.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`
      l.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`
      l.style.backgroundPosition = `${half - x * ZOOM}px ${half - y * ZOOM}px`
      // De positie staat boven de lens; bovenaan de foto eronder, anders valt hij weg.
      l.classList.toggle("o-loep-onder", y < half + 36)
      if (pos.current) pos.current.textContent = `x ${Math.round((x / r.width) * 100)} · y ${Math.round((y / r.height) * 100)}`
    }
    const beweeg = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !mq.matches) return
      // De volle foto pas laden als iemand er echt met de muis op komt.
      if (!geladen) {
        // Via de beeldoptimalisatie (AVIF/WebP) in plaats van de ruwe JPEG.
        l.style.backgroundImage = `url("/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75")`
        geladen = true
      }
      laatst = e
      l.classList.add("o-loep-aan")
      if (!raf) raf = requestAnimationFrame(teken)
    }
    const weg = () => l.classList.remove("o-loep-aan")

    vak.addEventListener("pointermove", beweeg)
    vak.addEventListener("pointerleave", weg)
    return () => {
      vak.removeEventListener("pointermove", beweeg)
      vak.removeEventListener("pointerleave", weg)
      cancelAnimationFrame(raf)
    }
  }, [src])

  return (
    <div ref={lens} className="o-loep" aria-hidden="true">
      <span className="o-loep-info">
        <span ref={pos}>x 0 · y 0</span> · {String(ZOOM).replace(".", ",")}×
      </span>
    </div>
  )
}
