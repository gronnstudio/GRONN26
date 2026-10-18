import type { Metadata } from "next"
import Link from "next/link"
import { DOEL, RECONSTRUCTIE, RECONSTRUCTIE_TOT, SOORTEN, leesUren, opslagAan, weekTotaal, weekVan, type Regel } from "@/lib/beheer/uren"
import { nieuweRegel, regelWeg } from "./acties"

// Urenregistratie voor het urencriterium (eigenaar, 15 okt 2026). Bovenaan waar
// je staat, daaronder één formulier per werkdag, en de reconstructie tot 15 okt.
export const metadata: Metadata = {
  title: { absolute: "Uren · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const dag = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
const uur = (n: number) => `${n.toLocaleString("nl-NL", { maximumFractionDigits: 2 })} uur`

export default async function Uren() {
  const alle = await leesUren()
  const nu = vandaag()
  const jaar = nu.slice(0, 4)
  const regels = alle.filter((r) => r.datum.startsWith(jaar))
  const basis = jaar === "2026" ? RECONSTRUCTIE.reduce((s, r) => s + weekTotaal(r), 0) : 0
  const geregistreerd = regels.reduce((s, r) => s + r.uren, 0)
  const totaal = basis + geregistreerd
  const nodig = Math.max(0, DOEL - totaal)
  const wekenOver = Math.max(1, Math.ceil((new Date(`${jaar}-12-31T12:00`).getTime() - new Date(`${nu}T12:00`).getTime()) / (7 * 86400000)))
  const dezeWeek = weekVan(nu).maandag
  const urenDezeWeek = regels.filter((r) => weekVan(r.datum).maandag === dezeWeek).reduce((s, r) => s + r.uren, 0)
  const perSoort = SOORTEN.map((s) => ({ s, u: regels.filter((r) => r.soort === s).reduce((t, r) => t + r.uren, 0) })).filter((x) => x.u > 0)
  const perWeek = new Map<string, Regel[]>()
  for (const r of regels) {
    const m = weekVan(r.datum).maandag
    perWeek.set(m, [...(perWeek.get(m) ?? []), r])
  }
  const tegels = [
    { k: `Totaal ${jaar}`, v: uur(totaal) },
    { k: "Nog nodig", v: uur(nodig) },
    { k: "Per week tot 31 dec", v: uur(Math.ceil(nodig / wekenOver)) },
    { k: "Deze week", v: uur(urenDezeWeek) },
  ]
  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      <header className="flex items-center justify-between gap-4 border-b border-lijn px-5 py-4 md:px-8">
        <span className={`${lbl} text-oranje-tekst`}>Dashboard · Uren</span>
        <Link href="/dashboard" className="text-[13px] opacity-70 hover:opacity-100">← Dashboard</Link>
      </header>
      <main className="mx-auto grid max-w-[1200px] gap-10 px-5 py-8 md:px-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section>
          <h1 className="syne m-0 text-[clamp(36px,4vw,48px)] leading-[1.05]">Uren {jaar}</h1>
          <p className="m-0 mt-3 text-[14px] leading-[1.55] opacity-75">
            Het urencriterium is {DOEL.toLocaleString("nl-NL")} uur per kalenderjaar. Alles voor de zaak telt: klussen,
            reistijd, offertes, inkoop, administratie, social, website en bijleren.
          </p>
          <div className="mt-6 h-[10px] overflow-hidden rounded-full bg-inkt/10" role="img" aria-label={`${Math.round((totaal / DOEL) * 100)} procent van het doel`}>
            <div className="h-full rounded-full bg-oranje" style={{ width: `${Math.min(100, (totaal / DOEL) * 100)}%` }} />
          </div>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0">
            {tegels.map((t) => (
              <li key={t.k} className="rounded-[18px] border border-lijn p-4">
                <span className={`${lbl} opacity-60`}>{t.k}</span>
                <b className="syne mt-1 block text-[22px] text-oranje-tekst">{t.v}</b>
              </li>
            ))}
          </ul>

          {opslagAan() ? (
            <form action={nieuweRegel} className="mt-8 grid gap-3 rounded-[18px] border border-oranje/60 bg-oranje/10 p-5">
              <span className={`${lbl} text-oranje-tekst`}>Uren invullen</span>
              <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3">
                <label className="grid gap-1 text-[12px]">Datum<input name="datum" type="date" defaultValue={nu} required className={veld} /></label>
                <label className="grid gap-1 text-[12px]">Uren<input name="uren" inputMode="decimal" placeholder="4,5" required className={veld} /></label>
              </div>
              <label className="grid gap-1 text-[12px]">
                Soort werk
                <select name="soort" className={veld} defaultValue="Klus bij klant">
                  {SOORTEN.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-[12px]">Klant of project<input name="klant" placeholder="Bijv. Clannad & Stijn" className={veld} /></label>
              <label className="grid gap-1 text-[12px]">Wat<input name="wat" placeholder="Bijv. graszoden leggen deel 2" className={veld} /></label>
              <button className="knop-klein justify-self-start border border-inkt/30">Opslaan</button>
              <p className="m-0 text-[11px] opacity-60">Per kwartier. Uren tot en met 15 okt staan al in de reconstructie; een regel daarvoor telt erbovenop.</p>
            </form>
          ) : (
            <p className="m-0 mt-8 rounded-[18px] border border-lijn p-5 text-[14px] opacity-70">Opslag staat uit (geen BLOB_READ_WRITE_TOKEN), dus invullen kan hier nog niet.</p>
          )}

          {perSoort.length > 0 && (
            <>
              <p className={`${lbl} m-0 mt-8 opacity-60`}>Ingevuld per soort</p>
              <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 text-[13px]">
                {perSoort.map((x) => (
                  <li key={x.s} className="flex justify-between border-b border-lijn pb-1.5"><span>{x.s}</span><b className="tabular-nums">{uur(x.u)}</b></li>
                ))}
              </ul>
            </>
          )}
          <a href="/dashboard/uren/export" className="mt-6 inline-block text-[13px] font-semibold text-oranje-tekst">Download alles als CSV ↓</a>
        </section>

        <section>
          <p className={`${lbl} m-0 opacity-60`}>Per week</p>
          {perWeek.size === 0 && <p className="m-0 mt-3 text-[14px] opacity-70">Nog niets ingevuld sinds de reconstructie.</p>}
          <ol className="m-0 mt-3 grid list-none gap-3 p-0">
            {[...perWeek.entries()].map(([maandag, rs]) => (
              <li key={maandag} className="rounded-[18px] border border-lijn p-5">
                <div className="flex items-baseline justify-between">
                  <b className="syne text-[17px]">Week {weekVan(maandag).week} · vanaf {dag(maandag)}</b>
                  <b className="tabular-nums text-oranje-tekst">{uur(rs.reduce((s, r) => s + r.uren, 0))}</b>
                </div>
                <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[13px]">
                  {rs.map((r) => (
                    <li key={r.id} className="flex items-start gap-3">
                      <span className="w-[86px] shrink-0 opacity-60">{dag(r.datum)}</span>
                      <span className="min-w-0 flex-1">
                        <b>{r.soort}</b>
                        {r.klant && ` · ${r.klant}`}
                        {r.wat && <span className="block opacity-70">{r.wat}</span>}
                      </span>
                      <b className="shrink-0 tabular-nums">{uur(r.uren)}</b>
                      <form action={regelWeg.bind(null, r.id)}>
                        <button className="opacity-40 hover:opacity-100" title="Regel verwijderen">✕</button>
                      </form>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          {jaar === "2026" && (
            <details className="mt-8 rounded-[18px] border border-lijn p-5">
              <summary className="cursor-pointer text-[14px] font-semibold">
                Reconstructie 1 jun – {dag(RECONSTRUCTIE_TOT)}: {uur(basis)}
              </summary>
              <p className="m-0 mt-3 text-[12px] opacity-60">
                Website, social en vijver zijn je eigen totalen, verdeeld over de weken; overig is voorzichtig geschat uit mail en facturen.
              </p>
              <ol className="m-0 mt-3 grid list-none gap-2 p-0 text-[13px]">
                {RECONSTRUCTIE.map((r) => (
                  <li key={r.week} className="flex gap-3 border-b border-lijn pb-2">
                    <span className="w-[64px] shrink-0 opacity-60">Week {r.week}</span>
                    <span className="min-w-0 flex-1 opacity-80">{r.wat}</span>
                    <b className="shrink-0 tabular-nums">{weekTotaal(r)}</b>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </section>
      </main>
    </div>
  )
}
