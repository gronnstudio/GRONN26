"use client"

import { useState } from "react"

import { totaalDagen, type PlanFase } from "@/lib/crm/planning"
import { agendaBestand, planDagen } from "@/lib/crm/project"
import { PdfKnoppen } from "@/components/crm/pdf-knoppen"

const dag = (x: string) => new Date(`${x}T12:00:00Z`).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
const wanneer = (d?: { van: string; tot: string }) => (d ? (d.van === d.tot ? dag(d.van) : `${dag(d.van)} t/m ${dag(d.tot)}`) : "")

// De werkplanning in het rekenblad: fasen met werkdagen, machines en wat er
// geleverd moet worden. "Uit de meetstaat" zet het voorstel van de code neer;
// daarna is alles met de hand aan te passen en gaat het mee met de versie.
export function Planning({ titel, plan, onPlan, start, onStart, voorstel, onWerkomschrijving }: { titel: string; plan: PlanFase[]; start: string; onStart: (s: string) => void; onPlan: (p: PlanFase[]) => void; voorstel?: PlanFase[]; onWerkomschrijving: (plan: PlanFase[]) => void }) {
  const zet = (i: number, d: Partial<PlanFase>) => onPlan(plan.map((f, j) => (j === i ? { ...f, ...d } : f)))
  // Nick, 2 nov 2026: "Maak van die fases dagen!" Met een startdatum krijgt elke regel echte werkdagen (za/zo slaan we over).
  const dagen = planDagen(plan, start)
  // Altijd op datum (Nick, 2 nov 2026: "dagen gaan niet automatisch naar volgorde, verwarrend").
  const van = (i: number) => dagen[i]?.van ?? "9"
  const volgorde = plan.map((_, i) => i).sort((a, b) => (van(a) < van(b) ? -1 : van(a) > van(b) ? 1 : a - b))
  const nummer = plan.map((_, i) => volgorde.indexOf(i) + 1)
  const agenda = () => {
    const ics = agendaBestand(plan.map((f, i) => ({ ...dagen[i], titel: `${f.naam || `Dag ${nummer[i]}`}${titel ? ` · ${titel}` : ""}` })).filter((x) => x.van))
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }))
    a.download = `Planning ${titel || "GRØNN"}.ics`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <section aria-labelledby="planning-kop">
      <p id="planning-kop" className="crm-label m-0">
        3 · Planning
      </p>
      <p className="m-0 mt-1 text-[12px] text-gedempt">Werkdagen met machines en wat er geleverd moet worden. Komt mee op de offerte als werkvolgorde.</p>
      <label className="mt-3 grid max-w-[220px] gap-1 text-[13px]">
        Eerste werkdag
        <input type="date" value={start} onChange={(e) => onStart(e.target.value)} className="crm-veld" />
      </label>
      <Maand plan={plan} onPlan={onPlan} start={start} />
      {plan.length > 0 && (
        <ol className="m-0 mt-3 grid list-none gap-3 p-0">
          {volgorde.map((i) => [plan[i], i] as const).map(([f, i]) => (
            <li key={f.id} id={`plan-${f.id}`} className="grid gap-2 rounded-[14px] border border-lijn p-3 text-[13px] sm:grid-cols-[1fr_88px]">
              <label className="grid gap-1">
                Dag {nummer[i]}{dagen[i] ? ` · ${wanneer(dagen[i])}` : ""}
                <input value={f.naam} placeholder="Wat gebeurt er?" onChange={(e) => zet(i, { naam: e.target.value })} className="crm-veld" />
              </label>
              <label className="grid gap-1">
                Dagen
                <input type="number" min={0.5} max={60} step={0.5} value={f.dagen} onChange={(e) => zet(i, { dagen: Math.max(0.5, Number(e.target.value) || 0.5) })} className="crm-veld crm-cijfer" />
              </label>
              <label className="grid gap-1">
                Beschrijving
                <input value={f.machines} onChange={(e) => zet(i, { machines: e.target.value })} className="crm-veld" />
              </label>
              <label className="grid gap-1 sm:col-span-1">
                Levering
                <input value={f.levering} onChange={(e) => zet(i, { levering: e.target.value })} className="crm-veld" />
              </label>
              <div className="flex items-center justify-between gap-2 sm:col-span-2">
                <span className="text-[12px] text-gedempt">{f.uitleg}</span>
                <button type="button" onClick={() => onPlan(plan.filter((_, j) => j !== i))} className="crm-knop-rand">
                  Weg
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {plan.length > 0 && <p className="m-0 mt-2 text-[13px]">Samen {totaalDagen(plan).toLocaleString("nl-NL")} werkdagen.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {voorstel && voorstel.length > 0 && (
          <button type="button" onClick={() => onPlan(voorstel)} className="crm-knop">
            {plan.length ? "Opnieuw uit de meetstaat" : "Planning uit de meetstaat"}
          </button>
        )}
        <button type="button" onClick={() => onPlan([...plan, { id: crypto.randomUUID(), naam: "", dagen: 1, machines: "", levering: "" }])} className="crm-knop-rand">
          + Dag
        </button>
        {plan.length > 0 && (
          <button type="button" onClick={() => onWerkomschrijving(plan.filter((f) => f.naam.trim()))} className="crm-knop-rand">
            Zet in werkomschrijving
          </button>
        )}
        {plan.length > 0 && dagen.length > 0 && (
          <button type="button" onClick={agenda} className="crm-knop-rand" title="Opent in Google Agenda, Apple Agenda of Outlook">
            Zet in agenda (.ics)
          </button>
        )}
      </div>
      {plan.length > 0 && dagen.length > 0 && (
        <>
          <PdfKnoppen naam={`Planning ${titel || "GRØNN Studio"}`} doel=".planning-druk" className="mt-2 grid grid-cols-2 gap-2" crm />
          <article className="planning-druk hidden bg-white p-[18mm] text-[11pt] text-op-accent">
            <h1 className="m-0 text-[18pt]">Planning{titel ? ` · ${titel}` : ""}</h1>
            <table className="mt-6 w-full border-collapse text-left">
              <thead><tr><th className="border-b py-2">Wanneer</th><th className="border-b py-2">Wat</th><th className="border-b py-2">Beschrijving</th><th className="border-b py-2">Levering</th></tr></thead>
              <tbody>
                {volgorde.map((i) => [plan[i], i] as const).map(([f, i]) => (
                  <tr key={f.id}><td className="border-b py-2 pr-3 align-top">{wanneer(dagen[i])}</td><td className="border-b py-2 pr-3 align-top">{f.naam}</td><td className="border-b py-2 pr-3 align-top">{f.machines}</td><td className="border-b py-2 align-top">{f.levering}</td></tr>
                ))}
              </tbody>
            </table>
          </article>
        </>
      )}
    </section>
  )
}

// Maandoverzicht (Nick, 2 nov 2026): "een maand overzicht die ik kan vullen met groene bollen,
// waarna ik de bollen specificeer". Tik op een dag: er komt een groene bol en een lege regel
// eronder met die datum. Tik op een bol: naar die regel om hem in te vullen.
const iso = (d: Date) => d.toISOString().slice(0, 10)
function Maand({ plan, onPlan, start }: { plan: PlanFase[]; onPlan: (p: PlanFase[]) => void; start: string }) {
  const [maand, setMaand] = useState(() => (start || iso(new Date())).slice(0, 7))
  const dagen = planDagen(plan, start)
  const bezet = new Map<string, PlanFase>()
  plan.forEach((f, i) => {
    const d = dagen[i]
    if (!d) return
    for (let x = new Date(`${d.van}T12:00:00Z`); iso(x) <= d.tot; x.setUTCDate(x.getUTCDate() + 1)) if (!bezet.has(iso(x))) bezet.set(iso(x), f)
  })
  const eerste = new Date(`${maand}-01T12:00:00Z`)
  const leeg = (eerste.getUTCDay() + 6) % 7
  const aantal = new Date(Date.UTC(eerste.getUTCFullYear(), eerste.getUTCMonth() + 1, 0)).getUTCDate()
  const schuif = (n: number) => { const d = new Date(eerste); d.setUTCMonth(d.getUTCMonth() + n); setMaand(iso(d).slice(0, 7)) }
  const tik = (datum: string) => {
    const f = bezet.get(datum)
    if (f) return document.getElementById(`plan-${f.id}`)?.querySelector("input")?.focus()
    const nieuw: PlanFase = { id: crypto.randomUUID(), naam: "", dagen: 1, machines: "", levering: "", datum }
    onPlan([...plan, nieuw].sort((a, b) => (a.datum ?? "9") < (b.datum ?? "9") ? -1 : 1))
    setTimeout(() => document.getElementById(`plan-${nieuw.id}`)?.querySelector("input")?.focus(), 0)
  }
  return (
    <div className="mt-3 max-w-[420px] rounded-[14px] border border-lijn p-3 text-[13px]">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => schuif(-1)} className="crm-knop-rand">Vorige</button>
        <span className="font-semibold capitalize">{eerste.toLocaleDateString("nl-NL", { month: "long", year: "numeric", timeZone: "UTC" })}</span>
        <button type="button" onClick={() => schuif(1)} className="crm-knop-rand">Volgende</button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {["ma", "di", "wo", "do", "vr", "za", "zo"].map((d) => <span key={d} className="text-[11px] text-gedempt">{d}</span>)}
        {Array.from({ length: leeg }, (_, i) => <span key={`l${i}`} />)}
        {Array.from({ length: aantal }, (_, i) => {
          const datum = `${maand}-${String(i + 1).padStart(2, "0")}`
          const f = bezet.get(datum)
          return (
            <button key={datum} type="button" onClick={() => tik(datum)} title={f ? f.naam || "Nog invullen" : "Zet een bol"} className="grid h-[40px] place-items-center rounded-[10px] hover:bg-black/5">
              <span className="text-[11px]">{i + 1}</span>
              <span className={`size-[12px] rounded-full ${f ? (f.naam ? "bg-[#2f7a4a]" : "border-2 border-[#2f7a4a]") : ""}`} />
            </button>
          )
        })}
      </div>
      <p className="m-0 mt-2 text-[12px] text-gedempt">Tik op een dag voor een groene bol en vul hem daaronder in. Een open bol is nog niet ingevuld.</p>
    </div>
  )
}
