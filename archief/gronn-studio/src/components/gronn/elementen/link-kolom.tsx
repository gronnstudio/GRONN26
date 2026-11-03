import Link from "next/link"

import { gedempt, type Toon } from "./toon"

/** Een kopje met een lijst links eronder (voettekst, sitemapachtige blokken). */
export function LinkKolom({
  kop,
  links,
  label,
  toon = "grond",
  tweeKolommen = false,
}: {
  kop: string
  links: { href: string; tekst: string }[]
  /** Maakt er een <nav> van met dit label. */
  label?: string
  toon?: Toon
  /** Onder `lg` de links naast elkaar in twee kolommen: een lange lijst op de telefoon. */
  tweeKolommen?: boolean
}) {
  const inhoud = (
    <>
      <p className={`tekst-annotatie ${gedempt(toon)}`}>{kop}</p>
      <ul className={`mt-4 grid gap-1 text-[15px] ${tweeKolommen ? "grid-cols-2 gap-x-6 lg:grid-cols-1" : ""}`}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={`inline-flex min-h-[32px] items-center ${toon === "bos" ? "hover:text-[var(--gronn-ember)]" : "hover:text-[var(--ember-text)]"}`}>
              {l.tekst}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
  return label ? <nav data-element="LinkKolom" aria-label={label}>{inhoud}</nav> : <div data-element="LinkKolom">{inhoud}</div>
}
