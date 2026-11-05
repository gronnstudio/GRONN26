"use client"

import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

// Tekenen met vinger, pen of muis (werkbon, 5 nov 2026). Het canvas wordt bij
// elke streek een PNG in een verborgen veld, zodat het formulier een gewone
// server-actie blijft. Opnieuw wist het vlak. De knop werkt pas na een streek,
// anders zou een leeg formulier stil niets doen.
export function HandtekeningVeld({ naam = "beeld", knop, children }: { naam?: string; knop: string; children?: React.ReactNode }) {
  const doek = useRef<HTMLCanvasElement>(null)
  const veld = useRef<HTMLInputElement>(null)
  const [leeg, setLeeg] = useState(true)

  useEffect(() => {
    const c = doek.current!
    const schaal = window.devicePixelRatio || 1
    c.width = c.clientWidth * schaal
    c.height = c.clientHeight * schaal
    const x = c.getContext("2d")!
    x.scale(schaal, schaal)
    x.lineWidth = 2.4
    x.lineCap = "round"
    x.lineJoin = "round"
    x.strokeStyle = "#202020"
    let bezig = false
    const punt = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top] as const
    }
    const neer = (e: PointerEvent) => {
      bezig = true
      c.setPointerCapture(e.pointerId)
      const [px, py] = punt(e)
      x.beginPath()
      x.moveTo(px, py)
    }
    const beweeg = (e: PointerEvent) => {
      if (!bezig) return
      const [px, py] = punt(e)
      x.lineTo(px, py)
      x.stroke()
    }
    const op = () => {
      if (!bezig) return
      bezig = false
      veld.current!.value = c.toDataURL("image/png")
      setLeeg(false)
    }
    c.addEventListener("pointerdown", neer)
    c.addEventListener("pointermove", beweeg)
    c.addEventListener("pointerup", op)
    c.addEventListener("pointercancel", op)
    return () => {
      c.removeEventListener("pointerdown", neer)
      c.removeEventListener("pointermove", beweeg)
      c.removeEventListener("pointerup", op)
      c.removeEventListener("pointercancel", op)
    }
  }, [])

  const wis = () => {
    const c = doek.current!
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height)
    veld.current!.value = ""
    setLeeg(true)
  }

  return (
    <div className="grid gap-2">
      <canvas ref={doek} aria-label="Tekenvlak voor je handtekening" className="h-[180px] w-full touch-none rounded-[12px] border border-gedempt bg-white" />
      <input ref={veld} type="hidden" name={naam} required />
      <div className="flex items-center justify-between text-[13px] text-gedempt">
        <span>{leeg ? "Teken hierboven met je vinger" : "Getekend"}</span>
        <button type="button" onClick={wis} className="underline">Opnieuw</button>
      </div>
      {children}
      <div>
        <Verstuur leeg={leeg}>{knop}</Verstuur>
      </div>
    </div>
  )
}

function Verstuur({ leeg, children }: { leeg: boolean; children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button className="knop bg-oranje text-antraciet disabled:opacity-50" disabled={leeg || pending}>
      {pending ? "Bewaren…" : children}
    </button>
  )
}
