import { BTW_TARIEVEN, type BtwRegel } from "./calculatie"
import { deel, procent, type Bp, type Centen } from "./geld"
import type { Klant } from "./klant"

// Het rekenwerk van een factuur, zonder opslag (zodat het te testen is). Een
// factuur is een reeks regels excl. btw met elk een tarief; de btw rekent per
// tarief over de som, zoals de Belastingdienst het wil zien.

export type FactuurRegel = { omschrijving: string; bedrag: Centen; btw: Bp }

export const BETAALTERMIJN_DAGEN = 14

/** Per tarief de grondslag en de btw; tarieven zonder bedrag vallen weg. */
export function btwPerTarief(regels: FactuurRegel[]): BtwRegel[] {
  return BTW_TARIEVEN.map((tarief) => {
    const grondslag = regels.filter((r) => r.btw === tarief).reduce((t, r) => t + r.bedrag, 0)
    return { tarief, grondslag, btw: deel(grondslag * tarief, 10000) }
  }).filter((b) => b.grondslag !== 0)
}

export function factuurTotaal(regels: FactuurRegel[]) {
  const btw = btwPerTarief(regels)
  const excl = btw.reduce((t, b) => t + b.grondslag, 0)
  const belasting = btw.reduce((t, b) => t + b.btw, 0)
  return { btw, excl, belasting, totaal: excl + belasting }
}

/**
 * Een termijn van een offerte (Plancraft: "Abschlagsrechnung"): per btw-tarief
 * het percentage van de grondslag, één regel per tarief. Zo klopt de btw van
 * alle termijnen samen met die van de offerte.
 */
export function termijnRegels(offerte: { nummer: string; btw: BtwRegel[] }, deelBp: Bp, label: string): FactuurRegel[] {
  const tekst = `${label || "Termijn"} · ${(deelBp / 100).toLocaleString("nl-NL")} % van offerte ${offerte.nummer}`
  const meer = offerte.btw.filter((b) => b.grondslag).length > 1
  return offerte.btw
    .filter((b) => b.grondslag)
    .map((b) => ({ omschrijving: meer ? `${tekst} (${b.tarief / 100} % btw)` : tekst, bedrag: procent(b.grondslag, deelBp), btw: b.tarief }))
}

/**
 * GR-F // 2026-1105-0001: de vorm die Nick al gebruikt (datum plus volgnummer
 * van die dag), zodat de reeks aansluit. Eén hoger dan het hoogste van die dag.
 */
export function volgendFactuurNummer(klanten: Pick<Klant, "stukken">[], datum: string) {
  const voor = `GR-F // ${datum.slice(0, 4)}-${datum.slice(5, 7)}${datum.slice(8, 10)}-`
  const hoogste = klanten
    .flatMap((k) => k.stukken)
    .filter((s) => s.soort === "Factuur" && s.nummer.startsWith(voor))
    .reduce((m, s) => Math.max(m, Number(s.nummer.slice(voor.length)) || 0), 0)
  return `${voor}${String(hoogste + 1).padStart(4, "0")}`
}

/**
 * De inhoud van een SEPA-betaalcode (EPC069-12, "GiroCode"): elke bankapp in
 * Nederland en België leest hieruit naam, IBAN, bedrag en omschrijving.
 */
export function epcCode(b: { naam: string; iban: string; bedrag: Centen; omschrijving: string }) {
  return ["BCD", "002", "1", "SCT", "", b.naam.slice(0, 70), b.iban.replace(/\s/g, "").toUpperCase(), `EUR${(b.bedrag / 100).toFixed(2)}`, "", "", b.omschrijving.slice(0, 140)].join("\n")
}
