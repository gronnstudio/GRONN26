"use client"

import { HoursSwitch } from "@/components/layout/header-controls"
import { Komeet } from "@/components/layout/komeet"

/**
 * De Uren-schakelaar los, voor een pagina zonder kop (de linkpagina).
 * Dezelfde knop als in de kop van de site — zon ↔ maan, Licht ↔ Donker,
 * en een keuze stopt de klok — in dezelfde glazen pil met de komeet
 * (eigenaar, 28 sep 2026: "gebruik dezelfde switch als op main"). Anders
 * dan `ControlGroup` ook op de telefoon zichtbaar: daar komt de bio-link
 * binnen.
 */
export function UrenPil() {
  return (
    <div data-element="UrenPil" className="relative inline-flex items-center rounded-full">
      <Komeet />
      <div className="glass flex items-center rounded-full p-[4px]">
        <HoursSwitch />
      </div>
    </div>
  )
}
