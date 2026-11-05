"use server"

import { revalidatePath } from "next/cache"
import { gebeurtenis, wijzigKlanten } from "@/lib/beheer/klanten"
import { eisEigenaar } from "@/lib/crm/toegang"

/** Een regel in de tijdlijn als Nick een document mailt. */
export async function meldGemaild(klantId: string, wat: string) {
  await eisEigenaar()
  const tekst = String(wat).slice(0, 120)
  if (!tekst) return
  await wijzigKlanten((lijst) => lijst.map((k) => (k.id === klantId ? { ...k, activiteit: [gebeurtenis("Stuk", `${tekst} gemaild`), ...k.activiteit].slice(0, 500) } : k)))
  revalidatePath(`/dashboard/klanten/${klantId}`)
}
