"use client"

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react"

import { pick, type L, type Locale } from "@/lib/i18n"

// Begrip: een vakterm in lopende tekst met een stippellijn eronder; een
// tik, klik of Enter opent een kaartje met de uitleg (eigenaar, 25 sep
// 2026: "Bouw ze"; idee van Dan Hoye, "planting explanations", "no
// jargon"). De uitleg komt ALTIJD uit de eigen tekst: een Begrip legt
// nooit iets uit wat de bron niet zelf uitlegt.
//
// Native popover, geen eigen JS voor openen en sluiten: `popover="auto"`
// geeft light dismiss en Escape, en de browser zet de focus terug op de
// knop. Het enige wat React doet is `aria-expanded` bijhouden via het
// `toggle`-event — aria-describedby is met popovers niet betrouwbaar.
//
// Plaatsing (globals.css, "Begrip"): vanaf md met CSS anchor positioning
// onder het woord; op de telefoon, en zonder anchor-ondersteuning, als
// een kaart onderin boven de dock. De ankernaam komt uit useId, zodat er
// meerdere begrippen op één pagina kunnen staan.

const LABEL: L = { nl: "Begrip", en: "Term" }
const SLUIT: L = { nl: "Sluiten", en: "Close" }

/** Een begrip zoals een tekst het aanlevert: het woord in de tekst, de naam op de kaart, de uitleg. */
export type BegripData = {
  /** De tekst zoals hij in de alinea staat; alleen de eerste keer wordt hij een Begrip. */
  woord: string
  /** De naam op de kaart. */
  term: string
  /** Letterlijk (of een getrouw uittreksel) uit de bron. */
  uitleg: string
}

export function Begrip({
  term,
  uitleg,
  children,
  taal = "nl",
}: {
  term: string
  uitleg: string
  /** Het woord zoals het in de zin staat; zonder kinderen de term zelf. */
  children?: ReactNode
  /** De taal van de omringende tekst, voor "Begrip" en "Sluiten". */
  taal?: Locale
}) {
  // useId geeft «r1» of :r1:, en dat is geen geldige <dashed-ident>.
  const id = `begrip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const kaart = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = kaart.current
    if (!el) return
    const bij = (e: Event) => setOpen((e as ToggleEvent).newState === "open")
    el.addEventListener("toggle", bij)
    return () => el.removeEventListener("toggle", bij)
  }, [])

  return (
    <span className="g-begrip" style={{ "--begrip-anker": `--${id}` } as CSSProperties}>
      <button
        type="button"
        popoverTarget={id}
        aria-expanded={open}
        aria-controls={id}
        data-begrip={term}
        className="g-begrip-knop"
      >
        {children ?? term}
      </button>
      <span ref={kaart} id={id} popover="auto" role="note" aria-labelledby={`${id}-term`} className="g-begrip-kaart">
        <span className="flex items-baseline justify-between gap-[16px]">
          <span className="tekst-annotatie text-muted">{pick(LABEL, taal)}</span>
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            className="g-begrip-sluit tekst-annotatie text-muted"
          >
            {pick(SLUIT, taal)}
          </button>
        </span>
        <span id={`${id}-term`} className="mt-[8px] block font-semibold">
          {term}
        </span>
        <span className="mt-[4px] block">{uitleg}</span>
      </span>
    </span>
  )
}
