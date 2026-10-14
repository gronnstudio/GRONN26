"use client"

import { useState } from "react"
import { flushSync } from "react-dom"
import { LelieBloem, SCHUIF } from "@/components/lelie"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"

// "Probeer het" op /techniek: drie stukken techniek van de site die je zelf
// kunt aanraken, elk met de naam van wat erachter zit. Sinds 14 okt 2026
// zonder projectfoto's (eigenaar: "niet werk gerelateerd").

export function Probeer() {
  return (
    <ul className="pb m-0 list-none p-0">
      <li className="pb-tegel">
        <Letters />
        <Onderschrift naam="Syne · Montserrat" doe={{ nl: "Typ je eigen woord", en: "Type your own word" }} />
      </li>
      <li className="pb-tegel">
        <Lelie />
        <Onderschrift naam="SVG · CSS" doe={{ nl: "Tik op de knop van Weergave", en: "Tap the Display button" }} />
      </li>
      <li className="pb-tegel">
        <Groei />
        <Onderschrift naam="View Transitions" doe={{ nl: "Tik op het blok", en: "Tap the block" }} />
      </li>
    </ul>
  )
}

function Onderschrift({ naam, doe }: { naam: string; doe: { nl: string; en: string } }) {
  return (
    <p className="pb-onder">
      <span className="syne pb-naam">{naam}</span>
      <span className="lbl text-gedempt"><T t={doe} /></span>
    </p>
  )
}

function Lelie() {
  const [open, setOpen] = useState(false)
  const taal = useTaal()
  return (
    <div className="pb-vak pb-lelie">
      <button
        type="button"
        aria-expanded={open}
        aria-label={taal === "en" ? "Display (demo)" : "Weergave (voorbeeld)"}
        onClick={() => setOpen(!open)}
        className="grid size-[var(--knop-groot)] place-items-center rounded-full bg-oranje text-antraciet shadow-[0_10px_30px_rgb(0_0_0/.18)]"
      >
        <svg width="30" height="30" viewBox="0 0 22 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lelie-knop">
          <path className="lelie-schuif" d={SCHUIF} />
          <LelieBloem />
        </svg>
      </button>
      <span className="lbl text-gedempt" aria-hidden="true">
        {open ? <T t={{ nl: "Open", en: "Open" }} /> : <T t={{ nl: "Dicht", en: "Closed" }} />}
      </span>
    </div>
  )
}

function Groei() {
  const [groot, setGroot] = useState(false)
  const taal = useTaal()
  const wissel = () => {
    const doc = document as Document & { startViewTransition?: (f: () => void) => unknown }
    const stil = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("stil")
    if (!doc.startViewTransition || stil) return setGroot(!groot)
    doc.startViewTransition(() => flushSync(() => setGroot(!groot)))
  }
  return (
    <div className="pb-vak pb-groei" data-groot={groot || undefined}>
      <button type="button" onClick={wissel} aria-pressed={groot} className="pb-groei-knop" aria-label={taal === "en" ? "Grow the block" : "Laat het blok groeien"}>
        <span className="pb-groei-beeld" style={{ viewTransitionName: "tk-groei" }} />
      </button>
      <span className="lbl pb-groei-tekst" aria-hidden="true">
        {groot ? <T t={{ nl: "Groot · tik om terug", en: "Big · tap to go back" }} /> : <T t={{ nl: "Klein · tik om te groeien", en: "Small · tap to grow" }} />}
      </span>
    </div>
  )
}

// Typ een woord en zie het in de letter van het merk; de schuif zet de maat.
function Letters() {
  const taal = useTaal()
  const [woord, setWoord] = useState("")
  const [maat, setMaat] = useState(56)
  return (
    <div className="pb-vak pb-letters">
      <p className="syne pb-letters-woord" style={{ fontSize: maat }} aria-hidden="true">
        {woord || "GRØNN"}
      </p>
      <div className="pb-letters-invoer">
        <label className="sr-only" htmlFor="pb-woord">{taal === "en" ? "Your word" : "Jouw woord"}</label>
        <input id="pb-woord" value={woord} onChange={(e) => setWoord(e.target.value.slice(0, 24))} placeholder={taal === "en" ? "Type a word" : "Typ een woord"} className="pb-letters-veld" autoComplete="off" />
        <label className="sr-only" htmlFor="pb-maat">{taal === "en" ? "Size" : "Maat"}</label>
        <input id="pb-maat" type="range" min={24} max={96} value={maat} onChange={(e) => setMaat(Number(e.target.value))} className="pb-letters-schuif" />
      </div>
    </div>
  )
}
