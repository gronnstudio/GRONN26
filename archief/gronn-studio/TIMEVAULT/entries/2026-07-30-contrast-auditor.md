# 30–31 Jul 2026 · Colour gets a machine to answer to

**Status** verified · **PRs** #46, #48 · **Category** accessibility

## Context

Palettes were being added by eye. A palette that reads well on the
designer's screen can still fail a contrast threshold, and nothing was
checking. This ran on the owner's secondary account, on a separate
branch — so the day log, `docs/worklog.md` and `ROADMAP.md` were the
whole handover.

## Research

See `RESEARCH.md` for the full findings. In short: never a pure-black
ground; in dark mode elevation is expressed as *light* rather than
shadow; accents desaturate on dark; light grounds stay high value and
low chroma.

Two palettes were rejected on that last point. "Marl" had defensible
contrast numbers and still read muddy, because a mid-value tinted ground
does.

## Decision

An auditor that **parses the real token blocks** in `globals.css` and
exits non-zero on failure.

It reads what ships rather than a copy of it, so the check cannot drift
from the palette it is meant to be checking. The cost: adding a palette
now means satisfying a script as well as an eye.

## The finding that justified it twice over

Lighthouse only measures the **resting** state. White on Signal Ember
measured 2.99:1 under a score of 100, because the score never saw the
hover colour. An auditor over declared pairs catches what a page audit
structurally cannot.

## Result

122 pairs checked on every build. Ten palettes in two sets, each behind
its own labelled switcher — next-themes holds only one active theme, so
each switcher names its set and shows an em dash when the other set is
active. Without that, both controls look switched on.

Registering a palette takes three edits, listed in `ARCHITECTURE.md`.
Miss the `@custom-variant dark` list and every `dark:` utility silently
does nothing.
