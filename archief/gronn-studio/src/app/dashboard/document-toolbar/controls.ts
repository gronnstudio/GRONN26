// One height for every control in the document toolbar.
//
// Before this the bar held four different ones — a 40px segmented
// control, a 32px kind pill, and buttons and a picker at 32–34px — so
// nothing shared a baseline and the bar's own height changed depending
// on which document was open.
//
// 36px, which is `h-9`: the panel's one already-measured control height
// (the search bar in panel-search.tsx). It is also the truer reading of
// the written spec — "approximately 48px" is measured on a 2048px-wide
// reference, and 48 there is ~34 at the 1440 this is designed for.
// Two rows of 40px made the bar 116px tall, which is a lot of a laptop
// screen to spend on chrome before the document appears.
export const CONTROL_H = "h-9"

/**
 * The toolbar's own bar: see --panel-toolbar-h in globals.css.
 *
 * From `lg` only. That is where the editor column sits beside the sheet
 * and sticks under the bar, so the two must agree on one number. Below
 * `lg` the column is not sticky, the bar is not either, and its rows may
 * wrap to whatever height a phone needs (25 Sep 2026: the builder works
 * on a phone now).
 */
export const TOOLBAR_H = "lg:h-[var(--panel-toolbar-h)]"

/**
 * A quiet control: the picker, "Nieuw", and the two file actions.
 *
 * `active:` mirrors every `hover:` on purpose. It is the panel's house
 * habit (theme-toggle.tsx says why): on touch `:hover` either never
 * fires or sticks after the tap, so the pressed state has to be stated.
 */
export const control =
  "inline-flex items-center justify-center rounded-lg border border-line/20 bg-surface px-3.5 text-sm text-foreground transition-colors hover:border-gronn-green active:border-gronn-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"

/** The one primary action. `gronn-green` is one of only two fills that
 *  carry white text at AA — scripts/check-contrast.mjs asserts both. */
export const controlPrimary =
  "inline-flex items-center justify-center rounded-lg bg-gronn-green px-4 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong active:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
