"use client"

import { Icoon } from "./iconen"
import { OPEN_GRØNN } from "./schil"

// Op een klantkaart: Grønn openen met deze klant erbij (het zijpaneel weet
// uit het adres over welke klant het gaat).
export function GrønnKnop() {
  return (
    <section className="crm-paneel p-5">
      <p className="crm-label m-0">Grønn</p>
      <p className="m-0 mt-1 text-[13px] text-gedempt">Vat de klant samen, zie wat er in de opname ontbreekt, of laat een bericht voorstellen.</p>
      <button type="button" onClick={() => dispatchEvent(new Event(OPEN_GRØNN))} className="crm-knop-rand mt-3 w-full">
        <Icoon naam="grønn" className="size-[16px] text-accent-tekst" /> Vraag Grønn over deze klant
      </button>
    </section>
  )
}
