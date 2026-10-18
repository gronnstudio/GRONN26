"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import type { L } from "@/lib/i18n"
import type { Foto } from "@/lib/data/vijverrenovatie"
import "./diashow.css"

// Een foto groot, met vorige en volgende (eigenaar, 18 okt 2026: "elke tegel
// klikbaar en dan als slideshow door te klikken", vooral voor projectgalerijen
// op desktop). Een gewone <dialog>: Esc sluit, de focus blijft erin, pijltjes
// bladeren. `open` is de index, of null als hij dicht is.

export type Dia = { foto: Foto; fase?: L; zin?: L }

export function Diashow({ dias, open, naar }: { dias: Dia[]; open: number | null; naar: (i: number | null) => void }) {
  const doos = useRef<HTMLDialogElement>(null)
  const en = useTaal() === "en"
  const n = dias.length

  useEffect(() => {
    const d = doos.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  useEffect(() => {
    if (open === null) return
    const toets = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") naar((open + 1) % n)
      if (e.key === "ArrowLeft") naar((open - 1 + n) % n)
    }
    addEventListener("keydown", toets)
    return () => removeEventListener("keydown", toets)
  }, [open, n, naar])

  const dia = open === null ? null : dias[open]

  return (
    <dialog
      ref={doos}
      className="ds"
      aria-label={en ? "Photos of the project" : "Foto's van het project"}
      onClose={() => naar(null)}
      onClick={(e) => { if (e.target === e.currentTarget) naar(null) }}
    >
      {dia && open !== null && (
        <div className="ds-binnen">
          <div className="ds-beeld">
            <Image
              key={dia.foto.src}
              src={dia.foto.src}
              alt={en && dia.foto.en ? dia.foto.en.alt : dia.foto.alt}
              width={dia.foto.width}
              height={dia.foto.height}
              sizes="90vw"
            />
          </div>
          <div className="ds-onder">
            <div className="grid gap-1">
              {dia.fase && <span className="lbl text-oranje-tekst"><T t={dia.fase} /></span>}
              {dia.zin && <p className="m-0"><T t={dia.zin} /></p>}
            </div>
            <span className="lbl tabular-nums text-gedempt" aria-live="polite">
              {String(open + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>
          <button type="button" className="ds-knop ds-vorige" onClick={() => naar((open - 1 + n) % n)}>
            <span aria-hidden="true">←</span> {en ? "Previous" : "Vorige"}
          </button>
          <button type="button" className="ds-knop ds-volgende" onClick={() => naar((open + 1) % n)}>
            {en ? "Next" : "Volgende"} <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="ds-knop ds-sluit" onClick={() => naar(null)} autoFocus>
            {en ? "Close" : "Sluiten"} <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}
    </dialog>
  )
}
