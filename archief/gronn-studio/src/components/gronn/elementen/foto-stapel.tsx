"use client"

import { useId, useState, type ReactNode } from "react"

import { useT } from "@/components/language-provider"

/**
 * Qi's "cards gallery", rustig: geen scheve kaarten, geen zwiepen. Een
 * reeks staande foto's ligt op de telefoon (< md) als stapel, de
 * achterste 12px rechtsboven verschoven; "Volgende foto" legt de volgende
 * voorop, de teller ("1/2") staat erbij en wordt voorgelezen
 * (`aria-live="polite"`).
 *
 * Alleen `translate` en `opacity` veranderen (globals.css, "BeeldWissel
 * en FotoStapel"); bij minder beweging zonder overgang. Zonder JS (en
 * vanaf md) is het gewoon het raster van FotoRij: beide foto's in beeld.
 * Elke foto blijft in de DOM met zijn alt en bijschrift — de achterste
 * is alleen visueel onder de voorste geschoven.
 *
 * FotoRij kiest dit zelf, voor een reeks van precies twee staande foto's
 * zonder label: een AI-visualisatie wordt nooit half onder een foto
 * geschoven, haar label moet altijd zichtbaar zijn.
 */
export function FotoStapel({ id, kaarten }: { id: string; kaarten: ReactNode[] }) {
  const t = useT()
  const [voor, setVoor] = useState(0)
  const vak = useId()
  const n = kaarten.length
  return (
    <div data-element="FotoStapel" data-foto={id} data-foto-stapel="">
      <div id={vak} className="g-stapel-vak grid gap-4 sm:grid-cols-2">
        {kaarten.map((k, i) => (
          <div key={i} className="g-stapel-kaart" data-plek={i === voor ? "voor" : "achter"}>
            {k}
          </div>
        ))}
      </div>
      <div className="g-stapel-bediening mt-[16px] items-center justify-between gap-[16px]">
        <p aria-live="polite" data-stapel-teller="" className="tekst-annotatie text-muted">
          <span className="sr-only">{t({ nl: "Foto ", en: "Photo " })}</span>
          {voor + 1}/{n}
        </p>
        <button
          type="button"
          aria-controls={vak}
          onClick={() => setVoor((v) => (v + 1) % n)}
          className="tekst-knop inline-flex min-h-[44px] items-center gap-[12px] rounded-full border border-current/30 px-[16px] transition-colors hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
        >
          {t({ nl: "Volgende foto", en: "Next photo" })}
          <span aria-hidden className="text-[var(--ember-text)]">→</span>
        </button>
      </div>
    </div>
  )
}
