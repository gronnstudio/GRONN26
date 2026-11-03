// The site's motion vocabulary — one place for the curves and the spoken
// cursor labels, so a tuned ease lands everywhere at once instead of being
// re-typed as a bare array in every component.
//
// IMPORTANT — these numbers have CSS twins. `src/app/globals.css` declares
//
//   --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);   → EASE_REVEAL
//   --ease-curtain:  cubic-bezier(0.76, 0, 0.24, 1);  → EASE_CURTAIN
//
// for the animations that run as pure CSS keyframes (the preloader veil,
// the hero rise, the server-rendered cookie banner). The two halves MUST
// stay identical: a CSS-entering element and a framer-motion one sitting
// side by side on the same page will visibly disagree otherwise. Change a
// curve here and change its twin in globals.css in the same commit.

import type { L } from "@/lib/i18n"

// framer-motion's `BezierDefinition` (from motion-utils, not re-exported
// by framer-motion itself) is exactly this shape. Declaring it locally
// keeps the constants assignable to any `ease` prop with no cast at the
// call site, without importing from a transitive dependency.
type Bezier = readonly [number, number, number, number]

/**
 * The house reveal ease (out-expo): fast out of the gate, long soft
 * landing. Everything that *enters* uses this — FadeIn, RevealText,
 * RevealImage, the page content behind the route curtain, the cookie and
 * install prompts, the Field Lab sprouts.
 * CSS twin: `--ease-out-expo`.
 */
export const EASE_REVEAL = [0.16, 1, 0.3, 1] as const satisfies Bezier

/**
 * The curtain ease (in-out-quart): symmetric, weighted at both ends — it
 * reads as a panel being drawn rather than an object arriving. Reserved
 * for the full-bleed wipes: the route transition curtain in
 * `app/template.tsx` and the full-screen menu in `layout/header.tsx`.
 * CSS twin: `--ease-curtain`.
 */
export const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const satisfies Bezier

/**
 * How long a curtain takes to cross the screen, in seconds. Shared by the
 * route transition and the full-screen menu so the two wipes feel like the
 * same gesture — a visitor opening the menu and then navigating sees one
 * consistent panel speed.
 */
export const DURATION_CURTAIN = 0.7

/**
 * Labels the pointer pill and the tilt chip can speak, keyed by the
 * `data-cursor` attribute on the hovered element. Adding a key here is
 * what makes `data-cursor="…"` say something rather than merely bloom.
 *
 * Wired up on the public V5 site (the pill is `Aanwijzer` in
 * `components/gronn/elementen/aanwijzer.tsx`):
 *   view → the project card on /projects (`components/gronn/projecten.tsx`)
 *          and the featured project on the home opening (`gronn/home.tsx`);
 *          also the default of `BeeldKaart`
 *   read → the service cards on /services (`components/gronn/diensten.tsx`)
 *   drag → nothing on V5 yet; kept for the concept components
 *          (`components/home/selected-projects.tsx`)
 *   about → Nick's portrait line under the buttons in the home opening
 *          (`gronn/home.tsx`), the door to /studio
 *
 * The pill is a fixed 76px wide (`Aanwijzer`): a label longer than eight
 * mono capitals gets clipped. "Over mij" / "About me" are exactly eight.
 *
 * The concept-era `Cursor` and `TiltIndicator` in `components/motion/` read
 * the same keys; V5 does not mount them.
 */
export const CURSOR_LABELS: Record<string, L> = {
  view: { en: "View", nl: "Bekijk" },
  drag: { en: "Drag", nl: "Sleep" },
  read: { en: "Read", nl: "Lees" },
  about: { en: "About me", nl: "Over mij" },
}
