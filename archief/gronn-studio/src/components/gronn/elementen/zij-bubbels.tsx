"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useLanguage, useT } from "@/components/language-provider"
import { CHANNELS } from "@/components/layout/channel-icons"
import { SEIZOEN } from "@/lib/data/seizoen"
import { klok, maanFase, zonStand, zonTijden } from "@/lib/hemel"
import { localePath, stripLocale } from "@/lib/locale"
import { useKlok } from "@/lib/use-klok"
import { cn } from "@/lib/utils"

import { MaanIcoon, maanLabel, ZonIcoon, zonLabel } from "./hemel"
import { seizoensRegel } from "./seizoenszaadje"
import { ZIJ, ZIJ_BOVEN_VRIJ_PX, ZIJ_LINKS, ZIJ_RECHTS } from "./zij-kolom"

/**
 * Zijbubbels: links WhatsApp en Instagram, rechts de tuinkalender, de zon
 * en de maan van vandaag. Eigenaar, 27 sep 2026: "we hebben links en
 * rechts op desktop plek zat, maak zoals in de oude site whatsapp en
 * instagram links in een bubbel, en de kalender in een rechterbubbel plus
 * de maan zon". De linker is de `ContactRail` van de oude site in V5-vorm
 * (glas van de dock, maten in px); de rechter is nieuw.
 *
 * Alleen vanaf `xl` (1280): daaronder raakt een pil op 16px van de rand
 * de tekstkolom (`BREEDTE`: 64px marge). Breedte, rand en hoogte komen uit
 * `zij-kolom.ts`: de bubbels staan in één kolom met `NaarBovenKnop`
 * (eigenaar, 28 sep 2026: "knop voor naar boven is uit de maat met de
 * docks"): dezelfde breedte, rand en middenlijn als de knop. Verticaal
 * staan ze sinds 29 sep 2026 in het midden van het scherm ("de zijbalken
 * centreren in midden aan de randen").
 * Zoals de oude rail wachten ze tot de opening voorbij is en gaan ze opzij zolang de voet in
 * beeld is. Verborgen zijn ze `inert`. Alle tekst loopt verticaal in
 * Geist Mono, zoals de labels van de oude rail, maar 180° gedraaid: je
 * leest van onder naar boven (eigenaar, 28 sep 2026).
 */
function useZijZichtbaar() {
  const [zichtbaar, setZichtbaar] = useState(false)
  useEffect(() => {
    let voorbij = false
    let voetInBeeld = false
    const zet = () => setZichtbaar(voorbij && !voetInBeeld)
    const scroll = () => {
      voorbij = window.scrollY > window.innerHeight * 0.9
      zet()
    }
    window.addEventListener("scroll", scroll, { passive: true })
    scroll()
    const voet = document.querySelector("footer")
    let io: IntersectionObserver | undefined
    if (voet && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => {
        voetInBeeld = e.isIntersecting
        zet()
      })
      io.observe(voet)
    }
    return () => {
      window.removeEventListener("scroll", scroll)
      io?.disconnect()
    }
  }, [])
  return zichtbaar
}

/**
 * Pagina's zonder zijbubbels, in beide talen (de route zonder taalprefix).
 * Eigenaar, 29 sep 2026, over /stack: "op techniek pagina schakel bubbels
 * langs zijkanten uit!". De `NaarBovenKnop` blijft: die staat los van de
 * bubbels op zijn eigen plek rechtsonder.
 */
export const ZONDER_ZIJBUBBELS = ["/stack"]

function useZijUit() {
  return ZONDER_ZIJBUBBELS.includes(stripLocale(usePathname() ?? "/"))
}

/**
 * Past de bubbel tussen de kopbalk en de knop eronder? Gemeten, niet
 * geschat: de lengte van de kalenderregel hangt af van maand en taal
 * ("sep · bollen planten" tegen "jun · fish blanket weed from the pond").
 * - `vol`: alles past.
 * - `kort`: zonder de tekst van de kalender past hij (het icoon blijft; de
 *   regel gaat `sr-only`, schermlezers houden hem).
 * - `weg`: ook dan niet; hij verdwijnt zoals bij de voet, zonder overlap.
 * De maat wordt alleen in `vol` genomen en bewaard; bij nieuwe inhoud
 * (`sleutel`) begint hij weer vol.
 */
type Stand = "vol" | "kort" | "weg"
function useZijPast(el: HTMLElement | null, tekst: HTMLElement | null, sleutel: string): Stand {
  const [stand, setStand] = useState<Stand>("vol")
  const [vorige, setVorige] = useState(sleutel)
  // Nieuwe inhoud: meteen weer vol, zodat hij opnieuw gemeten kan worden.
  if (vorige !== sleutel) {
    setVorige(sleutel)
    setStand("vol")
  }
  const maat = useRef<{ sleutel: string; vol: number; tekst: number } | null>(null)
  useEffect(() => {
    if (!el) return
    const kies = () => {
      const m = maat.current
      if (!m || m.sleutel !== sleutel) return
      // Gecentreerd: boven en onder elk de kopbalk plus de tussenmaat vrij.
      const ruimte = window.innerHeight - 2 * ZIJ_BOVEN_VRIJ_PX
      setStand(m.vol <= ruimte ? "vol" : m.tekst > 0 && m.vol - m.tekst <= ruimte ? "kort" : "weg")
    }
    const meet = () => {
      if (el.dataset.stand === "vol" && el.offsetHeight > 0) {
        // De tekst plus de tussenruimte naar zijn icoon (flex-gap).
        const gap = tekst?.parentElement ? parseFloat(getComputedStyle(tekst.parentElement).rowGap) || 0 : 0
        maat.current = { sleutel, vol: el.offsetHeight, tekst: tekst ? tekst.offsetHeight + gap : 0 }
      }
      kies()
    }
    meet()
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(meet) : undefined
    ro?.observe(el)
    window.addEventListener("resize", meet)
    return () => {
      ro?.disconnect()
      window.removeEventListener("resize", meet)
    }
  }, [el, tekst, sleutel])
  return stand
}

const PIL = [
  // Verticaal in het midden van het scherm (eigenaar, 29 sep 2026: "de
  // zijbalken centreren in midden aan de randen"); zij-kolom.ts.
  "fixed top-1/2 z-30 hidden -translate-y-1/2 items-center gap-[20px] py-[20px] xl:flex",
  "rounded-full border border-line/15 shadow-[var(--shadow-dock)]",
  "bg-surface/95 supports-[backdrop-filter]:bg-transparent supports-[backdrop-filter]:nav-glass",
  "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
].join(" ")

// Elke pil is één liggende regel met iconen die meedraaien (eigenaar, 28
// sep 2026: "kun je deze omdraaien", "if you turn the text, turn the icon
// with it", en toen "whatsapp en instagram links is perfect, maar voor de
// rechterkant draai 180 graden"). Twee richtingen dus:
// - LINKS een kwartslag naar links: je leest van onder naar boven. Tekst
//   vertical-rl plus een halve slag, iconen -90°, het icoon onder zijn
//   woord en WhatsApp onderaan (flex-col-reverse).
// - RECHTS een kwartslag naar rechts: je leest van boven naar onder. Tekst
//   gewoon vertical-rl, iconen +90°, het icoon boven zijn woord en de
//   kalender bovenaan (flex-col).
// Links draaien daarmee ook de merktekens van WhatsApp en Instagram;
// bewust, op zijn keuze. Elk element is een flex-item, dus transformeerbaar.
const LETTERS = "font-mono text-[10px] leading-[12px] tracking-[0.2em] uppercase [writing-mode:vertical-rl]"
const LINKS = { tekst: `${LETTERS} rotate-180`, icoon: "-rotate-90", richting: "flex-col-reverse" }
const RECHTS = { tekst: LETTERS, icoon: "rotate-90", richting: "flex-col" }

// Rechts is elk van de drie een link naar /calendar (eigenaar, 28 sep
// 2026: "make this also clickable so it opens a link, to a page with
// advanced info?"), met dezelfde hover en focus als links.
const HEMEL_LINK = `group flex w-full ${RECHTS.richting} items-center gap-[10px] text-[color:var(--dock-label)] transition-colors hover:text-[color:var(--ember-text)] focus-visible:text-[color:var(--ember-text)]`

const Streep = () => <span aria-hidden className="h-[32px] w-px shrink-0 bg-line/20" />

export function ContactBubbel() {
  const t = useT()
  const zichtbaar = useZijZichtbaar()
  const [el, setEl] = useState<HTMLElement | null>(null)
  const stand = useZijPast(el, null, "contact")
  const uit = useZijUit()
  if (uit) return null
  const aan = zichtbaar && stand !== "weg"
  return (
    <nav
      ref={setEl}
      data-stand={stand}
      data-element="ContactBubbel"
      aria-label={t({ nl: "Snel contact", en: "Quick contact" })}
      inert={!aan}
      aria-hidden={!aan}
      className={cn(PIL, LINKS.richting, aan ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[8px] opacity-0")}
      style={{ left: ZIJ_LINKS, width: ZIJ.breedte }}
    >
      <Streep />
      {CHANNELS.map((c) => (
        <a
          key={c.key}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(c.aria)}
          className={`group flex min-h-[44px] w-full ${LINKS.richting} items-center gap-[10px] text-[color:var(--dock-label)] transition-colors hover:text-[color:var(--ember-text)] focus-visible:text-[color:var(--ember-text)]`}
        >
          {/* Het merkteken in de kleur van de dienst (zie channel-icons.tsx); het label in de eigen tint. */}
          <span aria-hidden data-icoon="" className={`flex ${LINKS.icoon}`} style={{ color: c.color }}>
            {c.icon}
          </span>
          <span aria-hidden className={LINKS.tekst}>
            {c.label}
          </span>
        </a>
      ))}
      <Streep />
    </nav>
  )
}

export function HemelBubbel() {
  const zichtbaar = useZijZichtbaar()
  const nu = useKlok()
  const { locale } = useLanguage()
  const t = useT()
  const [el, setEl] = useState<HTMLElement | null>(null)
  const [tekst, setTekst] = useState<HTMLElement | null>(null)
  const zin = seizoensRegel(nu, SEIZOEN)
  const stand = useZijPast(el, tekst, `${locale}:${zin?.[locale] ?? ""}`)
  const uit = useZijUit()
  if (!nu || uit) return null
  const aan = zichtbaar && stand !== "weg"
  const m = maanFase(nu)
  const tijden = zonTijden(nu)
  const op = tijden ? klok(tijden.op) : null
  const onder = tijden ? klok(tijden.onder) : null
  const kalender = localePath(locale, "/calendar")
  return (
    <aside
      ref={setEl}
      data-element="HemelBubbel"
      data-stand={stand}
      aria-label={t({ nl: "Vandaag in Stein", en: "Today in Stein" })}
      inert={!aan}
      aria-hidden={!aan}
      className={cn(
        PIL,
        RECHTS.richting,
        "text-[color:var(--dock-label)]",
        aan ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[8px] opacity-0"
      )}
      style={{ right: ZIJ_RECHTS, width: ZIJ.breedte }}
    >
      <Streep />
      {zin && (
        <Link
          href={kalender}
          data-hemel="kalender"
          title={t({ nl: "Tuinkalender", en: "Garden calendar" })}
          className={HEMEL_LINK}
        >
          <svg aria-hidden data-icoon="" className={RECHTS.icoon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <rect x="2" y="3" width="12" height="11" rx="2" />
            <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
          </svg>
          {/* Kort: de regel gaat uit beeld maar blijft voor schermlezers. */}
          <span ref={setTekst} data-kalender-tekst="" className={stand === "kort" ? "sr-only" : RECHTS.tekst}>
            <span className="sr-only">{t({ nl: "Tuinkalender: ", en: "Garden calendar: " })}</span>
            {zin[locale]}
          </span>
        </Link>
      )}
      {op && onder && tijden && (
        <Link href={kalender} data-hemel="zon" title={zonLabel(op, onder, locale)} className={HEMEL_LINK}>
          <ZonIcoon t={zonStand(nu, tijden)} breed={28} className={`${RECHTS.icoon} my-[9px]`} />
          <span className="sr-only">{zonLabel(op, onder, locale)}</span>
          <span aria-hidden className={RECHTS.tekst}>
            {op}–{onder}
          </span>
        </Link>
      )}
      <Link href={kalender} data-hemel="maan" title={maanLabel(m, locale)} className={HEMEL_LINK}>
        <MaanIcoon m={m} className={RECHTS.icoon} />
        <span className="sr-only">{maanLabel(m, locale)}</span>
        <span aria-hidden className={RECHTS.tekst}>
          {Math.round(m.verlicht * 100)} %
        </span>
      </Link>
      <Streep />
    </aside>
  )
}
