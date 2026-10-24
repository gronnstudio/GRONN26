import type { Tekst } from "@/components/taal"

// De site als een set tekeningen (tuinplan, 24 okt 2026): elke pagina is een
// blad met een nummer. Eén lijst voor de kop, de index en het stempelvak.
export type Blad = { nr: string; href: string; titel: Tekst; bij: string[] }

export const BLADEN: Blad[] = [
  { nr: "B-01", href: "/", titel: { nl: "Plattegrond", en: "Site plan" }, bij: [] },
  { nr: "B-02", href: "/vijvers", titel: { nl: "Vijvers", en: "Ponds" }, bij: ["/vijvers"] },
  { nr: "B-03", href: "/tuinen", titel: { nl: "Tuinen", en: "Gardens" }, bij: ["/tuinen"] },
  { nr: "B-04", href: "/tuinen/borderpakketten", titel: { nl: "Borderpakketten", en: "Border packages" }, bij: ["/tuinen/borderpakketten", "/shop"] },
  { nr: "B-05", href: "/werk", titel: { nl: "Werk", en: "Work" }, bij: ["/werk"] },
  { nr: "B-06", href: "/over", titel: { nl: "Studio", en: "Studio" }, bij: ["/over", "/techniek"] },
  { nr: "B-07", href: "/journaal", titel: "Journaal", bij: ["/journaal"] },
  { nr: "B-08", href: "/kennismaken", titel: { nl: "Kennismaken", en: "Get in touch" }, bij: ["/kennismaken"] },
]

/** Het blad waar je nu bent; het langste passende pad wint (borderpakketten vóór tuinen). */
export function bladVan(pad: string): Blad | undefined {
  if (pad === "/") return BLADEN[0]
  return BLADEN.filter((b) => b.bij.some((h) => pad === h || pad.startsWith(h + "/")))
    .sort((a, b) => Math.max(...b.bij.map((h) => h.length)) - Math.max(...a.bij.map((h) => h.length)))[0]
}
