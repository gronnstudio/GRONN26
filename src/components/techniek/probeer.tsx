"use client"

import { useState } from "react"
import { flushSync } from "react-dom"
import Image from "next/image"
import { Foto } from "@/components/foto"
import { LelieBloem, SCHUIF } from "@/components/lelie"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import { F08_2, F10 } from "@/components/voorpagina/beelden"

// "Probeer het" op /techniek (11 okt 2026): drie stukken techniek van de site
// die je zelf kunt aanraken, elk met de naam van wat erachter zit.

export function Probeer() {
  return (
    <ul className="pb m-0 list-none p-0">
      <li className="pb-tegel">
        <Foto foto={F10} rimpel sizes="(min-width: 1024px) 33vw, 100vw" className="pb-vak" />
        <Onderschrift naam="WebGL" doe={{ nl: "Beweeg over het water", en: "Move across the water" }} />
      </li>
      <li className="pb-tegel">
        <Lelie />
        <Onderschrift naam="SVG · CSS" doe={{ nl: "Tik op de knop van Weergave", en: "Tap the Display button" }} />
      </li>
      <li className="pb-tegel">
        <Groei />
        <Onderschrift naam="View Transitions" doe={{ nl: "Tik op de foto", en: "Tap the photo" }} />
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
      <button type="button" onClick={wissel} aria-pressed={groot} className="pb-groei-knop" aria-label={taal === "en" ? "Grow the photo" : "Laat de foto groeien"}>
        <span className="pb-groei-beeld" style={{ viewTransitionName: "tk-groei" }}>
          <Image src={F08_2.src} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </span>
      </button>
      <span className="lbl pb-groei-tekst" aria-hidden="true">
        <T t={{ nl: "GR / 001 · Vijverrenovatie", en: "GR / 001 · Pond renovation" }} />
      </span>
    </div>
  )
}
