# GRØNN Studio — Phase 0 Read-Only Audit

Repo: `gronnstudio/gronn-studio` (private) · Prod: https://gronn.studio
Audited @ `main` (`9b3e6f0`), 2026-07-19. Read-only; no code changed during the audit.

## 1. Architecture overview
Next.js 16 App Router marketing site. Each route is a **server `page.tsx` (metadata) +
client `*-content.tsx`**. Root layout mounts global client islands (SmoothScroll/Lenis,
Cursor, Preloader, Providers, mobile dock). Content is **typed data, no CMS**
(`src/lib/data/{projects,journal,services}.ts`). Theming via next-themes (4 palettes)
through semantic CSS tokens in `globals.css`. i18n is **client-side EN/NL**.

## 2. Current stack
next 16.2.10, react 19.2.4, tailwind 4, TypeScript 5, framer-motion 12, lenis 1.3,
three 0.185 + @react-three/fiber 9, next-themes, lucide-react, clsx/tailwind-merge.
No GSAP, no Locomotive, no second WebGL framework — stack is lean and matches the
"don't add libraries" rule. Nothing needs removing on duplication grounds.

## 3. Server/client distribution
**51 files carry `"use client"`.** Every homepage section and every route `*-content`
is a client component. The client boundary is very wide: most of the visible page
hydrates. Root cause of the TBT problem.

## 4. Performance risks (with evidence)
- **WebGL never pauses.** `terrain-scene.tsx` runs an unconditional `useFrame` loop;
  no `frameloop` control, no IntersectionObserver. Two `TerrainScene` instances
  (sparse hero + mature CTA) animate continuously even when offscreen.
- **Wide hydration.** 51 client files; whole homepage is interactive islands.
- **No `next/image` on main.** `grep next/image` → 0; 8 raw `<img>`. No responsive
  `sizes`, lazy-loading, blur, or format negotiation. (Being addressed — see
  branch `perf/next-image-adoption`.)
- **Lenis RAF** runs continuously (standard; acceptable). `Drift` uses per-item
  `useScroll` — many independent scroll observers if used across a grid.
- **No fresh baseline exists.** The old "~49 desktop" figure is a lead only.

## 5. PR #1 and PR #2 analysis
Both draft, both `CONFLICTING` with main, overlapping on 5 files: `hero.tsx`,
`header.tsx`, `featured-project.tsx`, `services-overview.tsx`, `case-study.tsx`.
- **PR #1** `claude/go-73y2pi` (+655/−74): awwwards-plan build (pinned garden,
  survey frame, mist veil, display word, availability badge, letter-hover, icon-swap).
- **PR #2** `claude/session-5zsiwg` (+324/−68): "award-level polish" (contour shader
  terrain, next/image via `lib/image.ts`, hero survey mark, form success, logo).

They are competing, not complementary. **Recommendation: close-and-cherry-pick.**
Keep branches for reference; do not merge either wholesale. Extract the valuable
slices as small PRs. **Approved 2026-07-19.** First slice extracted:
`perf/next-image-adoption` (PR #2's `lib/image.ts` + the two project image surfaces).

## 6. Documentation drift
- `next.config.ts` still allows `picsum.photos`; picsum still referenced in
  `project-card.tsx`, `data/projects.ts`, `placeholder.ts`, `privacy-content.tsx` —
  yet `public/ph/*.jpg` self-hosted images exist. Mixed / half-migrated state.
- `<html lang="en">` hardcoded (`layout.tsx:90`) while the site serves EN and NL.
- OPERATIONS.md §9 lists unverified findings (no rate limit, no security headers,
  no Escape-to-close, hero "Utrecht" vs registered Stein address) — several still
  appear unresolved in current code.

## 7. Missing CI and tests
- No `.github/workflows`. No typecheck/lint/build gate.
- No tests — no Playwright, no axe, no Lighthouse CI.
- `package.json` scripts are bare; no `typecheck`, `test:e2e`, `test:a11y`, `lighthouse`.
- Pre-existing lint failures on `main`: 7 errors, 2 warnings (e.g. `terrain.tsx`
  set-state-in-effect) — unrelated to the image slice, worth a dedicated cleanup PR.

## 8. Security and operational risks
- No security headers (no CSP, Referrer-Policy, Permissions-Policy,
  X-Content-Type-Options, frame-ancestors, HSTS).
- No rate limiting on `/api/contact` — honeypot + field clipping only.
- FormSubmit activation unconfirmed (OPERATIONS §1); form falls back to mailto.
- Open ops items: DMARC not added, sitemap not submitted, `/voorwaarden` unvetted,
  Vercel plan possibly Hobby (non-commercial).
- Contact route does not log content (good).

## 9. Governance blocker (needs owner decision)
The brief's Phase 1/2 governance plan assumes GitHub rulesets/branch protection.
These are **unavailable on this plan** — `GET /rulesets` returns 403:
"Upgrade to GitHub Pro or make this repository public." On a free private repo you
cannot enforce required checks, linear history, PR-required, or force-push blocks.
Options: (a) GitHub Pro (~$4/mo) — keep private + get protection; (b) convention-only
discipline (no enforcement); (c) go public (brief forbids). **Gates Phases 1–2.**

## 10. Proposed milestones
0 Governance decision → 1 CI quality gate → 2 Performance stabilization (WebGL pause +
hydration + next/image) → 3 i18n `lang`/SEO → 4 Media pipeline → 5 Accessibility &
testing → 6 Content/flagship case → 7 Contact & security hardening → 8 Awwwards readiness.

## 11. Recommended small-PR sequence
1. `chore/ci-quality-gate` — scripts + one `quality` GH Action (checkout, `npm ci`,
   typecheck, lint, build). No ruleset change yet.
2. `perf/webgl-pause` — `frameloop="demand"` / IntersectionObserver to stop terrain
   rendering offscreen. Before/after TBT.
3. `perf/next-image-adoption` — **DONE / in review**: extract PR #2's `lib/image.ts`;
   migrate the project `<img>` surfaces + blur placeholder.
4. `fix/html-lang` — drive `<html lang>` from the active locale.
5. `chore/security-headers` — headers block in `next.config.ts` + CSP audit.
6. `feat/contact-rate-limit` — server-side rate limit + confirm FormSubmit activation.
7. Then awwwards micro-interactions, one PR each, on stabilized main.

## 12. Decisions needed from owner before Phase 1
1. Governance: GitHub Pro, convention-only, or other? (blocks Phases 1–2)
2. PRs #1/#2: close-and-cherry-pick — **APPROVED 2026-07-19**.
3. Paid services: OK to evaluate Pro plans (GitHub / Vercel)? (brief stop-condition)
4. Proceed into full Phase 1 (CI gate), and as GitHub issues/milestones or just
   branches+PRs?
