"use client"

import { useRouter } from "next/navigation"

// Terug en Volgende bovenaan elke pagina (Nick, 30 okt 2026): makkelijker dan
// in het kruimelpad mikken. Gewoon de geschiedenis van de browser.
export function TerugVooruit() {
  const router = useRouter()
  const knop = "grid h-[32px] place-items-center rounded-full border border-lijn px-3 text-[12px] hover:border-inkt"
  return (
    <div className="flex shrink-0 gap-1.5">
      <button type="button" onClick={() => router.back()} className={knop}>← Terug</button>
      <button type="button" onClick={() => router.forward()} className={knop}>Volgende →</button>
    </div>
  )
}
