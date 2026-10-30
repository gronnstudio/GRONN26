import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Kop } from "@/components/crm/kop"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { leesKlanten } from "@/lib/beheer/klanten"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"
import { nacalculatie } from "@/lib/crm/project"
import { eisEigenaar } from "@/lib/crm/toegang"
import { projectActie, splitsAf } from "../../../project-acties"

// Een project in uitvoering: taken uit de planning afvinken, uren en meerwerk
// noteren, de opleverlijst bijhouden, en begroot naast werkelijk. Gemaakt voor
// de telefoon op locatie: één kolom, grote vinkjes, gewone formulieren.
export const metadata: Metadata = { title: "Project" }
export const dynamic = "force-dynamic"

const lbl = "crm-label"
const veld = "crm-veld"
const SECTIES = [
  { naam: "Materialen", bij: (s: string) => s !== "planten" && s !== "machine" },
  { naam: "Planten", bij: (s: string) => s === "planten" },
  { naam: "Machines", bij: (s: string) => s === "machine" },
]
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const uren = (m: number) => `${toonDecimaal(m, 3)} uur`

export default async function ProjectPagina({ params }: { params: Promise<{ id: string; pid: string }> }) {
  await eisEigenaar()
  const { id, pid } = await params
  const k = (await leesKlanten()).find((x) => x.id === id)
  const p = k?.projecten.find((x) => x.id === pid)
  if (!k || !p) notFound()
  const c = k.calculaties.find((x) => x.id === p.calculatieId)
  const n = nacalculatie(p)
  // De regels van de calculatieversie, in dezelfde drie secties als het rekenblad.
  const regels = (c?.versies.find((v) => v.nr === p.versie)?.regels ?? []).filter((r) => r.omschrijving.trim())
  const gebruikt = new Set(p.taken.map((t) => t.naam))
  // Projecten van vóór 30 okt erfden de oude standaardnaam "Calculatie"; dan de naam van de calculatie.
  const titel = p.titel === "Calculatie" && c ? c.titel : p.titel
  const actie = (soort: Parameters<typeof projectActie>[2]) => projectActie.bind(null, k.id, p.id, soort)
  const Vink = ({ soort, regel, aan, label }: { soort: "taak" | "punt-klaar" | "meerwerk-akkoord"; regel: string; aan: boolean; label: string }) => (
    <form action={actie(soort)}>
      <input type="hidden" name="regel" value={regel} />
      <button type="submit" aria-pressed={aan} aria-label={label} className={`grid size-[32px] place-items-center rounded-full border ${aan ? "border-accent bg-accent text-op-accent" : "border-lijn-sterk"}`}>
        {aan ? "✓" : ""}
      </button>
    </form>
  )
  const Weg = ({ regel }: { regel: string }) => (
    <form action={actie("weg")}>
      <input type="hidden" name="regel" value={regel} />
      <button type="submit" className="text-[12px] text-gedempt underline">Weg</button>
    </form>
  )

  return (
    <>
      <Kop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam, href: `/dashboard/klanten/${k.id}?tab=projecten` }, { naam: "Projecten", href: `/dashboard/klanten/${k.id}?tab=projecten` }, { naam: titel }]} titel={titel}>
        {c && (
          <Link href={`/dashboard/klanten/${k.id}/calculatie/${c.id}?v=${p.versie}`} className="crm-knop-rand">
            Calculatie v{p.versie}
          </Link>
        )}
      </Kop>
      <main className="mx-auto grid max-w-[1100px] gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-8">
          <section aria-labelledby="taken-kop">
            <p id="taken-kop" className={`${lbl} m-0`}>Taken · {n.takenKlaar} van {n.taken} klaar</p>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[15px]">
              {p.taken.map((t) => (
                <li key={t.id} className="flex items-center gap-3 border-b border-lijn pb-2">
                  <Vink soort="taak" regel={t.id} aan={t.klaar} label={`${t.naam} klaar`} />
                  <span className={t.klaar ? "text-gedempt line-through" : ""}>{t.naam}</span>
                  <span className="ml-auto crm-cijfer text-[13px] text-gedempt">{t.dagen.toLocaleString("nl-NL")} d</span>
                  <Weg regel={t.id} />
                </li>
              ))}
              {!p.taken.length && <li className="text-[14px] text-gedempt">Nog geen taken. Kies ze hieronder uit de calculatie, of zet er zelf een bij.</li>}
            </ul>
            {regels.length > 0 && (
              <details className="mt-3 text-[14px]" open={!p.taken.length}>
                <summary className="cursor-pointer crm-label">Taken uit de calculatie</summary>
                <form action={actie("uit-calculatie")} className="mt-2 grid gap-3">
                  {SECTIES.map((sec) => {
                    const hier = regels.filter((r) => sec.bij(r.soort))
                    return hier.length ? (
                      <fieldset key={sec.naam} className="m-0 grid gap-1.5 border-0 p-0">
                        <legend className="mb-1 text-[13px] font-semibold">{sec.naam}</legend>
                        {hier.map((r) => (
                          <label key={r.id} className="flex items-center gap-2">
                            <input type="checkbox" name="regel" value={r.id} disabled={gebruikt.has(r.omschrijving.trim())} className="size-[20px]" />
                            <span className={gebruikt.has(r.omschrijving.trim()) ? "text-gedempt line-through" : ""}>{r.omschrijving}</span>
                          </label>
                        ))}
                      </fieldset>
                    ) : null
                  })}
                  <div><BewaarKnop>Zet als taken</BewaarKnop></div>
                </form>
              </details>
            )}
            <form action={actie("taak-erbij")} className="mt-3 grid grid-cols-[minmax(0,1fr)_90px_auto] items-end gap-2 text-[13px]">
              <label className="grid gap-1">Taak<input name="naam" required placeholder="bijv. grondwerk" className={veld} /></label>
              <label className="grid gap-1">Dagen<input name="dagen" inputMode="decimal" defaultValue="1" className={veld} /></label>
              <BewaarKnop>Taak erbij</BewaarKnop>
            </form>
          </section>

          {p.taken.length > 1 && (
            <details className="text-[14px]">
              <summary className="cursor-pointer crm-label">In delen uitvoeren</summary>
              <form action={splitsAf.bind(null, k.id, p.id)} className="mt-3 grid gap-2">
                <p className="m-0 text-[13px] text-gedempt">Vink de taken aan die later komen. Die worden een eigen project; de begroting verdeelt naar werkdagen.</p>
                {p.taken.map((t) => (
                  <label key={t.id} className="flex items-center gap-2">
                    <input type="checkbox" name="taak" value={t.id} className="size-[20px]" /> {t.naam}
                  </label>
                ))}
                <label className="grid gap-1 text-[13px]">Wanneer<input name="wanneer" placeholder="bijv. maart 2027" className={veld} /></label>
                <BewaarKnop>Maak er een apart deel van</BewaarKnop>
              </form>
            </details>
          )}

          <section aria-labelledby="uren-kop">
            <p id="uren-kop" className={`${lbl} m-0`}>Uren · {uren(n.urenWerkelijk)}</p>
            <form action={actie("uren")} className="mt-3 grid grid-cols-[130px_90px_minmax(0,1fr)_auto] items-end gap-2 text-[13px] max-sm:grid-cols-2">
              <label className="grid gap-1">Datum<input type="date" name="datum" defaultValue={vandaag()} className={veld} /></label>
              <label className="grid gap-1">Uren<input name="uren" inputMode="decimal" required className={veld} /></label>
              <label className="grid gap-1">Wat<input name="wat" className={veld} /></label>
              <BewaarKnop>Uren erbij</BewaarKnop>
            </form>
            <ul className="m-0 mt-3 grid list-none gap-1 p-0 text-[14px]">
              {p.uren.map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <span className="crm-cijfer w-[90px]">{u.datum}</span>
                  <span className="crm-cijfer w-[70px]">{uren(u.uren)}</span>
                  <span className="min-w-0 flex-1 truncate">{u.wat}</span>
                  <Weg regel={u.id} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="meerwerk-kop">
            <p id="meerwerk-kop" className={`${lbl} m-0`}>Meerwerk · excl. btw</p>
            <form action={actie("meerwerk")} className="mt-3 grid grid-cols-[minmax(0,1fr)_120px_auto] items-end gap-2 text-[13px] max-sm:grid-cols-2">
              <label className="grid gap-1">Omschrijving<input name="omschrijving" required className={veld} /></label>
              <label className="grid gap-1">Bedrag €<input name="bedrag" inputMode="decimal" className={veld} /></label>
              <BewaarKnop>Meerwerk erbij</BewaarKnop>
            </form>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[14px]">
              {p.meerwerk.map((m) => (
                <li key={m.id} className="flex items-center gap-3 border-b border-lijn pb-2">
                  <Vink soort="meerwerk-akkoord" regel={m.id} aan={m.akkoord} label={`Klant akkoord met ${m.omschrijving}`} />
                  <span className="min-w-0 flex-1">{m.omschrijving}{!m.akkoord && <span className="text-gedempt"> · nog geen akkoord</span>}</span>
                  <span className="crm-cijfer">{toonEuro(m.bedrag)}</span>
                  <Weg regel={m.id} />
                </li>
              ))}
            </ul>
            <p className="m-0 mt-2 text-[12px] text-gedempt">Het vinkje betekent: de klant heeft akkoord gegeven. Zet het pas als dat zo is, liefst op papier of per app.</p>
          </section>

          <section aria-labelledby="oplever-kop">
            <p id="oplever-kop" className={`${lbl} m-0`}>Opleverlijst · {n.puntenOpen} open</p>
            <form action={actie("punt")} className="mt-3 flex items-end gap-2 text-[13px]">
              <label className="grid flex-1 gap-1">Punt<input name="tekst" required placeholder="bijv. voegen nalopen bij de schuur" className={veld} /></label>
              <BewaarKnop>Punt erbij</BewaarKnop>
            </form>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[15px]">
              {p.oplevering.map((x) => (
                <li key={x.id} className="flex items-center gap-3 border-b border-lijn pb-2">
                  <Vink soort="punt-klaar" regel={x.id} aan={x.klaar} label={`${x.tekst} klaar`} />
                  <span className={`min-w-0 flex-1 ${x.klaar ? "text-gedempt line-through" : ""}`}>{x.tekst}</span>
                  <Weg regel={x.id} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="crm-paneel flex flex-col gap-3 self-start p-5 text-[14px] lg:sticky lg:top-6" aria-labelledby="na-kop">
          <p id="na-kop" className={`${lbl} m-0`}>Begroot tegenover werkelijk</p>
          <dl className="m-0 grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2">
            <dt />
            <dd className="m-0 text-[12px] text-gedempt">Begroot</dd>
            <dd className="m-0 text-[12px] text-gedempt">Werkelijk</dd>
            <dt>Uren</dt>
            <dd className="m-0 crm-cijfer">{toonDecimaal(n.urenBegroot, 3)}</dd>
            <dd className={`m-0 crm-cijfer ${n.urenWerkelijk > n.urenBegroot && n.urenBegroot ? "text-let" : ""}`}>{toonDecimaal(n.urenWerkelijk, 3)}</dd>
            <dt>Overhouden per uur</dt>
            <dd className="m-0 crm-cijfer">{n.perUurBegroot !== null ? toonEuro(n.perUurBegroot) : "—"}</dd>
            <dd className="m-0 crm-cijfer">{n.perUurWerkelijk !== null ? toonEuro(n.perUurWerkelijk) : "—"}</dd>
            <dt>Werkdagen</dt>
            <dd className="m-0 crm-cijfer">{n.dagenBegroot.toLocaleString("nl-NL")}</dd>
            <dd className="m-0 crm-cijfer">{toonDecimaal(Math.round(n.urenWerkelijk / 8), 3)}</dd>
          </dl>
          <p className="m-0">Meerwerk met akkoord: <span className="crm-cijfer">{toonEuro(n.meerwerkAkkoord)}</span>{n.meerwerkOpen > 0 && <> · zonder akkoord: <span className="crm-cijfer">{toonEuro(n.meerwerkOpen)}</span></>}</p>
          <p className="m-0 text-[12px] text-gedempt">Werkdagen werkelijk = uren ÷ 8. Overhouden per uur = winst uit de calculatie ÷ uren, zonder meerwerk.</p>
          {p.opgeleverd && <p className="m-0 font-semibold">Opgeleverd op {p.opgeleverd}</p>}
          <form action={actie("opgeleverd")}>
            <BewaarKnop className={p.opgeleverd ? "crm-knop-rand" : "crm-knop"}>{p.opgeleverd ? "Terugzetten naar uitvoering" : "Markeer als opgeleverd"}</BewaarKnop>
          </form>
        </aside>
      </main>
    </>
  )
}
