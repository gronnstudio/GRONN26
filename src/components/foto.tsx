import Image from "next/image"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"

// Eén foto uit de getypte data. Vult zijn vak (de ouder bepaalt de maat via
// aspect-ratio of hoogte). Een label (bijv. AI-visualisatie) staat altijd óp
// het beeld, zodat een visualisatie nooit doorgaat voor een foto.
export function Foto({
  foto,
  sizes = "100vw",
  className = "",
  priority = false,
}: {
  foto: FotoData
  sizes?: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={`relative overflow-hidden bg-vlak ${className}`}>
      <Image src={foto.src} alt={foto.alt} fill sizes={sizes} priority={priority} className="object-cover [filter:saturate(.88)_contrast(1.04)_brightness(.98)]" />
      {foto.label ? (
        <span className="lbl absolute top-3 left-3 rounded-full bg-antraciet/85 px-2.5 py-1 text-gebroken-wit">{foto.label}</span>
      ) : null}
    </div>
  )
}

/** Een foto die er nog niet is: een vlak met wat er moet komen. */
export function GeenFoto({ wat, className = "" }: { wat: string; className?: string }) {
  return (
    <div className={`flex items-end bg-vlak p-3 text-[11px] font-semibold tracking-[.08em] text-gedempt uppercase ${className}`}>
      [NOG AANLEVEREN: {wat}]
    </div>
  )
}
