"use client"

import { useState } from "react"

// Eén knop die de caption naar het klembord zet, voor Instagram op de telefoon.
export function Kopieer({ tekst }: { tekst: string }) {
  const [klaar, setKlaar] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(tekst)
        setKlaar(true)
        setTimeout(() => setKlaar(false), 2000)
      }}
      className="knop-klein bg-oranje text-[#202020]"
    >
      {klaar ? "Gekopieerd ✓" : "Kopieer caption"}
    </button>
  )
}
