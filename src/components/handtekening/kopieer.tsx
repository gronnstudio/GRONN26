"use client"

import { useState } from "react"

/**
 * Zet de handtekening als opgemaakte tekst op het klembord, zodat plakken
 * in Gmail de tabel, de kleuren en de beelden meeneemt. Met de platte
 * tekst ernaast voor programma's die geen HTML plakken. Lukt het niet
 * (oudere browser, geen toestemming), dan zegt de knop dat en blijft
 * selecteren en kopiëren met de hand werken.
 */
export function KopieerHandtekening({ html }: { html: string }) {
  const [staat, setStaat] = useState<"rust" | "gekopieerd" | "mislukt">("rust")

  async function kopieer() {
    try {
      const tekst = new DOMParser().parseFromString(html, "text/html").body.innerText
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([tekst], { type: "text/plain" }),
        }),
      ])
      setStaat("gekopieerd")
    } catch {
      setStaat("mislukt")
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <button
        type="button"
        onClick={kopieer}
        className="knop bg-oranje text-antraciet"
      >
        Kopieer handtekening
      </button>
      <p role="status" className="m-0 text-[15px] text-gedempt">
        {staat === "gekopieerd" && "Gekopieerd. Plak hem nu in Gmail."}
        {staat === "mislukt" && "Kopiëren lukte niet. Selecteer de handtekening hierboven en kopieer hem zelf."}
      </p>
    </div>
  )
}
