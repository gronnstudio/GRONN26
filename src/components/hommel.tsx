"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Plant } from "./plant"

/** De vrije strook links en rechts: tot de eerste tekst of knop op de pagina.
 *  Alleen de inhoud (main) binnen het scherm telt; verborgen tekst niet. */
function vrijeMarge() {
  const breed = innerWidth
  let links = breed / 2
  let rechts = breed / 2
  const neem = (r: DOMRect) => {
    if (r.width === 0 || r.height === 0 || r.right <= 0 || r.left >= breed) return
    links = Math.min(links, r.left)
    rechts = Math.min(rechts, breed - r.right)
  }
  const main = document.querySelector("main")
  if (!main) return { links: 0, rechts: 0 }
  const tekst = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  const bereik = document.createRange()
  for (let n = tekst.nextNode(); n; n = tekst.nextNode()) {
    const el = n.parentElement
    if (!n.textContent?.trim() || !el || el.closest(".sr-only, [hidden]")) continue
    if (getComputedStyle(el).position === "fixed") continue
    bereik.selectNodeContents(n)
    for (const r of bereik.getClientRects()) neem(r)
  }
  for (const el of document.querySelectorAll("main a, main button, main input, main select, main textarea")) {
    if (!el.closest(".sr-only")) neem(el.getBoundingClientRect())
  }
  return { links, rechts }
}

// Laadt de 3D-hommel (hommel-scene.ts) pas na een paar seconden en alleen als
// beweging mag: niet bij minder beweging en niet als Weergave op Stil staat.
export function Hommel() {
  const vak = useRef<HTMLDivElement>(null)
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
            if (weg || stop || html.classList.contains("stil")) return
            const hommel = startHommel()
            let klaproos: (() => void) | undefined
            let aan = true
            stop = () => {
              aan = false
              hommel()
              klaproos?.()
              klaproos = undefined
            }
            // de linker margebloem als 3D-klaproos; lukt dat niet, dan blijft de foto
            const doel = vak.current
            if (doel && matchMedia("(min-width: 1500px)").matches)
              import("./klaproos-doek")
                .then(({ startKlaproos }) => {
                  if (aan) klaproos = startKlaproos(doel)
                })
                .catch(() => {})
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
  // Inheemse bloemen in de lege marges van een breed scherm, op de route van
  // de hommel: hij landt erop en dut even in (eigenaar, 21 okt 2026). Ze
  // vallen nooit over tekst of knoppen: hun breedte is de vrije strook naast
  // de inhoud, gemeten per pagina. Bij het slot en de voet gaan ze weg, want
  // daar staan al bloemen en adresregels (eigenaar, 21 okt 2026).
  const pad = usePathname()
  useEffect(() => {
    const el = vak.current
    if (!el) return
    const meet = () => {
      const { links, rechts } = vrijeMarge()
      // onder 120px past er geen bloem meer naast
      el.style.setProperty("--marge-links", `${links < 120 ? 0 : Math.round(links)}px`)
      el.style.setProperty("--marge-rechts", `${rechts < 120 ? 0 : Math.round(rechts)}px`)
    }
    let tik = 0
    const later = () => {
      clearTimeout(tik)
      tik = window.setTimeout(meet, 200)
    }
    later()
    addEventListener("resize", later)
    document.fonts?.ready.then(later)
    const inZicht = new Set<Element>()
    const kijk = new IntersectionObserver((items) => {
      for (const i of items) {
        if (i.isIntersecting) inZicht.add(i.target)
        else inZicht.delete(i.target)
      }
      el.classList.toggle("weg", inZicht.size > 0)
    })
    for (const d of document.querySelectorAll(".w-verder, footer")) kijk.observe(d)
    return () => {
      clearTimeout(tik)
      removeEventListener("resize", later)
      kijk.disconnect()
    }
  }, [pad])
  return (
    <div ref={vak} className="hommel-bloemen" aria-hidden="true">
      <Plant naam="klaproos" className="hommel-bloem hommel-bloem-links" />
      <Plant naam="vingerhoed" className="hommel-bloem hommel-bloem-rechts" />
    </div>
  )
}
