import { BTW_TARIEVEN } from "./calculatie"
import { plusProcent, type Bp, type Centen } from "./geld"

// Inkoopfacturen (idee uit Plancraft, "Inkomende facturen", 5 nov 2026): wat
// je bij leveranciers koopt, met de factuur als PDF of foto, gekoppeld aan een
// klant. Zo zie je per klus wat het materiaal echt kostte en wat er overbleef,
// en op Geld wat je zelf nog moet betalen. Boekhouden blijft in DigiBoox.

export type Inkoop = {
  id: string
  datum: string
  leverancier: string
  /** Factuurnummer van de leverancier */
  nummer: string
  omschrijving: string
  /** Bedrag excl. btw, in centen */
  bedrag: Centen
  btw: Bp
  /** Klant (Klant.id) waar dit voor was; leeg = algemene kosten */
  klantId?: string
  betaald: boolean
  /** Uiterste betaaldatum (jjjj-mm-dd), als die op de factuur staat */
  vervalt?: string
  /** Bijlage in de privé opslag: crm/inkoop/<id>.<ext> */
  bestand?: { ext: "pdf" | "jpg" | "png"; naam: string }
}

export const BESTAND_TYPES = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" } as const
export const MAX_BESTAND = 4_000_000

export const metBtw = (i: Pick<Inkoop, "bedrag" | "btw">): Centen => plusProcent(i.bedrag, i.btw)

const datumOk = (d: unknown): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)
const t = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "")

/** Een inkoopregel uit de browser of de opslag: wat niet klopt valt weg (null) of wordt begrensd. */
export function schoonInkoop(r: Record<string, unknown>): Inkoop | null {
  const bedrag = typeof r.bedrag === "number" && Number.isSafeInteger(r.bedrag) && Math.abs(r.bedrag) <= 100_000_000 ? r.bedrag : null
  const leverancier = t(r.leverancier, 80)
  if (!datumOk(r.datum) || bedrag === null || !leverancier) return null
  const btw = BTW_TARIEVEN.includes(r.btw as Bp) ? (r.btw as Bp) : 2100
  const b = r.bestand as { ext?: unknown; naam?: unknown } | undefined
  const ext = b && ["pdf", "jpg", "png"].includes(b.ext as string) ? (b.ext as "pdf" | "jpg" | "png") : null
  const klantId = t(r.klantId, 64)
  return {
    id: /^[0-9a-f-]{36}$/.test(String(r.id)) ? String(r.id) : crypto.randomUUID(),
    datum: r.datum,
    leverancier,
    nummer: t(r.nummer, 60),
    omschrijving: t(r.omschrijving, 200),
    bedrag,
    btw,
    ...(klantId ? { klantId } : {}),
    betaald: r.betaald === true,
    ...(datumOk(r.vervalt) ? { vervalt: r.vervalt } : {}),
    ...(ext ? { bestand: { ext, naam: t(b?.naam, 120) || `factuur.${ext}` } } : {}),
  }
}

/** Nog te betalen: niet afgevinkt, oudste vervaldag (of datum) eerst. */
export const teBetalen = (lijst: Inkoop[]) =>
  lijst.filter((i) => !i.betaald).sort((a, b) => (a.vervalt ?? a.datum).localeCompare(b.vervalt ?? b.datum))

/** Inkoop van één klant, excl. btw, in centen. */
export const inkoopVan = (lijst: Inkoop[], klantId: string): Centen => lijst.filter((i) => i.klantId === klantId).reduce((s, i) => s + i.bedrag, 0)

/**
 * Nacalculatie van een klant (Plancraft: "Nacalculatie"): gefactureerd excl. 21 % btw min de
 * inkoop excl. btw is wat er voor je werk overbleef, en dat gedeeld door de uren. Gefactureerd
 * komt binnen in euro's incl. btw (oude vorm), inkoop in centen excl. btw.
 */
export function naInkoop(gefactureerdInclEuro: number, inkoop: Centen, uren: number) {
  const omzet = Math.round((gefactureerdInclEuro * 100) / 1.21)
  const over = omzet - inkoop
  return { omzet, inkoop, over, perUur: uren > 0 ? Math.round(over / uren) : 0 }
}
