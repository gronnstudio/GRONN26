"use client"

import { useEffect, useRef, type RefObject } from "react"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Focus containment for the site's overlay dialogs (curtain menu, dock
// sheet). While `active`: Tab wraps inside the container, Escape calls
// `onEscape`, and elements under an [inert] ancestor don't count. On
// deactivate, focus returns to wherever it was before the dialog opened
// — the trigger button, per the ARIA dialog pattern.
//
// `alsoRef` is a SECOND container that counts as inside the dialog. The
// phone dock needs it: its row sits above the open sheet, still lit and
// still tappable, and while a section panel is open it IS the panel's
// switcher. A modal that leaves live controls outside its trap is
// lying about being modal — a keyboard user could see them and never
// reach them.
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
  alsoRef?: RefObject<HTMLElement | null>
) {
  // Latest onEscape without re-running the trap effect per render.
  const escapeRef = useRef(onEscape)
  useEffect(() => {
    escapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement | null

    // Both roots, in DOM order: the dialog first, then the dock, which
    // is what the document order already is.
    const roots = () =>
      [ref.current, alsoRef?.current].filter((r): r is HTMLElement => !!r)

    const focusables = () =>
      roots().flatMap((root) =>
        Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => !el.closest("[inert]") && el.offsetParent !== null
        )
      )

    const inside = (el: Element | null) =>
      !!el && roots().some((root) => root.contains(el))

    // If opening left focus outside the dialog, move it to the first
    // control inside (the trigger usually already sits inside the trap).
    if (ref.current && !inside(document.activeElement)) {
      focusables()[0]?.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        escapeRef.current?.()
        return
      }
      if (e.key !== "Tab") return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement as HTMLElement | null
      if (e.shiftKey && (current === first || !inside(current))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || !inside(current))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      // Restore focus to the opener; guard against it having unmounted.
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [ref, alsoRef, active])
}
