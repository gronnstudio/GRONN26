"use client"

import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"

import { CONTROL_H, control, controlPrimary } from "@/app/dashboard/document-toolbar/controls"
import { downloadText, fileName } from "@/lib/download"
import { legalToText, type LegalDocument } from "@/lib/data/legal"
import { LegalSheet } from "../legal-sheet"
import { cn } from "@/lib/utils"

// De schil om het vel: een balk die bij het afdrukken verdwijnt.
//
// `doc-chrome` en `doc-stage` zijn dezelfde klassen die de offertebouwer
// gebruikt, dus de printregels in globals.css gelden hier zonder dat er
// iets nieuws bij hoeft — inclusief de reparatie die de themagrond wit
// dwingt, want anders drukt Blue Hour mee onder de laatste pagina.
export function LegalPrint({ doc }: { doc: LegalDocument }) {
  return (
    <div className="min-h-svh bg-gronn-mineral/15">
      <div className="doc-chrome sticky top-0 z-10 flex items-center gap-2 border-b border-line/15 bg-background/95 px-5 py-3 backdrop-blur-sm">
        <Link
          href="/dashboard/kleine-letters"
          className={cn(control, CONTROL_H, "tap-target inline-flex items-center gap-1.5")}
        >
          <ArrowLeftIcon size={14} aria-hidden />
          Kleine letters
        </Link>

        <span className="ml-1 min-w-0 flex-1 truncate text-[13px] text-muted">
          {doc.title}
        </span>

        <button
          type="button"
          onClick={() =>
            downloadText(
              fileName(["GRONN", doc.title, doc.updated], "txt"),
              legalToText(doc),
              "text/plain"
            )
          }
          className={cn(control, CONTROL_H, "tap-target")}
        >
          Als tekst
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(controlPrimary, CONTROL_H, "tap-target inline-flex items-center gap-1.5")}
        >
          <PrinterIcon size={14} aria-hidden />
          Afdrukken naar pdf
        </button>
      </div>

      <div className="doc-stage flex min-w-0 justify-center overflow-x-auto p-4 sm:p-7">
        <LegalSheet doc={doc} />
      </div>
    </div>
  )
}
