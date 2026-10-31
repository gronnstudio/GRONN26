"use client"

import type { DocKind } from "@/lib/documents"
import { cn } from "@/lib/utils"
import { CONTROL_H } from "./controls"

// Offerte | Factuur.
//
// Purely presentational: it reports which half was pressed and the
// builder decides what that means. That split is deliberate, because
// what it means is not the same in every case — see `chooseKind` in
// document-builder.tsx. A component that owned the rule would have to
// know about invoice numbering, which is not a toolbar's business.
//
// `tap-target min-w-11` is the pairing globals.css:552-556 requires for
// narrow controls standing next to each other: it lifts the press area
// to 44px without changing the drawn size, and `min-w-11` keeps two
// neighbouring hit areas abutting instead of overlapping.
export function DocumentTypeToggle({
  kind,
  onSelect,
}: {
  kind: DocKind
  onSelect: (kind: DocKind) => void
}) {
  return (
    <div
      role="group"
      aria-label="Documentsoort"
      className={cn(
        CONTROL_H,
        "flex shrink-0 items-center rounded-full bg-surface p-1 ring-1 ring-inset ring-line/15"
      )}
    >
      {(["offerte", "factuur"] as const).map((option) => {
        const active = kind === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={active}
            className={cn(
              "tap-target min-w-11 rounded-full px-4 py-1.5 text-sm capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]",
              active
                ? // The one ember that carries white text at AA. Pure
                  // --gronn-ember is 2.99:1 and is a line colour only.
                  "bg-gronn-ember-strong font-medium text-gronn-white"
                : "text-muted hover:text-foreground active:text-foreground"
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
