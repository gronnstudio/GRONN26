"use client"

import { startDagen, totaalDagen, type PlanFase } from "@/lib/crm/planning"

// De werkplanning in het rekenblad: fasen met werkdagen, machines en wat er
// geleverd moet worden. "Uit de meetstaat" zet het voorstel van de code neer;
// daarna is alles met de hand aan te passen en gaat het mee met de versie.
export function Planning({ plan, onPlan, voorstel, onWerkomschrijving }: { plan: PlanFase[]; onPlan: (p: PlanFase[]) => void; voorstel?: PlanFase[]; onWerkomschrijving: (plan: PlanFase[]) => void }) {
  const zet = (i: number, d: Partial<PlanFase>) => onPlan(plan.map((f, j) => (j === i ? { ...f, ...d } : f)))
  const start = startDagen(plan)
  return (
    <section aria-labelledby="planning-kop">
      <p id="planning-kop" className="crm-label m-0">
        3 · Planning
      </p>
      <p className="m-0 mt-1 text-[12px] text-gedempt">Werkdagen per fase, met machines en wat er op welke dag geleverd moet worden. Komt mee op de offerte als werkvolgorde.</p>
      {plan.length > 0 && (
        <ol className="m-0 mt-3 grid list-none gap-3 p-0">
          {plan.map((f, i) => (
            <li key={f.id} className="grid gap-2 rounded-[14px] border border-lijn p-3 text-[13px] sm:grid-cols-[1fr_88px]">
              <label className="grid gap-1">
                Fase {i + 1} · begint dag {start[i].toLocaleString("nl-NL")}
                <input value={f.naam} onChange={(e) => zet(i, { naam: e.target.value })} className="crm-veld" />
              </label>
              <label className="grid gap-1">
                Dagen
                <input type="number" min={0.5} max={60} step={0.5} value={f.dagen} onChange={(e) => zet(i, { dagen: Math.max(0.5, Number(e.target.value) || 0.5) })} className="crm-veld crm-cijfer" />
              </label>
              <label className="grid gap-1">
                Machines
                <input value={f.machines} onChange={(e) => zet(i, { machines: e.target.value })} className="crm-veld" />
              </label>
              <label className="grid gap-1 sm:col-span-1">
                Levering (op dag {start[i].toLocaleString("nl-NL")})
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
          + Fase
        </button>
        {plan.length > 0 && (
          <button type="button" onClick={() => onWerkomschrijving(plan.filter((f) => f.naam.trim()))} className="crm-knop-rand">
            Zet in werkomschrijving
          </button>
        )}
      </div>
    </section>
  )
}
