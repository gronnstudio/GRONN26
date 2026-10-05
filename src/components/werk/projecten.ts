import { FOTOS, VIJVER, type Foto } from "@/lib/data/vijverrenovatie"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import type { L } from "@/lib/i18n"

// De twee echte projecten, in de vorm die /werk en "Volgend project" nodig
// hebben. Titels, type, plaats en status komen uit de data; code, jaar en
// korte naam komen uit het wireframe (WF-012). Een project zonder plaats
// toont "—": de vijvertekst noemt er geen, en er wordt er geen bedacht.

export type WerkProject = {
  href: string
  code: string
  jaar: string
  titel: L
  naam: L
  type: L
  plaats: string
  status: L
  /** Groot beeld in het raster en bij hover in de lijst. */
  foto: Foto
}

const F01 = FOTOS.F01 as Foto

export const WERK: WerkProject[] = [
  {
    href: "/werk/vijverrenovatie",
    code: "GR / 001",
    jaar: "2026",
    titel: { nl: VIJVER.titel, en: VIJVER.en.titel },
    naam: { nl: VIJVER.categorie, en: VIJVER.en.categorie },
    type: { nl: VIJVER.categorie, en: VIJVER.en.categorie },
    plaats: "—",
    status: { nl: VIJVER.status, en: VIJVER.en.status },
    foto: F01,
  },
  {
    href: "/werk/terras-geulle",
    code: "GR / 002",
    jaar: "2026",
    titel: { nl: TERRAS.titel, en: TERRAS.en.titel },
    naam: { nl: "Terras Geulle", en: "Patio Geulle" },
    type: { nl: TERRAS.categorie, en: TERRAS.en.categorie },
    plaats: "Geulle",
    status: { nl: TERRAS.status, en: TERRAS.en.status },
    foto: TERRAS_FOTOS.reeks[0],
  },
]

/** Het project na dit project, rond: na het laatste komt het eerste. */
export const volgende = (href: string) => {
  const i = WERK.findIndex((p) => p.href === href)
  return WERK[(i + 1) % WERK.length]
}
