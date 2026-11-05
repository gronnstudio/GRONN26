// De werkbon (idee uit Plancraft, "Regiebericht", 5 nov 2026): wat er op een
// dag bij de klant is gedaan, met de uren en het materiaal, en de handtekening
// van de klant ter plekke op de telefoon. Zo is meerwerk zwart op wit.

export type Werkbon = {
  token: string
  klantId: string
  nummer: string
  datum: string
  klant: string
  adres: string
  werk: string
  uren: number
  materiaal: string
  opmerking: string
  getekend?: { naam: string; op: string; beeld: string }
}

/** Wat op de klantkaart staat: genoeg om de lijst te tonen, zonder de handtekening zelf. */
export type WerkbonKort = Pick<Werkbon, "token" | "klantId" | "nummer" | "datum" | "werk"> & { getekend?: { naam: string; op: string } }

export const kort = (w: Werkbon): WerkbonKort => ({
  token: w.token,
  klantId: w.klantId,
  nummer: w.nummer,
  datum: w.datum,
  werk: w.werk.slice(0, 120),
  ...(w.getekend ? { getekend: { naam: w.getekend.naam, op: w.getekend.op } } : {}),
})

/** GR-W // 2026-1105-01: dezelfde vorm als offerte en factuur, volgnummer per dag. */
export function volgendWerkbonNummer(lijst: Pick<WerkbonKort, "nummer">[], datum: string) {
  const voor = `GR-W // ${datum.slice(0, 4)}-${datum.slice(5, 7)}${datum.slice(8, 10)}-`
  const hoogste = lijst.filter((w) => w.nummer.startsWith(voor)).reduce((m, w) => Math.max(m, Number(w.nummer.slice(voor.length)) || 0), 0)
  return `${voor}${String(hoogste + 1).padStart(2, "0")}`
}

export const MAX_HANDTEKENING = 300_000

/** Alleen een echte PNG als data-URL, niet te groot: anders null. */
export function schoneHandtekening(v: unknown): string | null {
  if (typeof v !== "string" || v.length > MAX_HANDTEKENING || !v.startsWith("data:image/png;base64,")) return null
  const b = Buffer.from(v.slice(22), "base64")
  const png = b.length > 100 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  return png ? `data:image/png;base64,${b.toString("base64")}` : null
}
