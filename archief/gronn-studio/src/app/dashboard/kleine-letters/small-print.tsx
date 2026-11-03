"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRightIcon, CircleAlertIcon, CircleCheckIcon, DownloadIcon, PrinterIcon } from "lucide-react"

import { cardPad, cardTitle, emptyState, label as labelClass } from "@/app/dashboard/ui"
import { legalToText, openPlaces, type LegalDocument } from "@/lib/data/legal"
import { downloadText, fileName } from "@/lib/download"
import { cn } from "@/lib/utils"

// Kleine letters — de eigenaarskant van de juridische documenten.
//
// Eén scherm dat drie vragen beantwoordt, in deze volgorde, want dit is de
// volgorde waarin ze gesteld worden:
//
//   1. Wat staat er, en is het al getoetst?
//   2. Wat moet ik nog doen?  (per document, als lijst)
//   3. Waar heeft de tekst nog een gat?  (de `[[plekken]]`)
//
// Vraag 2 en 3 zijn niet hetzelfde. Een taak als "vraag je verzekeraar het
// dekkingsbedrag" laat een gat achter in de lopende tekst; een taak als
// "laten toetsen door een jurist" niet. Ze samentellen zou een getal
// opleveren dat geen van beide vragen beantwoordt.
//
// Nederlandse teksten, geen useT(): net als elk ander scherm onder
// /dashboard.

const AUDIENCE: Record<LegalDocument["audience"], string> = {
  consument: "Particulier",
  zakelijk: "Zakelijk",
  iedereen: "Iedereen",
}

export function SmallPrint({ documents }: { documents: LegalDocument[] }) {
  const [open, setOpen] = useState<string | null>(documents[0]?.id ?? null)

  const totalOpen = documents.reduce((n, d) => n + d.open.length, 0)
  const totalGaps = documents.reduce((n, d) => n + openPlaces(d).length, 0)
  const reviewed = documents.filter((d) => d.status === "vastgesteld").length

  return (
    <main className="w-full px-5 py-6 sm:px-6 sm:py-7">
      <header className="max-w-2xl">
        <h1 className="font-heading text-2xl font-semibold">Kleine letters</h1>
        <p className="mt-3 leading-relaxed text-muted">
          De voorwaarden, de privacyverklaring en de portaalregels. Ze staan in de
          repo en gaan door een commit — hier lees je wat er nog open staat, je
          wijzigt ze niet vanaf dit scherm.
        </p>
      </header>

      {/* Drie cijfers, en het derde is degene die telt: hoeveel documenten
          een jurist werkelijk heeft gezien. Zolang dat er nul zijn, is de
          rest voorbereiding. */}
      <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-line/15 bg-line/15 sm:grid-cols-3">
        <Figure n={documents.length} label="documenten" />
        <Figure n={totalOpen} label="punten open" loud={totalOpen > 0} />
        <Figure
          n={`${reviewed}/${documents.length}`}
          label="juridisch getoetst"
          loud={reviewed < documents.length}
        />
      </div>

      {totalGaps > 0 && (
        <p className="mt-4 text-[13px] leading-relaxed text-muted">
          Daarnaast staan er <b className="font-medium text-foreground">{totalGaps}</b>{" "}
          open plekken in de lopende tekst — plaatsen waar een bedrag, een termijn
          of een naam nog ontbreekt. Die zijn hieronder per document te zien.
        </p>
      )}

      {/* Eén bestand met alles erin, voor wie het geheel doorstuurt naar
          een jurist. Vier losse downloads zijn vier bijlagen die apart
          kunnen zoekraken. */}
      <button
        type="button"
        onClick={() =>
          downloadText(
            fileName(["GRONN", "kleine-letters", documents[0]?.updated], "txt"),
            documents.map(legalToText).join("\n\n" + "—".repeat(60) + "\n\n"),
            "text/plain"
          )
        }
        className={cn(
          "tap-target mt-7 inline-flex items-center gap-1.5 text-[14px]",
          "transition-colors hover:text-gronn-ember active:text-gronn-ember"
        )}
      >
        <DownloadIcon size={14} aria-hidden />
        Alle vier als één tekstbestand
      </button>

      <div className="mt-8 space-y-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            open={open === doc.id}
            onToggle={() => setOpen(open === doc.id ? null : doc.id)}
          />
        ))}
      </div>

      {documents.length === 0 && (
        <div className={emptyState}>Er staan nog geen documenten in de catalogus.</div>
      )}
    </main>
  )
}

function Figure({
  n,
  label,
  loud,
}: {
  n: number | string
  label: string
  loud?: boolean
}) {
  return (
    <div className="bg-background p-4">
      <div
        className={cn(
          "font-heading text-2xl font-semibold tabular-nums",
          loud ? "text-[color:var(--ember-text)]" : "text-foreground"
        )}
      >
        {n}
      </div>
      <div className={cn(labelClass, "mt-1")}>{label}</div>
    </div>
  )
}

function DocumentCard({
  doc,
  open,
  onToggle,
}: {
  doc: LegalDocument
  open: boolean
  onToggle: () => void
}) {
  const gaps = openPlaces(doc)
  const settled = doc.status === "vastgesteld"

  return (
    <article className="overflow-hidden rounded-lg border border-line/15 bg-surface/40">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          cardPad,
          "flex w-full items-start gap-4 text-left",
          "transition-colors hover:bg-surface/70 active:bg-surface/70"
        )}
      >
        <span className="mt-0.5 shrink-0">
          {settled ? (
            <CircleCheckIcon size={17} className="text-gronn-green" aria-hidden />
          ) : (
            <CircleAlertIcon
              size={17}
              className="text-[color:var(--ember-text)]"
              aria-hidden
            />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className={cn(cardTitle, "block")}>{doc.title}</span>
          <span className={cn(labelClass, "mt-1 block")}>
            {AUDIENCE[doc.audience]} · gewijzigd {doc.updated} ·{" "}
            {settled ? "vastgesteld" : "concept"}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span
            className={cn(
              "font-heading text-lg font-semibold tabular-nums",
              doc.open.length ? "text-[color:var(--ember-text)]" : "text-muted"
            )}
          >
            {doc.open.length}
          </span>
          <span className={cn(labelClass, "block")}>open</span>
        </span>
      </button>

      {open && (
        <div className="border-t border-line/12 px-5 pb-5 pt-4 sm:px-6">
          {doc.open.length > 0 && (
            <>
              <h3 className={labelClass}>Wat jij nog moet doen</h3>
              <ol className="mt-3 space-y-2.5">
                {doc.open.map((task, i) => (
                  <li key={task.slice(0, 40)} className="flex gap-3">
                    <span className="mt-px shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--ember-text)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] leading-relaxed text-foreground/85">
                      {task}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {gaps.length > 0 && (
            <>
              <h3 className={cn(labelClass, "mt-6")}>
                Open plekken in de tekst ({gaps.length})
              </h3>
              <ul className="mt-3 space-y-1.5">
                {gaps.map((gap, i) => (
                  <li key={i} className="text-[13px] leading-relaxed text-muted">
                    <span className="font-mono text-[color:var(--ember-text)]">
                      [[{gap.what}]]
                    </span>{" "}
                    — {gap.where}
                  </li>
                ))}
              </ul>
            </>
          )}

          {doc.open.length === 0 && gaps.length === 0 && (
            <p className="text-[14px] leading-relaxed text-muted">
              Niets open. Dit document is af.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={`/dashboard/kleine-letters/${doc.slug}`}
              className={cn(
                "tap-target inline-flex items-center gap-1.5 text-[14px] font-medium",
                "transition-colors hover:text-gronn-ember active:text-gronn-ember"
              )}
            >
              <PrinterIcon size={14} aria-hidden />
              Afdrukken naar pdf
            </Link>

            <button
              type="button"
              onClick={() =>
                downloadText(
                  fileName(["GRONN", doc.title, doc.updated], "txt"),
                  legalToText(doc),
                  "text/plain"
                )
              }
              className={cn(
                "tap-target inline-flex items-center gap-1.5 text-[14px]",
                "transition-colors hover:text-gronn-ember active:text-gronn-ember"
              )}
            >
              <DownloadIcon size={14} aria-hidden />
              Als tekst
            </button>

            <Link
              href={`/nl/${doc.slug}`}
              className={cn(
                "tap-target inline-flex items-center gap-1.5 text-[14px] text-muted",
                "transition-colors hover:text-gronn-ember active:text-gronn-ember"
              )}
            >
              Zoals de klant hem ziet
              <ArrowUpRightIcon size={13} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
