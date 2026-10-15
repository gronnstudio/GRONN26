import { cookies } from "next/headers"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { RECONSTRUCTIE, leesUren, weekTotaal } from "@/lib/beheer/uren"

// CSV voor de boekhouder of de Belastingdienst: reconstructie per week en
// daarna elke geregistreerde regel. Puntkomma's, zodat Excel NL hem goed opent.
export const dynamic = "force-dynamic"

const cel = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

export async function GET() {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) return new Response("Niet ingelogd", { status: 401 })
  const regels = await leesUren()
  const rijen = [
    ["Datum", "Week", "Soort", "Klant of project", "Wat", "Uren", "Herkomst"],
    ...RECONSTRUCTIE.map((r) => [r.maandag, r.week, "Diverse", "", r.wat, weekTotaal(r), "Reconstructie"]),
    ...[...regels].reverse().map((r) => [r.datum, "", r.soort, r.klant, r.wat, String(r.uren).replace(".", ","), "Dagregistratie"]),
  ]
  return new Response("﻿" + rijen.map((r) => r.map(cel).join(";")).join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="urenregistratie-gronn-2026.csv"',
    },
  })
}
