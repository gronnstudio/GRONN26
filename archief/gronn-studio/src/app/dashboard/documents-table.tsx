"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react"

import { euro } from "@/lib/format"
import { archive, totals, unarchive, upsert, type StudioDocument } from "@/lib/documents"
import {
  documentsSnapshot,
  hydrate,
  saveStateSnapshot,
  writeDocuments,
} from "@/lib/document-store"
import { cn } from "@/lib/utils"

// The administration as a table.
//
// Until now the only way to see the documents was the `<select>` at the
// top of the builder — one line at a time, no amounts, no dates, no way
// to ask "what is still open". A quote that expired unanswered was
// invisible by construction.
//
// Search, sort and paging are client-side on purpose: the whole
// administration is already in the page, a studio of one will not reach
// the thousands of rows where that stops being true, and a round trip
// per keystroke would be slower than the thing it replaced.

type SortKey = "date" | "amount" | "number"

const PAGE = 8

function value(doc: StudioDocument): number {
  return totals(doc).gross[0] ?? 0
}

function dutch(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "2-digit" })
}

function overdue(doc: StudioDocument, today: number): boolean {
  if (!doc.deadlineISO) return false
  // Een bijlage kan niet te laat zijn: er staat geen schuld op, en de
  // vervaldatum die er eventueel nog in staat hoort bij de factuur van
  // iemand anders.
  if (doc.annex) return false
  if (doc.kind === "factuur" && doc.paid) return false
  const t = new Date(`${doc.deadlineISO}T00:00:00Z`).getTime()
  return !Number.isNaN(t) && t < today
}

/** What this document is, in one chip. */
function Status({ doc, late }: { doc: StudioDocument; late: boolean }) {
  const base =
    "inline-block rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]"
  // Archived wins over paid/overdue: the row is out of the running, and
  // "Te laat" on something the owner deliberately filed away is a
  // reproach for a decision they already made.
  if (doc.archivedAt) {
    return <span className={`${base} border-line/25 text-muted`}>Archief</span>
  }
  if (doc.kind === "factuur") {
    if (doc.paid) return <span className={`${base} border-accent text-accent`}>Betaald</span>
    return late ? (
      <span className={`${base} border-gronn-ember text-[color:var(--ember-text)]`}>
        Te laat
      </span>
    ) : (
      <span className={`${base} border-line/25 text-muted`}>Open</span>
    )
  }
  return late ? (
    <span className={`${base} border-gronn-ember text-[color:var(--ember-text)]`}>
      Verlopen
    </span>
  ) : (
    <span className={`${base} border-line/25 text-muted`}>Offerte</span>
  )
}

export function DocumentsTable({
  documents,
  archived = [],
}: {
  documents: StudioDocument[]
  /**
   * The rows the owner has filed away. A SEPARATE prop rather than a
   * flag on the list, so a caller has to opt in to seeing them — the
   * tiles, the agenda and the search all read `active()` and none of
   * them can accidentally start counting the archive.
   */
  archived?: StudioDocument[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("date")
  const [page, setPage] = useState(0)
  const [showArchive, setShowArchive] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  /**
   * File a document away, or take it back out.
   *
   * Deliberately not a delete. Art. 52 AWR puts a seven-year retention
   * on invoices, so a button that really destroyed one would be a button
   * that can damage the bookkeeping — and the thing the owner actually
   * wants is for an old row to stop being in the way, which is what this
   * does.
   *
   * `hydrate()` first, and a refusal to write on a read error, for the
   * reason the quote builder carries the same two lines: nothing on this
   * page subscribes to the store, so the module cache can be empty, and
   * writing an empty array over the administration is how the whole
   * thing gets erased.
   */
  const setArchived = async (doc: StudioDocument, on: boolean) => {
    if (busy) return
    setBusy(doc.id)
    setFailed(false)
    try {
      await hydrate()
      if (saveStateSnapshot() === "error") throw new Error("archive unreadable")
      const existing = documentsSnapshot()
      const next = on ? archive(doc, new Date().toISOString()) : unarchive(doc)
      if (!writeDocuments(upsert(existing, next))) throw new Error("write refused")
      router.refresh()
    } catch {
      setFailed(true)
    } finally {
      setBusy(null)
    }
  }

  // Midnight today, once — not per row.
  const todayMs = useMemo(() => {
    const d = new Date()
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  }, [])

  const rows = useMemo(() => {
    const source = showArchive ? archived : documents
    const q = query.trim().toLowerCase()
    const filtered = q
      ? source.filter(
          (d) =>
            d.number.toLowerCase().includes(q) ||
            d.client.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q)
        )
      : source
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "amount") return value(b) - value(a)
      if (sort === "number") return b.number.localeCompare(a.number)
      return (b.dateISO || b.updatedAt).localeCompare(a.dateISO || a.updatedAt)
    })
    return sorted
  }, [documents, archived, showArchive, query, sort])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  // A filter that shortens the list can strand you on a page that no
  // longer exists, so the view clamps rather than showing nothing.
  const current = Math.min(page, pages - 1)
  const slice = rows.slice(current * PAGE, current * PAGE + PAGE)

  // No confirmation, on purpose. Archiving is reversible from the very
  // chip above, and a dialog in front of an undoable act only teaches
  // people to dismiss dialogs. One definition for the table row and the
  // phone card alike.
  const archiveButton = (d: StudioDocument) => (
    <button
      type="button"
      onClick={() => setArchived(d, !d.archivedAt)}
      disabled={busy !== null}
      title={
        d.archivedAt
          ? "Terug in de lopende lijst"
          : "Archiveren — blijft bewaard, valt uit de lijst"
      }
      className="tap-target rounded-lg border border-line/20 p-1.5 text-muted transition-colors enabled:hover:border-gronn-ember enabled:hover:text-foreground disabled:opacity-35"
    >
      {d.archivedAt ? <ArchiveRestoreIcon size={15} /> : <ArchiveIcon size={15} />}
      <span className="sr-only">
        {d.archivedAt ? "Haal uit archief" : "Archiveer"} {d.number}
      </span>
    </button>
  )

  return (
    <div className="rounded-xl border border-line/12 bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line/12 px-5 py-4">
        <h2 className="mr-auto font-heading text-base font-semibold tracking-tight">
          De administratie
        </h2>

        {/* On a phone the field takes its own row and 16px text: iOS
            zooms the page in on any field under 16px, and a 208px box
            beside a heading and two chips does not fit 390px anyway. */}
        <label className="relative w-full sm:w-auto">
          <span className="sr-only">Zoek in documenten</span>
          <SearchIcon
            size={14}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Zoek op nummer of klant"
            className="w-full rounded-full border border-line/20 bg-background py-1.5 pl-8 pr-3 text-base text-foreground sm:w-52 sm:text-[13px] outline-none transition-colors placeholder:text-muted/70 focus:border-gronn-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
          />
        </label>

        {/* The select fills the pill rather than sitting in its padding,
            so the part you press is the part you see — 40px on a phone,
            30 from `sm` as before. */}
        <label className="flex items-center gap-1.5 rounded-full border border-line/20 px-3">
          <ArrowUpDownIcon size={13} aria-hidden className="text-muted" />
          <span className="sr-only">Sorteren op</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-h-[40px] bg-transparent text-base text-foreground outline-none sm:min-h-[30px] sm:text-[13px]"
          >
            <option value="date">Datum</option>
            <option value="amount">Bedrag</option>
            <option value="number">Nummer</option>
          </select>
        </label>

        {/* One chip, not a third tab. The archive is a place you visit,
            not a view you have to keep track of being in — so the label
            says which list you are looking at rather than what the
            button will do. */}
        <button
          type="button"
          onClick={() => {
            setShowArchive((v) => !v)
            setPage(0)
          }}
          aria-pressed={showArchive}
          className={cn(
            "tap-target rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]",
            showArchive
              ? "border-gronn-ember text-[color:var(--ember-text)]"
              : "border-line/20 text-muted hover:border-gronn-ember hover:text-foreground"
          )}
        >
          {showArchive ? "Toon lopende" : "Archief"}
          {!showArchive && archived.length > 0 && (
            <span className="ml-1.5 tabular-nums">{archived.length}</span>
          )}
        </button>
      </div>

      {failed && (
        <p className="border-b border-line/12 px-5 py-3 text-[13px] leading-relaxed text-[color:var(--ember-text)]">
          De administratie kon niet gelezen worden, dus er is niets gewijzigd.
          Probeer het zo opnieuw.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-[13px] leading-relaxed text-muted">
          {query ? (
            <>Niets gevonden voor &ldquo;{query}&rdquo;.</>
          ) : showArchive ? (
            <>Het archief is leeg.</>
          ) : (
            <>
              Nog geen offertes of facturen.{" "}
              <Link href="/dashboard/offertes" className="tap-target underline-draw text-foreground">
                Begin er een
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <>
          {/* On a phone: one card per document instead of seven columns.
              The table below is 672px wide and would only fit by
              scrolling sideways inside its card; a phone reads a stack
              faster, and every fact the table has is here too. Two
              renderings of the same rows, never two sources — both map
              `slice`. */}
          <ul className="divide-y divide-line/8 sm:hidden">
            {slice.map((d) => {
              const late = overdue(d, todayMs)
              return (
                <li key={d.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <Link
                        href="/dashboard/offertes"
                        className="tap-target font-mono text-[12.5px] tabular-nums text-foreground transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
                      >
                        {d.number}
                      </Link>
                      <Status doc={d} late={late} />
                    </p>
                    <p className="mt-1 truncate text-[13px] text-foreground">
                      {d.client.split("\n")[0] || d.title || "—"}
                    </p>
                    <p className="mt-1 font-mono text-[11px] tabular-nums text-muted">
                      {dutch(d.dateISO)}
                      {d.deadlineISO && (
                        <>
                          {" · vervalt "}
                          <span className={late ? "text-[color:var(--ember-text)]" : undefined}>
                            {dutch(d.deadlineISO)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="font-mono text-[12.5px] tabular-nums text-foreground">
                      {euro(value(d))}
                    </span>
                    {archiveButton(d)}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/12">
                  {["Nummer", "Klant", "Status", "Bedrag", "Datum", "Vervalt"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] font-normal text-muted"
                    >
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-2.5">
                    <span className="sr-only">Archiveren</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {slice.map((d) => {
                  const late = overdue(d, todayMs)
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-line/8 transition-colors last:border-b-0 hover:bg-background"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href="/dashboard/offertes"
                          className="tap-target font-mono text-[12.5px] tabular-nums text-foreground transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
                        >
                          {d.number}
                        </Link>
                      </td>
                      <td className="max-w-[16rem] truncate px-5 py-3 text-[13px] text-foreground">
                        {d.client.split("\n")[0] || d.title || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Status doc={d} late={late} />
                      </td>
                      <td className="px-5 py-3 font-mono text-[12.5px] tabular-nums text-foreground">
                        {euro(value(d))}
                      </td>
                      <td className="px-5 py-3 font-mono text-[12px] tabular-nums text-muted">
                        {dutch(d.dateISO)}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3 font-mono text-[12px] tabular-nums",
                          late ? "text-[color:var(--ember-text)]" : "text-muted"
                        )}
                      >
                        {dutch(d.deadlineISO)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {archiveButton(d)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <p className="font-mono text-[11px] tabular-nums text-muted">
              {current * PAGE + 1}–{Math.min((current + 1) * PAGE, rows.length)} van{" "}
              {rows.length}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, current - 1))}
                disabled={current === 0}
                aria-label="Vorige pagina"
                className="tap-target rounded-lg border border-line/20 p-1.5 text-muted transition-colors enabled:hover:border-gronn-ember enabled:hover:text-foreground disabled:opacity-35"
              >
                <ChevronLeftIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(pages - 1, current + 1))}
                disabled={current >= pages - 1}
                aria-label="Volgende pagina"
                className="tap-target rounded-lg border border-line/20 p-1.5 text-muted transition-colors enabled:hover:border-gronn-ember enabled:hover:text-foreground disabled:opacity-35"
              >
                <ChevronRightIcon size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
