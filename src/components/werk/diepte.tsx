"use client"

import Image from "next/image"
import { useEffect, useRef, type CSSProperties } from "react"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import { DIEPTE } from "@/lib/data/vijverrenovatie"

// De foto's van het project komen op je af terwijl je scrolt (eigenaar, 18 okt
// 2026, naar untamed.gallery). Untamed doet het in three.js en neemt het
// scrollen over; hier is het CSS 3D en een paar regels script op de gewone
// scroll. Elke foto blijft even vooraan staan met fase en bijschrift. Tab of
// een tik brengt een foto naar voren. Met minder beweging (of html.stil) staan
// dezelfde foto's als rustig raster; dat regelt werk.css, het script doet dan niets.

const AFSTAND = 700 // px diepte tussen twee foto's
const VOOR = 220 // de foto vooraan staat iets dichter dan het scherm: groter
const n = DIEPTE.length

const stil = () =>
  document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches

// Elke foto blijft vooraan staan (eerste 35 % van zijn stuk), dan glijdt de volgende naar voren.
function camera(p: number) {
  const t = p * (n - 1)
  const k = Math.floor(t)
  const r = (t - k - 0.35) / 0.65
  const e = r <= 0 ? 0 : r * r * (3 - 2 * r)
  return Math.min(n - 1, k + e)
}

export function Diepte() {
  const sectie = useRef<HTMLElement>(null)
  const kaarten = useRef<(HTMLButtonElement | null)[]>([])
  const fase = useRef<HTMLDivElement>(null)
  const teller = useRef<HTMLSpanElement>(null)
  const en = useTaal() === "en"

  useEffect(() => {
    const s = sectie.current
    if (!s) return
    let doel = 0
    let nu = 0
    let frame = 0
    let getoond = -1

    const voortgang = () => {
      const totaal = s.offsetHeight - innerHeight
      return totaal > 0 ? Math.min(1, Math.max(0, -s.getBoundingClientRect().top / totaal)) : 0
    }

    const teken = () => {
      nu += (doel - nu) * 0.14
      if (Math.abs(doel - nu) < 0.001) nu = doel
      const straal = Math.min(innerWidth * 0.26, 400)
      kaarten.current.forEach((k, i) => {
        if (!k) return
        const d = (nu - i) * AFSTAND // 0 = vooraan, negatief = verder weg
        const hoek = (i * 100 * Math.PI) / 180
        const vooraan = Math.max(0, 1 - Math.abs(nu - i))
        const r = straal * (1 - 0.75 * vooraan) // de foto vooraan schuift naar het midden
        const o = Math.max(0, Math.min(1, d <= 0 ? 1 + d / (AFSTAND * 9) : 1 - d / (AFSTAND * 0.35)))
        k.style.transform = `translate(-50%, -50%) translate3d(${(Math.cos(hoek) * r).toFixed(1)}px, ${(Math.sin(hoek) * r * 0.55).toFixed(1)}px, ${(d + VOOR).toFixed(1)}px)`
        k.style.opacity = o.toFixed(3)
        k.style.zIndex = String(1000 - Math.round(Math.abs(nu - i) * 10) + (d > 0 ? 500 : 0))
        k.style.visibility = o < 0.01 ? "hidden" : "visible"
      })
      const i = Math.round(nu)
      if (i !== getoond) {
        getoond = i
        fase.current?.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => (el.hidden = el.dataset.i !== String(i)))
        if (teller.current) teller.current.textContent = `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`
      }
      s.style.setProperty("--p", (nu / (n - 1)).toFixed(4))
      frame = nu !== doel ? requestAnimationFrame(teken) : 0
    }

    const bijwerken = () => {
      if (stil()) {
        // Raster: de stand van het script weghalen, zodat de CSS het overneemt.
        kaarten.current.forEach((k) => k?.removeAttribute("style"))
        getoond = -1
        return
      }
      doel = camera(voortgang())
      if (!frame) frame = requestAnimationFrame(teken)
    }

    addEventListener("scroll", bijwerken, { passive: true })
    addEventListener("resize", bijwerken)
    // html.stil kan aan en uit in Weergave.
    const let_op = new MutationObserver(bijwerken)
    let_op.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    bijwerken()
    return () => {
      removeEventListener("scroll", bijwerken)
      removeEventListener("resize", bijwerken)
      let_op.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  // Naar foto i: de scrollpositie waarbij hij vooraan staat.
  const naar = (i: number, direct = false) => {
    const s = sectie.current
    if (!s || stil()) return
    const totaal = s.offsetHeight - innerHeight
    const top = s.getBoundingClientRect().top + scrollY + (i / (n - 1)) * totaal
    scrollTo({ top, behavior: direct ? "instant" : "smooth" })
  }

  return (
    <section
      ref={sectie}
      className="dp"
      style={{ "--n": n } as CSSProperties}
      aria-label={en ? "The project in photos" : "Het project in foto's"}
    >
      <div className="dp-podium">
        <div className="dp-voortgang" aria-hidden="true"><i /></div>
        {DIEPTE.map(({ foto }, i) => (
          <button
            key={foto.src}
            ref={(el) => { kaarten.current[i] = el }}
            type="button"
            className={`dp-kaart ${foto.width > foto.height ? "dp-liggend" : "dp-staand"}`}
            aria-label={en && foto.en ? foto.en.alt : foto.alt}
            onClick={() => naar(i)}
            onFocus={() => naar(i, true)}
          >
            <Image
              src={foto.src}
              alt=""
              width={foto.width}
              height={foto.height}
              sizes={foto.width > foto.height ? "(min-width: 768px) 600px, 90vw" : "(min-width: 768px) 400px, 60vw"}
            />
          </button>
        ))}
        <div className="dp-onder wrap" aria-hidden="true">
          <div ref={fase} className="grid max-w-[34ch] gap-1.5">
            {DIEPTE.map(({ fase: f, zin }, i) => (
              <div key={i} data-i={i} hidden={i !== 0} className="grid gap-1.5">
                <span className="lbl text-oranje-tekst"><T t={f} /></span>
                <span className="syne text-[clamp(20px,2.6vw,32px)] leading-[1.1] tracking-[-.02em]"><T t={zin} /></span>
              </div>
            ))}
          </div>
          <span ref={teller} className="lbl whitespace-nowrap tabular-nums text-gedempt">01 / {String(n).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  )
}
