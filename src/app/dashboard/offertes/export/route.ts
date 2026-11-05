import { cookies } from "next/headers"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { leesKlanten } from "@/lib/beheer/klanten"
import { vandaagNL } from "@/lib/crm/overzicht"
import { documentRijen, filterRijen, naarCsv } from "@/lib/crm/documenten"

// Offertes als CSV, met dezelfde filters als de lijst (?q=, ?status=, ?jaar=). Alleen voor de eigenaar.
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) return new Response("Niet ingelogd", { status: 401 })
  const p = new URL(req.url).searchParams
  const rijen = filterRijen(documentRijen(await leesKlanten(), "Offerte", vandaagNL()), { q: p.get("q") ?? undefined, status: p.get("status") ?? undefined, jaar: p.get("jaar") ?? undefined })
  return new Response(naarCsv(rijen), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="offertes-gronn.csv"',
      "cache-control": "private, no-store",
    },
  })
}
