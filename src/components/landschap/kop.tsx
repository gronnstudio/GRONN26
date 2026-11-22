"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type RefObject } from "react"
import { track } from "@vercel/analytics"
import { BUSINESS } from "@/lib/business"
import { Instellingen } from "@/components/weergave"
import { Komeet } from "@/components/komeet"
import { Pijl } from "@/components/pijl"
import { T, kies } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import type { L } from "@/lib/i18n"
import { NICK, VIJVER_SFEER, BEPLANTING, VIJVERRENOVATIE, PAD_BORDERS, TERRAS_PERGOLA, MAANPOORT, type Beeld } from "./beelden"

// SiteHeader en NavigationOverlay uit de visuele bouwbrief (§05, beelden 13, 14
// en 22): bovenin het originele woordmerk en de menupil met de komeet; open is
// het menu een donkere index van vijf grote woorden met een foto die de regel
// onder de muis of de focus ondersteunt. Eén tik op een woord gaat er meteen
// heen. Escape sluit en zet de focus terug op de pil. De rest van de pagina is
// zolang niet bedienbaar (inert).

type Bestemming = { href: string; naam: L; beeld: Beeld | null; zin: L }
const HOOFD: Bestemming[] = [
  { href: "/werk", naam: { nl: "Werk", en: "Work" }, beeld: VIJVERRENOVATIE, zin: { nl: "Werk dat ik zelf heb aangelegd.", en: "Work I built myself." } },
  { href: "/vijvers", naam: { nl: "Vijvers", en: "Ponds" }, beeld: VIJVER_SFEER, zin: { nl: "Water als levend onderdeel van je tuin.", en: "Water as a living part of your garden." } },
  { href: "/tuinen", naam: { nl: "Tuinen", en: "Gardens" }, beeld: BEPLANTING, zin: { nl: "Beplanting die met de seizoenen meegroeit.", en: "Planting that grows with the seasons." } },
  { href: "/over", naam: { nl: "Studio", en: "Studio" }, beeld: NICK, zin: { nl: "Ik ben Nick, ontwerper en hovenier.", en: "I'm Nick, designer and gardener." } },
  // Alles even groot, ook Shop, Zelf aan de slag, Journaal en Vragen (eigenaar, 22 nov 2026:
  // "Ik wil shop in het menu!", "Niet klein", "Die kleine dingen wil ik ook groot")
  { href: "/shop", naam: { nl: "Shop", en: "Shop" }, beeld: PAD_BORDERS, zin: { nl: "Borderpakketten en wat je zelf nodig hebt.", en: "Border packages and what you need yourself." } },
  { href: "/tuinen/borderpakketten", naam: { nl: "Zelf aan de slag", en: "Do it yourself" }, beeld: TERRAS_PERGOLA, zin: { nl: "Een goed plan voor wie zelf wil aanleggen.", en: "A good plan for those who want to build it themselves." } },
  { href: "/journaal", naam: { nl: "Journaal", en: "Journal" }, beeld: MAANPOORT, zin: { nl: "Wat er buiten gebeurt, per seizoen.", en: "What happens outside, season by season." } },
  { href: "/faq", naam: { nl: "Vragen", en: "Questions" }, beeld: null, zin: { nl: "Antwoord op wat mensen me vaak vragen.", en: "Answers to what people often ask me." } },
  { href: "/kennismaken", naam: { nl: "Kennismaken", en: "Get in touch" }, beeld: null, zin: { nl: "Vertel wat je buiten wilt.", en: "Tell me what you want outside." } },
]
const isHier = (pad: string, href: string) => pad === href || pad.startsWith(href + "/")

function Logo({ wit = false }: { wit?: boolean }) {
  return (
    <>
      {/* het bestaande woordmerk, nooit nagetekend: antraciet op licht, wit met de oranje P op donker */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className={wit ? "hidden" : "ls-logo-licht"} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair.svg" alt="" className={wit ? "" : "ls-logo-donker"} />
    </>
  )
}

export function SiteKop() {
  const pad = usePathname() ?? "/"
  const taal = useTaal()
  const n = (t: L) => kies(t, taal)
  const [open, setOpen] = useState(false)
  const [weergave, setWeergave] = useState(false)
  const [actief, setActief] = useState(0)
  const [gescrold, setGescrold] = useState(false)
  const knop = useRef<HTMLButtonElement>(null)
  const tabknop = useRef<HTMLButtonElement>(null)
  // de zichtbare menuknop: de pil bovenin, of op de telefoon het Menu-vak in de tabbalk
  const terug = () => (knop.current?.offsetParent ? knop.current : tabknop.current)?.focus()

  // bij een nieuwe pagina dicht
  const [vorig, setVorig] = useState(pad)
  if (pad !== vorig) {
    setVorig(pad)
    setOpen(false)
  }

  useEffect(() => {
    const meet = () => setGescrold(scrollY > 24)
    meet()
    addEventListener("scroll", meet, { passive: true })
    return () => removeEventListener("scroll", meet)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle("ls-menu-open", open)
    const achter = document.querySelectorAll<HTMLElement>("#inhoud, .ls-kop, .ls-voet, .ls-omhoog")
    achter.forEach((el) => (el.inert = open))
    if (!open) return
    const toets = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      terug()
    }
    document.addEventListener("keydown", toets)
    return () => {
      document.removeEventListener("keydown", toets)
      achter.forEach((el) => (el.inert = false))
    }
  }, [open])

  const wissel = () => {
    const hier = HOOFD.findIndex((b) => isHier(pad, b.href))
    setActief(hier < 0 ? 0 : hier)
    setWeergave(false)
    setOpen(!open)
  }
  const preview = HOOFD[actief]

  return (
    <>
      <header className="ls-kop">
        <div className="ls-raster ls-kop-binnen">
          <Link href="/" className="ls-logo" aria-label={n({ nl: "GRØNN Studio, naar de voorpagina", en: "GRØNN Studio, to the home page" })}>
            <Logo />
          </Link>
          <nav className="ls-kop-nav" aria-label={n({ nl: "Hoofdmenu", en: "Main menu" })}>
            {HOOFD.slice(0, 4).map((b) => (
              <Link key={b.href} href={b.href} transitionTypes={["schuif"]} aria-current={isHier(pad, b.href) ? "page" : undefined}><T t={b.naam} /></Link>
            ))}
          </nav>
        </div>
      </header>

      {/* de pil staat altijd rechtsboven; na scrollen krijgt hij een eigen vlak */}
      <button
        ref={knop}
        type="button"
        className="ls-menuknop"
        data-gescrold={gescrold || undefined}
        aria-expanded={open}
        aria-controls="ls-menu"
        onClick={wissel}
      >
        <Komeet />
        <span>{open ? <T t={{ nl: "Sluiten", en: "Close" }} /> : "Menu"}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          {open ? <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /> : <path d="M2.5 5.5h11M2.5 10.5h11" />}
        </svg>
      </button>

      <div id="ls-menu" className="ls-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="ls-raster ls-menu-binnen">
          <div className="ls-menu-top">
            <Link href="/" className="ls-logo" aria-label={n({ nl: "GRØNN Studio, naar de voorpagina", en: "GRØNN Studio, to the home page" })} onClick={() => setOpen(false)}>
              <Logo />
            </Link>
          </div>

          {weergave ? (
            <div className="ls-menu-weergave">
              <div>
                <h2 className="ls-h2"><T t={{ nl: "Weergave", en: "Display" }} /></h2>
                <p className="ls-body"><T t={{ nl: "Stel de website af op wat prettig leest.", en: "Set up the website the way it reads best for you." }} /></p>
                <button type="button" className="ls-tekstlink" onClick={() => setWeergave(false)}>
                  <Pijl richting="w" /> <T t={{ nl: "Terug naar het menu", en: "Back to the menu" }} />
                </button>
              </div>
              <div className="ls-paneel ar-weergave"><Instellingen smal zonderLayout /></div>
            </div>
          ) : (
            <div className="ls-menu-index">
              <ol className="ls-menu-lijst">
                {HOOFD.map((b, i) => (
                  <li key={b.href}>
                    <Link
                      href={b.href}
                      transitionTypes={["schuif"]}
                      className="ls-menu-link"
                      data-actief={i === actief || undefined}
                      aria-current={isHier(pad, b.href) ? "page" : undefined}
                      onMouseEnter={() => setActief(i)}
                      onFocus={() => setActief(i)}
                      onClick={() => {
                        setOpen(false)
                        if (b.href === "/kennismaken") track("cta_kennismaken", { plek: "menu" })
                      }}
                    >
                      <span className="ls-menu-woord"><T t={b.naam} /></span>
                      <Pijl richting="e" className="ls-menu-pijl" />
                      {isHier(pad, b.href) ? <span className="ls-menu-hier"><T t={{ nl: "Je bent hier", en: "You are here" }} /></span> : null}
                    </Link>
                  </li>
                ))}
                <li>
                  <button type="button" className="ls-menu-link" aria-pressed={weergave} onClick={() => setWeergave(true)}>
                    <span className="ls-menu-woord"><T t={{ nl: "Weergave", en: "Display" }} /></span>
                    <Pijl richting="e" className="ls-menu-pijl" />
                  </button>
                </li>
              </ol>
              {/* de preview ondersteunt alleen; het menu werkt ook zonder */}
              <div className="ls-menu-preview" aria-hidden>
                {HOOFD.map((b, i) =>
                  b.beeld ? (
                    <figure key={b.href} className="ls-menu-figuur" data-zichtbaar={i === actief || undefined}>
                      <div className="ls-beeld ls-menu-beeld">
                        <Image src={b.beeld.src} alt="" fill sizes="(min-width: 1024px) 34vw, 1px" style={b.beeld.brandpunt ? { objectPosition: b.beeld.brandpunt } : undefined} />
                      </div>
                      <figcaption className="ls-menu-zin"><T t={b.zin} /></figcaption>
                    </figure>
                  ) : (
                    <figure key={b.href} className="ls-menu-figuur ls-menu-tekstvlak" data-zichtbaar={i === actief || undefined}>
                      <p className="ls-h3"><T t={b.zin} /></p>
                      <p className="ls-body">{BUSINESS.email}</p>
                    </figure>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="ls-menu-voet">
            <p className="ls-menu-contact">
              <span><T t={{ nl: "Stein en omgeving", en: "Stein and surroundings" }} /></span>
              <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>
            </p>
          </div>
        </div>
      </div>

      <TabBalk pad={pad} open={open} wissel={wissel} knop={tabknop} />
      <Omhoog />
    </>
  )
}

// De telefoon als app (Nick, 21 nov 2026: "Treat the mobile website like mobile
// app design!"): onderin, onder de duim, een tabbalk met vijf vakken, elk met
// icoon en naam. Menu opent dezelfde index als de pil op groter scherm.
const TABS: { href: string; naam: L; icoon: string }[] = [
  { href: "/", naam: { nl: "Home", en: "Home" }, icoon: "M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" },
  { href: "/werk", naam: { nl: "Werk", en: "Work" }, icoon: "M14.5 4.5l5 5M17 7l-8.5 8.5M8.5 15.5 5 19m3.5-3.5-2-2 2.5-2.5 4 4-2.5 2.5z" },
  { href: "/vijvers", naam: { nl: "Vijvers", en: "Ponds" }, icoon: "M12 4.5c3 3.6 5.5 6.8 5.5 9.7a5.5 5.5 0 0 1-11 0c0-2.9 2.5-6.1 5.5-9.7z" },
  { href: "/tuinen", naam: { nl: "Tuinen", en: "Gardens" }, icoon: "M12 20v-8m0 0c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6zm0 0c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6z" },
]

function TabBalk({ pad, open, wissel, knop }: { pad: string; open: boolean; wissel: () => void; knop: RefObject<HTMLButtonElement | null> }) {
  const taal = useTaal()
  return (
    <nav className="ls-tabbalk" aria-label={kies({ nl: "Tabbalk", en: "Tab bar" }, taal)}>
      {TABS.map((t) => {
        const hier = !open && (t.href === "/" ? pad === "/" : isHier(pad, t.href))
        return (
          <Link key={t.href} href={t.href} transitionTypes={["schuif"]} className="ls-tab" aria-current={hier ? "page" : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={t.icoon} /></svg>
            <span><T t={t.naam} /></span>
          </Link>
        )
      })}
      <button ref={knop} type="button" className="ls-tab" aria-expanded={open} aria-controls="ls-menu" onClick={wissel}>
        <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
          {open ? <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <><circle cx="8" cy="8" r="1.9" /><circle cx="16" cy="8" r="1.9" /><circle cx="8" cy="16" r="1.9" /><circle cx="16" cy="16" r="1.9" /></>}
        </svg>
        <span>{open ? <T t={{ nl: "Sluiten", en: "Close" }} /> : "Menu"}</span>
      </button>
    </nav>
  )
}

const OMHOOG: L = { nl: "Terug naar boven", en: "Back to top" }

/** Terug naar boven, rechtsonder, met de voortgangsring die met de pagina volloopt. */
function Omhoog() {
  const taal = useTaal()
  const [zichtbaar, setZichtbaar] = useState(false)
  useEffect(() => {
    const meet = () => setZichtbaar(scrollY > innerHeight * 0.8)
    meet()
    addEventListener("scroll", meet, { passive: true })
    return () => removeEventListener("scroll", meet)
  }, [])
  const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
  return (
    <button
      type="button"
      className="ls-omhoog"
      data-zichtbaar={zichtbaar || undefined}
      tabIndex={zichtbaar ? undefined : -1}
      aria-hidden={!zichtbaar || undefined}
      aria-label={kies(OMHOOG, taal)}
      title={kies(OMHOOG, taal)}
      onClick={() => scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" })}
    >
      <svg viewBox="0 0 40 40" className="ring-voortgang" aria-hidden><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
      <Pijl richting="n" />
    </button>
  )
}

