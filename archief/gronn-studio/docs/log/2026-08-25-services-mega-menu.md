# 2026-08-25 — Services mega menu

Owner brief: *"rework het menu op een meer logischere wijze binnen de
bestaande structuur. Beschrijvende tekst per categorie, eventueel een mega
menu zodat services gelijk zichtbaar zijn, alles is beetje weggemoffeld nu."*
Reference given: biovijver.nl.

## Shipped

A disclosure mega menu behind *Services* only. Two columns — the two service
families with their one-line reason for existing and a from-price per
service — plus an "In season now" card. Available from `md`, so tablets get
navigation for the first time.

## Two findings that framed it

1. **Tablet had no navigation at all.** The dock is `md:hidden` (gone at
   768px), the inline nav was `hidden lg:flex` (arrives at 1024px). Between
   those widths the only control was a hamburger. That was a gap, not a
   choice — and it is exactly the band the owner asked about.
2. **Eleven services behind one word.** After the pricing round the priced
   seasonal work (leaf net, autumn service, winterising, survey,
   stewardship) was unreachable from the bar.

## Decisions worth keeping

**Disclosure, not dialog.** No focus trap. Tab walks the panel and then out
of the bar, closing it; Escape closes and returns focus to the trigger. The
curtain's `useFocusTrap` is deliberately *not* reused here — trapping focus
in a nav dropdown is the classic mega-menu mistake. Pinned by an e2e test
that tabs 40 times and asserts the panel closed.

**Hover is never the only way in.** The trigger is a real `<button>` with
`aria-expanded`/`aria-controls`. Pointer intent (120ms open / 200ms close) is
guarded on `pointerType === "mouse"`, because a touch tap also fires
`pointerenter` and would fight the click handler.

**One source for the group copy.** `SERVICE_GROUPS` in
`src/lib/data/services.ts` holds each family's label and its one sentence;
`/services` and the mega menu both read it. Written twice they would drift,
and that sentence is the whole point of the brief. `servicesInGroup()` picks
from the *merged* content list, so owner edits in `/editor` reach the menu.

**`priceHint()`** in `pricing.ts` — the from-price logic was about to exist
in two places.

**Tablet gets its own grid.** Two columns from `md`, three from `lg`, and the
featured card spans the width as a compact row below `lg`. The first attempt
inherited a single column at tablet width: the panel became a full screen
tall and the prices flew to the far edge.

## Rejected

- **`glass-strong` for the panel.** Tried first, for consistency with the
  bar. The hero text read straight through it — legibility beats the
  floating effect, so the panel is `bg-background` with a soft edge shadow,
  the same solid treatment the curtain already uses.
- **Consolidating the seven nav items** (Diensten · Werk · Studio + CTA,
  which would also have surfaced Veldlab and Techniek from the footer).
  Proposed and **declined by the owner** — the bar stays as it is; only
  Services gets a panel. Do not re-propose without asking.
- **Sub-links pointing at each family's first service.** Misleading. The
  group sections on `/services` now carry `id="design"` / `id="seasonal"`
  and the curtain links to those anchors instead.

## Open

**biovijver.nl could not be read** — this environment's egress proxy blocks
the domain (`CONNECT tunnel failed, 403`). The owner is sending screenshots;
the visual detailing (column split, whether imagery belongs in the menu, how
they present prices) is still to be reconciled against them. Structure and
behaviour are independent of that.

The featured card pulls a placeholder from `public/ph`. A menu is where that
shows most — another argument for real photography.

## Verified

`tsc --noEmit`, `eslint src scripts tests`, `check-contrast.mjs` (122 pairs,
0 failing), `next build`, `playwright test` (25 passed). New coverage: the
disclosure behaviour in `behaviors.spec.ts` and an axe scan with the panel
open in `a11y.spec.ts`. Screenshotted at 1440px and 900px, both locales
built. Not yet reviewed on the preview by the owner.
