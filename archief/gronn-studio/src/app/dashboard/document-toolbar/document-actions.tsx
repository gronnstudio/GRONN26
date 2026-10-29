"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"
import { CONTROL_H, control, controlPrimary } from "./controls"

// The three right-hand actions.
//
// The file input lives here, once. It used to be declared twice in
// document-builder.tsx — in the empty state and again in the toolbar —
// which never collided only because the empty state returns early. Two
// declarations of one control is a second one waiting to drift.
export function DocumentActions({
  onExport,
  onExportAll,
  onImport,
  onPrint,
}: {
  onExport: () => void
  /** De hele administratie als back-up. */
  onExportAll: () => void
  onImport: (file: File) => void
  onPrint: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    // Wraps on a phone (below `lg`), two buttons to a row at 390px; from
    // `lg` the toolbar's no-wrap rule holds.
    <div className="flex shrink-0 items-center gap-2 max-lg:shrink max-lg:flex-wrap">
      <button
        type="button"
        onClick={onExport}
        className={cn(control, CONTROL_H)}
      >
        Opslaan als bestand
      </button>
      <button
        type="button"
        onClick={onExportAll}
        className={cn(control, CONTROL_H)}
        title="De hele administratie als één bestand — een back-up van de stand van vandaag"
      >
        Alles opslaan
      </button>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className={cn(control, CONTROL_H)}
      >
        Bestand openen
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onImport(file)
          // Cleared so choosing the same file twice fires again.
          event.target.value = ""
        }}
      />
      <button
        type="button"
        onClick={onPrint}
        className={cn(controlPrimary, CONTROL_H)}
      >
        Afdrukken naar pdf
      </button>
    </div>
  )
}
