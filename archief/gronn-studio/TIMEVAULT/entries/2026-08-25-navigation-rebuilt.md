# 25–27 Aug 2026 · One tree, three renderings

**Status** verified · **PRs** #76–#84, #86 · **Category** ux

## Context

Eleven services arrived on 25 August (#75) and the menus could not hold
them. Worse, the bar, the phone dock and the footer each kept their own
list of destinations, and the three had already drifted: the dock's
primary list held four items where the bar held five, and its secondary
list put Projects and Contact between Privacy and Terms.

The owner, on the old menu: *"alles is beetje weggemoffeld nu."*

## Research

Three references, all from the owner:

- **navbar.gallery** — a collection of real navigation bars, saved as
  the thing to reach for before proposing a shape.
- **biovijver.nl** — a Dutch pond retailer, for how a catalogue is
  actually shopped.
- **GitHub's platform menu** — for the floating-card shape.

*Neither navbar.gallery nor biovijver.nl could be fetched from the build
environment; the network policy blocked both. The owner sent screenshots
of biovijver. Nothing here claims to have read navbar.gallery.*

The finding: the structure has to be **data, not markup**.

## Decision

Five sections in one file — `SECTIONS` in `src/lib/nav.ts` — read by the
bar, the phone dock, the tablet menu and the footer.

Children deliberately never include the section's own page. With a
self-child, the studio panel offered three routes to `/studio` on one
card: a heading, a link that looked like a heading, and a footer strip.
None of the three read as related to the others.

## Implementation, in the order it happened

1. **#76** a mega menu behind Services, available from `md` so tablets
   get it.
2. **#77** that menu reshaped as a floating card, on a GitHub screenshot.
3. **#78** entry points follow the two-family structure; the intake form
   splits by family.
4. **#79, #80** `/nl/admin` 404 — twice. See `PROBLEMS.md`.
5. **#80** the full-screen curtain replaced by panels hanging from the bar.
6. **#81** one tree, five sections, three renderings.
7. **#83** per-section dock panels, the four site controls gathered into
   one pill, a menu for the tablet band, and breadcrumbs reading the
   same trail as the structured data.
8. **#84** the + steps aside so an open dock carries all five sections.
9. **#86** the dock line-up restored to the owner's; the tablet bar
   emptied entirely behind the Menu button.

## Result

One source, four surfaces.

The number of rounds is the honest part. A tablet gap closed in July was
reopened by a change measured only at desktop widths. An icon set
rebuilt for consistency had to be reverted because nobody could tell
what the icons were. And the owner asked three times for the old icons
before anyone worked out that restoring the drawings changed nothing
about the row.

Each of those is in `PROBLEMS.md` with what now stops it recurring.
