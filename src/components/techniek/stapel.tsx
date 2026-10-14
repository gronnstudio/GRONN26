"use client"

import { useState, type CSSProperties } from "react"
import { T } from "@/components/taal"
import { LAGEN } from "@/lib/data/techniek"

// De site als stapel (/techniek, 14 okt 2026): vijf lagen op elkaar, van je
// scherm bovenaan tot de meting onderaan. Kies een laag en hij schuift uit de
// stapel en licht oranje op; ernaast staat wat hij doet en welk gereedschap
// erbij hoort. Pijltjestoetsen lopen door de lagen.

export function Stapel() {
  const [kies, setKies] = useState(LAGEN[0].id)
  const index = Math.max(0, LAGEN.findIndex((l) => l.id === kies))
  const laag = LAGEN[index]

  const toets = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const stap = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0
    if (!stap) return
    e.preventDefault()
    const volgende = LAGEN[(index + stap + LAGEN.length) % LAGEN.length]
    setKies(volgende.id)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-laag="${volgende.id}"]`)?.focus()
  }

  return (
    <div className="st">
      <div className="st-stapel" role="group" aria-label="Kies een laag van de site" onKeyDown={toets}>
        {LAGEN.map((l, i) => (
          <button
            key={l.id}
            type="button"
            data-laag={l.id}
            aria-pressed={l.id === kies}
            tabIndex={l.id === kies ? 0 : -1}
            onClick={() => setKies(l.id)}
            className="st-plaat"
            style={{ "--i": i } as CSSProperties}
          >
            <span className="lbl tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="syne st-plaat-naam"><T t={l.naam} /></span>
            <span className="lbl tabular-nums st-plaat-aantal">{l.delen.length}</span>
          </button>
        ))}
      </div>

      <div className="st-uitleg" aria-live="polite" key={laag.id}>
        <p className="lbl m-0 text-gedempt">
          {String(index + 1).padStart(2, "0")} · {laag.delen.length} <T t={{ nl: "onderdelen", en: "parts" }} />
        </p>
        <p className="st-zin m-0"><T t={laag.zin} /></p>
        <ul className="st-delen m-0 list-none p-0">
          {laag.delen.map((d, i) => (
            <li key={d.naam} style={{ "--i": i } as CSSProperties}>
              <span className="syne st-naam">{d.naam}</span>
              <span className="lbl text-gedempt"><T t={d.soort} /></span>
              <span className="st-wat"><T t={d.wat} /></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
