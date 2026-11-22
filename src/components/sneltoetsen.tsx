"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { GA_NAAR, OPEN_ZOEK } from "@/components/zoek"
import { GEWIJZIGD } from "@/components/weergave"
import { useTaal } from "@/components/taal-klant"
import "./sneltoetsen.css"

// Een zwevende knop rechts midden aan de rand met de lijst van sneltoetsen
// (eigenaar, 22 nov 2026: "maak een zwevende knop rechts midden aan de rand
// voor sneltoetsen en een lijst van sneltoetsen"). Alleen met muis of trackpad
// op een breed scherm: op een touchscreen heb je geen toetsenbord. De lijst
// opent als paneel vanaf dezelfde rand; ? opent hem ook.

const KEY = "gronn-weergave"
const leesAan = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}").toetsen !== false
  } catch {
    return true
  }
}
const typt = (t: EventTarget | null) => {
  const d = t as HTMLElement | null
  return !!d && (d.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(d.tagName))
}

const Kbd = ({ children }: { children: React.ReactNode }) => <kbd className="snel-kbd">{children}</kbd>

export function Sneltoetsen() {
  const taal = useTaal()
  const en = taal === "en"
  const pad = usePathname()
  const doos = useRef<HTMLDialogElement>(null)
  const [mac, setMac] = useState(true)
  const [aan, setAan] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
      setAan(leesAan())
    }, 0)
    const zet = () => setAan(leesAan())
    addEventListener(GEWIJZIGD, zet)
    // ? opent de lijst, net als op veel andere sites
    const toets = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey || typt(e.target) || !leesAan()) return
      if (document.querySelector("dialog[open]") && !doos.current?.open) return
      e.preventDefault()
      const d = doos.current
      if (!d) return
      if (d.open) d.close()
      else d.showModal()
    }
    addEventListener("keydown", toets)
    return () => {
      clearTimeout(t)
      removeEventListener(GEWIJZIGD, zet)
      removeEventListener("keydown", toets)
    }
  }, [])

  // een andere pagina: dicht
  useEffect(() => doos.current?.close(), [pad])

  const schakel = (waarde: boolean) => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}")
      localStorage.setItem(KEY, JSON.stringify({ ...s, toetsen: waarde }))
    } catch {}
    setAan(waarde)
    dispatchEvent(new Event(GEWIJZIGD))
  }

  // het systeem achter de login heeft zijn eigen sneltoetsen
  if (pad.startsWith("/dashboard")) return null

  return (
    <>
      <button type="button" className="snel-tab" aria-haspopup="dialog" onClick={() => doos.current?.showModal()}>
        <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="18" height="12" rx="2.5" />
          <path d="M6 9h.01M9.5 9h.01M13 9h.01M16.5 9h.01M7 13h8" />
        </svg>
        <span className="snel-tab-tekst">{en ? "Shortcuts" : "Sneltoetsen"}</span>
      </button>

      <dialog ref={doos} className="snel-paneel" aria-labelledby="snel-titel" onClick={(e) => e.target === e.currentTarget && doos.current?.close()}>
        <div className="snel-binnen">
          <div className="snel-kop">
            <h2 id="snel-titel" className="snel-titel">{en ? "Keyboard shortcuts" : "Sneltoetsen"}</h2>
            <button type="button" className="snel-sluit" onClick={() => doos.current?.close()} aria-label={en ? "Close" : "Sluiten"}>
              <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l12 12M17 5 5 17" /></svg>
            </button>
          </div>

          <section aria-labelledby="snel-overal">
            <h3 id="snel-overal" className="snel-groep">{en ? "Anywhere" : "Overal"}</h3>
            <ul className="snel-lijst">
              <li><span>{en ? "Search the site" : "Zoek op de site"}</span><span className="snel-toetsen"><Kbd>{mac ? "⌘" : "Ctrl"}</Kbd><Kbd>K</Kbd></span></li>
              <li><span>{en ? "Search" : "Zoeken"}</span><span className="snel-toetsen"><Kbd>/</Kbd></span></li>
              <li><span>{en ? "This list" : "Deze lijst"}</span><span className="snel-toetsen"><Kbd>?</Kbd></span></li>
              <li><span>{en ? "Back" : "Terug"}</span><span className="snel-toetsen"><Kbd>⌫</Kbd></span></li>
              <li><span>{en ? "Close a menu or window" : "Menu of venster sluiten"}</span><span className="snel-toetsen"><Kbd>Esc</Kbd></span></li>
              <li><span>{en ? "Next / previous link" : "Volgende / vorige link"}</span><span className="snel-toetsen"><Kbd>Tab</Kbd><Kbd>⇧ Tab</Kbd></span></li>
            </ul>
          </section>

          <section aria-labelledby="snel-ga">
            <h3 id="snel-ga" className="snel-groep">{en ? "Go to (G, then…)" : "Ga naar (G, dan…)"}</h3>
            <ul className="snel-lijst">
              {GA_NAAR.map((x) => (
                <li key={x.toets}><span>{x.label[taal]}</span><span className="snel-toetsen"><Kbd>G</Kbd><Kbd>{x.toets.toUpperCase()}</Kbd></span></li>
              ))}
            </ul>
          </section>

          <div className="snel-voet">
            <button type="button" className="snel-knop" onClick={() => { doos.current?.close(); dispatchEvent(new Event(OPEN_ZOEK)) }}>
              {en ? "Search now" : "Nu zoeken"}
            </button>
            {/* WCAG 2.1.4: lettertoetsen moeten uit kunnen */}
            <label className="snel-schakel">
              <span>{en ? "Single-key shortcuts" : "Lettertoetsen"}</span>
              <input type="checkbox" role="switch" checked={aan} onChange={(e) => schakel(e.target.checked)} />
            </label>
          </div>
        </div>
      </dialog>
    </>
  )
}
