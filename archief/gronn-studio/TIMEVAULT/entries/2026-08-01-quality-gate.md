# 1 Aug 2026 · A gate that runs a real browser

**Status** verified · **PRs** #49, #53–#56 · **Category** architecture

## Context

Two defects had shipped from "it builds". Building is not evidence that
anything works.

## Decision

End-to-end tests against the **real production build**, with an
accessibility scan inside them.

The defects this project actually produces are behavioural: a panel that
closes under the cursor, a focus that lands nowhere, a modal that hides
its own exit from a screen reader. No amount of type checking sees any
of those. The gate takes minutes instead of seconds, which is cheaper
than one bad deploy.

## Also in this round

- The green multiply/soft-light photo film — hand-copied into six files
  and drifted — replaced by a single `photo-glass` utility (#49).
  Deliberately **no** `backdrop-filter`: `RevealImage` animates
  `filter: blur()` on an ancestor, which would stop it sampling, and
  `<Tilt>` gives project cards a 3D-transformed ancestor.
- Blur placeholders generated at build time for every static
  photograph (#54).
- Field vitals from real visits (#56).
- The dormant Sanity path removed (#53).
- Three axe findings fixed (#55).

## Result

Every change since has walked through it. The rule that came out of it —
*look at the thing, do not merely build it* — is the one this project
breaks most often, and it has paid for it every single time. See
`PROBLEMS.md`.
