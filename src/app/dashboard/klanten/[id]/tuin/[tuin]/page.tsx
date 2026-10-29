import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CrmKop } from "@/components/beheer/crm-kop"
import { TuinFotos } from "@/components/beheer/tuin-fotos"
import { leesKlanten, sleutel } from "@/lib/beheer/klanten"
import { ALLE_VELDEN, DIENSTEN, INTAKE, ingevuld, oppervlakUit } from "@/lib/crm/intake"
import { toonDecimaal } from "@/lib/crm/geld"
import { bewaarOpname, fotoWeg, tuinWeg } from "../../../acties"

// De tuinopname (masterprompt CRM, module 04 en 05): één vaste vragenlijst per
// tuin, foto's per moment, en elke eerdere versie blijft bewaard. Werkt ook op
// een tablet bij de klant: gewone velden, geen slepen.
export const metadata: Metadata = {
  title: { absolute: "Tuinopname · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "w-full min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export default async function TuinOpname({ params }: { params: Promise<{ id: string; tuin: string }> }) {
  const { id, tuin: tuinId } = await params
  const k = (await leesKlanten()).find((x) => x.id === id)
  const t = k?.tuinen.find((x) => x.id === tuinId)
  if (!k || !t) notFound()
  const n = ingevuld(t.antwoorden)
  const opp = oppervlakUit(t.antwoorden)

  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      <CrmKop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam, href: `/dashboard/klanten/${k.id}?tab=tuinen` }, { naam: t.naam }]} actief="/dashboard/klanten" />
      <main className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-10 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form key={sleutel([t.naam, t.adres, t.antwoorden, t.diensten])} action={bewaarOpname.bind(null, k.id, t.id)} className="flex min-w-0 flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <label className="grid gap-1 text-[13px]">
              Naam
              <input name="naam" defaultValue={t.naam} className={`${veld} syne text-[22px]`} />
            </label>
            <label className="grid gap-1 text-[13px]">
              Adres van de tuin
              <input name="adres" defaultValue={t.adres} className={veld} />
            </label>
          </div>

          {INTAKE.map((g) => (
            <fieldset key={g.id} className="m-0 grid gap-4 border-0 border-t border-lijn p-0 pt-5 sm:grid-cols-3">
              <legend className={`${lbl} float-left mb-1 w-full opacity-60`}>{g.naam}</legend>
              {g.velden.map((v) => {
                const waarde = t.antwoorden[v.id] ?? ""
                const naam = `i_${v.id}`
                return (
                  <label key={v.id} className={`grid content-start gap-1 text-[13px] ${v.soort === "lang" ? "sm:col-span-3" : ""}`}>
                    <span>
                      {v.label}
                      {v.eenheid && <span className="opacity-60"> ({v.eenheid})</span>}
                    </span>
                    {v.soort === "keuze" ? (
                      <select name={naam} defaultValue={waarde} className={`${veld} bg-grond`}>
                        <option value="">—</option>
                        {v.opties?.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : v.soort === "lang" ? (
                      <textarea name={naam} defaultValue={waarde} rows={3} placeholder={v.hulp} className={`${veld} resize-y leading-[1.5]`} />
                    ) : (
                      <input name={naam} defaultValue={waarde} inputMode={v.soort === "getal" ? "decimal" : undefined} type={v.soort === "datum" ? "date" : "text"} placeholder={v.hulp} className={veld} />
                    )}
                  </label>
                )
              })}
            </fieldset>
          ))}

          <fieldset className="m-0 border-0 border-t border-lijn p-0 pt-5">
            <legend className={`${lbl} float-left mb-3 w-full opacity-60`}>Gewenste werkzaamheden</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {DIENSTEN.map((d) => (
                <label key={d} className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" name="dienst" value={d} defaultChecked={t.diensten.includes(d)} className="size-[18px] accent-[var(--oranje)]" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4">
            <button className="rounded-full bg-oranje px-6 py-3 text-[14px] font-semibold text-[#202020]">Opname bewaren</button>
            <button formAction={tuinWeg.bind(null, k.id, t.id)} className="text-[13px] opacity-50 hover:text-oranje-tekst hover:opacity-100">Tuin verwijderen</button>
          </div>
        </form>

        <aside className="flex flex-col gap-6 self-start">
          <section className="rounded-[18px] border border-lijn p-5">
            <p className={`${lbl} m-0 opacity-60`}>Stand van de opname</p>
            <p className="syne m-0 mt-1 text-[26px] tabular-nums">{n.gevuld} van {n.van}</p>
            <p className="m-0 text-[13px] opacity-70">vragen beantwoord{opp ? ` · ${toonDecimaal(opp, 3)} m²` : ""}</p>
            <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw?tuin=${t.id}`} className="mt-4 block rounded-full bg-oranje px-5 py-2.5 text-center text-[14px] font-semibold text-[#202020]">
              Calculatie met deze maten →
            </Link>
          </section>

          <TuinFotos klant={k.id} tuin={t.id} fotos={t.fotos} weg={fotoWeg.bind(null, k.id, t.id)} />

          {t.geschiedenis.length > 0 && (
            <section className="rounded-[18px] border border-lijn p-5">
              <p className={`${lbl} m-0 opacity-60`}>Eerdere versies</p>
              <ul className="m-0 mt-3 grid list-none gap-3 p-0 text-[13px]">
                {t.geschiedenis.map((o, i) => {
                  const anders = ALLE_VELDEN.filter((v) => (o.antwoorden[v.id] ?? "") !== ((i === 0 ? t.antwoorden : t.geschiedenis[i - 1].antwoorden)[v.id] ?? ""))
                  return (
                    <li key={i}>
                      <details>
                        <summary className="cursor-pointer font-semibold">
                          {datum(o.datum)} · {anders.length} {anders.length === 1 ? "veld" : "velden"} daarna veranderd
                        </summary>
                        <dl className="m-0 mt-2 grid gap-1">
                          {anders.map((v) => (
                            <div key={v.id}>
                              <dt className="opacity-60">{v.label}</dt>
                              <dd className="m-0">{o.antwoorden[v.id] || "—"}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </aside>
      </main>
    </div>
  )
}
