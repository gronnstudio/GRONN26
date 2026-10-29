import type { Metadata } from "next"
import Link from "next/link"
import { CrmKop } from "@/components/beheer/crm-kop"
import { Pijplijn } from "@/components/beheer/pijplijn"
import { BRONNEN, KLANT_SOORTEN, geld, gewogen, isOpen, laatsteCalculatie, leesKlanten, opslagAan } from "@/lib/beheer/klanten"
import { toonEuro } from "@/lib/crm/geld"
import { euro } from "@/lib/format"
import { nieuweKlant } from "./acties"

// Klanten als pijplijn of als tabel, alleen voor desktop (eigenaar, 29 okt
// 2026: "maak de UI gewoon goed en enkel voor desktop!"). Een klus sleep je
// naar de volgende fase; de kaart opent de klant.
export const metadata: Metadata = {
  title: { absolute: "Klanten · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const kortDatum = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })

export default async function Klanten({ searchParams }: { searchParams: Promise<{ weergave?: string; soort?: string; q?: string }> }) {
  const { weergave, soort, q } = await searchParams
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
    <div data-links className="min-h-svh min-w-[1200px] bg-grond text-inkt">
      <CrmKop pad={[{ naam: "Dashboard", href: "/dashboard" }, { naam: "Klanten" }]} actief="/dashboard/klanten" />
      <main className="px-8 py-8">
        <div className="flex items-end justify-between gap-8">
          <div>
            <h1 className="syne m-0 text-[48px] leading-[1.05]">Klanten</h1>
            <p className="m-0 mt-2 text-[14px] opacity-70">{tabel ? "Alle contacten. Klik op een naam voor de klantkaart." : "Sleep een klus naar de volgende fase. Klik op een naam voor de klantkaart."}</p>
          </div>
          <dl className="m-0 flex gap-10">
            {[
              [String(lopend.length), "lopende klussen"],
              [toonEuro(pijplijnGewogen), "leads, gewogen naar kans"],
              [euro(open), "nog te ontvangen"],
            ].map(([n, t]) => (
              <div key={t}>
                <dd className={`syne m-0 text-[26px] tabular-nums ${t === "nog te ontvangen" && open > 0 ? "text-oranje-tekst" : ""}`}>{n}</dd>
                <dt className={`${lbl} opacity-60`}>{t}</dt>
              </div>
            ))}
          </dl>
        </div>

        {opvolgen.length > 0 && (
          <section aria-label="Opvolgen" className="mt-6 rounded-[16px] border border-oranje/60 bg-oranje/10 p-4">
            <p className={`${lbl} m-0`}>Opvolgen · vandaag of eerder</p>
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 text-[14px]">
              {opvolgen.map((k) => (
                <li key={k.id}>
                  <Link href={`/dashboard/klanten/${k.id}`} className="font-semibold hover:text-oranje-tekst">{k.naam}</Link>
                  <span className="opacity-70"> · {kortDatum(k.opvolgen)}{k.volgende ? ` · ${k.volgende}` : ""}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <form action={nieuweKlant} className="mt-8 flex flex-wrap items-center gap-2">
          <input name="naam" required placeholder="Naam nieuwe klant" aria-label="Naam" className={`${veld} w-[220px]`} />
          <input name="telefoon" placeholder="Telefoon" aria-label="Telefoon" className={`${veld} w-[150px]`} />
          <input name="email" type="email" placeholder="E-mail" aria-label="E-mail" className={`${veld} w-[200px]`} />
          <input name="wat" placeholder="Wat wil de klant?" aria-label="Wat" className={`${veld} w-[280px]`} />
          <input name="plaats" placeholder="Plaats" aria-label="Plaats" className={`${veld} w-[130px]`} />
          <select name="bron" aria-label="Bron" defaultValue="" className={`${veld} bg-grond`}>
            <option value="" disabled>Hoe binnen?</option>
            {BRONNEN.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <button className="rounded-full bg-oranje px-5 py-2 text-[14px] font-semibold text-[#202020]">+ Klant</button>
          {!opslagAan() && <span className="text-[12px] text-oranje-tekst">Opslag staat uit: wijzigingen worden niet bewaard.</span>}
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Weergave" className="flex gap-1 rounded-full border border-lijn p-1 text-[13px] font-semibold">
            <Link href={basis({ weergave: undefined })} aria-current={!tabel ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${!tabel ? "bg-inkt text-grond" : "opacity-70"}`}>Pijplijn</Link>
            <Link href={basis({ weergave: "tabel" })} aria-current={tabel ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${tabel ? "bg-inkt text-grond" : "opacity-70"}`}>Tabel</Link>
          </nav>
          <form className="flex items-center gap-2" action="/dashboard/klanten">
            {tabel && <input type="hidden" name="weergave" value="tabel" />}
            <input name="q" defaultValue={q} placeholder="Zoek op naam, plaats, tag…" aria-label="Zoeken" className={`${veld} w-[260px]`} />
            <select name="soort" defaultValue={soort ?? ""} aria-label="Soort contact" className={`${veld} bg-grond`}>
              <option value="">Alle soorten</option>
              {KLANT_SOORTEN.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="rounded-full border border-lijn px-4 py-2 text-[13px] font-semibold hover:border-oranje">Filter</button>
            {(q || soort) && <Link href={basis({ q: undefined, soort: undefined })} className="text-[13px] opacity-70">Wissen</Link>}
          </form>
        </div>

        <div className="mt-6">
          {tabel ? (
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className={`${lbl} text-left opacity-60`}>
                  {["Naam", "Soort", "Fase", "Plaats", "Contact", "Bron", "Opvolgen", "Waarde", "Open"].map((h) => (
                    <th key={h} className={`border-b border-lijn py-2 pr-4 font-semibold ${h === "Waarde" || h === "Open" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {klanten.map((k) => {
                  const g = geld(k)
                  const calc = laatsteCalculatie(k)
                  return (
                    <tr key={k.id} className="border-b border-lijn align-top">
                      <td className="py-2 pr-4">
                        <Link href={`/dashboard/klanten/${k.id}`} className="font-semibold hover:text-oranje-tekst">{k.naam}</Link>
                        {k.wat && <span className="block max-w-[340px] truncate text-[12px] opacity-60">{k.wat}</span>}
                      </td>
                      <td className="py-2 pr-4">{k.soort}</td>
                      <td className="py-2 pr-4">{k.fase}</td>
                      <td className="py-2 pr-4">{k.plaats}</td>
                      <td className="py-2 pr-4 text-[13px]">{[k.telefoon, k.email].filter(Boolean).join(" · ") || k.contact}</td>
                      <td className="py-2 pr-4">{k.bron}</td>
                      <td className={`py-2 pr-4 tabular-nums ${k.opvolgen && k.opvolgen <= nu && isOpen(k.fase) ? "font-semibold text-oranje-tekst" : ""}`}>{k.opvolgen ? kortDatum(k.opvolgen) : ""}</td>
                      <td className="py-2 pr-4 text-right font-mono tabular-nums">{g.offerte ? euro(g.offerte) : calc ? toonEuro(calc.v.totaal) : k.waarde ? toonEuro(k.waarde) : ""}</td>
                      <td className={`py-2 text-right font-mono tabular-nums ${g.open > 0 ? "text-oranje-tekst" : "opacity-50"}`}>{g.open > 0 ? euro(g.open) : "—"}</td>
                    </tr>
                  )
                })}
                {!klanten.length && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center opacity-60">Geen klanten gevonden{zoek ? ` voor "${q}"` : ""}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <Pijplijn kaarten={kaarten} />
          )}
        </div>
      </main>
    </div>
  )
}
