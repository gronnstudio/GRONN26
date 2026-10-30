"use client"

import { useState } from "react"

// Weghalen dat niet terug kan: eerst de knop, dan "verwijderen" typen. De
// actie controleert het woord zelf ook, de knop alleen is geen bevestiging.
export function VerwijderKnop({ actie, wat }: { actie: (d: FormData) => Promise<void>; wat: string }) {
  const [open, setOpen] = useState(false)
  const [tekst, setTekst] = useState("")
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[12px] text-gedempt underline hover:text-let">
        Verwijderen
      </button>
    )
  return (
    <form action={actie} className="flex flex-wrap items-center justify-end gap-2">
      <label className="text-[12px]">
        Typ <strong>verwijderen</strong> om {wat} weg te halen
        <input name="bevestig" value={tekst} onChange={(e) => setTekst(e.target.value)} autoFocus autoComplete="off" className="crm-veld ml-2 w-[120px]" />
      </label>
      <button type="submit" disabled={tekst.trim().toLowerCase() !== "verwijderen"} className="crm-knop disabled:opacity-40">
        Weg
      </button>
      <button type="button" onClick={() => { setOpen(false); setTekst("") }} className="text-[12px] underline">
        Annuleren
      </button>
    </form>
  )
}
