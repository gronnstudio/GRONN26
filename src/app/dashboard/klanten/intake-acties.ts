"use server"

import { eisEigenaar } from "@/lib/crm/toegang"
import { gebeurtenis, wijzigKlanten, type Tuin } from "@/lib/beheer/klanten"
import { leesVragenlijst } from "@/lib/beheer/vragenlijst"
import { INTAKE_NAAM, INTAKE_SOORTEN, ZONE_SOORTEN, schoonAntwoord, vraagMap, type IntakeSoort, type Zone } from "@/lib/crm/vragenlijst"

// Tussentijds opslaan van de intake (docs/architecture/intake.md §4). De
// browser stuurt alleen wat er veranderde; hier wordt elk stuk gecontroleerd
// tegen de vragenlijst en in de tuin gezet. Geen revalidatePath: de pagina
// houdt zijn eigen stand, en een verversing midden in het typen zou die
// overschrijven.

export type IntakeWijziging = {
  antwoorden?: Record<string, string>
  notities?: Record<string, string>
  aandacht?: Record<string, boolean>
  diensten?: string[]
  soort?: IntakeSoort
  zones?: Zone[]
}

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

export async function bewaarIntake(klantId: string, tuinId: string, w: IntakeWijziging): Promise<{ ok: true; afgewezen: string[] } | { ok: false; fout: string }> {
  await eisEigenaar()
  const lijst = await leesVragenlijst()
  const vragen = vraagMap(lijst)
  let gevonden = false
  // Antwoorden die niet (meer) passen, bv. een keuzeoptie die intussen uit de vragenlijst ging terwijl
  // de intake offline was. Die worden niet stil overgeslagen: de browser meldt ze.
  const afgewezen = new Set<string>()

  await wijzigKlanten((klanten) =>
    klanten.map((k) => {
      if (k.id !== klantId) return k
      let log: string | null = null
      const tuinen = k.tuinen.map((oud): Tuin => {
        if (oud.id !== tuinId) return oud
        gevonden = true
        const t: Tuin = { ...oud, antwoorden: { ...oud.antwoorden }, vragen: { ...oud.vragen }, notities: { ...oud.notities }, aandacht: [...oud.aandacht] }

        for (const [id, ruw] of Object.entries(w.antwoorden ?? {})) {
          const v = vragen.get(id)
          const waarde = v ? schoonAntwoord(v, ruw) : null
          if (!v || waarde === null) {
            afgewezen.add(v?.tekst ?? id)
            continue
          }
          if (waarde) {
            t.antwoorden[id] = waarde
            t.vragen[id] = v.tekst
          } else {
            delete t.antwoorden[id]
            delete t.vragen[id]
          }
        }
        for (const [id, ruw] of Object.entries(w.notities ?? {})) {
          if (!vragen.has(id)) continue
          const n = String(ruw ?? "").trim().slice(0, 2000)
          if (n) t.notities[id] = n
          else delete t.notities[id]
        }
        for (const [id, aan] of Object.entries(w.aandacht ?? {})) {
          if (!vragen.has(id)) continue
          t.aandacht = aan ? [...new Set([...t.aandacht, id])] : t.aandacht.filter((x) => x !== id)
        }
        // Een werkzaamheid die al gekozen was blijft staan, ook als ze later uit de lijst ging; alleen nieuwe worden gecontroleerd.
        if (Array.isArray(w.diensten)) t.diensten = [...new Set(w.diensten.map(String))].filter((x) => lijst.diensten.includes(x) || oud.diensten.includes(x)).slice(0, 40)
        if (w.soort && (INTAKE_SOORTEN as readonly string[]).includes(w.soort) && w.soort !== oud.soort) {
          t.soort = w.soort
          log = `${INTAKE_NAAM[w.soort].naam} begonnen voor "${oud.naam}"`
        }
        if (Array.isArray(w.zones))
          t.zones = w.zones.slice(0, 30).filter((z) => z && typeof z === "object").map((z) => ({
            id: String(z.id ?? "").slice(0, 64) || crypto.randomUUID(),
            naam: String(z.naam ?? "").trim().slice(0, 60) || "Zone",
            soort: (ZONE_SOORTEN as readonly string[]).includes(z.soort) ? z.soort : "Overig",
            lengte: String(z.lengte ?? "").trim().slice(0, 12),
            breedte: String(z.breedte ?? "").trim().slice(0, 12),
            oppervlak: String(z.oppervlak ?? "").trim().slice(0, 12),
            diepte: String(z.diepte ?? "").trim().slice(0, 12),
            notitie: String(z.notitie ?? "").trim().slice(0, 1000),
          }))

        const veranderd = JSON.stringify([oud.antwoorden, oud.diensten]) !== JSON.stringify([t.antwoorden, t.diensten])
        const nieuweDag = oud.bijgewerkt !== vandaag()
        // Eén versie per dag in de geschiedenis: tussentijds opslaan maakt anders van elke letter een versie.
        if (veranderd && nieuweDag && Object.keys(oud.antwoorden).length)
          t.geschiedenis = [{ datum: oud.bijgewerkt, antwoorden: oud.antwoorden, diensten: oud.diensten, vragen: oud.vragen }, ...oud.geschiedenis].slice(0, 50)
        if (veranderd && nieuweDag && !log) log = `Opname "${oud.naam}" bijgewerkt`
        // Alleen een gewijzigd antwoord zet de datum vooruit; anders zou een soortwissel of notitie
        // eerst de dag "opgebruiken" en kreeg het eerste echte antwoord van vandaag geen vorige versie.
        if (veranderd) t.bijgewerkt = vandaag()
        return t
      })
      const nieuw = { ...k, tuinen }
      return log ? { ...nieuw, activiteit: [gebeurtenis("Opname", log), ...k.activiteit].slice(0, 500) } : nieuw
    }),
  )
  return gevonden ? { ok: true, afgewezen: [...afgewezen] } : { ok: false, fout: "Deze tuin bestaat niet meer." }
}

/**
 * Een voorstel van Claude bevestigen of afwijzen. Het antwoord zelf zet de
 * intake (via de gewone weg, met tussentijds opslaan); hier alleen de status.
 */
export async function zetBevinding(klantId: string, tuinId: string, id: string, status: "bevestigd" | "afgewezen" | "voorstel") {
  await eisEigenaar()
  if (!["bevestigd", "afgewezen", "voorstel"].includes(status)) return
  await wijzigKlanten((lijst) =>
    lijst.map((k) =>
      k.id !== klantId ? k : { ...k, tuinen: k.tuinen.map((t: Tuin) => (t.id !== tuinId ? t : { ...t, bevindingen: t.bevindingen.map((b) => (b.id === id ? { ...b, status } : b)) })) },
    ),
  )
}
