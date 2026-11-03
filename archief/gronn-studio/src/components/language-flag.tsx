import type { Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/**
 * The round flag for a locale — the one drawing, used everywhere.
 *
 * The desktop header's language button and the phone's "Kleur en taal"
 * panel both show it. It lives here so the two can never drift: a flag
 * drawn twice is a flag that will one day be drawn two ways.
 *
 * A flag is a poor label for a language in general — a language is not a
 * country — so this is ALWAYS decoration (`aria-hidden`); whatever holds
 * it carries the full language name as its accessible name.
 *
 * The colours are the flags' own, not theme tokens: a tricolour does not
 * change with Golden or Blue Hour.
 */
const FLAGS: Record<Locale, React.ReactNode> = {
  en: (
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="4" />
      <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2.2" />
    </>
  ),
  nl: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.33" fill="#AE1C28" />
      <rect y="10.67" width="24" height="5.33" fill="#21468B" />
    </>
  ),
}

export function LanguageFlag({
  locale,
  size = 20,
  className,
}: {
  locale: Locale
  /** Diameter in px — never rem: chrome does not grow with text. */
  size?: number
  className?: string
}) {
  return (
    // Round, not a rectangle. Everything else in the header pill is a
    // circle or a round-cornered glyph, and a hard 21x14 rectangle was
    // the one square edge in the row. The viewBox is cropped to a 16x16
    // square first so the flag is centred rather than stretched — a
    // squashed tricolour reads as a different flag.
    <svg
      width={size}
      height={size}
      viewBox="4 0 16 16"
      aria-hidden
      className={cn(
        "shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-line/25",
        className
      )}
    >
      {FLAGS[locale]}
    </svg>
  )
}
