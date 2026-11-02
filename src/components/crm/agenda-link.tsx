"use client"

import { useState } from "react"

// De koppeling met Google Agenda: één keer deze link toevoegen, daarna loopt de planning vanzelf mee.
export function AgendaLink({ url }: { url: string }) {
  const [gekopieerd, setGekopieerd] = useState(false)
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(url.replace(/^https:/, "webcal:"))}`
  return (
    <div className="crm-paneel grid gap-2 p-4 text-[13px]">
      <p className="m-0 font-semibold">Koppelen met Google Agenda</p>
      <div className="flex flex-wrap gap-2">
        <a href={google} target="_blank" rel="noreferrer" className="crm-knop">Toevoegen aan Google Agenda</a>
        <button type="button" onClick={() => navigator.clipboard.writeText(url).then(() => setGekopieerd(true))} className="crm-knop-rand">{gekopieerd ? "Gekopieerd" : "Kopieer de link"}</button>
      </div>
      <p className="m-0 text-[12px] text-gedempt">Werkt de knop niet: in Google Agenda bij Andere agenda&apos;s → Via URL deze link plakken. Google werkt hem zelf bij, meestal binnen een paar uur. Deel de link met niemand.</p>
    </div>
  )
}
