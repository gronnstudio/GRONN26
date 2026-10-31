# 27 Aug 2026 · TimeVault

**Status** in-progress · **PR** #87 · **Category** research

## Context

`docs/log/` holds nine day logs written at the time of the work, and
they contain the reasoning behind nearly every decision on this site. No
visitor could ever see them, and no future maintainer would find them
without being told they exist.

`/stack` answers *what this is built with*. Nothing answered *how* or
*why*.

## The brief

The owner's instruction, 27 August: build the desktop TimeVault
experience fully before considering tablet or phone, so that the later
question is *"how do we translate this?"* rather than *"what can we
remove so it fits?"*

Target widths 1280, 1440, 1680, 1920 and above.

## Decision

One archive in the repository, one curated timeline on the site, both
sourced from the same events.

A public history written separately from the real one becomes marketing.
Sourcing both from the same place means the page can only say what the
archive says. The cost is that the archive has to be updated *with* the
work rather than after it, or the timeline quietly falls behind.

## Provenance is part of the data

`git rev-list` puts this repository's first commit on **20 July 2026 at
PR #21** — by which time the site was already live. The first ten days
exist only in `docs/log/2026-07-10--19-initial-build.md`.

So every event carries a status and the site shows it, rather than
hiding the seam: `verified` when commits back it, `reconstructed` when
only the logs do. Twelve events, one reconstructed, one in progress.

## Implementation

- `TIMEVAULT/` — the archive, eleven documents plus these entries.
- `src/lib/timevault.ts` — the typed events. Technologies are named with
  the **same keys `/stack` uses**, so the join between the two pages
  needs no second list of names.
- The Evolution section on `/stack` — an era axis, the milestones on it,
  and a detail panel that answers context, research, decision,
  implementation, result and technology.
- `eventsForTech()` walks the join backwards, which is what lets a
  technology card say when it became relevant.

## Desktop-only, and what that does not mean

It does not mean a hole below `lg`. The section renders a plain,
readable, semantic list there — chronological, keyboard-reachable, no
interaction model pretending to be a smaller version of the desktop one.
Translating the real experience is a separate round.

This is a stated exception to design rule 5, sequenced rather than
repealed. It is written down in `DECISIONS.md` so nobody has to guess
later whether it was deliberate.

## Open

- Tablet and phone translation.
- Visual history: milestones can reference real assets, and the entries
  that would carry them (before/after states, prototypes) have no
  committed screenshots yet. Nothing is fabricated to fill the gap.
- The 8–22 August gap in the commit history is unexplained and not
  investigated.
