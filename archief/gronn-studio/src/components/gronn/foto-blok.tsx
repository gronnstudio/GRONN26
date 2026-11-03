import Image from "next/image"

import { fotosVoor, type Foto, type FotoId } from "@/lib/data/vijverrenovatie"

import { ConceptLabel } from "./elementen/concept-label"
import { FotoStapel } from "./elementen/foto-stapel"

// Een beeldvak uit het fotoplan. Is er (nog) geen foto voor dit ID, dan
// rendert het NIETS: geen leeg kader, geen voorbeeldbeeld, geen kapotte
// link. Eén foto staat breed; een reeks (bijv. filterherstel) staat als
// rij in de volgorde waarin ze in de data staat. Natuurlijke
// verhoudingen: width/height komen van de foto zelf, er wordt niet
// bijgesneden, zodat technische details in beeld blijven.
//
// Een reeks van precies twee STAANDE foto's zonder label wordt op de
// telefoon een FotoStapel (Qi "cards gallery"): twee lange portretten
// onder elkaar zijn daar twee schermen scrollen. Vanaf md, en zonder JS,
// blijft het de rij. Een reeks met een AI-visualisatie stapelt nooit:
// haar label moet altijd in beeld staan. `stapelen={false}` zet het uit.
export function FotoBlok({ id, ...rest }: { id: FotoId; priority?: boolean; breed?: boolean; stapelen?: boolean }) {
  return <FotoRij id={id} fotos={fotosVoor(id)} {...rest} />
}

/** Precies twee foto's, allebei staand, geen van beide met een label. */
export const isStapel = (fotos: Foto[]) =>
  fotos.length === 2 && fotos.every((f) => f.height > f.width && !f.label)

/** Hetzelfde beeldvak voor een ander project: de foto's komen als lijst binnen. */
export function FotoRij({
  id,
  fotos,
  priority = false,
  breed = false,
  stapelen = true,
}: {
  id: string
  fotos: Foto[]
  priority?: boolean
  breed?: boolean
  stapelen?: boolean
}) {
  if (fotos.length === 0) return null
  const reeks = fotos.length > 1
  const figuren = fotos.map((f, i) => (
    // Boven de vouw (priority) komt de foto er meteen: een infade
    // daar vertraagt de LCP en laat het bijschrift halverwege staan.
    <figure key={f.src} className={priority ? undefined : "g-in"}>
      {/* Een label (bijv. "AI-visualisatie") staat óp het beeld: wat
          geen foto van het werk is, mag daar nooit voor doorgaan. */}
      <div className="relative">
        <Image
          src={f.src}
          alt={f.alt}
          width={f.width}
          height={f.height}
          priority={priority && i === 0}
          loading={priority && i === 0 ? undefined : "lazy"}
          sizes={reeks ? "(min-width: 640px) 50vw, 100vw" : breed ? "100vw" : "(min-width: 1024px) 896px, 100vw"}
          className="h-auto w-full rounded-[16px]"
        />
        {f.label && <ConceptLabel tekst={f.label} />}
      </div>
      {(f.bijschrift || f.fase) && (
        <figcaption className="mt-3 flex flex-wrap gap-x-3 tekst-annotatie text-muted">
          {f.fase && <span className="uppercase text-[var(--ember-text)]">{f.fase}</span>}
          {f.bijschrift && <span>{f.bijschrift}</span>}
        </figcaption>
      )}
    </figure>
  ))
  if (stapelen && isStapel(fotos)) return <FotoStapel id={id} kaarten={figuren} />
  return (
    <div className={reeks ? "grid gap-4 sm:grid-cols-2" : breed ? "w-full" : "w-full max-w-4xl"} data-foto={id}>
      {figuren}
    </div>
  )
}
