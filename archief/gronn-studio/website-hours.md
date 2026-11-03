# GRØNN Studio — Website Project-Hours Register

**Project:** gronn.studio — marketing website for GRØNN Studio (ecological
garden & landscape design, Stein NL)
**Register period:** 10 July 2026 – 8 August 2026 (first repository work
through latest session)
**Status:** Live in production (Vercel, continuous deployment from `main`)
**Companion documents:** [`docs/worklog.md`](docs/worklog.md) (the full
chronological project diary, with a Dutch DigiBoox summary per session)
and [`HOURS_MANIFEST.md`](HOURS_MANIFEST.md) (the register rules).

> ## How to use this register
>
> Per `HOURS_MANIFEST.md`, this repository documents **completed work
> only and never estimates, invents or states hours** — the owner alone
> decides actual hours. Every **Hours** field below is therefore
> intentionally blank (`＿＿＿`), to be filled in by the owner from their
> own time records before this document enters the bookkeeping.
>
> What *is* factual in this register: the activities, their dates, what
> they changed, what they produced, and the git commit evidence in
> Appendix A. An accountant can verify every row against the repository
> history and `docs/worklog.md`.
>
> **Fill in:** every `＿＿＿ h` field, the phase subtotals, the grand
> total, and (optionally) the per-discipline hour split in §8.
> *Example of the expected format: `2,5 h`.*

---

## 1. Project overview

GRØNN Studio's website was designed and built as a bespoke product — no
template, no CMS purchase — over a compressed four-week cycle:

- **Concept & foundation** — brand-led design language ("fine line-work,
  mono-font field annotations, survey marks, restrained motion"), full
  bilingual (EN/NL) content model, seven-page architecture.
- **Custom platform work** — an in-house visual content editor (built
  after evaluating and then removing a headless CMS), a ten-palette
  time-of-day theming system, a WCAG contrast auditor wired into CI.
- **Mobile-first product feel** — a floating navigation dock that went
  through seven review-driven iterations, an installable app mode with
  offline support, native view transitions.
- **Verification culture** — an automated quality gate (build, types,
  lint, contrast audit, browser tests with accessibility checks) that
  every change must pass before deploy.

Work was performed in agent-assisted development sessions directed and
reviewed by the owner; the register below documents the work itself.
Where work was **explored and deliberately rejected** (a recognised part
of the design process) it is marked *[archived]* — it was performed, but
did not ship.

Current placeholder status (relevant for "completed vs. planned"):
project case studies, photography, outcome figures and client quotes are
**placeholder content by explicit owner decision**, awaiting real project
data; the layouts that will carry the real content are complete.

---

## 2. Phase-by-phase hours breakdown

| # | Phase | Period | Hours |
|---|-------|--------|-------|
| 1 | Concept, foundation & information architecture | 10–14 Jul | ＿＿＿ h |
| 2 | Production launch & infrastructure | 15–16 Jul | ＿＿＿ h |
| 3 | Brand, navigation & mobile experience | 17–21 Jul | ＿＿＿ h |
| 4 | Content platform & visual editor | 20 Jul – 1 Aug | ＿＿＿ h |
| 5 | Performance, SEO & accessibility | 26–31 Jul | ＿＿＿ h |
| 6 | Theming & visual system | 30–31 Jul | ＿＿＿ h |
| 7 | Quality gate, app mode & interactions | 1–3 Aug | ＿＿＿ h |
| 8 | Case-study features, marketing assets & experiments | 2–8 Aug | ＿＿＿ h |
| | **Total** | | **＿＿＿ h** |

---

## 3. Detailed activity register

### Phase 1 — Concept, foundation & information architecture (10–14 Jul)

| Date | Activity — what was done → what changed → deliverable | Hours |
|------|-------------------------------------------------------|-------|
| 10 Jul | Project foundation: Next.js 16 architecture set up; all seven page routes and twelve homepage sections built; bilingual EN/NL content model established with six projects, six journal articles, six services → complete working site skeleton with typed content | ＿＿＿ h |
| 11 Jul | Theming, language switch and typography: theme and locale infrastructure, brand type scale → consistent visual base across all pages | ＿＿＿ h |
| 12 Jul | Motion layer and first four themes: site-wide animation vocabulary (framer-motion), reduced-motion fallbacks → the site's characteristic restrained motion | ＿＿＿ h |
| 13 Jul | Brand identity, menu and Dutch compliance: full-screen menu, legal pages (privacy, voorwaarden), KVK/BTW business data centralised → legally compliant Dutch business site | ＿＿＿ h |
| 14 Jul | Accent colour system, full mobile experience, load screen: Signal Ember interaction colour, mobile layouts for every section, preloader veil → mobile as first-class experience | ＿＿＿ h |

**Phase 1 subtotal: ＿＿＿ h**

### Phase 2 — Production launch & infrastructure (15–16 Jul)

| Date | Activity | Hours |
|------|----------|-------|
| 15 Jul | Production launch via Vercel: domain, deployment pipeline (push-to-main = deploy), documentation → gronn.studio live | ＿＿＿ h |
| 16 Jul | Contact, SEO and collaboration basis: contact form with direct-to-FormSubmit transport (datacenter-relay attempted and removed after 403 blocking — decision recorded), sitemap/robots/JSON-LD, repository governance (AGENTS.md) → working enquiry channel and indexable site | ＿＿＿ h |

**Phase 2 subtotal: ＿＿＿ h**

### Phase 3 — Brand, navigation & mobile experience (17–21 Jul)

| Date | Activity | Hours |
|------|----------|-------|
| 17 Jul | Award-polish exploration: research pass over award-site criteria; polish backlog defined → prioritised roadmap | ＿＿＿ h |
| 18 Jul | Mobile navigation dock v1: floating pill dock within thumb reach → signature mobile navigation | ＿＿＿ h |
| 19 Jul | Domain incident response, operations handbook, quality and governance: incident resolved, OPERATIONS.md written, accessibility and testing groundwork → operational resilience | ＿＿＿ h |
| 19 Jul | Brand coordination, contact rail, field-annotation language (parallel session): visual language consolidated across sections → coherent brand surface | ＿＿＿ h |
| 21 Jul | Liquid-glass dock, navigation and project carousel: glass material system, mobile project browsing → refined mobile experience | ＿＿＿ h |

**Phase 3 subtotal: ＿＿＿ h**

### Phase 4 — Content platform & visual editor (20 Jul – 1 Aug)

| Date | Activity | Hours |
|------|----------|-------|
| 20 Jul | CMS foundation (Sanity) and work administration: headless CMS evaluated and integrated; worklog regime established → content editing capability (later superseded) | ＿＿＿ h |
| 20 Jul | Own visual editor built and live: in-house click-to-edit editor (GRØNN Editor) with Google-gated access, publish-to-Blob pipeline → owner can edit every text on the site without code *(replaced the CMS direction the same day)* | ＿＿＿ h |
| 20 Jul | Whole website editable + editor as product: coverage extended site-wide; editor hardened → complete content independence | ＿＿＿ h |
| 1 Aug | Sanity CMS removed from the codebase (~36 MB of dependencies, dead second content path) → simpler, lighter, single content pipeline | ＿＿＿ h |
| 2 Aug | Content-pipeline hardening: published editor documents merged per-entry/key-level so newly shipped fields can never vanish after a Publish → future-proof content flow | ＿＿＿ h |

**Phase 4 subtotal: ＿＿＿ h**

### Phase 5 — Performance, SEO & accessibility (26–31 Jul)

| Date | Activity | Hours |
|------|----------|-------|
| 26–27 Jul | Performance measured and improved, Dutch site findable: lab measurement harness, indexability for `/nl` routes → measurable performance baseline | ＿＿＿ h |
| 27 Jul | Accessibility floor (roadmap B4): focus traps, ARIA, reduced-motion parity, skip links → accessibility 100 | ＿＿＿ h |
| 27 Jul | PageSpeed findings: contrast to 100; mobile load time attacked — root cause found in the route curtain covering first paint; hero entrances rebuilt CSS-first → throttled mobile LCP from ~4.6 s to ~1.1 s | ＿＿＿ h |
| 30 Jul | Tech Stack page: the build made explorable as content → transparency page | ＿＿＿ h |
| 30 Jul | Motion vocabulary, tap targets, 404, awards strategy: 24px WCAG tap-target floor, branded 404 → usability hardening | ＿＿＿ h |
| 31 Jul | Green photo film replaced by a glass screen: one shared `photo-glass` utility replacing six hand-copied drifting filters → consistent photography treatment | ＿＿＿ h |
| 1 Aug | Field performance measurement (Vercel Speed Insights): real-user Core Web Vitals → honest mobile speed data | ＿＿＿ h |
| 1 Aug | Photos fade in softly (build-time blur placeholders via sharp) → no image pop-in | ＿＿＿ h |

**Phase 5 subtotal: ＿＿＿ h**

### Phase 6 — Theming & visual system (30–31 Jul)

| Date | Activity | Hours |
|------|----------|-------|
| 30 Jul | Contrast audit and ember correction: automated WCAG auditor built (`scripts/check-contrast.mjs`, 122 colour pairs); two draft themes **rejected** on evidence; ember-on-light corrected → provable colour system | ＿＿＿ h |
| 30 Jul | "The Hours": five new colour themes and a second theme switcher: concept palette set researched against dark/light-mode literature → ten-palette catalogue in two labelled sets | ＿＿＿ h |
| 30 Jul | Theme follows the time of day: Golden Hour/Blue Hour auto-selection from the visitor's clock with permanent manual override; pre-paint boot script against flash-of-wrong-theme → signature theming behaviour | ＿＿＿ h |

**Phase 6 subtotal: ＿＿＿ h**

### Phase 7 — Quality gate, app mode & interactions (1–3 Aug)

| Date | Activity | Hours |
|------|----------|-------|
| 1 Aug | System diagram self-rotates; interaction a11y fixes → livelier homepage diagram | ＿＿＿ h |
| 1 Aug | Terrain choreography explored and **[archived]**: scroll-driven 3D hero built to preview quality, owner-reviewed, deliberately not shipped → decision record; production LCP protected | ＿＿＿ h |
| 1 Aug | Quality gate: CI with real browser tests — build, types, lint, contrast audit, Playwright + axe accessibility on desktop and mobile profiles; three real violations found and fixed on introduction → every future change automatically verified | ＿＿＿ h |
| 1 Aug | Native view transitions: project card morphs into the project page; route-curtain regression (silently dead since Next 16) found and fixed → narrative navigation | ＿＿＿ h |
| 2 Aug | App mode Tier 1: installed (home-screen) experience becomes a real app — standalone detection, crossfade navigation, conservative service worker with offline page, reworked install announcement; browser site byte-for-byte unchanged → installable GRØNN app | ＿＿＿ h |
| 2 Aug | Dock refinement series (owner-review driven, five iterations): uniform stadium slots → back-to-top swaps in place with the menu button → text labels removed → wings fold away while reading and return on an upward flick → even glass ring around the collapsed start button; plus active page marked on fresh load, logo drift, ember orbit ring on the pill | ＿＿＿ h |
| 3 Aug | Dock icons enlarged (22→26 px) after phone review → final dock | ＿＿＿ h |

**Phase 7 subtotal: ＿＿＿ h**

### Phase 8 — Case-study features, marketing assets & experiments (2–8 Aug)

| Date | Activity | Hours |
|------|----------|-------|
| 2 Aug | Measured-outcomes case-study chapter (placeholder figures by owner decision): typed outcome data, numbers-as-layout design with count-up reveal → award-grade case-study format awaiting real data | ＿＿＿ h |
| 2 Aug | Before/after comparison slider + client-voices section (feature audit of a commercial widget library, two gaps rebuilt natively, zero dependencies): draggable/keyboard-accessible transformation slider; rotating quotes with labelled controls → conversion-oriented appeal features | ＿＿＿ h |
| 2 Aug | Marketing video assets: scripted 9:16 Instagram reels of the site (34 s highlight cut; 1:12 full-site tour in Golden Hour and Blue Hour) → three ready-to-post MP4s | ＿＿＿ h |
| 8 Aug | Equilibrium interface port explored and **[archived]**: sister-brand hero interface ported 1:1 on a preview branch, owner-reviewed, rejected → decision record; production untouched | ＿＿＿ h |

**Phase 8 subtotal: ＿＿＿ h**

---

## 4. Major changes and iterations

Documented direction changes — real work performed that shaped the final
product (each is evidenced in `docs/worklog.md` and git history):

1. **CMS → own editor (20 Jul, 1 Aug).** Sanity integrated, then
   superseded the same day by the in-house GRØNN Editor; Sanity fully
   removed on 1 Aug (−36 MB dependencies).
2. **Photo treatment consolidation (31 Jul).** Six hand-copied green
   film variants replaced by one shared glass utility.
3. **Theme rejections on evidence (30 Jul).** Two draft palettes
   ("Marl" among them) rejected against contrast/readability research.
4. **LCP root-cause fix (27 Jul).** The route curtain was covering
   first paint; boot choreography rebuilt CSS-first — throttled mobile
   LCP ~4.6 s → ~1.1 s.
5. **Terrain choreography archived (1 Aug).** Built, previewed,
   rejected by owner — kept as an archive branch.
6. **Dock iteration series (2–3 Aug).** Seven owner-review rounds to
   the final dock.
7. **Equilibrium interface port archived (8 Aug).** Full hero interface
   port previewed and rejected — brand direction confirmed instead.

---

## 5. Technical development work (summary)

- Next.js 16 / React 19 / TypeScript / Tailwind 4 application,
  statically generated, bilingual routing (`/` EN, `/nl` NL) via
  middleware rewrites.
- In-house visual editor with Google-gated access and
  publish-to-Vercel-Blob content pipeline with per-entry merge.
- Ten-palette semantic-token theming with clock-driven default set and
  pre-paint boot script.
- Automated WCAG contrast auditor over the real token blocks (122
  pairs), wired into CI.
- Service worker (assets cache-first, pages network-only, offline
  fallback) and installable app mode.
- Procedural 3D terrain hero (R3F/three) with deferred loading.
- Native View Transitions for project-card → case-study navigation.

## 6. Testing, optimisation & deployment (summary)

- CI quality gate on every pull request: build, `tsc`, `eslint`,
  contrast audit, Playwright browser tests with axe accessibility
  checks on desktop and mobile profiles (17 tests at register close).
- Manual device review by the owner on iPhone throughout (screenshots
  drove the dock iteration series).
- Continuous deployment: branch → preview URL → review → squash-merge
  to `main` → production; instant rollback available.
- Real-user Core Web Vitals monitoring via Vercel Speed Insights.

---

## 7. Final hours summary

| Phase | Hours |
|-------|-------|
| 1 — Concept, foundation & information architecture | ＿＿＿ h |
| 2 — Production launch & infrastructure | ＿＿＿ h |
| 3 — Brand, navigation & mobile experience | ＿＿＿ h |
| 4 — Content platform & visual editor | ＿＿＿ h |
| 5 — Performance, SEO & accessibility | ＿＿＿ h |
| 6 — Theming & visual system | ＿＿＿ h |
| 7 — Quality gate, app mode & interactions | ＿＿＿ h |
| 8 — Case-study features, marketing assets & experiments | ＿＿＿ h |
| **Grand total** | **＿＿＿ h** |

## 8. Discipline breakdown

Factual distribution of the 41 logged work sessions across business
categories (a session usually spans several disciplines; percentages are
**share of logged activities, not hours** — fill the hours column from
your own records if the bookkeeping needs an hour split):

| Discipline | Share of logged activities | Hours |
|------------|---------------------------|-------|
| Website Development | 24% | ＿＿＿ h |
| UI / UX Design | 19% | ＿＿＿ h |
| Technical Architecture | 10% | ＿＿＿ h |
| Documentation | 10% | ＿＿＿ h |
| Testing | 6% | ＿＿＿ h |
| Accessibility | 6% | ＿＿＿ h |
| Content | 5% | ＿＿＿ h |
| Performance Optimisation | 4% | ＿＿＿ h |
| Infrastructure | 4% | ＿＿＿ h |
| Bug Fixing | 3% | ＿＿＿ h |
| SEO | 3% | ＿＿＿ h |
| Research | 3% | ＿＿＿ h |
| Planning | 3% | ＿＿＿ h |
| Deployment | 1% | ＿＿＿ h |
| Copywriting | 1% | ＿＿＿ h |

---

## Appendix A — Repository activity evidence

Commit activity per calendar day across all branches (timestamps are
repository facts; days may also contain un-committed work such as
research, review and the marketing video production on 2 Aug). Note:
history before 16 Jul was consolidated when the repository was
restructured; the diary in `docs/worklog.md` covers 10 Jul onward.

| Date | Commits | First | Last |
|------|---------|-------|------|
| 16 Jul | 3 | 09:38 | 13:47 |
| 18 Jul | 1 | 17:21 | 17:21 |
| 19 Jul | 20 | 10:41 | 23:19 |
| 20 Jul | 13 | 10:16 | 23:02 |
| 21 Jul | 15 | 10:06 | 20:59 |
| 26 Jul | 4 | 21:57 | 22:38 |
| 27 Jul | 5 | 21:51 | 23:36 |
| 30 Jul | 2 | 17:13 | 17:35 |
| 31 Jul | 1 | 21:55 | 21:55 |
| 1 Aug | 21 | 10:06 | 19:10 |
| 2 Aug | 11 | 08:39 | 20:03 |
| 3 Aug | 2 | 07:13 | 09:10 |
| 8 Aug | 2 | 19:19 | 21:20 |

Full per-commit timestamps: `git log --all --format="%ad %h %s" --date=iso`.
