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
  delen.push(
    `## Prijsoverzicht\n\n| Omschrijving | Bedrag |\n|---|---:|\n| Subtotaal excl. btw | ${toonEuro(totaal.verkoop)} |\n| Btw | ${toonEuro(btw)} |\n| **Totaal incl. btw** | **${toonEuro(totaal.totaal)}** |`
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
    delen.push(
      `## Prijsoverzicht\n\n| Omschrijving | Bedrag |\n|---|---:|\n| Subtotaal excl. btw | ${toonEuro(sub)} |\n| Btw 21% | ${toonEuro(btw)} |\n| **Totaal incl. btw** | **${toonEuro(tot)}** |`
    )
  }
  if (o.voorbehoud.trim()) delen.push(`---\n\n**Prijsvoorbehoud:** ${o.voorbehoud.trim()}`)
  for (const e of o.extra) delen.push(`## ${e.titel}\n\n${e.tekst.trim()}`)
  return delen.join("\n\n")
}

/** Haalt de oude betaling in drie termijnen uit een werkomschrijving (Nick, 2 nov 2026: "haal de 50 30 20 eruit"). */
export const zonderTermijnen = (tekst: string) => tekst.replace(/\n*### Betaling\n\n\| Termijn[^\n]*\n(\|[^\n]*\n?)*/g, "\n").trimEnd()

/**
 * De lijst is leidend (Nick, 2 nov 2026: "datgene wat laatst aangepast wordt is leidend, dat is meestal
 * de materialen-, machines- en plantenlijst"). Zet de bedragen in de werkomschrijving gelijk aan de
 * calculatie: losse postbedragen gaan weg, elke fasetabel krijgt het fasetotaal, en het prijsoverzicht
 * komt uit de som. De tekst van Nick blijft staan.
 */
export function metActueleBedragen(tekst: string, som: { verkoop: number; btw: number; totaal: number; fasen: { naam: string; verkoop: number }[] }) {
  if (!/^\|.*\|\s*$/m.test(tekst)) return tekst
  const nr = (x: string) => x.match(/\d+/)?.[0] ?? ""
  const blokken = tekst.split(/\n(?=## )/)
  const uit = blokken.flatMap((b) => {
    const kop = b.match(/^## (.+)$/m)?.[1]?.trim() ?? ""
    if (/^Prijsoverzicht/i.test(kop)) {
      // Alleen de oude tabel gaat weg; wat eronder staat (voorbehoud) blijft.
      const r = b.split("\n")
      const eind = r.findLastIndex((x) => /^\|.*\|\s*$/.test(x))
      const rest = r.slice(eind + 1).join("\n").trim()
      return rest ? [rest + "\n"] : []
    }
    if (!/\| Werkzaamheden \|/.test(b)) return [b]
    const fase = som.fasen.find((f) => f.naam === kop) ?? (nr(kop) ? som.fasen.find((f) => nr(f.naam) === nr(kop)) : undefined)
    const regels = b
      .split("\n")
      .filter((r) => !/^\| \*\*Totaal (fase|deze fase)/.test(r))
      .map((r) => (/^\| \*\*\d+\./.test(r) ? r.replace(/\|[^|]*\|\s*$/, "|  |") : r))
    if (fase) {
      const laatste = regels.findLastIndex((r) => /^\|.*\|\s*$/.test(r))
      regels.splice(laatste + 1, 0, `| **Totaal deze fase** | **${toonEuro(fase.verkoop)}** |`)
    }
    return [regels.join("\n")]
  })
  const fasenRij = som.fasen.map((f) => `| ${f.naam} | ${toonEuro(f.verkoop)} |`).join("\n")
  const overzicht = `## Prijsoverzicht\n\n| Omschrijving | Bedrag |\n|---|---:|\n${fasenRij ? `${fasenRij}\n` : ""}| Subtotaal excl. btw | ${toonEuro(som.verkoop)} |\n| Btw | ${toonEuro(som.btw)} |\n| **Totaal incl. btw** | **${toonEuro(som.totaal)}** |`
  // Het overzicht komt na de laatste werktabel, vóór het voorbehoud en de extra kopjes.
  const na = uit.findLastIndex((b) => /\| Werkzaamheden \|/.test(b))
  uit.splice(na + 1, 0, overzicht)
  return uit.join("\n").replace(/\n{3,}/g, "\n\n")
}
