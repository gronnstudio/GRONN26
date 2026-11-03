"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { useLanguage, useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { localePath } from "@/lib/locale"
import {
  isTyping,
  SEQUENCE_WINDOW,
  sectionShortcuts,
  shortcutGroups,
} from "@/lib/shortcuts"
import { useShortcutsPref } from "@/lib/use-a11y-prefs"
import { useFocusTrap } from "@/lib/use-focus-trap"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Keyboard navigation, and the sheet that tells you it exists.
//
// `g` then a digit jumps to a section, `g h` goes home, `?` opens this
// list. All of them are single-character shortcuts and all of them are
// behind the accessibility switch, because WCAG 2.1.4 (Level A) says a
// character shortcut must be turn-off-able, remappable, or confined to
// focus — and this site previously shipped `/` with none of the three.
//
// A shortcut nobody can discover is a shortcut nobody has. `?` is
// listed in the accessibility panel next to its own switch, which is
// the one place a visitor goes looking for exactly this.

export function Shortcuts() {
  const router = useRouter()
  const { locale } = useLanguage()
  const [enabled] = useShortcutsPref()
  const [helpOpen, setHelpOpen] = useState(false)

  // The pending `g`. A ref rather than state: it must not re-render
  // anything, and it is read inside the handler that sets it.
  const armed = useRef<number | null>(null)

  const go = useCallback(
    (href: string) => {
      armed.current = null
      router.push(localePath(locale, href))
    },
    [locale, router]
  )

  useEffect(() => {
    if (!enabled) return

    const onKey = (e: KeyboardEvent) => {
      // Never steal a keystroke from something being typed into, and
      // never from a chord — Ctrl-G is the browser's, not ours.
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return

      const now = Date.now()
      const isArmed =
        armed.current !== null && now - armed.current < SEQUENCE_WINDOW

      if (isArmed) {
        const key = e.key.toLowerCase()
        if (key === "h") {
          e.preventDefault()
          go("/")
          return
        }
        const section = sectionShortcuts().find((s) => s.digit === key)
        if (section) {
          e.preventDefault()
          go(section.href)
          return
        }
        // Anything else cancels the sequence rather than waiting it
        // out, so a stray `g` cannot swallow the next real keystroke.
        armed.current = null
        return
      }

      if (e.key === "g") {
        armed.current = now
        return
      }
      if (e.key === "?") {
        e.preventDefault()
        setHelpOpen(true)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled, go])

  // Turning the shortcuts off mid-sequence must not leave one armed.
  useEffect(() => {
    if (!enabled) armed.current = null
  }, [enabled])

  return (
    <AnimatePresence>
      {helpOpen && <ShortcutHelp onClose={() => setHelpOpen(false)} />}
    </AnimatePresence>
  )
}

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const t = useT()
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, true, onClose)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] grid place-items-center bg-gronn-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: reduced ? 0 : 0.28, ease: EASE_REVEAL }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-xl border border-line/15 bg-background p-7 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)] sm:p-9"
      >
        <div className="flex items-start justify-between gap-6">
          <h2
            id="shortcut-help-title"
            className="font-heading text-xl font-semibold tracking-tight"
          >
            {t({ en: "Keyboard shortcuts", nl: "Sneltoetsen" })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="tap-target -m-2 rounded-full p-2 text-muted transition-colors hover:text-gronn-ember"
            aria-label={t({ en: "Close", nl: "Sluiten" })}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {shortcutGroups().map((group) => (
          <section key={group.title.en} className="mt-8 first:mt-7">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {t(group.title)}
            </h3>
            <dl className="mt-3">
              {group.items.map((item) => (
                <div
                  key={item.keys.join("+") + item.label.en}
                  className="flex items-center justify-between gap-6 border-b border-line/10 py-2.5 last:border-b-0"
                >
                  <dt className="text-[15px] text-foreground/85">
                    {t(item.label)}
                  </dt>
                  <dd className="flex shrink-0 items-center gap-1">
                    {item.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="rounded border border-line/25 px-1.5 py-0.5 font-mono text-[11px] text-muted"
                      >
                        {key}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <p className="mt-8 text-[13px] leading-relaxed text-muted">
          {t({
            en: "Every single-key shortcut here can be switched off under the accessibility control in the header. ⌘K keeps working either way — it holds a modifier, so nothing can trigger it by accident.",
            nl: "Elke sneltoets van één teken hier kun je uitzetten bij de toegankelijkheidsknop in de balk. ⌘K blijft altijd werken — die houdt een modifier vast, dus niets kan hem per ongeluk activeren.",
          })}
        </p>
      </motion.div>
    </motion.div>
  )
}
