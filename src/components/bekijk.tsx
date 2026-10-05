"use client"

import { useEffect, useRef } from "react"
import { T } from "./taal"

// Kolenda's "View ↗": boven een link met een foto loopt een glazen knopje
// "Bekijk ↗" met de muis mee. Alleen met een muis; niet bij minder beweging.
export function Bekijk() {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const b = el.current
    if (!b) return
    let mx = 0, my = 0, x = 0, y = 0, aan = false, loopt = false
    const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
    const volg = () => {
      x += (mx - x) * 0.2
      y += (my - y) * 0.2
      b.style.transform = `translate3d(${(x - b.offsetWidth / 2).toFixed(1)}px,${(y - b.offsetHeight / 2).toFixed(1)}px,0)`
      if (aan || Math.abs(mx - x) > 0.5) requestAnimationFrame(volg)
      else loopt = false
    }
    const beweeg = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      const t = e.target as Element | null
      const link = t?.closest?.("main a")
      const nu = !!link && !!link.querySelector("img") && !stil()
      if (nu && !aan) { x = mx; y = my }
      aan = nu
      b.classList.toggle("opacity-100", nu)
      b.classList.toggle("scale-100", nu)
      if (nu && !loopt) { loopt = true; requestAnimationFrame(volg) }
    }
    addEventListener("mousemove", beweeg, { passive: true })
    return () => removeEventListener("mousemove", beweeg)
  }, [])
  return (
    <div
      ref={el}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[90] flex scale-75 items-center gap-6 rounded-full bg-[rgba(239,238,234,.18)] px-8 py-5 text-[15px] leading-none font-bold tracking-[-.01em] text-gebroken-wit uppercase opacity-0 backdrop-blur-md transition-[opacity,scale] duration-300"
    >
      <T t={{ nl: "Bekijk", en: "View" }} />
      <svg viewBox="0 0 11 14" width="11" height="14">
        <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
      </svg>
    </div>
  )
}
