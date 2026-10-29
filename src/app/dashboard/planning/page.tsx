import type { Metadata } from "next"
import Link from "next/link"
import { Kop, Leeg } from "@/components/crm/kop"
import { isOpen, leesKlanten } from "@/lib/beheer/klanten"
import { leesStand } from "@/lib/beheer/stand"
import { plusDagen, vandaagNL } from "@/lib/crm/overzicht"
import { nieuwPlan, planWeg } from "../acties"

// De planning: wat je zelf inplant (werk, levering, machinehuur, bezoek) en
// wanneer je een klant wilde opvolgen, samen per dag. Data in de tijdzone van
// Nederland. Bewust een lijst en geen agenda-pakket: koppelen met Google
// Agenda is er nog niet en staat hier dus ook niet als knop.
export const metadata: Metadata = { title: "Planning" }
export const dynamic = "force-dynamic"

const dagNaam = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })

export default async function Planning({ searchParams }: { searchParams: Promise<{ nieuw?: string }> }) {
  const { nieuw } = await searchParams
  const [stand, klanten] = await Promise.all([leesStand(), leesKlanten()])
  const nu = vandaagNL()
  const tot = plusDagen(nu, 60)
  type Punt = { id: string; datum: string; wat: string; soort: "Planning" | "Opvolgen"; href?: string }
  const punten: Punt[] = [
    ...stand.planning.filter((p) => p.datum >= nu && p.datum <= tot).map((p) => ({ ...p, soort: "Planning" as const })),
    ...klanten
      .filter((k) => k.opvolgen && k.opvolgen <= tot && isOpen(k.fase))
      .map((k) => ({ id: k.id, datum: k.opvolgen < nu ? nu : k.opvolgen, wat: `${k.naam}${k.volgende ? `: ${k.volgende}` : ""}`, soort: "Opvolgen" as const, href: `/dashboard/klanten/${k.id}` })),
  ].sort((a, b) => a.datum.localeCompare(b.datum) || a.soort.localeCompare(b.soort))
  const dagen = [...new Set(punten.map((p) => p.datum))]

  return (
    <>
      <Kop pad={[{ naam: "Werk" }, { naam: "Planning" }]} titel="Planning" sub="De komende twee maanden: wat je inplant, en wanneer je wie wilde opvolgen. Te laat opvolgen staat bij vandaag." />
      <main className="mx-auto grid max-w-[1440px] @min-[1060px]:grid-cols-[minmax(0,1fr)_380px] gap-8 px-8 py-6">
        <div>
          {dagen.length === 0 ? (
            <Leeg>Nog niets gepland. Zet rechts een klus, levering of bezoek in de planning.</Leeg>
          ) : (
            <ol className="m-0 grid list-none gap-6 p-0">
              {dagen.map((d) => (
                <li key={d}>
                  <h2 className={`m-0 mb-2 text-[14px] font-semibold first-letter:uppercase ${d === nu ? "text-accent-tekst" : ""}`}>
                    {d === nu ? "Vandaag · " : ""}
                    {dagNaam(d)}
                  </h2>
                  <ul className="crm-paneel m-0 list-none divide-y divide-lijn p-0">
                    {punten
                      .filter((p) => p.datum === d)
                      .map((p) => (
                        <li key={`${p.soort}-${p.id}`} className="flex items-center gap-4 px-4 py-2.5">
                          <span className={`crm-badge w-[84px] justify-center ${p.soort === "Opvolgen" ? "crm-badge-let" : ""}`}>{p.soort}</span>
                          {p.href ? (
                            <Link href={p.href} className="crm-link min-w-0 flex-1 truncate">{p.wat}</Link>
                          ) : (
                            <span className="min-w-0 flex-1">{p.wat}</span>
                          )}
                          {p.soort === "Planning" && (
                            <form action={planWeg.bind(null, p.id)}>
                              <button aria-label={`${p.wat} weghalen`} className="crm-knop-stil crm-knop-klein">Weghalen</button>
                            </form>
                          )}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>
        <form action={nieuwPlan} className="crm-paneel grid gap-3 self-start p-5">
          <h2 className="m-0 text-[15px] font-semibold">Inplannen</h2>
          <label className="grid gap-1 text-[13px]">
            Datum
            <input type="date" name="datum" required defaultValue={nu} className="crm-veld" />
          </label>
          <label className="grid gap-1 text-[13px]">
            Wat en waar
            <input name="wat" required autoFocus={!!nieuw} placeholder="bijv. Minigraver ophalen, Stein" className="crm-veld" />
          </label>
          <button className="crm-knop">Plannen</button>
        </form>
      </main>
    </>
  )
}
