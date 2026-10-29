import { cookies } from "next/headers"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { SOORTEN } from "@/lib/crm/calculatie"
import { toonDecimaal } from "@/lib/crm/geld"

// De catalogus als CSV (puntkomma's, Excel NL), met de huidige inkoop per eenheid.
export const dynamic = "force-dynamic"

const cel = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

export async function GET() {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) return new Response("Niet ingelogd", { status: 401 })
  const items = await leesCatalogus()
  const rijen = [
    ["Naam", "Soort", "Eenheid", "Inkoop excl. btw", "Opslag %", "Btw %", "Afval %", "Leverancier", "Artikelnummer", "Link", "Bijgewerkt", "Groep"],
    ...items.map((i) => [i.naam, SOORTEN[i.soort].naam, i.eenheid, toonDecimaal(i.inkoop, 2, 2), toonDecimaal(i.opslag, 2), toonDecimaal(i.btw, 2), toonDecimaal(i.afval, 2), i.leverancier, i.sku, i.link, i.bijgewerkt, i.groep ?? ""]),
  ]
  return new Response("﻿" + rijen.map((r) => r.map(cel).join(";")).join("\r\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="catalogus-gronn.csv"' },
  })
}
