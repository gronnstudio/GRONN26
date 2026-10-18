"use client"

import Image from "next/image"
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"
import { T, kies } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import type { Observatie } from "@/lib/data/observaties"
import { Loep } from "./loep"
import "./observatie.css"

// Observatiekaders (prototype, 18 okt 2026). Zodra de foto in beeld komt,
// klikken de hoekhaken één voor één vast op wat Nick ziet; het kernpunt in
// oranje. Tik of wijs een kader aan: de rest dimt en de uitleg verschijnt.
// Onder de foto staat dezelfde observatie als lijst, zodat de inhoud ook
// zonder beeld, zonder JS en voor zoekmachines leesbaar is.
// Minder beweging of html.stil: alle kaders staan er meteen, zonder animatie.

const TEMPO = 650 // ms tussen twee kaders
const AANLOOP = 450 // ms voor het eerste kader

function stil() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("stil")
}

// De tijd van het moment van kijken, per seconde (server en hydratie: geen tijd).
function elkeSeconde(cb: () => void) {
  const id = setInterval(cb, 1000)
  return () => clearInterval(id)
}

function tijd(d: Date) {
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function ObservatieFoto({ obs, sizes = "(min-width: 1100px) 900px, 100vw" }: { obs: Observatie; sizes?: string }) {
  const taal = useTaal()
  const vak = useRef<HTMLDivElement>(null)
  // Muis: aanwijzen kiest al, dus een klik mag het niet weer uitzetten.
  const muis = useRef(false)
  const [aan, setAan] = useState(0)
  const [actief, setActief] = useState<number | null>(null)
  const klok = useSyncExternalStore(elkeSeconde, () => tijd(new Date()), () => null)
  const totaal = obs.punten.length

  // Vastklikken zodra een derde van de foto in beeld is, één keer.
  useEffect(() => {
    const el = vak.current
    if (!el) return
    let tik: ReturnType<typeof setInterval> | undefined
    let start: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        if (stil()) return setAan(totaal)
        start = setTimeout(() => {
          setAan(1)
          tik = setInterval(() => {
            setAan((n) => {
              if (n + 1 >= totaal) clearInterval(tik)
              return Math.min(n + 1, totaal)
            })
          }, TEMPO)
        }, AANLOOP)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(start)
      clearInterval(tik)
    }
  }, [totaal])

  // Tik buiten een kader of Escape: niets meer actief.
  useEffect(() => {
    if (actief === null) return
    const weg = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !(e.target as Element).closest?.(".o-kader")) setActief(null)
    }
    document.addEventListener("pointerdown", weg)
    document.addEventListener("keydown", weg)
    return () => {
      document.removeEventListener("pointerdown", weg)
      document.removeEventListener("keydown", weg)
    }
  }, [actief])

  const alt = taal === "en" && obs.foto.en ? obs.foto.en.alt : obs.foto.alt

  return (
    <figure className="m-0" data-observatie={obs.id}>
      <div className="lbl mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-gedempt">
        <span>
          <T t={{ nl: "Observatie", en: "Observation" }} /> {obs.id}
        </span>
        <span className="tabular-nums" aria-live="off">
          <span className="o-tel">{aan}/{totaal}</span>
          <span aria-hidden="true"> · </span>
          <span>{klok ?? "--:--:--"}</span>
        </span>
      </div>

      <div
        ref={vak}
        className={`o-vak relative overflow-hidden bg-vlak${actief !== null ? " o-kiest" : ""}`}
        style={{ aspectRatio: `${obs.foto.width} / ${obs.foto.height}` }}
      >
        <Image src={obs.foto.src} alt={alt} fill sizes={sizes} className="object-cover [filter:saturate(.88)_contrast(1.04)_brightness(.98)]" />
        <Loep src={obs.foto.src} />
        {obs.punten.map((p, i) => {
          const onder = p.y + p.h > 70
          const rechts = p.x > 50
          const label = `${kies(p.wat, taal)}: ${kies(p.waarom, taal)}`
          return (
            <button
              key={i}
              type="button"
              className={`o-kader${i < aan ? " o-aan" : ""}${p.kern ? " o-kern" : ""}${actief === i ? " o-actief" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.b}%`, height: `${p.h}%` } as CSSProperties}
              aria-label={label}
              aria-pressed={actief === i}
              tabIndex={i < aan ? 0 : -1}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActief(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActief(null)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActief(i)}
              onPointerDown={(e) => (muis.current = e.pointerType === "mouse")}
              onClick={() => {
                if (muis.current) setActief(i)
                else setActief((a) => (a === i ? null : i))
                muis.current = false
              }}
            >
              <span className="o-hoek o-lb" aria-hidden="true" />
              <span className="o-hoek o-rb" aria-hidden="true" />
              <span className="o-hoek o-lo" aria-hidden="true" />
              <span className="o-hoek o-ro" aria-hidden="true" />
              <span
                className={`o-label ${onder ? "o-boven" : "o-onder"} ${rechts ? "o-rechts" : "o-links"}`}
                aria-hidden="true"
              >
                <span className="o-wat">
                  <span className="o-nr">{String(i + 1).padStart(2, "0")}</span><span className="o-woord"> <T t={p.wat} /></span>
                </span>
                <span className="o-waarom"><T t={p.waarom} /></span>
              </span>
            </button>
          )
        })}
      </div>

      <figcaption className="mt-5">
        <ol className="m-0 grid list-none gap-0 border-t border-lijn p-0 sm:grid-cols-2 sm:gap-x-8">
          {obs.punten.map((p, i) => (
            <li key={i} className="flex gap-3 border-b border-lijn py-3">
              <span className={`lbl tabular-nums ${p.kern ? "text-oranje-tekst" : "text-gedempt"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="lbl block"><T t={p.wat} /></span>
                <span className="text-[15px] text-gedempt"><T t={p.waarom} /></span>
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
