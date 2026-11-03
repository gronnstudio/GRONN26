import type { ReactNode } from "react"

import { LeesTekst } from "./lees-tekst"
import { gedempt, type Toon } from "./toon"

/**
 * Een citaat met ember-streep en bron. `lang` voor een citaat in het
 * Nederlands op de Engelse site. `lees` laat een citaat van één tot drie
 * zinnen meelezen (LeesTekst); alleen als `tekst` een string is.
 */
export function Citaat({
  tekst,
  bron,
  toon = "grond",
  groot = false,
  lang,
  lees = false,
  className = "",
}: {
  tekst: ReactNode
  bron?: ReactNode
  toon?: Toon
  groot?: boolean
  lang?: string
  lees?: boolean
  className?: string
}) {
  const klasse = groot ? "tekst-h3" : `text-[16px] leading-relaxed italic ${toon === "bos" ? "text-white/85" : "text-foreground/85"}`
  return (
    <figure data-element="Citaat" className={className}>
      <blockquote lang={lang} className="border-l-2 border-[var(--gronn-ember)] pl-5 sm:pl-8">
        {lees && typeof tekst === "string" ? (
          <LeesTekst className={klasse}>{`“${tekst}”`}</LeesTekst>
        ) : (
          <p className={klasse}>“{tekst}”</p>
        )}
      </blockquote>
      {bron && <figcaption className={`mt-4 pl-5 tekst-annotatie sm:pl-8 ${gedempt(toon)}`}>— {bron}</figcaption>}
    </figure>
  )
}
