import { KLANT_FASEN, geld, gewogen, isOpen, laatsteCalculatie, type Klant, type KlantFase } from "./klant"

// Wat Vandaag, Geld en de pijplijn laten zien, uitgerekend uit de klantkaarten
// en niet in de pagina zelf (masterprompt CRM: rekenen los van tonen). Elk
// getal heeft hier zijn omschrijving; de pagina toont die erbij.
//
// Bedragen van offertes en facturen zijn de oude vorm uit DigiBoox: euro's
// incl. btw (Stuk.bedrag). Calculaties zijn centen (geld.ts). Waar beide
// samenkomen (de waarde van een klus) is de uitkomst in euro's.

/** Vandaag in Nederland, als JJJJ-MM-DD. */
export const vandaagNL = (d = new Date()) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

/** Een dag verder of terug, als JJJJ-MM-DD (rekent op 12:00 UTC, dus zonder last van zomertijd). */
export const plusDagen = (dag: string, n: number) => {
  const d = new Date(`${dag}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** De waarde van een klus in euro's incl. btw: laatste offerte, anders de laatste calculatie, anders de geschatte waarde. */
export function waardeVan(k: Klant): number | undefined {
  const g = geld(k)
  if (g.offerte) return g.offerte
  const c = laatsteCalculatie(k)
  if (c) return c.v.totaal / 100
  return k.waarde ? k.waarde / 100 : undefined
}

export const LOPEND: KlantFase[] = ["Akkoord", "Gepland", "Uitvoering"]
export const LEADS: KlantFase[] = ["Aanvraag", "Opname", "Offerte"]

/** Klanten die je vandaag of eerder had moeten opvolgen, oudste eerst. */
export const opTeVolgen = (klanten: Klant[], nu: string) =>
  klanten.filter((k) => k.opvolgen && k.opvolgen <= nu && isOpen(k.fase)).sort((a, b) => a.opvolgen.localeCompare(b.opvolgen))

/** Per fase: hoeveel klanten en wat ze samen waard zijn. */
export function pijplijn(klanten: Klant[]) {
  return KLANT_FASEN.map((fase) => {
    const hier = klanten.filter((k) => k.fase === fase)
    return { fase, aantal: hier.length, waarde: hier.reduce((t, k) => t + (waardeVan(k) ?? 0), 0) }
  })
}

/** Leads (Aanvraag t/m Offerte) gewogen naar de kans die je zelf invult, in centen. */
export const gewogenPijplijn = (klanten: Klant[]) => klanten.filter((k) => LEADS.includes(k.fase)).reduce((t, k) => t + gewogen(k), 0)

export type Openstaand = { klant: Klant; nummer: string; bedrag: number; datum: string; soort: "Offerte" | "Factuur" }

/**
 * Het geld uit de klantkaarten:
 * - gefactureerd deze maand: facturen met een datum in deze kalendermaand;
 * - te ontvangen: facturen die nog niet als betaald zijn afgevinkt;
 * - offertes open: offertes zonder akkoord bij klanten die nog niet verloren of opgeleverd zijn.
 * Wat er echt op de bank staat, zie je in DigiBoox; hier staat wat je hebt afgevinkt.
 */
export function geldOverzicht(klanten: Klant[], nu: string) {
  const maand = nu.slice(0, 7)
  const alle = klanten.flatMap((k) => k.stukken.map((s) => ({ klant: k, nummer: s.nummer, bedrag: s.bedrag, datum: s.datum, soort: s.soort, rond: !!s.rond })))
  const facturen = alle.filter((s) => s.soort === "Factuur")
  const som = (l: { bedrag: number }[]) => Math.round(l.reduce((t, s) => t + s.bedrag, 0) * 100) / 100
  const teOntvangen: Openstaand[] = facturen.filter((s) => !s.rond).sort((a, b) => a.datum.localeCompare(b.datum))
  const offertesOpen: Openstaand[] = alle.filter((s) => s.soort === "Offerte" && !s.rond && isOpen(s.klant.fase)).sort((a, b) => a.datum.localeCompare(b.datum))
  return {
    dezeMaand: som(facturen.filter((s) => s.datum.startsWith(maand))),
    betaaldDezeMaand: som(facturen.filter((s) => s.rond && s.datum.startsWith(maand))),
    teOntvangen,
    teOntvangenSom: som(teOntvangen),
    offertesOpen,
    offertesOpenSom: som(offertesOpen),
  }
}
