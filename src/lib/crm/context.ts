import "server-only"
import { SOORTEN, reken } from "./calculatie"
import { toonDecimaal, toonEuro } from "./geld"
import { ALLE_VELDEN } from "./intake"
import { geld, isOpen, laatsteCalculatie, type Klant } from "./klant"

// Wat Grønn (de assistent) uit het CRM te zien krijgt. Zo weinig als nodig:
// geen telefoonnummers, e-mail of adressen, want die heeft hij voor advies
// niet nodig en ze horen niet in een prompt. Alleen voor de ingelogde
// eigenaar; de route controleert dat voordat dit wordt aangeroepen.

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

/** Eén regel per lopende klant: fase, volgende stap, opvolgdatum, geld. */
export function crmOverzicht(klanten: Klant[]) {
  const nu = vandaag()
  const regels = klanten
    .filter((k) => isOpen(k.fase))
    .map((k) => {
      const g = geld(k)
      const c = laatsteCalculatie(k)
      return [
        `- ${k.naam}${k.plaats ? ` (${k.plaats})` : ""}: ${k.wat || "geen omschrijving"}. Fase ${k.fase}.`,
        k.volgende && `Volgende: ${k.volgende}.`,
        k.opvolgen && `Opvolgen ${k.opvolgen}${k.opvolgen <= nu ? " (vandaag of te laat)" : ""}.`,
        c && `Calculatie "${c.c.titel}" v${c.v.nr}: ${toonEuro(c.v.totaal)} incl. btw, overhouden ${toonEuro(c.v.winst)}.`,
        g.open > 0 && `Nog te ontvangen € ${g.open.toFixed(2)}.`,
      ]
        .filter(Boolean)
        .join(" ")
    })
  return `# Klanten in het CRM (lopend, ${regels.length})\n${regels.join("\n") || "Geen."}`
}

/** De klant die Nick nu open heeft: opname, calculatie en tijdlijn, samengevat. */
export function klantContext(k: Klant) {
  const delen: string[] = [`# Nu open: ${k.naam}`, `Soort ${k.soort}, fase ${k.fase}${k.bron ? `, binnengekomen via ${k.bron}` : ""}. Wens: ${k.wat || "onbekend"}.`]
  if (k.volgende) delen.push(`Volgende stap: ${k.volgende}`)
  if (k.notities) delen.push(`Notities: ${k.notities.slice(0, 1500)}`)
  for (const t of k.tuinen) {
    const antwoorden = ALLE_VELDEN.filter((v) => t.antwoorden[v.id]).map((v) => `${v.label}: ${t.antwoorden[v.id]}${v.eenheid ? ` ${v.eenheid}` : ""}`)
    delen.push(`## Tuin ${t.naam}\n${antwoorden.join("; ") || "Opname nog leeg."}${t.diensten.length ? `\nGewenst: ${t.diensten.join(", ")}` : ""}`)
  }
  const c = laatsteCalculatie(k)
  if (c) {
    const u = reken(c.v)
    const regels = u.regels.map((r) => `${r.omschrijving || SOORTEN[r.soort].naam}: ${toonDecimaal(r.brutoHoeveelheid, 3)} ${r.eenheid}, inkoop ${toonEuro(r.kostprijs)}, verkoop ${toonEuro(r.verkoop)}`)
    delen.push(
      `## Calculatie "${c.c.titel}" versie ${c.v.nr}\nArbeid ${toonDecimaal(c.v.uren, 3)} uur à ${toonEuro(c.v.uurtarief)}. ${regels.join("; ")}.\nVerkoop excl. btw ${toonEuro(u.verkoop)}, totaal incl. btw ${toonEuro(u.totaal)}, overhouden ${toonEuro(u.winst)} (${toonEuro(u.perUur)} per uur, marge ${toonDecimaal(u.marge, 2)} %).`,
    )
  }
  const g = geld(k)
  if (k.stukken.length) delen.push(`## Stukken\n${k.stukken.map((s) => `${s.soort} ${s.nummer} € ${s.bedrag.toFixed(2)} (${s.datum})${s.rond ? (s.soort === "Factuur" ? " betaald" : " akkoord") : ""}`).join("; ")}. Open: € ${g.open.toFixed(2)}.`)
  const recent = k.activiteit.slice(0, 10).map((a) => `${a.datum.slice(0, 10)} ${a.soort}: ${a.tekst}`)
  if (recent.length) delen.push(`## Laatste op de tijdlijn\n${recent.join("\n")}`)
  return delen.join("\n\n")
}
