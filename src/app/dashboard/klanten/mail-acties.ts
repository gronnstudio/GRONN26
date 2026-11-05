"use server"

import { revalidatePath } from "next/cache"
import { gebeurtenis, wijzigKlanten } from "@/lib/beheer/klanten"
import { eisEigenaar } from "@/lib/crm/toegang"

/** Een regel in de tijdlijn als Nick de mail opent; of hij echt verstuurd is, ziet alleen zijn mailprogramma (Codex, PR #216). */
export async function meldGemaild(klantId: string, wat: string) {
  await eisEigenaar()
  const tekst = String(wat).slice(0, 120)
  if (!tekst) return
  await wijzigKlanten((lijst) => lijst.map((k) => (k.id === klantId ? { ...k, activiteit: [gebeurtenis("Stuk", `Mail met ${tekst} klaargezet`), ...k.activiteit].slice(0, 500) } : k)))
  revalidatePath(`/dashboard/klanten/${klantId}`)
}
