import type { CSSProperties } from "react"

// Per-letter hover flip for nav links: the resting word rolls up out of a
// mask while an orange copy rolls in from below, letter by letter. Pure
// CSS (`.letter-flip*` in globals.css, per-letter delay from `--i`),
// driven by `:hover` on the PARENT — render this as a direct child of the
// link or button. The orange is `--ember-text`, the token that passes as
// text on both Hours. Reduced motion (the OS setting or the site's own
// `data-motion`) collapses it to a plain colour change.
//
// The whole thing is aria-hidden: the parent carries the word once, in
// an sr-only span, so a screen reader never spells it letter by letter or
// reads it twice.
export function LetterFlip({ text }: { text: string }) {
  const letters = text.split("")

  return (
    <span aria-hidden className="letter-flip relative block overflow-hidden">
      <span className="flex">
        {letters.map((ch, i) => (
          <span key={i} className="letter-flip-uit" style={{ "--i": i } as CSSProperties}>
            {ch === " " ? "\u00a0" : ch}
          </span>
        ))}
      </span>
      <span className="letter-flip-in-rij absolute inset-0 flex">
        {letters.map((ch, i) => (
          <span key={i} className="letter-flip-in" style={{ "--i": i } as CSSProperties}>
            {ch === " " ? "\u00a0" : ch}
          </span>
        ))}
      </span>
    </span>
  )
}
