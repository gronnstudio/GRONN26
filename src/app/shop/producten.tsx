"use client"

import { useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
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

export function Producten({ producten }: { producten: Product[] }) {
  const [soort, setSoort] = useState<(typeof SOORTEN)[number]["id"]>("alles")
  // het shopmenu linkt naar /shop?soort=… (eigenaar, 15 nov 2026)
  const vraag = useSearchParams().get("soort")
  const [vorige, setVorige] = useState<string | null>(null)
  if (vraag !== vorige) {
    setVorige(vraag)
    const s = SOORTEN.find((x) => x.id === vraag)
    if (s) setSoort(s.id)
  }
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-inkt pb-4">
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {SOORTEN.map((s) => {
            const aan = soort === s.id
            const lijstje = s.id === "alles" ? producten : producten.filter((p) => p.soort === s.id)
            const beeld = lijstje.find((p) => p.foto)?.foto
            return (
              <button key={s.id} type="button" aria-pressed={aan} onClick={() => setSoort(s.id)} className="group flex min-h-[48px] items-center gap-3 rounded-full border border-lijn py-[6px] pr-[18px] pl-[6px] text-[15px] font-semibold transition-colors hover:border-inkt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt aria-pressed:border-inkt aria-pressed:bg-inkt aria-pressed:text-grond">
                {beeld ? <Foto foto={{ src: beeld.src, width: 1600, height: 1200, alt: "" }} sizes="36px" className="size-[36px] shrink-0 rounded-full!" /> : <span className="size-[36px] shrink-0" />}
                <T t={s.naam} />
                <span className="text-[13px] font-normal tabular-nums opacity-70">{lijstje.length}</span>
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

      {lijst ? (
      <ul className="m-0 mt-8 flex list-none flex-col p-0">
        {zichtbaar.map((p, i) => (
          <li key={p.id} className="shop-product flex items-center gap-4 border-t border-lijn py-4 first:border-t-0 first:pt-0 sm:gap-6">
            <Link ref={alles && i === EERST ? eerstNieuw : undefined} href={p.href} className="group flex min-w-0 flex-1 items-center gap-4 text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt sm:gap-6">
              <div className="w-[72px] shrink-0 sm:w-[112px]">
                {p.foto ? <Foto foto={{ src: p.foto.src, width: 1600, height: 1200, alt: p.foto.alt.nl, en: { alt: p.foto.alt.en } }} sizes="112px" className="shop-foto aspect-square" /> : <div className="aspect-square rounded-[4px] bg-vlak" />}
              </div>
              <span className="flex min-w-0 flex-col">
                <span className="syne text-[18px] leading-[1.15] sm:text-[20px]"><T t={p.naam} /></span>
                <span className="mt-1 text-[13px] leading-[1.4] text-gedempt sm:text-[14px]"><T t={p.sub} /></span>
              </span>
            </Link>
            <span className="shrink-0 text-[15px] tabular-nums"><T t={p.prijs} /></span>
          </li>
        ))}
      </ul>
      ) : (
      // Kaarten in de stijl van Cyclecraft (eigenaar, 15 nov 2026: "gebruik cycle craft
      // vooral voor de shop"): grijs vlak met het beeld, soort in labelletters, naam,
      // prijs en een rond plusje rechtsonder. De kaarten raken elkaar via één lijn.
      <ul className="shop-kaarten m-0 mt-8 grid list-none grid-cols-2 border-t border-l border-lijn p-0 lg:grid-cols-3">
        {zichtbaar.map((p, i) => (
          <li key={p.id} className="shop-kaart relative flex flex-col border-r border-b border-lijn p-3 sm:p-5">
            <Link ref={alles && i === EERST ? eerstNieuw : undefined} href={p.href} className="group flex flex-1 flex-col text-inherit no-underline after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-inkt">
              <div className="overflow-hidden rounded-[4px] bg-vlak">
                {p.foto ? <Foto foto={{ src: p.foto.src, width: 1600, height: 1200, alt: p.foto.alt.nl, en: { alt: p.foto.alt.en } }} sizes="(min-width: 1024px) 400px, 50vw" className="shop-foto aspect-square transition-[scale] duration-700 group-hover:scale-[1.04]" /> : <div className="flex aspect-square items-center justify-center"><span className="lbl text-gedempt"><T t={{ nl: "Op maat", en: "Custom" }} /></span></div>}
              </div>
              <span className="lbl mt-4 text-gedempt"><T t={SOORTEN.find((x) => x.id === p.soort)!.naam} /></span>
              <span className="syne mt-1 line-clamp-2 text-[17px] leading-[1.15] sm:text-[clamp(18px,1.6vw,22px)]"><T t={p.naam} /></span>
            </Link>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="text-[14px] font-semibold tabular-nums sm:text-[15px]"><T t={p.prijs} /></span>
              <span aria-hidden className="flex size-[36px] shrink-0 items-center justify-center rounded-full border border-inkt text-[20px] leading-none">+</span>
            </div>
          </li>
        ))}
      </ul>
      )}

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
