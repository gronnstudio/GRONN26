"use server"

import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"
import { STANDAARD, calculatieTitel, reken, schoonRegel, type Regel } from "@/lib/crm/calculatie"
import { schoonPlan, type PlanFase } from "@/lib/crm/planning"
import type { FaseUren } from "@/lib/crm/werkomschrijving"
import { nieuwItem, zetPrijs } from "@/lib/crm/catalogus"
import { wijzigCatalogus } from "@/lib/beheer/catalogus"
import { bewaarVersie, type Concept } from "@/lib/crm/bewaar-calculatie"
import { wijzigKlanten } from "@/lib/beheer/klanten"

// Een calculatie bewaren bij een klant. Elke keer bewaren is een nieuwe versie
// (masterprompt: "versioned estimates"), zodat een verstuurde prijs altijd
// terug te vinden is. De uitkomst wordt hier op de server opnieuw berekend:
// wat de browser stuurt aan totalen telt niet.

export type { Concept } from "@/lib/crm/bewaar-calculatie"

export async function bewaarCalculatie(c: Concept): Promise<{ id: string; nr: number } | { fout: string }> {
  await eisEigenaar()
  const uit = await bewaarVersie(c)
  if (!("fout" in uit)) revalidatePath("/dashboard", "layout")
  return uit
}

export async function calculatieWeg(klantId: string, id: string, d?: FormData) {
  await eisEigenaar()
  if (d && String(d.get("bevestig") ?? "").trim().toLowerCase() !== "verwijderen") return
  await wijzigKlanten((lijst) => lijst.map((k) => (k.id === klantId ? { ...k, calculaties: k.calculaties.filter((c) => c.id !== id) } : k)))
  revalidatePath("/dashboard", "layout")
}

/**
 * Een regel in de catalogus zetten of zijn prijs bijwerken ("leveranciersprijzen
 * onthouden"). Bestaat het item al, dan gaat de oude prijs de historie in.
 */
export async function onthoudPrijs(r: Regel, leverancier = ""): Promise<{ id: string } | { fout: string }> {
  await eisEigenaar()
  const regel = schoonRegel(r as Regel & Record<string, unknown>)
  if (!regel.omschrijving.trim()) return { fout: "Geef de regel eerst een omschrijving." }
  let id = regel.catalogusId ?? ""
  await wijzigCatalogus((items) => {
    const bestaand = items.find((i) => i.id === id) ?? items.find((i) => i.naam.toLowerCase() === regel.omschrijving.trim().toLowerCase())
    if (bestaand) {
      id = bestaand.id
      return items.map((i) => (i.id === bestaand.id ? { ...zetPrijs(i, regel.inkoop, leverancier || i.leverancier), eenheid: regel.eenheid, soort: regel.soort } : i))
    }
    const nieuw = nieuwItem({ naam: regel.omschrijving.trim(), soort: regel.soort, eenheid: regel.eenheid, inkoop: regel.inkoop, opslag: regel.opslag, btw: regel.btw, afval: regel.afval, leverancier })
    id = nieuw.id
    return [...items, nieuw]
  })
  revalidatePath("/dashboard", "layout")
  return { id }
}
