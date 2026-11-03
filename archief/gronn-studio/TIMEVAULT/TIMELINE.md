# TIMELINE

Every milestone, oldest first. This is the source `src/lib/timevault.ts`
is curated from — when the two disagree, this one is right and the data
file needs updating.

Provenance rules are in `README.md`. In short: `verified` means commits
in this repository back it; `reconstructed` means the day logs do.

---

## Foundation · 10 July – 27 July 2026

### 10–19 Jul · A site from nothing · `reconstructed`

Empty repository to a live site on its own domain in ten days. Seven
pages, four palettes, English and Dutch, a motion system, a 3D wireframe
terrain in three tiers, an SEO layer, an accessibility pass, Dutch legal
pages. Infrastructure alongside: DNS to Vercel, a private repository,
Google Workspace mail with SPF and DKIM.

Governance was adopted mid-session, from the owner's master brief, and
has held since.

Source: `docs/log/2026-07-10--19-initial-build.md`.
No commits in this repository. PRs #1–#20 are not in this history.

### 20 Jul · The studio gets an editor · `verified` (#21)

Every word was in TypeScript; the owner could not fix a typo without a
developer. A content document in blob storage, seeded from the code,
edited in place on the live site behind a one-address Google sign-in.

A Sanity CMS foundation was built alongside and left dormant. It was
removed on 1 August as a dead second content path.

### 21 Jul · The phone stops being a small desktop · `verified` (#22–#36)

Fifteen pull requests in one day. A floating dock in thumb reach; the
header dropped on phones and then partly restored for the logo; the
pinned horizontal gallery replaced by cards that glide with the scroll;
a password-gated blur over the business credentials for screen
recording.

Two of that day's decisions were reversed within hours — the tilt sheen
(#23) and the header removal (#29). Both are in `EXPERIMENTS.md`.

### 26–27 Jul · Fast enough to keep, findable in Dutch · `verified` (#40–#45)

The terrain built on every page load whether or not anyone scrolled to
it. Now it builds when the browser is idle and the viewport is close,
and pauses off screen. Every photograph through the image pipeline. A
committed Lighthouse baseline so later rounds compare to a number.

Locale routes in the same stretch: Dutch got real, indexable URLs
resolved on the server, rather than a client-side switch no crawler saw.
Accessibility to 100.

---

## Craft · 30 July – 8 August 2026

### 30–31 Jul · Colour gets a machine to answer to · `verified` (#46, #48)

Brand lockups as SVG, a craft pass across the site, and
`scripts/check-contrast.mjs` — an auditor that parses the real token
blocks and exits non-zero on failure. Time-of-day theming arrived with
it: the site reads the visitor's own clock until they choose.

Five palettes were added ("The Hours") and two were rejected. See
`RESEARCH.md` for the dark-mode findings that decided them, and
`DECISIONS.md` for why the auditor parses the shipped CSS rather than a
copy of it.

### 1 Aug · The build becomes explorable · `verified` (#47)

`/stack`: four layers as a cross-section, every technology opening to
say why it was chosen and what it costs, a filter for what the sister
site runs too. Names and versions read from `package.json` at build
time; sentences from the content document.

This is the page the public timeline was later added to.

### 1 Aug · A gate that runs a real browser · `verified` (#49, #53–#56)

Two defects had shipped from "it builds". Continuous integration with
real browser tests and an accessibility scan inside them; blur
placeholders generated at build time; field vitals from real visits; the
dormant second content path removed. The green photo film became the
glass screen in the same round.

### 2 Aug · Installed, and continuous · `verified` (#57, #59–#64)

View transitions carry a project card's own photograph into the case
study's hero. Installed to a home screen, the site behaves as an app in
its own right. Plus a run of dock refinements: one stadium for the three
highlighted circles, back-to-top swapping with the menu button, wings
that fold away while reading.

### 3 Aug · Work that shows its figures · `verified` (#65)

Measured outcomes, a before/after wipe, and client quotes. The template
the studio's real projects will drop into — the current entries are
still placeholder fiction.

### 8 Aug · Dock: bigger icons · `verified` (#66)

Small, and listed here only because it is the last commit before a
two-week gap.

---

## Commerce · 22 August – 27 August 2026

### 22–24 Aug · Found by search, run from a phone · `verified` (#70–#74)

Dutch metadata, per-page canonicals, and structured data built from real
business facts — no invented ratings or coordinates. An owner panel at
`/admin` for quotes and invoices, with a switchable letterhead and a
document sheet that prints the studio's details once, at the foot.

### 25 Aug · Prices in the open · `verified` (#75)

Deel 5 §5.3 of the studio's working document, translated into the
codebase. Five seasonal services with published prices, a page per
service with what is included and what deliberately is not, and a
service-area postcode check that answers honestly when the answer is no.

### 25–27 Aug · One tree, three renderings · `verified` (#76–#84, #86)

Eleven pull requests. Eleven services had arrived and the menus could
not hold them; the bar, the dock and the footer each kept their own list
and the three had drifted. Now five sections in one file, read by every
surface.

The rounds it took are the honest part, and they are in `PROBLEMS.md`: a
tablet gap closed in July was reopened by a change measured only at
desktop widths, and an icon set rebuilt for consistency had to be
reverted because nobody could tell what the icons were.

### 27 Aug · Self-host the two brand faces · `verified` (#85)

Fonts served from the site's own origin, and synthesised bold forbidden.

### 27 Aug · This timeline · `in-progress` (#87)

TimeVault: this archive, the typed event list, and the Evolution section
on `/stack`. Desktop first at the owner's instruction — the full
experience established before it is translated to smaller screens.

---

## Gaps, stated rather than hidden

- **PRs #1–#20** are not in this repository's history.
- **#51, #67, #68** have no commit on `main`. Closed or never merged.
- **#69** is open and deliberately parked — the hours register belongs
  in `/admin`, not in a markdown file.
- **8–22 August** is a two-week gap with no commits. Not investigated;
  no day log covers it.

---

## Old builds — can you still open them?

**Not publicly, and that is a setting rather than a limit.**

Vercel keeps every deployment this project has ever made, preview and
production both, and the ones from July and August are still `READY`.
But the project's deployment protection is:

```
ssoProtection: all_except_custom_domains
```

So **every `*.vercel.app` URL is behind Vercel SSO** — previews *and*
the per-commit production deployments. Only `gronn.studio` itself is
public, and that always shows the current build. A visitor clicking a
historical link from the timeline would get a login wall, which is worse
than no link at all. That is why the public timeline has none.

For the owner, signed in to Vercel, they open normally. To find the
build for any milestone:

```
vercel.com/gronn/gronn-studio  →  Deployments  →  filter by branch or commit
```

Or by API: list deployments and match on `meta.githubPrId`, or on
`meta.githubCommitSha` for an exact commit. Every deployment record
carries the PR number, the branch, the commit and the full commit
message, so the join back to this timeline is exact.

A few, as a starting point:

| Milestone | PR | Deployment (owner only) |
| --- | --- | --- |
| Work that shows its figures | #65 | `gronn-studio-bbmht1o37-gronn.vercel.app` |
| Dock: bigger icons | #66 | `gronn-studio-m5t6bjvnx-gronn.vercel.app` |
| Nav polish | #64 | `gronn-studio-f1x8hjqmk-gronn.vercel.app` |
| Even glass ring | #63 | `gronn-studio-jtftznqrm-gronn.vercel.app` |
| Wings fold away | #62 | `gronn-studio-dx9efrn1t-gronn.vercel.app` |
| Back-to-top swaps | #61 | `gronn-studio-ax3220vln-gronn.vercel.app` |

### If visual history is wanted on the public page

The only version that works for a visitor is **committed screenshots** —
real captures of those deployments, stored in the repo and shown beside
the milestone. Three things to know before deciding:

1. They cannot be captured from the build environment: its network
   policy blocks `*.vercel.app` outright (`ERR_TUNNEL_CONNECTION_FAILED`),
   so this has to run from a machine that can reach them.
2. Weight is real but bounded — roughly 150–400 KB per capture, and only
   the selected milestone's image would ever load.
3. **Only real captures.** Never a mock-up of what a past state might
   have looked like; a fabricated historical screenshot is worse than an
   empty slot, and the timeline's whole claim is that it does not invent.

### What was NOT done, and why

Turning SSO down to previews-only would make the per-commit production
URLs public and linkable. Rejected: it would permanently expose every
historical build — including ones carrying draft legal text and
placeholder client quotes — to anyone with the URL, and to crawlers.
A nice-to-have on a timeline is not worth that.
