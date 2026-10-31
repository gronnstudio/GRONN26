"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

/**
 * Het openingsdoek: bij het eerste bezoek van een sessie ligt er een
 * vlak met het woordmerk over de pagina, dat daarna optilt. Eigenaar,
 * 23 sep 2026 (uit de oude site overgenomen), maar herbouwd op de
 * Brand Guide 2026: vlakke kleur, "rust als herkenning" — geen foto,
 * geen gloed. De grond is `--background`, dus gebroken wit met het
 * antraciet woordmerk in de Gouden Uur en antraciet met het witte
 * woordmerk in de Blauwe Uur; het `Logo`-element kiest de variant.
 *
 * De hele beweging is CSS (`.openingsdoek` in globals.css) en het doek
 * staat in de server-HTML, zodat het speelt en optilt vóór er één regel
 * JavaScript draait. Wanneer het NIET speelt, beslist het pre-paint
 * script in de root-layout: tweede pagina in deze sessie of de
 * geïnstalleerde app → `html.intro-seen`; minder beweging → `data-motion`
 * of de media query. Er flitst dus nooit iets.
 *
 * Het doek vangt geen enkele tik of klik (`pointer-events: none`): de
 * pagina eronder is vanaf het eerste beeld bruikbaar. React ruimt alleen
 * het uitgespeelde doek op.
 */
const MERK = { width: 784, height: 167, priority: true, style: { height: 56, width: "auto" } } as const

export function Openingsdoek() {
  const ref = useRef<HTMLDivElement>(null)
  const [weg, setWeg] = useState(false)

  useEffect(() => {
    // Niet getoond (geen animaties: display none), of al opgetild vóór
    // de hydratatie op een trage telefoon — dan komt er geen
    // animationend meer, en is het knooppunt alleen nog ballast.
    const frame = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      if (el.getAnimations().every((a) => a.playState === "finished")) setWeg(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  if (weg) return null

  return (
    <div
      ref={ref}
      aria-hidden
      data-openingsdoek=""
      className="openingsdoek fixed inset-0 z-[90] flex items-center justify-center px-6"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "doek-op") setWeg(true)
      }}
    >
      <div className="openingsdoek-merk">
        <Image src="/brand/woordmerk-antraciet.svg" alt="" {...MERK} className="dark:hidden" />
        <Image src="/brand/woordmerk-intro.svg" alt="" {...MERK} className="hidden dark:block" />
      </div>
    </div>
  )
}
