# GRØNN Studio — Agent Handoff Manifest

This file is the operating manual for AI agents (Codex, Claude, or others)
working on this repository. It was written 19 Jul 2026 at handoff from a
Claude Code session that built and deployed the site. Read `CLAUDE.md`
(conventions + gotchas) and `OPERATIONS.md` (infrastructure + runbooks)
alongside this file. `docs/phase-0-audit.md` holds the full repo audit.

**Live:** https://gronn.studio · **Repo:** github.com/gronnstudio/gronn-studio (private)
**Owner:** Nick — hello@gronn.studio · GitHub `gronnstudio`

---

## 1. Non-negotiable governance rules (owner's Master Brief)

- **Never commit or push directly to `main`.** Every change: branch →
  draft PR → checks + Vercel preview → verify on the preview → mark ready
  → **squash-merge only** → branch auto-deletes.
- Never: force-push `main`, delete `main`, bypass repository rules,
  combine unrelated refactors in one PR, commit credentials or secrets.
- **Never modify DNS, SSL, Cloudflare, mail, or domain settings without
  explicit owner approval.** (Exact records: OPERATIONS.md §4.)
- **The repository must remain private.** Do not make it public — not
  even to regain free branch protection.
- **No placeholder test scripts that fake success.** Only real scripts
  (`tsc --noEmit`, eslint, `next build`, real Playwright specs). A script
  that echoes "passed" is worse than no script.
- **No new creative/animation libraries.** framer-motion is the animation
  layer; do not add GSAP/anime.js/etc. alongside it. No new shaders until
  performance is stabilized.
- Stop and ask the owner before: paid services, privacy-policy-relevant
  changes, deleting content, anything irreversible.
- GitHub Free limitation (verbatim owner wording): *"GitHub Free does not
  enforce rulesets/required checks for this private repository. The
  desired main protections are documented but currently procedural rather
  than technically enforced."* Treat a failed or missing `quality` check
  as a manual merge prohibition. Intended ruleset: OPERATIONS.md §10.

## 2. Verified current state (as of merge of PR #5, 19 Jul 2026)

- `main` = PR #5 (`feba1ef`, lint compliance) on #4 (browser-direct form
  transport) on #3 (diagnostics). PRs #1/#2 closed with salvage notes.
- `npm run build` 26/26 routes, lint 0, typecheck 0 (script not yet in
  package.json — add in governance PR).
- Production behavioral checks passed post-#5: language persists across
  refresh (`gronn-locale` → `<html lang>` follows), meadow default theme,
  no hydration warnings in console on hard refresh.
- **Contact form verified end-to-end** — inbox delivery confirmed by
  owner. Full evidence record: OPERATIONS.md §9. Two proof items still
  open: one submission through the visible production UI, and a
  rejected-fetch fallback test (stub `fetch` to reject; confirm mailto
  draft + fallback copy; must not send a real email).
- Form transport is **interim** (browser-direct FormSubmit). Target:
  Resend + server-side validation + rate limiting + Turnstile — owner
  approval required (paid + privacy). Do NOT move the current transport
  server-side: FormSubmit 403-blocks datacenter IPs (proven).

## 3. Work queue (owner-approved order)

1. **PR: `chore/repository-governance-ci`** — ONLY:
   `"typecheck": "tsc --noEmit"` script; `.github/workflows/quality.yml`
   (single job `quality`: checkout, setup-node with npm cache, `npm ci`,
   typecheck, lint, build); `.github/pull_request_template.md`;
   CLAUDE.md updates (governance summary + fix stale line claiming
   imagery "is picsum under a green wash" — images are self-hosted in
   `public/ph` via `src/lib/placeholder.ts`); doc reconciliation
   (OPERATIONS §11 statuses, `docs/awwwards-plan.md` status marks).
   No e2e/a11y/lighthouse placeholders. Document that `quality` is
   advisory on the Free plan.
2. **PR: Playwright critical flows** — menu open/close + close-on-nav,
   theme cycle + persistence, language switch + persistence, mobile dock,
   contact form (mock network — never hit FormSubmit in CI), 404,
   reduced-motion, no horizontal overflow.
3. **PR: Axe accessibility scans** wired into `quality`.
4. **PR: Lighthouse CI + budgets**, fresh committed baseline in
   `docs/perf/` (5 pages × 3 runs) BEFORE optimizing.
5. **Performance stabilization** — pause off-screen R3F canvas
   (`frameloop` + viewport observer), Lenis rAF idle, `next/image`
   adoption (a viable `perf/next-image-adoption` branch exists — rebase
   or recreate; also remove stale picsum `remotePatterns` from
   `next.config.ts`), image `sizes`/responsive variants.
6. **Only after perf gates are green:** salvaged creative work —
   survey-frame, mist-veil, pinned garden-through-time, form success
   moment (details in closed PRs #1/#2 and `docs/awwwards-plan.md`).
7. **Owner-gated:** Resend transport swap, Speed Insights, security
   headers (stage CSP report-only first — WebGL/fonts/inline JSON-LD),
   i18n server-rendering ADR (`/nl` routes via next-intl — the fix for
   full-tree hydration).

## 4. Architecture in 60 seconds

Next.js 16.2.10 App Router (⚠ read `node_modules/next/dist/docs/` —
newer than training data), React 19, Tailwind 4, framer-motion 12,
Lenis, three/R3F. Server `page.tsx` shells own metadata; client
`*-content.tsx` own all copy (client i18n via `useT()` + `{en, nl}`
literals in `src/lib/i18n.ts`). 4 themes via next-themes class strategy;
all colors through semantic tokens in `src/app/globals.css`; meadow is
default. Ember `#f95a08` = interactive accent only ("green carries
structure; ember answers the hand"). Business identity single-sourced in
`src/lib/business.ts`. Content = typed TS in `src/lib/data/` (all
projects/journal/photography are PLACEHOLDER fiction; see OPERATIONS §7).
`useHydrated()` (`src/lib/use-hydrated.ts`) is the canonical mounted
flag — never setState-in-effect for mount detection.

## 5. Hard-won gotchas (do not relearn these)

- framer-motion `whileInView` never fires on elements starting fully
  clipped inside `overflow-hidden` masks — observe the unclipped parent,
  drive children via variants.
- Never combine CSS `scroll-behavior: smooth` with Lenis.
- motion `style` prop caches SVG fills — put colors in CSS classes.
- PowerShell: never bulk-rewrite files via Get-Content/regex (corrupts
  UTF-8, e.g. Ø); no embedded double quotes in `git commit -m`.
- FormSubmit requires browser Origin/Referer/UA and 403s datacenter IPs.
- Design rules: visible labels, no insider iconography; small/precise
  over big/decorative; reduced-motion fallback for every animation;
  mobile is first-class (lite tiers, never hidden features).
- **NEVER use neon accents.** Owner veto (20 Jul 2026) against the
  Nocturne theme's neon mint #8de8c0 ("the neon bleuish green needs to
  go"). Accents come from the brand family only: gronn-green #197b4f,
  soft light green #d0ede0 / #bfe3d0, and ember #f95a08 for
  interaction. The Nocturne blue-charcoal *ground* (#0a1624) is
  approved — the rule is about neon/fluorescent tints, not the dark
  base.
- Owner reads code on a phone via GitHub — keep docs current.

## 6. Content architecture — the GRØNN Editor (20 Jul 2026)

Editorial content does NOT live in code anymore. One JSON document
(`content/site-content.json` shape) is served from the private Vercel
Blob store `gronn-content`; `src/lib/content.ts` is the only read path
(cache tag `content`); the committed JSON is the fallback. The owner
edits on the live site via `/editor` (Google sign-in, one-email
allowlist — `src/lib/auth.ts`) using `src/editor/` (EditableText/
EditableImage/toolbar; publish = Blob put + snapshot + revalidateTag).
Rules: `src/editor/` stays self-contained (planned extraction for
Equilibrium); content edits intentionally bypass git (code never does);
NEVER print or commit the values in `.env.local`. **Sanity was removed
from the codebase on 1 Aug 2026** (owner decision, `docs/sotd-campaign.md`
Phase 0; git history preserves the integration). The Sanity
account/project `j10z1n29` was left untouched — the owner may still
revoke it.

## 7. Session log convention

`docs/log/` holds one short dated entry per working session:
`YYYY-MM-DD-topic.md`. Record what shipped, what was **tried and
rejected (with the owner's reason)**, and incidents. The rejections are
the point — they stop future agents from re-proposing vetoed ideas.
Read the existing entries before suggesting creative changes; write
your entry before ending a session. Keep entries under a page; this is
distilled memory, not a transcript.

## 8. Work log (bookkeeping aid)

After every meaningful session, also append an entry to
`docs/worklog.md` following the rules in `HOURS_MANIFEST.md` (date,
phase, summary, activities, business categories, files, commits,
deployment, and a plain-Dutch **DigiBoox Summary** for the owner's
bookkeeping). Never state or estimate hours — completed work only.
This is separate from `docs/log/` (decisions and rejections); the
worklog records deliverables.

## 9. Definition of done for any PR

Typecheck + lint + build green; verified on the Vercel preview URL
(desktop + mobile widths); reduced-motion checked if motion touched;
both locales checked if copy touched; all four themes checked if color
touched; PR contains only its stated scope; honest report — if something
is unverified, say so rather than claiming success.
