"use client"

import { ChevronDownIcon } from "lucide-react"

import type { StudioDocument } from "@/lib/documents"
import { cn } from "@/lib/utils"
import { CONTROL_H, control } from "./controls"

// The picker. One row per stored document, plus the draft when it has
// not been saved yet.
//
// The label is the only thing that tells two documents apart at a
// glance, so it carries the number, the kind, the client and — for an
// invoice — whether it is paid. It used to be capped at `max-w-56`,
// which cut the client's name mid-word ("2026-0002 — factuur · Nic").
// It is wider now and truncates only when it genuinely must.
//
// A native <select> rather than a custom listbox, deliberately: it gets
// keyboard behaviour, type-ahead and the platform's own long-list
// scrolling for free, and this is a control the owner uses all day. The
// chevron is drawn over it because `appearance-none` removes the
// platform arrow along with the platform styling.
export function DocumentSelector({
  documents,
  current,
  isDraft,
  onOpen,
}: {
  documents: StudioDocument[]
  current: StudioDocument
  /** The open document exists only in memory, so it needs its own row. */
  isDraft: boolean
  onOpen: (id: string) => void
}) {
  return (
    <div className={cn(CONTROL_H, "relative min-w-0 shrink")}>
      <label htmlFor="doc-picker" className="sr-only">
        Opgeslagen documenten
      </label>
      <select
        id="doc-picker"
        value={current.id}
        onChange={(event) => onOpen(event.target.value)}
        className={cn(
          control,
          CONTROL_H,
          // 16px below `lg`: iOS zooms the page in on a select under
          // 16px as readily as on a text field.
          "w-full min-w-0 appearance-none pr-10 text-left max-lg:text-base"
        )}
      >
        {isDraft && (
          <option value={current.id}>{current.number} — nieuw</option>
        )}
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.number} — {doc.kind}
            {doc.client ? ` · ${doc.client.split("\n")[0]}` : ""}
            {doc.kind === "factuur" ? (doc.paid ? " · betaald" : " · open") : ""}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  )
}
