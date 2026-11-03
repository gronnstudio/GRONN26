"use client"

import { useEffect } from "react"

/**
 * Opent de `<Vraag>` waar een #anker naar wijst.
 *
 * De browser doet dat zelf bij een gewone fragmentnavigatie, maar de
 * router van Next scrollt bij een klik vanuit de zoekfunctie met zijn
 * eigen `scrollIntoView` — dan blijft de vraag dicht en landt de lezer
 * op een kop zonder antwoord. Rendert niets.
 */
export function VraagAnker() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const el = id ? document.getElementById(id) : null
      if (el instanceof HTMLDetailsElement) el.open = true
    }
    open()
    window.addEventListener("hashchange", open)
    return () => window.removeEventListener("hashchange", open)
  }, [])
  return null
}
