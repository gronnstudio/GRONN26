"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { T } from "@/components/taal"
import { STAPPEN } from "@/lib/data/techniek"

// Het filter (/techniek, 11 okt 2026): stuur zelf een wijziging door de zes
// controles die elke echte wijziging doorloopt. Een goede komt live; een met
// een fout blijft hangen bij TypeScript, en er gaat niets live.

type Stand = { soort: "rust" } | { soort: "loopt" | "klaar"; stap: number; fout: boolean }

const STAP_MS = 650

export function Filter() {
  const [stand, setStand] = useState<Stand>({ soort: "rust" })
  const klok = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (klok.current) clearTimeout(klok.current) }, [])

  const stuur = (fout: boolean) => {
    if (klok.current) clearTimeout(klok.current)
    const eind = fout ? STAPPEN.findIndex((s) => s.fout) : STAPPEN.length - 1
    const stil = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("stil")
    if (stil) return setStand({ soort: "klaar", stap: eind, fout })
    const volgende = (stap: number) => {
      setStand({ soort: stap === eind ? "klaar" : "loopt", stap, fout })
      if (stap < eind) klok.current = setTimeout(() => volgende(stap + 1), STAP_MS)
    }
    volgende(0)
  }

  const stap = stand.soort === "rust" ? -1 : stand.stap
  const fout = stand.soort !== "rust" && stand.fout
  const klaar = stand.soort === "klaar"
  const toestand = (i: number) => {
    if (i > stap) return "wacht"
    if (i === stap && fout && klaar) return "fout"
    if (i === stap && !klaar) return "bezig"
    return "ok"
  }

  return (
    <div className="fl">
      <div className="fl-knoppen">
        <button type="button" className="knop bg-oranje text-antraciet" onClick={() => stuur(false)} disabled={stand.soort === "loopt"}>
          <T t={{ nl: "Stuur een goede wijziging", en: "Send a good change" }} />
        </button>
        <button type="button" className="knop border border-inkt" onClick={() => stuur(true)} disabled={stand.soort === "loopt"}>
          <T t={{ nl: "Stuur er een met een fout", en: "Send one with a mistake" }} />
        </button>
      </div>

      <ol className="fl-spoor m-0 list-none p-0" style={{ "--ver": stap < 0 ? 0 : stap / (STAPPEN.length - 1) } as CSSProperties}>
        {STAPPEN.map((s, i) => (
          <li key={s.naam} data-stand={toestand(i)}>
            <span className="fl-stip" aria-hidden="true">
              {toestand(i) === "ok" ? "✓" : toestand(i) === "fout" ? "×" : ""}
            </span>
            <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")}</span>
            <span className="syne fl-naam">{s.naam}</span>
            <span className="fl-wat">
              {toestand(i) === "fout" && s.fout ? <T t={s.fout} /> : toestand(i) === "ok" ? <T t={s.wat} /> : null}
            </span>
          </li>
        ))}
      </ol>

      <p className="fl-uitkomst syne" aria-live="polite" data-stand={klaar ? (fout ? "fout" : "ok") : "rust"}>
        {stand.soort === "rust" ? (
          <T t={{ nl: "Kies hierboven een wijziging.", en: "Pick a change above." }} />
        ) : !klaar ? (
          <T t={{ nl: `Stap ${stap + 1} van ${STAPPEN.length}: ${STAPPEN[stap].naam}…`, en: `Step ${stap + 1} of ${STAPPEN.length}: ${STAPPEN[stap].naam}…` }} />
        ) : fout ? (
          <T t={{ nl: "Tegengehouden. Er ging niets live.", en: "Stopped. Nothing went live." }} />
        ) : (
          <T t={{ nl: "Live. Zo gaat het bij elke wijziging.", en: "Live. That is how every change goes." }} />
        )}
      </p>
    </div>
  )
}
