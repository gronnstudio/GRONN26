# GRØNN — Awwwards Experience Plan

Derived from dissecting four reference sites (via DOM/interaction analysis,
2026-07-13) and mapped onto GRØNN's ecological concept. Every borrowed
pattern is translated — nothing is copied without a narrative reason.

**References analyzed**
- `patient-daffodil-919172.framer.app` — nature tour: pinned scroll-transform
  storytelling (images morph through stages inside a sticky viewport),
  text-reveal choreography, glow atmospheres, video cards.
- `langard.framer.website` — landscaping template: per-letter nav hover,
  service rows with animated line-fill, count-up stat counters, one
  oversized display word ("Flourish."), background shape + dot accents.
- `lesmana.framer.website` — portfolio: availability badge with pulsing dot,
  icon-swap button hover (arrow exits right, re-enters from left), quote
  block, founder-forward hero.
- `aperture.framer.media` — photography: progressive blur veils at viewport
  edges, viewfinder corner marks framing the hero, navigation that activates
  after the hero, parallax image collage clusters, big year markers.

---

## Phase A — Signature moments (the "only here" layer)

1. **Pinned garden-through-time** (from daffodil's Stay-Sticky/Transform).
   Featured Project becomes a pinned viewport where ONE image frame
   transforms through three states as you scroll: existing situation →
   intervention drawings overlaid → developing ecosystem. The strongest
   possible use of before/after material. `~1 day`
2. **Field-survey frame** (from Aperture's viewfinder corners, translated).
   Thin corner marks + coordinates/date stamps framing the hero scene and
   case-study images — the site literally looks through the surveyor's
   frame. Pairs with the existing annotation pins. `~2h`
3. **Oversized display word** (from Langard's "Flourish."). One full-screen
   typographic beat between chapters 06 and 07: "Groei." / "Grow." in Syne
   at viewport scale, scroll-linked weight/scale. `~2h`
4. **Progressive mist** (from Aperture's Progressive Blur). A graduated
   blur/fade veil at the bottom viewport edge on the hero and chapter
   transitions — content emerges from mist as you scroll. CSS
   `backdrop-filter` gradient masks, cheap. `~2h`

## Phase B — Micro-interactions (felt everywhere)

5. **Count-up metrics** (Langard counters). Case-study metrics and a new
   hero stat animate from 0 when entering view ("18 m³", "58 species").
   We already have the data in `projects.ts`. `~1h`
6. **Icon-swap buttons** (Lesmana). CTA arrows exit right and re-enter from
   left on hover; apply to CtaLink and card footers. `~1h`
7. **Per-letter nav hover** (Langard). Header links cascade letters up on
   hover (mask + stagger, reuse RevealText mechanics). `~1h`
8. **Line-fill on service rows** (Langard's Line Inactive/Fill). The
   divider under the focused service row fills green left-to-right,
   synced with the existing scroll/hover showcase. `~30m`
9. **Navigation activation** (Aperture). "Start a Project" pill and nav
   links slide in only after the hero is passed; hero stays pure. `~1h`

## Phase C — Conversion & trust

10. **Availability badge** (Lesmana). Pulsing green dot in header/menu:
    "Taking projects for spring 2027 — 2 slots". Localized, data-driven
    from a single const. `~30m`
11. **Journal collage clusters** (Aperture's image groups). Journal index
    gets staggered parallax image clusters instead of a flat list. `~3h`

## Standing constraints (unchanged)

- Real photography remains the single highest-impact item — no pattern
  above rescues placeholder imagery.
- Every effect: reduced-motion fallback, mobile simplification, no scroll
  hijacking, one easing family.
- Verify on production (gronn-studio.vercel.app), not localhost.

## Suggested order

A2 → B5 → B6 → B8 → A4 (one afternoon, broad lift), then A1 (the
signature), then B7/B9/C10, then A3, then C11.
