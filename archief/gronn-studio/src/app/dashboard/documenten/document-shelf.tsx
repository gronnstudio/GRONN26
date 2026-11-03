"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { card, emptyState, field, label as labelClass } from "@/app/dashboard/ui"
import { StatusPill } from "@/app/dashboard/tiles"
import type { ArchiveStatus } from "@/lib/document-archive"
import { euro, totals, type StudioDocument } from "@/lib/documents"
import { cn } from "@/lib/utils"

// De plank, zoals hij op een telefoon leest.
//
// Eén lijst, nieuwste bovenaan, en per regel het enige dat je zoekt als
// je hem opvraagt: van wie, welk nummer, hoeveel. Geen tabel — een tabel
// van zes kolommen op 412px is zes kolommen die geen van alle passen.
//
// Het zoekveld staat er omdat de opdracht "snel tevoorschijn toveren"
// was. Bij twintig documenten scrol je; bij tweehonderd niet meer, en
// dan is dit veld het verschil tussen het scherm gebruiken en het
// vermijden. Het filtert op klant, nummer en titel: de drie dingen die
// iemand zich van een document herinnert.
//
// Bedragen staan er in incl. btw. Dat is het getal dat in het gesprek
// valt — "wat kostte dat ook alweer" — en niet de grondslag waarop de
// boekhouding rekent.

function amountOf(doc: StudioDocument): number {
  const { gross } = totals(doc)
  // Bij een offerte met varianten is het eerste bedrag de basis; dat is
  // ook de kolom die de sheet als eerste toont.
  return gross[0] ?? 0
}

function haystack(doc: StudioDocument): string {
  return [doc.client, doc.number, doc.title].join(" ").toLowerCase()
}

export function DocumentShelf({
  documents,
  status,
}: {
  documents: StudioDocument[]
  status: ArchiveStatus
}) {
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return documents
      .filter((d) => (needle ? haystack(d).includes(needle) : true))
      .slice()
      .sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""))
  }, [documents, query])

  return (
    <main className="w-full px-5 py-6 sm:px-6 sm:py-7">
      <header className="max-w-2xl">
        <h1 className="font-heading text-2xl font-semibold">Documenten</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Alles wat de studio heeft uitgeschreven, om terug te lezen en door
          te sturen. Opstellen en wijzigen doe je in de offertebouwer, op een
          groot scherm.
        </p>
      </header>

      {/* Een leesfout mag nooit als "er is niets" op het scherm komen.
          Dat is dezelfde regel als in het klantdossier, en om dezelfde
          reden: een lege lijst na een mislukte lees vertelt je dat je
          administratie weg is. */}
      {status !== "ok" && (
        <div className="mt-6 rounded-lg border border-gronn-ember bg-gronn-ember/5 p-5">
          <p className="font-heading text-[15px] font-semibold text-[color:var(--ember-text)]">
            Het archief kon nu niet gelezen worden
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            Dat betekent niet dat er niets is — alleen dat het nu niet
            opgehaald kon worden. Ververs de pagina zo nog eens.
          </p>
        </div>
      )}

      {documents.length > 0 && (
        <div className="relative mt-7">
          <SearchIcon
            size={15}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op klant, nummer of titel"
            aria-label="Zoek in documenten"
            className={cn(field, "pl-10")}
          />
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {rows.map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/dashboard/documenten/${doc.id}`}
              className={cn(
                card,
                "tap-target block p-4 transition-colors active:bg-surface/70 hover:border-gronn-ember/40"
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-heading text-[15px] font-semibold">
                  {/* De eerste regel van het klantveld. De rest is een
                      adres en hoort niet in een lijstregel. */}
                  {doc.client.split("\n")[0] || doc.title || doc.number}
                </p>
                <StatusPill
                  tone={
                    doc.archivedAt
                      ? "quiet"
                      : doc.kind === "factuur" && !doc.paid
                        ? "warn"
                        : "ok"
                  }
                >
                  {doc.archivedAt
                    ? "Archief"
                    : doc.kind === "offerte"
                      ? "Offerte"
                      : doc.paid
                        ? "Betaald"
                        : "Open"}
                </StatusPill>
              </div>

              {doc.title && (
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
                  {doc.title}
                </p>
              )}

              <p className={cn(labelClass, "mt-2")}>
                {doc.number}
                {doc.date ? ` · ${doc.date}` : ""} ·{" "}
                <span className="tabular-nums">{euro(amountOf(doc))}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {documents.length > 0 && rows.length === 0 && (
        <div className={emptyState}>
          Niets gevonden voor “{query}”.
        </div>
      )}

      {status === "ok" && documents.length === 0 && (
        <div className={emptyState}>
          Er staat nog geen offerte of factuur in het archief.
        </div>
      )}
    </main>
  )
}
