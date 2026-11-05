// Een document mailen vanuit je eigen mailprogramma (Nick, 5 nov 2026: versturen uit het
// dashboard). Een mailto-link met onderwerp, groet en de privélink: geen sleutel, geen
// mailserver, en de mail staat gewoon bij Verzonden in hello@gronn.studio.

const SITE = "https://gronn.studio"

/** "Anna de Vries" → "Anna"; "Clannad & Stijn" blijft heel. */
export function voornaamVan(naam: string) {
  const n = naam.trim()
  return (n.split(/\s*[&,]\s*|\s+en\s+/).length > 1 ? n : n.split(" ")[0]) || n
}

export type MailSoort = "offerte" | "factuur" | "herinnering" | "werkbon"

export function mailVoor(soort: MailSoort, g: { naam: string; nummer: string; pad: string; bedrag?: string }) {
  const link = new URL(g.pad, SITE).toString()
  const hoi = `Hoi ${voornaamVan(g.naam)},`
  const groet = "Groeten,\nNick Peters\nGRØNN Studio"
  const teksten: Record<MailSoort, { onderwerp: string; kern: string }> = {
    offerte: { onderwerp: `Offerte ${g.nummer} van GRØNN Studio`, kern: `Hierbij de offerte, zoals besproken. Je kunt hem bekijken en meteen akkoord geven via deze link:\n${link}\n\nVragen of iets anders? Laat het me gerust weten.` },
    factuur: { onderwerp: `Factuur ${g.nummer} van GRØNN Studio`, kern: `Hierbij de factuur${g.bedrag ? ` van ${g.bedrag}` : ""}. Je ziet hem hier, met een betaalknop:\n${link}\n\nBedankt voor de opdracht!` },
    herinnering: { onderwerp: `Herinnering factuur ${g.nummer}`, kern: `Volgens mij staat factuur ${g.nummer}${g.bedrag ? ` (${g.bedrag})` : ""} nog open. Misschien is hij aan je aandacht ontsnapt. Betalen kan via deze link:\n${link}\n\nAl betaald? Dan kun je dit bericht vergeten.` },
    werkbon: { onderwerp: `Werkbon ${g.nummer} om te tekenen`, kern: `Hierbij de werkbon van vandaag. Wil je hem nalopen en tekenen? Dat kan op je telefoon:\n${link}` },
  }
  const t = teksten[soort]
  return { onderwerp: t.onderwerp, tekst: `${hoi}\n\n${t.kern}\n\n${groet}` }
}

export function mailtoLink(aan: string, onderwerp: string, tekst: string) {
  const adres = /^[^\s@<>"]+@[^\s@<>"]+$/.test(aan.trim()) ? aan.trim() : ""
  return `mailto:${encodeURIComponent(adres).replace(/%40/g, "@")}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(tekst)}`
}
