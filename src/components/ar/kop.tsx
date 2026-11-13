"use client"

import Link from "next/link"
import "./ar.css"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { BUSINESS } from "@/lib/business"

// De kop van de nieuwe site (eigenaar, 13 nov 2026: "Architectuur stijl!",
// "bouw helemaal vanuit nul"). Logo links, Kennismaken en Menu rechts. Menu
// zet de pagina opzij en opent rechts de inhoud (naar dejongensvanoranje.nl).
// Geen dock meer: dit is de enige navigatie.
const PAGINAS = [
  { href: "/werk", naam: "Werk", zin: "Projecten" },
  { href: "/vijvers", naam: "Vijvers", zin: "Aanleg, renovatie, onderhoud" },
  { href: "/tuinen", naam: "Tuinen", zin: "Ontwerp en aanleg" },
  { href: "/over", naam: "Studio", zin: "Wie ik ben" },
  { href: "/journaal", naam: "Journaal", zin: "Korte stukken" },
  { href: "/shop", naam: "Shop", zin: "Borderpakketten en bonnen" },
]

export function ArKop() {
  const pad = usePathname()
  const [open, setOpen] = useState(false)
  const [gezakt, setGezakt] = useState(false)
  const knop = useRef<HTMLButtonElement>(null)

  const [vorig, setVorig] = useState(pad)
  if (pad !== vorig) {
    setVorig(pad)
    setOpen(false)
  }

  useEffect(() => {
    const meet = () => setGezakt(scrollY > 8)
    meet()
    addEventListener("scroll", meet, { passive: true })
    return () => removeEventListener("scroll", meet)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    // de pagina krimpt om het midden van wat je nu ziet
    if (open)
      for (const el of document.querySelectorAll<HTMLElement>("#inhoud, .ar-voet, .ar-kop"))
        el.style.transformOrigin = `50% ${innerHeight / 2 - el.getBoundingClientRect().top}px`
    html.classList.toggle("ar-open", open)
    if (!open) return
    const toets = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), knop.current?.focus())
    document.addEventListener("keydown", toets)
    return () => document.removeEventListener("keydown", toets)
  }, [open])

  return (
    <>
      <header className="ar-kop" data-gezakt={gezakt || undefined}>
        <Link href="/" className="ar-kop-logo" aria-label="GRØNN Studio, naar de voorpagina">
          {/* het bestaande woordmerk, nooit opnieuw getekend */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="ar-logo-licht" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="" className="ar-logo-donker" />
        </Link>
        <p className="ar-lbl ar-kop-plek">Vijvers en tuinen · Stein en omgeving</p>
        <div className="ar-kop-rechts">
          {/* bellen staat altijd in beeld (dejongensvanoranje.nl), en elke klik telt (eigenaar, 13 nov 2026: "ik wil conversie") */}
          <a href={BUSINESS.phoneHref} className="ar-bel" onClick={() => track("cta_bel", { plek: "kop" })}>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="currentColor"><path d="M6.6 2.5 4 3.1C3.3 3.3 2.8 4 3 4.8c1.4 6.3 6 10.9 12.3 12.3.8.2 1.5-.3 1.7-1l.6-2.6c.1-.6-.2-1.2-.7-1.4l-2.8-1.2c-.5-.2-1.1-.1-1.4.3l-1 1.2a10 10 0 0 1-4.6-4.6l1.2-1c.4-.4.5-.9.3-1.4L7.4 3.2c-.2-.5-.8-.8-1.4-.7z" /></svg>
            <span><span className="ar-bel-woord">Bel </span><span className="tabular-nums">{BUSINESS.phone}</span></span>
          </a>
          <Link href="/start-een-project" className="ar-knop ar-knop-oranje ar-kop-actie" transitionTypes={["schuif"]} onClick={() => track("cta_project", { plek: "kop" })}>
            Start een project
          </Link>
          <button ref={knop} type="button" className="ar-menuknop" aria-expanded={open} aria-controls="ar-paneel" onClick={() => setOpen(!open)}>
            <span>{open ? "Sluit" : "Menu"}</span>
            <span className="ar-menuknop-streep" aria-hidden />
          </button>
        </div>
      </header>

      <div id="ar-paneel" className="ar-paneel" inert={!open} aria-label="Menu">
        <nav aria-label="Hoofdmenu">
          <p className="ar-lbl ar-paneel-lbl">Inhoud</p>
          <ol className="ar-paneel-lijst">
            {PAGINAS.map((p, i) => (
              <li key={p.href} style={{ "--i": i } as React.CSSProperties}>
                <Link href={p.href} transitionTypes={["schuif"]} className="ar-paneel-link" aria-current={pad === p.href || pad.startsWith(p.href + "/") ? "page" : undefined}>
                  <span className="ar-lbl">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ar-paneel-naam">{p.naam}</span>
                  <span className="ar-lbl ar-paneel-zin">{p.zin}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="ar-paneel-voet">
          <Link href="/start-een-project" className="ar-knop ar-knop-oranje" transitionTypes={["schuif"]}>Start een project</Link>
          <Link href="/kennismaken" className="ar-knop ar-knop-lijn-licht">Kennismaken</Link>
        </div>
      </div>
      {/* de pagina zelf sluit het menu, met een ronde sluitknop op de rand */}
      <button type="button" className="ar-scherm" tabIndex={-1} aria-hidden onClick={() => setOpen(false)} />
      <button type="button" className="ar-sluit" tabIndex={open ? 0 : -1} aria-label="Sluit het menu" onClick={() => { setOpen(false); knop.current?.focus() }}>
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l10 10M15 5 5 15" /></svg>
      </button>
    </>
  )
}
