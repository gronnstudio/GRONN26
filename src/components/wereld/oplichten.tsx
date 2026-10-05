import type { ElementType, ReactNode } from "react"
import { Beide, type Tekst } from "@/components/taal"

/** Tekst in losse woorden; elk woord licht op zodra het boven 70 % van het scherm komt. */
export function Woorden({ tekst }: { tekst: Tekst }) {
  if (typeof tekst !== "string") return <Beide nl={<Woorden tekst={tekst.nl} />} en={<Woorden tekst={tekst.en} />} />
  return (
    <>
      {tekst.split(/(\s+)/).filter(Boolean).map((d, n) =>
        /^\s+$/.test(d) ? " " : (
          <span key={n} className="w-wd">
            {d}
          </span>
        ),
      )}
    </>
  )
}

/** Een alinea (of ander element) waarvan de woorden één voor één oplichten. */
export function Oplichten({ tekst, als: Als = "p", className = "", children }: { tekst: Tekst; als?: ElementType; className?: string; children?: ReactNode }) {
  return (
    <Als className={`w-onthul ${className}`} data-onthul>
      <Woorden tekst={tekst} />
      {children}
    </Als>
  )
}
