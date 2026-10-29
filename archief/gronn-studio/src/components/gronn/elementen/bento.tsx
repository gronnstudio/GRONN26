import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Bento: een raster van tegels voor de linkpagina (links.gronn.studio;
 * eigenaar, 27 sep 2026: "een soort bentobox linktree"). Twee kolommen
 * op de telefoon, vier vanaf `md`; elke tegel zegt zelf hoeveel kolommen
 * en rijen hij beslaat, per breedte. Alle maten in px (CLAUDE.md, de
 * telefoonnavigatie, punt 1): tekst groeit, het raster niet.
 */
export function BentoRaster({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-element="BentoRaster"
      className={cn(
        "grid grid-flow-row-dense grid-cols-2 gap-[12px] [grid-auto-rows:minmax(132px,auto)] md:grid-cols-4 md:[grid-auto-rows:minmax(168px,auto)]",
        className
      )}
    >
      {children}
    </div>
  )
}

type Maat = 1 | 2 | 4

const KOLOM: Record<Maat, string> = { 1: "col-span-1", 2: "col-span-2", 4: "col-span-2" }
const KOLOM_MD: Record<Maat, string> = { 1: "md:col-span-1", 2: "md:col-span-2", 4: "md:col-span-4" }
const RIJ: Record<1 | 2, string> = { 1: "row-span-1", 2: "row-span-2" }
const RIJ_MD: Record<1 | 2, string> = { 1: "md:row-span-1", 2: "md:row-span-2" }

/**
 * Eén tegel: een link (intern of extern) met 16px hoeken, zoals elke
 * kaart op de site. `toon`:
 *  - `grond`: `bg-surface` met een fijne rand, de gewone tegel;
 *  - `bos`: het bosgroene merkvlak, witte tekst;
 *  - `ember`: het ene oranje vlak van de pagina, ANTRACIETE tekst
 *    (Brand Guide: oranje als vlak draagt antraciet, nooit wit).
 * `vol` laat de inhoud tot de rand lopen (een fototegel).
 */
export function BentoTegel({
  href,
  kolommen = 1,
  kolommenMd,
  rijen = 1,
  rijenMd,
  toon = "grond",
  vol = false,
  extern = false,
  download,
  label,
  children,
  className,
  data,
}: {
  href?: string
  kolommen?: 1 | 2
  kolommenMd?: Maat
  rijen?: 1 | 2
  rijenMd?: 1 | 2
  toon?: "grond" | "bos" | "ember"
  vol?: boolean
  extern?: boolean
  download?: string
  /** Toegankelijke naam als de zichtbare tekst niet volstaat (bijv. "opent in nieuw tabblad"). */
  label?: string
  children: ReactNode
  className?: string
  data?: string
}) {
  const klassen = cn(
    "group relative flex min-h-[132px] flex-col overflow-hidden rounded-[16px]",
    KOLOM[kolommen],
    KOLOM_MD[kolommenMd ?? kolommen],
    RIJ[rijen],
    RIJ_MD[rijenMd ?? rijen],
    vol ? "p-0" : "p-[16px] md:p-[20px]",
    toon === "grond" && "border border-line/15 bg-surface text-foreground",
    toon === "bos" && "vlak-bos text-gronn-white",
    toon === "ember" && "bg-gronn-ember text-gronn-black",
    href &&
      "transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    className
  )
  if (!href) {
    return (
      <div data-bento={data} className={klassen}>
        {children}
      </div>
    )
  }
  return (
    <a
      data-bento={data}
      href={href}
      aria-label={label}
      download={download}
      {...(extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={klassen}
    >
      {children}
    </a>
  )
}

/** De kleine pijl rechtsboven in een tegel: hij gaat ergens heen. */
export function BentoPijl({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "absolute top-[16px] right-[16px] transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] motion-reduce:transition-none md:top-[20px] md:right-[20px]",
        className
      )}
    >
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  )
}
