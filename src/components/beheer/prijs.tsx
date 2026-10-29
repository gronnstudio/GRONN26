"use client"

import { useState } from "react"
import { euro } from "@/lib/format"

// Prijs berekenen zodat er genoeg overblijft (eigenaar, 29 okt 2026). De vaste
// regels komen uit de analyse "Waar blijft het geld?": € 50 per uur, opslag per
// soort materiaal, machines tegen huur + transport + 10 %. Onder € 37 per uur
// blijft er na vaste lasten en Qredits te weinig over voor € 30.000 winst.
const SOORTEN = {
  planten: { naam: "Planten", opslag: 25, btw: 9 },
  materiaal: { naam: "Steen, grond, hout, techniek", opslag: 15, btw: 21 },
  bezorging: { naam: "Container of bezorging", opslag: 10, btw: 21 },
  machine: { naam: "Machine (huur + transport)", opslag: 10, btw: 21 },
} as const
type Soort = keyof typeof SOORTEN
type Regel = { wat: string; soort: Soort; inkoop: string }
type Schatting = { uren: number; posten: { wat: string; uren: number }[]; aannames: string }

const MINIMUM_PER_UUR = 37
// Apart zetten voor inkomstenbelasting en Zvw: voorzichtig, zodat de
// aanslag nooit tegenvalt. Wat te veel staat, komt terug als vrij geld.
const RESERVE_BELASTING = 25
const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const getal = (s: string) => Math.max(0, Number(s.replace(",", ".")) || 0)

export function PrijsRekenaar() {
  const [uren, setUren] = useState("")
  const [tarief, setTarief] = useState("50")
  const [korting, setKorting] = useState("0")
  const [regels, setRegels] = useState<Regel[]>([{ wat: "", soort: "materiaal", inkoop: "" }])
  const [beschrijving, setBeschrijving] = useState("")
  const [schatting, setSchatting] = useState<Schatting | null>(null)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState("")
  const [klant, setKlant] = useState("")

  // Grønn stelt de uren voor op basis van de beschrijving; Nick past het getal aan.
  const schat = async () => {
    setBezig(true)
    setFout("")
    try {
      const r = await fetch("/api/uren-schatting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beschrijving }),
      })
      const data = (await r.json()) as Schatting & { fout?: string }
      if (!r.ok || data.fout) throw new Error(data.fout || "Geen schatting gekregen.")
      setSchatting(data)
      setUren(String(Math.round(data.uren)))
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Geen schatting gekregen.")
    } finally {
      setBezig(false)
    }
  }

  const zet = (i: number, r: Partial<Regel>) => setRegels(regels.map((x, j) => (j === i ? { ...x, ...r } : x)))
  // Regel i een plek omhoog (-1) of omlaag (+1).
  const schuif = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= regels.length) return
    const nieuw = [...regels]
    ;[nieuw[i], nieuw[j]] = [nieuw[j], nieuw[i]]
    setRegels(nieuw)
  }

  const arbeid = getal(uren) * getal(tarief)
  const posten = regels.map((r) => {
    const s = SOORTEN[r.soort]
    const inkoop = getal(r.inkoop)
    return { ...r, inkoopBedrag: inkoop, verkoop: inkoop * (1 + s.opslag / 100), btw: s.btw }
  })
  const inkoop = posten.reduce((t, p) => t + p.inkoopBedrag, 0)
  const bruto = arbeid + posten.reduce((t, p) => t + p.verkoop, 0)
  const kortingBedrag = (bruto * Math.min(getal(korting), 100)) / 100
  const verkoop = bruto - kortingBedrag
  // Korting gaat naar rato van elke regel af, zodat de btw per tarief klopt.
  const factor = bruto ? verkoop / bruto : 0
  const btw9 = posten.filter((p) => p.btw === 9).reduce((t, p) => t + p.verkoop, 0) * factor * 0.09
  const btw21 = (arbeid + posten.filter((p) => p.btw === 21).reduce((t, p) => t + p.verkoop, 0)) * factor * 0.21
  const over = verkoop - inkoop
  const urenGetal = getal(uren)
  const perUur = urenGetal ? over / urenGetal : 0
  const goed = urenGetal > 0 && perUur >= MINIMUM_PER_UUR
  const tekort = urenGetal ? Math.max(0, MINIMUM_PER_UUR * urenGetal - over) : 0

  const totaal = verkoop + btw9 + btw21
  // Na betaling: leveranciers, af te dragen btw (verkoop-btw min de btw op je
  // inkoop) en een reserve voor de belasting op wat je overhoudt.
  const btwInkoop = posten.reduce((t, p) => t + (p.inkoopBedrag * p.btw) / 100, 0)
  const btwAfdragen = btw9 + btw21 - btwInkoop
  const reserve = Math.max(0, over) * (RESERVE_BELASTING / 100)
  const regelsVoorKlant = posten.filter((p) => p.inkoopBedrag > 0)

  return (
    <>
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 print:hidden lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-8">
        <label className="grid gap-1 text-[13px]">
          Klant
          <input value={klant} onChange={(e) => setKlant(e.target.value)} placeholder="bijv. Diliana Timmermans, Beek" className={veld} />
        </label>
        <section>
          <p className={`${lbl} m-0 opacity-60`}>1 · Jouw werk</p>
          <label className="mt-3 grid gap-1 text-[13px]">
            Wat moet er gebeuren? Grønn stelt de uren voor
            <textarea
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              rows={3}
              placeholder="bijv. 62 m² klinkers in keperverband, oude bestrating eruit, grondkering van 20 m, 20 m² grassen"
              className={`${veld} resize-y`}
            />
          </label>
          <button
            type="button"
            onClick={schat}
            disabled={bezig || !beschrijving.trim()}
            className="mt-2 rounded-full bg-oranje px-5 py-2 text-[14px] font-semibold text-[#202020] disabled:opacity-50"
          >
            {bezig ? "Grønn rekent…" : "Schat de uren"}
          </button>
          {fout && <p role="alert" className="m-0 mt-2 text-[13px] text-oranje-tekst">{fout}</p>}
          {schatting && (
            <div className="mt-3 rounded-[14px] border border-lijn p-4 text-[13px]">
              <ul className="m-0 grid list-none gap-1 p-0">
                {schatting.posten.map((p) => (
                  <li key={p.wat} className="flex justify-between gap-4">
                    <span>{p.wat}</span>
                    <span className="tabular-nums">{p.uren} u</span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 border-t border-lijn pt-1 font-semibold">
                  <span>Voorstel, met 10 % marge</span>
                  <span className="tabular-nums">{Math.round(schatting.uren)} u</span>
                </li>
              </ul>
              {schatting.aannames && <p className="m-0 mt-2 opacity-70">Aangenomen: {schatting.aannames}</p>}
              <p className="m-0 mt-2 opacity-60">Een voorstel: klopt het niet met wat jij weet, pas de uren hieronder aan.</p>
            </div>
          )}
          <div className="mt-5 grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-[13px]">
              Uren (alles: ook laden, rijden, opruimen)
              <input inputMode="decimal" value={uren} onChange={(e) => setUren(e.target.value)} placeholder="bijv. 24" className={veld} />
            </label>
            <label className="grid gap-1 text-[13px]">
              Uurtarief excl. btw
              <input inputMode="decimal" value={tarief} onChange={(e) => setTarief(e.target.value)} className={veld} />
            </label>
            <label className="grid gap-1 text-[13px]">
              Korting %
              <input inputMode="decimal" value={korting} onChange={(e) => setKorting(e.target.value)} className={veld} />
            </label>
          </div>
          <p className="m-0 mt-2 text-[12px] opacity-60">
            Een dag is 8 uur, dus € 400 per dag. Vrienden krijgen korting als eigen regel, niet een lager uurtarief.
          </p>
        </section>

        <section>
          <p className={`${lbl} m-0 opacity-60`}>2 · Materiaal en machines, inkoop excl. btw</p>
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {posten.map((p, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,1fr)_100px_auto] items-center gap-2 border-b border-lijn pb-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_auto] sm:border-0 sm:pb-0">
                <input aria-label="Omschrijving" value={p.wat} onChange={(e) => zet(i, { wat: e.target.value })} placeholder="bijv. klinkers 60 m²" className={`${veld} col-span-3 sm:col-span-1`} />
                <select aria-label="Soort" value={p.soort} onChange={(e) => zet(i, { soort: e.target.value as Soort })} className={`${veld} bg-grond`}>
                  {Object.entries(SOORTEN).map(([id, s]) => (
                    <option key={id} value={id}>
                      {s.naam} +{s.opslag}%
                    </option>
                  ))}
                </select>
                <input aria-label="Inkoop" inputMode="decimal" value={p.inkoop} onChange={(e) => zet(i, { inkoop: e.target.value })} placeholder="€" className={veld} />
                <span className="flex items-center">
                  <button type="button" aria-label="Regel omhoog" disabled={i === 0} onClick={() => schuif(i, -1)} className="size-[28px] opacity-60 hover:opacity-100 disabled:opacity-20">
                    ↑
                  </button>
                  <button type="button" aria-label="Regel omlaag" disabled={i === posten.length - 1} onClick={() => schuif(i, 1)} className="size-[28px] opacity-60 hover:opacity-100 disabled:opacity-20">
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Regel weghalen"
                    onClick={() => setRegels(regels.length > 1 ? regels.filter((_, j) => j !== i) : [{ wat: "", soort: "materiaal", inkoop: "" }])}
                    className="size-[28px] opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setRegels([...regels, { wat: "", soort: "materiaal", inkoop: "" }])}
            className="mt-3 rounded-full border border-lijn px-4 py-2 text-[14px] font-semibold hover:border-oranje"
          >
            + Regel
          </button>
          <p className="m-0 mt-2 text-[12px] opacity-60">
            Planten 9 % btw, de rest 21 %. Een minigraver kost bij Bosmans ± € 125 per dag plus € 75 transport.
          </p>
        </section>
      </div>

      <aside className="flex flex-col gap-4 self-start rounded-[18px] border border-lijn p-5 lg:sticky lg:top-6">
        <p className={`${lbl} m-0 opacity-60`}>Voor de klant</p>
        <dl className="m-0 grid gap-2 text-[14px]">
          <Rij t="Arbeid" b={arbeid * factor} />
          <Rij t="Materiaal en machines" b={(bruto - arbeid) * factor} />
          {kortingBedrag > 0 && <Rij t={`Waarvan korting (${getal(korting)} %)`} b={-kortingBedrag} />}
          <Rij t="Totaal excl. btw" b={verkoop} vet />
          {btw9 > 0 && <Rij t="Btw 9 % (planten)" b={btw9} />}
          <Rij t="Btw 21 %" b={btw21} />
          <Rij t="Totaal incl. btw" b={verkoop + btw9 + btw21} vet />
        </dl>

        <div className={`rounded-[14px] p-4 ${goed ? "bg-inkt/[.05]" : "bg-oranje/15"}`}>
          <p className={`${lbl} m-0 opacity-60`}>Wat jij overhoudt</p>
          <p className="syne m-0 mt-1 text-[30px]">{euro(over)}</p>
          <p className="m-0 text-[14px]">
            {urenGetal ? <>{euro(perUur)} per uur</> : "Vul je uren in"}
          </p>
          {urenGetal > 0 && (
            <p className="m-0 mt-2 text-[13px] font-semibold">
              {goed
                ? "Goed: genoeg voor je vaste lasten en je winst."
                : `Te laag. Minimaal € ${MINIMUM_PER_UUR} per uur; reken ${euro(tekort)} excl. btw meer.`}
            </p>
          )}
        </div>
        <div className="rounded-[14px] border border-lijn p-4">
          <p className={`${lbl} m-0 opacity-60`}>Na betaling wegzetten</p>
          <dl className="m-0 mt-2 grid gap-2 text-[14px]">
            <Rij t="Leveranciers, incl. btw" b={inkoop + btwInkoop} />
            <Rij t="Btw-rekening, af te dragen" b={btwAfdragen} />
            <Rij t={`Belasting op je winst (${RESERVE_BELASTING} %)`} b={reserve} />
            <Rij t="Vrij voor jou" b={over - reserve} vet />
          </dl>
          <p className="m-0 mt-2 text-[12px] leading-[1.5] opacity-60">
            Samen {euro(totaal)}, wat de klant betaalt. De btw op je inkoop trek je af in je aangifte, daarom staat alleen het verschil op de btw-rekening.
          </p>
        </div>
        <p className="m-0 text-[12px] leading-[1.5] opacity-60">
          Overhouden = verkoop excl. btw min inkoop, vóór vaste lasten en inkomstenbelasting. Zet de uren niet op de offerte, alleen de prijs per post.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!verkoop}
          className="rounded-full bg-oranje px-5 py-3 text-[14px] font-semibold text-[#202020] disabled:opacity-50"
        >
          Print of bewaar als PDF
        </button>
        <p className="m-0 -mt-2 text-[12px] leading-[1.5] opacity-60">
          Kies &ldquo;Bewaar als PDF&rdquo; in het printscherm; op de telefoon deel je hem daar ook. De klant ziet alleen de prijzen, niet je inkoop, opslag of uren.
        </p>
      </aside>
    </div>

    {/* Wat de klant krijgt: alleen verkoopprijzen. Op het scherm verborgen. */}
    <article className="hidden bg-white p-[18mm] text-[11pt] text-[#202020] print:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair-antraciet.svg" alt="GRØNN Studio" className="h-[22px] w-auto" />
      <h1 className="syne m-0 mt-10 text-[24pt] leading-[1.1]">Prijsoverzicht</h1>
      <p className="m-0 mt-2">
        {klant && <>Voor {klant} · </>}
        {new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      {beschrijving.trim() && <p className="m-0 mt-6 whitespace-pre-line leading-[1.5]">{beschrijving.trim()}</p>}
      <dl className="m-0 mt-8 grid gap-2">
        {arbeid > 0 && <Rij t="Werkzaamheden" b={arbeid * factor} />}
        {regelsVoorKlant.map((p, i) => (
          <Rij key={i} t={p.wat || SOORTEN[p.soort].naam} b={p.verkoop * factor} />
        ))}
        {kortingBedrag > 0 && <Rij t={`Hierin verrekende korting (${getal(korting)} %)`} b={-kortingBedrag} />}
        <Rij t="Totaal excl. btw" b={verkoop} vet />
        {btw9 > 0 && <Rij t="Btw 9 % (planten)" b={btw9} />}
        <Rij t="Btw 21 %" b={btw21} />
        <Rij t="Totaal incl. btw" b={totaal} vet />
      </dl>
      <p className="m-0 mt-10 text-[9pt] leading-[1.5] opacity-70">
        Dit is een prijsindicatie, geen offerte. GRØNN Studio · Stein · hello@gronn.studio · gronn.studio
      </p>
    </article>
    </>
  )
}

function Rij({ t, b, vet }: { t: string; b: number; vet?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${vet ? "border-t border-lijn pt-2 font-semibold" : ""}`}>
      <dt>{t}</dt>
      <dd className="m-0 whitespace-nowrap tabular-nums">{euro(b)}</dd>
    </div>
  )
}
