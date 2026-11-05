import type { Versie } from "./klant"

// Geen versienummers meer in beeld (Nick, 5 nov 2026: "sla 2 concepten en 1 definitief op en stop
// met versie nummering"). Intern blijft elke bewaarde stand bestaan; je ziet alleen Definitief (de
// laatste die als definitief is bewaard, of anders de laatste) en de twee nieuwste andere als concept.

export type Vak = { label: "Definitief" | "Concept 1" | "Concept 2"; versie: Versie }

export function zichtbareVersies(versies: Versie[]): Vak[] {
  if (!versies.length) return []
  const def = versies.findLast((v) => v.soort === "definitief") ?? versies.at(-1)!
  const concepten = versies.filter((v) => v !== def).slice(-2).reverse()
  return [{ label: "Definitief", versie: def }, ...concepten.map((versie, i) => ({ label: (i ? "Concept 2" : "Concept 1") as Vak["label"], versie }))]
}

/** Het label van een versie, of "Archief" als hij niet meer in de drie vakken staat. */
export const labelVan = (versies: Versie[], nr: number) => zichtbareVersies(versies).find((x) => x.versie.nr === nr)?.label ?? "Archief"
