import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

// De geheime sleutel van de agendalink (Google Agenda haalt hem zelf op, zonder inloggen).
// Afgeleid van AUTH_SECRET, dus geen nieuwe instelling in Vercel. Wie de link heeft, ziet de
// planning (voornaam + wat er gebeurt), geen adres, telefoon of e-mail.
export function agendaSleutel() {
  const geheim = process.env.AUTH_SECRET ?? ""
  if (geheim.length < 16) return ""
  return createHmac("sha256", geheim).update("gronn-agenda-v1").digest("hex").slice(0, 40)
}

export function klopt(gegeven: string) {
  const s = agendaSleutel()
  if (!s || gegeven.length !== s.length) return false
  return timingSafeEqual(Buffer.from(gegeven), Buffer.from(s))
}
