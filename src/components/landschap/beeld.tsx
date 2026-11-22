"use client"

import Image from "next/image"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import { labelVoor, type Beeld as BeeldData } from "./beelden"

// EditorialImage uit de bouwbrief (§07): crop via brandpunt, vaste maat van de
// ouder (aspect-ratio of hoogte), alt in de gekozen taal en het herkomstlabel
// als echte tekst op het beeld. Eigen werk draagt geen label en geen tekst
// (eigenaar, 14 nov 2026: "Ik wil geen tekst over mijn afbeeldingen").
export function Beeld({
  beeld,
  sizes,
  className = "",
  priority = false,
  decoratief = false,
  labelRechts = false,
}: {
  beeld: BeeldData
  sizes: string
  className?: string
  priority?: boolean
  /** naast een link met dezelfde naam: lege alt */
  decoratief?: boolean
  labelRechts?: boolean
}) {
  const taal = useTaal()
  const alt = decoratief ? "" : taal === "en" && beeld.en ? beeld.en.alt : beeld.alt
  const label = labelVoor(beeld)
  return (
    <div className={`ls-beeld ${className}`}>
      <Image
        src={beeld.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={beeld.brandpunt ? { objectPosition: beeld.brandpunt } : undefined}
      />
    </div>
  )
}
