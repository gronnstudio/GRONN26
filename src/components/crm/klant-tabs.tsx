"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { meld } from "./melding"

// Tabbladen bovenaan voor snel schakelen tussen klanten (Nick, 2 nov 2026).
// Elke klant die je opent komt erbij; het tabblad onthoudt waar je was (klantkaart,
// calculatie, tuin). Het × sluit alleen het tabblad, er wordt niets gewist.
// Alleen in deze browser bewaard.
type Tab = { id: string; href: string }
const KEY = "gronn-klant-tabs"
const MAX = 5 // Nick, 2 nov 2026

export function KlantTabs({ namen }: { namen: Record<string, string> }) {
  const pad = usePathname()
  const [tabs, setTabs] = useState<Tab[]>([])
  const id = pad.match(/^\/dashboard\/klanten\/([^/]+)/)?.[1]
  const huidig = id && namen[id] ? id : undefined

  useEffect(() => {
    let lijst: Tab[] = []
    try {
      lijst = (JSON.parse(localStorage.getItem(KEY) || "[]") as Tab[]).filter((t) => namen[t.id])
    } catch {}
    if (huidig) {
      const href = `${location.pathname}${location.search}`
      if (lijst.some((t) => t.id === huidig)) lijst = lijst.map((t) => (t.id === huidig ? { ...t, href } : t))
      else if (lijst.length >= MAX) meld(`Maximaal ${MAX} klanten tegelijk open. Sluit eerst een tabblad.`)
      else lijst = [...lijst, { id: huidig, href }]
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(lijst))
    } catch {}
    const t = setTimeout(() => setTabs(lijst), 0)
    return () => clearTimeout(t)
  }, [pad, huidig, namen])

  const zet = (lijst: Tab[]) => {
    setTabs(lijst)
    try {
      localStorage.setItem(KEY, JSON.stringify(lijst))
    } catch {}
  }
  const sluit = (weg: string) => zet(tabs.filter((t) => t.id !== weg))
  // Verslepen om de volgorde te wisselen (Nick, 2 nov 2026).
  const [sleep, setSleep] = useState<string | null>(null)
  const naar = (doel: string) => {
    if (!sleep || sleep === doel) return
    const lijst = tabs.filter((t) => t.id !== sleep)
    lijst.splice(lijst.findIndex((t) => t.id === doel) + (tabs.findIndex((t) => t.id === sleep) < tabs.findIndex((t) => t.id === doel) ? 1 : 0), 0, tabs.find((t) => t.id === sleep)!)
    zet(lijst)
  }

  if (tabs.length < 2) return null
  return (
    <nav aria-label="Open klanten" className="flex gap-1 overflow-x-auto border-b border-lijn px-8 pt-3 print:hidden">
      {tabs.map((t) => (
        <span
          key={t.id}
          draggable
          onDragStart={(e) => { setSleep(t.id); e.dataTransfer.effectAllowed = "move" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); naar(t.id); setSleep(null) }}
          onDragEnd={() => setSleep(null)}
          title="Versleep om de volgorde te wisselen"
          className={`${sleep === t.id ? "opacity-50 " : ""}flex shrink-0 items-center rounded-t-[10px] border border-b-0 text-[13px] ${t.id === huidig ? "border-lijn bg-vlak font-semibold" : "border-transparent text-gedempt hover:text-inkt"} cursor-grab`}
        >
          <Link href={t.href} aria-current={t.id === huidig ? "page" : undefined} className="max-w-[200px] truncate py-2 pl-3 pr-1">
            {namen[t.id]}
          </Link>
          <button type="button" onClick={() => sluit(t.id)} aria-label={`Sluit tabblad ${namen[t.id]}`} className="grid size-[28px] cursor-pointer place-items-center rounded-full hover:bg-accent/10">
            ×
          </button>
        </span>
      ))}
    </nav>
  )
}
