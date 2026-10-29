"use client"

import Link from "next/link"
import { useOptimistic, useTransition } from "react"
import { KLANT_FASEN, type KlantFase } from "@/lib/crm/klant"
import { euro } from "@/lib/format"
import { zetFase } from "@/app/dashboard/klanten/acties"

// De pijplijn: één kolom per fase, een klus sleep je naar de volgende kolom.
export type Kaart = { id: string; naam: string; wat: string; plaats: string; fase: KlantFase; volgende: string; bedrag?: number; open: number; opvolgen?: string; teLaat?: boolean }


export function Pijplijn({ kaarten }: { kaarten: Kaart[] }) {
  const [, start] = useTransition()
  const [lijst, verplaats] = useOptimistic(kaarten, (k, { id, fase }: { id: string; fase: KlantFase }) => k.map((x) => (x.id === id ? { ...x, fase } : x)))

  const zet = (id: string, fase: KlantFase) =>
    start(async () => {
      verplaats({ id, fase })
      await zetFase(id, fase)
    })

  return (
    <div className="grid grid-cols-8 gap-2">
      {KLANT_FASEN.map((f) => {
        const hier = lijst.filter((k) => k.fase === f)
        const som = hier.reduce((t, k) => t + (k.bedrag ?? 0), 0)
        return (
          <section
            key={f}
            aria-label={f}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain")
              if (id) zet(id, f)
            }}
            className={`flex min-h-[60vh] flex-col gap-2 rounded-[12px] border border-lijn p-2 ${f === "Verloren" ? "bg-zijbalk/40 opacity-75" : "bg-zijbalk/70"}`}
          >
            <header className="px-2 pt-2 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="crm-label">{f}</span>
                <span className="crm-cijfer text-[12px] text-gedempt">{hier.length}</span>
              </div>
              <p className="crm-cijfer m-0 mt-0.5 text-[12px] text-gedempt">{som ? euro(som) : " "}</p>
            </header>
            {hier.map((k) => (
              <article
                key={k.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", k.id)}
                className="cursor-grab rounded-[10px] border border-lijn bg-vlak p-3 shadow-[0_1px_0_rgb(0_0_0/.04)] transition-colors hover:border-lijn-sterk active:cursor-grabbing"
              >
                <Link href={`/dashboard/klanten/${k.id}`} className="crm-link leading-[1.3]">
                  {k.naam}
                </Link>
                {(k.wat || k.plaats) && (
                  <p className="m-0 mt-1 line-clamp-2 text-[12px] leading-[1.4] text-gedempt">{[k.wat, k.plaats].filter(Boolean).join(" · ")}</p>
                )}
                {k.opvolgen && (
                  <p className={`m-0 mt-2 text-[11px] font-semibold uppercase tracking-[.08em] ${k.teLaat ? "text-let" : "text-gedempt"}`}>
                    Opvolgen {new Date(`${k.opvolgen}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  </p>
                )}
                {k.volgende && <p className="m-0 mt-2 line-clamp-3 border-l-2 border-accent pl-2 text-[12px] leading-[1.4]">{k.volgende}</p>}
                <div className="crm-cijfer mt-2 flex flex-wrap items-center justify-between gap-x-2 text-[12px] whitespace-nowrap">
                  <span className="text-gedempt">{k.bedrag ? euro(k.bedrag) : ""}</span>
                  {k.open > 0 && <span className="text-let">{euro(k.open)} open</span>}
                </div>
              </article>
            ))}
          </section>
        )
      })}
    </div>
  )
}
