# 10–19 Jul 2026 · A site from nothing

**Status** reconstructed · **PRs** #1–#20, not in this history · **Category** architecture

## Provenance

This repository's git history begins on 20 July at PR #21. These ten
days were built in a working copy whose commits are not here. The source
is `docs/log/2026-07-10--19-initial-build.md`, written at the time.

Everything below is from that log. Nothing is inferred.

## What was built

Empty repository to a live site on its own domain in ten days: seven
pages, four palettes (Paper, Meadow, Forest, Night — Meadow default),
English and Dutch, a motion system (curtain menu, labelled cursor,
stacking service cards, a pinned horizontal project gallery, reveals,
count-ups), a 3D wireframe terrain in three tiers, an SEO layer, an
accessibility pass, Dutch legal pages, and a working contact form.

Infrastructure alongside: Cloudflare DNS to Vercel, www→apex 308, a
private git-connected repository, Google Workspace mail with SPF and
DKIM.

## Governance, adopted mid-build

The owner's master brief became this project's rules partway through and
has held since. It is `AGENTS.md` §1.

## What was rejected, and became rules

- **Clipart illustration** in the hero — "look like shit". Abstraction
  and photography only.
- **Giant marquee text bands** — "looks crap and cheap".
- **Unlabelled icon controls** (four theme dots) — end users cannot
  decode insider iconography. This became design rule 1.
- **The full editorial redesign** — merged once by misreading an
  instruction, reverted on the owner's order. Kept as
  `design/editorial`. Do not merge it.
- **A server-side contact relay** — impossible, not stylistic:
  FormSubmit 403-blocks datacenter IPs.
- **GSAP or any second animation library.**
- **Making the repository public** to regain free branch protection —
  confidentiality outranks enforcement.
- **Placeholder tests that echo success** — forbidden outright.

## Incidents

- **19 Jul, domain outage.** A Hostinger→TransIP transfer reset the
  nameservers. Fixed by re-entering the Cloudflare NS records, plus a
  www CNAME typo (`cname.vercel-app.com` → `cname.vercel-dns.com`). The
  runbook in `OPERATIONS.md` §4 and §6 exists because of this day.
- **PR #5 merged before the owner's verify-first message arrived**, the
  two having crossed in flight. Post-merge verification ran clean. The
  rule since: behavioural verification on the preview *before* merge,
  always.
