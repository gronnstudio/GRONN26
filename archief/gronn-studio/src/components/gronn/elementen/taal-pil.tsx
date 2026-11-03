"use client"

import { LanguageSwitch } from "@/components/layout/header-controls"
import { Komeet } from "@/components/layout/komeet"

/**
 * De taalvlag los, voor een pagina zonder kop (de linkpagina). Dezelfde
 * knop als in de kop van de site: hij schrijft de cookie én localStorage,
 * zodat de keuze blijft (eigenaar, 28 sep 2026: "ik wil daar ook de
 * language switch, met local storage zoals homepage"). Zelfde glazen pil
 * met komeet als `UrenPil`, ook op de telefoon zichtbaar.
 */
export function TaalPil() {
  return (
    <div data-element="TaalPil" className="relative inline-flex items-center rounded-full">
      <Komeet />
      <div className="glass flex items-center rounded-full p-[4px]">
        <LanguageSwitch />
      </div>
    </div>
  )
}
