"use client"

import Link from "next/link"
import { useOptimistic, useTransition } from "react"
import { KLANT_FASEN, type KlantFase } from "@/lib/beheer/klanten"
import { euro } from "@/lib/format"
import { zetFase } from "@/app/dashboard/klanten/acties"

// De pijplijn: één kolom per fase, een klus sleep je naar de volgende kolom.
export type Kaart = { id: string; naam: string; wat: string; plaats: string; fase: KlantFase; volgende: string; bedrag?: number; open: number }

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"

export function Pijplijn({ kaarten }: { kaarten: Kaart[] }) {
  const [, start] = useTransition()
  const [lijst, verplaats] = useOptimistic(kaarten, (k, { id, fase }: { id: string; fase: KlantFase }) => k.map((x) => (x.id === id ? { ...x, fase } : x)))

  const zet = (id: string, fase: KlantFase) =>
    start(async () => {
      verplaats({ id, fase })
      await zetFase(id, fase)
    })

  return (
    <div className="grid grid-cols-7 gap-3">
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
            className="flex min-h-[60vh] flex-col gap-2 rounded-[16px] bg-inkt/[.04] p-2"
          >
            <header className="px-2 pt-2 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`${lbl} opacity-70`}>{f}</span>
                <span className="text-[12px] tabular-nums opacity-60">{hier.length}</span>
              </div>
              <p className="m-0 mt-0.5 text-[12px] tabular-nums opacity-50">{som ? euro(som) : " "}</p>
            </header>
            {hier.map((k) => (
              <article
                key={k.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", k.id)}
                className="cursor-grab rounded-[12px] border border-lijn bg-grond p-3 shadow-[0_1px_0_rgba(0,0,0,.04)] active:cursor-grabbing"
              >
                <Link href={`/dashboard/klanten/${k.id}`} className="font-semibold leading-[1.3] hover:text-oranje-tekst">
                  {k.naam}
                </Link>
                {(k.wat || k.plaats) && (
                  <p className="m-0 mt-1 line-clamp-2 text-[12px] leading-[1.4] opacity-70">{[k.wat, k.plaats].filter(Boolean).join(" · ")}</p>
                )}
                {k.volgende && <p className="m-0 mt-2 line-clamp-3 border-l-2 border-oranje pl-2 text-[12px] leading-[1.4]">{k.volgende}</p>}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 text-[12px] tabular-nums whitespace-nowrap">
                  <span className="opacity-70">{k.bedrag ? euro(k.bedrag) : ""}</span>
                  {k.open > 0 && <span className="font-semibold text-oranje-tekst">{euro(k.open)} open</span>}
                </div>
              </article>
            ))}
          </section>
        )
      })}
    </div>
  )
}
