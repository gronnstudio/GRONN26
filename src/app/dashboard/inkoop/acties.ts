"use server"

import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"
import { leesInkoop, wijzigInkoop } from "@/lib/beheer/inkoop"
import { verwijderBestand } from "@/lib/crm/opslag"

// Alleen de eigenaar; de proxy houdt /dashboard al dicht, dit is de tweede deur.

export async function inkoopBetaald(id: string, betaald: boolean) {
  await eisEigenaar()
  await wijzigInkoop((r) => r.map((x) => (x.id === id ? { ...x, betaald } : x)))
  revalidatePath("/dashboard", "layout")
}

export async function inkoopWeg(id: string) {
  await eisEigenaar()
  const regel = (await leesInkoop()).find((x) => x.id === id)
  await wijzigInkoop((r) => r.filter((x) => x.id !== id))
  if (regel?.bestand) await verwijderBestand(`crm/inkoop/${regel.id}.${regel.bestand.ext}`)
  revalidatePath("/dashboard", "layout")
}
