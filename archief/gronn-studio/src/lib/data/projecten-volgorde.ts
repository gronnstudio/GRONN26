import type { L } from "@/lib/i18n"

import { TERRAS, TERRAS_ALS_PROJECT, TERRAS_FOTOS, TERRAS_SLUG } from "./terras-geulle"
import { fotosVoor, VIJVER, VIJVER_ALS_PROJECT, VIJVER_SLUG, type Foto } from "./vijverrenovatie"

// De volgorde van het echte werk: één lijst, zodat "volgend project" rond
// kan lopen (het laatste wijst weer naar het eerste) en een derde project
// alleen hier en in KAARTEN hoeft te worden toegevoegd. Alleen echte
// projecten met een eigen pagina staan erin — geen plaatshouders.

export const PROJECTEN_VOLGORDE = [VIJVER_SLUG, TERRAS_SLUG] as const

export type ProjectSlug = (typeof PROJECTEN_VOLGORDE)[number]

/** Wat de kaart "Volgend project" nodig heeft. Alles uit de projectdata. */
export type ProjectKaart = {
  slug: ProjectSlug
  titel: string
  /** De kaarttekst uit de projectdata (alleen Nederlands). */
  tekst: string
  status: L
  /** De eerste foto van het project; zonder foto toont de kaart er geen. */
  foto?: Foto
}

const KAARTEN: Record<ProjectSlug, ProjectKaart> = {
  [VIJVER_SLUG]: {
    slug: VIJVER_SLUG,
    titel: VIJVER.titel,
    tekst: VIJVER.kaarttekst,
    status: VIJVER_ALS_PROJECT.status,
    foto: fotosVoor("F01")[0],
  },
  [TERRAS_SLUG]: {
    slug: TERRAS_SLUG,
    titel: TERRAS.titel,
    tekst: TERRAS.kaarttekst,
    status: TERRAS_ALS_PROJECT.status,
    foto: TERRAS_FOTOS.hoofd,
  },
}

/** Het project na `slug` in PROJECTEN_VOLGORDE; na het laatste weer het eerste. */
export function volgendProject(slug: ProjectSlug): ProjectKaart {
  const i = PROJECTEN_VOLGORDE.indexOf(slug)
  return KAARTEN[PROJECTEN_VOLGORDE[(i + 1) % PROJECTEN_VOLGORDE.length]]
}
