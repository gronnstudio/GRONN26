"use client"

import { useState } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"

export type Kaart = { slug: string; titel: string; beschrijving: string; rubriek: string; datum: string; datumTekst: string; leestijd: number; beeld: FotoData }

// Het Journaal als beeldraster met filter (eigenaar, 14 nov 2026: "maak filteren
// beter, meer visueel"). Elke filterknop draagt een klein beeld van zijn thema en
// het aantal stukken; de kaarten tonen foto, thema, titel en datum.
export function JournaalRaster({ kaarten, themas }: { kaarten: Kaart[]; themas: string[] }) {
  const [thema, setThema] = useState<string>("Alles")
  const knoppen = ["Alles", ...themas].map((t) => {
    const lijst = t === "Alles" ? kaarten : kaarten.filter((k) => k.rubriek === t)
    return { t, aantal: lijst.length, beeld: lijst[0]?.beeld }
  })
  const zichtbaar = thema === "Alles" ? kaarten : kaarten.filter((k) => k.rubriek === thema)

  return (
    <section aria-labelledby="journaal-alle" className="wrap mt-[clamp(64px,8vw,120px)]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-inkt pb-4">
        <h2 id="journaal-alle" className="syne m-0 text-[clamp(28px,3vw,44px)] leading-[1.1] tracking-[-.02em]">Alle stukken</h2>
        <div role="group" aria-label="Filter op thema" className="flex flex-wrap gap-2">
          {knoppen.map(({ t, aantal, beeld }) => (
            <button
              key={t}
              type="button"
              aria-pressed={thema === t}
              onClick={() => setThema(t)}
              className="group flex min-h-[48px] items-center gap-3 rounded-full border border-lijn py-[6px] pr-[18px] pl-[6px] text-[15px] font-semibold transition-colors hover:border-inkt aria-pressed:border-inkt aria-pressed:bg-inkt aria-pressed:text-grond"
            >
              {beeld ? <Foto foto={{ ...beeld, alt: "" }} sizes="36px" className="size-[36px] shrink-0 rounded-full!" /> : null}
              <span>{t}</span>
              <span className="text-[13px] font-normal opacity-70">{aantal}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="m-0 mt-[clamp(28px,3vw,48px)] grid list-none gap-x-[clamp(16px,2vw,32px)] gap-y-[clamp(36px,4vw,64px)] p-0 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {zichtbaar.map((k) => (
          <li key={k.slug}>
            <Link href={`/journaal/${k.slug}`} transitionTypes={["schuif"]} className="group block text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt">
              <div className="overflow-hidden rounded-[var(--foto-hoek)]">
                <Foto foto={k.beeld} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] transition-[scale] duration-700 group-hover:scale-[1.04]" />
              </div>
              <p className="lbl m-0 mt-4 text-gedempt">{k.rubriek} · <time dateTime={k.datum}>{k.datumTekst}</time> · {k.leestijd} min</p>
              <h3 className="syne m-0 mt-2 text-[clamp(20px,1.8vw,26px)] leading-[1.15] tracking-[-.02em] [text-wrap:balance] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{k.titel}</h3>
              <p className="m-0 mt-2 line-clamp-2 text-[15px] leading-[1.55] text-gedempt">{k.beschrijving}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
