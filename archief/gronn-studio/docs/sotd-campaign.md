# GRØNN — the SOTD campaign

The plan for getting gronn.studio to Site of the Day. Companion to
[`sotd-strategy.md`](sotd-strategy.md), which establishes *how the award is
decided* and audits where we stand; this document is the sequenced campaign
that follows from it, plus a decision on what technology is worth adding.

Written 2026-08-01. Kept current — update the status marks in the same PR
that does the work, same convention as `ROADMAP.md`.

**Status:** ✅ done · 🔨 in progress · ⬜ not started · 🔒 blocked on owner

---

## The one thing that decides this

From the strategy doc, and it governs every choice below: **at least 18
jurors score each site and the three scores furthest from the average are
discarded.** Outlier love is thrown away; so is outlier hatred. You do not
win by making three jurors fall in love — you win by leaving fifteen jurors
nothing to mark down.

Our ceiling is therefore set by our *worst* detail, not our best moment.
That single fact is why this campaign spends its first phase on
verification and subtraction rather than on new effects.

---

## Phase 0 — Protect what we have already earned (no owner input needed)

Usability is 30% and is the one criterion where we are already competitive.
It is also the criterion most easily lost by accident. In this session
alone three real regressions shipped or nearly shipped — a hover state that
froze the diagram on touch, a `::after` collision that would have inflated a
1px underline into a 44px block, and a CTA hover at 2.99:1 that Lighthouse
scored 100 on. Every one was caught by hand. That is not a process that
holds.

- ✅ **CI gate** (PR #55). Was: no CI and no test of any kind.
  Add a workflow running, on every PR: `npm run build`, `tsc --noEmit`,
  `eslint`, `node scripts/check-contrast.mjs`, plus Playwright driving the
  real pages with `axe-core` for accessibility and a small set of
  behavioural checks (theme boot, diagram rotation, tap targets). The
  browser is already available in this environment and the harness pattern
  exists in `docs/log/`.
- ✅ **Field performance, not lab performance.** Add `@vercel/speed-insights`.
  `docs/perf/README.md` already warns that our lab numbers mislead — a
  stale `next start` flatters, a hidden tab never fires
  `IntersectionObserver`. Real-user Core Web Vitals is the only honest
  answer to "is mobile actually fast", and mobile speed is a Usability
  deduction applied by all eighteen jurors.
- ✅ **Remove Sanity.** `sanity`, `next-sanity` and `@sanity/image-url` are
  ~36 MB of dependencies serving a `/admin` Studio that duplicates the
  GRØNN Editor we actually use — `src/editor/` and `src/app/api/editor/`
  import none of it. Deleting the route, the schemas and the three packages
  removes install weight, build time and an unmaintained second content
  path. Value by subtraction, which is the whole thesis of the strategy doc.
- ✅ **Blur placeholders** (PR #54). Generate `blurDataURL` at build time with
  `sharp` (already a transitive dependency). Wire it now so the treatment
  is in place *before* real photography lands, not after.

---

## Phase 1 — The hard gate 🔒

- 🔒 **Real photography.** Unchanged since 19 July and still the only thing
  that cannot be solved from the repository. Every photograph is a
  placeholder; a jury reads that instantly and it caps Design, which is 40%
  of the score. The `photo-glass` treatment is drop-in, so the score moves
  the moment files exist.
  **Deliverable to ask for:** a shot list per section and per project —
  hero, one wide establishing shot per project, two details, one portrait
  of Nick on site, one process/hands shot.
- 🔒 **`public/intro-bg.jpg`.** The opening veil's darkening is baked into
  the JPEG, and the white lockup sits on it with no scrim. It is the first
  photograph anyone sees and the last green surface on the site. Replace
  the asset *and* add a CSS scrim, so legibility stops depending on how a
  file was exported.

---

## Phase 2 — Turn banked work into score

- ⬜ **Promote the ecosystem-disturbance simulation from `/lab` to the
  homepage.** It is the strongest "only here" moment we own and no juror
  will ever visit `/lab`. Needs a mobile tier and a reduced-motion still.
  This is the single highest-value Creativity move available, and the work
  already exists.
- ✅ **One case study with outcome data** (built 2 Aug with placeholder
  figures — owner call: "use placeholder data"). Patagonia's move: species
  count before and after, litres retained, materials reused, three seasons
  of soil recovery. Numbers become the layout on the flagship pond project
  (`Outcomes` component, typed `outcomes` data, EN/NL, CountUp, reduced
  motion safe). The figures are placeholder fiction in the site's existing
  register — they swap in place the moment the owner's real project data
  lands, which remains the honest gate for submission.

---

## Phase 3 — One narrative upgrade, not a pile of effects

- ✅ **View Transitions for card → hero continuation** (PR #57 — which also found and fixed the route curtain silently dead since Next 16). The roadmap already
  wants this (B2). The browser API is native, degrades to today's curtain
  where unsupported, and costs no library. It is the one place where motion
  would carry *narrative* — the project you clicked becomes the page you
  land on — which is precisely what the 2026 gallery reading rewards.
- ❌ **B1 terrain choreography** — built, previewed, ARCHIVED unmerged by owner decision 1 Aug (branch `feat/terrain-choreography`); do not re-propose. Was: only with the owner watching a preview as
  it is built. High cost, and it touches the deferred-3D loading that took
  mobile LCP from ~4.6 s to ~1.1 s. That number is worth more to the score
  than the animation is.

---

## Phase 4 — Submission craft

- ⬜ Pre-submit pass on real devices, including iOS Safari.
- ⬜ Screenshots at 1440 / 1280 / 390.
- ⬜ Written description and credits; self-score against the four criteria.
- ⬜ Submit midweek. Budget ~€65–75. An approved site has 3 months to win;
  voting runs 5 days.

---

## The technology question, answered honestly

**The site does not need new capability.** It needs its content, and it
needs verification that the quality already built stays built. Reaching for
a new framework or renderer here would be answering a content problem with
a technology purchase — exactly the failure mode the strategy doc warns
about, and every one of the four reference brands (Apple, Aesop, Patagonia,
Nike) wins by subtraction rather than addition.

With that said, four additions do earn their place, and one removal does:

| Change | Why it genuinely pays |
|---|---|
| **CI + Playwright + axe** | Protects the 30% we are already strong at. Three real regressions this session were caught only by hand. |
| **`@vercel/speed-insights`** | Field Core Web Vitals. Our own perf doc says the lab numbers mislead; without real-user data we do not actually know if mobile is fast. |
| **Build-time blur placeholders** (`sharp`) | Perceived load and no pop-in, on a site about to become photography-led. |
| **View Transitions API** | Native, no library, degrades gracefully; the only addition that buys *narrative* rather than decoration. |
| **Remove Sanity (−36 MB)** | Dead second content path. Less to build, less to break, less to explain. |

Short looping video of real gardens — water moving, grasses in wind — would
also be genuinely valuable, but that is **footage, not technology**: plain
`<video>` with a poster and a reduced-motion still needs nothing new in the
stack.

**Explicitly rejected**, with reasons:

- **GSAP** — a second animation library alongside framer-motion. Equilibrium
  uses it; that is not a reason for gronn to carry both.
- **Postprocessing / shader spectacle on the terrain** — more WebGL is the
  most common way to lose Usability points while gaining nothing on Design.
  The 2026 reading is explicit that WebGL is now rewarded "for atmosphere
  instead of spectacle."
- **A headless CMS** — we built the GRØNN Editor and it won. Adding one back
  would be reversing a decision that was already made correctly.
- **A different framework (Vue / Nuxt, or any other)** — evaluated and
  declined; see [`framework-evaluation.md`](framework-evaluation.md). None of
  the four judging criteria can detect a framework, so a migration buys zero
  score while risking the accessibility floor and the LCP work.
- **Anything that hides content on mobile to protect a desktop effect** —
  violates design rule 5, and mobile is where the jury will look first.

---

## Honest odds

The chassis is close to award grade — accessibility 100, a coherent ten-palette
token system, real brand assets, EN/NL on indexable routes. Two things stand
between it and a credible submission, and **both are content wearing design
clothing**: there is no real photography and no real project data.

Phase 0 is worth doing now because it is cheap and protects what exists.
Phases 2–4 are worth doing after Phase 1, not before. Submitting before the
photography exists would spend the fee to be told what we already know.
