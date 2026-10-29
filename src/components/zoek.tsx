"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { kies, type Taal } from "./taal"
import { useTaal } from "./taal-klant"
import type { Soort, Treffer } from "@/lib/zoek-index"

// Zoeken en sneltoetsen, terug uit de oude site (eigenaar, 21 okt 2026:
// "shortcut knoppen en een interactieve zoek functie mist ook nog"). Zelfde
// werking als daar: ⌘K of Ctrl K overal, "/", Backspace (terug) en g + letter als sneltoetsen,
// live suggesties per soort, pijltjes en Enter. Eén <dialog>: Esc sluit, de
// focus blijft erin en keert daarna terug. Openen kan ook vanuit het menu
// (event "gronn:zoek"), dus geen eigen knop op het scherm.
//
// Losse lettertoetsen vallen onder WCAG 2.1.4: ze moeten uit te zetten zijn.
// Dat kan in Weergave ("Sneltoetsen"); ⌘K heeft een modifier en blijft altijd aan.

export const OPEN_ZOEK = "gronn:zoek"

const GA_NAAR: { toets: string; href: string; label: { nl: string; en: string } }[] = [
  { toets: "h", href: "/", label: { nl: "Home", en: "Home" } },
  { toets: "v", href: "/vijvers", label: { nl: "Vijvers", en: "Ponds" } },
  { toets: "t", href: "/tuinen", label: { nl: "Tuinen", en: "Gardens" } },
  { toets: "w", href: "/werk", label: { nl: "Werk", en: "Work" } },
  { toets: "s", href: "/shop", label: { nl: "Shop", en: "Shop" } },
  { toets: "o", href: "/over", label: { nl: "Studio", en: "Studio" } },
  { toets: "f", href: "/faq", label: { nl: "Veelgestelde vragen", en: "FAQ" } },
  { toets: "k", href: "/kennismaken", label: { nl: "Kennismaken", en: "Get in touch" } },
]

const SOORT: Record<Soort, { nl: string; en: string }> = {
  pagina: { nl: "Pagina", en: "Page" },
  dienst: { nl: "Dienst", en: "Service" },
  shop: { nl: "Shop", en: "Shop" },
  werk: { nl: "Werk", en: "Work" },
  vraag: { nl: "Vraag", en: "Question" },
  journaal: { nl: "Journaal", en: "Journal" },
}
const PER_SOORT: [Soort, number][] = [["pagina", 3], ["dienst", 5], ["shop", 4], ["werk", 2], ["vraag", 3], ["journaal", 3]]

/** Kleine letters zonder accenten: "tuinbeplanting" vindt ook "Tuïnbeplanting". */
const plat = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

type Hit = Treffer & { score: number; waar: "titel" | "sub"; van: number }

function zoek(q: string, index: Treffer[], taal: Taal): Hit[] {
  const p = plat(q.trim())
  if (!p) return []
  const hits: Hit[] = []
  for (const t of index) {
    const ti = plat(kies(t.titel, taal)).indexOf(p)
    const si = t.sub ? plat(kies(t.sub, taal)).indexOf(p) : -1
    // begint de titel ermee, dan is het bijna altijd wat je bedoelt
    if (ti === 0) hits.push({ ...t, score: 0, waar: "titel", van: 0 })
    else if (ti > 0) hits.push({ ...t, score: 1, waar: "titel", van: ti })
    else if (si >= 0) hits.push({ ...t, score: 2, waar: "sub", van: si })
  }
  // per soort een paar, dan de titeltreffers voor de rest (sort is stabiel: de soortvolgorde blijft)
  return PER_SOORT.flatMap(([soort, max]) =>
    hits.filter((h) => h.soort === soort).sort((a, b) => a.score - b.score).slice(0, max),
  ).sort((a, b) => Number(a.score > 1) - Number(b.score > 1))
}

/** Het gevonden stuk in oranje. */
function Gemarkeerd({ tekst, van, lengte }: { tekst: string; van: number; lengte: number }) {
  if (van < 0) return <>{tekst}</>
  return (
    <>
      {tekst.slice(0, van)}
      <mark className="bg-transparent font-semibold text-oranje-tekst">{tekst.slice(van, van + lengte)}</mark>
      {tekst.slice(van + lengte)}
    </>
  )
}

function typt(doel: EventTarget | null) {
  if (!(doel instanceof HTMLElement)) return false
  if (doel.closest("dialog:not([open])")) return false // net gesloten: de focus hangt nog in het veld
  return doel.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(doel.tagName)
}

/** Staan de lettertoetsen aan? Standaard ja; uit te zetten in Weergave. */
function toetsenAan() {
  try {
    return JSON.parse(localStorage.getItem("gronn-weergave") || "{}").toetsen !== false
  } catch {
    return true
  }
}

/**
 * Naar een pagina zoals met een gewone link: via een klik op een <a>; bij een
 * anker op dezelfde pagina springt de browser zelf, anders de router.
 */
function volg(href: string, push: (href: string) => void) {
  const a = document.createElement("a")
  a.href = href
  a.hidden = true
  a.addEventListener("click", (e) => {
    if (e.defaultPrevented) return
    const [p, anker] = href.split("#")
    if (anker && location.pathname === p) return // de browser springt zelf naar het anker
    e.preventDefault()
    push(href)
  })
  document.body.append(a)
  a.click()
  a.remove()
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-grid min-w-[24px] place-items-center rounded-[6px] border border-gebroken-wit/25 px-1.5 py-0.5 font-sans text-[12px] font-semibold not-italic leading-[1.4] text-gebroken-wit/85">
    {children}
  </kbd>
)

export function Zoek({ index }: { index: Treffer[] }) {
  const taal = useTaal()
  const router = useRouter()
  const pad = usePathname()
  const doos = useRef<HTMLDialogElement>(null)
  const veld = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState("")
  const [cursor, setCursor] = useState(0)
  const [mac, setMac] = useState(true)
  const lijstId = useId()

  const hits = useMemo(() => zoek(q, index, taal), [q, index, taal])
  const heeftQ = q.trim().length > 0

  // Rechtstreeks op de <dialog>, niet via state: een Esc en meteen "/" erna
  // vielen anders in één render samen, en dan ging hij niet meer open.
  const sluit = useCallback(() => doos.current?.close(), [])
  const openen = useCallback(() => {
    const d = doos.current
    if (!d || d.open) return
    d.showModal()
    veld.current?.focus()
  }, [])

  // een andere pagina: dicht
  useEffect(() => doos.current?.close(), [pad])

  // de sneltoetsen
  useEffect(() => {
    const t = setTimeout(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), 0)
    let g = 0
    const toets = (e: KeyboardEvent) => {
      // Het systeem achter de login heeft zijn eigen zoekvenster en sneltoetsen.
      if (location.pathname.startsWith("/dashboard")) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (doos.current?.open) sluit()
        else openen()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typt(e.target) || doos.current?.open || !toetsenAan()) return
      if (e.key === "/") {
        e.preventDefault()
        openen()
      } else if (e.key === "Backspace") {
        // terug naar de vorige pagina (eigenaar, 22 okt 2026: "terug toevoegen met backspace")
        e.preventDefault()
        history.back()
      } else if (e.key === "g") {
        g = Date.now()
      } else if (Date.now() - g < 1200) {
        g = 0
        const doel = GA_NAAR.find((x) => x.toets === e.key.toLowerCase())
        if (doel) volg(doel.href, router.push)
      }
    }
    addEventListener("keydown", toets)
    addEventListener(OPEN_ZOEK, openen)
    return () => {
      clearTimeout(t)
      removeEventListener("keydown", toets)
      removeEventListener(OPEN_ZOEK, openen)
    }
  }, [router, openen, sluit])


  const en = taal === "en"
  const actief = hits[cursor]

  return (
    <dialog
      ref={doos}
      aria-label={en ? "Search this site" : "Zoek op deze site"}
      onClose={() => {
        veld.current?.blur()
        setQ("")
        setCursor(0)
      }}
      onClick={(e) => e.target === e.currentTarget && sluit()}
      className="donker glas-diep mx-auto mt-[min(12vh,120px)] mb-auto w-[min(640px,calc(100vw-2*var(--goot)))] max-w-none overflow-hidden rounded-[24px] border-0 p-0 text-gebroken-wit backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-3 border-b border-gebroken-wit/15 px-5">
        <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-oranje">
          <circle cx="9.5" cy="9.5" r="6" />
          <path d="m14 14 5 5" />
        </svg>
        <input
          ref={veld}
          type="text"
          enterKeyHint="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls={lijstId}
          aria-autocomplete="list"
          aria-activedescendant={actief ? `${lijstId}-${cursor}` : undefined}
          aria-label={en ? "Search" : "Zoeken"}
          placeholder={en ? "Search ponds, gardens, shop, work…" : "Zoek vijvers, tuinen, shop, werk…"}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setCursor(0)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setCursor((c) => Math.min(c + 1, hits.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setCursor((c) => Math.max(c - 1, 0))
            } else if (e.key === "Enter" && actief) {
              e.preventDefault()
              sluit()
              volg(actief.href, router.push)
            }
          }}
          className="h-[64px] min-w-0 flex-1 appearance-none border-0 bg-transparent text-[17px] text-gebroken-wit outline-none placeholder:text-gebroken-wit/55"
        />
        <button type="button" onClick={sluit} className="lbl grid h-[var(--knop)] cursor-pointer place-items-center rounded-full border-0 bg-transparent px-2 text-gebroken-wit/70 hover:text-gebroken-wit focus-visible:outline-2 focus-visible:outline-gebroken-wit">
          {en ? "Close" : "Sluiten"}
        </button>
      </div>

      <div className="max-h-[min(60svh,440px)] overflow-y-auto overscroll-contain">
        <ul id={lijstId} role="listbox" aria-label={en ? "Results" : "Resultaten"} className="m-0 list-none p-2 empty:hidden">
          {hits.map((h, i) => {
            const titel = kies(h.titel, taal)
            const sub = h.sub ? kies(h.sub, taal) : ""
            const n = q.trim().length
            return (
              <li
                key={h.href + i}
                id={`${lijstId}-${i}`}
                role="option"
                aria-selected={i === cursor}
                onMouseMove={() => setCursor(i)}
                onClick={() => {
                  sluit()
                  volg(h.href, router.push)
                }}
                className="grid cursor-pointer grid-cols-[72px_minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-[14px] px-3 py-2.5 aria-selected:bg-gebroken-wit/10"
              >
                <span className="lbl text-gebroken-wit/55">{SOORT[h.soort][taal]}</span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-[1.35]">
                    {h.waar === "titel" ? <Gemarkeerd tekst={titel} van={h.van} lengte={n} /> : titel}
                  </span>
                  {sub && (
                    <span className="block truncate text-[13px] leading-[1.5] text-gebroken-wit/65">
                      {h.waar === "sub" ? <Gemarkeerd tekst={sub} van={h.van} lengte={n} /> : sub}
                    </span>
                  )}
                </span>
                {h.prijs && <span className="text-[12px] tabular-nums text-gebroken-wit/75">{kies(h.prijs, taal)}</span>}
              </li>
            )
          })}
        </ul>

        {heeftQ && hits.length === 0 && (
          <p className="m-0 px-5 py-8 leading-[1.6] text-gebroken-wit/70">
            {en ? "Nothing matches that. Try a service, a plant or a place." : "Daar past niets bij. Probeer een dienst, een plant of een plaats."}
          </p>
        )}

        {/* zonder zoekwoord: de sneltoetsen */}
        {!heeftQ && (
          <div className="grid gap-5 px-5 py-6 text-[14px] pointer-coarse:hidden sm:grid-cols-2">
            <div>
              <p className="lbl m-0 mb-3 text-gebroken-wit/55">{en ? "Anywhere" : "Overal"}</p>
              <ul className="m-0 grid list-none gap-2 p-0">
                <li className="flex items-center justify-between gap-3"><span>{en ? "Search" : "Zoeken"}</span><span className="flex gap-1"><Kbd>{mac ? "⌘" : "Ctrl"}</Kbd><Kbd>K</Kbd></span></li>
                <li className="flex items-center justify-between gap-3"><span>{en ? "Search" : "Zoeken"}</span><Kbd>/</Kbd></li>
                <li className="flex items-center justify-between gap-3"><span>{en ? "Move, open" : "Kiezen, openen"}</span><span className="flex gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>↵</Kbd></span></li>
                <li className="flex items-center justify-between gap-3"><span>{en ? "Close" : "Sluiten"}</span><Kbd>Esc</Kbd></li>
                <li className="flex items-center justify-between gap-3"><span>{en ? "Back" : "Terug"}</span><Kbd>⌫</Kbd></li>
              </ul>
            </div>
            <div>
              <p className="lbl m-0 mb-3 text-gebroken-wit/55">{en ? "Go to (G, then…)" : "Ga naar (G, dan…)"}</p>
              <ul className="m-0 grid list-none gap-2 p-0">
                {GA_NAAR.map((x) => (
                  <li key={x.toets} className="flex items-center justify-between gap-3">
                    <span>{x.label[taal]}</span>
                    <span className="flex gap-1"><Kbd>G</Kbd><Kbd>{x.toets.toUpperCase()}</Kbd></span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="m-0 text-[12px] leading-[1.5] text-gebroken-wit/55 sm:col-span-2">
              {en ? "Single-key shortcuts can be switched off under Display." : "Lettertoetsen zet je uit onder Weergave."}
            </p>
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {heeftQ ? (en ? `${hits.length} results` : `${hits.length} resultaten`) : ""}
      </p>
    </dialog>
  )
}
