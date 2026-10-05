import { SERVICES, type Service } from "@/lib/data/services"
import type { L } from "@/lib/i18n"

/** Diensten op slug, in de volgorde die de pagina wil. Faalt hard bij een tikfout. */
export function diensten(...slugs: string[]): Service[] {
  return slugs.map((slug) => {
    const s = SERVICES.find((x) => x.slug === slug)
    if (!s) throw new Error(`Onbekende dienst: ${slug}`)
    return s
  })
}

export const nr = (i: number) => String(i + 1).padStart(2, "0")

/** Splitst een samenvatting na de eerste zin: de opening krijgt de eerste, de rest licht op. */
export function eersteZin(tekst: string): [string, string] {
  const i = tekst.indexOf(". ")
  return i < 0 ? [tekst, ""] : [tekst.slice(0, i + 1), tekst.slice(i + 2)]
}

export const aantalDiensten = (n: number): L => ({
  nl: `${n} ${n === 1 ? "dienst" : "diensten"}`,
  en: `${n} ${n === 1 ? "service" : "services"}`,
})

/** eersteZin in beide talen: [opening, vervolg]. */
export function eersteZinL(t: L): [L, L] {
  const [nl1, nl2] = eersteZin(t.nl)
  const [en1, en2] = eersteZin(t.en)
  return [
    { nl: nl1, en: en1 },
    { nl: nl2, en: en2 },
  ]
}
