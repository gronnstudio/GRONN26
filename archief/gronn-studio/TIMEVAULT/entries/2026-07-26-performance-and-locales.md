# 26–27 Jul 2026 · Fast enough to keep, findable in Dutch

**Status** verified · **PRs** #40–#45 · **Category** performance

## Context

Two problems that look unrelated and are both about work done for
nobody's benefit.

The terrain was built on every page load whether or not anyone scrolled
to it. And the Dutch site — the language of nearly every customer —
existed only as a client-side switch, so search engines never saw it.

## Research

**Question** what is actually costing the first paint?

Investigated: a committed Lighthouse baseline, so later rounds compare
against a number rather than a memory; which images were served raw
instead of through the framework's pipeline; when the WebGL layer is
built, and whether it keeps running off screen.

**Found** the terrain was the largest single cost, and it was being paid
before anyone could see it.

## Implementation

Every photograph through the image pipeline. The 3D layer built only
when the browser is idle *and* the viewport is close, and paused when it
leaves. Locale routes so Dutch has real, indexable URLs resolved on the
server.

An accessibility floor landed in the same stretch (#44): focus-trapped
dialogs, a working skip link, a theme-aware focus ring, reduced-motion
parity.

## Result

Accessibility to 100, and a boot sequence that paints before hydration.

The pattern generalised: **build the expensive thing late, pause it when
unseen.** It is the rule every heavy piece has followed since.
