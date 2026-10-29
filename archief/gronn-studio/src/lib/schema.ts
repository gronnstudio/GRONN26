import { MERKBASIS, PORTRET } from "@/components/gronn/plekken"
import { BUSINESS } from "@/lib/business"
import type { Article } from "@/lib/data/journal"
import type { Project } from "@/lib/data/projects"
import { pricingFor, type Pricing } from "@/lib/data/pricing"
import type { Service } from "@/lib/data/services"
import { TERRAS, TERRAS_FOTOS, TERRAS_GEPUBLICEERD, TERRAS_SLUG } from "@/lib/data/terras-geulle"
import { fotosVoor, VIJVER, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { VIJVER_BIJGEWERKT, VIJVER_GEPUBLICEERD } from "@/lib/data/vijverrenovatie-datums"
import type { L, Locale } from "@/lib/i18n"
import { getT, localePath } from "@/lib/locale"
import type { Crumb } from "@/lib/nav"
import { SITE_URL } from "@/lib/seo"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"

// Structured data. One node per thing the site actually is — the studio,
// a case study, an article, the service catalogue — rather than a single
// organisation blob that says nothing about the page you are on.
//
// Every value here comes from real data (business.ts, the content
// document, or src/lib/data/pricing.ts). Nothing is invented: no
// coordinates, no ratings, no opening hours — a schema claim search
// engines can catch out is worse than an absent one.
//
// Prices were on that forbidden list until the studio published real
// ones. They are emitted now because `pricing.ts` holds the same figures
// the visitor reads on the page, incl. btw, in euros. The rule has not
// changed, only the facts: state what is true, omit what is not. A
// service with no entry in `pricing.ts` still emits no price.

export const ORG_ID = `${SITE_URL}/#organisation`
/** Nick, de oprichter: één knoop waar de organisatie en het project naar wijzen. */
export const NICK_ID = `${SITE_URL}/#nick`

const abs = (path: string) => `${SITE_URL}${path}`

/** Limburg, met het land erbij: er is ook een Belgisch Limburg. */
const LIMBURG = {
  "@type": "AdministrativeArea",
  name: BUSINESS.address.province,
  containedInPlace: { "@type": "Country", name: BUSINESS.address.country },
}

/** Nick Peters. Het portret is het enige goedgekeurde beeld van hem. */
export function nickSchema() {
  return {
    "@type": "Person",
    "@id": NICK_ID,
    name: "Nick Peters",
    // Zijn eigen woorden op de site (home, Over mij).
    jobTitle: "Hovenier en ecologisch ontwerper",
    image: abs(PORTRET.src),
    url: abs(localePath("nl", "/studio")),
    worksFor: { "@id": ORG_ID },
  }
}

export function organisationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: BUSINESS.name,
    slogan: BUSINESS.tagline,
    // De merkbasis uit de Brand Guide 2026, zoals de home hem toont.
    description: MERKBASIS.nl,
    url: SITE_URL,
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
    // Registration identifiers a Dutch visitor (and Google) can verify
    // against the KVK register — already public in the footer.
    vatID: BUSINESS.btw,
    identifier: {
      "@type": "PropertyValue",
      name: "KVK",
      value: BUSINESS.kvk,
    },
    // The real catchment: Limburg and the towns werkgebied.ts names on
    // the page, so the claim is checkable. The whole country was an
    // overclaim the moment the practice started selling seasonal work,
    // which is a van and a drive.
    areaServed: [
      LIMBURG,
      ...SERVICE_AREA_TOWNS.map((town) => ({
        "@type": "City",
        name: town,
        containedInPlace: LIMBURG,
      })),
    ],
    founder: nickSchema(),
    knowsLanguage: ["nl-NL", "en"],
    sameAs: [BUSINESS.instagram],
    logo: abs("/logo-green.png"),
    image: abs("/og.jpg"),
  }
}

/**
 * A published price, as schema. Emitted only from real figures in
 * `pricing.ts`; a service without an entry gets no price node at all.
 * `valueAddedTaxIncluded` is stated because the amounts are consumer
 * prices — the same number the page shows.
 */
function priceSpecification(pricing: Pricing) {
  const amounts = pricing.tiers.flatMap((tier) =>
    tier.amountMax ? [tier.amount, tier.amountMax] : [tier.amount]
  )
  const min = Math.min(...amounts)
  const max = Math.max(...amounts)
  const single = min === max

  return {
    "@type": single ? "PriceSpecification" : "AggregateOffer",
    priceCurrency: "EUR",
    valueAddedTaxIncluded: true,
    ...(single ? { price: min } : { lowPrice: min, highPrice: max }),
    ...(pricing.basis === "monthly"
      ? { billingIncrement: 1, unitCode: "MON" }
      : {}),
  }
}

/**
 * The service catalogue, for the /services page. `catalogue` names a
 * smaller one on another page — the autumn offer on /herfstbeurt — so
 * that page states the same prices it shows instead of none.
 */
export function serviceCatalogueSchema(
  services: Service[],
  locale: Locale,
  catalogue: { name: L; path: string } = {
    name: { en: "Services", nl: "Diensten" },
    path: "/services",
  }
) {
  const t = getT(locale)
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: t(catalogue.name),
    url: abs(localePath(locale, catalogue.path)),
    provider: { "@id": ORG_ID },
    itemListElement: services.map((service, i) => {
      const pricing = pricingFor(service.slug)
      return {
        "@type": "Offer",
        position: i + 1,
        url: abs(localePath(locale, `/services/${service.slug}`)),
        ...(pricing
          ? { priceSpecification: priceSpecification(pricing) }
          : {}),
        itemOffered: {
          "@type": "Service",
          name: t(service.title),
          description: t(service.summary),
          serviceType: t(service.title),
          provider: { "@id": ORG_ID },
        },
      }
    }),
  }
}

/** A single service, for its own detail page. */
export function serviceSchema(
  service: Service,
  locale: Locale,
  pricing: Pricing | undefined,
  image: string
) {
  const t = getT(locale)
  const url = abs(localePath(locale, `/services/${service.slug}`))
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t(service.title),
    description: t(service.summary),
    serviceType: t(service.title),
    inLanguage: locale === "nl" ? "nl-NL" : "en",
    provider: { "@id": ORG_ID },
    // With the country, like the studio node: there is a Belgian Limburg.
    areaServed: LIMBURG,
    image: image.startsWith("http") ? image : abs(image),
    url,
    ...(pricing
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceSpecification: priceSpecification(pricing),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  }
}

/** A journal entry. `author` is the studio — the articles are unsigned. */
export function articleSchema(article: Article, locale: Locale) {
  const t = getT(locale)
  const url = abs(localePath(locale, `/journal/${article.slug}`))
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t(article.title),
    description: t(article.excerpt),
    articleSection: t(article.category),
    inLanguage: locale === "nl" ? "nl-NL" : "en",
    datePublished: article.date,
    dateModified: article.date,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: url,
    url,
  }
}

/** A case study. Described as creative work, which is what it is. */
export function projectSchema(project: Project, locale: Locale, image: string) {
  const t = getT(locale)
  const url = abs(localePath(locale, `/projects/${project.slug}`))
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: t(project.title),
    description: t(project.objective),
    inLanguage: locale === "nl" ? "nl-NL" : "en",
    creator: { "@id": ORG_ID },
    locationCreated: { "@type": "Place", name: project.location },
    image: image.startsWith("http") ? image : abs(image),
    url,
  }
}

/**
 * De vijverrenovatie als artikel: Nick schreef het, GRØNN Studio
 * publiceert het. De data komen uit de geschiedenis van de repo
 * (vijverrenovatie-datums.ts), het beeld pas zodra F01 echt is
 * aangeleverd. De tekst is alleen Nederlands, ook op de Engelse route.
 */
export function vijverSchema(locale: Locale) {
  const url = abs(localePath(locale, `/projects/${VIJVER_SLUG}`))
  const foto = fotosVoor("F01")[0]
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: VIJVER.titel,
    description: VIJVER.omschrijving,
    inLanguage: "nl",
    datePublished: VIJVER_GEPUBLICEERD,
    dateModified: VIJVER_BIJGEWERKT,
    author: nickSchema(),
    // Naam en adres herhaald naast de @id: een validator die de losse
    // JSON-LD-blokken niet samenvoegt, ziet anders een naamloze uitgever.
    publisher: { "@type": "ProfessionalService", "@id": ORG_ID, name: BUSINESS.name, url: SITE_URL },
    ...(foto ? { image: foto.src.startsWith("http") ? foto.src : abs(foto.src) } : {}),
    mainEntityOfPage: url,
    url,
  }
}

/**
 * Het terras in Geulle als artikel, net als de vijver. Gepubliceerd op
 * 24 sep 2026; het werk zelf was in augustus 2026.
 */
export function terrasSchema(locale: Locale) {
  const url = abs(localePath(locale, `/projects/${TERRAS_SLUG}`))
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TERRAS.titel.replace(/\u00a0/g, " "),
    description: TERRAS.omschrijving,
    inLanguage: "nl",
    datePublished: TERRAS_GEPUBLICEERD,
    dateModified: TERRAS_GEPUBLICEERD,
    author: nickSchema(),
    publisher: { "@type": "ProfessionalService", "@id": ORG_ID, name: BUSINESS.name, url: SITE_URL },
    image: abs(TERRAS_FOTOS.hoofd.src),
    mainEntityOfPage: url,
    url,
  }
}

/**
 * Breadcrumbs for a detail page. Search results show the trail instead of
 * a bare URL, and it gives the crawler the section a page belongs to.
 *
 * The trail comes from `trailFor()` and is the SAME array the visible
 * <Breadcrumbs> renders, with Home prepended in both places. That is
 * deliberate: this schema was emitted on all three detail routes while
 * no page showed a trail at all, so it described a navigation that did
 * not exist and nothing could catch it out.
 */
export function breadcrumbSchema(locale: Locale, trail: Crumb[]) {
  const t = getT(locale)
  const items: Crumb[] = [
    { label: { en: "Home", nl: "Home" }, path: "/" },
    ...trail,
  ]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t(item.label),
      item: abs(localePath(locale, item.path)),
    })),
  }
}
