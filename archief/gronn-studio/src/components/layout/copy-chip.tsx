"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { useT } from "@/components/language-provider"
import { cn } from "@/lib/utils"

// A registration number you can lift out with one tap.
//
// WHY THIS EXISTS. A KVK or BTW number is not read, it is TRANSCRIBED —
// into a client's accounting system, a supplier's form, a bookkeeper's
// mail. Fourteen characters of `NL005473265B04` typed by hand off a
// phone screen is where a digit goes missing, and the person who pays
// for that mistake is not the one who made it.
//
// So each value is its own control. Not one "copy all" button: nobody
// wants both numbers in one blob, and a chip that copies more than it
// shows is a chip that pastes something unexpected.
//
// `data-sensitive` stays on the value. The recording toggle blurs
// business credentials so the owner can share his screen without
// broadcasting them, and a number is exactly what that is for.

export function CopyChip({ label, value }: { label: string; value: string }) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // A pending timeout that fires after unmount sets state on a component
  // that is gone — harmless in practice, noisy in a console, and free to
  // avoid.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = async () => {
    if (timer.current) clearTimeout(timer.current)
    try {
      // Absent over plain http and in a few locked-down browsers, so its
      // absence is a state rather than a crash: the number stays on
      // screen and stays selectable by hand.
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setFailed(false)
    } catch {
      setCopied(false)
      setFailed(true)
    }
    timer.current = setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t({
        en: `Copy ${label} number ${value}`,
        nl: `${label}-nummer ${value} kopiëren`,
      })}
      className={cn(
        "tap-target group/chip inline-flex items-center gap-2 rounded-full",
        "border border-line/20 bg-surface/60 px-3.5 py-1.5",
        "font-mono text-xs transition-colors",
        "hover:border-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
      )}
    >
      <span className="text-muted">{label}</span>
      <span data-sensitive className="text-foreground/80">
        {value}
      </span>
      {copied ? (
        <CheckIcon size={13} aria-hidden className="shrink-0 text-accent" />
      ) : (
        <CopyIcon
          size={13}
          aria-hidden
          className="shrink-0 text-muted transition-colors group-hover/chip:text-gronn-ember"
        />
      )}
      {/* Announced, not just drawn: the icon swap is invisible to a
          screen reader, and "did that work?" is the whole question a
          copy button has to answer. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied
          ? t({ en: "Copied", nl: "Gekopieerd" })
          : failed
            ? t({ en: "Could not copy", nl: "Kopiëren lukte niet" })
            : ""}
      </span>
    </button>
  )
}
