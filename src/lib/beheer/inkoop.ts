import "server-only"
import { leesJson, wijzigJson } from "@/lib/crm/opslag"
import { schoonInkoop, type Inkoop } from "@/lib/crm/inkoop"

// Opslag van de inkoopfacturen: één JSON naast de uren, bijlagen apart onder
// crm/inkoop/ (privé, alleen via /api/crm/inkoop achter de inlog).
const PAD = "dashboard/inkoop.json"
type Doc = { regels: Inkoop[] }
const leeg = (): Doc => ({ regels: [] })

export async function leesInkoop(): Promise<Inkoop[]> {
  const d = await leesJson<Partial<Doc>>(PAD, leeg)
  return (Array.isArray(d.regels) ? d.regels : []).flatMap((r) => schoonInkoop(r as Record<string, unknown>) ?? [])
}

export async function wijzigInkoop(f: (regels: Inkoop[]) => Inkoop[]) {
  await wijzigJson<Doc>(PAD, leeg, (d) => {
    const regels = f((Array.isArray(d.regels) ? d.regels : []).flatMap((r) => schoonInkoop(r as Record<string, unknown>) ?? []))
    regels.sort((a, b) => b.datum.localeCompare(a.datum))
    return { regels }
  })
}
