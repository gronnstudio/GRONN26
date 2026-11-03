import { leesKlanten } from "@/lib/beheer/klanten"
import { leesStand } from "@/lib/beheer/stand"
import { klusdagen, zonderContact } from "@/lib/crm/agenda"
import { klopt } from "@/lib/crm/agenda-sleutel"
import { agendaBestand } from "@/lib/crm/project"

// Agendalink voor Google Agenda ("Andere agenda's → Via URL", Nick 2 nov 2026). Google haalt
// dit bestand zelf elke paar uur op, zodat de planning vanzelf meeloopt. Alleen met de geheime
// sleutel uit de URL; anders 404, zodat niemand ziet dat de route bestaat.
export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ sleutel: string }> }) {
  const { sleutel } = await params
  if (!klopt(sleutel.replace(/\.ics$/, ""))) return new Response("Niet gevonden", { status: 404 })
  const [klanten, stand] = await Promise.all([leesKlanten(), leesStand()])
  const items = [
    ...klusdagen(klanten).map((p) => ({ id: p.id, titel: zonderContact(p.wat), van: p.datum, tot: p.datum })),
    ...stand.planning.map((p) => ({ id: p.id, titel: zonderContact(p.wat), van: p.datum, tot: p.datum })),
  ]
  const ics = agendaBestand(items).replace("CALSCALE:GREGORIAN", "CALSCALE:GREGORIAN\r\nX-WR-CALNAME:GRØNN planning\r\nX-WR-TIMEZONE:Europe/Amsterdam")
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } })
}
