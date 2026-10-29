"use client"

import { useEffect, useState } from "react"
import { toonDecimaal } from "@/lib/crm/geld"
import { meetstaat } from "@/lib/crm/meetstaat"
import type { Zone } from "@/lib/crm/vragenlijst"
import { INTAKE_ZONES, type IntakeZones } from "./intake"

// De meetstaat naast de intake: rekent mee zodra een maat verandert, ook
// voordat de pagina ververst. "Zet in calculatie" maakt er regels van.
export function Meetstaat({ tuin, zones: begin, naarCalculatie }: { tuin: string; zones: Zone[]; naarCalculatie: string }) {
  const [zones, setZones] = useState(begin)
  useEffect(() => {
    const zet = (e: Event) => {
      const d = (e as CustomEvent<IntakeZones>).detail
      if (d?.tuin === tuin) setZones(d.zones)
    }
    window.addEventListener(INTAKE_ZONES, zet)
    return () => window.removeEventListener(INTAKE_ZONES, zet)
  }, [tuin])

  const staat = meetstaat(zones)
  if (!staat.length) return null
  return (
    <section className="crm-paneel p-5" aria-labelledby="meetstaat-kop">
      <p id="meetstaat-kop" className="crm-label m-0">Meetstaat</p>
      <p className="m-0 mt-1 text-[13px] text-gedempt">Uitgerekend uit de maten van de zones. De aangenomen laagdikte staat in elke formule.</p>
      {staat.map((z) => (
        <div key={z.zone} className="mt-4">
          <p className="m-0 text-[13px] font-semibold">{z.zone}</p>
          {z.mist && <p className="m-0 mt-1 text-[13px] text-gedempt">{z.mist}</p>}
          <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0 text-[13px]">
            {z.regels.map((r) => (
              <li key={r.wat}>
                <span className="flex justify-between gap-3">
                  <span>{r.wat}</span>
                  <span className="crm-cijfer whitespace-nowrap">{r.hoeveelheid ? `${toonDecimaal(r.hoeveelheid, 3)} ${r.eenheid}` : "—"}</span>
                </span>
                <span className="block text-[12px] text-gedempt">{r.formule}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {/* Altijd: ook een lege meetstaat haalt oude meetregels uit de calculatie. Een gewone link: wacht de intake nog op bewaren, dan waarschuwt de browser eerst. */}
      <a href={naarCalculatie} className="mt-4 block rounded-full border border-lijn px-5 py-2.5 text-center text-[14px] font-semibold hover:border-accent">
        Zet in calculatie →
      </a>
    </section>
  )
}
