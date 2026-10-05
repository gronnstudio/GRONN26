"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Doorkijk } from "./delen"
import { WERK } from "./projecten"

// WF-012: het werk als lijst of als raster, groot en beeldend in de taal van
// de collage op de voorpagina (foto's die meebewegen, blokken die zacht
// opkomen). De keuze blijft bewaard in deze browser (localStorage
// `gronn-werk-weergave`). Beide weergaven staan in de HTML en de andere is
// `hidden`, zodat de gedeelde beweging (WereldBeweging, die bij het laden van
// de pagina zoekt) ook de weergave vindt die later gekozen wordt. Zonder
// opgeslagen keuze, of zonder JS, staat de lijst er.

type Weergave = "lijst" | "raster"
const SLEUTEL = "gronn-werk-weergave"
const volg = (n: number) => ({ "--i": n }) as CSSProperties

export function WerkOverzicht() {
  const [weergave, setWeergave] = useState<Weergave>("lijst")

  // Bewaarde keuze ophalen ná de eerste render (hydration-veilig): de server
  // kent localStorage niet, dus de lijst is altijd de eerste stand.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (localStorage.getItem(SLEUTEL) === "raster") setWeergave("raster")
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const kies = (w: Weergave) => {
    setWeergave(w)
    try {
      localStorage.setItem(SLEUTEL, w)
    } catch {}
    // De andere weergave stond verborgen; laat wat nu in beeld komt meteen staan.
    requestAnimationFrame(() => dispatchEvent(new Event("scroll")))
  }

  return (
    <div className="pt-[clamp(56px,7vw,112px)]">
      <div className="w-kopregel">
        <h2 className="lbl m-0">Alle projecten</h2>
        <div className="lbl -my-3 flex gap-6" role="group" aria-label="Weergave van het werk">
          {(["lijst", "raster"] as const).map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={weergave === w}
              onClick={() => kies(w)}
              className={`min-h-11 cursor-pointer border-0 bg-transparent px-0 font-[inherit] tracking-[inherit] uppercase ${
                weergave === w ? "text-inkt underline underline-offset-4" : "text-gedempt"
              }`}
            >
              {w === "lijst" ? "Lijst" : "Raster"}
            </button>
          ))}
        </div>
      </div>

      <section aria-label="Werk als lijst" hidden={weergave !== "lijst"}>
        <ul className="m-0 list-none p-0">
          {WERK.map((p, i) => (
            <li key={p.href} className="border-b border-lijn first:border-t" data-zie style={volg(i)}>
              <Link
                href={p.href}
                className="group grid grid-cols-1 items-center gap-x-8 gap-y-5 py-[clamp(24px,3vw,40px)] no-underline md:grid-cols-12"
              >
                <span className="flex flex-col gap-4 md:col-span-7">
                  <span className="lbl flex gap-4 tabular-nums text-gedempt">
                    <span>{p.jaar}</span>
                    <span>{p.code}</span>
                  </span>
                  <span className="syne text-[clamp(32px,4.4vw,64px)] leading-[1.02] tracking-[-.035em] [overflow-wrap:anywhere]">
                    <span className="w-lijnlink">{p.titel}</span>
                  </span>
                  <span className="lbl text-gedempt">
                    {p.type} · {p.plaats !== "—" ? `${p.plaats} · ` : ""}
                    {p.status}
                  </span>
                </span>
                <Doorkijk
                  foto={p.foto}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="order-first aspect-[4/3] w-full md:order-none md:col-span-5"
                  eigen={false}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Werk als raster"
        hidden={weergave !== "raster"}
        className="grid grid-cols-12 items-start gap-x-3 gap-y-14 md:gap-x-8"
      >
        {WERK.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            data-zie
            style={volg(i)}
            className={`flex min-w-0 flex-col gap-3.5 no-underline ${
              i % 2 === 0
                ? "col-span-12 md:col-span-7 md:col-start-1"
                : "col-span-10 col-start-3 md:col-span-5 md:col-start-8 md:mt-[clamp(160px,22vw,320px)]"
            }`}
          >
            <Doorkijk
              foto={p.foto}
              sizes={i % 2 === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 40vw, 84vw"}
              className={i % 2 === 0 ? "aspect-[612/764] w-full" : "aspect-square w-full"}
              v={i % 2 === 0 ? 0.6 : 1.4}
              eigen={false}
            />
            <span className="lbl tabular-nums">
              {String(i + 1).padStart(2, "0")} — {p.code}
            </span>
            <span className="syne text-[clamp(28px,3vw,44px)] leading-[1.05] tracking-[-.03em]">
              <span className="w-lijnlink">{p.naam}</span>
            </span>
            <span className="lbl text-gedempt">
              {p.plaats !== "—" ? `${p.plaats} · ` : ""}
              {p.jaar} · {p.status}
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
