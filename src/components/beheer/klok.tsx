"use client"

import { useEffect, useState } from "react"

// Tijd en groet, in de tijdzone van de bezoeker (de eigenaar).
export function Klok() {
  const [nu, setNu] = useState<Date | null>(null)
  useEffect(() => {
    const t0 = setTimeout(() => setNu(new Date()), 0)
    const t = setInterval(() => setNu(new Date()), 15000)
    return () => {
      clearTimeout(t0)
      clearInterval(t)
    }
  }, [])
  if (!nu) return <span className="opacity-0">00:00</span>
  return <span>{nu.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
}

export function Groet() {
  const [g, setG] = useState("Hoi")
  useEffect(() => {
    const u = new Date().getHours()
    const t = setTimeout(() => setG(u < 6 ? "Goedenacht" : u < 12 ? "Goedemorgen" : u < 18 ? "Goedemiddag" : "Goedenavond"), 0)
    return () => clearTimeout(t)
  }, [])
  return <>{g}, Nick</>
}

export function Datum() {
  const [d, setD] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setD(new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })), 0)
    return () => clearTimeout(t)
  }, [])
  return <>{d}</>
}
