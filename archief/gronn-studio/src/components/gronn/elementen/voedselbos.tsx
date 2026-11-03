"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  DOELEN,
  isVolwassen,
  jaarVan,
  KOLOMMEN,
  leesStand,
  nieuweStand,
  opbrengst,
  plant as plantIn,
  pluk,
  SEIZOEN_MS,
  SEIZOENEN,
  seizoenVan,
  seizoenVerder,
  SOORT,
  SOORTEN,
  soortenVan,
  VOEDSELBOS_SLEUTEL,
  type Plant,
  type SoortId,
  type Stand,
  type Vak,
} from "@/lib/voedselbos"

/**
 * Voedselbos: het perceel van de 404 als microspelletje (eigenaar, 30 sep
 * 2026: "maak hier een microspelletje? simulatie, voedselbossen, maak het
 * onbeperkt speelbaar en gebruik local storage"). De regels staan in
 * `src/lib/voedselbos.ts`; dit is alleen de tafel.
 *
 * Elk vak is een knop met een naam die zegt wat er staat, dus het speelt
 * met toetsenbord en schermlezer net zo goed als met een tik. De klok
 * loopt alleen als het tabblad zichtbaar is en kan op pauze (WCAG 2.2.2);
 * "Volgend seizoen" slaat hem over. Eén kleur lijnwerk (`text-accent`),
 * het ene oranje accent blijft de knop naar de voorpagina. De stand staat
 * in localStorage (`gronn-voedselbos`); zonder localStorage speelt het
 * gewoon, alleen onthoudt het niets. Bij minder beweging tekenen de
 * plantjes zich niet.
 */

const BODEM_TINT = ["", "bg-accent/[0.03]", "bg-accent/[0.06]", "bg-accent/[0.09]", "bg-accent/[0.12]", "bg-accent/[0.15]"]

function Glyph({ plant }: { plant: Plant }) {
  const soort = SOORT[plant.soort]
  const deel = plant.groei / soort.volwassen
  // Net geplant: een kiem. Daarna groeit hij in drie maten naar volwassen.
  if (plant.groei === 0) {
    return (
      <g className="g-kiem">
        <path d="M20 36 C20 32 20 30 20 27" pathLength={1} />
        <path d="M20 30 C17 27 14 28 13 30 C16 31 18 31 20 30" pathLength={1} />
        <path d="M20 29 C23 26 26 27 27 29 C24 30 22 30 20 29" pathLength={1} />
      </g>
    )
  }
  const schaal = deel >= 1 ? 1 : deel >= 0.5 ? 0.78 : 0.56
  const vrucht = plant.rijp
  let lijnen: ReactNode
  switch (plant.soort) {
    case "klaver":
      lijnen = (
        <>
          <path d="M20 36 V29" />
          <circle cx={16.5} cy={27} r={3.5} />
          <circle cx={23.5} cy={27} r={3.5} />
          <circle cx={20} cy={21.5} r={3.5} />
        </>
      )
      break
    case "munt":
      lijnen = (
        <>
          <path d="M20 36 V14" />
          <path d="M20 30 C15 28 12 30 11 33 C15 34 18 33 20 30 M20 30 C25 28 28 30 29 33 C25 34 22 33 20 30" />
          <path d="M20 22 C16 20 13 21 12 24 C16 25 18 24 20 22 M20 22 C24 20 27 21 28 24 C24 25 22 24 20 22" />
          {vrucht && <path d="M18 12 h4 M20 10 v4" />}
        </>
      )
      break
    case "bes":
      lijnen = (
        <>
          <path d="M20 36 V30 M20 32 L14 27 M20 32 L26 27" />
          <path d="M8 30 C6 20 14 12 20 14 C26 12 34 20 32 30 Z" />
          {vrucht && (
            <g fill="currentColor" stroke="none">
              <circle cx={15} cy={23} r={2} />
              <circle cx={21} cy={20} r={2} />
              <circle cx={26} cy={25} r={2} />
            </g>
          )}
        </>
      )
      break
    case "appel":
      lijnen = (
        <>
          <path d="M20 36 V22 M20 27 L15 22 M20 25 L25 20" />
          <circle cx={20} cy={16} r={10} />
          {vrucht && (
            <g fill="currentColor" stroke="none">
              <circle cx={15} cy={15} r={2.2} />
              <circle cx={23} cy={12} r={2.2} />
              <circle cx={24} cy={20} r={2.2} />
            </g>
          )}
        </>
      )
      break
    case "walnoot":
      lijnen = (
        <>
          <path d="M20 37 V20 M20 26 L12 19 M20 23 L28 17" />
          <path d="M4 20 C2 10 12 3 20 5 C28 3 38 10 36 20 C32 24 8 24 4 20 Z" />
          {vrucht && (
            <g fill="currentColor" stroke="none">
              <circle cx={11} cy={15} r={2.4} />
              <circle cx={20} cy={11} r={2.4} />
              <circle cx={29} cy={15} r={2.4} />
            </g>
          )}
        </>
      )
      break
  }
  return (
    <g key={schaal} className="g-kiem" transform={`translate(20 36) scale(${schaal}) translate(-20 -36)`}>
      {lijnen}
    </g>
  )
}

const kolomLetter = (k: number) => String.fromCharCode(65 + k)

function vakNaam(s: Stand, i: number): string {
  const plek = `${kolomLetter(i % KOLOMMEN)}${Math.floor(i / KOLOMMEN) + 1}`
  const vak = s.vakken[i]
  const bodem = `bodem ${Math.round(vak.bodem)} van 5`
  if (!vak.plant) return `${plek}: leeg, ${bodem}`
  const soort = SOORT[vak.plant.soort]
  if (vak.plant.rijp) return `${plek}: ${soort.naam}, rijp, pluk voor ${opbrengst(s, i)} oogst`
  if (!isVolwassen(vak.plant)) return `${plek}: ${soort.naam}, groeit, ${vak.plant.groei} van ${soort.volwassen} seizoenen`
  return `${plek}: ${soort.naam}, volwassen, ${bodem}`
}

export function Voedselbos({ className }: { className?: string }) {
  const pad = usePathname() ?? "/"
  const [stand, setStand] = useState<Stand>(nieuweStand)
  const [gekozen, setGekozen] = useState<SoortId>("klaver")
  const [bericht, setBericht] = useState("")
  const [pauze, setPauze] = useState(false)
  const [zeker, setZeker] = useState(false)
  const geladen = useRef(false)

  // De bewaarde stand pas na de hydratatie: de server kent hem niet.
  useEffect(() => {
    try {
      const oud = leesStand(localStorage.getItem(VOEDSELBOS_SLEUTEL))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- eenmalig de bewaarde stand terugzetten
      if (oud) setStand(oud)
    } catch {}
    geladen.current = true
  }, [])

  useEffect(() => {
    if (!geladen.current) return
    try {
      localStorage.setItem(VOEDSELBOS_SLEUTEL, JSON.stringify(stand))
    } catch {}
  }, [stand])

  // De klok: een seizoen per SEIZOEN_MS, alleen met het tabblad in beeld.
  useEffect(() => {
    if (pauze) return
    const tik = window.setInterval(() => {
      if (document.visibilityState === "visible") setStand(seizoenVerder)
    }, SEIZOEN_MS)
    return () => window.clearInterval(tik)
  }, [pauze])

  const druk = (i: number) => {
    setZeker(false)
    const vak = stand.vakken[i]
    if (vak.plant?.rijp) {
      const uit = pluk(stand, i)!
      setStand(uit.stand)
      setBericht(`${SOORT[vak.plant.soort].naam} geplukt: ${uit.oogst} oogst${uit.zaden ? `, ${uit.zaden} ${uit.zaden === 1 ? "zaad" : "zaden"}` : ""}.`)
      return
    }
    if (vak.plant) {
      const soort = SOORT[vak.plant.soort]
      setBericht(
        isVolwassen(vak.plant)
          ? soort.draagt.length
            ? `${soort.naam} draagt in de ${SEIZOENEN[soort.draagt[0]].toLowerCase()}.`
            : `${soort.naam} maakt de bodem van de buren rijker.`
          : `${soort.naam} groeit nog: ${vak.plant.groei} van ${soort.volwassen} seizoenen.`
      )
      return
    }
    const na = plantIn(stand, i, gekozen)
    const soort = SOORT[gekozen]
    if (!na) {
      setBericht(`Te weinig zaden voor ${soort.naam.toLowerCase()} (${soort.kost}). Pluk eerst iets.`)
      return
    }
    setStand(na)
    setBericht(`${soort.naam} geplant.`)
  }

  const seizoen = SEIZOENEN[seizoenVan(stand)]
  const soorten = soortenVan(stand)
  const gehaald = DOELEN.filter((d) => d.gehaald(stand)).length
  const volgend = DOELEN.find((d) => !d.gehaald(stand))

  return (
    <div
      data-element="Voedselbos"
      className={cn("rounded-[16px] border border-line/10 bg-surface p-[12px] sm:p-[24px]", className)}
    >
      <div className="flex items-baseline justify-between gap-[16px]">
        <h2 className="tekst-annotatie text-muted">Perceel · voedselbos</h2>
        <p data-voedselbos-pad="" className="tekst-annotatie min-w-0 truncate text-muted" title={pad}>
          {pad}
        </p>
      </div>

      <dl className="mt-[12px] grid grid-cols-3 gap-[8px] sm:grid-cols-5 text-[14px] leading-[20px]">
        {[
          ["Seizoen", seizoen],
          ["Jaar", jaarVan(stand)],
          ["Zaden", stand.zaden],
          ["Oogst", stand.oogst],
          ["Soorten", `${soorten} van 5`],
        ].map(([term, waarde]) => (
          <div key={term} className="min-w-0">
            <dt className="tekst-annotatie text-muted">{term}</dt>
            <dd data-voedselbos={String(term).toLowerCase()} className="tekst-knop truncate">
              {waarde}
            </dd>
          </div>
        ))}
      </dl>

      <p data-voedselbos-doel="" className="mt-[12px] text-[14px] leading-[20px]">
        <span className="tekst-annotatie text-muted">
          Doel {Math.min(gehaald + 1, DOELEN.length)} van {DOELEN.length} ·{" "}
        </span>
        {volgend ? volgend.naam : "Alles gehaald. Het bos groeit gewoon door."}
      </p>

      <div role="group" aria-label="Wat plant je?" className="mt-[16px] flex flex-wrap gap-[8px]">
        {SOORTEN.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={gekozen === s.id}
            onClick={() => setGekozen(s.id)}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-[8px] rounded-full border px-[14px] text-[14px] leading-[20px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]",
              gekozen === s.id ? "border-foreground bg-foreground text-background" : "border-current/30 hover:border-current",
              stand.zaden < s.kost && gekozen !== s.id && "text-muted"
            )}
          >
            <span className="font-medium">{s.naam}</span>
            <span aria-hidden className="tekst-annotatie">
              {s.kost}
            </span>
            <span className="sr-only">
              , {s.kost} {s.kost === 1 ? "zaad" : "zaden"}
            </span>
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label="Het perceel, zes bij zes vakken"
        data-voedselbos-veld=""
        className="mt-[16px] grid max-w-[480px] grid-cols-6 gap-[4px]"
      >
        {stand.vakken.map((vak: Vak, i) => (
          <button
            key={i}
            type="button"
            data-vak={i}
            data-soort={vak.plant?.soort ?? ""}
            data-rijp={vak.plant?.rijp ? "" : undefined}
            aria-label={vakNaam(stand, i)}
            onClick={() => druk(i)}
            className={cn(
              "relative aspect-square min-h-[40px] rounded-[8px] border text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]",
              vak.plant?.rijp ? "border-accent" : "border-line/10 hover:border-line/30",
              BODEM_TINT[Math.round(vak.bodem)]
            )}
          >
            <svg aria-hidden viewBox="0 0 40 40" className="absolute inset-0 h-full w-full">
              {vak.plant ? (
                <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <Glyph plant={vak.plant} />
                </g>
              ) : (
                <path d="M14 36 h12" stroke="currentColor" strokeWidth={1} className="opacity-30" />
              )}
            </svg>
          </button>
        ))}
      </div>

      <p aria-live="polite" data-voedselbos-bericht="" className="tekst-annotatie mt-[12px] min-h-[18px] text-muted">
        {bericht || "Kies een plant en tik op een leeg vak."}
      </p>

      <div className="mt-[12px] flex flex-wrap items-center gap-[8px]">
        <button
          type="button"
          onClick={() => {
            setZeker(false)
            setStand(seizoenVerder)
          }}
          className="tekst-knop inline-flex min-h-[44px] items-center rounded-full border border-current/30 px-[16px] hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
        >
          Volgend seizoen
        </button>
        <button
          type="button"
          aria-pressed={pauze}
          onClick={() => setPauze((p) => !p)}
          className="tekst-knop inline-flex min-h-[44px] items-center rounded-full border border-current/30 px-[16px] hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
        >
          Pauze
        </button>
        <button
          type="button"
          onClick={() => {
            if (!zeker) {
              setZeker(true)
              setBericht("Nog een keer drukken om opnieuw te beginnen.")
              return
            }
            setZeker(false)
            setStand(nieuweStand())
            setBericht("Een leeg perceel. Veel plezier.")
          }}
          className="tekst-knop inline-flex min-h-[44px] items-center rounded-full px-[16px] text-muted underline decoration-1 underline-offset-[6px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
        >
          {zeker ? "Zeker weten?" : "Opnieuw"}
        </button>
      </div>

      <details className="mt-[12px] text-[14px] leading-[22px] text-muted">
        <summary className="tekst-annotatie inline-flex min-h-[44px] cursor-pointer items-center">Hoe werkt het?</summary>
        <p className="mt-[4px] max-w-[60ch]">
          Elk seizoen groeit wat er staat, behalve in de winter. Wat rijp is, pluk je voor oogst en nieuwe zaden. Klaver maakt
          de bodem van de buren rijker, kale grond spoelt uit en blad in de herfst voedt. Een rijke bodem en drie of meer
          soorten rondom geven meer oogst. Klaver en munt bloeien na een paar jaar uit en worden compost. Elke lente waait er
          een zaadje aan. Je perceel blijft bewaard in deze browser.
        </p>
      </details>
    </div>
  )
}
