import "server-only"
import { BUSINESS } from "@/lib/business"

// Het postadres, alleen voor documenten die het wettelijk nodig hebben
// (factuur, offerte, werkbon) en die achter een privélink of login staan.
// Het staat in de Vercel-omgevingsvariabele FACTUUR_ADRES, bv.
// "Straat 1, 1234 AB Plaats", nooit in de (openbare) code. Zonder variabele
// staat er alleen de plaats.
export function postadres(): [string, string] {
  const v = process.env.FACTUUR_ADRES?.trim()
  if (!v) return [BUSINESS.address.area, ""]
  const i = v.indexOf(",")
  return i < 0 ? [v, ""] : [v.slice(0, i).trim(), v.slice(i + 1).trim()]
}
