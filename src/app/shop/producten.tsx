"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
import type { L } from "@/lib/i18n"

// Het productoverzicht van de shop (eigenaar, 21 okt 2026: "maak 2 kolommen voor de
// border pakketten ... daaronder een stille laad meer, zonder dat pagina verspringt",
// en "een moderne filter optie ... en ook een lijst en gridview"). Bewust klein:
// drie soorten om op te filteren en twee weergaven, geen zoekveld of prijsfilter
// zolang er zo weinig producten zijn. Meer laden zet de rest ONDER de knop, dus
// alles wat al in beeld staat blijft staan.

export type Product = {
  id: string
  soort: "border" | "bodem"
  naam: L
  sub: L
  foto?: { src: string; alt: L }
  prijs: L
  href: string
  knop: { href: string; label: L }
}

const SOORTEN = [
  { id: "alles", naam: { nl: "Alles", en: "All" } },
  { id: "border", naam: { nl: "Borderpakketten", en: "Border packages" } },
  { id: "bodem", naam: { nl: "Bodem en maatwerk", en: "Soil and custom" } },
] as const

const EERST = 6
const chip = "inline-flex min-h-[var(--knop-klein)] items-center gap-2 rounded-full border px-4 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt"

export function Producten({ producten }: { producten: Product[] }) {
  const [soort, setSoort] = useState<(typeof SOORTEN)[number]["id"]>("alles")
  const [lijst, setLijst] = useState(false)
  const [alles, setAlles] = useState(false)
  const eerstNieuw = useRef<HTMLAnchorElement>(null)

  const gefilterd = producten.filter((p) => soort === "alles" || p.soort === soort)
  const zichtbaar = alles || soort !== "alles" ? gefilterd : gefilterd.slice(0, EERST)
  const over = gefilterd.length - zichtbaar.length

  function meer() {
    setAlles(true)
    // Toetsenbord: door naar het eerste nieuwe product, zonder te scrollen.
    requestAnimationFrame(() => eerstNieuw.current?.focus({ preventScroll: true }))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {SOORTEN.map((s) => {
            const aan = soort === s.id
            const aantal = s.id === "alles" ? producten.length : producten.filter((p) => p.soort === s.id).length
            return (
              <button key={s.id} type="button" aria-pressed={aan} onClick={() => setSoort(s.id)} className={`${chip} ${aan ? "border-inkt bg-inkt text-grond" : "border-gedempt text-inkt hover:border-inkt"}`}>
                <T t={s.naam} /> <span className={`tabular-nums ${aan ? "opacity-70" : "text-gedempt"}`}>{aantal}</span>
              </button>
            )
          })}
        </div>
        <div role="group" aria-label="Weergave" className="flex gap-1 rounded-full border border-lijn p-1">
          {[{ v: false, n: { nl: "Raster", en: "Grid" } }, { v: true, n: { nl: "Lijst", en: "List" } }].map((w) => (
            <button key={w.n.nl} type="button" aria-pressed={lijst === w.v} onClick={() => setLijst(w.v)} className={`min-h-[36px] rounded-full px-4 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt ${lijst === w.v ? "bg-vlak text-inkt" : "text-gedempt hover:text-inkt"}`}>
              <T t={w.n} />
            </button>
          ))}
        </div>
      </div>

      <ul className={`m-0 mt-8 list-none p-0 ${lijst ? "flex flex-col" : "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5"}`}>
        {zichtbaar.map((p, i) => (
          <li key={p.id} className={`shop-product ${lijst ? "flex items-center gap-4 border-t border-lijn py-4 first:border-t-0 first:pt-0 sm:gap-6" : "flex flex-col"}`}>
            <Link
              ref={alles && i === EERST ? eerstNieuw : undefined}
              href={p.href}
              className={`group no-underline text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt rounded-[16px] ${lijst ? "flex min-w-0 flex-1 items-center gap-4 sm:gap-6" : "flex flex-col"}`}
            >
              <div className={lijst ? "w-[72px] shrink-0 sm:w-[112px]" : ""}>
                {p.foto ? (
                  <Foto
                    foto={{ src: p.foto.src, width: 1600, height: 1200, alt: p.foto.alt.nl, label: lijst ? undefined : "Sfeerbeeld", en: { alt: p.foto.alt.en, label: lijst ? undefined : "Mood image" } }}
                    sizes={lijst ? "112px" : "(min-width: 1024px) 400px, 50vw"}
                    className={`shop-foto ${lijst ? "aspect-square" : "aspect-[4/5]"}`}
                  />
                ) : (
                  <div className={`flex items-center justify-center rounded-[16px] border border-dashed border-gedempt text-gedempt ${lijst ? "aspect-square rounded-[12px]" : "aspect-[4/5]"}`}>
                    <span className="lbl"><T t={{ nl: "Op maat", en: "Custom" }} /></span>
                  </div>
                )}
              </div>
              <span className="flex min-w-0 flex-col">
                <span className={`syne leading-[1.15] tracking-[-.015em] ${lijst ? "text-[18px] sm:text-[20px]" : "mt-3 text-[18px] sm:mt-4 sm:text-[22px]"}`}><T t={p.naam} /></span>
                <span className="mt-1 text-[13px] leading-[1.4] text-gedempt sm:text-[14px]"><T t={p.sub} /></span>
                {lijst && p.foto ? <span className="lbl mt-1 text-gedempt"><T t={{ nl: "Sfeerbeeld", en: "Mood image" }} /></span> : null}
              </span>
            </Link>
            <div className={lijst ? "flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-5" : "mt-auto flex flex-col items-start gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3"}>
              <span className="text-[15px] tabular-nums"><T t={p.prijs} /></span>
              <Link href={p.knop.href} className="knop-klein bg-inkt text-grond focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt">
                <T t={p.knop.label} />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {over > 0 ? (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={meer} className="min-h-[var(--knop-klein)] rounded-full px-5 text-[14px] text-gedempt underline decoration-lijn underline-offset-4 hover:text-inkt hover:decoration-inkt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt">
            <T t={{ nl: `Meer laden · ${over}`, en: `Load more · ${over}` }} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
