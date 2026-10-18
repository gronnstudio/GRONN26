"use client"

import Image from "next/image"
import { useEffect, useRef, type CSSProperties } from "react"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import { DIEPTE } from "@/lib/data/vijverrenovatie"
import "./fotostapel.css"

// Het project in stappen (eigenaar, 18 okt 2026, screenshot van de nieuwe
// site-branch: "ongeveer ditzelfde wil ik op onze main site"). Eén kader plakt
// terwijl de tekst langs scrolt; bij elke stap schuift de volgende foto van
// onder over de vorige, met een oranje lijn op de rand. Het script zet alleen
// --p per foto (0 tot 1); met minder beweging (of html.stil) negeert de CSS die
// en staan de foto's als rustig raster, met de stappen eronder.

export function Fotostapel() {
  const lagen = useRef<(HTMLDivElement | null)[]>([])
  const stappen = useRef<(HTMLLIElement | null)[]>([])
  const kader = useRef<HTMLDivElement>(null)
  const en = useTaal() === "en"

  useEffect(() => {
    let frame = 0
    const teken = () => {
      frame = 0
      const h = innerHeight
      // Op de telefoon schuift de foto open terwijl de stap onderin binnenkomt, zodat
      // je de tekst leest bij zijn foto; breed is hij klaar op 40 % van het scherm.
      const breed = innerWidth >= 1024
      const begin = h * (breed ? 0.9 : 0.92)
      const eind = h * (breed ? 0.4 : 0.72)
      let lijn = -1
      stappen.current.forEach((s, i) => {
        if (!s || i === 0) return
        const p = Math.min(1, Math.max(0, (begin - s.getBoundingClientRect().top) / (begin - eind)))
        lagen.current[i]?.style.setProperty("--p", p.toFixed(4))
        if (p > 0 && p < 1) lijn = p
      })
      kader.current?.style.setProperty("--lijn", lijn < 0 ? "-1" : (1 - lijn).toFixed(4))
    }
    const bijwerken = () => { if (!frame) frame = requestAnimationFrame(teken) }
    addEventListener("scroll", bijwerken, { passive: true })
    addEventListener("resize", bijwerken)
    teken()
    return () => {
      removeEventListener("scroll", bijwerken)
      removeEventListener("resize", bijwerken)
      cancelAnimationFrame(frame)
    }
  }, [])

  const nr = (i: number) => String(i + 1).padStart(2, "0")

  return (
    <section className="fs wrap" aria-label={en ? "The project step by step" : "Het project in stappen"}>
      <div ref={kader} className="fs-kader">
        {DIEPTE.map(({ foto }, i) => (
          <div
            key={foto.src}
            ref={(el) => { lagen.current[i] = el }}
            className="fs-laag"
            style={{ "--p": i === 0 ? 1 : 0, "--i": i } as CSSProperties}
          >
            <Image
              src={foto.src}
              alt={en && foto.en ? foto.en.alt : foto.alt}
              fill
              sizes="(min-width: 1024px) 700px, 100vw"
            />
          </div>
        ))}
        <i className="fs-lijn" aria-hidden="true" />
      </div>
      <ol className="fs-stappen">
        {DIEPTE.map(({ fase, zin }, i) => (
          <li key={i} ref={(el) => { stappen.current[i] = el }} className="fs-stap" style={{ "--i": i } as CSSProperties}>
            <span className="lbl text-oranje-tekst">
              {nr(i)} · <T t={fase} />
            </span>
            <p className="syne m-0 text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-.02em]"><T t={zin} /></p>
          </li>
        ))}
      </ol>
    </section>
  )
}
