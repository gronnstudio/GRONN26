// Cadeaubon (eigenaar, 21 okt 2026: "zet in de shop om te kopen ... vul bonnummer
// automatisch in, en vraag om aan wie en van wie"). Een tegoed in euro's voor elk
// werk van GRØNN Studio; betalen via Mollie, net als de borderpakketten.

export const BON_BEDRAGEN = [50, 100, 150, 250] as const
/** Ander bedrag (eigenaar, 21 okt 2026: "vrije keuze bedrag, invoer alleen cijfers"): hele euro's. */
export const BON_MIN = 25
export const BON_MAX = 2500
export const BON_JAREN = 2
/** Fysieke kaart in een luxe doosje, per post (eigenaar, 21 okt 2026): toeslag bovenop het tegoed. */
export const DOOSJE_PRIJS = 10

/** GR-2026-0007: jaar en volgnummer, zodat Nick een bon in één oogopslag terugvindt. */
export const bonNummer = (jaar: number, volgnummer: number) => `GR-${jaar}-${String(volgnummer).padStart(4, "0")}`

export const geldigTot = (datum: Date) => {
  const d = new Date(datum)
  d.setFullYear(d.getFullYear() + BON_JAREN)
  return d.toISOString().slice(0, 10)
}

export const datumLang = (iso: string) => new Date(`${iso}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
