"use client"

import { useEffect, useRef } from "react"

import { useReducedMotion } from "@/lib/use-reduced-motion"
import type { Video } from "@/lib/data/vijverrenovatie"
import { cn } from "@/lib/utils"

/**
 * Een korte projectclip: stil, in een lus, als een levende foto. Speelt
 * vanzelf af (muted + playsInline, anders weigert iOS), maar NIET bij
 * minder beweging: dan staat de poster stil en krijgt de bezoeker de
 * bediening om zelf te starten (CLAUDE.md, ontwerpregel 4). Laadt alleen
 * de metadata tot hij in beeld komt. Radius 16px, net als foto's.
 *
 * Optioneel, voor een clip buiten de projectpagina (sinds 29 sep 2026 op
 * /stack):
 * - `glas`: de `photo-glass`-laag over het beeld, zoals bij elke foto.
 * - `verhouding` + `focus`: een vaste beeldverhouding (CSS aspect-ratio,
 *   bv. "1 / 1") met `object-cover`, en welk deel in beeld blijft
 *   (object-position). Zonder: de eigen maat van de clip.
 * - `bijschrift` / `beschrijving`: in de taal van de pagina; zonder staan
 *   de (Nederlandse) teksten uit de data.
 */
export function ProjectVideo({
  video,
  className = "",
  glas = false,
  verhouding,
  focus,
  bijschrift = video.bijschrift,
  beschrijving = video.beschrijving,
}: {
  video: Video
  className?: string
  glas?: boolean
  verhouding?: string
  focus?: string
  bijschrift?: string
  beschrijving?: string
}) {
  const minder = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  // Afspelen pas na de hydratie: de server kent de voorkeur niet, en een
  // autoPlay-attribuut in de HTML zou ook bij minder beweging even lopen.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.autoplay = !minder
    if (minder) el.pause()
    else el.play().catch(() => {})
  }, [minder])
  return (
    <figure data-element="ProjectVideo" className={`g-in ${className}`} data-video="">
      <div className="relative rounded-[16px]">
        <video
          ref={ref}
          src={video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          aria-label={beschrijving}
          muted
          loop
          playsInline
          preload="metadata"
          controls={minder}
          className={cn("h-auto w-full rounded-[16px] bg-surface", verhouding && "object-cover")}
          style={verhouding ? { aspectRatio: verhouding, objectPosition: focus } : undefined}
        />
        {/* Niet over de bediening bij minder beweging: pointer-events staan in de utility al uit. */}
        {glas && <div aria-hidden data-photo-glass="" className="photo-glass absolute inset-0" />}
      </div>
      {bijschrift && <figcaption className="mt-3 tekst-annotatie text-muted">{bijschrift}</figcaption>}
    </figure>
  )
}
