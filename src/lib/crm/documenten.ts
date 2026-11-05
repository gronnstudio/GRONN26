import { betaalstand, type Klant, type Stuk } from "./klant"

// Offertes en facturen over alle klanten heen, als één lijst (Plancraft, 5 nov 2026): wat de
// pagina's /dashboard/offertes en /dashboard/facturen tonen en wat de CSV-export uitschrijft.
// Alleen lezen en ordenen; wijzigen gaat via dezelfde acties als op de klantkaart.

export type OfferteStatus = "Open" | "Akkoord"
export type FactuurStatus = "Open" | "Te laat" | "Herinnerd" | "Betaald"
export type DocStatus = OfferteStatus | FactuurStatus

export const STATUSSEN = {
  Offerte: ["Open", "Akkoord"] as const,
  Factuur: ["Open", "Te laat", "Herinnerd", "Betaald"] as const,
}

export type DocRij = {
  klant: Pick<Klant, "id" | "naam" | "email">
  stuk: Stuk
  status: DocStatus
  /** Factuur: vervaldag (of na een herinnering: de nieuwe uiterste dag), jjjj-mm-dd. */
  vervalt?: string
  /** De privélink voor de klant, als die er is. */
  pad?: string
}

export function statusVan(s: Stuk, nu: string): DocStatus {
  if (s.soort === "Offerte") return s.rond ? "Akkoord" : "Open"
  const b = betaalstand(s, nu)
  return b.stand === "betaald" ? "Betaald" : b.stand === "te laat" ? "Te laat" : b.stand === "herinnerd" ? "Herinnerd" : "Open"
}

export function documentRijen(klanten: Klant[], soort: Stuk["soort"], nu: string): DocRij[] {
  return klanten
    .flatMap((k) =>
      k.stukken
        .filter((s) => s.soort === soort)
        .map((s): DocRij => {
          const b = s.soort === "Factuur" ? betaalstand(s, nu) : undefined
          return {
            klant: { id: k.id, naam: k.naam, email: k.email },
            stuk: s,
            status: statusVan(s, nu),
            vervalt: b?.stand === "open" || b?.stand === "te laat" ? b.vervalt : b?.stand === "herinnerd" ? b.uiterlijk : undefined,
            pad: s.factuur ? `/factuur/${s.factuur}` : s.link ? `/offerte/${s.link}` : undefined,
          }
        }),
    )
    .sort((a, b) => b.stuk.datum.localeCompare(a.stuk.datum) || b.stuk.nummer.localeCompare(a.stuk.nummer))
}

export type Filter = { q?: string; status?: string; jaar?: string }

/** Zoeken op nummer of klant, en filteren op status en jaar. Lege velden filteren niet. */
export function filterRijen(rijen: DocRij[], { q, status, jaar }: Filter): DocRij[] {
  const zoek = q?.trim().toLowerCase()
  return rijen.filter(
    (r) =>
      (!status || r.status === status) &&
      (!jaar || r.stuk.datum.startsWith(jaar)) &&
      (!zoek || r.stuk.nummer.toLowerCase().includes(zoek) || r.klant.naam.toLowerCase().includes(zoek)),
  )
}

/** Bedragen staan in euro's met centen; optellen in centen, zodat er geen 0,1 + 0,2 ontstaat. */
export const somEuro = (rijen: DocRij[]) => rijen.reduce((t, r) => t + Math.round(r.stuk.bedrag * 100), 0) / 100

// Een cel die met = + @ of een min zonder cijfer begint, zou Excel als formule lezen: een apostrof ervoor.
const cel = (v: string | number) => {
  const t = String(v)
  return `"${(/^[=+@\t\r]|^-(?!\d)/.test(t) ? `'${t}` : t).replace(/"/g, '""')}"`
}
const bedragNL = (n: number) => n.toFixed(2).replace(".", ",")

/** CSV met puntkomma's en een BOM, zodat Excel NL hem goed opent. */
export function naarCsv(rijen: DocRij[]): string {
  const kop = ["Nummer", "Soort", "Klant", "Datum", "Vervalt", "Status", "Bedrag incl. btw"]
  const regels = rijen.map((r) => [r.stuk.nummer, r.stuk.soort, r.klant.naam, r.stuk.datum.slice(0, 10), r.vervalt ?? "", r.status, bedragNL(r.stuk.bedrag)])
  return "﻿" + [kop, ...regels].map((r) => r.map(cel).join(";")).join("\r\n")
}

/** De klasse van de statuspil: groen = rond, rood = te laat, oranje = er moet iets gebeuren. */
export const statusKlasse = (s: DocStatus) =>
  s === "Akkoord" || s === "Betaald" ? "crm-status crm-status-goed" : s === "Te laat" || s === "Herinnerd" ? "crm-status crm-status-let" : "crm-status crm-status-open"
