"use client"

import type { SaveState } from "@/lib/document-store"
import { cn } from "@/lib/utils"

// What the archive is doing, in one line.
//
// Thirteen different texts can land here — the six `SaveState` values
// plus a local channel carrying "Nieuw document", "Kopie gemaakt",
// "Bestand geopend" and the rest. In a bar laid out by flex that made
// the buttons beside it shuffle sideways every time the message changed.
// So the slot has a fixed width and the text truncates inside it; the
// full string stays available as a title.
//
// The failed states are the loud ones. An administration that claims to
// be saved when it is not is worse than one that says nothing, so
// `error` and `conflict` take the ember text colour while everything
// else stays muted.
export function SyncStatus({
  save,
  status,
}: {
  save: SaveState
  /** The builder's own transient line, shown when the store is idle. */
  status: string
}) {
  const message =
    save === "loading"
      ? "Archief laden…"
      : save === "saving"
        ? "Opslaan…"
        : save === "saved"
          ? "Opgeslagen"
          : save === "error"
            ? "Niet opgeslagen — controleer je verbinding"
            : save === "conflict"
              ? "Een ander tabblad was je voor — deze lijst is bijgewerkt"
              : status

  const loud = save === "error" || save === "conflict"

  return (
    <p
      aria-live="polite"
      title={message || undefined}
      className={cn(
        // Its own row on a phone, where the actions wrap below it.
        "flex min-w-0 items-center gap-1.5 font-mono text-[11px] leading-tight max-lg:basis-full lg:ml-auto",
        loud ? "text-[color:var(--ember-text)]" : "text-muted"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          save === "saved" && "bg-gronn-green",
          loud && "bg-gronn-ember",
          (save === "saving" || save === "loading") && "bg-muted",
          save === "idle" && "bg-transparent"
        )}
      />
      <span className="truncate">{message}</span>
    </p>
  )
}
