"use client"

import { useRef, useState, type CSSProperties } from "react"
import { priceLabel } from "@/lib/format"
import "./kaart.css"

// De cadeaubon als kaart in 3D (eigenaar, 21 okt 2026: "maak de kaart 3D om met
// muis te zien wat je koopt"). Hij kantelt mee met muis of vinger en draait om
// bij een klik; voor- en achterkant tonen wat de koper invult. Geen three.js:
// twee vlakken met backface-visibility en een glans die de muis volgt.
// Minder beweging: geen kantelen, omdraaien zonder animatie (kaart.css).

export type BonGegevens = { bedrag: number; voor: string; van: string; boodschap: string; nummer?: string; geldigTot?: string }

const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches

export function Voorkant({ bedrag, voor }: Pick<BonGegevens, "bedrag" | "voor">) {
  return (
    <div className="bk-zijde bk-voor">
      {/* eslint-disable-next-line @next/next/no-img-element -- vlak woordmerk */}
      <img src="/brand/woordmerk-antraciet.svg" alt="GRØNN" className="bk-logo" />
      {/* eslint-disable-next-line @next/next/no-img-element -- vrijgestelde plant, decoratief */}
      <img src="/planten/vingerhoed.webp" alt="" aria-hidden="true" className="bk-plant" />
      <span className="bk-label">Cadeaubon</span>
      <span className="bk-cadeau">Cadeau.</span>
      <span className="bk-onder">
        <span className="bk-bedrag">{priceLabel(bedrag)}</span>
        <span className="bk-voor-wie">{voor ? `voor ${voor}` : "voor …"}</span>
      </span>
    </div>
  )
}

export function Achterkant({ voor, van, boodschap, nummer, geldigTot }: Omit<BonGegevens, "bedrag">) {
  return (
    <div className="bk-zijde bk-achter">
      <span className="bk-label">Voor {voor || "…"} · van {van || "…"}</span>
      <span className="bk-boodschap">{boodschap || "Voor je vijver, je tuin of een border. Veel plezier ermee!"}</span>
      <span className="bk-gebruik">
        Inwisselen: app een foto van je vijver of tuin naar 06 18 11 80 14 en noem je bonnummer. Voor elk werk van GRØNN Studio.
      </span>
      <span className="bk-voet">
        <span className="bk-nummer">{nummer ?? "GR-····-····"}</span>
        <span>{geldigTot ? `geldig t/m ${geldigTot}` : "2 jaar geldig"}</span>
      </span>
    </div>
  )
}

export function BonKaart(b: BonGegevens) {
  const [om, setOm] = useState(false)
  const kaart = useRef<HTMLButtonElement>(null)

  function beweeg(e: React.PointerEvent) {
    if (!kaart.current || stil()) return
    const r = kaart.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    const s = kaart.current.style
    s.setProperty("--rx", `${(-y * 16).toFixed(2)}deg`)
    s.setProperty("--ry", `${(x * 22).toFixed(2)}deg`)
    s.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`)
    s.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  function los() {
    const s = kaart.current?.style
    if (!s) return
    for (const k of ["--rx", "--ry", "--gx", "--gy"]) s.removeProperty(k)
  }

  return (
    <figure className="m-0">
      <div className="bk-scene" onPointerMove={beweeg} onPointerLeave={los}>
        <button ref={kaart} type="button" className="bk-kaart" data-om={om} onClick={() => setOm(!om)} aria-pressed={om} style={{} as CSSProperties}>
          <span className="sr-only">{om ? "Achterkant van de cadeaubon, klik voor de voorkant" : "Voorkant van de cadeaubon, klik voor de achterkant"}</span>
          <span className="bk-binnen" aria-hidden="true">
            <Voorkant bedrag={b.bedrag} voor={b.voor} />
            <Achterkant {...b} />
            <span className="bk-glans" />
          </span>
        </button>
      </div>
      <figcaption className="mt-4 text-center text-[14px] text-gedempt">
        {om ? "Achterkant" : "Voorkant"} · klik op de kaart om hem om te draaien
      </figcaption>
    </figure>
  )
}
