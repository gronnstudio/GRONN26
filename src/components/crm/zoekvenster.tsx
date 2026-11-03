"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { NIEUW, ONDERDELEN } from "@/lib/crm/navigatie"
import { Icoon } from "./iconen"

// Zoeken en doen in één venster (⌘K of Ctrl K): klanten, tuinen,
// calculaties, catalogus en leveranciers, plus de onderdelen en "nieuw".
// De lijst komt van de server (layout.tsx), zonder telefoon of e-mail.
export type Treffer = { groep: string; titel: string; sub?: string; href: string }

export const OPEN_ZOEKVENSTER = "crm-zoek"

const plat = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const VASTE: Treffer[] = [
  ...NIEUW.map((n) => ({ groep: "Nieuw", titel: `Nieuw: ${n.naam}`, sub: n.uitleg, href: n.href })),
  ...ONDERDELEN.map((o) => ({ groep: "Ga naar", titel: o.naam, href: o.href })),
]
const PER_GROEP = 6

export function Zoekvenster({ index }: { index: Treffer[] }) {
  const router = useRouter()
  const doos = useRef<HTMLDialogElement>(null)
  const veld = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState("")
  const [keuze, setKeuze] = useState(0)

  const lijst = useMemo(() => {
    const woorden = plat(q).split(/\s+/).filter(Boolean)
    const alle = woorden.length ? [...index, ...VASTE] : VASTE
    const passend = alle.filter((t) => woorden.every((w) => plat(`${t.titel} ${t.sub ?? ""} ${t.groep}`).includes(w)))
    const per: Record<string, number> = {}
    return passend.filter((t) => (per[t.groep] = (per[t.groep] ?? 0) + 1) <= PER_GROEP)
  }, [q, index])

  useEffect(() => {
    const open = () => {
      const d = doos.current
      if (!d || d.open) return
      setQ("")
      setKeuze(0)
      d.showModal()
      veld.current?.focus()
    }
    const toets = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (doos.current?.open) doos.current.close()
        else open()
      }
    }
    addEventListener("keydown", toets)
    addEventListener(OPEN_ZOEKVENSTER, open)
    return () => {
      removeEventListener("keydown", toets)
      removeEventListener(OPEN_ZOEKVENSTER, open)
    }
  }, [])

  const ga = (t: Treffer | undefined) => {
    if (!t) return
    doos.current?.close()
    if (t.href.startsWith("http")) window.open(t.href, "_blank", "noopener")
    else router.push(t.href)
  }

  return (
    <dialog
      ref={doos}
      aria-label="Zoeken en doen"
      onClick={(e) => e.target === e.currentTarget && doos.current?.close()}
      className="crm-paneel fixed top-[12vh] mx-auto w-[min(640px,92vw)] max-w-none overflow-hidden p-0 text-inkt shadow-[0_24px_60px_-20px_rgb(0_0_0/.35)] backdrop:bg-black/30"
    >
      <div className="flex items-center gap-3 border-b border-lijn px-4">
        <Icoon naam="zoek" className="size-[18px] text-gedempt" />
        <input
          ref={veld}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setKeuze(0)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setKeuze((k) => Math.min(k + 1, lijst.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setKeuze((k) => Math.max(k - 1, 0))
            } else if (e.key === "Enter") {
              e.preventDefault()
              ga(lijst[keuze])
            }
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls="crm-treffers"
          aria-activedescendant={lijst[keuze] ? `crm-treffer-${keuze}` : undefined}
          aria-label="Zoek een klant, tuin, calculatie of onderdeel"
          placeholder="Zoek een klant, tuin, calculatie, product…"
          className="h-[52px] min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-voorbeeld"
        />
        <kbd className="crm-badge-stil crm-badge font-sans">Esc</kbd>
      </div>
      <ul id="crm-treffers" role="listbox" aria-label="Treffers" className="m-0 max-h-[56vh] list-none overflow-y-auto p-2">
        {lijst.map((t, i) => (
          <li key={`${t.groep}-${t.href}-${t.titel}`}>
            {(i === 0 || lijst[i - 1].groep !== t.groep) && <p className="crm-label m-0 px-3 pt-3 pb-1">{t.groep}</p>}
            <div
              id={`crm-treffer-${i}`}
              role="option"
              aria-selected={i === keuze}
              onMouseMove={() => setKeuze(i)}
              onClick={() => ga(t)}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-[8px] px-3 py-2 ${i === keuze ? "bg-accent/10" : ""}`}
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{t.titel}</span>
                {t.sub && <span className="block truncate text-[12px] text-gedempt">{t.sub}</span>}
              </span>
              {i === keuze && <Icoon naam="pijl" className="size-[16px] text-accent-tekst" />}
            </div>
          </li>
        ))}
        {!lijst.length && <li className="px-3 py-6 text-center text-gedempt">Niets gevonden voor &ldquo;{q}&rdquo;.</li>}
      </ul>
    </dialog>
  )
}
