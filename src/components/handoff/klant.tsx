"use client"

import Link from "next/link"
import { track } from "@vercel/analytics"
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Foto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"

// De drie stukjes van de handoff-voorpagina die JavaScript nodig hebben.

/** Reveal (handoff 10/02): één keer per sectie, 16px omhoog, 500ms. Zonder
 *  JavaScript of met minder beweging staat alles meteen (zie handoff.css). */
export function Onthul({ children, className = "", id, ...rest }: { children: ReactNode; className?: string; id?: string; "aria-labelledby"?: string }) {
  const ref = useRef<HTMLElement>(null)
  const [zichtbaar, setZichtbaar] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const kijker = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setZichtbaar(true)
          kijker.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    )
    kijker.observe(el)
    return () => kijker.disconnect()
  }, [])
  return (
    <section ref={ref} id={id} className={`ho-onthul ${className}`} data-zichtbaar={zichtbaar || undefined} {...rest}>
      {children}
    </section>
  )
}

/** FAQ (handoff 10/05): echte knoppen met aria-expanded; meerdere tegelijk
 *  open mag, en het antwoord blijft in de DOM. */
export function Vraag({ vraag, children }: { vraag: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="ho-vraag">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          <span>{vraag}</span>
          <span aria-hidden className="ho-vraag-teken">{open ? "–" : "+"}</span>
        </button>
      </h3>
      <div id={id} className="ho-vraag-antwoord" hidden={!open}>
        {children}
      </div>
    </div>
  )
}

/** Sticky CTA op de telefoon (handoff 08/07): pas na de hero, en weg zodra de
 *  eind-CTA of de voet in beeld is. */
export function PlakCta() {
  const [toon, setToon] = useState(false)
  useEffect(() => {
    const held = document.getElementById("ho-held")
    const einde = [document.getElementById("ho-eind"), document.getElementById("ho-voet")].filter((e): e is HTMLElement => !!e)
    if (!held) return
    let voorbijHeld = false
    const inBeeld = new Set<Element>()
    const zet = () => setToon(voorbijHeld && inBeeld.size === 0)
    const k1 = new IntersectionObserver(([e]) => {
      voorbijHeld = !e.isIntersecting && e.boundingClientRect.top < 0
      zet()
    })
    const k2 = new IntersectionObserver((es) => {
      for (const e of es) (e.isIntersecting ? inBeeld.add(e.target) : inBeeld.delete(e.target))
      zet()
    })
    k1.observe(held)
    einde.forEach((e) => k2.observe(e))
    return () => {
      k1.disconnect()
      k2.disconnect()
    }
  }, [])
  return (
    <div className="ho-plak" data-toon={toon || undefined} aria-hidden={!toon}>
      <Link href="/start-een-project" className="ho-knop ho-knop-oranje" tabIndex={toon ? undefined : -1}>
        Start een project <span aria-hidden>↗</span>
      </Link>
    </div>
  )
}

/** Een knop of link die meetelt in Vercel Analytics, zodat je de funnel ziet:
 *  hoeveel bezoekers tikken op "Start een project" of "Stuur een foto". */
export function TelLink({ href, gebeurtenis, plek, className, children }: { href: string; gebeurtenis: string; plek: string; className?: string; children: ReactNode }) {
  const tel = () => track(gebeurtenis, { plek })
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener" onClick={tel}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} onClick={tel}>
      {children}
    </Link>
  )
}

/** Voor en nu als één beeld met een schuif (13 nov 2026). Een echte
 *  range-input, dus ook met pijltjestoetsen en een schermlezer te bedienen;
 *  zonder JavaScript staat de schuif in het midden. */
export function VoorNu({ voor, nu, sizes }: { voor: FotoData; nu: FotoData; sizes: string }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="ho-vergelijk" style={{ "--pos": `${pos}%` } as CSSProperties}>
      <Foto foto={nu} sizes={sizes} className="ho-vergelijk-foto" />
      <div className="ho-vergelijk-voor" aria-hidden>
        <Foto foto={voor} sizes={sizes} className="ho-vergelijk-foto" />
      </div>
      <span className="ho-vergelijk-lbl ho-lbl" data-kant="voor" aria-hidden>Voor</span>
      <span className="ho-vergelijk-lbl ho-lbl" data-kant="nu" aria-hidden>Nu</span>
      <span className="ho-vergelijk-greep" aria-hidden><span>‹ ›</span></span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Schuif tussen voor en nu"
        aria-valuetext={`${pos}% voor, ${100 - pos}% nu`}
        className="ho-vergelijk-schuif"
      />
    </div>
  )
}
