# GRØNN Command Center (/os)

The owner-only operating system for GRØNN Studio. Phase 1: the shell, the
GRØNN Core, the command palette, and the pond renovation (Vijverklant) as the
first project with a full control view. Started 30 September 2026 from
Nick's Command Center brief.

## What exists

| Route | Screen |
| --- | --- |
| `/os` | **Core**: the GRØNN Core diagram, Today, Next, GRØNN insight, next actions, active projects, pipeline pulse, recent activity |
| `/os/projects` | All projects as rows |
| `/os/projects/vijverklant` | **Project control view**: photo hero, telemetry strip, then zones: overview, water system, timeline, tasks, photos, materials, finance, client, notes, actions |
| `/os/pipeline` | Pipeline board, eight stages, stale leads first |
| `/os/finance` | Invoiced this year, still to receive, overdue, open quotes, invoiced per month |
| ⌘K / Ctrl K, or `/` | Command palette, anywhere in `/os` |

Planning, Files, Suppliers and Website are in the top bar, dimmed and
marked "later". They are not links. On a phone the four sections that
exist move to a dock at the bottom.

## Files

```
src/app/os/
  layout.tsx          owner gate + shell
  access.ts           who may open /os (every page asks, see D-02)
  os.css              the OS palette (scoped to .os) and the Core's SVG classes
  os-shell.tsx        top bar, navigation, ⌘K
  command-palette.tsx combobox + listbox, focus-trapped dialog
  core.tsx            THE GRØNN CORE (SVG rings + HTML labels/controls)
  greeting.tsx        "Good morning" by the owner's clock
  ui.tsx              Zone, Reading, ProgressLine
  page.tsx            the Core screen
  projects/page.tsx
  projects/[slug]/page.tsx            the control view
  projects/[slug]/project-control.tsx zone index, photo wall + lightbox, actions
  pipeline/page.tsx
src/lib/os/data.ts    fixed real data (the site projects, the pond)
src/lib/os/live.ts    live reads on gronn.studio
src/lib/os/view.ts    the OsView shape, and the preview view
tests/e2e/os-gate.spec.ts
```

## Only real data

Nick, 30 Sep 2026: "only real data". There are no example figures in the
OS. The pond's text, figures, photos and clips come from
`src/lib/data/vijverrenovatie.ts` (client consent for the photos); its
value (€0.000,00), hours (120 h), progress (92 %) and system (2 ponds,
1 waterfall, 1 stream) are Nick's own. Geulle is the real terrace from
`terras-geulle.ts`. Every open task on the pond is a sentence from the
project text. Materials and margin stay empty until purchases are
recorded; nothing is estimated.

## Live data and previews (step 2, 30 Sep 2026)

`src/app/os/read-view.ts` hands every page an `OsView`:

- **gronn.studio (owner signed in)**: `src/lib/os/live.ts` reads the same
  intake and document archives as /dashboard, plus Supabase `projects` and
  `hours`. Money goes through `moneySummary()` in `src/lib/analytics.ts`,
  tested in `analytics.spec.ts`. A source that does not answer is named on
  screen, never shown as zero.
- **Previews and development**: `src/lib/os/view.ts` `previewView()`: the
  real site projects and the pond, and nothing from the books. Previews
  open without a sign-in, so they never read the archives; a line under
  the top bar says so, and the empty zones say where the figures are.

Pipeline, live: Supabase projects in a sales phase, then enquiries without
a project (moved to Quotation by their quote and to Won by their invoice,
linked through `intakeRef`, never by name), then quotes that answer no
enquiry. Chance is shown only where somebody set one.

### D-08 · English and Dutch, on the OS's own cookie
**30 Sep 2026 · accepted (Nick: "language switch also in OS")**

`gronn-os-lang`, path `/os`, English by default. Separate from the site's
language cookie, so switching the OS never changes the public site.
Fixed data words are translated through the `NL` table in
`src/lib/os/i18n.ts`; a missing entry stays English rather than blank.

### D-09 · Works on the phone
**30 Sep 2026 · accepted (Nick: "OS on phone working")**

Bottom dock with the four live sections, the Core scaled down with names
only on its nodes, the pipeline stacked by stage with empty stages hidden.

## Decisions

### D-01 · Built inside gronn-studio, not as a separate app in gronncore
**30 Sep 2026 · proposed**

`gronncore` was an empty repository. Building `/os` as a route here reuses
the fonts, tokens, owner sign-in, the pond data and photos, and gives every
PR a Vercel preview Nick can open on his phone. The cost: the OS ships with
the marketing site. If the OS grows heavy, it can move to `gronncore` as a
Next.js multi-zone under the same `/os` path later without changing a URL.

### D-02 · Every /os page checks the owner itself
**30 Sep 2026 · accepted**

A layout that returns the sign-in gate instead of `children` still sends
the page's markup in the RSC payload. `os-gate.spec.ts` caught the Core's
client names in a signed-out response that way. So `canOpenOs()` is called
by the layout and by every page, and the spec checks that no client name,
amount or project photo reaches a signed-out visitor.

### D-03 · Previews are open, production is owner-only
**30 Sep 2026 · proposed, needs Nick's yes**

Google sign-in only works on gronn.studio, so a gated preview could not be
reviewed. Previews sit behind Vercel SSO and render without a session.
This must end when phase 2 reads real client data from Supabase.

### D-04 · One dark palette, green for state, orange only for "needs you"
**30 Sep 2026 · accepted**

Warm near-black ground (#121211), salie #B8C5A8 for active/healthy/focus,
aarde-oranje #DB6923 only where something needs the owner (a stale lead,
the attention node). All pairs measured AA or better (see `os.css`). The
site's water route is reused with its water drawn in green.

### D-05 · framer-motion only, no GSAP, no Three.js yet
**30 Sep 2026 · accepted**

AGENTS.md forbids a second animation library. The Core is SVG + DOM: rings
draw once on load, one halo breathes on the node that needs attention,
everything else moves only in response to the hand. All of it stops under
reduced motion. WebGL can come later if the Core earns it.

### D-06 · English interface, Dutch project text
**30 Sep 2026 · proposed**

The brief is in English, so the OS chrome is too. The pond's own text is
quoted in Dutch (`lang="nl"`) rather than translated.

### D-07 · Claude actions say what they are
**30 Sep 2026 · accepted**

Two actions (Summarize project, Create next actions) are answered now,
deterministically, from the project's own data, and say "no model involved
yet". The others say which phase connects them. Nothing pretends to be AI.

## Open questions for Nick

1. Keep the OS in this repo (D-01), or move it to `gronncore`?
2. Should the pond's value and client name ever appear on a phone
   notification or the client portal? (Currently: never.)

## Next (phase 2)

Supabase tables for projects, tasks, hours, leads, quotes and invoices
(extending `supabase/migrations/0001`/`0002`), replacing `src/lib/os/data.ts`
read by read; then the hours module and the real Today briefing.
