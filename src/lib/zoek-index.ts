import { kortePrijs } from "@/components/diensten/prijs"
import { faqVragen } from "@/components/faq/vragen"
import { STUKKEN } from "@/lib/data/blog"
import { BODEMPAKKETTEN, BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { SERVICES } from "@/lib/data/services"
import { TERRAS_ALS_PROJECT } from "@/lib/data/terras-geulle"
import { VIJVER_ALS_PROJECT } from "@/lib/data/vijverrenovatie"
import { priceLabel } from "@/lib/format"
import type { L } from "@/lib/i18n"

// Alles waar het zoekvenster (components/zoek.tsx) in zoekt, op de server
// opgebouwd uit dezelfde data als de pagina's. Geen zoekbibliotheek: het zijn
// een paar honderd korte teksten, indexOf is genoeg (zo deed de oude site het ook).

export type Soort = "pagina" | "dienst" | "shop" | "werk" | "vraag"

export type Treffer = {
  soort: Soort
  href: string
  titel: L
  sub?: L
  prijs?: L
}

const VIJVER = new Set(["pond-survey", "water-systems", "pond-autumn-service", "leaf-net", "winterising", "maintenance-subscription"])

const PAGINAS: Treffer[] = [
  { soort: "pagina", href: "/", titel: { nl: "Home", en: "Home" }, sub: { nl: "Vijvers en natuurlijke tuinen in Stein en omgeving", en: "Ponds and natural gardens in and around Stein" } },
  { soort: "pagina", href: "/vijvers", titel: { nl: "Vijvers", en: "Ponds" }, sub: { nl: "Aanleg, onderhoud en de najaarsbeurt", en: "Building, upkeep and the autumn service" } },
  { soort: "pagina", href: "/tuinen", titel: { nl: "Tuinen", en: "Gardens" }, sub: { nl: "Ontwerp, aanleg en beplanting", en: "Design, building and planting" } },
  { soort: "pagina", href: "/tuinen/materialen", titel: { nl: "Materialen", en: "Materials" }, sub: { nl: "Steen en buitenmateriaal", en: "Stone and outdoor materials" } },
  { soort: "pagina", href: "/shop", titel: { nl: "Shop", en: "Shop" }, sub: { nl: "Borderpakketten, bodem en cadeaubonnen", en: "Border packages, soil and gift cards" } },
  { soort: "pagina", href: "/werk", titel: { nl: "Werk", en: "Work" }, sub: { nl: "Projecten die ik maakte", en: "Projects I made" } },
  { soort: "pagina", href: "/over", titel: { nl: "Studio", en: "Studio" }, sub: { nl: "Over Nick en GRØNN Studio", en: "About Nick and GRØNN Studio" } },
  { soort: "pagina", href: "/kennismaken", titel: { nl: "Kennismaken", en: "Get in touch" }, sub: { nl: "Contact, WhatsApp of een afspraak", en: "Contact, WhatsApp or an appointment" } },
  { soort: "pagina", href: "/faq", titel: { nl: "Veelgestelde vragen", en: "FAQ" }, sub: { nl: "Prijzen, werkgebied en werkwijze", en: "Prices, area and how I work" } },
  { soort: "pagina", href: "/blog", titel: { nl: "Blog", en: "Blog" }, sub: { nl: "Praktische stukken over vijver en tuin", en: "Practical pieces on ponds and gardens (Dutch)" } },
  ...STUKKEN.map((s): Treffer => ({ soort: "pagina", href: `/blog/${s.slug}`, titel: { nl: s.titel, en: s.titel }, sub: { nl: "Blog", en: "Blog" } })),
  { soort: "pagina", href: "/techniek", titel: { nl: "Techniek", en: "Technology" }, sub: { nl: "Het gereedschap achter de studio", en: "The tools behind the studio" } },
]

export function zoekIndex(): Treffer[] {
  const vanaf = priceLabel(BORDER_MATEN[0] * BORDER_PRIJS.opgestuurd)
  return [
    ...PAGINAS,
    ...SERVICES.map((s): Treffer => ({
      soort: "dienst",
      href: `${VIJVER.has(s.slug) ? "/vijvers" : "/tuinen"}#${s.slug}`,
      titel: s.title,
      sub: s.tagline ?? s.summary,
      prijs: kortePrijs(s),
    })),
    ...BORDERPAKKETTEN.map((p): Treffer => ({
      soort: "shop",
      href: `/tuinen/borderpakketten#open-${p.slug}`,
      titel: p.naam,
      sub: { nl: p.tags.map((t) => t.nl).join(" · "), en: p.tags.map((t) => t.en).join(" · ") },
      prijs: { nl: `vanaf ${vanaf}`, en: `from ${vanaf}` },
    })),
    ...BODEMPAKKETTEN.map((b): Treffer => ({ soort: "shop", href: "/tuinen/borderpakketten#bodem", titel: b.naam, sub: b.zin })),
    { soort: "shop", href: "/tuinen/cadeaubon", titel: { nl: "Cadeaubon", en: "Gift card" }, sub: { nl: "Een tuin of vijver cadeau doen", en: "Give a garden or pond as a gift" } },
    ...[
      { p: VIJVER_ALS_PROJECT, href: "/werk/vijverrenovatie" },
      { p: TERRAS_ALS_PROJECT, href: "/werk/terras-geulle" },
    ].map(({ p, href }): Treffer => ({
      soort: "werk",
      href,
      titel: p.title,
      sub: p.location ? { nl: `${p.objective.nl} · ${p.location}`, en: `${p.objective.en} · ${p.location}` } : p.objective,
    })),
    // Een vraag opent op /faq bij dat antwoord: "wat kost" of "Maastricht" vindt het.
    ...(() => {
      const en = faqVragen("en")
      return faqVragen("nl").map((v, i): Treffer => ({
        soort: "vraag",
        href: `/faq#${v.id}`,
        titel: { nl: v.vraag, en: en[i]?.vraag ?? v.vraag },
      }))
    })(),
  ]
}
