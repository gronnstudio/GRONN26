"use client"

import { useEffect } from "react"

// Laadt de 3D-hommel (hommel-scene.ts) pas na een paar seconden en alleen als
// beweging mag: niet bij minder beweging en niet als Weergave op Stil staat.
// Hij landt op de boeketjes boven de voet (verder.tsx, data-landing).
export function Hommel() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const html = document.documentElement
    let stop: (() => void) | undefined
    let weg = false
    const zet = () => {
      if (html.classList.contains("stil")) {
        stop?.()
        stop = undefined
      } else if (!stop) {
        import("./hommel-scene")
          .then(({ startHommel }) => {
            if (!weg && !stop && !html.classList.contains("stil")) stop = startHommel()
          })
          .catch(() => {}) // geen WebGL of laden mislukt: dan gewoon geen hommel
      }
    }
    // pas na vier seconden laden: geen WebGL tijdens het laden van de pagina
    const kijker = new MutationObserver(zet)
    // en dan nog op een rustig moment, zodat het bouwen niets in de weg zit
    let rust = 0
    const wacht = setTimeout(() => {
      const begin = () => {
        zet()
        kijker.observe(html, { attributes: true, attributeFilter: ["class"] })
      }
      if ("requestIdleCallback" in window) rust = requestIdleCallback(begin, { timeout: 3000 })
      else begin()
    }, 4000)
    return () => {
      weg = true
      clearTimeout(wacht)
      if (rust) cancelIdleCallback(rust)
      kijker.disconnect()
      stop?.()
    }
  }, [])
  return null
}
