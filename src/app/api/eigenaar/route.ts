import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// Ben ik de ingelogde eigenaar? Alleen ja of nee, geen adres of andere
// gegevens. Het ontwikkelaarsmenu (dev-menu.tsx) vraagt dit, zodat bezoekers
// het niet zien (eigenaar, 12 nov 2026). Het gezag blijft het ondertekende
// koekje; het menu verandert alleen de weergave in de eigen browser.
export async function GET() {
  const eigenaar = await isEigenaar((await cookies()).get(KOEKJE)?.value)
  return NextResponse.json({ eigenaar }, { headers: { "Cache-Control": "private, no-store" } })
}
