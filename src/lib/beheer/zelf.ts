import { euro } from "@/lib/format"
import { OFFERTES, PROJECTEN, TE_BETALEN, TE_ONTVANGEN, TODOS } from "./data"

// Grønn zonder Claude (eigenaar, 7 okt 2026: "laten praten zonder API"). Vaste
// vragen over het dashboard beantwoordt hij zelf uit data.ts: gratis, direct en
// ook als de API-sleutel leeg is. Alleen de rest gaat naar Claude.
const heeft = (v: string, ...woorden: string[]) => woorden.some((w) => v.includes(w))

export function zelfAntwoord(vraag: string): string | null {
  const v = vraag.toLowerCase()

  const project = PROJECTEN.find((p) => v.includes(p.naam.toLowerCase().split(" ")[0]))
  if (project) {
    const bedrag = project.bedrag ? `, ${euro(project.bedrag)}` : ""
    return `${project.naam}: ${project.wat}, fase ${project.fase.toLowerCase()}${bedrag}. Volgende stap: ${project.volgende}`
  }

  if (heeft(v, "factuur", "facturen", "betaald", "betalen", "geld")) {
    const open = TE_ONTVANGEN.filter((f) => !f.betaald)
    const som = open.reduce((s, f) => s + (f.bedrag ?? 0), 0)
    return `Je wacht op ${open.length} facturen, samen ${euro(som)}. Zelf moet je nog ${TE_BETALEN.length} posten regelen, waaronder ${TE_BETALEN.slice(0, 2).map((f) => f.nummer).join(" en ")}.`
  }

  if (heeft(v, "offerte", "openstaand", "open staat", "staat er open")) {
    const open = OFFERTES.filter((o) => !o.betaald)
    const som = open.reduce((s, o) => s + (o.bedrag ?? 0), 0)
    return `Er staan ${open.length} offertes open, samen ${euro(som)}: ${open.map((o) => `${o.aan} (${euro(o.bedrag ?? 0)}), ${o.stand.toLowerCase()}`).join("; ")}.`
  }

  if (heeft(v, "dringend", "eerst", "belangrijk", "aandacht")) {
    const eerst = TODOS.filter((t) => t.dringend)
    const projecten = PROJECTEN.filter((p) => p.aandacht)
    return [
      ...eerst.map((t) => `Eerst: ${t.wat}. ${t.waarom}`),
      ...projecten.map((p) => `${p.naam}: ${p.volgende}`),
    ].join(" ") || "Niets dringends, Nick."
  }

  if (heeft(v, "vandaag", "te doen", "todo", "to-do", "moet ik")) {
    const stappen = PROJECTEN.filter((p) => p.fase !== "Opgeleverd" && p.aandacht).map((p) => `${p.naam}: ${p.volgende}`)
    const lijst = TODOS.slice(0, 3).map((t) => t.wat.toLowerCase())
    return `${stappen.join(" ")} Verder op je lijst: ${lijst.join(", ")}.`.trim()
  }

  if (heeft(v, "project", "lopend", "overzicht", "hoe staat")) {
    const lopend = PROJECTEN.filter((p) => p.fase !== "Opgeleverd")
    return `${lopend.length} lopend: ${lopend.map((p) => `${p.naam} (${p.fase.toLowerCase()})`).join(", ")}.`
  }

  if (heeft(v, "hallo", "hoi", "goedemorgen", "goedemiddag", "goedenavond", "hey")) return "Hoi Nick. Vraag me naar vandaag, je offertes of een project."

  return null
}

export const ZONDER_CLAUDE =
  "Dat kan ik zonder Claude niet beantwoorden. Vraag me naar vandaag, wat dringend is, je offertes of een project bij naam."
