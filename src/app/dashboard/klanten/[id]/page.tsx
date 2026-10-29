import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { KLANT_FASEN, geld, hoortBij, leesKlanten } from "@/lib/beheer/klanten"
import { leesUren } from "@/lib/beheer/uren"
import { euro } from "@/lib/format"
import { bewaarKlant, klantWeg, nieuwStuk, stukRond, stukWeg } from "../acties"

// De klantkaart: gegevens, offertes en facturen, uren en notities op één plek.
export const metadata: Metadata = {
  title: { absolute: "Klant · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const datum = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export default async function Klantkaart({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const k = (await leesKlanten()).find((x) => x.id === id)
  if (!k) notFound()
  const g = geld(k)
  const uren = (await leesUren()).filter((r) => hoortBij(k, r.klant))
  const urenTotaal = uren.reduce((t, r) => t + r.uren, 0)
  // Nacalculatie in het klein: wat er per gewerkt uur binnenkwam (excl. 21 % btw, schatting).
  const perUur = urenTotaal && g.gefactureerd ? g.gefactureerd / 1.21 / urenTotaal : 0

  return (
    <div data-links className="min-h-svh min-w-[1200px] bg-grond text-inkt">
      <header className="flex items-center justify-between gap-4 border-b border-lijn px-8 py-4">
        <span className={`${lbl} text-oranje-tekst`}>Dashboard · Klanten · {k.naam}</span>
        <Link href="/dashboard/klanten" className="text-[13px] opacity-70 hover:opacity-100">← Alle klanten</Link>
      </header>
      <main className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_440px] gap-10 px-8 py-8">
        <form action={bewaarKlant.bind(null, k.id)} className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-6">
            <input name="naam" defaultValue={k.naam} aria-label="Naam" className="syne min-w-0 flex-1 border-0 bg-transparent p-0 text-[44px] leading-[1.05] outline-none focus:underline" />
            <select name="fase" defaultValue={k.fase} aria-label="Fase" className={`${veld} bg-grond font-semibold`}>
              {KLANT_FASEN.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Veld naam="wat" label="Wat" waarde={k.wat} />
            <Veld naam="plaats" label="Plaats" waarde={k.plaats} />
            <Veld naam="contact" label="Telefoon en e-mail" waarde={k.contact} />
            <Veld naam="adres" label="Adres" waarde={k.adres} />
          </div>
          <label className="grid gap-1 text-[13px]">
            Volgende stap
            <input name="volgende" defaultValue={k.volgende} className={veld} />
          </label>
          <label className="grid gap-1 text-[13px]">
            Notities
            <textarea name="notities" defaultValue={k.notities} rows={10} className={`${veld} resize-y leading-[1.5]`} placeholder="Afspraken, maten, wensen, wat je zag bij de opname…" />
          </label>
          <div className="flex items-center justify-between">
            <button className="rounded-full bg-oranje px-6 py-3 text-[14px] font-semibold text-[#202020]">Bewaren</button>
            <button formAction={klantWeg.bind(null, k.id)} className="text-[13px] opacity-50 hover:text-oranje-tekst hover:opacity-100">
              Klant verwijderen
            </button>
          </div>
        </form>

        <aside className="flex flex-col gap-6">
          <dl className="m-0 grid grid-cols-3 rounded-[18px] border border-lijn">
            {[
              [euro(g.gefactureerd), "gefactureerd"],
              [euro(g.betaald), "betaald"],
              [euro(g.open), "open"],
            ].map(([n, t], i) => (
              <div key={t} className={`p-4 ${i ? "border-l border-lijn" : ""}`}>
                <dd className={`m-0 text-[17px] font-semibold tabular-nums ${t === "open" && g.open > 0 ? "text-oranje-tekst" : ""}`}>{n}</dd>
                <dt className={`${lbl} opacity-60`}>{t}</dt>
              </div>
            ))}
          </dl>

          <section className="rounded-[18px] border border-lijn p-5">
            <p className={`${lbl} m-0 opacity-60`}>Offertes en facturen · incl. btw</p>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[14px]">
              {k.stukken.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                  <span className="min-w-0">
                    <span className={`${lbl} mr-2 opacity-60`}>{s.soort}</span>
                    <span className="[overflow-wrap:anywhere]">{s.nummer}</span>
                    <span className="block text-[12px] opacity-60">{datum(s.datum)}</span>
                  </span>
                  <span className="tabular-nums">{euro(s.bedrag)}</span>
                  <span className="flex gap-1">
                    <form action={stukRond.bind(null, k.id, s.id, !s.rond)}>
                      <button className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${s.rond ? "border-inkt bg-inkt text-grond" : "border-lijn hover:border-oranje"}`}>
                        {s.rond ? (s.soort === "Factuur" ? "Betaald ✓" : "Akkoord ✓") : s.soort === "Factuur" ? "Betaald?" : "Akkoord?"}
                      </button>
                    </form>
                    <form action={stukWeg.bind(null, k.id, s.id)}>
                      <button aria-label="Weghalen" className="px-2 opacity-40 hover:opacity-100">×</button>
                    </form>
                  </span>
                </li>
              ))}
              {!k.stukken.length && <li className="text-[13px] opacity-60">Nog niets.</li>}
            </ul>
            <form action={nieuwStuk.bind(null, k.id)} className="mt-4 grid grid-cols-[110px_minmax(0,1fr)] gap-2 border-t border-lijn pt-4">
              <select name="soort" aria-label="Soort" className={`${veld} bg-grond`}>
                <option>Factuur</option>
                <option>Offerte</option>
              </select>
              <input name="nummer" required placeholder="GR-F // 2026-…" aria-label="Nummer" className={veld} />
              <input name="bedrag" required inputMode="decimal" placeholder="€ incl. btw" aria-label="Bedrag" className={veld} />
              <input name="datum" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} aria-label="Datum" className={veld} />
              <button className="col-span-2 rounded-full border border-lijn px-4 py-2 text-[14px] font-semibold hover:border-oranje">+ Toevoegen</button>
            </form>
          </section>

          <section className="rounded-[18px] border border-lijn p-5">
            <div className="flex items-baseline justify-between">
              <p className={`${lbl} m-0 opacity-60`}>Uren uit je registratie</p>
              <Link href="/dashboard/uren" className="text-[12px] text-oranje-tekst">Uren invullen →</Link>
            </div>
            <p className="syne m-0 mt-2 text-[26px] tabular-nums">{urenTotaal.toLocaleString("nl-NL")} uur</p>
            {perUur > 0 && (
              <p className={`m-0 text-[13px] ${perUur < 37 ? "font-semibold text-oranje-tekst" : "opacity-70"}`}>
                ± {euro(perUur)} per uur gefactureerd (excl. btw, inclusief materiaal)
              </p>
            )}
            <ul className="m-0 mt-3 grid max-h-[240px] list-none gap-1 overflow-y-auto p-0 text-[13px]">
              {uren.map((r) => (
                <li key={r.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {datum(r.datum)} · {r.wat || r.soort}
                  </span>
                  <span className="tabular-nums">{r.uren} u</span>
                </li>
              ))}
              {!uren.length && <li className="opacity-60">Geen uren gevonden met deze naam in het veld Klant.</li>}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  )
}

function Veld({ naam, label, waarde }: { naam: string; label: string; waarde: string }) {
  return (
    <label className="grid gap-1 text-[13px]">
      {label}
      <input name={naam} defaultValue={waarde} className={veld} />
    </label>
  )
}
