"use client"

import Link from "next/link"
import "./ar.css"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { BUSINESS } from "@/lib/business"
import { Instellingen } from "@/components/weergave"

// De kop van de nieuwe site (eigenaar, 13 nov 2026: "Architectuur stijl!",
// "bouw helemaal vanuit nul"). Logo links, Kennismaken en Menu rechts. Menu
// zet de pagina opzij en opent rechts de inhoud (naar dejongensvanoranje.nl).
// Geen dock meer: dit is de enige navigatie.
// dock: staat deze pagina ook in de dock (Weergave → Dock onderin)? Dan niet nog
// eens in dit menu, "niks dubbel" (eigenaar, 14 nov 2026). "groot" = alleen vanaf 1024px in de dock.
const PAGINAS: { href: string; naam: string; dock?: "altijd" | "groot" }[] = [
  { href: "/werk", naam: "Projecten", dock: "altijd" },
  { href: "/vijvers", naam: "Vijvers" },
  { href: "/tuinen", naam: "Tuinen" },
  { href: "/over", naam: "Studio", dock: "altijd" },
  { href: "/journaal", naam: "Journaal", dock: "groot" },
  { href: "/shop", naam: "Shop", dock: "altijd" },
]

export function ArKop() {
  const pad = usePathname()
  const [open, setOpen] = useState(false)
  const [gezakt, setGezakt] = useState(false)
  // een kleiner menu: kleinere namen, alles onderin binnen bereik van de duim (eigenaar, 14 nov 2026)
  const [klein, setKlein] = useState(false)
  // het tweede tabblad van het menu: Weergave (eigenaar, 14 nov 2026)
  const [tab, setTab] = useState<"inhoud" | "weergave">("inhoud")
  const knop = useRef<HTMLButtonElement>(null)

  const [vorig, setVorig] = useState(pad)
  if (pad !== vorig) {
    setVorig(pad)
    setOpen(false)
  }

  // met de dock (Weergave) opent de dock dit menu
  useEffect(() => {
    const wissel = () => setOpen((o) => !o)
    addEventListener("gronn-open-paneel", wissel)
    return () => removeEventListener("gronn-open-paneel", wissel)
  }, [])

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

      <div id="ar-paneel" className={klein ? "ar-paneel ar-klein" : "ar-paneel"} inert={!open} aria-label="Menu">
        <div>
        <p className="ar-lbl ar-paneel-lbl">{tab === "weergave" ? "Weergave" : "Inhoud"}</p>
        {tab === "weergave" ? (
          <div className="ar-weergave"><Instellingen smal zonderLayout /></div>
        ) : (
        <nav aria-label="Hoofdmenu">
          <ol className="ar-paneel-lijst">
            {PAGINAS.map((p, i) => (
              <li key={p.href} data-dock={p.dock} style={{ "--i": i } as React.CSSProperties}>
                <Link href={p.href} transitionTypes={["schuif"]} className="ar-paneel-link" aria-current={pad === p.href || pad.startsWith(p.href + "/") ? "page" : undefined}>
                  <span className="ar-lbl ar-paneel-nr" aria-hidden />
                  <span className="ar-paneel-naam">{p.naam}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        )}
        </div>
        {/* links de twee tekstknoppen, rechts twee kleine ronde: klein/groot menu en Weergave (eigenaar, 14 nov 2026) */}
        <div className="ar-paneel-voet" data-tab={tab}>
          {/* in Weergave alleen de ronde knoppen (eigenaar, 14 nov 2026) */}
          <div className="ar-paneel-acties" hidden={tab === "weergave"}>
            <Link href="/start-een-project" className="ar-knop ar-knop-oranje" transitionTypes={["schuif"]}>Start een project</Link>
            <Link href="/kennismaken" className="ar-knop ar-knop-lijn-licht ar-paneel-kennis">Kennismaken</Link>
          </div>
          <div className="ar-paneel-rond">
            {/* snel contact, rond en groen zoals WhatsApp zelf (eigenaar, 14 nov 2026) */}
            <a href={BUSINESS.whatsapp} className="ar-rondknop ar-rond-whatsapp" aria-label="WhatsApp" title="WhatsApp" onClick={() => track("cta_whatsapp", { plek: "menu" })}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z" /><path d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z" fill="currentColor" stroke="none" /></svg>
            </a>
            <button type="button" className="ar-rondknop" aria-pressed={klein} aria-label={klein ? "Groot menu" : "Klein menu"} title={klein ? "Groot menu" : "Klein menu"} onClick={() => setKlein(!klein)}>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                {klein ? <path d="M4 5h12M4 10h12M4 15h12" /> : <path d="M7 7h6M7 10h6M7 13h6" />}
              </svg>
            </button>
            <button type="button" className="ar-rondknop" aria-pressed={tab === "weergave"} aria-label="Weergave" title="Weergave" onClick={() => setTab(tab === "weergave" ? "inhoud" : "weergave")}>
              {/* een palet */}
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2.8a7.2 7.2 0 1 0 0 14.4c1 0 1.6-.7 1.6-1.5 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.5 1.6-1.5h1.8a3.7 3.7 0 0 0 3.7-3.7C17.7 5.6 14.3 2.8 10 2.8Z" strokeLinejoin="round" />
                <circle cx="6.3" cy="9.3" r="1" fill="currentColor" stroke="none" />
                <circle cx="8.6" cy="6.2" r="1" fill="currentColor" stroke="none" />
                <circle cx="12.3" cy="6.2" r="1" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
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
