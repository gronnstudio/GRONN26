import Link from "next/link"
import type { ReactNode } from "react"

import { Magneet } from "./magneet"
import type { Toon } from "./toon"

// De knoppen van de site (brand guide p. 5, 8 en 12). Drie soorten:
//   primair — aarde-oranje vlak met ANTRACIET tekst (4,70:1). De ene
//             oranje actie per compositie; wit op oranje haalt AA niet.
//   ember   — hetzelfde vlak; de naam bleef voor bestaande aanroepen op
//             het bosgroene vlak.
//   rand    — alleen een omlijning, voor de tweede keuze naast primair.
// Radius 8px — pillen zijn voor compacte bediening, niet voor knoppen.
// Een extern adres (mailto:, tel:, https:) wordt een gewone <a>;
// `nieuwTabblad` opent het in een eigen tabblad (WhatsApp, zoals de dock).
// Met een muis trekt elke knop licht naar de cursor (Magneet, max 6px);
// op touch en bij minder beweging staat hij stil.

type Soort = "primair" | "ember" | "rand"

const ORANJE =
  "bg-gronn-ember text-gronn-black hover:bg-[#e57a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"

const STIJL: Record<Soort, string> = {
  primair: ORANJE,
  ember: ORANJE,
  rand: "border border-current/30 hover:border-current",
}

export function Knop({
  href,
  soort = "primair",
  pijl = soort !== "rand",
  klein = false,
  nieuwTabblad = false,
  download,
  children,
}: {
  href: string
  /** Bestandsnaam: een download (zoals de vCard), altijd een gewone <a>. */
  download?: string
  soort?: Soort
  pijl?: boolean
  klein?: boolean
  nieuwTabblad?: boolean
  children: ReactNode
}) {
  const klasse = `group tekst-knop inline-flex items-center justify-between gap-6 rounded-full transition-colors ${klein ? "min-h-[44px] px-4" : "min-h-[52px] px-5"} ${STIJL[soort]}`
  const inhoud = (
    <>
      {children}
      {pijl && <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>}
    </>
  )
  return (
    <Magneet>
      {download ? (
        <a href={href} download={download} className={klasse}>{inhoud}</a>
      ) : href.startsWith("/") ? (
        <Link href={href} className={klasse}>{inhoud}</Link>
      ) : (
        <a href={href} className={klasse} {...(nieuwTabblad ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inhoud}</a>
      )}
    </Magneet>
  )
}

/**
 * Een tekstlink met pijl: donker oranje op de paletgrond (brand guide:
 * #A14312 op licht), gebroken wit met een oranje streep op een donker
 * merkvlak, waar oranje tekst AA niet haalt. `stil`: in de tekstkleur,
 * zonder oranje — voor een tweede link in een compositie die haar ene
 * oranje accent al heeft (brand guide: één accent per compositie).
 */
export function PijlLink({
  href,
  toon = "grond",
  stil = false,
  children,
}: {
  href: string
  toon?: Toon
  stil?: boolean
  children: ReactNode
}) {
  const kleur = stil
    ? "text-current"
    : toon === "bos"
      ? "text-gronn-white decoration-gronn-ember"
      : "text-[var(--ember-text)]"
  const pijl = !stil && toon === "bos" ? "text-gronn-ember" : ""
  return (
    <Link href={href} className={`group tekst-knop inline-flex min-h-[44px] items-center gap-2 ${kleur}`}>
      <span className="underline decoration-1 underline-offset-[6px] group-hover:decoration-2">{children}</span>
      <span aria-hidden className={`${pijl} transition-transform group-hover:translate-x-1`}>→</span>
    </Link>
  )
}
