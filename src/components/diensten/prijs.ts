import { pricingFor, quoteOffsetFor, type Pricing } from "@/lib/data/pricing"
import type { Service } from "@/lib/data/services"
import { consumerPrice } from "@/lib/format"

/** Hele euro's, zoals de oude site ze toont: "€ 195". */
export const euro = (n: number) => consumerPrice(n, "nl")

/** Een prijsregel: één bedrag, of een bereik als het eerlijk een bereik is. */
export function tierPrijs(amount: number, amountMax?: number): string {
  return amountMax ? `${euro(amount)} – ${euro(amountMax)}` : euro(amount)
}

/**
 * De korte prijs in de dienstrij. Draagt een prijsregel de naam van de dienst
 * zelf (Vijverdoorlichting € 195), dan die; anders de laagste, als "vanaf",
 * met " /mnd" voor een abonnement. Zonder prijs: "Op maat".
 */
export function kortePrijs(s: Service): string {
  const p = pricingFor(s.slug)
  if (!p) return "Op maat"
  const eigen = p.tiers.find((t) => t.label.nl === s.title.nl)
  if (eigen) return tierPrijs(eigen.amount, eigen.amountMax)
  const laagste = Math.min(...p.tiers.map((t) => t.amount))
  return `vanaf ${euro(laagste)}${p.basis === "monthly" ? " /mnd" : ""}`
}

const BASIS: Record<Pricing["basis"], string> = { fixed: "Vaste prijs", from: "Vanaf", monthly: "Per maand" }

/** Alles voor het prijsblok in een opengeklapte rij. */
export function prijsblok(s: Service) {
  const p = pricingFor(s.slug)
  if (!p) {
    return {
      kop: "Prijs · op maat",
      regels: [{ label: "Op maat", prijs: "Offerte", noot: undefined as string | undefined }],
      verreken: quoteOffsetFor(s.slug)?.nl,
    }
  }
  return {
    kop: `${BASIS[p.basis]} · incl. btw`,
    regels: p.tiers.map((t) => ({ label: t.label.nl, prijs: tierPrijs(t.amount, t.amountMax), noot: t.note?.nl })),
    verreken: p.offset?.nl,
  }
}
