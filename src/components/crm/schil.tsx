"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Assistent } from "@/components/beheer/assistent"
import { KleurKeuze } from "@/components/beheer/kleur"
import { GROEPEN, NIEUW, onderdeelVan } from "@/lib/crm/navigatie"
import { Icoon } from "./iconen"
import { KlantTabs } from "./klant-tabs"
import { Melding } from "./melding"
import { OPEN_ZOEKVENSTER, Zoekvenster, type Treffer } from "./zoekvenster"

// De schil van het bedrijfssysteem (eigenaar, 29 okt 2026: "het moest
// dashboard helemaal vervangen door een nieuw systeem"): links een
// inklapbare zijbalk met alle onderdelen, "+ Nieuw" en zoeken (⌘K), in het
// midden de pagina, rechts Grønn als zijpaneel (⌘J). Grønn weet op een
// klantkaart vanzelf over welke klant het gaat. Eerst alleen voor desktop;
// sinds 2 nov 2026 ook op de telefoon (Nick: "kun je dashboard ook mobiel
// vriendelijk maken"): onder lg een balk bovenaan, de zijbalk schuift als
// menu over de pagina en Grønn vult het scherm.
const KEY = "gronn-crm-schil"
/** Opent Grønn van buiten de schil, bijvoorbeeld vanaf een klantkaart. */
export const OPEN_GRØNN = "crm-gronn"

export function Schil({ index, tellers, namen, children }: { index: Treffer[]; tellers: { aanvragen: number; opvolgen: number }; namen: Record<string, string>; children: React.ReactNode }) {
  const pad = usePathname()
  const actief = onderdeelVan(pad)
  const klantId = /^\/dashboard\/klanten\/([^/]+)/.exec(pad)?.[1]
  const [smal, setSmal] = useState(false)
  const [menu, setMenu] = useState(false)
  const [grønn, setGrønn] = useState(false)
  const [nieuw, setNieuw] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = JSON.parse(localStorage.getItem(KEY) || "{}")
        setSmal(!!s.smal)
        setGrønn(!!s.grønn)
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [])
  const bewaar = (s: { smal: boolean; grønn: boolean }) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {}
  }
  const zetSmal = (v: boolean) => (setSmal(v), bewaar({ smal: v, grønn }))
  const zetGrønn = (v: boolean) => (setGrønn(v), bewaar({ smal, grønn: v }))

  useEffect(() => {
    const toets = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault()
        setGrønn((g) => {
          bewaar({ smal, grønn: !g })
          return !g
        })
      }
    }
    const open = () => {
      setGrønn(true)
      bewaar({ smal, grønn: true })
    }
    addEventListener("keydown", toets)
    addEventListener(OPEN_GRØNN, open)
    return () => {
      removeEventListener("keydown", toets)
      removeEventListener(OPEN_GRØNN, open)
    }
  }, [smal])

  const item = "flex h-[36px] items-center gap-3 rounded-[8px] px-2.5 text-[14px] font-medium transition-colors"
  // Op de telefoon is het menu altijd breed: ingeklapt heeft daar geen zin.
  const klein = smal && !menu
  return (
    <div className="crm min-h-svh print:block print:min-w-0 print:bg-white lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="sticky top-0 z-30 flex h-[56px] items-center gap-2 border-b border-lijn bg-zijbalk px-3 print:hidden lg:hidden">
        <button type="button" onClick={() => setMenu(true)} aria-expanded={menu} aria-controls="crm-menu" className="crm-knop-rand crm-knop-klein">
          <Icoon naam="uitklappen" className="size-[16px]" /> Menu
        </button>
        <Link href="/dashboard" className="flex flex-1 items-center justify-center" aria-label="GRØNN Studio, naar Vandaag">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="" className="hidden h-[14px] w-auto dark:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="h-[14px] w-auto dark:hidden" />
        </Link>
        <button type="button" onClick={() => dispatchEvent(new Event(OPEN_ZOEKVENSTER))} className="crm-knop-rand crm-knop-klein">
          <Icoon naam="zoek" className="size-[16px]" /> Zoeken
        </button>
      </div>
      {menu && <div aria-hidden onClick={() => setMenu(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
      <aside
        id="crm-menu"
        aria-label="Systeem"
        // Elke link in het menu sluit het op de telefoon, ook als alleen ?nieuw=1 of #nieuw verandert.
        onClick={(e) => (e.target as Element).closest("a") && setMenu(false)}
        className={`flex h-svh flex-col border-r border-lijn bg-zijbalk print:hidden max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[min(300px,85vw)] max-lg:shadow-[0_0_40px_rgb(0_0_0/.3)] lg:sticky lg:top-0 ${menu ? "" : "max-lg:hidden"} ${klein ? "lg:w-[64px]" : "lg:w-[248px]"}`}
      >
        <div className={`flex h-[60px] shrink-0 items-center ${klein ? "justify-center" : "justify-between pr-2 pl-4"}`}>
          {!klein && (
            <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="GRØNN Studio, naar Vandaag">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair.svg" alt="" className="hidden h-[16px] w-auto dark:block" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="h-[16px] w-auto dark:hidden" />
            </Link>
          )}
          <button type="button" onClick={() => zetSmal(!smal)} aria-label={klein ? "Zijbalk uitklappen" : "Zijbalk inklappen"} title={klein ? "Uitklappen" : "Inklappen"} className="crm-knop-stil crm-knop-klein size-[32px] !px-0 max-lg:hidden">
            <Icoon naam={klein ? "uitklappen" : "inklappen"} className="size-[16px]" />
          </button>
          <button type="button" onClick={() => setMenu(false)} aria-label="Menu sluiten" className="crm-knop-stil crm-knop-klein size-[32px] !px-0 lg:hidden">
            <Icoon naam="sluit" className="size-[16px]" />
          </button>
        </div>

        <div className={`grid gap-1.5 ${klein ? "px-2" : "px-3"}`}>
          <button type="button" onClick={() => setNieuw(!nieuw)} aria-expanded={nieuw} aria-controls="crm-nieuw" className={`crm-knop w-full ${klein ? "!px-0" : "justify-start"}`} title="Nieuw">
            <Icoon naam="plus" className="size-[16px]" />
            <span className={klein ? "sr-only" : ""}>Nieuw</span>
          </button>
          {nieuw && (
            <ul id="crm-nieuw" className={`crm-paneel m-0 list-none p-1 shadow-[0_12px_30px_-12px_rgb(0_0_0/.25)] ${klein ? "absolute top-[100px] left-[60px] z-20 w-[260px]" : ""}`}>
              {NIEUW.map((n) => (
                <li key={n.naam}>
                  <Link href={n.href} onClick={() => setNieuw(false)} className="block rounded-[6px] px-3 py-2 hover:bg-accent/10">
                    <span className="block text-[14px] font-semibold">{n.naam}</span>
                    <span className="block text-[12px] text-gedempt">{n.uitleg}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => dispatchEvent(new Event(OPEN_ZOEKVENSTER))} className={`${item} w-full cursor-pointer border border-lijn bg-vlak text-gedempt hover:text-inkt ${klein ? "justify-center !px-0" : ""}`} title="Zoeken (⌘K)">
            <Icoon naam="zoek" className="size-[16px]" />
            <span className={klein ? "sr-only" : "flex-1 text-left"}>Zoeken</span>
            {!klein && <kbd className="crm-cijfer text-[11px]">⌘K</kbd>}
          </button>
        </div>

        <nav aria-label="Onderdelen" className={`mt-4 flex-1 overflow-y-auto ${klein ? "px-2" : "px-3"}`}>
          {GROEPEN.map((g) => (
            <div key={g.naam} className="mb-4">
              <p className={`crm-label m-0 mb-1 px-2.5 ${klein ? "sr-only" : ""}`}>{g.naam}</p>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {g.onderdelen.map((o) => {
                  const hier = actief?.href === o.href
                  const n = o.teller ? tellers[o.teller] : 0
                  return (
                    <li key={o.href}>
                      <Link
                        href={o.href}
                        aria-current={hier ? "page" : undefined}
                        title={klein ? o.naam : undefined}
                        className={`${item} relative ${klein ? "justify-center !px-0" : ""} ${hier ? "bg-vlak text-inkt shadow-[0_1px_0_rgb(0_0_0/.04)] ring-1 ring-lijn" : "text-gedempt hover:bg-vlak/70 hover:text-inkt"}`}
                      >
                        <Icoon naam={o.icoon} className={`size-[18px] ${hier ? "text-accent-tekst" : ""}`} />
                        <span className={klein ? "sr-only" : "flex-1"}>{o.naam}</span>
                        {n > 0 && (
                          <span className={klein ? "absolute top-1 right-1 size-[8px] rounded-full bg-let" : "crm-badge crm-badge-let h-[20px] px-1.5 crm-cijfer"}>
                            <span className={klein ? "sr-only" : ""}>{n}</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={`grid gap-1 border-t border-lijn py-3 ${klein ? "px-2" : "px-3"}`}>
          <button type="button" onClick={() => (zetGrønn(!grønn), setMenu(false))} aria-pressed={grønn} className={`${item} w-full cursor-pointer ${grønn ? "bg-vlak text-inkt ring-1 ring-lijn" : "text-gedempt hover:bg-vlak/70 hover:text-inkt"} ${klein ? "justify-center !px-0" : ""}`} title="Grønn (⌘J)">
            <Icoon naam="grønn" className={`size-[18px] ${grønn ? "text-accent-tekst" : ""}`} />
            <span className={klein ? "sr-only" : "flex-1 text-left"}>Vraag Grønn</span>
            {!klein && <kbd className="crm-cijfer text-[11px]">⌘J</kbd>}
          </button>
          {!klein && (
            <div className="mt-1 px-1">
              <KleurKeuze />
            </div>
          )}
          <div className={`mt-1 flex ${klein ? "flex-col items-center gap-1" : "gap-1 px-1"}`}>
            <Link href="/" className="crm-knop-stil crm-knop-klein" title="Naar de website">
              <Icoon naam="site" className="size-[15px]" />
              <span className={klein ? "sr-only" : ""}>Site</span>
            </Link>
            <a href="/api/uitloggen" className="crm-knop-stil crm-knop-klein" title="Uitloggen">
              <Icoon naam="uit" className="size-[15px]" />
              <span className={klein ? "sr-only" : ""}>Uitloggen</span>
            </a>
          </div>
        </div>
      </aside>

      <div className="@container min-w-0"><KlantTabs namen={namen} />{children}<Melding /></div>

      {grønn && (
        <aside aria-label="Grønn" className="flex h-svh flex-col border-l border-lijn bg-vlak print:hidden max-lg:fixed max-lg:inset-0 max-lg:z-50 lg:sticky lg:top-0 lg:w-[380px]">
          <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-lijn px-4">
            <span className="flex items-center gap-2 font-semibold">
              <Icoon naam="grønn" className="size-[18px] text-accent-tekst" /> Grønn
              <span className="crm-badge crm-badge-stil">{klantId ? "kent deze klant" : "kent je klanten"}</span>
            </span>
            <button type="button" onClick={() => zetGrønn(false)} aria-label="Grønn sluiten" className="crm-knop-stil crm-knop-klein size-[32px] !px-0">
              <Icoon naam="sluit" className="size-[16px]" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <Assistent
              key={klantId ?? "algemeen"}
              klantId={klantId}
              snel={klantId ? ["Vat deze klant samen", "Wat ontbreekt nog in de opname?", "Is de prijs scherp genoeg?", "Schrijf een bericht voor de volgende stap"] : undefined}
            />
          </div>
        </aside>
      )}
      <Zoekvenster index={index} />
    </div>
  )
}
