"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { BTW_TARIEVEN, EENHEDEN, SOORTEN, STANDAARD, isSoort, nieuweRegel, reken, tekort, wegzetten, type Regel, type Soort } from "@/lib/crm/calculatie"
import { alsRegel, type Item } from "@/lib/crm/catalogus"
import { leesBp, leesCenten, leesMilli, plusProcent, toonDecimaal, toonEuro, zonderProcent, type Milli } from "@/lib/crm/geld"
import { bewaarCalculatie, onthoudPrijs } from "@/app/dashboard/calculatie/acties"
import { Rekenhulp } from "./rekenhulp"
import { Planning } from "@/components/crm/planning"
import type { PlanFase } from "@/lib/crm/planning"

// Het rekenblad: van uren en inkoop naar een prijs waar genoeg aan overblijft
// (eigenaar, 29 okt 2026). Sinds de CRM-bouw (zelfde dag) rekent het met
// src/lib/crm/calculatie.ts, in centen; regels hebben een hoeveelheid,
// eenheid en prijs per eenheid, de catalogus vult prijzen in en "Onthoud"
// zet een prijs terug in de catalogus. Bij een klant bewaar je elke versie.

type Schatting = { uren: number; posten: { wat: string; uren: number }[]; regels?: { wat: string; soort: string; inkoop: number }[]; aannames: string }

/** Een regel zoals hij in de invulvelden staat: tekst, nog niet ontleed. */
type Invul = { id: string; soort: Soort; omschrijving: string; hoeveelheid: string; eenheid: string; inkoop: string; opslag: string; btw: number; afval: string; optioneel: boolean; groep: string; catalogusId?: string; meetstaat?: string; /** Wat Nick typte terwijl "met btw" aan stond */ inkoopIncl?: string }

// "Met btw" (eigenaar, 29 okt 2026: "ik wil met btw"): inkoop en verkoop
// tonen en invoeren incl. btw. Opgeslagen en gerekend wordt altijd excl.
const MET_BTW = "gronn-rekenblad-met-btw"
const inclTekst = (r: Invul) => {
  const c = leesCenten(r.inkoop)
  return c ? toonDecimaal(plusProcent(c, r.btw), 2, 2) : ""
}
const exclUit = (tekst: string, btw: number) => {
  const c = leesCenten(tekst)
  return c === null ? "" : toonDecimaal(zonderProcent(Math.max(0, c), btw), 2, 2)
}
// Grind en zand per big bag (BB): snel ½, 1 of een veelvoud kiezen, of los gestort (eigenaar, 29 okt 2026).
const isBigBag = (eenheid: string) => /^bb$|big ?bag/i.test(eenheid.trim())
const BB_KEUZES: [string, string][] = [["½", "0,5"], ["1", "1"], ["2", "2"], ["3", "3"]]

export type KlantKeuze = { id: string; naam: string; tuinen: { id: string; naam: string }[] }
export type Begin = { klantId: string; calculatieId?: string; titel: string; tuinId?: string; beschrijving: string; uren: Milli; uurtarief: number; onvoorzien: number; korting: number; regels: Regel[]; nr?: number; planning?: PlanFase[]; planVoorstel?: PlanFase[] }

const lbl = "crm-label"
const veld = "crm-veld"
const klein = "min-w-0 rounded-[10px] border border-lijn bg-transparent px-2 py-1.5 text-[13px]"

const naarInvul = (r: Regel): Invul => ({
  id: r.id,
  soort: r.soort,
  omschrijving: r.omschrijving,
  hoeveelheid: toonDecimaal(r.hoeveelheid, 3),
  eenheid: r.eenheid,
  inkoop: r.inkoop ? toonDecimaal(r.inkoop, 2, 2) : "",
  opslag: toonDecimaal(r.opslag, 2),
  btw: r.btw,
  afval: toonDecimaal(r.afval, 2),
  optioneel: !!r.optioneel,
  groep: r.groep ?? "",
  catalogusId: r.catalogusId,
  meetstaat: r.meetstaat,
})
const naarRegel = (r: Invul): Regel => ({
  id: r.id,
  soort: r.soort,
  omschrijving: r.omschrijving,
  hoeveelheid: Math.max(0, leesMilli(r.hoeveelheid) ?? 0),
  eenheid: r.eenheid,
  inkoop: Math.max(0, leesCenten(r.inkoop) ?? 0),
  opslag: Math.max(0, leesBp(r.opslag) ?? 0),
  btw: r.btw,
  afval: Math.max(0, leesBp(r.afval) ?? 0),
  groep: r.groep.trim() || undefined,
  optioneel: r.optioneel || undefined,
  catalogusId: r.catalogusId,
  meetstaat: r.meetstaat,
})
const leeg = () => naarInvul(nieuweRegel("materiaal", { hoeveelheid: 1000 }))

export function PrijsRekenaar({ klanten = [], catalogus = [], begin }: { klanten?: KlantKeuze[]; catalogus?: Item[]; begin?: Begin }) {
  const [klantId, setKlantId] = useState(begin?.klantId ?? "")
  const [klantNaam, setKlantNaam] = useState("")
  const [titel, setTitel] = useState(begin?.titel ?? "")
  const [tuinId, setTuinId] = useState(begin?.tuinId ?? "")
  const [calcId, setCalcId] = useState(begin?.calculatieId)
  const [versie, setVersie] = useState(begin?.nr ?? 0)
  const [uren, setUren] = useState(begin ? toonDecimaal(begin.uren, 3) : "")
  const [tarief, setTarief] = useState(toonDecimaal(begin?.uurtarief ?? STANDAARD.uurtarief, 2))
  const [korting, setKorting] = useState(toonDecimaal(begin?.korting ?? 0, 2))
  const [onvoorzien, setOnvoorzien] = useState(toonDecimaal(begin?.onvoorzien ?? 0, 2))
  const [regels, setRegels] = useState<Invul[]>(begin?.regels.length ? begin.regels.map(naarInvul) : [leeg()])
  const [beschrijving, setBeschrijving] = useState(begin?.beschrijving ?? "")
  const [plan, setPlan] = useState<PlanFase[]>(begin?.planning ?? [])
  const [schatting, setSchatting] = useState<Schatting | null>(null)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState("")
  const [melding, setMelding] = useState("")
  const [bewaart, start] = useTransition()
  const [metBtw, setMetBtw] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.getItem(MET_BTW) === "1") setTimeout(() => setMetBtw(true), 0)
    } catch {}
  }, [])
  const kiesBtw = (aan: boolean) => {
    setMetBtw(aan)
    setRegels((oud) => oud.map((r) => ({ ...r, inkoopIncl: undefined })))
    try {
      localStorage.setItem(MET_BTW, aan ? "1" : "0")
    } catch {}
  }
  const router = useRouter()

  const klant = klanten.find((k) => k.id === klantId)
  const perNaam = useMemo(() => new Map(catalogus.map((i) => [i.naam.toLowerCase(), i])), [catalogus])

  // Grønn stelt de uren voor op basis van de beschrijving; Nick past het getal aan.
  const schat = async () => {
    setBezig(true)
    setFout("")
    try {
      const r = await fetch("/api/uren-schatting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ beschrijving }) })
      const data = (await r.json()) as Schatting & { fout?: string }
      if (!r.ok || data.fout) throw new Error(data.fout || "Geen schatting gekregen.")
      setSchatting(data)
      setUren(String(Math.round(data.uren)))
      // Machines en materiaal als eigen regels erbij; lege regels gaan weg.
      const extra = (data.regels ?? []).map((x) => {
        const soort: Soort = isSoort(x.soort) ? x.soort : "overig"
        const uitCatalogus = perNaam.get(x.wat.toLowerCase())
        const totaal = Math.round(x.inkoop) * 100
        // Uit de catalogus: zijn prijs per eenheid, en het aantal (dagen, tonnen) teruggerekend uit Claudes totaal, op halve eenheden.
        if (uitCatalogus?.inkoop) return naarInvul(alsRegel(uitCatalogus, Math.max(500, Math.round((totaal * 2) / uitCatalogus.inkoop) * 500)))
        return naarInvul(nieuweRegel(soort, { omschrijving: x.wat, eenheid: "post", inkoop: totaal }))
      })
      if (extra.length) setRegels((oud) => [...oud.filter((r) => r.omschrijving.trim() || r.inkoop.trim()), ...extra])
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Geen schatting gekregen.")
    } finally {
      setBezig(false)
    }
  }

  // Verandert de prijs of het tarief op een andere manier dan via het incl.-veld, dan geldt de getypte incl.-tekst niet meer.
  const zet = (i: number, r: Partial<Invul>) =>
    setRegels(regels.map((x, j) => (j === i ? { ...x, ...r, ...(!("inkoopIncl" in r) && ("inkoop" in r || "btw" in r) ? { inkoopIncl: undefined } : {}) } : x)))
  const schuif = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= regels.length) return
    const nieuw = [...regels]
    ;[nieuw[i], nieuw[j]] = [nieuw[j], nieuw[i]]
    setRegels(nieuw)
  }
  // Een omschrijving die precies een catalogusnaam is, neemt eenheid en prijs over.
  const zetOmschrijving = (i: number, tekst: string) => {
    const item = perNaam.get(tekst.toLowerCase())
    if (item && item.id !== regels[i].catalogusId) zet(i, { ...naarInvul(alsRegel(item, leesMilli(regels[i].hoeveelheid) ?? 1000)), id: regels[i].id, meetstaat: regels[i].meetstaat, ...(regels[i].meetstaat ? { afval: "0" } : {}) })
    else zet(i, { omschrijving: tekst })
  }
  const voegToe = (r: Regel) => setRegels((oud) => [...oud.filter((x) => x.omschrijving.trim() || x.inkoop.trim()), naarInvul(r)])

  const urenMilli = Math.max(0, leesMilli(uren) ?? 0)
  const invoer = {
    uren: urenMilli,
    uurtarief: Math.max(0, leesCenten(tarief) ?? 0),
    onvoorzien: Math.min(5000, Math.max(0, leesBp(onvoorzien) ?? 0)),
    korting: Math.min(10000, Math.max(0, leesBp(korting) ?? 0)),
    regels: regels.map(naarRegel),
  }
  const u = reken(invoer)
  const w = wegzetten(u)
  const goed = urenMilli > 0 && u.perUur >= STANDAARD.minimumPerUur
  const te = tekort(u, urenMilli)

  const bewaar = () =>
    start(async () => {
      setMelding("")
      const uit = await bewaarCalculatie({ klantId, calculatieId: calcId, titel, tuinId: tuinId || undefined, beschrijving, planning: plan, ...invoer })
      if ("fout" in uit) return setMelding(uit.fout)
      setCalcId(uit.id)
      setVersie(uit.nr)
      setMelding(`Versie ${uit.nr} bewaard.`)
      // Op de klantpagina: naar het vaste adres van deze calculatie.
      // Ook na een meetstaat-import naar het vaste adres: verversen mag de import niet herhalen.
      if (begin && (!calcId || window.location.search.includes("meetstaat="))) router.replace(`/dashboard/klanten/${klantId}/calculatie/${uit.id}`)
    })

  const onthoud = (i: number) =>
    start(async () => {
      const uit = await onthoudPrijs(naarRegel(regels[i]))
      if ("fout" in uit) return setMelding(uit.fout)
      zet(i, { catalogusId: uit.id })
      setMelding(`"${regels[i].omschrijving}" staat in de catalogus.`)
    })

  const naamVoorPrint = klant?.naam ?? klantNaam
  const regelsVoorKlant = u.regels.filter((r) => r.verkoop > 0)

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 print:hidden @min-[1340px]:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-[13px]">
              Klant
              {klanten.length ? (
                <select value={klantId} onChange={(e) => { setKlantId(e.target.value); setCalcId(undefined); setVersie(0); setTuinId("") }} className={`${veld}`}>
                  <option value="">Losse berekening</option>
                  {klanten.map((k) => (
                    <option key={k.id} value={k.id}>{k.naam}</option>
                  ))}
                </select>
              ) : (
                <input value={klantNaam} onChange={(e) => setKlantNaam(e.target.value)} placeholder="bijv. Diliana Timmermans, Beek" className={veld} />
              )}
            </label>
            <label className="grid gap-1 text-[13px]">
              Titel
              <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="bijv. Parkeervak in klinkers" className={veld} />
            </label>
            {klant && klant.tuinen.length > 0 && (
              <label className="grid gap-1 text-[13px]">
                Tuin
                <select value={tuinId} onChange={(e) => setTuinId(e.target.value)} className={`${veld}`}>
                  <option value="">Geen</option>
                  {klant.tuinen.map((t) => (
                    <option key={t.id} value={t.id}>{t.naam}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <section>
            <p className={`${lbl} m-0`}>1 · Jouw werk</p>
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
            <button type="button" onClick={schat} disabled={bezig || !beschrijving.trim()} className="mt-2 crm-knop disabled:opacity-50">
              {bezig ? "Grønn rekent…" : "Schat de uren"}
            </button>
            {fout && <p role="alert" className="m-0 mt-2 text-[13px] text-let">{fout}</p>}
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
                    <span>Voorstel, met 5 % marge</span>
                    <span className="tabular-nums">{Math.round(schatting.uren)} u</span>
                  </li>
                </ul>
                {!!schatting.regels?.length && <p className="m-0 mt-2 text-gedempt">{schatting.regels.length} regels voor machines en materiaal staan hieronder bij 2, met geschatte inkoop.</p>}
                {schatting.aannames && <p className="m-0 mt-2 text-gedempt">Aangenomen: {schatting.aannames}</p>}
                <p className="m-0 mt-2 text-gedempt">Een voorstel: klopt het niet met wat jij weet, pas de uren en bedragen hieronder aan.</p>
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
              <label className="grid gap-1 text-[13px]">
                Uren
                <input inputMode="decimal" value={uren} onChange={(e) => setUren(e.target.value)} placeholder="bijv. 24" className={veld} />
              </label>
              <label className="grid gap-1 text-[13px]">
                Uurtarief excl. btw
                <input inputMode="decimal" value={tarief} onChange={(e) => setTarief(e.target.value)} className={veld} />
              </label>
              <label className="grid gap-1 text-[13px]">
                Onvoorzien %
                <input inputMode="decimal" value={onvoorzien} onChange={(e) => setOnvoorzien(e.target.value)} className={veld} />
              </label>
              <label className="grid gap-1 text-[13px]">
                Korting %
                <input inputMode="decimal" value={korting} onChange={(e) => setKorting(e.target.value)} className={veld} />
              </label>
            </div>
            <p className="m-0 mt-2 text-[12px] text-gedempt">Uren is alles: ook laden, rijden en opruimen. Een dag is 8 uur. Vrienden krijgen korting, niet een lager uurtarief.</p>
          </section>

          <section className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className={`${lbl} m-0`}>2 · Materiaal, machines en overig, inkoop {metBtw ? "incl." : "excl."} btw</p>
              <label className="ml-auto flex items-center gap-1.5 text-[13px]">
                <input type="checkbox" checked={metBtw} onChange={(e) => kiesBtw(e.target.checked)} /> Bedragen met btw
              </label>
              <Link href="/dashboard/catalogus" className="text-[12px] text-accent-tekst">Catalogus →</Link>
            </div>
            <datalist id="catalogus-namen">
              {catalogus.map((i) => (
                <option key={i.id} value={i.naam}>{`${toonEuro(i.inkoop)} per ${i.eenheid}${i.leverancier ? ` · ${i.leverancier}` : ""}`}</option>
              ))}
            </datalist>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="py-1 pr-2 font-semibold">Omschrijving</th>
                    <th className="py-1 pr-2 font-semibold">Soort</th>
                    <th className="py-1 pr-2 font-semibold">Aantal</th>
                    <th className="py-1 pr-2 font-semibold">Eenheid</th>
                    <th className="py-1 pr-2 font-semibold">Inkoop / eenh.{metBtw ? " incl." : ""}</th>
                    <th className="py-1 pr-2 font-semibold">Opslag %</th>
                    <th className="py-1 pr-2 font-semibold">Afval %</th>
                    <th className="py-1 pr-2 font-semibold">Btw</th>
                    <th className="py-1 pr-2 text-right font-semibold">Verkoop{metBtw ? " incl." : ""}</th>
                    <th className="py-1 font-semibold"><span className="sr-only">Acties</span></th>
                  </tr>
                </thead>
                <tbody>
                  {regels.map((r, i) => {
                    const uit = [...u.regels, ...u.optioneel].find((x) => x.id === r.id)
                    return (
                      <tr key={r.id} className="border-t border-lijn align-top">
                        <td className="py-1.5 pr-2">
                          <input aria-label="Omschrijving" list="catalogus-namen" value={r.omschrijving} onChange={(e) => zetOmschrijving(i, e.target.value)} placeholder="bijv. klinkers" className={`${klein} w-full`} />
                          <label className="mt-1 flex items-center gap-1.5 text-[12px] text-gedempt">
                            <input type="checkbox" checked={r.optioneel} onChange={(e) => zet(i, { optioneel: e.target.checked })} /> optioneel
                          </label>
                        </td>
                        <td className="py-1.5 pr-2">
                          <select aria-label="Soort" value={r.soort} onChange={(e) => { const s = e.target.value as Soort; zet(i, { soort: s, opslag: toonDecimaal(SOORTEN[s].opslag, 2), btw: SOORTEN[s].btw }) }} className={`${klein} w-[150px] bg-grond`}>
                            {Object.entries(SOORTEN).map(([id, s]) => (
                              <option key={id} value={id}>{s.naam}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 pr-2">
                          <input aria-label="Aantal" inputMode="decimal" value={r.hoeveelheid} onChange={(e) => zet(i, { hoeveelheid: e.target.value })} className={`${klein} w-[80px]`} />
                          {isBigBag(r.eenheid) && (
                            <span className="mt-1 flex gap-1" role="group" aria-label="Aantal big bags">
                              {BB_KEUZES.map(([t, v]) => (
                                <button key={t} type="button" aria-pressed={r.hoeveelheid === v} onClick={() => zet(i, { hoeveelheid: v })} className={`min-h-[24px] rounded-full border px-2 text-[12px] ${r.hoeveelheid === v ? "border-inkt bg-inkt text-grond" : "border-lijn"}`}>
                                  {t}
                                </button>
                              ))}
                              <button type="button" onClick={() => zet(i, { eenheid: "m³", inkoop: "", inkoopIncl: undefined })} title="Los gestort: per m³, vul de prijs in" className="min-h-[24px] rounded-full border border-lijn px-2 text-[12px]">
                                los
                              </button>
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 pr-2">
                          <input aria-label="Eenheid" list="eenheden" value={r.eenheid} onChange={(e) => zet(i, { eenheid: e.target.value.slice(0, 12) })} className={`${klein} w-[64px]`} />
                        </td>
                        <td className="py-1.5 pr-2">
                          {metBtw ? (
                            <input aria-label="Inkoop per eenheid incl. btw" inputMode="decimal" value={r.inkoopIncl ?? inclTekst(r)} onChange={(e) => zet(i, { inkoopIncl: e.target.value, inkoop: exclUit(e.target.value, r.btw) })} placeholder="€" className={`${klein} w-[90px]`} />
                          ) : (
                            <input aria-label="Inkoop per eenheid" inputMode="decimal" value={r.inkoop} onChange={(e) => zet(i, { inkoop: e.target.value })} placeholder="€" className={`${klein} w-[90px]`} />
                          )}
                          {metBtw && r.inkoop && <span className="block text-[11px] text-gedempt">{r.inkoop} excl.</span>}
                        </td>
                        <td className="py-1.5 pr-2"><input aria-label="Opslag procent" inputMode="decimal" value={r.opslag} onChange={(e) => zet(i, { opslag: e.target.value })} className={`${klein} w-[64px]`} /></td>
                        <td className="py-1.5 pr-2"><input aria-label="Afval procent" inputMode="decimal" value={r.afval} onChange={(e) => zet(i, { afval: e.target.value })} className={`${klein} w-[56px]`} /></td>
                        <td className="py-1.5 pr-2">
                          <select aria-label="Btw" value={r.btw} onChange={(e) => { const btw = Number(e.target.value); zet(i, metBtw && r.inkoopIncl ? { btw, inkoop: exclUit(r.inkoopIncl, btw) } : { btw }) }} className={`${klein} bg-grond`}>
                            {BTW_TARIEVEN.map((b) => (
                              <option key={b} value={b}>{b / 100} %</option>
                            ))}
                          </select>
                        </td>
                        <td className={`py-1.5 pr-2 text-right crm-cijfer whitespace-nowrap ${r.optioneel ? "text-gedempt" : ""}`}>
                          {uit ? toonEuro(metBtw ? plusProcent(uit.verkoop, r.btw) : uit.verkoop) : "—"}
                          {uit && uit.brutoHoeveelheid !== uit.hoeveelheid && <span className="block text-[11px] text-gedempt">{toonDecimaal(uit.brutoHoeveelheid, 3)} {r.eenheid} incl. afval</span>}
                        </td>
                        <td className="py-1.5 whitespace-nowrap">
                          <button type="button" aria-label="Prijs onthouden in de catalogus" title="Onthoud in catalogus" onClick={() => onthoud(i)} disabled={!r.omschrijving.trim()} className={`size-[28px] hover:opacity-100 disabled:opacity-20 ${r.catalogusId ? "text-let opacity-100" : "text-gedempt"}`}>★</button>
                          <button type="button" aria-label="Regel omhoog" disabled={i === 0} onClick={() => schuif(i, -1)} className="size-[28px] opacity-60 hover:opacity-100 disabled:opacity-20">↑</button>
                          <button type="button" aria-label="Regel omlaag" disabled={i === regels.length - 1} onClick={() => schuif(i, 1)} className="size-[28px] opacity-60 hover:opacity-100 disabled:opacity-20">↓</button>
                          <button type="button" aria-label="Regel weghalen" onClick={() => setRegels(regels.length > 1 ? regels.filter((_, j) => j !== i) : [leeg()])} className="size-[28px] opacity-60 hover:opacity-100">×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <datalist id="eenheden">
                {EENHEDEN.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
            </div>
            <button type="button" onClick={() => setRegels([...regels, leeg()])} className="mt-3 crm-knop-rand">+ Regel</button>
            <p className="m-0 mt-2 text-[12px] text-gedempt">
              Kies een naam uit de catalogus en prijs en eenheid vullen zich in. ★ zet de prijs in de catalogus, zodat je hem de volgende keer weet. Planten 9 % btw, de rest 21 %.
            </p>
          </section>

          <Planning plan={plan} onPlan={setPlan} voorstel={begin?.planVoorstel} onWerkomschrijving={(t) => setBeschrijving((b) => [b.split("Werkvolgorde:")[0].trim(), t].filter(Boolean).join("\n\n"))} />

          <Rekenhulp catalogus={catalogus} onRegel={voegToe} onUren={(m) => setUren(toonDecimaal(urenMilli + m, 3))} />
        </div>

        <aside className="flex flex-col gap-4 self-start crm-paneel p-5 xl:sticky xl:top-6">
          <p className={`${lbl} m-0`}>Voor de klant</p>
          <dl className="m-0 grid gap-2 text-[14px]">
            <Rij t="Arbeid" b={u.arbeid} />
            <Rij t="Materiaal en overig" b={u.materiaal} />
            {u.onvoorzien > 0 && <Rij t="Onvoorzien" b={u.onvoorzien} />}
            {u.korting > 0 && <Rij t="Korting" b={-u.korting} />}
            <Rij t="Totaal excl. btw" b={u.verkoop} vet />
            {u.btw.map((b) => (
              <Rij key={b.tarief} t={`Btw ${b.tarief / 100} % over ${toonEuro(b.grondslag)}`} b={b.btw} />
            ))}
            <Rij t="Totaal incl. btw" b={u.totaal} vet />
          </dl>
          {u.optioneel.length > 0 && (
            <p className="m-0 text-[12px] text-gedempt">Optioneel, niet in het totaal: {toonEuro(u.optioneel.reduce((t, r) => t + r.verkoop, 0))} excl. btw</p>
          )}

          <div className={`rounded-[14px] p-4 ${goed ? "bg-inkt/[.05]" : "bg-accent/15"}`}>
            <p className={`${lbl} m-0`}>Wat jij overhoudt</p>
            <p className="syne m-0 mt-1 text-[30px]">{toonEuro(u.winst)}</p>
            <p className="m-0 text-[14px]">{urenMilli ? <>{toonEuro(u.perUur)} per uur</> : "Vul je uren in"}</p>
            <p className="m-0 mt-1 text-[12px] text-gedempt">
              Marge {toonDecimaal(u.marge, 2)} % van de verkoop · opslag {toonDecimaal(u.opslag, 2)} % op de inkoop
            </p>
            {urenMilli > 0 && (
              <p className="m-0 mt-2 text-[13px] font-semibold">
                {goed ? "Goed: genoeg voor je vaste lasten en je winst." : `Te laag. Minimaal ${toonEuro(STANDAARD.minimumPerUur)} per uur; reken ${toonEuro(te)} excl. btw meer.`}
              </p>
            )}
          </div>
          <div className="rounded-[14px] border border-lijn p-4">
            <p className={`${lbl} m-0`}>Na betaling wegzetten</p>
            <dl className="m-0 mt-2 grid gap-2 text-[14px]">
              <Rij t="Leveranciers, incl. btw" b={w.leveranciers} />
              <Rij t="Btw-rekening, af te dragen" b={w.btwAfdragen} />
              <Rij t={`Belasting op je winst (${STANDAARD.reserveBelasting / 100} %)`} b={w.reserve} />
              <Rij t="Vrij voor jou" b={w.vrij} vet />
            </dl>
            <p className="m-0 mt-2 text-[12px] leading-[1.5] text-gedempt">De btw op je inkoop trek je af in je aangifte, daarom staat alleen het verschil op de btw-rekening.</p>
          </div>
          <p className="m-0 text-[12px] leading-[1.5] text-gedempt">Overhouden = verkoop excl. btw min inkoop, vóór vaste lasten en inkomstenbelasting. Zet de uren niet op de offerte, alleen de prijs per post.</p>
          {klantId && (
            <button type="button" onClick={bewaar} disabled={bewaart} className="crm-knop disabled:opacity-50">
              {bewaart ? "Bewaren…" : versie ? `Bewaar als versie ${versie + 1}` : "Bewaar bij klant"}
            </button>
          )}
          {melding && <p role="status" className="m-0 -mt-2 text-[13px]">{melding}</p>}
          <button type="button" onClick={() => window.print()} disabled={!u.verkoop} className="crm-knop-rand disabled:opacity-50">
            Print of bewaar als PDF
          </button>
          <p className="m-0 -mt-2 text-[12px] leading-[1.5] text-gedempt">De klant ziet alleen de prijzen, niet je inkoop, opslag of uren.</p>
        </aside>
      </div>

      {/* Wat de klant krijgt: alleen verkoopprijzen. Op het scherm verborgen. */}
      <article className="hidden bg-white p-[18mm] text-[11pt] text-op-accent print:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair-antraciet.svg" alt="GRØNN Studio" className="h-[22px] w-auto" />
        <h1 className="syne m-0 mt-10 text-[24pt] leading-[1.1]">{titel || "Prijsoverzicht"}</h1>
        <p className="m-0 mt-2">
          {naamVoorPrint && <>Voor {naamVoorPrint} · </>}
          {new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        {beschrijving.trim() && <p className="m-0 mt-6 whitespace-pre-line leading-[1.5]">{beschrijving.trim()}</p>}
        <dl className="m-0 mt-8 grid gap-2">
          {u.arbeid > 0 && <Rij t="Werkzaamheden" b={u.arbeid} />}
          {regelsVoorKlant.map((r) => (
            <Rij key={r.id} t={`${r.omschrijving || SOORTEN[r.soort].naam}${r.eenheid !== "post" ? ` · ${toonDecimaal(r.brutoHoeveelheid, 3)} ${r.eenheid}` : ""}`} b={r.verkoop} />
          ))}
          {u.onvoorzien > 0 && <Rij t="Onvoorzien" b={u.onvoorzien} />}
          {u.korting > 0 && <Rij t="Korting" b={-u.korting} />}
          <Rij t="Totaal excl. btw" b={u.verkoop} vet />
          {u.btw.map((b) => (
            <Rij key={b.tarief} t={`Btw ${b.tarief / 100} %`} b={b.btw} />
          ))}
          <Rij t="Totaal incl. btw" b={u.totaal} vet />
        </dl>
        {u.optioneel.length > 0 && (
          <>
            <p className="m-0 mt-8 font-semibold">Optioneel, niet in het totaal</p>
            <dl className="m-0 mt-2 grid gap-2">
              {u.optioneel.map((r) => (
                <Rij key={r.id} t={r.omschrijving || SOORTEN[r.soort].naam} b={r.verkoop} />
              ))}
            </dl>
          </>
        )}
        <p className="m-0 mt-10 text-[9pt] leading-[1.5] text-gedempt">Dit is een prijsindicatie, geen offerte. GRØNN Studio · Stein · hello@gronn.studio · gronn.studio</p>
      </article>
    </>
  )
}

function Rij({ t, b, vet }: { t: string; b: number; vet?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${vet ? "border-t border-lijn pt-2 font-semibold" : ""}`}>
      <dt>{t}</dt>
      <dd className="m-0 whitespace-nowrap crm-cijfer">{toonEuro(b)}</dd>
    </div>
  )
}
