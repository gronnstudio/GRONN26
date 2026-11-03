"use client"

import type { DocKind, StudioDocument } from "@/lib/documents"
import type { SaveState } from "@/lib/document-store"
import { cn } from "@/lib/utils"
import { CONTROL_H, TOOLBAR_H, control } from "./controls"
import { DocumentActions } from "./document-actions"
import { DocumentSelector } from "./document-selector"
import { DocumentTypeToggle } from "./document-type-toggle"
import { SyncStatus } from "./sync-status"

// The document workspace's toolbar.
//
// Three things about the shape are load-bearing, and each replaces a
// defect rather than a preference:
//
//  · It sits at `top-[var(--panel-topbar-h)]`, not `top-0`. The shell's
//    own bar is also sticky at `top-0`, so this one used to slide
//    underneath it on scroll.
//
//  · It does NOT wrap. `flex-wrap` let the bar become two rows in the
//    1024–1200px band, while the editor column beside it stayed pinned
//    to a single hardcoded height and misaligned. The spec asks for
//    horizontal overflow instead of a reflow, which is also the honest
//    answer for a desktop-only tool.
//
//  · Its height is one declared number (`--panel-toolbar-h`) that the
//    editor column reads too, so the two cannot disagree again.
//
// All three hold from `lg` up. Below it — a phone, since the owner asked
// on 25 Sep 2026 to use the whole dashboard there — none of the reasons
// apply: the editor column is not sticky, and the phone strip already
// sticks at `--panel-topbar-h`, so a second sticky bar there would slide
// underneath it and hide both. So on a phone the bar scrolls away with
// the page and WRAPS: the picker takes its own row, and "Afdrukken naar
// pdf" stays on screen instead of 400px off to the right.
export function DocumentToolbar({
  documents,
  current,
  isDraft,
  save,
  status,
  onSelectKind,
  onOpen,
  onNew,
  onExport,
  onExportAll,
  onImport,
  onPrint,
}: {
  documents: StudioDocument[]
  current: StudioDocument
  isDraft: boolean
  save: SaveState
  status: string
  onSelectKind: (kind: DocKind) => void
  onOpen: (id: string) => void
  onNew: () => void
  onExport: () => void
  onExportAll: () => void
  onImport: (file: File) => void
  onPrint: () => void
}) {
  return (
    <div
      className={cn(
        TOOLBAR_H,
        "doc-chrome z-20 flex flex-col justify-center gap-2 border-b border-line/15 bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6",
        "lg:sticky lg:top-[var(--panel-topbar-h)] lg:overflow-x-auto lg:py-0"
      )}
    >
      {/* Row one: which document. */}
      <div className="flex items-center gap-2.5 max-lg:flex-wrap">
        <DocumentTypeToggle kind={current.kind} onSelect={onSelectKind} />

        {/* `lg:contents`: from `lg` this wrapper is not there and the
            picker is the flex item it always was. Below, it is the one
            that drops to its own full row. */}
        <div className="min-w-0 max-lg:order-last max-lg:basis-full lg:contents">
          <DocumentSelector
            documents={documents}
            current={current}
            isDraft={isDraft}
            onOpen={onOpen}
          />
        </div>

        <button
          type="button"
          onClick={onNew}
          className={cn(control, CONTROL_H, "shrink-0")}
        >
          Nieuw
        </button>
      </div>

      {/* Row two: what is happening to it, and what you can do with it.
          Two rows rather than one because all six controls on a single
          line squeezed the status to nothing — at 1440px the bar showed
          a green dot with no word beside it, which is exactly the state
          this readout exists to report. */}
      <div className="flex items-center gap-2.5 max-lg:flex-wrap">
        <SyncStatus save={save} status={status} />
        <DocumentActions
          onExport={onExport}
          onExportAll={onExportAll}
          onImport={onImport}
          onPrint={onPrint}
        />
      </div>
    </div>
  )
}
