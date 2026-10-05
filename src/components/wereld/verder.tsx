import type { CSSProperties } from "react"
import Link from "next/link"
import { T, type Tekst } from "@/components/taal"

// Het slot van elke pagina, zoals Kolenda's "Interested in Seeing More
// Projects?": één kop met een cursief woord en een omlijnde pijl naar de
// logische volgende pagina. Zo is de site een rondgang, en staat Kennismaken
// niet twee keer (hij zit al in het menu). Geen woordmerk hier: dat staat
// één keer, in de voet (eigenaar, 5 okt 2026).
export function Verder({ voor, nadruk, na, href, label }: { voor: Tekst; nadruk: Tekst; na?: Tekst; href: string; label: Tekst }) {
  return (
    <section className="w-verder" aria-labelledby="h-verder">
      <h2 id="h-verder" className="w-verder-kop" data-zie>
        <T t={voor} /> <em><T t={nadruk} /></em>
        {na ? <> <T t={na} /></> : null}
      </h2>
      <Link href={href} className="w-cirkel" data-zie style={{ "--i": 1 } as CSSProperties}>
        <svg viewBox="0 0 11 14" width="12" height="15" aria-hidden="true">
          <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
        </svg>
        <span className="sr-only"><T t={label} /></span>
      </Link>
    </section>
  )
}
