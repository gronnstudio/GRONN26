import { SERVICES, type Service } from "@/lib/data/services"

/** Diensten op slug, in de volgorde die de pagina wil. Faalt hard bij een tikfout. */
export function diensten(...slugs: string[]): Service[] {
  return slugs.map((slug) => {
    const s = SERVICES.find((x) => x.slug === slug)
    if (!s) throw new Error(`Onbekende dienst: ${slug}`)
    return s
  })
}

export const nr = (i: number) => String(i + 1).padStart(2, "0")
