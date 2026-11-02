import { reken, type Regel } from "./calculatie"
import { toonEuro, type Bp, type Centen, type Milli } from "./geld"

// De werkomschrijving in Nicks vaste opmaak (eigenaar, 30 okt 2026: "gebruik
// deze layout bij elke beschrijving"): per fase een tabel met genummerde
// werkzaamheden en hun prijs excl. btw, dan het prijsoverzicht en de
// betaling in drie termijnen. De tekst komt uit de schatting; elk bedrag
// rekent de code uit de regels en de uren.

export type WerkPost = { wat: string; toelichting: string; uren: number; fase: string }
export type FaseUren = { naam: string; uren: Milli }

/** Eén fase (of de hele klus zonder fase) als losse invoer voor reken(). */
export function faseInvoer(v: { uren: Milli; uurtarief: Centen; onvoorzien: Bp; korting: Bp; regels: Regel[]; fasen?: FaseUren[] }, fase: string) {
  const uren = v.fasen?.find((f) => f.naam === fase)?.uren ?? 0
  return { uren, uurtarief: v.uurtarief, onvoorzien: v.onvoorzien, korting: v.korting, regels: v.regels.filter((r) => (r.groep ?? "") === fase) }
}

export function werkomschrijving(o: { klant: string; posten: WerkPost[]; regels: (Regel & { post?: string })[]; uurtarief: Centen; onvoorzien: Bp; korting: Bp }) {
  const fasen = [...new Set(o.posten.map((p) => p.fase))]
  const alleUren = Math.round(o.posten.reduce((t, p) => t + p.uren, 0) * 1000)
  const totaal = reken({ uren: alleUren, uurtarief: o.uurtarief, regels: o.regels, onvoorzien: o.onvoorzien, korting: o.korting })
  // Elke regel hoort bij één post: de genoemde, anders de laatste post van zijn fase, anders de laatste post.
  const doel = (r: Regel & { post?: string }) => {
    const fase = r.groep ?? ""
    return o.posten.find((p) => p.wat === r.post && p.fase === fase) ?? o.posten.findLast((p) => p.fase === fase) ?? o.posten.at(-1)
  }
  let nr = 0
  const delen = [`# Werkomschrijving & prijsopbouw`, `**${o.klant || "Klant"} — GRØNN Studio**`]
  for (const f of fasen) {
    const rijen = o.posten
      .filter((p) => p.fase === f)
      .map((p) => {
        const u = reken({ uren: Math.round(p.uren * 1000), uurtarief: o.uurtarief, regels: o.regels.filter((r) => !r.optioneel && doel(r) === p), onvoorzien: 0, korting: 0 })
        return `| **${++nr}. ${p.wat}** — ${p.toelichting} | ${toonEuro(u.verkoop)} |`
      })
    delen.push(`${f ? `## ${f}\n\n` : ""}| Werkzaamheden | Excl. btw |\n|---|---:|\n${rijen.join("\n")}`)
  }
  const btw = totaal.btw.reduce((t, b) => t + b.btw, 0)
  const termijn = (p: number) => Math.round((totaal.totaal * p) / 100)
  delen.push(
    `## Prijsoverzicht\n\n| Omschrijving | Bedrag |\n|---|---:|\n| Subtotaal excl. btw | ${toonEuro(totaal.verkoop)} |\n| Btw | ${toonEuro(btw)} |\n| **Totaal incl. btw** | **${toonEuro(totaal.totaal)}** |`,
    `### Betaling\n\n| Termijn | Incl. btw |\n|---|---:|\n| 50% bij opdrachtbevestiging | ${toonEuro(termijn(50))} |\n| 30% na grondwerk en bestrating in hoofdzaak | ${toonEuro(termijn(30))} |\n| 20% bij oplevering | ${toonEuro(totaal.totaal - termijn(50) - termijn(30))} |`,
  )
  return delen.join("\n\n")
}

/** Alleen het stuk van één fase uit een werkomschrijving, voor een deel-offerte. Zonder kopje van die fase: de hele tekst. */
export function faseTekst(tekst: string, fase: string) {
  const regels = tekst.split("\n")
  const start = regels.findIndex((r) => /^##\s/.test(r) && r.replace(/^##\s*/, "").trim() === fase.trim())
  if (start < 0) return tekst
  const eind = regels.findIndex((r, i) => i > start && /^##\s/.test(r))
  return regels.slice(start, eind < 0 ? undefined : eind).join("\n").trim()
}

/** Per fase het totaal incl. btw, zodat elke versie zijn fasen naast het geheel laat zien. */
export function faseTotalen(v: Parameters<typeof faseInvoer>[0]) {
  return (v.fasen ?? []).map((f) => ({ naam: f.naam, uren: f.uren, ...reken(faseInvoer(v, f.naam)) }))
}

/** Vrije tekst die Grønn in posten heeft opgedeeld; bedragen alleen als Nick ze zelf noemde. */
export type Opmaak = {
  fasen: { naam: string; posten: { titel: string; toelichting: string; bedrag: number | null; nagaan: boolean }[] }[]
  extra: { titel: string; tekst: string }[]
  voorbehoud: string
}

/** Zet de opgedeelde tekst in Nicks layout. De code rekent de totalen en termijnen, niet het model. */
export function opmaakTekst(klant: string, o: Opmaak) {
  let nr = 0
  const bedragen: number[] = []
  const delen = [`# Werkomschrijving & prijsopbouw`, `**${klant || "Klant"} — GRØNN Studio**`]
  for (const f of o.fasen) {
    const rijen = f.posten.map((p) => {
      const c = p.bedrag != null && p.bedrag > 0 ? Math.round(p.bedrag * 100) : null
      if (c) bedragen.push(c)
      return `| **${++nr}. ${p.titel}** — ${p.toelichting} | ${c ? toonEuro(c) : "Nog te calculeren"}${p.nagaan ? "*" : ""} |`
    })
    delen.push(`${f.naam ? `## ${f.naam}\n\n` : ""}| Werkzaamheden | Excl. btw |\n|---|---:|\n${rijen.join("\n")}`)
  }
  if (bedragen.length) {
    const sub = bedragen.reduce((t, b) => t + b, 0)
    const btw = Math.round(sub * 0.21)
    const tot = sub + btw
    const t = (p: number) => Math.round((tot * p) / 100)
    delen.push(
      `## Prijsoverzicht\n\n| Omschrijving | Bedrag |\n|---|---:|\n| Subtotaal excl. btw | ${toonEuro(sub)} |\n| Btw 21% | ${toonEuro(btw)} |\n| **Totaal incl. btw** | **${toonEuro(tot)}** |`,
      `### Betaling\n\n| Termijn | Incl. btw |\n|---|---:|\n| 50% bij opdrachtbevestiging | ${toonEuro(t(50))} |\n| 30% na grondwerk en bestrating in hoofdzaak | ${toonEuro(t(30))} |\n| 20% bij oplevering | ${toonEuro(tot - t(50) - t(30))} |`,
    )
  }
  if (o.voorbehoud.trim()) delen.push(`---\n\n**Prijsvoorbehoud:** ${o.voorbehoud.trim()}`)
  for (const e of o.extra) delen.push(`## ${e.titel}\n\n${e.tekst.trim()}`)
  return delen.join("\n\n")
}
