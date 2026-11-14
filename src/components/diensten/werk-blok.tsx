import Link from "next/link"
import { T, type Tekst } from "@/components/taal"
import { Pijl } from "@/components/pijl"

/** Kop boven een werkblok, als de sectiekoppen van de voorpagina: "Vijverwerk" links, "Alle werk" met pijl rechts. */
export function WerkKop({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="ar-sectiekop">
      <h2 id={id} className="ar-h2">
        {children}<b className="ar-punt" aria-hidden>.</b>
      </h2>
      <Link href="/werk" className="ar-lbl w-lijnlink">
        <T t={{ nl: "Alle werk", en: "All work" }} /> <Pijl richting="e" />
      </Link>
    </div>
  )
}

/**
 * Eén project als blok: beeld en tekst naast elkaar op 12 kolommen, onder
 * elkaar op de telefoon. `beeld` en `tekst` dragen hun eigen kolomklassen.
 */
export function WerkBlok({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-zie
      className="grid grid-cols-1 items-end gap-y-[20px] no-underline md:grid-cols-12 md:gap-x-[32px] md:gap-y-0"
    >
      {children}
    </Link>
  )
}

/** Sectiekop als op de voorpagina: lijn, label links, aantal rechts. */
export function KopRegel({ id, label, aantal }: { id: string; label: Tekst; aantal: Tekst }) {
  return (
    <div className="ar-sectiekop">
      <h2 id={id} className="ar-h2">
        <T t={label} /><b className="ar-punt" aria-hidden>.</b>
      </h2>
      <span className="ar-lbl tabular-nums">
        <T t={aantal} />
      </span>
    </div>
  )
}
