"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { eenmaalInBeeld } from "./in-beeld"

/**
 * De "beeld"-helft van "Tekst en beeld": de foto komt iets te groot en
 * zacht onscherp binnen en zet zich scherp neer (maat van
 * `motion/reveal-image.tsx`: 1,12 · blur 10px · 60 % · 1,1 s out-expo).
 *
 * Alleen de `<Image>` staat hierin, niet het conceptlabel: tekst wordt
 * nooit onscherp of doorschijnend. De beweging zit op DEZE laag en de
 * parallax (`g-parallax`) op de img eronder — nooit twee transforms op één
 * node. Het filter blijft niet hangen: de animatie vult alleen
 * `backwards`, dus na afloop staat er geen `filter` meer op een voorouder
 * (zie de photo-glass-noot in globals.css).
 *
 * Verborgen staat alleen onder `(scripting: enabled)` en zonder
 * minder-beweging: zonder JS staat de foto er gewoon.
 */
/** `vullen`: het beeld vult zijn doos; `"lg"` alleen vanaf lg (`Beeld` met `vul`). */
export function BeeldOnthulling({ vullen, children }: { vullen: boolean | "lg"; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [nu, setNu] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let img: HTMLImageElement | null = null
    const start = () => setNu(true)
    const stop = eenmaalInBeeld(el, () => {
      // Een lazy foto die nog laadt: pas scherp zetten als er iets te
      // zien is, anders speelt de binnenkomst over een leeg vlak.
      img = el.querySelector("img")
      if (!img || img.complete) return start()
      img.addEventListener("load", start, { once: true })
      img.addEventListener("error", start, { once: true })
    })
    return () => {
      stop()
      img?.removeEventListener("load", start)
      img?.removeEventListener("error", start)
    }
  }, [])

  return (
    <div data-element="BeeldOnthulling" ref={ref} data-beeld={nu ? "nu" : "wacht"} className={vullen === "lg" ? "lg:absolute lg:inset-0" : vullen ? "absolute inset-0" : undefined}>
      {children}
    </div>
  )
}
