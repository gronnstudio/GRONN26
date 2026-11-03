# Session log — 30 Jul 2026 · Craft pass, contrast auditor, The Hours

Agent: Claude Code (Opus 5) · Owner: Nick

## Provenance — read this first

This session ran on the owner's **secondary Claude account**, on branch
`claude/resume-work-sbu8hz`, via **PR #48**. The owner runs several
accounts/sessions against this repo (see ROADMAP.md Step 0), so nothing
here is visible in another session's memory — this file, `docs/worklog.md`
and `ROADMAP.md` are the whole handover.

The branch had already been merged into `main` once before this session;
it was reset onto latest `main` and the remaining roadmap items picked
up from there.

## What shipped

### 1. Craft pass — roadmap B2 / B5 / B6

Documented in full in the first 2026-07-30 worklog entry; summary only:

- `src/lib/motion.ts` now holds the house easing curves and the cursor's
  spoken vocabulary. Nine hand-typed curve definitions across eight files
  import from it. It caught three animations (mobile dock sheet, dock
  pill, pull-to-refresh) running on **Equilibrium's** easing
  `[0.22,1,0.36,1]` instead of this site's `[0.16,1,0.3,1]`.
- A `tap-target` utility gives any control a 44px press area without
  changing the size it is drawn at — applied across 14 files.
- Safe-area insets; sheet height moved to the dynamic viewport unit.
- 404 rebuilt as a survey-sheet "lost field marker"
  (`src/components/lost-marker.tsx`).
- Console signature (`src/components/console-signature.tsx`).
- Homepage section indices renumbered into one continuous 01–10 run;
  they had contained two duplicate pairs (two 03s, two 06s) and one
  unnumbered section mid-sequence.

### 2. Contrast auditor — `scripts/check-contrast.mjs`

Parses the real token blocks out of `src/app/globals.css` (not a copy, so
it cannot drift from what ships), checks every palette against WCAG 2.2
AA, exits non-zero on failure. Run it after touching any colour:

```
node scripts/check-contrast.mjs
```

Current run: **122 pairs across ten palettes, 0 failing.**

It found a genuine live defect on its first run: **white text on Signal
Ember measured 2.99:1 against a 4.5:1 requirement.** That affected every
primary button's hover state, the mobile dock's centre slot, the tilt
indicator and the editor toolbar.

Why it had gone unnoticed: **Lighthouse only measures the resting
state.** A colour that exists only under `:hover` is never scored, so the
site held an accessibility score of 100 with this failing.

Fix: a new `--gronn-ember-strong` (**#c74100**), used *only* where ember
is a filled surface under white text. **Signal Ember is unchanged at
#f95a08** for every line, dot, marker, border and tint. Current
`ember-strong` call sites: `cta-link.tsx`, `header.tsx`,
`mobile-dock.tsx`, `cookie-notice.tsx`, `contact/intake-form.tsx`,
`motion/tilt-indicator.tsx`, `editor/toolbar.tsx`,
`editor/editable-image.tsx`.

### 3. Rejected: "Marl" and "Peat"

Two themes — **Marl** (light limestone, "Mergel") and **Peat** (dark
brown-black, "Veen") — were designed, built, committed, and then
**rejected outright by the owner**, whose words were that they were bad.
They have been removed from the codebase. No `.marl` / `.peat` token
blocks, catalog entries or provider names remain.

Do not re-propose them. The post-mortem, which the replacement set is
built on:

- **Marl** — a mid-value tinted light ground reads *muddy* no matter what
  the contrast maths says. Passing AA is not the same as looking clean.
- **Peat** — a brown-black dark ground reads **sepia**, not soil.

The contrast auditor and the ember fix were committed alongside these two
themes; **those two survive and are real.** The second 2026-07-30 worklog
entry originally documented Marl and Peat as delivered and has been
amended in place to say what was kept and what was rejected.

### 4. The Hours — five replacement themes

Built after researching how dark and light mode are actually done in
practice, rather than designing from a concept. The brief that came out
of that research, and which all five follow:

1. **Never a pure-black ground.** Material puts the floor at `#121212`.
   Black under bright content pushes contrast to the point of eye strain
   and smears for readers with astigmatism.
2. **In dark mode, elevation is expressed as *light*, not shadow.** The
   `--surface` token is *lighter* than `--background` on every dark
   palette.
3. **Accents must be desaturated on dark grounds.** A saturated colour
   that works on white visually vibrates against dark.
4. **Light grounds stay high-value and low-chroma.** A mid-value tinted
   ground reads muddy regardless of the numbers — which is precisely how
   Marl failed.

The five, one day dawn to dark (ordered by the clock, not by lightness):

| Theme | Ground | Note |
| --- | --- | --- |
| **First Light** (Ochtendgloren) | `#f4f5f8` | Cool pale, before the sun clears the hedge |
| **Glasshouse** (Kas) | `#f2f7f3` | Noon under glass — the brightest ground in the system |
| **Golden Hour** (Gouden Uur) | `#f8efdc` | Warm cream, deliberately **not** a true amber: ember must stay legible as the interaction colour, and it cannot do that on a ground of its own hue |
| **Blue Hour** (Blauwe Uur) | `#10152e` | Deep indigo dusk; surface `#1a2040` |
| **Moonlight** (Maanlicht) | `#121513` | Neutral graphite at Material's `#121212` floor with a trace of green — the quiet near-neutral dark the set never had (Forest is green, Night is absolute, Nocturne is blue); surface `#1c211e` |

All five carry their own `--scene-*` vars, so the 3D terrain re-tints
with them instead of falling back. All five pass the auditor.

### 5. Second theme switcher

The five Hours live behind their **own separately labeled switcher**, so
the original five stay in the first one. Both are `ThemeToggle`
(`src/components/theme-toggle.tsx`), mounted as a pair in
`layout/header.tsx` and `layout/mobile-dock.tsx`.

The mechanic worth knowing: **next-themes holds only one active theme**,
so the two switchers are two windows onto one value. Each names its set
and renders a hollow swatch plus an **em dash** when the active theme
belongs to the other set; clicking it then adopts the first palette in
its own set. Without that, both controls would look switched on and a
visitor could not tell which palette they were looking at.

The catalog was extracted to **`src/lib/themes.ts`** (`CORE_SET`,
`HOURS_SET`, `THEME_SETS`, `ALL_THEME_NAMES`).

## Registering a new palette — the places it must be added

Miss one and the failure is usually silent.

1. **The token block in `src/app/globals.css`** — `--background`,
   `--surface`, `--foreground`, `--muted`, `--line`, `--accent`, plus the
   four `--scene-*` vars. Dark palettes also set `--focus-ring` and
   `--ember-text`.
2. **The `@custom-variant dark` list** at the top of `globals.css`
   (line 3) — **dark palettes only**. Missing it makes every `dark:`
   utility on the site **silently no-op** on that theme, with no error.
3. **The labeled entry in `src/lib/themes.ts`**, in `CORE_SET` or
   `HOURS_SET`. The `bg`/`dot` swatch hexes there are duplicated from the
   token block *on purpose*: the switcher paints them before hydration,
   when the custom properties of a not-yet-applied theme cannot be read.
   Keep them in step by hand — the auditor checks the tokens, not these.
4. **The `themes` array in `src/components/providers.tsx`.** As of this
   session this is **derived** from `ALL_THEME_NAMES`, so step 3 now
   covers it — but check it is still derived before assuming so. It used
   to be a hand-maintained literal, and CLAUDE.md may still describe it
   that way.

Then run `node scripts/check-contrast.mjs`; it must exit 0.

(Historic note: a fifth place used to exist — the labeled entry lived in
`theme-toggle.tsx` before the catalog was extracted to `themes.ts`.)

## Still open — nothing below was done

- **The ten palettes have not been properly reviewed.** The five new ones
  did get a visual smoke test: screenshotted at 1280×900 (English,
  reduced motion, homepage above the fold) against a local production
  build, and all five apply correctly with both switchers showing the
  right active/inactive state. What that does *not* cover: any phone
  width, any page but the home hero, Dutch, motion, or the five original
  palettes. Warm and atmospheric grounds are exactly where the numbers
  pass and the result can still look wrong — which is how Marl and Peat
  got as far as a commit. The Hours still need the **owner's eyes on the
  preview URL, ideally on a phone**, before anyone treats them as
  settled.
  (Reproduce the smoke test: `npm run build && npm run start`, then drive
  Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with
  `playwright-core`, seeding `localStorage.theme` before first paint.)
- **Roadmap B1 (scroll-choreographed terrain hero) was deliberately left
  out.** It would touch the deferred-3D loading that took mobile LCP from
  ~4.6 s to ~1.1 s, and a hero animation should not land unseen.
- **Real photography remains the single blocking item for an Awwwards
  submission.** Owner action. See `docs/sotd-strategy.md` (written
  earlier this session) for how SOTD is actually scored and the honest
  per-criterion gap list.
- Remaining B2 work: route-transition upgrade in `src/app/template.tsx`,
  micro-interaction inventory.

## Contradictions a later session should expect

- `CLAUDE.md` described **seven palettes including Marl and Peat**, and
  described palette registration as four edits with the labeled entry in
  `theme-toggle.tsx`. Both are stale as of this session. It was being
  edited in parallel by another session on this branch — verify it
  matches the ten-palette reality before trusting it.
