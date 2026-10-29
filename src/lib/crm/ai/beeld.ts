import type { Bevinding, Tuin } from "../klant"
import { schoonAntwoord, vraagMap, vragenVoor, type Vragenlijst } from "../vragenlijst"

// Foto's van de opname laten bekijken door Claude (docs/architecture/intake.md §5–6).
// Claude stelt voor, Nick bevestigt: wat hier uitkomt is altijd een voorstel.
// In de opdracht staan de tuin, de zones, de gekozen werkzaamheden en de vragen;
// nooit naam, telefoon, e-mail of adres van de klant. Rekenen doet Claude niet:
// een maat uit een foto heet altijd een schatting en wordt een "meting".

export const MAX_FOTOS = 12

export const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["bevindingen"],
  properties: {
    bevindingen: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["zone", "tekst", "zeker", "fotos", "vraag", "antwoord", "meting"],
        properties: {
          zone: { type: "string", description: "Naam van de zone uit de lijst, of 'Algemeen'" },
          tekst: { type: "string", description: "Wat er te zien is of vermoed wordt, één of twee zinnen" },
          zeker: { type: "string", enum: ["zichtbaar", "vermoed"] },
          fotos: { type: "array", items: { type: "integer" }, description: "Nummers van de foto's (1, 2, …) waarop het te zien is" },
          vraag: { type: "string", description: "Id van een vraag uit de lijst die dit beantwoordt, of leeg" },
          antwoord: { type: "string", description: "Voorgesteld antwoord op die vraag in de vorm die de vraag vraagt, of leeg" },
          meting: { type: "string", description: "Een maat die Nick nog moet meten, of leeg" },
        },
      },
    },
  },
} as const

export function opdracht(lijst: Vragenlijst, t: Tuin, fotos: { nr: number; bijschrift: string; zone?: string; tijd?: string }[]) {
  const zones = t.zones.map((z) => `- ${z.naam} (${z.soort})${z.notitie ? `: ${z.notitie.slice(0, 200)}` : ""}`).join("\n") || "- geen zones ingevuld"
  const zoneNaam = new Map(t.zones.map((z) => [z.id, z.naam]))
  const vragen = vragenVoor(lijst, t, "uitgebreid")
    .flatMap((c) => c.vragen)
    .map((v) => `- ${v.id}: ${v.tekst} [${v.soort}${v.opties?.length ? `: ${v.opties.join(" / ")}` : v.soort === "jnov" ? ": Ja / Nee / Onbekend / N.v.t." : ""}${v.eenheid ? `, ${v.eenheid}` : ""}]${t.antwoorden[v.id] ? ` nu: ${t.antwoorden[v.id]}` : ""}`)
    .join("\n")
  const beelden = fotos.map((f) => `Foto ${f.nr}${f.tijd ? ` (uit video, ${f.tijd})` : ""}${f.zone && zoneNaam.get(f.zone) ? `, zone ${zoneNaam.get(f.zone)}` : ""}${f.bijschrift ? `: ${f.bijschrift.slice(0, 200)}` : ""}`).join("\n")
  return `Je helpt Nick Peters van GRØNN Studio (hovenier, vijvers en natuurlijke tuinen) met een tuinopname. Hieronder staan genummerde foto's van één tuin.
Noem per zone wat je ziet dat voor het werk telt: ondergrond, hoogteverschil, afwatering, bestaande verharding, beplanting, obstakels (bomen, kabels, putten), bereikbaarheid voor machines, staat van vijver of folie. Zet "zichtbaar" alleen als het echt op de foto staat; wat je afleidt is "vermoed".
Past een bevinding op een vraag uit de lijst, geef dan het vraag-id en een antwoord in precies de vorm van die vraag. Geef bij een getal alleen een getal. Laat vraag en antwoord leeg bij twijfel.
Schat geen maten als feit: een afmeting die je uit een foto afleidt, wordt een "meting" die Nick nog moet nemen. Noem geen prijzen. Hooguit 15 bevindingen, in het Nederlands, kort.

Werkzaamheden: ${t.diensten.join(", ") || "nog niet gekozen"}
Zones:
${zones}
Vragen:
${vragen}
Foto's:
${beelden}`
}

const tekst = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "")

/** Het antwoord van Claude controleren voordat er iets bewaard wordt. Wat niet klopt, valt weg. */
export function schoonBevindingen(ruw: unknown, lijst: Vragenlijst, t: Tuin, fotoIds: string[], datum: string): Bevinding[] {
  const lijstIn = (ruw as { bevindingen?: unknown })?.bevindingen
  if (!Array.isArray(lijstIn)) return []
  const vragen = vraagMap(lijst)
  const zones = new Set(t.zones.map((z) => z.naam))
  return lijstIn.slice(0, 15).flatMap((b): Bevinding[] => {
    const r = b as Record<string, unknown>
    const inhoud = tekst(r.tekst, 400)
    if (!inhoud) return []
    const zone = tekst(r.zone, 80)
    const bron = (Array.isArray(r.fotos) ? r.fotos : []).flatMap((n) => (Number.isInteger(n) && fotoIds[(n as number) - 1] ? [fotoIds[(n as number) - 1]] : []))
    const v = vragen.get(tekst(r.vraag, 64))
    const antwoord = v ? schoonAntwoord(v, tekst(r.antwoord, 200)) : null
    const meting = tekst(r.meting, 200)
    return [
      {
        id: crypto.randomUUID(),
        datum,
        zone: zones.has(zone) ? zone : "Algemeen",
        tekst: inhoud,
        zeker: r.zeker === "zichtbaar" ? "zichtbaar" : "vermoed",
        bron: [...new Set(bron)],
        ...(v && antwoord ? { vraag: v.id, antwoord } : {}),
        ...(meting ? { meting } : {}),
        status: "voorstel",
      },
    ]
  })
}
