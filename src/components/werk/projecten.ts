import { FOTOS, VIJVER, type Foto } from "@/lib/data/vijverrenovatie"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"

// De twee echte projecten, in de vorm die /werk en "Volgend project" nodig
// hebben. Titels, type, plaats en status komen uit de data; code, jaar en
// korte naam komen uit het wireframe (WF-012). Een project zonder plaats
// toont "—": de vijvertekst noemt er geen, en er wordt er geen bedacht.

export type WerkProject = {
  href: string
  code: string
  jaar: string
  titel: string
  naam: string
  type: string
  plaats: string
  status: string
  /** Groot beeld in het raster en bij hover in de lijst. */
  foto: Foto
}

const F01 = FOTOS.F01 as Foto

export const WERK: WerkProject[] = [
  {
    href: "/werk/vijverrenovatie",
    code: "GR / 001",
    jaar: "2026",
    titel: VIJVER.titel,
    naam: VIJVER.categorie,
    type: VIJVER.categorie,
    plaats: "—",
    status: VIJVER.status,
    foto: F01,
  },
  {
    href: "/werk/terras-geulle",
    code: "GR / 002",
    jaar: "2026",
    titel: TERRAS.titel,
    naam: "Terras Geulle",
    type: TERRAS.categorie,
    plaats: "Geulle",
    status: TERRAS.status,
    foto: TERRAS_FOTOS.reeks[0],
  },
]

/** Het project na dit project, rond: na het laatste komt het eerste. */
export const volgende = (href: string) => {
  const i = WERK.findIndex((p) => p.href === href)
  return WERK[(i + 1) % WERK.length]
}
