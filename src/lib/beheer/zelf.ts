import { euro } from "@/lib/format"
import type { Klant } from "@/lib/crm/klant"
import { LOPEND, geldOverzicht, opTeVolgen, vandaagNL } from "@/lib/crm/overzicht"
import { TE_BETALEN, TODOS } from "./data"

// Grønn zonder Claude (eigenaar, 7 okt 2026: "laten praten zonder API"). Vaste
// vragen beantwoordt hij zelf: gratis, direct en ook als de API-sleutel leeg
// is. Sinds het nieuwe systeem (29 okt 2026) uit de klantkaarten, dezelfde
// cijfers als op Vandaag (src/lib/crm/overzicht.ts); alleen de rest gaat naar Claude.
const heeft = (v: string, ...woorden: string[]) => woorden.some((w) => v.includes(w))

export function zelfAntwoord(vraag: string, klanten: Klant[], openAanvragen: number): string | null {
  const v = vraag.toLowerCase()
  const nu = vandaagNL()
  const geld = geldOverzicht(klanten, nu)
  const opvolgen = opTeVolgen(klanten, nu)

  // Vragen over een klant gaan naar Claude, die de klanten uit het CRM krijgt (src/lib/crm/context.ts).

  if (heeft(v, "factuur", "facturen", "betaald", "betalen", "geld")) {
    return `Je wacht op ${geld.teOntvangen.length} facturen die nog niet zijn afgevinkt, samen ${euro(geld.teOntvangenSom)}${geld.teOntvangen.length ? `: ${geld.teOntvangen.slice(0, 3).map((s) => `${s.klant.naam} ${euro(s.bedrag)}`).join(", ")}` : ""}. Zelf moet je nog ${TE_BETALEN.length} posten regelen.`
  }

  if (heeft(v, "offerte", "openstaand", "open staat", "staat er open")) {
    if (!geld.offertesOpen.length) return "Er staat geen offerte meer open zonder akkoord, Nick."
    return `Er staan ${geld.offertesOpen.length} offertes zonder akkoord, samen ${euro(geld.offertesOpenSom)}: ${geld.offertesOpen.map((s) => `${s.klant.naam} (${euro(s.bedrag)})`).join(", ")}.`
  }

  if (heeft(v, "dringend", "eerst", "belangrijk", "aandacht", "vandaag", "te doen", "todo", "to-do", "moet ik")) {
    const delen = [
      openAanvragen ? `${openAanvragen} nieuwe aanvra${openAanvragen === 1 ? "ag" : "gen"} om terug te bellen.` : "",
      ...opvolgen.slice(0, 3).map((k) => `${k.naam}: ${k.volgende || "opvolgen"}.`),
      ...TODOS.filter((t) => t.dringend).map((t) => `Eerst: ${t.wat}.`),
    ].filter(Boolean)
    return delen.join(" ") || "Niemand om op te volgen en geen nieuwe aanvragen, Nick."
  }

  if (heeft(v, "project", "lopend", "overzicht", "hoe staat", "klus")) {
    const lopend = klanten.filter((k) => LOPEND.includes(k.fase))
    return lopend.length ? `${lopend.length} lopend: ${lopend.map((k) => `${k.naam} (${k.fase.toLowerCase()})`).join(", ")}.` : "Er loopt nu geen klus met akkoord, gepland of in uitvoering."
  }

  if (heeft(v, "hallo", "hoi", "goedemorgen", "goedemiddag", "goedenavond", "hey")) return "Hoi Nick. Vraag me naar vandaag, je offertes, je facturen of een klant bij naam."

  return null
}

export const ZONDER_CLAUDE =
  "Dat kan ik zonder Claude niet beantwoorden. Vraag me naar vandaag, wat dringend is, je offertes of je facturen."
