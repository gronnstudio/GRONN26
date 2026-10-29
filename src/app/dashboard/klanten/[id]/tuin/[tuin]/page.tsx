import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Kop } from "@/components/crm/kop"
import { Intake } from "@/components/crm/intake"
import { TuinFotos } from "@/components/beheer/tuin-fotos"
import { leesKlanten } from "@/lib/beheer/klanten"
import { leesVragenlijst } from "@/lib/beheer/vragenlijst"
import { oppervlakUit, telling, vraagMap, vragenVoor } from "@/lib/crm/vragenlijst"
import { toonDecimaal } from "@/lib/crm/geld"
import { bewaarTuinKop, fotoWeg, tuinWeg } from "../../../acties"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { AdresVeld } from "@/components/adres-veld"

// De intake per tuin (docs/architecture/intake.md): de vragenlijst uit
// /dashboard/vragenlijst, eerst voor de telefoon, tussentijds bewaard. Foto's
// per moment, en per dag blijft een eerdere versie van de antwoorden staan.
export const metadata: Metadata = { title: "Tuinopname" }
export const dynamic = "force-dynamic"

const lbl = "crm-label"
const veld = "crm-veld"
const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export default async function TuinOpname({ params }: { params: Promise<{ id: string; tuin: string }> }) {
  const { id, tuin: tuinId } = await params
  const [klanten, lijst] = await Promise.all([leesKlanten(), leesVragenlijst()])
  const k = klanten.find((x) => x.id === id)
  const t = k?.tuinen.find((x) => x.id === tuinId)
  if (!k || !t) notFound()
  const n = telling(lijst, t)
  const opp = oppervlakUit(t.antwoorden)
  const vragen = vraagMap(lijst)
  const naam = (vid: string) => vragen.get(vid)?.tekst ?? t.vragen[vid] ?? vid
  // Antwoorden die de intake nu niet toont: vervallen vragen, vervolgvragen van een werkzaamheid die
  // niet meer gekozen is, en vinkjes van de oude checklist. Zo blijft elk antwoord terug te lezen.
  const getoond = new Set(vragenVoor(lijst, t, "uitgebreid").flatMap((c) => c.vragen.map((v) => v.id)))
  const los = Object.keys(t.antwoorden).filter((vid) => !getoond.has(vid))

  return (
    <>
      <Kop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam, href: `/dashboard/klanten/${k.id}?tab=tuinen` }, { naam: t.naam }]} titel={`Opname · ${t.naam}`} sub="Elke wijziging wordt meteen bewaard, ook zonder bereik. Foto's zijn privé." />
      <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-6 sm:px-8 @min-[1060px]:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <form key={`${t.naam}|${t.adres}`} action={bewaarTuinKop.bind(null, k.id, t.id)} className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
            <label className="grid gap-1 text-[13px]">
              Naam
              <input name="naam" defaultValue={t.naam} className={`${veld} min-h-[44px] text-[16px] font-semibold`} />
            </label>
            <AdresVeld naam="adres" label="Adres van de tuin" waarde={t.adres} className={`${veld} min-h-[44px] text-[16px]`} />
            <BewaarKnop className="crm-knop-rand min-h-[44px]">Bewaren</BewaarKnop>
          </form>

          <Intake klant={k.id} tuin={t.id} lijst={lijst} begin={{ antwoorden: t.antwoorden, notities: t.notities, aandacht: t.aandacht, diensten: t.diensten, soort: t.soort, zones: t.zones }} />
        </div>

        <aside className="flex flex-col gap-6 self-start">
          <section className="crm-paneel p-5">
            <p className={`${lbl} m-0`}>Stand van de opname</p>
            <p className="syne m-0 mt-1 text-[26px] tabular-nums">{n.gevuld} van {n.van}</p>
            <p className="m-0 text-[13px] text-gedempt">vragen beantwoord bij het laden{opp ? ` · ${toonDecimaal(opp, 3)} m²` : ""}</p>
            <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw?tuin=${t.id}`} className="mt-4 block rounded-full bg-accent px-5 py-2.5 text-center text-[14px] font-semibold text-op-accent">
              Calculatie met deze maten →
            </Link>
            <Link href="/dashboard/vragenlijst" className="mt-3 block text-center text-[13px] text-gedempt hover:text-accent-tekst">
              Vragenlijst aanpassen
            </Link>
          </section>

          {los.length > 0 && (
            <section className="crm-paneel p-5">
              <p className={`${lbl} m-0`}>Niet in de huidige vragen</p>
              <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-[13px]">
                {los.map((vid) => (
                  <li key={vid}>
                    {naam(vid)}: <strong>{t.antwoorden[vid]}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <TuinFotos klant={k.id} tuin={t.id} fotos={t.fotos} weg={fotoWeg.bind(null, k.id, t.id)} />

          {t.geschiedenis.length > 0 && (
            <section className="crm-paneel p-5">
              <p className={`${lbl} m-0`}>Eerdere versies</p>
              <ul className="m-0 mt-3 grid list-none gap-3 p-0 text-[13px]">
                {t.geschiedenis.map((o, i) => {
                  const daarna = i === 0 ? t.antwoorden : t.geschiedenis[i - 1].antwoorden
                  const anders = [...new Set([...Object.keys(o.antwoorden), ...Object.keys(daarna)])].filter((vid) => (o.antwoorden[vid] ?? "") !== (daarna[vid] ?? ""))
                  return (
                    <li key={i}>
                      <details>
                        <summary className="cursor-pointer font-semibold">
                          {datum(o.datum)} · {anders.length} {anders.length === 1 ? "antwoord" : "antwoorden"} daarna veranderd
                        </summary>
                        <dl className="m-0 mt-2 grid gap-1">
                          {anders.map((vid) => (
                            <div key={vid}>
                              <dt className="text-gedempt">{naam(vid)}</dt>
                              <dd className="m-0">{o.antwoorden[vid] || "—"}</dd>
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

          <form action={tuinWeg.bind(null, k.id, t.id)}>
            <button className="text-[13px] text-gedempt hover:text-accent-tekst">Tuin verwijderen</button>
          </form>
        </aside>
      </main>
    </>
  )
}
