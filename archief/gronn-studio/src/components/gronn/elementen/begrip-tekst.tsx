import type { ReactNode } from "react"

import { Begrip, type BegripData } from "./begrip"

// Hulpje bij `Begrip`, bewust GEEN client-module: een servercomponent
// (Feitenlijst) roept het aan, en een functie uit een "use client"-
// bestand is op de server alleen een verwijzing.

/**
 * Zet in een reeks teksten de EERSTE keer dat elk begrip voorkomt om in
 * een `Begrip`; de rest blijft letter voor letter gelijk. Het woord moet
 * los staan (geen letter of cijfer ervoor of erna), zodat "PP" nooit
 * midden in een ander woord oplicht.
 */
export function metBegrippen(teksten: string[], begrippen: BegripData[]): ReactNode[] {
  const gebruikt = new Set<string>()
  return teksten.map((tekst) => {
    const treffers: { start: number; eind: number; b: BegripData }[] = []
    for (const b of begrippen) {
      if (gebruikt.has(b.woord)) continue
      const escaped = b.woord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const m = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "u").exec(tekst)
      if (!m) continue
      gebruikt.add(b.woord)
      treffers.push({ start: m.index, eind: m.index + b.woord.length, b })
    }
    if (treffers.length === 0) return tekst
    treffers.sort((a, z) => a.start - z.start)
    const delen: ReactNode[] = []
    let plek = 0
    for (const t of treffers) {
      if (t.start < plek) continue // overlapt met het vorige begrip
      delen.push(tekst.slice(plek, t.start))
      delen.push(
        <Begrip key={t.b.woord} term={t.b.term} uitleg={t.b.uitleg}>
          {t.b.woord}
        </Begrip>
      )
      plek = t.eind
    }
    delen.push(tekst.slice(plek))
    return delen
  })
}
