# Session log — 10–19 Jul 2026 · Initial build, launch, governance

Agent: Claude Code (Fable 5) · Owner: Nick

## What was built and shipped

Full marketing site from scratch → live at https://gronn.studio.
7 pages, 4 themes (Paper/Meadow/Forest/Night — meadow default), EN/NL,
motion system (curtain menu, labeled cursor, stacking service cards,
pinned horizontal project gallery incl. mobile, reveals, count-ups),
3D wireframe terrain with mobile-lite/WebGL/reduced-motion tiers,
SEO layer (sitemap, robots, OG card, JSON-LD), a11y pass, Dutch legal
pages (privacy real, terms DRAFT), vegan-cookie notice (auto-accept on
scroll), working contact form. Infrastructure: Cloudflare DNS → Vercel,
www→apex 308, private GitHub repo git-connected, Google Workspace mail
with SPF/DKIM. Governance adopted mid-session via the owner's Master
Brief (see AGENTS.md §1); PRs #3–#5 shipped under it.

## Rejected — do not re-propose

- **Clipart-style illustration** in the hero (growing plants/pond) —
  "look like shit". Abstraction and photography only.
- **Giant marquee text bands** — "looks crap and cheap". Small, precise
  typographic detail beats big decorative gestures.
- **Unlabeled icon controls** (four theme dots) — end users can't decode
  insider iconography. Every control needs a visible text label. This
  became a standing design rule.
- **Full editorial color-block redesign** (`design/editorial` branch,
  kept as archive) — merged once by misreading an instruction, owner
  ordered immediate revert. Lesson recorded: read ambiguous requests
  narrowly; "push that up" ≠ "merge everything".
- **Server-side relay for the contact form** (`/api/contact`) —
  technically impossible, not stylistic: FormSubmit 403-blocks
  datacenter IPs (proven with UA/origin diagnostics, PR #3). Route
  deleted in PR #4; browser-direct transport is the interim solution.
- **GSAP or any second animation library** — Master Brief forbids it;
  framer-motion is the single animation layer.
- **Making the repo public** to regain free branch protection — owner
  explicitly refused; confidentiality outranks enforcement. Protections
  are procedural until GitHub Pro (OPERATIONS.md §10).
- **Placeholder test scripts that echo success** — forbidden outright.

## Tried, deferred (not rejected)

Salvage list from closed PRs #1/#2, gated behind performance
stabilization: survey-frame, mist-veil, pinned garden-through-time,
form success moment. Shader terrain: deferred until perf gates green.

## Incidents

- **19 Jul domain outage**: Hostinger→TransIP transfer reset
  nameservers; fixed by re-entering Cloudflare NS at TransIP; www CNAME
  typo (`cname.vercel-app.com` → `cname.vercel-dns.com`) fixed. Full
  runbook now in OPERATIONS.md §4/§6.
- **PR #5 merged before the owner's verify-first message arrived**
  (crossed in flight). Confessed; post-merge verification ran clean.
  Rule going forward: behavioral verification on the preview BEFORE
  merge, always.

## State at handoff

`main` = PR #5. Form verified end-to-end (OPERATIONS.md §9; two proof
items open). PR #6 (this handoff) awaiting owner squash-merge. Next
work queue: AGENTS.md §3.
