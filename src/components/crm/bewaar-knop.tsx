"use client"

import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

// Een bewaarknop die laat zien dat hij iets doet: "Bewaren…" zolang het
// formulier verstuurd wordt, daarna twee tellen "Bewaard ✓".
export function BewaarKnop({ children, className = "crm-knop" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  const [klaar, setKlaar] = useState(false)
  const bezig = useRef(false)

  useEffect(() => {
    if (pending) {
      bezig.current = true
      return
    }
    if (!bezig.current) return
    bezig.current = false
    const aan = setTimeout(() => setKlaar(true), 0)
    const uit = setTimeout(() => setKlaar(false), 2000)
    return () => {
      clearTimeout(aan)
      clearTimeout(uit)
    }
  }, [pending])

  return (
    <button className={className} disabled={pending} aria-live="polite">
      {pending ? "Bewaren…" : klaar ? "Bewaard ✓" : children}
    </button>
  )
}
