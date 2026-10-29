"use client"

import { useEffect, useRef, useState } from "react"

import { useReducedMotion } from "@/lib/use-reduced-motion"
import { eenmaalInBeeld } from "./in-beeld"

type Fase = "rust" | "wacht" | "loopt" | "klaar"

/**
 * Een getal in Nederlandse schrijfwijze: "." groepeert duizendtallen, ","
 * scheidt decimalen. `motion/count-up.tsx` las "5.000" als 5,0 — hier
 * blijft de groepering heel en eindigt de telling altijd op de
 * OORSPRONKELIJKE tekst, niet op een nageformatteerd getal.
 */
function ontleed(waarde: string) {
  const m = waarde.match(/(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?/)
  if (!m || m.index === undefined) return null
  const [heel, dec = ""] = m[0].split(",")
  const groepeer = heel.includes(".")
  const doel = parseFloat(heel.replace(/\./g, "") + (dec ? `.${dec}` : ""))
  const voor = waarde.slice(0, m.index)
  const na = waarde.slice(m.index + m[0].length)
  const maak = (n: number) => {
    const [i, d] = n.toFixed(dec.length).split(".")
    return voor + (groepeer ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : i) + (d ? `,${d}` : "") + na
  }
  return { doel, maak }
}

/**
 * Telt een getal op vanaf nul zodra het in beeld komt.
 *
 * - De server-HTML draagt de ECHTE waarde (SEO, zonder JS).
 * - Alleen een getal dat bij het laden ONDER het scherm staat, springt
 *   (onzichtbaar) naar nul en telt op als het in beeld komt. Staat het
 *   al in beeld, dan blijft het staan: van de echte waarde terug naar nul
 *   springen is een flits, geen beweging.
 * - Een schermlezer hoort altijd de eindwaarde (sr-only); de tellende
 *   cijfers zijn `aria-hidden`.
 * - Minder beweging (systeem of `gronn-a11y-motion`): nooit tellen.
 */
export function TelOp({ waarde }: { waarde: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const [stand, setStand] = useState<{ tekst: string; fase: Fase }>({ tekst: waarde, fase: "rust" })

  useEffect(() => {
    const el = ref.current
    const getal = ontleed(waarde)
    if (reduced || !el || !getal) return
    let gewapend = false
    let raf = 0
    const stop = eenmaalInBeeld(
      el,
      () => {
        if (!gewapend) return
        const start = performance.now()
        const stap = (nu: number) => {
          // De rAF-tijd is die van het begin van het frame en kan dus net
          // vóór `start` liggen; zonder de ondergrens telde het eerste frame
          // negatief ("-32").
          const t = Math.min(1, Math.max(0, (nu - start) / 1400))
          if (t < 1) {
            setStand({ tekst: getal.maak(getal.doel * (1 - Math.pow(1 - t, 3))), fase: "loopt" })
            raf = requestAnimationFrame(stap)
          } else {
            setStand({ tekst: waarde, fase: "klaar" })
          }
        }
        raf = requestAnimationFrame(stap)
      },
      (e) => {
        if (!e.isIntersecting && e.boundingClientRect.top > window.innerHeight) {
          gewapend = true
          setStand({ tekst: getal.maak(0), fase: "wacht" })
        } else {
          setStand({ tekst: waarde, fase: "rust" })
        }
      }
    )
    return () => {
      stop()
      cancelAnimationFrame(raf)
    }
  }, [reduced, waarde])

  return (
    <span ref={ref} data-telt={reduced ? "rust" : stand.fase}>
      <span className="sr-only">{waarde}</span>
      <span aria-hidden="true">{reduced ? waarde : stand.tekst}</span>
    </span>
  )
}
