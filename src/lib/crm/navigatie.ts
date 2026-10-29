import type { Icoon } from "@/components/crm/iconen"

// De onderdelen van het bedrijfssysteem, in de volgorde van de zijbalk. Eén
// lijst: de zijbalk, het zoekvenster (⌘K) en "+ Nieuw" lezen hieruit, zodat
// een nieuw onderdeel op één plek bij komt.
export type Onderdeel = { href: string; naam: string; icoon: Icoon; teller?: "aanvragen" | "opvolgen" }

export const GROEPEN: { naam: string; onderdelen: Onderdeel[] }[] = [
  {
    naam: "Werk",
    onderdelen: [
      { href: "/dashboard", naam: "Vandaag", icoon: "vandaag", teller: "opvolgen" },
      { href: "/dashboard/aanvragen", naam: "Aanvragen", icoon: "aanvragen", teller: "aanvragen" },
      { href: "/dashboard/klanten", naam: "Klanten", icoon: "klanten" },
      { href: "/dashboard/vragenlijst", naam: "Vragenlijst", icoon: "vragenlijst" },
      { href: "/dashboard/planning", naam: "Planning", icoon: "planning" },
    ],
  },
  {
    naam: "Rekenen",
    onderdelen: [
      { href: "/dashboard/calculaties", naam: "Calculaties", icoon: "calculaties" },
      { href: "/dashboard/prijs", naam: "Prijs berekenen", icoon: "prijs" },
      { href: "/dashboard/catalogus", naam: "Catalogus", icoon: "catalogus" },
      { href: "/dashboard/leveranciers", naam: "Leveranciers", icoon: "leveranciers" },
    ],
  },
  {
    naam: "Bedrijf",
    onderdelen: [
      { href: "/dashboard/geld", naam: "Geld en papieren", icoon: "geld" },
      { href: "/dashboard/uren", naam: "Uren", icoon: "uren" },
      { href: "/dashboard/social", naam: "Social", icoon: "social" },
      { href: "/dashboard/links", naam: "Links", icoon: "links" },
    ],
  },
]

export const ONDERDELEN = GROEPEN.flatMap((g) => g.onderdelen)

/** Het onderdeel waar een pad onder valt: het langste dat past. */
export const onderdeelVan = (pad: string) =>
  ONDERDELEN.filter((o) => pad === o.href || (o.href !== "/dashboard" && pad.startsWith(`${o.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]

/** Wat je met "+ Nieuw" of ⌘K meteen kunt beginnen. */
export const NIEUW: { naam: string; href: string; uitleg: string }[] = [
  { naam: "Klant", href: "/dashboard/klanten?nieuw=1", uitleg: "Contact of lead" },
  { naam: "Aanvraag", href: "/dashboard/aanvragen?nieuw=1", uitleg: "WhatsApp of telefoontje" },
  { naam: "Calculatie", href: "/dashboard/prijs", uitleg: "Rekenblad, bewaren bij een klant" },
  { naam: "Afspraak", href: "/dashboard/planning?nieuw=1", uitleg: "In de planning" },
  { naam: "Uren", href: "/dashboard/uren", uitleg: "Een werkdag invullen" },
  { naam: "Catalogusitem", href: "/dashboard/catalogus#nieuw", uitleg: "Inkoopprijs onthouden" },
]
