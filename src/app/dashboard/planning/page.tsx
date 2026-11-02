import type { Metadata } from "next"
import Link from "next/link"
import { Kop, Leeg } from "@/components/crm/kop"
import { isOpen, leesKlanten } from "@/lib/beheer/klanten"
import { leesStand } from "@/lib/beheer/stand"
import { plusDagen, vandaagNL } from "@/lib/crm/overzicht"
import { nieuwPlan, planWeg } from "../acties"
import { planDagen } from "@/lib/crm/project"
import { AgendaKnop } from "@/components/crm/agenda-knop"

// De planning: wat je zelf inplant (werk, levering, machinehuur, bezoek) en
// wanneer je een klant wilde opvolgen, samen per dag. Data in de tijdzone van
// Nederland. Bewust een lijst en geen agenda-pakket: koppelen met Google
// Agenda is er nog niet en staat hier dus ook niet als knop.
// Sinds 2 nov 2026 (Nick: "wanneer dit wordt opgeslagen per klant, moet de algemene planning ook
// veranderen") staan hier ook de dagen uit de planning van elke calculatie (laatste versie), met de
// voornaam van de klant, en bovenaan een grote maandkalender.
export const metadata: Metadata = { title: "Planning" }
export const dynamic = "force-dynamic"

const dagNaam = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })

const iso = (d: Date) => d.toISOString().slice(0, 10)
const KLEUREN = ["#2f7a4a", "#ff5b04", "#3b6fb6", "#a3487a", "#8a6d1f", "#2a8a8a"]

export default async function Planning({ searchParams }: { searchParams: Promise<{ nieuw?: string; maand?: string }> }) {
  const { nieuw, maand: m } = await searchParams
  const [stand, klanten] = await Promise.all([leesStand(), leesKlanten()])
  const nu = vandaagNL()
  const tot = plusDagen(nu, 60)
  type Punt = { id: string; datum: string; wat: string; soort: "Planning" | "Opvolgen" | "Klus"; href?: string; wie?: string }
  // Alle klusdagen uit de calculaties, elke dag apart (een fase van 2 dagen geeft twee dagen).
  const klus: (Punt & { kleur: string })[] = klanten.flatMap((k, ki) =>
    k.calculaties.flatMap((c) => {
      const v = c.versies.at(-1)
      if (!v?.planning?.length) return []
      const wie = k.naam.trim().split(/\s+/)[0] || k.naam
      return planDagen(v.planning, v.planStart ?? "").flatMap((d, i) => {
        const f = v.planning![i]
        const uit: (Punt & { kleur: string })[] = []
        for (let x = new Date(`${d.van}T12:00:00Z`); iso(x) <= d.tot; x.setUTCDate(x.getUTCDate() + 1)) {
          if (x.getUTCDay() === 0 || x.getUTCDay() === 6) continue
          uit.push({ id: `${f.id}-${iso(x)}`, datum: iso(x), wat: `${wie}: ${f.naam || "nog invullen"}`, wie, soort: "Klus", href: `/dashboard/klanten/${k.id}/calculatie/${c.id}`, kleur: KLEUREN[ki % KLEUREN.length] })
        }
        return uit
      })
    }),
  )
  const punten: Punt[] = [
    ...stand.planning.filter((p) => p.datum >= nu && p.datum <= tot).map((p) => ({ ...p, soort: "Planning" as const })),
    ...klanten
      .filter((k) => k.opvolgen && k.opvolgen <= tot && isOpen(k.fase))
      .map((k) => ({ id: k.id, datum: k.opvolgen < nu ? nu : k.opvolgen, wat: `${k.naam}${k.volgende ? `: ${k.volgende}` : ""}`, soort: "Opvolgen" as const, href: `/dashboard/klanten/${k.id}` })),
    ...klus.filter((p) => p.datum >= nu && p.datum <= tot),
  ].sort((a, b) => a.datum.localeCompare(b.datum) || a.soort.localeCompare(b.soort))
  const dagen = [...new Set(punten.map((p) => p.datum))]

  return (
    <>
      <Kop pad={[{ naam: "Werk" }, { naam: "Planning" }]} titel="Planning" sub="De komende twee maanden: wat je inplant, en wanneer je wie wilde opvolgen. Te laat opvolgen staat bij vandaag." />
      <main className="mx-auto grid max-w-[1440px] @min-[1060px]:grid-cols-[minmax(0,1fr)_380px] gap-8 px-8 py-6">
        <div className="grid gap-8">
          <Maandkalender maand={/^\d{4}-\d{2}$/.test(m ?? "") ? m! : nu.slice(0, 7)} nu={nu} klus={klus} eigen={stand.planning} />
          <AgendaKnop items={[...klus.map((p) => ({ id: p.id, titel: p.wat, van: p.datum, tot: p.datum })), ...stand.planning.map((p) => ({ id: p.id, titel: p.wat, van: p.datum, tot: p.datum }))]} />
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

// Grote maandkalender: per dag de voornaam van de klant en wat er gebeurt, plus je eigen planning.
function Maandkalender({ maand, nu, klus, eigen }: { maand: string; nu: string; klus: { datum: string; wie?: string; wat: string; kleur: string; href?: string }[]; eigen: { id: string; datum: string; wat: string }[] }) {
  const eerste = new Date(`${maand}-01T12:00:00Z`)
  const leeg = (eerste.getUTCDay() + 6) % 7
  const aantal = new Date(Date.UTC(eerste.getUTCFullYear(), eerste.getUTCMonth() + 1, 0)).getUTCDate()
  const schuif = (n: number) => { const d = new Date(eerste); d.setUTCMonth(d.getUTCMonth() + n); return `/dashboard/planning?maand=${iso(d).slice(0, 7)}` }
  return (
    <section aria-labelledby="maand-kop" className="crm-paneel p-4">
      <div className="flex items-center justify-between gap-3">
        <Link href={schuif(-1)} className="crm-knop-rand">Vorige</Link>
        <h2 id="maand-kop" className="m-0 text-[18px] font-semibold capitalize">{eerste.toLocaleDateString("nl-NL", { month: "long", year: "numeric", timeZone: "UTC" })}</h2>
        <Link href={schuif(1)} className="crm-knop-rand">Volgende</Link>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {["ma", "di", "wo", "do", "vr", "za", "zo"].map((d) => <span key={d} className="text-center text-[12px] text-gedempt">{d}</span>)}
        {Array.from({ length: leeg }, (_, i) => <span key={`l${i}`} />)}
        {Array.from({ length: aantal }, (_, i) => {
          const datum = `${maand}-${String(i + 1).padStart(2, "0")}`
          const hier = klus.filter((p) => p.datum === datum)
          const zelf = eigen.filter((p) => p.datum === datum)
          return (
            <div key={datum} className={`grid min-h-[96px] content-start gap-1 rounded-[10px] border p-1.5 text-[12px] ${datum === nu ? "border-accent" : "border-lijn"}`}>
              <span className={datum === nu ? "font-semibold text-accent-tekst" : "text-gedempt"}>{i + 1}</span>
              {hier.map((p, j) => (
                <Link key={j} href={p.href ?? "#"} title={p.wat} className="flex min-w-0 items-center gap-1 rounded-[6px] px-1 hover:bg-black/5">
                  <span className="size-[10px] shrink-0 rounded-full" style={{ background: p.kleur }} />
                  <span className="truncate font-semibold">{p.wie}</span>
                </Link>
              ))}
              {zelf.map((p) => <span key={p.id} title={p.wat} className="truncate px-1 text-gedempt">{p.wat}</span>)}
            </div>
          )
        })}
      </div>
    </section>
  )
}
