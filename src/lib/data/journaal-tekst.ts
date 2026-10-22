import type { Blok } from "./blog"

/**
 * Tekst naar blokken: een lege regel scheidt blokken, "## " is een kop,
 * regels met "- " vormen een lijst, de rest is een alinea.
 */
export function blokkenUit(tekst: string): Blok[] {
  return tekst
    .trim()
    .split(/\n\s*\n/)
    .map((deel): Blok => {
      const regels = deel.trim().split("\n").map((r) => r.trim())
      if (regels[0].startsWith("## ")) return { soort: "kop", tekst: regels[0].slice(3) }
      if (regels.every((r) => r.startsWith("- "))) return { soort: "lijst", regels: regels.map((r) => r.slice(2)) }
      return { soort: "alinea", tekst: regels.join(" ") }
    })
}

/** Leestijd in minuten, bij 200 woorden per minuut. */
export const leestijdVan = (tekst: string) => Math.max(2, Math.round(tekst.split(/\s+/).length / 200))
