import Image from "next/image"
import type { ReactNode } from "react"

import { BeeldOnthulling } from "./beeld-onthulling"
import { BeeldWissel, type WisselFoto } from "./beeld-wissel"
import { ConceptLabel } from "./concept-label"

/**
 * Eén fotoframe: afgeronde hoeken, gereserveerde ruimte, lazy tenzij
 * `priority`. `ratio` snijdt bij (object-cover, `focus` kiest het
 * zwaartepunt); zonder `ratio` blijft de natuurlijke verhouding — voor
 * technische detailfoto's. `concept` zet het label erop.
 *
 * Binnenkomst: iets te groot en zacht onscherp, dan scherp
 * (`BeeldOnthulling`). NIET bij `priority`: dat is het LCP-beeld boven de
 * vouw, en dat mag nooit onscherp of doorschijnend beginnen — daar doet
 * de parallax het werk.
 */
export function Beeld({
  src,
  alt,
  width,
  height,
  sizes,
  ratio,
  focus = "50% 50%",
  concept = false,
  conceptTekst,
  onderschrift,
  priority = false,
  parallax = false,
  wissel,
  vul = false,
  className = "",
}: {
  src: string
  alt: string
  width: number
  height: number
  sizes: string
  ratio?: string
  focus?: string
  concept?: boolean
  /** Andere tekst op het label, bijv. "Sfeerbeeld". */
  conceptTekst?: string
  onderschrift?: ReactNode
  priority?: boolean
  parallax?: boolean
  /** Tweede echte foto die onder de muis overvloeit (`BeeldWissel`). */
  wissel?: WisselFoto
  /**
   * Een foto die tegen de rand van een kaart staat: nooit een eigen
   * afronding, want de kaart rondt zelf af en snijdt af, zodat de kant waar
   * de foto de tekst raakt recht is (eigenaar, 29 sep 2026: "haal die extra
   * rand weg"; 3 okt 2026: "Maak de fotos op kaarten recht bovenkant en vul
   * de ruimte op"). Vanaf `lg` vult hij de hoogte van de ouder
   * (object-cover); daaronder op zijn eigen verhouding.
   */
  vul?: boolean
  className?: string
}) {
  const foto = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      style={ratio ? { objectPosition: focus } : undefined}
      className={`w-full ${ratio ? "h-full object-cover" : "h-auto"} ${vul ? "lg:h-full lg:object-cover" : ""} ${parallax ? "g-parallax scale-[1.14]" : ""}`}
    />
  )
  return (
    <figure data-element="Beeld" className={`${vul ? "lg:h-full" : ""} ${className}`.trim()}>
      <div className={`relative overflow-hidden bg-surface ${vul ? "lg:h-full" : "rounded-[16px]"}`} style={ratio ? { aspectRatio: ratio } : undefined}>
        {priority ? foto : <BeeldOnthulling vullen={ratio ? true : vul ? "lg" : false}>{foto}</BeeldOnthulling>}
        {wissel && <BeeldWissel foto={wissel} sizes={sizes} focus={focus} />}
        {concept && <ConceptLabel tekst={conceptTekst} />}
      </div>
      {onderschrift && <figcaption className="mt-3 tekst-annotatie text-muted">{onderschrift}</figcaption>}
    </figure>
  )
}
