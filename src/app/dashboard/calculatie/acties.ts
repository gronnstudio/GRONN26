"use server"

import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"
import { STANDAARD, reken, schoonRegel, type Regel } from "@/lib/crm/calculatie"
import { nieuwItem, zetPrijs } from "@/lib/crm/catalogus"
import { wijzigCatalogus } from "@/lib/beheer/catalogus"
import { gebeurtenis, wijzigKlanten, type Calculatie, type Versie } from "@/lib/beheer/klanten"

// Een calculatie bewaren bij een klant. Elke keer bewaren is een nieuwe versie
// (masterprompt: "versioned estimates"), zodat een verstuurde prijs altijd
// terug te vinden is. De uitkomst wordt hier op de server opnieuw berekend:
// wat de browser stuurt aan totalen telt niet.

export type Concept = {
  klantId: string
  calculatieId?: string
  titel: string
  tuinId?: string
  beschrijving: string
  uren: number
  uurtarief: number
  onvoorzien: number
  korting: number
  regels: Regel[]
}

const geheel = (v: unknown, max: number) => (Number.isSafeInteger(v) ? Math.min(max, Math.max(0, v as number)) : 0)

export async function bewaarCalculatie(c: Concept): Promise<{ id: string; nr: number } | { fout: string }> {
  await eisEigenaar()
  if (!c?.klantId) return { fout: "Kies eerst een klant." }
  const regels = (Array.isArray(c.regels) ? c.regels : []).slice(0, 200).map((r) => schoonRegel(r as Regel & Record<string, unknown>))
  const invoer = {
    uren: geheel(c.uren, 10_000_000),
    uurtarief: geheel(c.uurtarief, 100_000) || STANDAARD.uurtarief,
    onvoorzien: geheel(c.onvoorzien, 5000),
    korting: geheel(c.korting, 10000),
    regels,
  }
  const u = reken(invoer)
  const id = c.calculatieId || crypto.randomUUID()
  let nr = 0
  let gevonden = false
  await wijzigKlanten((lijst) =>
    lijst.map((k) => {
      if (k.id !== c.klantId) return k
      gevonden = true
      const oud = k.calculaties.find((x) => x.id === id)
      nr = (oud?.versies.at(-1)?.nr ?? 0) + 1
      const versie: Versie = {
        nr,
        datum: new Date().toISOString(),
        beschrijving: String(c.beschrijving ?? "").slice(0, 4000),
        ...invoer,
        totaal: u.totaal,
        winst: u.winst,
      }
      const calc: Calculatie = {
        id,
        titel: String(c.titel ?? "").trim().slice(0, 120) || oud?.titel || "Calculatie",
        tuinId: c.tuinId && k.tuinen.some((t) => t.id === c.tuinId) ? c.tuinId : oud?.tuinId,
        aangemaakt: oud?.aangemaakt ?? new Date().toISOString().slice(0, 10),
        versies: [...(oud?.versies ?? []), versie].slice(-30),
      }
      return {
        ...k,
        calculaties: oud ? k.calculaties.map((x) => (x.id === id ? calc : x)) : [...k.calculaties, calc],
        activiteit: [gebeurtenis("Calculatie", `${calc.titel}, versie ${nr} bewaard`), ...k.activiteit].slice(0, 500),
      }
    }),
  )
  if (!gevonden) return { fout: "Klant niet gevonden." }
  revalidatePath("/dashboard", "layout")
  return { id, nr }
}

export async function calculatieWeg(klantId: string, id: string) {
  await eisEigenaar()
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
