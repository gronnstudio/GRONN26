import { BUSINESS } from "@/lib/business"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"

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
      streetAddress: BUSINESS.address.street,
      postalCode: BUSINESS.address.postalCode,
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
    },
    knowsLanguage: ["nl-NL"],
    sameAs: [BUSINESS.instagram],
  }
}
