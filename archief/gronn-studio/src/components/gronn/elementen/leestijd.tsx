import { pick, type Locale } from "@/lib/i18n"

/**
 * "± 6 min lezen" — een kleine annotatie bij de titel van een lang
 * projectverhaal. Berekend bij het bouwen uit de echte teksten
 * (ongeveer 200 woorden per minuut, afgerond, minimaal 1), dus hij kan
 * niet uit de pas lopen met wat er staat.
 */

export const WOORDEN_PER_MINUUT = 200

export function leesMinuten(teksten: readonly string[]): number {
  const woorden = teksten.reduce((n, t) => n + t.split(/\s+/).filter(Boolean).length, 0)
  return Math.max(1, Math.round(woorden / WOORDEN_PER_MINUUT))
}

export function Leestijd({
  minuten,
  locale,
  className = "",
}: {
  minuten: number
  locale: Locale
  className?: string
}) {
  return (
    <p lang={locale} data-leestijd className={`tekst-annotatie text-muted uppercase ${className}`}>
      ± {minuten} {pick({ nl: "min lezen", en: "min read" }, locale)}
    </p>
  )
}
