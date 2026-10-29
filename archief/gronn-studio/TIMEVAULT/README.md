# TIMEVAULT

The project's memory. Why this site is the way it is, kept where it
cannot be lost when a session ends or a person forgets.

`/stack` answers **what this is built with**.
The Evolution timeline on that page answers **how it got here**.
This directory holds the long form of both, and is the source they are
written from.

## The three layers

```
GIT                     what changed, and when
 ↓
TIMEVAULT               why it changed, what was tried, what was rejected
 ↓
/stack → Evolution      the curated version a visitor sees
```

Git is the record of implementation. TimeVault interprets it. The site
shows a selection. **Never write the public timeline from memory** — put
the event here first, then curate it into `src/lib/timevault.ts`.

## What is where

| File | Holds |
| --- | --- |
| `TIMELINE.md` | Every milestone, in order, with its provenance |
| `CURRENT-STATE.md` | What is true right now, and what is in flight |
| `DECISIONS.md` | Decisions with their reasoning and their cost |
| `RESEARCH.md` | Questions that were investigated, and what was found |
| `UX-UI.md` | The design rules, and the feedback that produced them |
| `ARCHITECTURE.md` | The load-bearing structures and why they hold |
| `EXPERIMENTS.md` | Tried and kept, tried and dropped |
| `PROBLEMS.md` | What broke, why, and what stops it recurring |
| `CHANGELOG.md` | Shipped, by date |
| `TODO.md` | Open, with what each thing is waiting on |
| `entries/` | One file per milestone — the long form |

## Provenance, which is not decoration

This repository's git history **begins on 20 July 2026 at PR #21.** The
site was already live by then. Everything before that date was built in
a working copy whose commits are not here, and is reconstructed from the
day logs in `docs/log/`, which were written at the time.

So every event carries a status, and the site shows it:

| Status | Means |
| --- | --- |
| `verified` | Commits in this repository back it |
| `reconstructed` | Real, but sourced from the day logs, not from commits |
| `proposed` | Decided, not built |
| `in-progress` | Being built now |
| `superseded` | Shipped, then replaced by something later on this timeline |

**Do not promote a status to make the timeline look more solid.** An
honest gap is worth more than a confident guess, and this is the one
rule in this directory that has no exceptions.

## Adding a milestone

Not every commit is a milestone. A milestone is something that changed
how the site works, looks, or is built — something a visitor or a future
maintainer would want the reasoning for.

```
Implement → verify → commit
   ↓
TIMEVAULT/entries/<date>-<slug>.md      the long form
   ↓
src/lib/timevault.ts                    the curated event
   ↓
CURRENT-STATE.md + CHANGELOG.md         the running state
```

The entry comes first. If it is not worth writing an entry for, it is
not worth a place on the public timeline either.

## Related documents

- `docs/log/` — the day logs. The primary source for everything here.
- `AGENTS.md` — how work is done in this repository.
- `CLAUDE.md` — the design rules and the architecture notes.
- `OPERATIONS.md` — what runs where, and what to do when it breaks.
