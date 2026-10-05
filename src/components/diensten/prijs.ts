import { pricingFor, quoteOffsetFor, type Pricing } from "@/lib/data/pricing"
import type { Service } from "@/lib/data/services"
import { consumerPrice } from "@/lib/format"
import type { L } from "@/lib/i18n"

type Taal = "nl" | "en"

/** Hele euro's, zoals de oude site ze toont: "€ 195". */
export const euro = (n: number, taal: Taal = "nl") => consumerPrice(n, taal)

/** Een prijsregel: één bedrag, of een bereik als het eerlijk een bereik is. */
export function tierPrijs(amount: number, amountMax?: number): L {
  const een = (t: Taal) => (amountMax ? `${euro(amount, t)} – ${euro(amountMax, t)}` : euro(amount, t))
  return { nl: een("nl"), en: een("en") }
}

/**
 * De korte prijs in de dienstrij. Draagt een prijsregel de naam van de dienst
 * zelf (Vijverdoorlichting € 195), dan die; anders de laagste, als "vanaf",
 * met " /mnd" voor een abonnement. Zonder prijs: "Op maat".
 */
export function kortePrijs(s: Service): L {
  const p = pricingFor(s.slug)
  if (!p) return { nl: "Op maat", en: "Custom" }
  const eigen = p.tiers.find((t) => t.label.nl === s.title.nl)
  if (eigen) return tierPrijs(eigen.amount, eigen.amountMax)
  const laagste = Math.min(...p.tiers.map((t) => t.amount))
  const mnd = p.basis === "monthly"
  return {
    nl: `vanaf ${euro(laagste)}${mnd ? " /mnd" : ""}`,
    en: `from ${euro(laagste, "en")}${mnd ? " /mo" : ""}`,
  }
}

const BASIS: Record<Pricing["basis"], L> = {
  fixed: { nl: "Vaste prijs", en: "Fixed price" },
  from: { nl: "Vanaf", en: "From" },
  monthly: { nl: "Per maand", en: "Per month" },
}

/** Alles voor het prijsblok in een opengeklapte rij. */
export function prijsblok(s: Service) {
  const p = pricingFor(s.slug)
  if (!p) {
    return {
      kop: { nl: "Prijs · op maat", en: "Price · custom" } as L,
      regels: [
        { label: { nl: "Op maat", en: "Custom" } as L, prijs: { nl: "Offerte", en: "Quote" } as L, noot: undefined as L | undefined },
      ],
      verreken: quoteOffsetFor(s.slug),
    }
  }
  return {
    kop: { nl: `${BASIS[p.basis].nl} · incl. btw`, en: `${BASIS[p.basis].en} · incl. VAT` },
    regels: p.tiers.map((t) => ({ label: t.label, prijs: tierPrijs(t.amount, t.amountMax), noot: t.note })),
    verreken: p.offset,
  }
}
