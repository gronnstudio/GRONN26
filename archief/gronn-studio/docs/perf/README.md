# Performance — measured baseline and method

Numbers, not vibes. Everything here is reproducible:

```bash
bash scripts/lighthouse-run.sh baseline     # writes docs/perf/baseline/
```

**Method:** Lighthouse 12, performance category only, five pages × two
form factors × three runs, **against production** (`https://gronn.studio`)
so the numbers include the real CDN and prod bundles. Tables below show
the **median** of three runs. Raw JSON reports are gitignored — they are
tens of MB and regenerable; the summaries are committed.

Caveats worth knowing before trusting any comparison:
- Preview/deployment URLs cannot be used as a stable lab: Vercel
  deployment protection 302s them.
- Several Claude sessions ship to this repo concurrently, so production
  can change between runs. Re-measure before/after close together, and
  treat small deltas as noise.
- **A stale `next start` will lie to you.** Rebuilding while a server
  from a previous build is still running produces a `ChunkLoadError`:
  React never hydrates, and Lighthouse then reports a *fantastic* score
  for a page that does not work. This happened during this work and
  briefly produced a bogus "82". Always kill the old process (by port,
  `Get-NetTCPConnection -LocalPort … | Stop-Process`), `rm -rf .next`,
  rebuild, and confirm the page hydrated before believing a number.
- The Browser pane runs pages as **hidden tabs**, where neither
  `requestIdleCallback` nor `IntersectionObserver` fire. Anything gated
  on idleness or visibility must be verified in a real visible browser —
  `scripts/check-terrain-mount.mjs` does exactly that over CDP.

---

## Baseline — 21 Jul 2026 (before any optimization)

| Page | Form factor | Perf | LCP | TBT | Page weight |
|---|---|---:|---:|---:|---:|
| home | mobile | **41** | 8310 ms | 1998 ms | 1799 KB |
| home | desktop | 70 | 2186 ms | 310 ms | 3313 KB |
| projects | mobile | **59** | 11436 ms | 439 ms | 2807 KB |
| projects | desktop | 83 | 2313 ms | 29 ms | 2846 KB |
| project-detail | mobile | **52** | 6333 ms | 800 ms | 1311 KB |
| project-detail | desktop | 92 | 1402 ms | 8 ms | 1338 KB |
| journal | mobile | **53** | 5097 ms | 1005 ms | 808 KB |
| journal | desktop | 95 | 998 ms | 23 ms | 843 KB |
| studio | mobile | **67** | 4986 ms | 391 ms | 802 KB |
| studio | desktop | 95 | 894 ms | 41 ms | 823 KB |

CLS is 0.000 everywhere — layout stability is already excellent.

**Targets** (ROADMAP B3): mobile ≥85, desktop ≥95, LCP <2.5 s.
Every mobile page currently fails; three desktop pages pass.

### What the reports actually blame

Read from `home-mobile`, the worst page:

- **LCP is 8.3 s of which 7.8 s is *render delay*** — not network
  (TTFB 667 ms), not image loading. The LCP element is the hero
  paragraph, a piece of text. The browser has the text and cannot paint
  it because the main thread is busy.
- **Main-thread work: 6394 ms script evaluation**, 1649 ms style/layout.
  That is the three.js/R3F terrain, framer-motion across ~25 components,
  and a client tree that hydrates essentially the whole page.
- **Unused JavaScript: 148 KB / ~750 ms.**
- Images were the other half: 1600×1200 masters (146–513 KB) served raw
  to every viewport — 2.8 MB on `/projects`, which is why its mobile LCP
  was the worst of all at 11.4 s.

The decisive clue is **journal/mobile: 808 KB but still LCP 5.1 s and
TBT 1.0 s**. A near-empty page is slow, so the dominant cost is the
*shared client bundle*, not any page's own content. Images are a real
but secondary problem.

### Therefore, in order

1. **Image pipeline** (done — see below): pure byte win, zero risk.
2. **Idle/deferred rendering + JS reduction**: the actual lever for
   mobile scores. Defer the 3D layer until after first paint, pause
   off-screen canvases, stop paying for what is not on screen.
3. Only then chase the remainder (fonts, unused JS, third code pass).

---

## Result — production, after the image and idle-rendering passes

Same protocol, same environment, median of 3 runs
(`docs/perf/after/summary.tsv`, measured 27 Jul 2026):

| Page | Form factor | Perf | LCP | Page weight |
|---|---|---|---|---|
| home | mobile | 41 → **43** | 8310 → **6070 ms** | 1799 → **862 KB** |
| home | desktop | 70 → **87** | 2186 → **1300 ms** | 3313 → **1036 KB** |
| projects | mobile | 59 → **72** | 11436 → **4442 ms** | 2807 → **773 KB** |
| projects | desktop | 83 → **96** ✅ | 2313 → **959 ms** | 2846 → **798 KB** |
| project-detail | mobile | 52 → **72** | 6333 → **3994 ms** | 1311 → **597 KB** |
| project-detail | desktop | 92 → **96** ✅ | 1402 → **960 ms** | 1338 → **839 KB** |
| journal | mobile | 53 → **73** | 5097 → **3775 ms** | 808 → **541 KB** |
| journal | desktop | 95 → **96** ✅ | 998 → **839 ms** | 843 → **619 KB** |
| studio | mobile | 67 → **74** | 4986 → **3698 ms** | 802 → **535 KB** |
| studio | desktop | 95 → **97** ✅ | 894 → **817 ms** | 823 → **600 KB** |

**Desktop passes the ≥95 target on four of five pages.** Mobile gained
roughly twenty points everywhere except `home`, which remains the
outlier: its blocking time is still ~2 s, and that is not images or 3D
any more — it is the always-mounted chrome plus framer-motion breadth
(concepts C3a/C3b). LCP is under 2.5 s nowhere on mobile yet.

## Change log

### Image pipeline — 21 Jul 2026

All photography moved to `next/image` through one `<Photo>` wrapper
(`src/components/photo.tsx`) with per-breakpoint `sizes`, AVIF/WebP
enabled, `priority` on the two LCP candidates per page, and the brand
logos sized down from 1532 px PNGs. The editor's `EditableImage` gained
a `renderImage` hook so editor-managed photos are optimized too while
freshly-uploaded drafts still render as a plain `<img>`.

Measured effect on bytes (the part that is unambiguous):

| Asset / page | Before | After |
|---|---:|---:|
| `ph/28.jpg` at phone card size | 501 KB (raw master) | **97 KB AVIF** |
| home, total weight | 1799 KB | **1177 KB** |
| `/projects`, total weight | 2807 KB | **1230 KB** |

Timing did not improve much on `home` in this step, exactly as the
diagnosis predicted: its bottleneck is script evaluation, not bytes.
`/projects` — the byte-bound page — is where this lands hardest.

### Idle rendering — 21 Jul 2026

The 3D terrain used to be created as soon as the page hydrated, so
three.js booted while the browser was still trying to paint the hero
text. It now waits for the page to load, the browser to go idle *and*
the layer to be near the viewport (`src/lib/use-deferred-visible.ts`),
and its render loop stops entirely while off screen — the closing-CTA
canvas previously rendered every frame for the whole visit without ever
being seen. The preloader's two decorative images also stopped claiming
`fetchPriority="high"` and now go through `next/image`.

Verified in a real visible browser (`scripts/check-terrain-mount.mjs`):
the hero canvas mounts ~3 s in with a live WebGL context, and the
below-fold canvas correctly does not mount at all until scrolled to.

Local production build, home, mobile (3 runs, clean build):

| | Before this pass | After |
|---|---:|---:|
| Page weight | 1177 KB | **955 KB** |
| Script evaluation during load | ~6394 ms¹ | ~363 ms¹ |
| Perf score | — | 44–47 |
| TBT | — | ~1.8 s |

¹ from the network/main-thread audits; the 235 KB three.js chunk is no
longer requested during the load window at all.

**Where this leaves us — honestly:** mobile is still far from the 85
target. Deferring the terrain removed it from the critical path but its
boot still lands inside the measured window, and the bigger remaining
cost is systemic: essentially the whole page is a client component
because every string flows through the client-side i18n, so the shared
bundle hydrates on every route (visible as journal/mobile: 808 KB yet
TBT 1.0 s). Reaching 85 needs that architectural change — server-rendered
locale routes — not more tuning of the 3D layer. That is milestone 4 in
`docs/phase-0-audit.md` and should be the next performance PR.
