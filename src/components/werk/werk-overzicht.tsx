"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Foto } from "@/components/foto"
import { WERK } from "./projecten"

// WF-012: het werk als lijst of als raster. De keuze blijft bewaard in deze
// browser (localStorage `gronn-werk-weergave`). Zonder opgeslagen keuze, of
// zonder JS, staat de lijst er.

type Weergave = "lijst" | "raster"
const SLEUTEL = "gronn-werk-weergave"

export function WerkOverzicht() {
  const [weergave, setWeergave] = useState<Weergave>("lijst")

  useEffect(() => {
    try {
      if (localStorage.getItem(SLEUTEL) === "raster") setWeergave("raster")
    } catch {}
  }, [])

  const kies = (w: Weergave) => {
    setWeergave(w)
    try {
      localStorage.setItem(SLEUTEL, w)
    } catch {}
  }

  return (
    <>
      <div className="flex items-end justify-between gap-6 pt-[clamp(56px,10vw,140px)]">
        <h1 className="syne m-0 text-[clamp(56px,7.5vw,104px)] leading-none tracking-[-.04em]">Werk</h1>
        <div className="lbl flex gap-6" role="group" aria-label="Weergave van het werk">
          {(["lijst", "raster"] as const).map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={weergave === w}
              onClick={() => kies(w)}
              className={`min-h-11 cursor-pointer border-0 border-b bg-transparent px-0 pt-0 pb-1 font-[inherit] ${
                weergave === w ? "border-inkt text-inkt" : "border-transparent text-gedempt"
              }`}
            >
              {w === "lijst" ? "Lijst" : "Raster"}
            </button>
          ))}
        </div>
      </div>

      {weergave === "lijst" ? (
        <section aria-label="Werk als lijst" className="mt-[clamp(48px,6vw,80px)]">
          <div
            aria-hidden="true"
            className="lbl hidden grid-cols-12 items-baseline gap-x-8 border-t border-lijn py-3.5 text-gedempt md:grid"
          >
            <span className="col-span-1">Jaar</span>
            <span className="col-span-2">Code</span>
            <span className="col-span-5">Project</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-2">Plaats · status</span>
          </div>
          <ul className="m-0 list-none p-0">
            {WERK.map((p) => (
              <li key={p.href} className="border-t border-lijn last:border-b">
                <Link
                  href={p.href}
                  className="group relative grid grid-cols-4 items-baseline gap-x-8 gap-y-1.5 py-7 no-underline md:grid-cols-12"
                >
                  <span className="syne order-first col-span-4 text-[clamp(24px,2.8vw,40px)] leading-[1.05] tracking-[-.025em] md:order-none md:col-span-5 md:col-start-4 md:row-start-1">
                    {p.titel}
                  </span>
                  <span className="lbl col-span-2 md:col-span-1 md:col-start-1 md:row-start-1">{p.jaar}</span>
                  <span className="lbl col-span-2 md:col-start-2 md:row-start-1">{p.code}</span>
                  <span className="lbl col-span-2 text-gedempt md:col-start-9 md:row-start-1">{p.type}</span>
                  <span className="lbl col-span-2 text-gedempt md:col-start-11 md:row-start-1">
                    {p.plaats} · {p.status}
                  </span>
                  {/* Het beeld bij hover of toetsenbordfocus; versiering, de titel is de naam. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 right-[16%] hidden aspect-[4/5] w-[220px] overflow-hidden bg-vlak opacity-0 ring-1 ring-lijn transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
                  >
                    <Image src={p.foto.src} alt="" fill sizes="220px" className="object-cover" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section
          aria-label="Werk als raster"
          className="mt-[clamp(48px,8vw,120px)] grid grid-cols-1 items-start gap-y-14 md:grid-cols-12 md:gap-x-8"
        >
          {WERK.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className={`flex flex-col gap-3.5 no-underline ${
                i === 0 ? "md:col-span-7 md:col-start-1" : "md:col-span-4 md:col-start-9 md:mt-[clamp(120px,22vw,320px)]"
              }`}
            >
              <Foto
                foto={p.foto}
                className={i === 0 ? "aspect-[7/6]" : "aspect-[4/5]"}
                sizes={i === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
              />
              <span className="lbl">
                {String(i + 1).padStart(2, "0")} — {p.code}
              </span>
              <span className="text-[22px] font-medium">{p.naam}</span>
              <span className="lbl text-gedempt">
                {p.plaats !== "—" ? `${p.plaats} · ` : ""}
                {p.jaar} · {p.status}
              </span>
            </Link>
          ))}
        </section>
      )}
    </>
  )
}
