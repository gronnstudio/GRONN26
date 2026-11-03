# 21 Jul 2026 · The phone stops being a small desktop

**Status** verified · **PRs** #22–#36 · **Category** ux

## Context

Most visitors arrive on a phone. The site was a desktop layout that
shrank, with a header nobody could reach one-handed.

## What shipped, in one day

Fifteen pull requests. A floating dock within thumb reach; liquid-glass
chrome; the header dropped on phones and then partly restored for the
logo alone; the pinned horizontal gallery replaced by cards that glide
with the page scroll; and a password-gated blur over the business
credentials so the owner can record the screen without exposing an IBAN.

## Two reversals inside the same day

- **The tilt sheen** (#22) was added and removed (#23) within hours.
- **Removing the header entirely** (#26) was undone three PRs later
  (#29), slimmed to logo-only. Removing a thing is rarely the same as
  making room for another.

Four attempts went into the gallery alone: clear the dock beneath it,
swap to a grid, link the card slide to page scroll, then serve that
glide to all phones. The pinned version simply clipped on phones.

## Result

The phone became the site's own shape rather than a narrower version of
someone else's. Every navigation round since has started from the dock —
including, five weeks later, the one that had to restore this day's
line-up after a later change quietly replaced it.
