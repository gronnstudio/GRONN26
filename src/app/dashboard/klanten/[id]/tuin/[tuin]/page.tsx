import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Kop } from "@/components/crm/kop"
import { TuinFotos } from "@/components/beheer/tuin-fotos"
import { leesKlanten, sleutel } from "@/lib/beheer/klanten"
import { ALLE_VELDEN, DIENSTEN, INTAKE, ingevuld, oppervlakUit } from "@/lib/crm/intake"
import { toonDecimaal } from "@/lib/crm/geld"
import { bewaarOpname, fotoWeg, tuinWeg } from "../../../acties"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { AdresVeld } from "@/components/adres-veld"
import { CHECKLIST, CHECKLIST_IDS } from "@/lib/crm/checklist"

// De tuinopname (masterprompt CRM, module 04 en 05): één vaste vragenlijst per
// tuin, foto's per moment, en elke eerdere versie blijft bewaard. Werkt ook op
// een tablet bij de klant: gewone velden, geen slepen.
export const metadata: Metadata = { title: "Tuinopname" }
export const dynamic = "force-dynamic"

const lbl = "crm-label"
const veld = "crm-veld"
const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export default async function TuinOpname({ params }: { params: Promise<{ id: string; tuin: string }> }) {
  const { id, tuin: tuinId } = await params
  const k = (await leesKlanten()).find((x) => x.id === id)
  const t = k?.tuinen.find((x) => x.id === tuinId)
  if (!k || !t) notFound()
  const n = ingevuld(t.antwoorden)
  const opp = oppervlakUit(t.antwoorden)

  return (
    <>
      <Kop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam, href: `/dashboard/klanten/${k.id}?tab=tuinen` }, { naam: t.naam }]} titel={`Opname · ${t.naam}`} sub="Eén vaste vragenlijst per tuin. Elke bewaarde versie blijft staan; foto's zijn privé." />
      <main className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_380px] gap-8 px-8 py-6">
        <form key={sleutel([t.naam, t.adres, t.antwoorden, t.diensten, t.checklist])} action={bewaarOpname.bind(null, k.id, t.id)} className="flex min-w-0 flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <label className="grid gap-1 text-[13px]">
              Naam
              <input name="naam" defaultValue={t.naam} className={`${veld} text-[16px] font-semibold`} />
            </label>
            <AdresVeld naam="adres" label="Adres van de tuin" waarde={t.adres} className={veld} />
          </div>

          {INTAKE.map((g) => (
            <fieldset key={g.id} className="m-0 grid gap-4 border-0 border-t border-lijn p-0 pt-5 sm:grid-cols-3">
              <legend className={`${lbl} float-left mb-1 w-full text-gedempt`}>{g.naam}</legend>
              {g.velden.map((v) => {
                const waarde = t.antwoorden[v.id] ?? ""
                const naam = `i_${v.id}`
                return (
                  <label key={v.id} className={`grid content-start gap-1 text-[13px] ${v.soort === "lang" ? "sm:col-span-3" : ""}`}>
                    <span>
                      {v.label}
                      {v.eenheid && <span className="text-gedempt"> ({v.eenheid})</span>}
                    </span>
                    {v.soort === "keuze" ? (
                      <select name={naam} defaultValue={waarde} className={`${veld}`}>
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
            <legend className={`${lbl} float-left mb-3 w-full text-gedempt`}>Gewenste werkzaamheden</legend>
            <div className="clear-left grid gap-2 sm:grid-cols-3">
              {DIENSTEN.map((d) => (
                <label key={d} className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" name="dienst" value={d} defaultChecked={t.diensten.includes(d)} className="size-[18px] accent-[var(--accent)]" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>

          <section aria-labelledby="checklist-kop" className="border-t border-lijn pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="checklist-kop" className={`${lbl} m-0 text-gedempt`}>Checklist bij de klant</h2>
              <span className="crm-cijfer text-[12px] text-gedempt">{t.checklist.length} van {CHECKLIST_IDS.size} nagelopen</span>
            </div>
            <p className="m-0 mt-1 text-[13px] text-gedempt">Vink af wat je hebt nagelopen. Wat je niet kunt invullen wordt een stelpost in de offerte.</p>
            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {CHECKLIST.map((g) => (
                <fieldset key={g.id} className="m-0 border-0 p-0">
                  <legend className="mb-2 p-0 text-[14px] font-semibold">{g.naam}</legend>
                  <div className="grid gap-1.5">
                    {g.punten.map((c) => (
                      <label key={c.id} className="flex items-start gap-2 text-[14px] leading-[1.4]">
                        <input type="checkbox" name="check" value={c.id} defaultChecked={t.checklist.includes(c.id)} className="mt-[2px] size-[18px] shrink-0 accent-[var(--accent)]" />
                        {c.tekst}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between gap-4">
            <BewaarKnop>Opname bewaren</BewaarKnop>
            <button formAction={tuinWeg.bind(null, k.id, t.id)} className="text-[13px] text-gedempt hover:text-accent-tekst hover:opacity-100">Tuin verwijderen</button>
          </div>
        </form>

        <aside className="flex flex-col gap-6 self-start">
          <section className="crm-paneel p-5">
            <p className={`${lbl} m-0`}>Stand van de opname</p>
            <p className="syne m-0 mt-1 text-[26px] tabular-nums">{n.gevuld} van {n.van}</p>
            <p className="m-0 text-[13px] text-gedempt">vragen beantwoord{opp ? ` · ${toonDecimaal(opp, 3)} m²` : ""}</p>
            <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw?tuin=${t.id}`} className="mt-4 block rounded-full bg-accent px-5 py-2.5 text-center text-[14px] font-semibold text-op-accent">
              Calculatie met deze maten →
            </Link>
          </section>

          <TuinFotos klant={k.id} tuin={t.id} fotos={t.fotos} weg={fotoWeg.bind(null, k.id, t.id)} />

          {t.geschiedenis.length > 0 && (
            <section className="crm-paneel p-5">
              <p className={`${lbl} m-0`}>Eerdere versies</p>
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
                              <dt className="text-gedempt">{v.label}</dt>
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
    </>
  )
}
