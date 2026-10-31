# GRØNN × Equilibrium — Roadmap

Status board for the approved brand plan. Kept **identical in both repos**
(like TECH-STACK.md). Any Claude session/account: update the status lines
here in the same PR that does the work.

**Status:** ✅ done · 🔨 in progress · ⬜ not started · 🔒 blocked on owner

> **Companion document:** this file is the *craft* roadmap (Awwwards
> elevation, brand alignment). For what the website must do for the
> business — discovery, trust, conversion, operations — see
> [`docs/roadmap-business.md`](docs/roadmap-business.md). Also live:
> the GRØNN Editor (owner edits all site text/images at `/editor`;
> AGENTS.md §6).
>
> **For the submission itself** — how SOTD is actually scored (18 jurors,
> outlier trimming, the 6.5 threshold), what the durable brands do that a
> jury rewards, and an honest per-criterion audit of where this site
> currently stands — see [`docs/sotd-strategy.md`](docs/sotd-strategy.md).
> The sequenced campaign that follows from it — phases, owner gates, the
> submission checklist, and a reasoned decision on what technology is
> worth adding (and what to remove) — is
> [`docs/sotd-campaign.md`](docs/sotd-campaign.md).

- Step 0 publish roadmap: ✅ (this file)
- Part C contact rail: ✅ LIVE on gronn.studio (merged via PR gronn-studio#8, 2026-07-19)
- Part B awwwards elevation (B1–B6): 🔨 in progress — done so far: Field Lab `/lab`, Nocturne theme, pin-to-home-screen, B3 perf slice (image pipeline, deferred 3D, Lighthouse protocol, PRs #38–#41), B4 a11y floor (focus traps, skip link, theme-aware focus ring, reduced-motion parity, aria audit) + contrast auditor `scripts/check-contrast.mjs` and the `--gronn-ember-strong` fix (PR #48), B2 partial (eases centralized in `src/lib/motion.ts`, cursor vocabulary de-duplicated, homepage survey sequence renumbered 01–10), B5 ✅ mobile targets (`tap-target`, 14 files) + safe areas + touch equivalents, B6 ✅ 404 "lost field marker" and console signature — remaining: ~~terrain choreography (B1)~~ built and ARCHIVED unmerged by owner decision 1 Aug 2026 (“doesn't add much” — exploration preserved on branch `feat/terrain-choreography`, PR #51; do not re-propose), rest of the craft pass (B2: route-transition upgrade, micro-interaction inventory), hover-state contrast on light themes (ember/green as hover *text* — still an owner decision; the white-on-ember *fill* case is fixed) · B7 photography: 🔒 owner · B8 submission: 🔒 after B7
- Theme system: 🔨 ten palettes in two labeled sets — core (Paper/Meadow/Forest/Night/Nocturne) and **The Hours** (First Light/Glasshouse/Golden Hour/Blue Hour/Moonlight), catalog in `src/lib/themes.ts`, one switcher per set. `node scripts/check-contrast.mjs` passes 122 pairs / 0 failing. 🔒 **owner: none of the ten has been visually reviewed** — Marl and Peat passed the same audit and were rejected on sight, so numbers are not sufficient. Preview URL, ideally on a phone. Details: [`docs/log/2026-07-30-themes-and-craft-pass.md`](docs/log/2026-07-30-themes-and-craft-pass.md)
- Part A equilibrium alignment (A1–A7): ⬜

## Context

GRØNN Studio (gronn.studio) is the mother brand; Equilibrium is its cinematic
side branch. An audit of both codebases found they share DNA (Next.js App
Router, Syne display face, Lenis, R3F, EN/NL i18n, four-theme systems) but
diverge in exactly the things a visitor feels: Equilibrium uses ember
decoratively (~296 hits/61 files, violating gronn's "ember = interaction
only" rule), styles everything lowercase in a single font, uses glass panels
and pixel/stepped motifs versus gronn's fine line-work, has different easing
([0.22,1,0.36,1] vs [0.16,1,0.3,1]), and unlabeled dropdown controls versus
gronn's labeled ones. Meanwhile the owner wants gronn.studio itself elevated
to Awwwards SOTD-candidate quality, plus a floating WhatsApp + Instagram rail
mid-left. Three workstreams, sequenced: contact rail (small, ships first),
gronn SOTD elevation, equilibrium subbrand alignment.

**Branching:** each part gets its own branch off `claude/tech-stack-comparison-asyd6f`
(inherits the ember-hex fix already in the open PRs): `claude/contact-rail`
(gronn), `claude/awwwards-elevation` (gronn), `claude/gronn-alignment`
(equilibrium). Rebase onto default branches once the open PRs merge.

**Global constraints:** `npm run build` passes before every push · verify on
preview URLs · every user-facing string `{ en, nl }` · semantic tokens only,
no hardcoded theme hex.

Sizes: S ≤ half day · M = 1–2 days · L = 3+ days.

---

## Step 0 — Publish this plan to both repos (first action on approval)

The owner runs multiple Claude accounts/sessions; the plan must live in git,
not in one session. On approval: commit this document as `ROADMAP.md` in
**both** repos (same cross-repo pattern as TECH-STACK.md, kept identical),
on the existing `claude/tech-stack-comparison-asyd6f` branches so it rides
the open PRs. Each later PR updates the relevant checkboxes/status lines in
`ROADMAP.md` so any session can see what's done, in progress, and blocked.

---

## Part C — Floating contact rail on gronn.studio (ship first, S total)

1. **Data** — `src/lib/business.ts`: add `whatsapp: "https://wa.me/31618118014"`
   (instagram already exists there).
2. **Component** — new `src/components/layout/contact-rail.tsx`:
   - `fixed left-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-4` — desktop only.
   - GRØNN look: fine-line outline SVG icons (stroke 1.25, `currentColor`),
     vertical mono labels (`writing-mode: vertical-rl`, `text-[10px]
     tracking-[0.25em] uppercase text-muted`) so every control is labeled
     (owner rule 1); hairline separators `border-line/15`; hover →
     `text-gronn-ember` (rule 3); `data-cursor` labels for the speaking cursor.
   - Visibility: fade in after hero exits (IntersectionObserver), fade out
     while footer is in view; `motion-safe` fade+slide with ease
     [0.16,1,0.3,1]; reduced-motion → instant opacity.
   - `target="_blank" rel="noopener noreferrer"`; `aria-label`s `{ en, nl }`
     via `useT()`.
   - z-30 verified against stack: menu z-40, header z-50, dock/cookie z-[60/61],
     curtain z-[70], cursor z-[80], preloader z-[90] — no conflicts.
3. **Mount** — `src/app/layout.tsx` next to `<MobileDock />`.
4. **Mobile** — no rail; add a WhatsApp row to the dock sheet's contact area
   in `src/components/layout/mobile-dock.tsx` (near the LanguageToggle block).
5. Verify: build, preview across 4 themes × 2 languages × reduced-motion,
   keyboard focus order.

---

## Part B — gronn.studio Awwwards SOTD plan

Judging: design 40 · usability 30 · creativity 20 · content 10.
**Hard gate: real photography (owner action) — picsum won't survive jury.**
All code work proceeds now; submission waits for content.

**B1/B2 WOW backlog (approved 2026-07-19, prototyped in `/lab` first):**
1. Ecosystem-disturbance simulation — remove a species node, watch the web
   wither/rebalance (✅ prototype in `/lab`)
2. Growth-follows-you cursor field — fine-line sprouts where the pointer
   travels (✅ prototype in `/lab`; site-wide layer later)
3. Site-is-alive-now — terrain reads real season/time (optionally weather)
   in Limburg
4. Draw-your-plot intake — sketch canvas on /contact that becomes a survey
   drawing attached to the lead
5. Survey mode — labeled toggle overlaying the page with its own
   measurement marks
6. Before/after survey line on project images (mechanism now, real photos
   later)
Also shipped on this branch: **Nocturne** theme ("Dark Mode 2.0": deep
blue-charcoal, rich greys, vivid mint accent) in the cycle switch. Since
then the palette count went to **ten in two labeled sets** — see the
theme-system status line at the top of this file.

- **B1 Signature moments (L, code now)** ⬜ — deferred on purpose (see
  status line); the living-system diagram half is live.
  - Scroll-choreographed terrain hero (`src/components/three/terrain-scene.tsx`,
    `terrain.tsx`, `home/hero.tsx`): camera/displacement/fog driven by Lenis
    progress; palette reads scene CSS vars per theme; survey-annotation pins
    projected from 3D coords ("the site surveys its own terrain").
    Reduced-motion: static framed render. Mobile: capped DPR / poster tier.
  - Living-system diagram (`home/living-system.tsx`): interactive fine-line
    ecosystem map — hairline SVG paths drawing on scroll (`pathLength`), mono
    annotations, ember markers on hover, nodes linking to services.
- **B2 Craft pass (M)** 🔨 — done: eases centralized in `src/lib/motion.ts`
  (caught three animations on equilibrium's curve), cursor vocabulary
  de-duplicated, homepage indices renumbered 01–10 (they held two
  duplicate pairs). Remaining: route-transition upgrade, micro-interaction
  inventory. Original scope: micro-interaction audit (magnetic CTAs,
  letter-flip nav, underline-draw links, tilt cards — inventory, fill gaps);
  extend cursor vocabulary ("View"/"Read"/"Drag" `{ en, nl }`); route
  transition upgrade in `src/app/template.tsx` (destination mono label on the
  green curtain, reveal-image continuation card→hero); centralize eases in a
  new `src/lib/motion.ts` and sweep strays (mobile-dock.tsx:149 uses
  equilibrium's ease); SectionLabel indices 01–13 as one continuous survey
  story across home sections.
- **B3 Technical excellence (M, code now)**: Lighthouse ≥95 mobile, LCP <2.0s,
  CLS <0.05, INP <200ms; dynamic-import terrain + poster fallback,
  `frameloop="demand"` when idle; font loading metrics; `next/image` AVIF +
  blur placeholders (wired now, real photos drop in later); preloader must not
  delay LCP.
- **B4 A11y + reduced motion (M — judged usability)** ✅: skip link,
  brand-styled focus states (ember ring = interaction, legal), menu/sheet
  focus traps, reduced-motion parity walk, aria-label audit. Contrast is
  now enforced rather than audited once: `node scripts/check-contrast.mjs`
  parses the real token blocks and exits non-zero on failure (122 pairs,
  ten palettes, 0 failing). It caught white-on-Signal-Ember at 2.99:1
  against a 4.5:1 requirement — live on every primary button's hover
  state under a Lighthouse a11y score of 100, because Lighthouse only
  measures the *resting* state. Fixed with `--gronn-ember-strong`
  (#c74100) for ember-as-filled-surface; #f95a08 unchanged everywhere else.
- **B5 Mobile polish (S/M)** ✅: safe-area insets, ≥44px targets via a
  `tap-target` utility that grows the press area without changing drawn
  size (14 files), touch equivalents for hover-only reveals. Terrain
  thermal check still unmeasured.
- **B6 Finishing touches (S/M)** ✅ (core): 404 rebuilt as "lost field marker"
  (contour lines, surveyor's traverse, ember station mark, Stein
  coordinates); console signature. Not done: stamp spin; ambient sound
  toggle (owner decision 6 — default skip).
- **B7 Owner gate**: real photography shot list per section/project
  (green-wash treatment is drop-in), case-study depth, final EN/NL copy, OG
  images.
- **B8 Submission (S, after B7)**: paid (~€65–75); pre-submit cross-browser
  incl. iOS Safari, screenshots 1440/1280/390, self-score, midweek timing.

Order: B3+B4 (usability floor) ∥ B1 (differentiator) → B2 → B5/B6 → B7 → B8.
Actual: B3, B4, B5, B6 and most of B2 are done; B1 is the outstanding
code item, then B7 (owner) gates B8.

**Adding a palette** — four places, all required, and three of the four
fail silently if missed: the token block in `src/app/globals.css`; the
`@custom-variant dark` list at the top of that file (**dark palettes
only** — omit it and every `dark:` utility no-ops on that theme); the
labeled entry in `src/lib/themes.ts` (its `bg`/`dot` swatch hexes are
duplicated from the token block on purpose — the switcher paints them
pre-hydration); and the `themes` array in `src/components/providers.tsx`,
which currently *derives* from the catalog so step three covers it.
Then `node scripts/check-contrast.mjs` must exit 0.

---

## Part A — Equilibrium → GRØNN subbrand alignment

Keep Equilibrium's identity (R3F core, GSAP pinned storytelling, four
dark-leaning themes); align everything else. Ship as ~3 PRs:
(A1+A2) → (A3) → (A4+A5+A6+A7).

- **A1 Semantic token alias layer (S, first — zero visual risk)**: in
  equilibrium's `globals.css`, add gronn's six semantic vars (background/
  surface/foreground/muted/line/accent) inside each `html[data-theme]` block,
  mapped onto existing named tokens (night: background→abyss, surface→ink,
  foreground→cream, muted→mist, accent→ember). No renames; new code uses
  semantic names, legacy names deprecate by attrition. Add `src/lib/motion.ts`
  exporting `EASE_REVEAL [0.16,1,0.3,1]`, `EASE_CURTAIN [0.76,0,0.24,1]` +
  GSAP equivalents.
- **A2 Tri-font system (M)**: add Montserrat (body) + real Geist Mono via
  `next/font` in equilibrium's `layout.tsx`; remove the `.font-mono`→Syne
  remap (globals.css:146–149); Syne stays display. Lowercase moves from
  `body` to a display-heading utility (decision 1 default). Visual QA on dense
  routes (archive, patterns, calendar), both languages.
- **A3 Ember discipline sweep (L, loudest brand fix)**: decorative ember →
  leaf/moss (structure) or pollen (warmth); interactive ember stays (hover,
  arrows, active markers, cursor). Hotspots: `ProblemSection.tsx:80,108`,
  `PillarSection.tsx:56,89-90`, `PixelStairs.tsx`. Per-section with visual QA,
  not blind find-replace. Add a "when ember is allowed" note to TECH-STACK.md
  in both repos.
- **A4 Port gronn primitives (M)**: `section-label.tsx` replaces `.kicker`;
  gronn's two-part ember speaking cursor replaces `CometCursor.tsx` (with
  `data-cursor` labels `{ en, nl }`); `letter-flip` nav hover into
  `Header.tsx`/`BottomNav.tsx`; `.underline-draw` for links. Keep
  `MagneticButton`, align its easing.
- **A5 Controls + easing (M)**: ThemeToggle dropdown → labeled cycle button;
  LanguageSwitch popover → EN|NL segmented pill (both per owner rule 1, names
  `{ en, nl }`). Replace `[0.22,1,0.36,1]` with `EASE_REVEAL` everywhere incl.
  GSAP tweens. Keep Lenis 1.35 but tune feel to match gronn side-by-side.
- **A6 Pixel motif replacement (L, decision 2 default = replace)**:
  ScatterText → reveal-text line-mask; PixelReveal → reveal-image green-wash
  wipe; PixelStairs → contour-line/stamp motif; `steps(2)` → smooth ease
  (grain keeps steps — texture, not motif).
- **A7 Glass softening (S/M, decision 3 default = soften)**: `.glass-panel` →
  flat `bg-surface` + `border-line/15`; keep blur only under the fixed header.

---

## Owner-decision checkpoints (defaults applied unless overridden)

1. EQ lowercase → **keep for display headings only, natural-case body**
2. Pixel motifs → **replace with field-survey line-work**
3. Glass panels → **soften to flat hairlines**
4. EQ cursor → **swap to gronn's ember speaking cursor**
5. Real photography for gronn — **required before Awwwards submission** (owner)
6. Ambient sound toggle — build or skip (default: skip until asked)
7. Awwwards paid submission budget/timing (after photography)
8. **The Hours palettes — visual sign-off pending.** All ten themes pass
   the contrast audit, but **none has been looked at**. Marl and Peat
   passed the identical audit and were rejected on sight (a mid-value
   tinted light ground reads muddy; a brown-black dark ground reads
   sepia), so measurement is not sufficient evidence here. Owner review
   on the preview URL, ideally on a phone.

## Verification

- Per PR: `npm run build`; visual pass on Vercel preview URL across all
  themes × EN/NL × reduced-motion on/off; keyboard-only walk.
- Part B: Lighthouse mobile runs against preview (targets ≥95 / LCP <2.0s /
  CLS <0.05); test on a real phone via preview link.
- Part A: side-by-side compare gronn.studio vs equilibrium preview for family
  resemblance (cursor, labels, hovers, easing feel); run equilibrium's
  `npm run test:e2e` to catch regressions in app flows.
