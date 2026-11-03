// De juridische documenten van de studio, als getypte data.
//
// Waarom data en geen JSX: deze teksten worden op drie plekken getoond —
// de publieke pagina, het paneel waar Nick ze nakijkt, en straks een pdf —
// en een tekst die op drie plekken is overgeschreven is een tekst die op
// drie plekken uit elkaar gaat lopen. Dat is precies wat er met de
// fotobewerking gebeurde voordat die één `@utility` werd.
//
// TWEE DINGEN DIE HIER BEWUST ZIJN GEKOZEN.
//
// **Nederlands is bindend, en er is geen vertaling.** De rest van de site
// is tweetalig; deze documenten niet. Een juridische tekst in twee talen
// is twee juridische teksten, en zodra ze uiteenlopen — en dat doen ze,
// bij de eerste wijziging die maar in één taal landt — is de vraag welke
// van de twee geldt. Voor een Nederlands hoveniersbedrijf met Nederlandse
// klanten en Nederlands recht is dat een risico zonder opbrengst. De
// pagina zegt dat in het Engels, zodat een Engelstalige bezoeker niet
// denkt dat er iets stukging.
//
// **Open plekken zijn zichtbaar in de data, niet weggemoffeld.** Wat Nick
// nog moet invullen of laten toetsen staat als `[[placeholder]]` in de
// tekst en als regel in `open`. `openPlaces()` telt ze, het paneel toont
// ze, en de publieke pagina weigert een document met open plekken te
// tonen zolang het de status `concept` heeft. Een voorwaardentekst met een
// gat erin die er af is uitziet is gevaarlijker dan een die eerlijk zegt
// dat hij nog niet af is.

export type LegalSection = {
  /** Zonder nummer — de nummering komt uit de volgorde, niet uit de tekst. */
  heading: string
  /** Elke string is één alinea. Een regel die met "· " begint is een opsomming. */
  body: string[]
}

export type LegalKind =
  | "voorwaarden"
  | "privacy"
  | "cookies"
  | "portaal"
  | "abonnement"
  | "colofon"
  | "formulier"

export type LegalAudience = "consument" | "zakelijk" | "iedereen"

export type LegalStatus =
  /** Geschreven, nog niet door een jurist gezien. Draagt een zichtbare band. */
  | "concept"
  /** Door een jurist getoetst en door Nick vrijgegeven. */
  | "vastgesteld"

export type LegalDocument = {
  id: string
  /** Het pad onder /colofon, of "" voor een document dat zijn eigen route heeft. */
  slug: string
  title: string
  kind: LegalKind
  audience: LegalAudience
  /** yyyy-mm-dd — de dag waarop de tekst voor het laatst is veranderd. */
  updated: string
  status: LegalStatus
  /** Eén alinea, boven de secties. */
  intro: string
  sections: LegalSection[]
  /**
   * Wat Nick zelf moet invullen, kiezen of laten toetsen.
   *
   * Wordt NOOIT op de site getoond — alleen in het paneel. Elke regel is
   * een taak, geen mededeling: "vraag je verzekeraar het dekkingsbedrag"
   * en niet "aansprakelijkheid is een aandachtspunt".
   */
  open: string[]
}

/** De vorm van een open plek in de lopende tekst: `[[zoiets]]`. */
export const PLACEHOLDER = /\[\[([^\]]+)\]\]/g

/**
 * Elke open plek in een document, met de sectie waarin hij staat.
 *
 * Los van `open`, en met opzet: `open` is wat Nick moet dóén, dit is waar
 * de tekst letterlijk nog een gat heeft. Een document kan een openstaande
 * vraag hebben zonder gat (het abonnementsbedrag staat nergens in de
 * lopende tekst) en een gat zonder vraag zou een vergissing zijn — die
 * combinatie is wat de test in de gaten houdt.
 */
export function openPlaces(doc: LegalDocument): { where: string; what: string }[] {
  const found: { where: string; what: string }[] = []
  const scan = (where: string, text: string) => {
    for (const match of text.matchAll(PLACEHOLDER)) {
      found.push({ where, what: match[1] })
    }
  }
  scan("inleiding", doc.intro)
  for (const section of doc.sections) {
    scan(section.heading, section.heading)
    for (const paragraph of section.body) scan(section.heading, paragraph)
  }
  return found
}

/** Klaar om te publiceren: getoetst, vrijgegeven en zonder gaten. */
export function isPublishable(doc: LegalDocument): boolean {
  return doc.status === "vastgesteld" && openPlaces(doc).length === 0
}

/**
 * Het document als platte tekst.
 *
 * Voor de downloadknop in het paneel, en met opzet geen markdown: dit
 * bestand gaat naar een jurist, een boekhouder of een mailbijlage, en daar
 * is `## kop` ruis. Wat het wél doet is de nummering meegeven die de
 * pagina toont, zodat een opmerking als "artikel 3, derde alinea" op beide
 * hetzelfde aanwijst.
 *
 * Open plekken blijven staan als `[[…]]`. Ze wegpoetsen zou een document
 * opleveren dat af lijkt terwijl het dat niet is — precies wat de status
 * `concept` probeert te voorkomen.
 */
export function legalToText(doc: LegalDocument): string {
  const lines: string[] = [
    doc.title.toUpperCase(),
    `GRØNN Studio · versie ${doc.updated} · ${doc.status === "concept" ? "CONCEPT — nog niet juridisch getoetst" : "vastgesteld"}`,
    "",
    doc.intro,
    "",
  ]
  doc.sections.forEach((section, i) => {
    lines.push(`${String(i + 1).padStart(2, "0")}. ${section.heading.toUpperCase()}`)
    lines.push("")
    for (const paragraph of section.body) lines.push(paragraph, "")
  })
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n"
}
