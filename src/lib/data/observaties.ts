import type { L } from "@/lib/i18n"
import { FOTOS, type Foto } from "@/lib/data/vijverrenovatie"

// Observatiekaders (prototype, 18 okt 2026): wat Nick ziet als hij naar een
// vijver kijkt, als hoekhaken op de foto. Beeldtaal geleend van bewakings-
// en observatiesystemen, nooit van een bestaande serie (geen namen, logo's
// of citaten; zie docs/ideas/person-of-interest-concepts.md).
//
// Alleen wat zichtbaar is op de foto, en alleen algemene ecologie: geen
// soort benoemen die je niet kunt zien, geen claim over het resultaat
// (het project is "in afronding").

export type Punt = {
  /** Kader in procenten van de foto: links, boven, breedte, hoogte. */
  x: number
  y: number
  b: number
  h: number
  /** Wat het is, kort, in kapitalen op het beeld. */
  wat: L
  /** Wat het doet in het systeem. */
  waarom: L
  /** Het ene punt dat het verhaal draagt: oranje in plaats van wit. */
  kern?: boolean
}

export type Observatie = { id: string; foto: Foto; punten: Punt[] }

const waterval = FOTOS.F10 as Foto

export const WATERVAL: Observatie = {
  id: "001",
  foto: waterval,
  punten: [
    {
      x: 35, y: 24, b: 12, h: 16,
      wat: { nl: "Instroom", en: "Inflow" },
      waarom: { nl: "Vallend water neemt zuurstof mee", en: "Falling water carries oxygen in" },
      kern: true,
    },
    {
      x: 62, y: 50, b: 17, h: 14,
      wat: { nl: "Mos op steen", en: "Moss on stone" },
      waarom: { nl: "Vocht en schaduw, al stabiel", en: "Damp and shade, already settled" },
    },
    {
      x: 4, y: 0, b: 15, h: 9,
      wat: { nl: "Oeverplant", en: "Marginal plant" },
      waarom: { nl: "Wortels nemen voeding uit het water", en: "Roots take nutrients from the water" },
    },
    {
      x: 80, y: 27, b: 18, h: 15,
      wat: { nl: "Leiding + kogelkraan", en: "Pipe + ball valve" },
      waarom: { nl: "De stroming blijft regelbaar", en: "The flow stays adjustable" },
    },
    {
      x: 3, y: 78, b: 34, h: 20,
      wat: { nl: "Ondiepe zone", en: "Shallow zone" },
      waarom: { nl: "Warmt snel op, eerst bewoond", en: "Warms quickly, first to be lived in" },
    },
  ],
}
