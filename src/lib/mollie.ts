// Betalen voor borderpakketten (eigenaar, 21 okt 2026: "iDEAL/Wero of creditcard
// Visa Master"). Mollie's eigen betaalpagina: de bezoeker kiest daar zelf iDEAL,
// Wero of een kaart, naar wat aanstaat in het Mollie-dashboard. Geen SDK, twee
// fetch-aanroepen. Zonder MOLLIE_API_KEY is er geen online bestellen en blijft
// de knop naar Kennismaken staan.

const API = "https://api.mollie.com/v2/payments"

export const mollieAan = () => Boolean(process.env.MOLLIE_API_KEY)

export type MollieStatus = "open" | "pending" | "authorized" | "paid" | "canceled" | "expired" | "failed"
export type MollieBetaling = { id: string; status: MollieStatus; metadata?: { bestelling?: string }; _links: { checkout?: { href: string } } }

const kop = () => ({ Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`, "Content-Type": "application/json" })

export async function maakBetaling(b: { bedrag: number; omschrijving: string; terug: string; webhook?: string; bestelling: string }) {
  const r = await fetch(API, {
    method: "POST",
    headers: kop(),
    body: JSON.stringify({
      amount: { currency: "EUR", value: b.bedrag.toFixed(2) },
      description: b.omschrijving,
      redirectUrl: b.terug,
      webhookUrl: b.webhook,
      locale: "nl_NL",
      metadata: { bestelling: b.bestelling },
    }),
  })
  if (!r.ok) throw new Error(`Mollie ${r.status}: ${await r.text()}`)
  return (await r.json()) as MollieBetaling
}

export async function haalBetaling(id: string) {
  const r = await fetch(`${API}/${encodeURIComponent(id)}`, { headers: kop(), cache: "no-store" })
  if (!r.ok) return null
  return (await r.json()) as MollieBetaling
}

// Voor Dashboard › Geld: de laatste betalingen uit Mollie, om aan een klant of
// factuur te koppelen (Nick, 31 okt 2026). Alleen lezen; koppelen gebeurt in het CRM.
export type MollieRegel = { id: string; status: MollieStatus; bedrag: number; omschrijving: string; datum: string; betaald?: string; naam?: string }

export async function lijstBetalingen(aantal = 50): Promise<MollieRegel[] | null> {
  if (!mollieAan()) return null
  const r = await fetch(`${API}?limit=${aantal}`, { headers: kop(), cache: "no-store" })
  if (!r.ok) return null
  const j = (await r.json()) as { _embedded?: { payments?: { id: string; status: MollieStatus; amount: { value: string }; description: string; createdAt: string; paidAt?: string; details?: { consumerName?: string; cardHolder?: string } }[] } }
  return (j._embedded?.payments ?? []).map((b) => ({
    id: b.id,
    status: b.status,
    bedrag: Number(b.amount.value),
    omschrijving: b.description,
    datum: b.createdAt,
    betaald: b.paidAt,
    naam: b.details?.consumerName ?? b.details?.cardHolder,
  }))
}

export async function haalRegel(id: string) {
  const r = await fetch(`${API}/${encodeURIComponent(id)}`, { headers: kop(), cache: "no-store" })
  if (!r.ok) return null
  const b = (await r.json()) as { id: string; status: MollieStatus; amount: { value: string }; description: string; createdAt: string; paidAt?: string }
  return { id: b.id, status: b.status, bedrag: Number(b.amount.value), omschrijving: b.description, datum: b.createdAt, betaald: b.paidAt }
}
