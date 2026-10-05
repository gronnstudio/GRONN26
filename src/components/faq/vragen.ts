import { SERVICES } from "@/lib/data/services"
import { VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import type { Locale } from "@/lib/i18n"
import { vragen, vragenSchema, type Vraag } from "@/lib/data/vragen-lijst"

// De vragen voor /faq, uit dezelfde bron als de oude site
// (`src/lib/data/vragen-lijst.ts`, die prijzen, diensten, werkgebied en
// werkwijze zelf opbouwt). Alleen de lees-links wijzen nog naar de routes
// van de oude site; die zetten we hier om naar de nieuwe. Het origineel
// blijft onaangeroerd.

const NIEUWE_ROUTE: Record<string, string> = {
  "/contact": "/kennismaken",
  "/studio": "/over",
  "/projects": "/werk",
  [`/projects/${VIJVER_SLUG}`]: "/werk/vijverrenovatie",
  "/services": "/tuinen",
  "/services/pond-survey": "/vijvers",
  "/services/water-systems": "/vijvers",
  "/services/garden-design": "/tuinen",
  "/services/implementation": "/tuinen",
}

export function nieuweRoute(href: string): string {
  if (NIEUWE_ROUTE[href]) return NIEUWE_ROUTE[href]
  if (href.startsWith("/projects/")) return "/werk"
  if (href.startsWith("/services/")) return "/tuinen"
  return href
}

export const FAQ_URL = "https://gronn.studio/faq"

/** Alle vragen in één taal (standaard Nederlands), met links naar de nieuwe routes. */
export function faqVragen(locale: Locale = "nl"): Vraag[] {
  return vragen(SERVICES, locale).map((v) => (v.verder ? { ...v, verder: { ...v.verder, href: nieuweRoute(v.verder.href) } } : v))
}

/** FAQPage-JSON-LD uit precies dezelfde vragen als de pagina toont. */
export function faqSchema(lijst: Vraag[]) {
  return vragenSchema(lijst, "nl", FAQ_URL)
}
