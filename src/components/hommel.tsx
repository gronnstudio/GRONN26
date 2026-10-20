"use client"

import { useEffect } from "react"

// Laadt de 3D-hommel (hommel-scene.ts) pas na de eerste verf en alleen als
// beweging mag: niet bij minder beweging en niet als Weergave op Stil staat.
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
    zet()
    const kijker = new MutationObserver(zet)
    kijker.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => {
      weg = true
      kijker.disconnect()
      stop?.()
    }
  }, [])
  return null
}
