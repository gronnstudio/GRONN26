"use client"

import { useState } from "react"

// De koppeling met Google of Apple Agenda: één keer deze link toevoegen, daarna loopt de planning vanzelf mee.
// Apple opent een webcal-link zelf als abonnement (iPhone, iPad, Mac; Nick 2 nov 2026).
export function AgendaLink({ url }: { url: string }) {
  const [gekopieerd, setGekopieerd] = useState(false)
  const webcal = url.replace(/^https:/, "webcal:")
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`
  return (
    <div className="crm-paneel grid gap-2 p-4 text-[13px]">
      <p className="m-0 font-semibold">Koppelen met je agenda</p>
      <div className="flex flex-wrap gap-2">
        <a href={google} target="_blank" rel="noreferrer" className="crm-knop">Toevoegen aan Google Agenda</a>
        <a href={webcal} className="crm-knop">Toevoegen aan Apple Agenda</a>
        <button type="button" onClick={() => navigator.clipboard.writeText(url).then(() => setGekopieerd(true))} className="crm-knop-rand">{gekopieerd ? "Gekopieerd" : "Kopieer de link"}</button>
      </div>
      <p className="m-0 text-[12px] text-gedempt">Apple: tik op de knop op je iPhone of Mac en kies Abonneer. Google: werkt de knop niet, plak de link in Google Agenda bij Andere agenda&apos;s → Via URL. Beide werken hem zelf bij, meestal binnen een paar uur. Deel de link met niemand.</p>
    </div>
  )
}
