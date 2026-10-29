import type { Metadata } from "next"
import Link from "next/link"
import { Cijfer, Cijfers, Kop } from "@/components/crm/kop"
import { Pijplijn } from "@/components/beheer/pijplijn"
import { BRONNEN, KLANT_SOORTEN, geld, gewogen, isOpen, laatsteCalculatie, leesKlanten, opslagAan } from "@/lib/beheer/klanten"
import { toonEuro } from "@/lib/crm/geld"
import { euro } from "@/lib/format"
import { nieuweKlant } from "./acties"

// Klanten als pijplijn of als tabel, alleen voor desktop (eigenaar, 29 okt
// 2026: "maak de UI gewoon goed en enkel voor desktop!"). Een klus sleep je
// naar de volgende fase; de kaart opent de klant.
export const metadata: Metadata = { title: "Klanten" }
export const dynamic = "force-dynamic"

const veld = "crm-veld"
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const kortDatum = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })

export default async function Klanten({ searchParams }: { searchParams: Promise<{ weergave?: string; soort?: string; q?: string; nieuw?: string }> }) {
  const { weergave, soort, q, nieuw } = await searchParams
  const tabel = weergave === "tabel"
  const alle = await leesKlanten()
  const zoek = (q ?? "").trim().toLowerCase()
  const klanten = alle.filter(
    (k) =>
      (!soort || k.soort === soort) &&
      (!zoek || [k.naam, k.bedrijf, k.wat, k.plaats, k.email, k.telefoon, k.contact, ...k.tags].join(" ").toLowerCase().includes(zoek)),
  )
  const nu = vandaag()
  const kaarten = klanten.map((k) => {
    const g = geld(k)
    const calc = laatsteCalculatie(k)
    return {
      id: k.id,
      naam: k.naam,
      wat: k.wat,
      plaats: k.plaats,
      fase: k.fase,
      volgende: k.volgende,
      bedrag: g.offerte ?? (calc ? calc.v.totaal / 100 : undefined) ?? (g.gefactureerd || undefined),
      open: g.open,
      opvolgen: k.opvolgen,
      teLaat: !!k.opvolgen && k.opvolgen <= nu && isOpen(k.fase),
    }
  })
  const open = alle.reduce((t, k) => t + geld(k).open, 0)
  const lopend = alle.filter((k) => isOpen(k.fase) && k.fase !== "Aanvraag")
  const leads = alle.filter((k) => ["Aanvraag", "Opname", "Offerte"].includes(k.fase))
  const pijplijnGewogen = leads.reduce((t, k) => t + gewogen(k), 0)
  const opvolgen = alle.filter((k) => k.opvolgen && k.opvolgen <= nu && isOpen(k.fase))
  const basis = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ weergave, soort, q, ...extra }).filter(([, v]) => v) as [string, string][])
    return `/dashboard/klanten${p.size ? `?${p}` : ""}`
  }

  return (
    <>
      <Kop pad={[{ naam: "Werk" }, { naam: "Klanten" }]} titel="Klanten" sub={tabel ? "Alle contacten. Klik op een naam voor de klantkaart." : "Sleep een klus naar de volgende fase. Klik op een naam voor de klantkaart."}>
        <a href="#nieuw" className="crm-knop">+ Klant</a>
      </Kop>
      <main className="px-8 py-6">
        <Cijfers>
          <Cijfer label="Lopende klussen" waarde={String(lopend.length)} uitleg="voorbij de aanvraag, niet afgerond" />
          <Cijfer label="Leads, gewogen" waarde={toonEuro(pijplijnGewogen)} uitleg="waarde × kans die je invult" />
          <Cijfer label="Nog te ontvangen" waarde={euro(open)} let={open > 0} uitleg="facturen niet afgevinkt" href="/dashboard/geld" />
          <Cijfer label="Opvolgen" waarde={String(opvolgen.length)} let={opvolgen.length > 0} uitleg="vandaag of eerder" />
        </Cijfers>

        {opvolgen.length > 0 && (
          <section aria-label="Opvolgen" className="crm-let mt-6 p-4">
            <p className="crm-label m-0 !text-let">Opvolgen · vandaag of eerder</p>
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 text-[14px]">
              {opvolgen.map((k) => (
                <li key={k.id}>
                  <Link href={`/dashboard/klanten/${k.id}`} className="crm-link">{k.naam}</Link>
                  <span className="text-gedempt"> · {kortDatum(k.opvolgen)}{k.volgende ? ` · ${k.volgende}` : ""}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <form id="nieuw" action={nieuweKlant} className="crm-paneel mt-6 flex flex-wrap items-center gap-2 p-3">
          <span className="crm-label px-2">Nieuwe klant</span>
          <input name="naam" required autoFocus={!!nieuw} placeholder="Naam" aria-label="Naam" className={`${veld} w-[200px]`} />
          <input name="telefoon" placeholder="Telefoon" aria-label="Telefoon" className={`${veld} w-[140px]`} />
          <input name="email" type="email" placeholder="E-mail" aria-label="E-mail" className={`${veld} w-[190px]`} />
          <input name="wat" placeholder="Wat wil de klant?" aria-label="Wat" className={`${veld} w-[260px]`} />
          <input name="plaats" placeholder="Plaats" aria-label="Plaats" className={`${veld} w-[120px]`} />
          <select name="bron" aria-label="Bron" defaultValue="" className={veld}>
            <option value="" disabled>Hoe binnen?</option>
            {BRONNEN.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <button className="crm-knop">+ Klant</button>
          {!opslagAan() && <span className="text-[12px] text-let">Opslag staat uit: wijzigingen worden niet bewaard.</span>}
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Weergave" className="flex gap-1 rounded-full border border-lijn bg-vlak p-1 text-[13px] font-semibold">
            <Link href={basis({ weergave: undefined })} aria-current={!tabel ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${!tabel ? "bg-accent text-op-accent" : "text-gedempt hover:text-inkt"}`}>Pijplijn</Link>
            <Link href={basis({ weergave: "tabel" })} aria-current={tabel ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${tabel ? "bg-accent text-op-accent" : "text-gedempt hover:text-inkt"}`}>Tabel</Link>
          </nav>
          <form className="flex items-center gap-2" action="/dashboard/klanten">
            {tabel && <input type="hidden" name="weergave" value="tabel" />}
            <input name="q" defaultValue={q} placeholder="Zoek op naam, plaats, tag…" aria-label="Zoeken" className={`${veld} w-[260px]`} />
            <select name="soort" defaultValue={soort ?? ""} aria-label="Soort contact" className={veld}>
              <option value="">Alle soorten</option>
              {KLANT_SOORTEN.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="crm-knop-rand">Filter</button>
            {(q || soort) && <Link href={basis({ q: undefined, soort: undefined })} className="crm-knop-stil">Wissen</Link>}
          </form>
        </div>

        <div className="mt-6">
          {tabel ? (
            <table className="crm-tabel">
              <thead>
                <tr>
                  {["Naam", "Soort", "Fase", "Plaats", "Contact", "Bron", "Opvolgen", "Waarde", "Open"].map((h) => (
                    <th key={h} className={h === "Waarde" || h === "Open" ? "text-right" : ""}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {klanten.map((k) => {
                  const g = geld(k)
                  const calc = laatsteCalculatie(k)
                  return (
                    <tr key={k.id}>
                      <td>
                        <Link href={`/dashboard/klanten/${k.id}`} className="crm-link">{k.naam}</Link>
                        {k.wat && <span className="block max-w-[340px] truncate text-[12px] text-gedempt">{k.wat}</span>}
                      </td>
                      <td>{k.soort}</td>
                      <td><span className={`crm-badge ${k.fase === "Verloren" || k.fase === "Opgeleverd" ? "crm-badge-stil" : ""}`}>{k.fase}</span></td>
                      <td>{k.plaats}</td>
                      <td className="text-[13px]">{[k.telefoon, k.email].filter(Boolean).join(" · ") || k.contact}</td>
                      <td>{k.bron}</td>
                      <td className={`crm-cijfer text-[13px] ${k.opvolgen && k.opvolgen <= nu && isOpen(k.fase) ? "font-semibold text-let" : ""}`}>{k.opvolgen ? kortDatum(k.opvolgen) : ""}</td>
                      <td className="crm-cijfer text-right">{g.offerte ? euro(g.offerte) : calc ? toonEuro(calc.v.totaal) : k.waarde ? toonEuro(k.waarde) : ""}</td>
                      <td className={`crm-cijfer text-right ${g.open > 0 ? "text-let" : "text-gedempt"}`}>{g.open > 0 ? euro(g.open) : "—"}</td>
                    </tr>
                  )
                })}
                {!klanten.length && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gedempt">Geen klanten gevonden{zoek ? ` voor "${q}"` : ""}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <Pijplijn kaarten={kaarten} />
          )}
        </div>
      </main>
    </>
  )
}
