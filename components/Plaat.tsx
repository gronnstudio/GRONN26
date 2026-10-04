import Image from "next/image"

import type { Foto } from "@/data/projects"

// Een kleiner beeld als plaat: snijtekens op de hoeken en een bijschrift
// in mono eronder. Voor details naast het grote werk; nooit schermbreed.
export function Plaat({ foto, sizes, ratio = "4/5", className = "" }: { foto: Foto; sizes: string; ratio?: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="plaat">
        <div className="relative overflow-hidden bg-surface" style={{ aspectRatio: ratio }}>
          <Image src={foto.src} alt={foto.alt} fill sizes={sizes} className="foto-toon object-cover" style={{ objectPosition: foto.focus }} />
        </div>
      </div>
      {foto.bijschrift && <figcaption className="tekst-label mt-[20px] text-muted">{foto.bijschrift}</figcaption>}
    </figure>
  )
}
