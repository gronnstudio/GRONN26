// Shared-element navigation: project card → case study, on the native
// View Transitions API. "The project you clicked becomes the page you
// land on" (docs/sotd-campaign.md, Phase 3).
//
// This is the MANUAL wiring, not Next's `experimental.viewTransition`
// flag. That flag was evaluated and rejected for now: it swaps the whole
// app onto React's experimental `<ViewTransition>` path (the component
// only exists in Next's vendored React canary — react@19.2 stable and
// `@types/react` don't export it), and it turns *every* route change
// into a view transition, which would fight the green curtain in
// `app/template.tsx` on navigations that should keep it. Scoping the
// API by hand to this one gesture is ~80 lines and zero config.
//
// How a card click flows:
//   1. `ProjectCard` calls `startProjectTransition(image, navigate)`.
//      Unsupported browser (Firefox < 144) or a reduced-motion visitor
//      → returns false, the card's <Link> navigates untouched, and the
//      route curtain plays exactly as today.
//   2. Otherwise the clicked card's image wrapper gets
//      `view-transition-name: project-hero` — ONLY the clicked card;
//      naming the whole grid would be duplicate names, which voids the
//      transition — and `document.startViewTransition()` snapshots the
//      old page.
//   3. The update callback pushes the route and waits for the case
//      study to commit (`notifyProjectPageReady`, from the detail
//      page's mount effect), with a timeout so a slow or failed
//      navigation degrades to a plain swap instead of wedging the
//      browser's rendering freeze.
//   4. The case study renders its hero with the same
//      `view-transition-name`, and the browser morphs one into the
//      other. `app/template.tsx` peeks `isProjectTransitionActive()`
//      and holds the curtain, which would otherwise cover the morph.
//   5. `finished` clears the flag and the card's name either way.

export const PROJECT_HERO_NAME = "project-hero"

// How long the update callback waits for the destination page. The
// card links are prefetched in production so commit is near-instant;
// this cap only matters when a push fails or hits a cold network, where
// the transition then finishes as a crossfade of whatever is on screen
// rather than freezing paint until the browser's own 4s bailout.
const NAVIGATION_TIMEOUT_MS = 2000

let active = false
let notify: (() => void) | null = null

/**
 * True while a card → case-study transition is in flight. Peeked (never
 * consumed) by `app/template.tsx` to hold the route curtain for that
 * navigation, and by the case study to skip the hero's framer entrance
 * — the flag is cleared only by the transition's own `finished`
 * handler, so double renders and StrictMode re-fires can't eat it.
 */
export function isProjectTransitionActive() {
  return active
}

/**
 * Called from the case study's mount effect: the destination DOM is
 * committed, so the view transition can capture its new snapshots.
 * No-op outside a transition.
 */
export function notifyProjectPageReady() {
  notify?.()
  notify = null
}

/**
 * Try to run `navigate` inside a view transition that morphs `image`
 * (the clicked card's photo frame) into the case-study hero. Returns
 * false — caller must let the default navigation happen — when the
 * browser lacks the API or the visitor prefers reduced motion.
 */
export function startProjectTransition(
  image: HTMLElement,
  navigate: () => void
): boolean {
  if (typeof document.startViewTransition !== "function") return false
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false
  }

  active = true
  image.style.viewTransitionName = PROJECT_HERO_NAME

  const transition = document.startViewTransition(() => {
    navigate()
    return new Promise<void>((resolve) => {
      notify = resolve
      window.setTimeout(resolve, NAVIGATION_TIMEOUT_MS)
    })
  })

  transition.finished
    .catch(() => {
      // A skipped transition (rapid second click, tab hidden) rejects
      // `finished`; the cleanup below is all the handling it needs.
    })
    .finally(() => {
      active = false
      notify = null
      image.style.viewTransitionName = ""
    })

  return true
}
