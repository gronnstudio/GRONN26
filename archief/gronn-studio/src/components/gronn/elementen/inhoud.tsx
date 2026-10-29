"use client"

import { useEffect, useState } from "react"

/**
 * Een genummerde inhoudsopgave die op breed scherm naast de tekst blijft
 * staan (sticky) en op de telefoon twee kolommen vormt. Links naar ankers.
 *
 * Het hoofdstuk dat je leest licht op (scrollspy, eigenaar 23 sep 2026):
 * een IntersectionObserver kijkt welk hoofdstuk de leeslijn kruist — een
 * smalle band op 30 % van het scherm, onder de sticky kop van 112px. De
 * hoofdstukken sluiten op elkaar aan, dus er kruist er steeds één; op de
 * naad kiest de eerste. Kruist er even geen (vóór het eerste hoofdstuk,
 * na het laatste), dan blijft het vorige staan. Een band bovenin en de
 * EERSTE zichtbare kiezen gaat mis: het vorige hoofdstuk steekt dan nog
 * in de band en wint. Geen overgang: de wissel is direct, dus er is ook
 * niets om voor reduced motion uit te zetten.
 */
export function Inhoud({ titel, items, label }: { titel: string; label: string; items: { id: string; kort: string }[] }) {
  const [actief, setActief] = useState<string | null>(null)
  const sleutel = items.map((h) => h.id).join(" ")

  useEffect(() => {
    const ids = sleutel.split(" ")
    const secties = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!secties.length || typeof IntersectionObserver === "undefined") return
    const zichtbaar = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) zichtbaar.add(e.target.id)
          else zichtbaar.delete(e.target.id)
        }
        const eerste = ids.find((id) => zichtbaar.has(id))
        if (eerste) setActief(eerste)
      },
      { rootMargin: "-30% 0px -69% 0px" },
    )
    for (const s of secties) io.observe(s)
    return () => io.disconnect()
  }, [sleutel])

  return (
    <nav data-element="Inhoud" aria-label={label} className="lg:sticky lg:top-[112px] lg:self-start">
      <p className="tekst-annotatie text-muted uppercase">{titel}</p>
      <ol className="mt-4 grid gap-1 text-sm max-lg:grid-cols-2 max-lg:gap-x-6">
        {items.map((h, i) => {
          const hier = h.id === actief
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={hier ? "location" : undefined}
                className={`group relative flex min-h-[32px] items-baseline gap-3 py-1 hover:text-foreground ${
                  hier ? "font-semibold text-foreground" : "text-foreground/75"
                }`}
              >
                {/* Het streepje staat in de ruimte vóór de kolom, zodat de
                    nummers niet verspringen als het hoofdstuk wisselt. */}
                {hier && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-[-14px] h-[2px] w-[8px] -translate-y-1/2 bg-[var(--ember-text)]"
                  />
                )}
                <span
                  className={`font-mono text-[11px] group-hover:text-[var(--ember-text)] ${
                    hier ? "text-[var(--ember-text)]" : "text-muted"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {h.kort}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
