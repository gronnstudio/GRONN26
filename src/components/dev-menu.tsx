"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

// Ontwikkelaarsmenu (eigenaar, 12 nov 2026: "maak een developer menu zodat we
// wat dingen kunnen toggelen, doe dat rechts midden zijkant van de pagina met
// een hover dat uitklapt"). Alleen voor de ingelogde eigenaar (/api/eigenaar).
// Elke schakelaar zet een klasse op <html> en bewaart de keuze in deze
// browser (gronn-dev); het voorverf-script in layout.tsx zet ze vóór de
// eerste verf, zodat er niets flitst. Bezoekers zien altijd de gewone site.

type Instelling = { kop: boolean; kleur: boolean; voorpagina: boolean }
const SLEUTEL = "gronn-dev"
const KLASSEN: Record<keyof Instelling, string> = { kop: "dev-kop", kleur: "dev-nature", voorpagina: "dev-voorpagina" }
const RIJEN: { id: keyof Instelling; label: string; uit: string; aan: string }[] = [
  { id: "kop", label: "Kop en voet", uit: "Dock", aan: "Handoff" },
  { id: "kleur", label: "Kleuren", uit: "Zand", aan: "Nature" },
  { id: "voorpagina", label: "Voorpagina", uit: "Huidig", aan: "Handoff" },
]

function lees(): Instelling {
  try {
    return { kop: false, kleur: false, voorpagina: false, ...JSON.parse(localStorage.getItem(SLEUTEL) || "{}") }
  } catch {
    return { kop: false, kleur: false, voorpagina: false }
  }
}

export function DevMenu() {
  const [eigenaar, setEigenaar] = useState(false)
  const [open, setOpen] = useState(false)
  const [stand, setStand] = useState<Instelling>({ kop: false, kleur: false, voorpagina: false })

  useEffect(() => {
    fetch("/api/eigenaar", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { eigenaar: false }))
      .then((d: { eigenaar?: boolean }) => {
        // Niet (meer) ingelogd: dan altijd de gewone site, ook als deze browser nog keuzes bewaart.
        if (!d.eigenaar) return Object.values(KLASSEN).forEach((k) => document.documentElement.classList.remove(k))
        setStand(lees())
        setEigenaar(true)
      })
      .catch(() => {})
  }, [])

  if (!eigenaar) return null

  function zet(id: keyof Instelling, aan: boolean) {
    const nieuw = { ...stand, [id]: aan }
    setStand(nieuw)
    document.documentElement.classList.toggle(KLASSEN[id], aan)
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify(nieuw))
    } catch {}
  }

  return (
    <aside className="dev-menu" data-open={open || undefined} aria-label="Ontwikkelaarsmenu" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="dev-menu-tab" aria-expanded={open} aria-controls="dev-menu-paneel" onClick={() => setOpen((o) => !o)}>
        Dev
      </button>
      <div id="dev-menu-paneel" className="dev-menu-paneel">
        <p className="dev-menu-kop">Ontwikkelaar · alleen jij ziet dit</p>
        {RIJEN.map((r) => (
          <fieldset key={r.id} className="dev-menu-rij">
            <legend>{r.label}</legend>
            {[false, true].map((aan) => (
              <label key={String(aan)}>
                <input type="radio" name={`dev-${r.id}`} checked={stand[r.id] === aan} onChange={() => zet(r.id, aan)} />
                <span>{aan ? r.aan : r.uit}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <Link href="/start-een-project" className="dev-menu-link">Aanvraag in 6 stappen →</Link>
      </div>
    </aside>
  )
}

/** Toont de kinderen alleen als deze klasse op <html> staat (na het laden),
 *  zodat bezoekers en zoekmachines de alternatieve inhoud niet in de HTML krijgen. */
export function DevAlleen({ klasse, children }: { klasse: string; children: React.ReactNode }) {
  const [aan, setAan] = useState(false)
  useEffect(() => {
    const kijk = () => setAan(document.documentElement.classList.contains(klasse))
    kijk()
    const k = new MutationObserver(kijk)
    k.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => k.disconnect()
  }, [klasse])
  return aan ? children : null
}
