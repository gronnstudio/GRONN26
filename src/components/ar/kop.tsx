"use client"

import Link from "next/link"
import "./ar.css"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { BUSINESS } from "@/lib/business"
import { Instellingen } from "@/components/weergave"
import { Komeet } from "@/components/komeet"
import { T, kies } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import type { L } from "@/lib/i18n"

const KENNIS: L = { nl: "Kennismaken", en: "Get in touch" }
const SLUIT: L = { nl: "Sluit", en: "Close" }
const OMHOOG: L = { nl: "Terug naar boven", en: "Back to top" }
const WEERGAVE: L = { nl: "Weergave", en: "Display" }

// De navigatie van de nieuwe site is één dock onderin, op telefoon en desktop
// (eigenaar, 14 nov 2026: "Kunnen we het menu helemaal vervangen voor dock?",
// koos Home, Projecten, Vijvers, Tuinen, Menu). Menu klapt de pil zelf omhoog
// open tot het menu met wat niet in het dock staat ("niks dubbel"). Bovenaan
// staat niets meer: geen logo, geen belknop (eigenaar, 14 nov 2026).
// de iconen en het glas van het oude dock, zonder tekst (eigenaar, 14 nov 2026: "laat de oude iconen en stijl staan van het dock. Zonder tekst")
const DOCK: { href: string; naam: L; beweging: string; icoon: string }[] = [
  { href: "/werk", naam: { nl: "Werk", en: "Work" }, beweging: "spit", icoon: "M8 2.5h6M11 2.5v9M7 11.5h8v4a4 4 0 0 1-8 0z" },
  { href: "/vijvers", naam: { nl: "Vijvers", en: "Ponds" }, beweging: "plop", icoon: "M11 2.8s-5.5 6-5.5 10a5.5 5.5 0 0 0 11 0c0-4-5.5-10-5.5-10z" },
  { href: "/tuinen", naam: { nl: "Tuinen", en: "Gardens" }, beweging: "groei", icoon: "M11 19.5v-7M11 13.5c0-4-2.6-6.5-7-6.5 0 4 2.6 6.5 7 6.5zM11 11c0-4 2.6-6.5 7-6.5 0 4-2.6 6.5-7 6.5z" },
]
// iconen in dezelfde lijnstijl als het dock in plaats van nummers (eigenaar, 14 nov 2026)
// Home staat in het paneel; zijn plek in het dock is voor Omhoog (eigenaar, 14 nov 2026)
const MEER = [
  { href: "/", naam: { nl: "Home", en: "Home" }, icoon: "M3.5 10 11 3.5l7.5 6.5M5.5 8.5v10h11v-10M9 18.5v-5h4v5" },
  { href: "/over", naam: { nl: "Studio", en: "Studio" }, icoon: "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 19c1-4 4-5.5 7-5.5s6 1.5 7 5.5" },
  { href: "/journaal", naam: { nl: "Journaal", en: "Journal" }, icoon: "M3 5.5c3-1 5.5-.5 8 1.5 2.5-2 5-2.5 8-1.5v12c-3-1-5.5-.5-8 1.5-2.5-2-5-2.5-8-1.5zM11 7v12" },
  { href: "/shop", naam: { nl: "Shop", en: "Shop" }, icoon: "M4.5 8h13l-1 11.5h-11zM8 8V6a3 3 0 0 1 6 0v2" },
  { href: "/faq", naam: { nl: "Vragen", en: "Questions" }, icoon: "M11 19.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM8.6 8.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6M11 15.6v.1" },
]

const WHATSAPP = (
                  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
                    <path d="M12 2.6a9.4 9.4 0 0 0-8.1 14.1L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M8.9 7.2c-.3-.6-.6-.6-.9-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.6 4.1 6.4 5.6 3.2 1.2 3.8 1 4.5.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.4l-2.3-1.1c-.3-.1-.6-.2-.8.2l-1 1.3c-.2.2-.4.3-.8.1a8 8 0 0 1-3.9-3.4c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-1-2.3z" fill="currentColor" transform="translate(12 12) scale(.62) translate(-12 -12.6)" />
                  </svg>
)
const PALET = (
                  <svg viewBox="0 0 20 20" width="24" height="24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M10 2.8a7.2 7.2 0 1 0 0 14.4c1 0 1.6-.7 1.6-1.5 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.5 1.6-1.5h1.8a3.7 3.7 0 0 0 3.7-3.7C17.7 5.6 14.3 2.8 10 2.8Z" strokeLinejoin="round" />
                    <circle cx="6.3" cy="9.3" r="1" fill="currentColor" stroke="none" />
                    <circle cx="8.6" cy="6.2" r="1" fill="currentColor" stroke="none" />
                    <circle cx="12.3" cy="6.2" r="1" fill="currentColor" stroke="none" />
                  </svg>
)

const SHOPMENU = [
  { href: "/shop?soort=border#borders", naam: { nl: "Borderpakketten", en: "Border packages" }, sub: { nl: "Acht borders, opgestuurd of aangeplant", en: "Eight borders, shipped or planted" }, beeld: "/borderpakketten/vlinderborder.jpg" },
  { href: "/shop?soort=bodem#borders", naam: { nl: "Bodem", en: "Soil" }, sub: { nl: "Compost met schors", en: "Compost with bark" }, beeld: "/borderpakketten/compost-franse-schors.jpg" },
  { href: "/shop?soort=bodem#borders", naam: { nl: "Border op maat", en: "Custom border" }, sub: { nl: "Ik kom kijken en stel hem samen", en: "I come and look and put it together" }, beeld: "/borderpakketten/schaduwborder.jpg" },
  { href: "/shop#cadeau", naam: { nl: "Cadeaubon", en: "Gift card" }, sub: { nl: "Zelf het bedrag kiezen", en: "Choose the amount yourself" }, beeld: "/borderpakketten/plukborder.jpg" },
]

const isHier = (pad: string, href: string) => (href === "/" ? pad === "/" : pad === href || pad.startsWith(href + "/"))

export function ArKop() {
  const pad = usePathname()
  const taal = useTaal()
  const n = (t: L | string) => kies(t, taal)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"inhoud" | "weergave" | "shop">("inhoud")
  const knop = useRef<HTMLButtonElement>(null)
  // bovenaan staat alleen de pijl; na scrollen wordt het de oranje knop met voortgangsring (eigenaar, 14 nov 2026)
  const [boven, setBoven] = useState(true)
  useEffect(() => {
    const meet = () => setBoven(scrollY < 48)
    meet()
    addEventListener("scroll", meet, { passive: true })
    return () => removeEventListener("scroll", meet)
  }, [pad])

  const [vorig, setVorig] = useState(pad)
  if (pad !== vorig) {
    setVorig(pad)
    setOpen(false)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("ar-open", open)
    if (!open) return
    const toets = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), knop.current?.focus())
    document.addEventListener("keydown", toets)
    return () => document.removeEventListener("keydown", toets)
  }, [open])

  return (
    <>

      <button type="button" className="ar-scherm" tabIndex={-1} aria-hidden onClick={() => setOpen(false)} />

      <nav className="ar-dock" data-open={open || undefined} aria-label={n({ nl: "Hoofdmenu", en: "Main menu" })}>
        <div className="ar-dock-vel" id="ar-dock-menu" inert={!open}>
          <div className="ar-dock-vel-binnen">
            <div className="ar-dock-vel-inhoud">
              <div className="ar-dock-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" />
                <p className="ar-lbl"><T t={tab === "weergave" ? { nl: "Weergave", en: "Display" } : tab === "shop" ? "Shop" : "Menu"} /></p>
              </div>
              {tab === "weergave" ? (
                <div className="ar-weergave"><Instellingen smal zonderLayout /></div>
              ) : tab === "shop" ? (
                <ul className="ar-shopmenu">
                  {SHOPMENU.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} transitionTypes={["schuif"]} className="ar-shopmenu-tegel">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.beeld} alt="" loading="lazy" />
                        <span className="ar-shopmenu-naam"><T t={c.naam} /></span>
                        <span className="ar-shopmenu-sub"><T t={c.sub} /></span>
                      </Link>
                    </li>
                  ))}
                  <li className="ar-shopmenu-alles">
                    <Link href="/shop" transitionTypes={["schuif"]} className="ar-knop ar-knop-oranje"><T t={{ nl: "Alles in de shop", en: "Everything in the shop" }} /></Link>
                  </li>
                </ul>
              ) : (
                <ol className="ar-dock-lijst">
                  {MEER.map((p) => (
                    <li key={p.href}>
                      <Link href={p.href} transitionTypes={["schuif"]} className="ar-dock-link" aria-current={isHier(pad, p.href) ? "page" : undefined}>
                        <svg className="ar-dock-ico" viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p.icoon} /></svg>
                        <span className="ar-dock-naam"><T t={p.naam} /></span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
              <div className="ar-dock-voet" data-tab={tab}>
                {tab === "inhoud" && (
                  <Link href="/kennismaken" className="ar-knop ar-knop-oranje" transitionTypes={["schuif"]} onClick={() => track("cta_kennismaken", { plek: "dock" })}><T t={KENNIS} /></Link>
                )}
                {/* snel contact: het groene WhatsApp-teken, zonder vlak (eigenaar, 14 nov 2026) */}
                <a href={BUSINESS.whatsapp} className="ar-app-whatsapp" aria-label="WhatsApp" title="WhatsApp" onClick={() => track("cta_whatsapp", { plek: "dock" })}>
                  {WHATSAPP}
                </a>
                <button type="button" className="ar-rondknop" aria-pressed={tab === "weergave"} aria-label={n(WEERGAVE)} title={n(WEERGAVE)} onClick={() => setTab(tab === "weergave" ? "inhoud" : "weergave")}>
                  {PALET}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Komeet />
        <ul className="ar-dock-rij">
          {/* desktop: Home vooraan in de rij (eigenaar, 14 nov 2026: "we hebben plek voor home") */}
          <li className="ar-dock-alleen-breed">
            <Link href="/" transitionTypes={["schuif"]} className="ar-dock-vak" aria-current={pad === "/" ? "page" : undefined}>
              <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={MEER[0].icoon} /></svg>
              <span className="ar-dock-label">Home</span>
            </Link>
          </li>
          {DOCK.map((d) => (
            <li key={d.href}>
              <Link href={d.href} transitionTypes={["schuif"]} className="ar-dock-vak menu-icoon" data-beweging={d.beweging} aria-label={n(d.naam)} title={n(d.naam)} aria-current={isHier(pad, d.href) ? "page" : undefined}>
                <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d.icoon} /></svg>
                {/* telefoon: alleen het actieve vak draagt zijn naam (eigenaar, 14 nov 2026); desktop: elk vak, de dock is daar volle breedte */}
                <span className="ar-dock-label" aria-hidden><T t={d.naam} /></span>
              </Link>
            </li>
          ))}
          {/* desktop: de dock heeft de ruimte, dus ook deze pagina's direct erin (eigenaar, 14 nov 2026: "maak menu meer items, we hebben de plek!") */}
          {MEER.filter((p) => p.href !== "/").map((p) => (
            <li key={p.href} className="ar-dock-alleen-breed">
              {p.href === "/shop" ? (
                // desktop: Shop opent een megamenu met de soorten (eigenaar, 14 nov 2026)
                <button type="button" className="ar-dock-vak" aria-expanded={open && tab === "shop"} aria-controls="ar-dock-menu" aria-current={isHier(pad, "/shop") ? "page" : undefined} onClick={() => { const aan = open && tab === "shop"; setOpen(!aan); setTab("shop") }}>
                  <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p.icoon} /></svg>
                  <span className="ar-dock-label"><T t={p.naam} /></span>
                </button>
              ) : (
              <Link href={p.href} transitionTypes={["schuif"]} className="ar-dock-vak" tabIndex={undefined} aria-current={isHier(pad, p.href) ? "page" : undefined}>
                <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p.icoon} /></svg>
                <span className="ar-dock-label"><T t={p.naam} /></span>
              </Link>
              )}
            </li>
          ))}
          <li className="ar-dock-alleen-breed">
            <Link href="/kennismaken" transitionTypes={["schuif"]} className="ar-dock-vak ar-dock-kennis" onClick={() => track("cta_kennismaken", { plek: "dock-breed" })}>
              <span className="ar-dock-label"><T t={KENNIS} /></span>
            </Link>
          </li>
          {/* desktop: WhatsApp en Weergave passen ook in de rij; het paneel toont dan alleen nog de weergave */}
          <li className="ar-dock-alleen-breed">
            <a href={BUSINESS.whatsapp} className="ar-app-whatsapp" aria-label="WhatsApp" title="WhatsApp" onClick={() => track("cta_whatsapp", { plek: "dock-breed" })}>
              {WHATSAPP}
            </a>
          </li>
          <li className="ar-dock-alleen-breed">
            <button type="button" className="ar-rondknop" aria-expanded={open && tab === "weergave"} aria-controls="ar-dock-menu" aria-label={n(WEERGAVE)} title={n(WEERGAVE)} onClick={() => { const aan = open && tab === "weergave"; setOpen(!aan); setTab("weergave") }}>
              {PALET}
            </button>
          </li>
          <li className="ar-dock-niet-breed">
            <button ref={knop} type="button" className="ar-dock-vak" aria-expanded={open} aria-controls="ar-dock-menu" aria-label={open ? n({ nl: "Sluit het menu", en: "Close the menu" }) : "Menu"} title={open ? n(SLUIT) : "Menu"} onClick={() => { setOpen(!open); setTab("inhoud") }}>
              {/* vier stippen als vier perkjes; open worden ze een kruis */}
              <svg viewBox="0 0 22 22" aria-hidden fill="currentColor">
                {open ? <path d="M5 5l12 12M17 5 5 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <><circle cx="6.5" cy="6.5" r="2.2" /><circle cx="15.5" cy="6.5" r="2.2" /><circle cx="6.5" cy="15.5" r="2.2" /><circle cx="15.5" cy="15.5" r="2.2" /></>}
              </svg>
              <span className="ar-dock-label ar-dock-label-breed" aria-hidden><T t={open ? SLUIT : "Menu"} /></span>
            </button>
          </li>
          {/* Omhoog achteraan, na de vier stippen, zoals in het oude dock (eigenaar, 14 nov 2026) */}
          <li>
            <button type="button" className="ar-dock-vak ar-dock-omhoog" disabled={boven} aria-label={n(OMHOOG)} title={n(OMHOOG)} onClick={() => scrollTo({ top: 0, behavior: document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
              <svg viewBox="0 0 64 48" aria-hidden className="ar-omhoog-ring"><rect x="3" y="3" width="58" height="42" rx="21" pathLength="1" /></svg>
              {/* 22px groot, dus dikkere lijn: zo even dik als de iconen van 30px (eigenaar, 14 nov 2026) */}
              <svg viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.45" strokeLinecap="round" strokeLinejoin="round"><path d="M11 18V4M5 10l6-6 6 6" /></svg>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
