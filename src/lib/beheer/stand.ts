import { get, put } from "@vercel/blob"

// Wat het dashboard onthoudt (eigenaar, 10 okt 2026: gepost aanvinken,
// aanvragen op één plek, planning per week). Eén JSON-bestand in een privé
// Vercel Blob-store (gronn26-dashboard); zonder BLOB_READ_WRITE_TOKEN is alles leeg.

export type Aanvraag = {
  id: string
  datum: string
  naam: string
  contact: string
  wat: string
  bron: "Formulier" | "WhatsApp" | "Telefoon" | "Anders"
  klaar?: boolean
  /** id van de vijverfoto in Blob (vijverfotos/<id>.jpg), als de bezoeker er een stuurde */
  foto?: string
}
export type Plan = { id: string; datum: string; wat: string }
/** Een borderpakket dat online is besteld en via Mollie betaald (src/lib/mollie.ts). */
export type Bestelling = {
  id: string
  datum: string
  pakket: string
  maat: number
  soort: "opgestuurd" | "aangeplant"
  bedrag: number
  naam: string
  email: string
  telefoon: string
  adres: string
  mollie?: string
  status: "open" | "betaald" | "mislukt"
  klaar?: boolean
}
/** Een cadeaubon die online is gekocht (src/app/tuinen/cadeaubon). */
export type Bon = {
  id: string
  nummer: string
  datum: string
  geldigTot: string
  bedrag: number
  voor: string
  van: string
  boodschap: string
  naam: string
  email: string
  mollie?: string
  status: "open" | "betaald" | "mislukt"
  ingewisseld?: boolean
}
export type Stand = { gepost: Record<string, string>; aanvragen: Aanvraag[]; planning: Plan[]; bestellingen: Bestelling[]; bonnen: Bon[] }

const PAD = "dashboard/stand.json"
const LEEG: Stand = { gepost: {}, aanvragen: [], planning: [], bestellingen: [], bonnen: [] }
const DERTIG_DAGEN = 30 * 24 * 60 * 60 * 1000

export const opslagAan = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export async function leesStand(): Promise<Stand> {
  if (!opslagAan()) return LEEG
  try {
    const r = await get(PAD, { access: "private", useCache: false })
    if (!r?.stream) return LEEG
    const s = (await new Response(r.stream).json()) as Partial<Stand>
    return { ...LEEG, ...s }
  } catch {
    return LEEG
  }
}

export async function schrijfStand(s: Stand) {
  // Privacyverklaring: aanvragen bewaren we 30 dagen.
  const grens = Date.now() - DERTIG_DAGEN
  s.aanvragen = s.aanvragen.filter((a) => new Date(a.datum).getTime() > grens).slice(0, 200)
  // Bestellingen en bonnen zijn administratie (fiscale bewaarplicht): die blijven staan.
  s.planning = s.planning.sort((a, b) => a.datum.localeCompare(b.datum)).slice(-200)
  await put(PAD, JSON.stringify(s), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json" })
}

export const nieuweId = () => crypto.randomUUID()
