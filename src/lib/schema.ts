import { BUSINESS } from "@/lib/business"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"
import { pricingFor } from "@/lib/data/pricing"
import type { Service } from "@/lib/data/services"

// Gestructureerde gegevens voor zoekmachines (uit gronn.studio, ingekort).
// Alleen echte gegevens uit business.ts en werkgebied.ts: geen
// coördinaten, beoordelingen of openingstijden.
const SITE = "https://gronn.studio"
const LIMBURG = {
  "@type": "AdministrativeArea",
  name: BUSINESS.address.province,
  containedInPlace: { "@type": "Country", name: BUSINESS.address.country },
}

export function studioSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE}/#organisation`,
    name: BUSINESS.name,
    slogan: BUSINESS.tagline,
    description: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
    url: SITE,
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.province,
      addressCountry: "NL",
    },
    vatID: BUSINESS.btw,
    identifier: { "@type": "PropertyValue", name: "KVK", value: BUSINESS.kvk },
    areaServed: [LIMBURG, ...SERVICE_AREA_TOWNS.map((name) => ({ "@type": "City", name, containedInPlace: LIMBURG }))],
    founder: {
      "@type": "Person",
      name: `${BUSINESS.owner.given} ${BUSINESS.owner.family}`,
      jobTitle: "Hovenier en ecologisch ontwerper",
      image: `${SITE}/nick/portret-espresso.jpg`,
      sameAs: [BUSINESS.linkedin],
    },
    knowsLanguage: ["nl-NL"],
    sameAs: [BUSINESS.instagram],
  }
}

/**
 * De diensten op een pagina als Service, met de gepubliceerde prijs uit
 * pricing.ts (incl. btw). Zonder prijs (ontwerp: altijd offerte) geen offers.
 * Zo kan een zoekmachine of AI-antwoord "wat kost een vijver in Stein"
 * beantwoorden met dezelfde bedragen als de dienstrijen.
 */
export function dienstenSchema(lijst: Service[], pad: string) {
  return {
    "@context": "https://schema.org",
    "@graph": lijst.map((s) => {
      const p = pricingFor(s.slug)
      const laagste = p ? Math.min(...p.tiers.map((t) => t.amount)) : undefined
      return {
        "@type": "Service",
        "@id": `${SITE}${pad}#${s.slug}`,
        name: s.title.nl,
        description: s.summary.nl,
        url: `${SITE}${pad}`,
        provider: { "@id": `${SITE}/#organisation` },
        areaServed: SERVICE_AREA_TOWNS.map((name) => ({ "@type": "City", name })),
        offers:
          p && laagste !== undefined
            ? {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: laagste,
                priceSpecification: {
                  "@type": p.basis === "monthly" ? "UnitPriceSpecification" : "PriceSpecification",
                  priceCurrency: "EUR",
                  ...(p.basis === "fixed" ? { price: laagste } : { minPrice: laagste }),
                  ...(p.basis === "monthly" ? { unitText: "maand" } : {}),
                  valueAddedTaxIncluded: true,
                },
              }
            : undefined,
      }
    }),
  }
}

/** Een JSON-LD-blok veilig als tekst voor een <script>. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c")
