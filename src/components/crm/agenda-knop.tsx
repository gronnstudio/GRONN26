"use client"

import { agendaBestand } from "@/lib/crm/project"

// Alles uit de planning als één .ics-bestand: openen in Google Agenda, Apple Agenda of Outlook.
export function AgendaKnop({ items }: { items: { id: string; titel: string; van: string; tot: string }[] }) {
  if (!items.length) return null
  const download = () => {
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([agendaBestand(items)], { type: "text/calendar" }))
    a.download = "Planning GRØNN.ics"
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={download} className="crm-knop-rand">Zet alles in je agenda (.ics)</button>
      <span className="text-[12px] text-gedempt">Werkt met Google Agenda, Apple Agenda en Outlook.</span>
    </div>
  )
}
