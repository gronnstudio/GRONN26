"use server"

import { revalidatePath } from "next/cache"
import { gebeurtenis, wijzigKlanten } from "@/lib/beheer/klanten"
import { leesOfferte, verlopen, wijzigOfferte } from "@/lib/crm/offerte"

// De klant zegt akkoord via de privélink. Wie de link heeft mag dit; meer kan
// de link niet: hij leest en wijzigt alleen deze ene offerte en zet bij de
// klant het stuk op akkoord.
export async function geefAkkoord(token: string, d: FormData) {
  const naam = String(d.get("naam") ?? "").trim().slice(0, 80)
  if (!naam || d.get("eens") !== "ja") return
  const nu = await leesOfferte(token)
  if (!nu || nu.status !== "open" || verlopen(nu)) return
  const o = await wijzigOfferte(token, (x) => (x.status === "open" ? { ...x, status: "akkoord", akkoord: { naam, op: new Date().toISOString() } } : x))
  if (!o || o.akkoord?.naam !== naam) return
  await wijzigKlanten((lijst) =>
    lijst.map((k) => {
      if (k.id !== o.klantId) return k
      const vroeg = ["Aanvraag", "Opname", "Offerte"].includes(k.fase)
      return {
        ...k,
        fase: vroeg ? "Akkoord" : k.fase,
        stukken: k.stukken.map((s) => (s.link === token ? { ...s, rond: true } : s)),
        activiteit: [gebeurtenis("Stuk", `Offerte ${o.nummer} akkoord via de link, door ${naam}`, "Formulier"), ...k.activiteit].slice(0, 500),
      }
    }),
  )
  revalidatePath(`/offerte/${token}`)
  revalidatePath("/dashboard", "layout")
}
