"use server"

import { revalidatePath } from "next/cache"
import { gebeurtenis, wijzigKlanten } from "@/lib/beheer/klanten"
import { tekenWerkbon } from "@/lib/beheer/werkbon"
import { schoneHandtekening } from "@/lib/crm/werkbon"

// De klant tekent de werkbon via de link (Nick geeft zijn telefoon). Wie de
// link heeft mag tekenen, één keer; daarna staat hij vast.
export async function teken(token: string, d: FormData) {
  const naam = String(d.get("naam") ?? "").trim().slice(0, 80)
  const beeld = schoneHandtekening(d.get("beeld"))
  if (!naam || !beeld || d.get("eens") !== "ja") return
  const w = await tekenWerkbon(token, { naam, op: new Date().toISOString(), beeld })
  if (!w) return
  await wijzigKlanten((lijst) => lijst.map((k) => (k.id === w.klantId ? { ...k, activiteit: [gebeurtenis("Stuk", `Werkbon ${w.nummer} getekend door ${naam}`, "Formulier"), ...k.activiteit].slice(0, 500) } : k)))
  revalidatePath(`/werkbon/${token}`)
  revalidatePath("/dashboard", "layout")
}
