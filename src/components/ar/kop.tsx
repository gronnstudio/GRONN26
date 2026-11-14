"use client"

import Link from "next/link"
import "./ar.css"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { BUSINESS } from "@/lib/business"
import { Instellingen } from "@/components/weergave"

// De navigatie van de nieuwe site is één dock onderin, op telefoon en desktop
// (eigenaar, 14 nov 2026: "Kunnen we het menu helemaal vervangen voor dock?",
// koos Home, Projecten, Vijvers, Tuinen, Menu). Menu klapt de pil zelf omhoog
// open tot het menu met wat niet in het dock staat ("niks dubbel"). Bovenaan
// staat alleen nog het logo, dat met de pagina wegscrolt.
const DOCK: { href: string; naam: string; icoon: string }[] = [
  { href: "/", naam: "Home", icoon: "M3.5 10 11 3.5l7.5 6.5M5.5 8.5v10h11v-10" },
  { href: "/werk", naam: "Projecten", icoon: "M3.5 3.5h6v6h-6zM12.5 3.5h6v6h-6zM3.5 12.5h6v6h-6zM12.5 12.5h6v6h-6z" },
  { href: "/vijvers", naam: "Vijvers", icoon: "M2.5 8.5c2 0 2-1.5 4.25-1.5S9 8.5 11 8.5s2-1.5 4.25-1.5 2.25 1.5 4.25 1.5M2.5 14c2 0 2-1.5 4.25-1.5S9 14 11 14s2-1.5 4.25-1.5S17.5 14 19.5 14" },
  { href: "/tuinen", naam: "Tuinen", icoon: "M11 19.5v-7M11 13.5c0-4-2.6-6.5-7-6.5 0 4 2.6 6.5 7 6.5zM11 11c0-4 2.6-6.5 7-6.5 0 4-2.6 6.5-7 6.5z" },
]
const MEER = [
  { href: "/over", naam: "Studio" },
  { href: "/journaal", naam: "Journaal" },
  { href: "/shop", naam: "Shop" },
  { href: "/faq", naam: "Vragen" },
]

const isHier = (pad: string, href: string) => (href === "/" ? pad === "/" : pad === href || pad.startsWith(href + "/"))

export function ArKop() {
  const pad = usePathname()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"inhoud" | "weergave">("inhoud")
  const knop = useRef<HTMLButtonElement>(null)

  const [vorig, setVorig] = useState(pad)
  if (pad !== vorig) {
    setVorig(pad)
    setOpen(false)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("ar-open", open)
    if (!open) return setTab("inhoud")
    const toets = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), knop.current?.focus())
    document.addEventListener("keydown", toets)
    return () => document.removeEventListener("keydown", toets)
  }, [open])

  return (
    <>
      <header className="ar-kop">
        <Link href="/" className="ar-kop-logo" aria-label="GRØNN Studio, naar de voorpagina">
          {/* het bestaande woordmerk, nooit opnieuw getekend */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="ar-logo-licht" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="" className="ar-logo-donker" />
        </Link>
        <p className="ar-lbl ar-kop-plek">Vijvers en tuinen · Stein en omgeving</p>
        <a href={BUSINESS.phoneHref} className="ar-bel" aria-label={`Bel ${BUSINESS.phone}`} onClick={() => track("cta_bel", { plek: "kop" })}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="currentColor"><path d="M6.6 2.5 4 3.1C3.3 3.3 2.8 4 3 4.8c1.4 6.3 6 10.9 12.3 12.3.8.2 1.5-.3 1.7-1l.6-2.6c.1-.6-.2-1.2-.7-1.4l-2.8-1.2c-.5-.2-1.1-.1-1.4.3l-1 1.2a10 10 0 0 1-4.6-4.6l1.2-1c.4-.4.5-.9.3-1.4L7.4 3.2c-.2-.5-.8-.8-1.4-.7z" /></svg>
          <span className="tabular-nums">{BUSINESS.phone}</span>
        </a>
      </header>

      <button type="button" className="ar-scherm" tabIndex={-1} aria-hidden onClick={() => setOpen(false)} />

      <nav className="ar-dock" data-open={open || undefined} aria-label="Hoofdmenu">
        <div className="ar-dock-vel" id="ar-dock-menu" inert={!open}>
          <div className="ar-dock-vel-binnen">
            <div className="ar-dock-vel-inhoud">
              <div className="ar-dock-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" />
                <p className="ar-lbl">{tab === "weergave" ? "Weergave" : "Menu"}</p>
              </div>
              {tab === "weergave" ? (
                <div className="ar-weergave"><Instellingen smal zonderLayout /></div>
              ) : (
                <ol className="ar-dock-lijst">
                  {MEER.map((p) => (
                    <li key={p.href}>
                      <Link href={p.href} transitionTypes={["schuif"]} className="ar-dock-link" aria-current={isHier(pad, p.href) ? "page" : undefined}>
                        <span className="ar-lbl ar-dock-nr" aria-hidden />
                        <span className="ar-dock-naam">{p.naam}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
              <div className="ar-dock-voet" data-tab={tab}>
                {tab === "inhoud" && (
                  <Link href="/start-een-project" className="ar-knop ar-knop-oranje" transitionTypes={["schuif"]} onClick={() => track("cta_project", { plek: "dock" })}>Start een project</Link>
                )}
                {/* snel contact, rond en groen zoals WhatsApp zelf (eigenaar, 14 nov 2026) */}
                <a href={BUSINESS.whatsapp} className="ar-rondknop ar-rond-whatsapp" aria-label="WhatsApp" title="WhatsApp" onClick={() => track("cta_whatsapp", { plek: "dock" })}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z" /><path d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z" fill="currentColor" stroke="none" /></svg>
                </a>
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
        </div>

        <ul className="ar-dock-rij">
          {DOCK.map((d) => (
            <li key={d.href}>
              <Link href={d.href} transitionTypes={["schuif"]} className="ar-dock-vak" aria-current={isHier(pad, d.href) ? "page" : undefined}>
                <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d.icoon} /></svg>
                {d.naam}
              </Link>
            </li>
          ))}
          <li>
            <button ref={knop} type="button" className="ar-dock-vak" aria-expanded={open} aria-controls="ar-dock-menu" onClick={() => setOpen(!open)}>
              {/* vier stippen als vier perkjes; open draaien ze een kwartslag */}
              <span className="ar-dock-stip" aria-hidden><i /><i /><i /><i /></span>
              {open ? "Sluit" : "Menu"}
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
