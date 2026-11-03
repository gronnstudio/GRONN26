// Het seizoenszaadje in de voet: één regel per maand.
//
// Algemene tuinkalender, geen advies op maat. Korte, bekende
// vuistregels (≤ ~40 tekens); niets over resultaten, prijzen of projecten
// van GRØNN. Een maand op `null` zetten laat de voet leeg.
export type Maand = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export const SEIZOEN: Record<Maand, { nl: string; en: string } | null> = {
  1: { nl: "jan · snoeien bij vorstvrij weer", en: "jan · prune on frost-free days" },
  2: { nl: "feb · nestkastjes ophangen", en: "feb · put up nest boxes" },
  3: { nl: "mrt · vijverpomp weer aan", en: "mar · pond pump back on" },
  4: { nl: "apr · gazon verticuteren", en: "apr · scarify the lawn" },
  5: { nl: "mei · na de ijsheiligen planten", en: "may · plant out after the frosts" },
  6: { nl: "jun · draadalg uit de vijver halen", en: "jun · fish blanket weed from the pond" },
  7: { nl: "jul · water geven in de ochtend", en: "jul · water in the morning" },
  8: { nl: "aug · vijver bijvullen met regenwater", en: "aug · top up the pond with rainwater" },
  9: { nl: "sep · bollen planten", en: "sep · plant bulbs" },
  10: { nl: "okt · blad laten liggen in de border", en: "oct · leave leaves in the border" },
  11: { nl: "nov · bladnet over de vijver", en: "nov · leaf net over the pond" },
  12: { nl: "dec · vogels bijvoeren", en: "dec · feed the birds" },
}
