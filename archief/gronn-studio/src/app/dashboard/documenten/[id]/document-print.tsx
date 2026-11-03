"use client"

import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"

import { CONTROL_H, control, controlPrimary } from "@/app/dashboard/document-toolbar/controls"
import { DocumentSheet } from "@/app/dashboard/document-sheet"
import { downloadText, fileName } from "@/lib/download"
import { documentBaseName, type StudioDocument } from "@/lib/documents"
import { cn } from "@/lib/utils"

// De schil om het vel: een balk die bij het afdrukken verdwijnt.
//
// Eén op één dezelfde vorm als `legal-print.tsx` hiernaast, en met
// opzet: twee vellen van dezelfde studio die verschillend zijn ingelijst
// zien er niet uit als één huis. `doc-chrome` en `doc-stage` zijn de
// klassen die de offertebouwer ook gebruikt, dus de printregels uit
// globals.css gelden hier zonder dat er iets nieuws bij hoeft —
// inclusief de reparatie die de themagrond wit dwingt.
//
// De downloadknop geeft json en geen tekst. Bij een juridisch document
// is platte tekst wat je doorstuurt; bij een offerte is het vel wat je
// doorstuurt (afdrukken → bewaren als pdf) en is het bestand een
// reservekopie van de gegevens. Twee verschillende dingen, twee
// verschillende knoppen.
export function DocumentPrint({
  doc,
  iban,
  unreadable,
}: {
  doc: StudioDocument | null
  iban: string
  unreadable?: boolean
}) {
  if (unreadable || !doc) {
    return (
      <div className="grid min-h-svh place-items-center bg-gronn-mineral/15 px-6">
        <div className="max-w-sm text-center">
          <p className="font-heading text-lg font-semibold">
            Het archief kon nu niet gelezen worden
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Dat betekent niet dat dit document weg is — alleen dat het nu niet
            opgehaald kon worden.
          </p>
          <Link
            href="/dashboard/documenten"
            className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-gronn-ember"
          >
            Terug naar documenten
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gronn-mineral/15">
      <div className="doc-chrome sticky top-0 z-10 flex items-center gap-2 border-b border-line/15 bg-background/95 px-5 py-3 backdrop-blur-sm">
        <Link
          href="/dashboard/documenten"
          className={cn(control, CONTROL_H, "tap-target inline-flex items-center gap-1.5")}
        >
          <ArrowLeftIcon size={14} aria-hidden />
          Documenten
        </Link>

        <span className="ml-1 min-w-0 flex-1 truncate text-[13px] text-muted">
          {doc.number}
        </span>

        <button
          type="button"
          onClick={() =>
            downloadText(
              fileName(documentBaseName(doc), "json"),
              JSON.stringify(doc, null, 2),
              "application/json"
            )
          }
          className={cn(control, CONTROL_H, "tap-target")}
        >
          Bestand
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
        <DocumentSheet doc={doc} iban={iban} />
      </div>
    </div>
  )
}
