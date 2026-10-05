"use client"

import { useEffect, useRef, useState } from "react"
import { useTaal } from "./taal-klant"

// Een nummer dat je met één tik overneemt (uit gronn.studio, copy-chip.tsx):
// een KVK- of BTW-nummer wordt niet gelezen maar overgetypt, en daar gaat
// een cijfer verloren. Elk nummer is zijn eigen knop; het nummer blijft
// gewoon staan en selecteerbaar als het klembord er niet is.
export function Kopieer({ label, waarde, kaal = false }: { label: string; waarde: string; kaal?: boolean }) {
  const [stand, setStand] = useState<"rust" | "gekopieerd" | "mislukt">("rust")
  const en = useTaal() === "en"
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
      aria-label={en ? `Copy ${label} ${waarde}` : `${label} ${waarde} kopiëren`}
      className={
        kaal
          ? "group inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent p-0 text-left leading-none text-inherit focus-visible:outline-2 focus-visible:outline-offset-2"
          : "group inline-flex cursor-pointer items-center gap-2 rounded-full border border-lijn py-1.5 pr-2.5 pl-3 text-left leading-none transition-colors hover:border-inkt focus-visible:outline-2 focus-visible:outline-offset-2"
      }
    >
      {label ? <span className={kaal ? "opacity-70" : "text-gedempt"}>{label}</span> : null}
      <span className={kaal ? "tabular-nums" : "text-inkt tabular-nums"}>{waarde}</span>
      <span aria-live="polite" className={kaal ? "grid size-4 place-items-center opacity-70 group-hover:opacity-100" : "grid size-4 place-items-center text-gedempt group-hover:text-inkt"}>
        {stand === "gekopieerd" ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label={en ? "Copied" : "Gekopieerd"}><path d="M3 8.5 6.5 12 13 4.5" /></svg>
        ) : stand === "mislukt" ? (
          <span className="text-[11px]" aria-label={en ? "Copying failed; select the number" : "Kopiëren lukte niet; selecteer het nummer"}>!</span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" /></svg>
        )}
      </span>
    </button>
  )
}
