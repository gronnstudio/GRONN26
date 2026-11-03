import type { LegalDocument } from "./types"
import { VOORWAARDEN_CONSUMENT } from "./voorwaarden-consument"
import { HERROEPING } from "./herroeping"
import { VOORWAARDEN_ZAKELIJK } from "./voorwaarden-zakelijk"
import { PRIVACY } from "./privacy"
import { PORTAAL } from "./portaal"

export * from "./types"
export { VOORWAARDEN_CONSUMENT, HERROEPING, VOORWAARDEN_ZAKELIJK, PRIVACY, PORTAAL }
export { HERROEPING_REGELS } from "./herroeping"

// De catalogus. Eén lijst, in de volgorde waarin ze op het colofon staan.
//
// De volgorde is niet alfabetisch en ook niet naar belangrijkheid, maar
// naar de vraag die een bezoeker heeft: eerst "wat spreken wij af"
// (voorwaarden), dan "wat doen jullie met mijn gegevens" (privacy), dan
// "wat is dat portaal" — de volgorde waarin iemand ze tegenkomt.
export const LEGAL_DOCUMENTS: LegalDocument[] = [
  VOORWAARDEN_CONSUMENT,
  // Direct achter de consumentenvoorwaarden: die twee gaan samen de
  // deur uit, en gescheiden raken ze gescheiden.
  HERROEPING,
  VOORWAARDEN_ZAKELIJK,
  PRIVACY,
  PORTAAL,
]

export function legalBySlug(slug: string): LegalDocument | null {
  return LEGAL_DOCUMENTS.find((d) => d.slug === slug) ?? null
}

/**
 * Wat er nog open staat, over alle documenten heen.
 *
 * Dit is het getal dat in het paneel op de nav-regel komt te staan. Het
 * telt taken (`open`), niet gaten in de tekst — een document kan een gat
 * hebben dat uit één taak volgt, en twee taken die geen gat achterlaten.
 * Taken zijn wat Nick moet doen, en dat is wat een telling moet meten.
 */
export function openCount(docs: LegalDocument[] = LEGAL_DOCUMENTS): number {
  return docs.reduce((sum, d) => sum + d.open.length, 0)
}
