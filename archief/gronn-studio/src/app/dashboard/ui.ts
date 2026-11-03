// The panel's class vocabulary, in one place.
//
// Ten strings were repeated across the owner surfaces and had already
// started to drift — the card shell was written three ways, the status
// chip twice. This is the same move the photo film needed: one
// definition, imported, rather than a shape re-typed per file and
// diverging a percent at a time.
//
// Nothing here invents a colour. Every value is a semantic token or one
// of the two brand fills that `scripts/check-contrast.mjs` actually
// guarantees under white text — `gronn-green` (4.87:1) and
// `gronn-ember-strong` (4.64:1). Those two are the whole palette for a
// filled surface; pure ember under white is 2.99:1, and `accent` inverts
// role between the light and dark themes.

/** The default surface: every card, panel and tile sits on this. */
export const card = "rounded-xl border border-line/12 bg-surface"

/** The same, with the padding the dashboard uses. */
export const cardPad = `${card} p-5`

/** A card that carries white text. The one filled variant that is safe. */
export const cardFilled = "rounded-xl bg-gronn-green text-gronn-white"

/** The heading inside a card. */
export const cardTitle = "font-heading text-base font-semibold tracking-tight"

/** The mono field annotation the whole site uses for small labels. */
export const label =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-muted"

/** A number that is the point of its card. */
export const figure =
  "font-heading text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums"

/** Section rule between rows of a list. */
export const rows = "divide-y divide-line/10"

export const buttonPrimary =
  "tap-target inline-flex items-center gap-2 rounded-full bg-gronn-green px-5 py-2.5 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"

export const buttonSecondary =
  "tap-target inline-flex items-center gap-2 rounded-full border border-line/25 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"

export const buttonIcon =
  "tap-target grid place-items-center rounded-full border border-line/20 p-2 text-muted transition-colors hover:border-gronn-ember hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"

/** The small round arrow in the corner of a KPI card. */
export const buttonArrow =
  "grid size-8 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"

/**
 * A text input.
 *
 * `text-base sm:text-sm` and not plain `text-sm`, and the breakpoint is
 * the whole point: iOS zooms the page in when a field it focuses is
 * under 16px, and 14px is under 16px. That never showed while the panel
 * refused phones outright; the moment a screen went `phoneReady` it
 * became a page that jumps when you tap the search box.
 *
 * From `sm` up it is 14px again, which is the density the tables and the
 * builder are laid out for.
 */
export const field =
  "w-full rounded-md border border-line/20 bg-surface px-2.5 py-1.5 text-base text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-gronn-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)] sm:text-sm"

export const emptyState =
  "rounded-lg border border-dashed border-line/25 p-5 text-[13px] leading-relaxed text-muted"

// There used to be a `desktopOnly` / `narrowOnly` pair here, "the one
// screen-size rule on the whole panel": desktop-only by the owner's
// instruction. Nothing imported them any more, and on 25 Sep 2026 the
// owner reversed the rule itself — he wants the dashboard on his phone —
// so they went rather than stay as an invitation. Whether a surface
// works on a phone is `phoneReady` on the shell, per page.
