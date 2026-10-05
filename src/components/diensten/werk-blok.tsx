import Link from "next/link"

/** Kop boven een werkblok: "Vijverwerk" links, "Alle werk →" rechts. */
export function WerkKop({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-t border-lijn pt-[14px]">
      <h2 id={id} className="lbl m-0 font-normal">
        {children}
      </h2>
      <Link href="/werk" className="lnk">
        Alle werk →
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
      className="mt-[32px] grid grid-cols-1 items-end gap-y-[20px] no-underline md:grid-cols-12 md:gap-x-[32px] md:gap-y-0"
    >
      {children}
    </Link>
  )
}
