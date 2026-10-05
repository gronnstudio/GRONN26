"use client"

import { useState } from "react"

type Plant = { id: number; x: number; h: number; s: number }

// Bij de 404: een lege strook grond. Tik en er groeit een plantje, in lijnwerk.
// Niets wordt bewaard; herladen is een nieuw seizoen.
export function Zaaien() {
  const [planten, setPlanten] = useState<Plant[]>([])
  const zaai = (x: number) =>
    setPlanten((p) => [...p.slice(-39), { id: Date.now() + Math.random(), x, h: 50 + Math.random() * 70, s: Math.random() < 0.5 ? -1 : 1 }])
  return (
    <div className="mt-[clamp(48px,6vw,96px)]">
      <button
        type="button"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          zaai(e.detail === 0 ? 0.1 + Math.random() * 0.8 : (e.clientX - r.left) / r.width)
        }}
        className="relative block h-[180px] w-full cursor-pointer overflow-hidden border-0 border-b-2 border-solid border-inkt bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label="Zaai een plantje"
      >
        {planten.length === 0 && <span className="lbl absolute inset-x-0 bottom-4 text-center text-gedempt">Tik op de grond om te zaaien</span>}
        {planten.map((p) => (
          <svg key={p.id} aria-hidden viewBox="-30 -130 60 130" className="zaai absolute bottom-0 h-[130px] w-[60px] -translate-x-1/2 overflow-visible" style={{ left: `${p.x * 100}%` }}>
            <path pathLength={1} d={`M0 0 C ${4 * p.s} ${-p.h / 3} ${-6 * p.s} ${(-2 * p.h) / 3} 0 ${-p.h}`} />
            <path pathLength={1} d={`M${p.s} ${-p.h * 0.45} q ${14 * p.s} -4 ${18 * p.s} -16 q ${-12 * p.s} 0 ${-18 * p.s} 16`} />
            <path pathLength={1} d={`M0 ${-p.h * 0.7} q ${-12 * p.s} -2 ${-15 * p.s} -13 q ${10 * p.s} 0 ${15 * p.s} 13`} />
            <circle cx="0" cy={-p.h} r="3.5" className="zaai-bloem" />
          </svg>
        ))}
      </button>
      <p className="lbl mt-3 text-gedempt" aria-live="polite">{planten.length > 0 ? `${planten.length} gezaaid` : " "}</p>
    </div>
  )
}
