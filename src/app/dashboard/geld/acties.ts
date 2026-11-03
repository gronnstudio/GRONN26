"use server"

import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"
import { gebeurtenis, wijzigKlanten, type Stuk } from "@/lib/beheer/klanten"
import { haalRegel } from "@/lib/mollie"

// Koppel een betaalde Mollie-betaling aan een klant: aan een open factuur (die
// wordt betaald), of als nieuw ontvangen bedrag (bijv. een aanbetaling).
// Het bedrag komt uit Mollie zelf, niet uit het formulier.
export async function koppelMollie(betaling: string, d: FormData) {
  await eisEigenaar()
  const [klantId, stukId] = String(d.get("doel") ?? "").split("|")
  if (!klantId) return
  const b = await haalRegel(betaling)
  if (!b || b.status !== "paid") return
  await wijzigKlanten((lijst) => {
    if (lijst.some((k) => k.stukken.some((s) => s.mollie === b.id))) return lijst
    return lijst.map((k) => {
      if (k.id !== klantId) return k
      const dag = (b.betaald ?? b.datum).slice(0, 10)
      const bestaand = stukId ? k.stukken.find((s) => s.id === stukId && s.soort === "Factuur") : undefined
      const stukken: Stuk[] = bestaand
        ? k.stukken.map((s) => (s.id === bestaand.id ? { ...s, rond: true, mollie: b.id } : s))
        : [...k.stukken, { id: crypto.randomUUID(), soort: "Factuur" as const, nummer: b.omschrijving.slice(0, 60) || "Mollie", bedrag: b.bedrag, datum: dag, rond: true, mollie: b.id }].sort((x, y) => x.datum.localeCompare(y.datum))
      const tekst = bestaand ? `Factuur ${bestaand.nummer} betaald via Mollie (€ ${b.bedrag.toFixed(2)})` : `€ ${b.bedrag.toFixed(2)} ontvangen via Mollie: ${b.omschrijving}`
      return { ...k, stukken, activiteit: [gebeurtenis("Stuk", tekst), ...k.activiteit].slice(0, 500) }
    })
  })
  revalidatePath("/dashboard", "layout")
}
