"use client"

import { useEffect, useRef, useState } from "react"

// Een nummer dat je met één tik overneemt (uit gronn.studio, copy-chip.tsx):
// een KVK- of BTW-nummer wordt niet gelezen maar overgetypt, en daar gaat
// een cijfer verloren. Elk nummer is zijn eigen knop; het nummer blijft
// gewoon staan en selecteerbaar als het klembord er niet is.
export function Kopieer({ label, waarde }: { label: string; waarde: string }) {
  const [stand, setStand] = useState<"rust" | "gekopieerd" | "mislukt">("rust")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const kopieer = async () => {
    if (timer.current) clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(waarde)
      setStand("gekopieerd")
    } catch {
      setStand("mislukt")
    }
    timer.current = setTimeout(() => setStand("rust"), 2000)
  }

  return (
    <button
      type="button"
      onClick={kopieer}
      aria-label={`${label} ${waarde} kopiëren`}
      className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-lijn py-1.5 pr-2.5 pl-3 text-left leading-none transition-colors hover:border-inkt focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="text-gedempt">{label}</span>
      <span className="text-inkt tabular-nums">{waarde}</span>
      <span aria-live="polite" className="grid size-4 place-items-center text-gedempt group-hover:text-inkt">
        {stand === "gekopieerd" ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Gekopieerd"><path d="M3 8.5 6.5 12 13 4.5" /></svg>
        ) : stand === "mislukt" ? (
          <span className="text-[11px]" aria-label="Kopiëren lukte niet; selecteer het nummer">!</span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" /></svg>
        )}
      </span>
    </button>
  )
}
