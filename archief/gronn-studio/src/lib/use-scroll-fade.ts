"use client"

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react"

// A soft bottom edge while a list carries on, a hard one once it doesn't.
//
// WHY THIS IS A HOOK AND NOT A CONSTANT. The owner opened the phone menu
// and could not tell that it scrolled: content simply stopped at the
// bottom edge of the screen, usually part-way through a heading — and a
// clipped HEADING reads as the end of a list, not as more to come. The
// dock's sheet got the fix first. The tablet menu has the same defect,
// and a phone reaches THAT one the moment it is rotated, because every
// current phone in landscape is wider than the 768px `md` breakpoint.
//
// So the same treatment is needed in two places, and the part that is
// easy to get subtly wrong is not the gradient — it is the measuring:
// the slack for fractional heights, and remeasuring when the content
// reflows. Two hand-copied versions of that is how this project's photo
// treatment ended up in six files, drifting.
//
// A MASK, NOT AN OVERLAY GRADIENT. An overlay sits on top of the rows,
// catching taps meant for the last one, and it would have to be
// recoloured for every one of the ten palettes. A mask only removes what
// is already painted, so it is theme-blind by construction.
//
// IT MUST TURN OFF AT THE END. A fade that stays on promises a row that
// does not exist, which is a worse lie than the hard edge it replaced.

/** How far above the bottom edge the softening starts. */
type Clearance =
  /** For a surface with the floating dock over its last band: the fade
   *  has to begin above it, or it does its softening in a strip nobody
   *  can see. Was 8rem when the dock was one row of icons; the wheel
   *  carries a row of options and a label as well, so it is taller. */
  | "10rem"
  /** For a plain scrolling card with nothing floating over it. */
  | "3rem"

export type ScrollFade = {
  /** Attach to the scrolling element: `onScroll={fade.onScroll}`. */
  onScroll: () => void
  /** Spread into the same element's `style`. Empty at the end of the list. */
  style: CSSProperties
  /** Exposed for tests and for callers that want a rule instead of a fade. */
  moreBelow: boolean
}

/**
 * The CALLER owns the ref, and passes it in.
 *
 * Returning it from here would be tidier to write and wrong to use: the
 * dock's sheet is both the focus trap's container and the scrolling
 * surface, so it needs the ref for two purposes, and `react-hooks/refs`
 * rightly objects to a hook's return value being unpacked during render
 * once a ref is inside it.
 */
export function useScrollFade<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    active = true,
    clearance = "3rem",
  }: {
    /** False while the surface is unmounted or closed — skips the observer. */
    active?: boolean
    clearance?: Clearance
  } = {}
): ScrollFade {
  const [moreBelow, setMoreBelow] = useState(false)

  const measure = useCallback(() => {
    const el = ref.current
    // 8px of slack: a fractional scrollHeight — which `dvh` and `svh`
    // units produce routinely — would otherwise leave the fade on at the
    // very bottom of the list.
    setMoreBelow(!!el && el.scrollHeight - el.scrollTop - el.clientHeight > 8)
  }, [ref])

  useEffect(() => {
    if (!active) return
    measure()
    const el = ref.current
    if (!el) return
    // One measurement at mount is not enough: these surfaces animate
    // their height in, and their content reflows when the visitor flips
    // language under them.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [active, measure, ref])

  const mask = `linear-gradient(to bottom, #000 calc(100% - ${clearance}), rgb(0 0 0 / 0.15) 100%)`

  return {
    onScroll: measure,
    style: moreBelow ? { maskImage: mask, WebkitMaskImage: mask } : {},
    moreBelow,
  }
}
