# Session log — 30 Jul 2026 · Tech Stack page

Agent: Claude Code (Opus 5) · Owner: Nick

## What shipped

New public route `/stack` (`/nl/stack`) on branch `feat/tech-stack-page`
— a Tech Stack page modelled on Equilibrium's `/about` "the engine"
section, but built as an exploration instead of a list, at the owner's
explicit request ("more interactive and intuitive").

Interaction model, in one line: **filter by layer, open a technology to
read its trade-off, cross-check it against the sister site.**

- Four layers as a cross-section (frontend / hosting / content /
  tooling), each a labelled button with its own count; selecting one
  narrows the grid and explains what that layer is for.
- Nineteen technologies, each a disclosure that opens on **why this** /
  **what it costs** / **next to Equilibrium**.
- A third filter crossing both axes: "also runs on Equilibrium",
  sourced from `TECH-STACK.md`.
- Open all / close all, a live region announcing how many are shown, and
  an empty state (content layer + shared filter = nothing) with a
  clear-filters button.

## Decisions worth keeping

- **Versions are read from `package.json` at build time**
  (`src/lib/stack.ts`), never typed by hand. A stack page that can lie
  about its own versions is worse than no stack page. Structure (which
  layers exist, which technology sits where, which packages back it)
  stays in code for the same reason; only the prose lives in the content
  document, where the owner can rewrite it.
- **The honest entries stay in.** Sanity is listed as dormant, the
  browser-driven checks are listed as "checks, not a test suite", and
  `next-auth` is listed as an auth library on a site with no users.
  Leaving them out would have made the page a brochure.
- **Two entries in the hosting layer is the point**, not a gap — the
  layer summary says so.

## Gotchas

- Raw HTML greps still cannot verify language: both languages ship in
  every page's RSC payload. Verified in headless Chrome instead
  (`scripts/check-locales.mjs` pattern) — rendered `<h1>`, `<html lang>`,
  localized layer buttons, and the interactions themselves.
- `EditableText` renders a `role="button"` span in edit mode, so no
  editable string may sit inside a real `<button>` — the layer bands show
  a plain translated label and the editable copy lives in the summary
  panel beside them (same solution the homepage systems diagram uses).
- `npm run lint` fails at this branch's HEAD with two pre-existing
  `react-hooks/refs` errors in `src/app/template.tsx` — proven by
  stashing this work and re-running. **Not touched here**: it is outside
  this PR's scope and belongs in its own change.

## State at end of session

Typecheck clean, build clean (both `/stack` routes prerendered), lint
clean for every file this PR touches, all browser checks passing on a
local production server. PR opened, not merged.
