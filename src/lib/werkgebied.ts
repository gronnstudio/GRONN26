import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"

// Service area, by four-digit postcode.
//
// Design work travels: a plan can be drawn for a garden two provinces away.
// Seasonal work does not — a maintenance visit is a van, a machine and a
// drive, four times a year. Asking for a postcode before the booking form
// is the cheapest kindness on the site: it stops someone filling in a form
// for a job that would be ninety minutes of driving each way, and it stops
// us saying no after they have already got their hopes up.
//
// Ranges are deliberately coarse. A precise radius would need a geocoder
// and a distance API for a question a four-digit prefix already answers.

type Range = readonly [number, number]

/** The home patch — Westelijke Mijnstreek, minutes from the studio. */
const CORE: readonly Range[] = [
  [6100, 6199], // Stein, Urmond, Elsloo, Beek, Geleen, Sittard, Born
]

/** The wider catchment — still an ordinary drive. */
const REGION: readonly Range[] = [
  [6200, 6229], // Maastricht
  [6230, 6249], // Meerssen, Bunde, Berg en Terblijt
  [6260, 6299], // Heuvelland — Gulpen, Margraten, Vaals
  [6300, 6369], // Valkenburg, Voerendaal
  [6370, 6379], // Landgraaf
  [6400, 6449], // Heerlen, Hoensbroek, Brunssum
  [6460, 6469], // Kerkrade
]

export type AreaResult = "core" | "region" | "outside" | "invalid"

const inAny = (n: number, ranges: readonly Range[]) =>
  ranges.some(([from, to]) => n >= from && n <= to)

/**
 * Accepts anything a person actually types: "6171 GB", "6171gb", "6171".
 * Only the numeric part decides — letters are noise for this question.
 */
export function checkPostcode(input: string): AreaResult {
  const digits = input.trim().match(/^(\d{4})/)
  if (!digits) return "invalid"
  const n = Number(digits[1])
  if (inAny(n, CORE)) return "core"
  if (inAny(n, REGION)) return "region"
  return "outside"
}

export function isServed(result: AreaResult): boolean {
  return result === "core" || result === "region"
}

/**
 * What a visitor outside the area is told. Honest rather than
 * discouraging: the design work genuinely does travel.
 */
export const OUTSIDE_AREA_MESSAGE: L = {
  en: `That postcode is outside the area we drive to for seasonal work. Design and consultation travel further — tell us what you have in mind and we will say plainly whether we are the right studio for it.`,
  nl: `Die postcode ligt buiten het gebied waar we voor seizoenswerk naartoe rijden. Ontwerp en advies reizen verder — vertel wat je voor je ziet, dan zeggen we eerlijk of wij de juiste studio zijn.`,
}

/** Towns named on the page, so the claim is checkable rather than vague. */
export const SERVICE_AREA_TOWNS = [
  "Stein",
  "Elsloo",
  "Beek",
  "Geleen",
  "Sittard",
  "Maastricht",
  "Meerssen",
  "Valkenburg",
  "Heerlen",
  "Brunssum",
  "Kerkrade",
] as const

/** For JSON-LD: the real catchment, not "the Netherlands". */
export const SERVICE_AREA_REGION = `${BUSINESS.address.province}, ${BUSINESS.address.country}`
