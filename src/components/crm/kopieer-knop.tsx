"use client"

import { useState } from "react"

// Kopieert een adres naar het klembord, bijvoorbeeld de privélink van een offerte.
export function KopieerKnop({ tekst, label = "Link kopiëren", className = "crm-knop-rand crm-knop-klein" }: { tekst: string; label?: string; className?: string }) {
  const [klaar, setKlaar] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const adres = new URL(tekst, location.origin).toString()
        try {
          await navigator.clipboard.writeText(adres)
          setKlaar(true)
          setTimeout(() => setKlaar(false), 2000)
        } catch {
          prompt("Kopieer de link:", adres)
        }
      }}
    >
      {klaar ? "Gekopieerd ✓" : label}
    </button>
  )
}
