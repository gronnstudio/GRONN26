"use client"

import { useState } from "react"

import { blankDocument, type DocKind, type StudioDocument } from "@/lib/documents"
import type { SaveState } from "@/lib/document-store"
import { DocumentToolbar } from "../document-toolbar"

// A harness for looking at the toolbar.
//
// `TIMEVAULT/PROBLEMS.md` opens with "the recurring one: building is not
// looking" — three defects in one week shipped because the check
// performed was "does it build". The panel is behind Google sign-in, so
// the one screen that most needed looking at was the hardest to see.
//
// This renders the toolbar alone, with invented documents, and touches
// nothing: no session, no archive, no writes. It is not a way past the
// gate — there is no gate here to pass, because there is nothing behind
// it. The page that mounts it refuses to exist on Vercel.
export function PreviewToolbar() {
  const [docs] = useState<StudioDocument[]>(() => {
    const quote = blankDocument("offerte")
    const invoice = blankDocument("factuur", [quote])
    const second = blankDocument("offerte", [quote, invoice])
    return [
      { ...invoice, client: "Nick Vermeulen\nStein", number: "2026-0002" },
      { ...quote, client: "Familie De Groot\nElsloo", number: "2026-0001" },
      { ...second, client: "Gemeente Beek", number: "2026-0003" },
    ]
  })
  const [openId, setOpenId] = useState(() => docs[0].id)
  const [save, setSave] = useState<SaveState>("saved")
  const [status, setStatus] = useState("")

  const current = docs.find((d) => d.id === openId) ?? docs[0]

  return (
    <>
      <DocumentToolbar
        documents={docs}
        current={current}
        isDraft={false}
        save={save}
        status={status}
        onSelectKind={(kind: DocKind) =>
          setStatus(
            kind === current.kind
              ? ""
              : "Een verstuurd factuurnummer blijft staan — maak een nieuwe offerte"
          )
        }
        onOpen={setOpenId}
        onNew={() => setStatus("Nieuw document")}
        onExport={() => setStatus("Bestand opgeslagen")}
        onExportAll={() => {}}
        onImport={() => setStatus("Bestand geopend")}
        onPrint={() => setStatus("")}
      />
      <div className="p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Preview — verzonnen documenten, niets wordt opgeslagen
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["idle", "loading", "saving", "saved", "error", "conflict"] as const).map(
            (state) => (
              <button
                key={state}
                type="button"
                onClick={() => setSave(state)}
                className="rounded-lg border border-line/20 px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-gronn-green hover:text-foreground"
              >
                {state}
              </button>
            )
          )}
        </div>
      </div>
    </>
  )
}
