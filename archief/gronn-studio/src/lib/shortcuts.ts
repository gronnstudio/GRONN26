import type { L } from "@/lib/i18n"
import { SECTIONS } from "@/lib/nav"

// The site's keyboard shortcuts, in one place.
//
// Two kinds, and the difference is not cosmetic:
//
//  · CHORDED — ⌘K / Ctrl-K. Holds a modifier, so it cannot be fired by
//    a stray keypress or by speech input dictating a word. WCAG 2.1.4
//    does not cover these, and they stay on always.
//
//  · SINGLE-KEY — `/`, `?`, and `g` followed by a digit. These ARE
//    covered by 2.1.4 Character Key Shortcuts (Level A), which requires
//    that they can be turned off, remapped, or confined to focus. This
//    site had `/` with none of the three. Turning them off is the route
//    taken; the switch lives with the other accessibility preferences.
//
// `g` then a digit is a SEQUENCE rather than a chord — the two keys are
// pressed one after the other, the way GitHub's `g c` works. It is still
// a character shortcut and still behind the switch.

/** Milliseconds a `g` stays armed before it is forgotten. */
export const SEQUENCE_WINDOW = 1200

export type Shortcut = {
  /** How the keys are written on the help sheet. */
  keys: string[]
  label: L
}

/**
 * True when the keystroke belongs to something the visitor is typing
 * into, and must not be stolen.
 *
 * One implementation, used by every binding. The search palette had its
 * own copy of this test, which is exactly how two of them drift.
 */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable ||
    // A custom control that has opted into text entry.
    target.getAttribute("role") === "textbox" ||
    target.getAttribute("role") === "searchbox"
  )
}

/** The five sections, numbered as they are on the help sheet. */
export function sectionShortcuts(): { digit: string; href: string; label: L }[] {
  return SECTIONS.map((section, i) => ({
    digit: String(i + 1),
    href: section.href,
    label: section.label,
  }))
}

export function shortcutGroups(): { title: L; items: Shortcut[] }[] {
  return [
    {
      title: { en: "Anywhere", nl: "Overal" },
      items: [
        {
          keys: ["⌘", "K"],
          label: { en: "Search this site", nl: "Zoek op deze site" },
        },
        { keys: ["/"], label: { en: "Search this site", nl: "Zoek op deze site" } },
        {
          keys: ["?"],
          label: { en: "This list", nl: "Deze lijst" },
        },
        {
          keys: ["Esc"],
          label: { en: "Close what is open", nl: "Sluit wat openstaat" },
        },
      ],
    },
    {
      title: { en: "Go to", nl: "Ga naar" },
      items: [
        {
          keys: ["g", "h"],
          label: { en: "Home", nl: "Home" },
        },
        ...sectionShortcuts().map((section) => ({
          keys: ["g", section.digit],
          label: section.label,
        })),
      ],
    },
  ]
}
