"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  documentsSnapshot,
  hydrate,
  saveStateSnapshot,
  writeDocuments,
} from "@/lib/document-store"
import { draftFromIntake, upsert } from "@/lib/documents"
import type {
  ArchiveStatus,
  IntakeSubmission,
  OrphanFolder,
} from "@/lib/intake-archive"
import { cn } from "@/lib/utils"
import { DossierLink } from "./dossier-link"
import { IntakeSheet } from "./intake-sheet"
import { MediaGallery } from "./media-gallery"

// The intake archive as a workspace, not a list.
//
// It was an accordion: two rows on an empty screen, each opening
// downward, while the administration next door is a two-pane tool. Same
// login, same job, two completely different shapes — and the archive
// looked like the lesser one because it was.
//
// So: enquiries on the left, the whole enquiry on the right. The list
// stays put while you read, which is what makes comparing two of them
// possible at all, and the actions sit in one bar instead of at the foot
// of whatever happens to be expanded.

const CATEGORY: Record<string, string> = {
  current: "Huidige situatie",
  materials: "Materiaal",
  attracts: "Inspiratie",
  repels: "Afkeer",
  documents: "Tekeningen",
}

function when(iso: string): string {
  if (!iso) return "onbekend"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "onbekend"
  return d.toLocaleString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const action =
  "tap-target rounded-full border border-line/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"

/* ------------------------------------------------------------------ list */

function ListRow({
  s,
  active,
  onSelect,
}: {
  s: IntakeSubmission
  active: boolean
  onSelect: () => void
}) {
  const orphan = !s.receivedAt && !s.transcript
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "w-full border-l-2 px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--focus-ring)]",
          active
            ? "border-gronn-ember bg-surface"
            : "border-transparent hover:border-line/25 hover:bg-surface/60"
        )}
      >
        <span className="block truncate text-sm font-medium text-foreground">
          {s.name || s.reference}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-muted">
          {s.project || "Zonder projectnaam"}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {s.receivedAt
              ? new Date(s.receivedAt).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "short",
                })
              : "—"}
          </span>
          {orphan && (
            <span className="rounded-full border border-gronn-ember px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--ember-text)]">
              onvolledig
            </span>
          )}
          {s.filesFailed > 0 && (
            <span className="rounded-full border border-gronn-ember px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--ember-text)]">
              {s.filesFailed} mislukt
            </span>
          )}
          {s.files.length > 0 && (
            <span className="font-mono text-[10px] tabular-nums text-accent">
              {s.files.length} {s.files.length === 1 ? "bestand" : "bestanden"}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}

/* ---------------------------------------------------------------- record */

function Record({
  s,
  onPrint,
  onBack,
  onDeleted,
}: {
  s: IntakeSubmission
  onPrint: () => void
  onBack: () => void
  onDeleted: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  // Two-step, not a `confirm()`. Nothing here is destroyed any more, but
  // the enquiry does leave the list, and a row that vanishes under a
  // mis-aimed cursor is still a row somebody has to go and find. So the
  // second press is a different button rather than a dialog people
  // dismiss by reflex. Escape and "Annuleer" both back out.
  const [arming, setArming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeFailed, setRemoveFailed] = useState(false)
  const orphan = !s.receivedAt && !s.transcript

  /**
   * Into the drain, not gone.
   *
   * This button used to call DELETE, which removes the folder and every
   * photograph in it with no undo — the blobs are the only copy the
   * studio has of somebody's garden, and one click stood between a
   * mis-aimed cursor and losing them. It now sets a timestamp; the
   * enquiry leaves the list and waits in Afvoerputje, where the
   * permanent step is a second, separate decision taken in front of a
   * count of what it will destroy.
   */
  const remove = async () => {
    if (removing) return
    setRemoving(true)
    setRemoveFailed(false)
    try {
      const res = await fetch(
        `/api/admin/intake/${encodeURIComponent(s.reference)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleted: true }),
        }
      )
      if (!res.ok) throw new Error("refused")
      setArming(false)
      // The list is server-rendered from the archive, so the row only
      // disappears once the server has read it again.
      onDeleted()
      router.refresh()
    } catch {
      setRemoveFailed(true)
    } finally {
      setRemoving(false)
    }
  }

  // The enquiry becomes the start of a quote instead of something to
  // retype. The draft is written to the archive first, so the builder —
  // which opens the most recent document — lands on it.
  //
  // The await is load-bearing, and it is the repair of a bug that could
  // destroy the whole administration. Nothing on this page subscribes to
  // the document store, and `hydrate()` runs only from inside
  // `subscribeDocuments` — so on a cold load of this route (a bookmark, a
  // refresh, the tile on the overview: none of them mount the builder)
  // the module cache was still empty. `writeDocuments` then PUT an array
  // containing nothing but the new draft, over every quote and invoice
  // the studio had, and `nextNumber([])` restarted the numbering at
  // YYYY-0001 on top of it.
  const makeQuote = async () => {
    if (busy) return
    setBusy(true)
    setFailed(false)
    try {
      await hydrate()
      // A failed read must never become a write. "Storage did not answer"
      // and "there are no documents" look identical in an empty array,
      // and only one of them is safe to save on top of.
      if (saveStateSnapshot() === "error") throw new Error("archive unreadable")
      const existing = documentsSnapshot()
      const draft = draftFromIntake(existing, {
        reference: s.reference,
        name: s.name,
        contact: s.contact,
        project: s.project,
      })
      writeDocuments(upsert(existing, draft))
      router.push("/dashboard/offertes")
    } catch {
      setBusy(false)
      setFailed(true)
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={onBack}
        className="tap-target mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent lg:hidden"
      >
        ‹ Alle aanvragen
      </button>

      <h2 className="font-heading text-[clamp(1.4rem,3vw,1.9rem)] font-semibold tracking-tight">
        {s.project || s.reference}
      </h2>
      {/* `overflow-wrap: anywhere` because an e-mail address in spaced
          capitals has no break opportunity, and on a phone it was wider
          than the screen. */}
      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted [overflow-wrap:anywhere]">
        <div>
          <dt className="sr-only">Aanvrager</dt>
          <dd className="text-foreground">{s.name || "—"}</dd>
        </div>
        <div>
          <dt className="sr-only">Contact</dt>
          <dd>{s.contact || "—"}</dd>
        </div>
        <div>
          <dt className="sr-only">Binnengekomen</dt>
          <dd>{when(s.receivedAt)}</dd>
        </div>
      </dl>

      {!orphan && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={makeQuote}
            disabled={busy}
            className="tap-target rounded-full bg-gronn-green px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-colors hover:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? "Bezig…" : "Maak offerte"}
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(s.transcript)}
            className={action}
          >
            Kopieer de antwoorden
          </button>
          {s.contact.includes("@") && (
            <a
              href={`mailto:${s.contact}?subject=${encodeURIComponent(
                `Je aanvraag — ${s.project || s.reference}`
              )}`}
              className={action}
            >
              Mail terug
            </a>
          )}
          {/* One button, two outcomes: every browser's print dialog offers
              "Save as PDF", so a separate download would be a second path
              to the same file. */}
          <button type="button" onClick={onPrint} className={action}>
            Print of pdf
          </button>
        </div>
      )}

      {/* An enquiry belongs to a household, and until now the panel had
          nowhere to say which. Not offered for an orphan stub: there is
          no record under it to carry the link. */}
      {!orphan && <DossierLink s={s} />}

      {/* Removing sits apart from the row above on purpose. "Maak offerte"
          and "Verwijder" looking alike is how a mis-click costs an
          afternoon. It is offered for an orphan stub too — a folder with
          files and no submission is exactly the thing an owner wants to
          clear off the list. */}
      <div className="mt-6 border-t border-line/15 pt-4">
        {!arming ? (
          <button
            type="button"
            onClick={() => setArming(true)}
            className="tap-target rounded-full border border-line/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-gronn-ember hover:text-[color:var(--ember-text)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
          >
            Verwijder deze aanvraag
          </button>
        ) : (
          <div
            onKeyDown={(e) => {
              if (e.key === "Escape") setArming(false)
            }}
          >
            <p className="max-w-[62ch] text-[13px] leading-relaxed text-foreground">
              De aanvraag verdwijnt uit de lijst en gaat naar het
              afvoerputje.{" "}
              {s.files.length > 0 &&
                `${
                  s.files.length === 1
                    ? "Het bestand"
                    : `Alle ${s.files.length} bestanden`
                } blijft${s.files.length === 1 ? "" : "en"} staan. `}
              Je kunt hem daar terugzetten, of daar pas definitief weggooien.
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button
                type="button"
                autoFocus
                onClick={remove}
                disabled={removing}
                className="tap-target rounded-full bg-gronn-ember-strong px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              >
                {removing ? "Bezig…" : "Ja, naar het afvoerputje"}
              </button>
              <button
                type="button"
                onClick={() => setArming(false)}
                disabled={removing}
                className={action}
              >
                Annuleer
              </button>
            </div>
          </div>
        )}
        {removeFailed && (
          <p className="mt-3 max-w-prose text-[13px] leading-relaxed text-[color:var(--ember-text)]">
            Weghalen is niet gelukt — de aanvraag staat er nog, precies zoals
            hij was. Probeer het zo opnieuw.
          </p>
        )}
      </div>

      {failed && (
        <p className="mt-3 max-w-prose text-[13px] leading-relaxed text-[color:var(--ember-text)]">
          De administratie kon niet gelezen worden, dus er is niets opgeslagen.
          Probeer het zo opnieuw — een offerte aanmaken op een archief dat niet
          binnenkwam zou de rest overschrijven.
        </p>
      )}

      {orphan && (
        <p className="mt-5 max-w-[62ch] rounded-lg border border-gronn-ember bg-gronn-ember/5 p-4 text-sm leading-relaxed text-[color:var(--ember-text)]">
          Er staan bestanden onder deze verwijzing, maar geen inzending.
          Waarschijnlijk is de upload gelukt en het verzenden daarna misgegaan.
          De bestanden staan hieronder als ze er zijn.
        </p>
      )}

      {s.filesFailed > 0 && (
        <p className="mt-5 max-w-[62ch] rounded-lg border border-gronn-ember bg-gronn-ember/5 p-4 text-sm leading-relaxed text-[color:var(--ember-text)]">
          {s.filesFailed} {s.filesFailed === 1 ? "bestand" : "bestanden"} die de
          aanvrager had toegevoegd, zijn niet in de opslag aangekomen. De
          aanvrager is dat op het scherm verteld, met het verzoek ze te mailen.
          Als dat niet gebeurt, zijn ze alleen nog bij hem.
          {s.filesFailedReasons && s.filesFailedReasons.length > 0 && (
            <>
              {/* What the browser actually said. A count alone made three
                  different upload failures look identical, and each cost a
                  round of guessing. */}
              <span className="mt-3 block font-mono text-[11.5px] leading-relaxed text-muted">
                {s.filesFailedReasons.map((reason) => (
                  <span key={reason} className="block break-words">
                    {reason}
                  </span>
                ))}
              </span>
            </>
          )}
        </p>
      )}

      {/* ------------------------------------------------------- files */}
      <h3 className="mt-9 font-mono text-[11px] uppercase tracking-[0.17em] text-muted">
        Foto&apos;s, video&apos;s en bestanden
      </h3>
      {s.files.length === 0 ? (
        // "0 bestanden" reads like a broken counter. Say what actually
        // happened, and — since nothing failed either — say that too, so
        // an empty gallery is never mistaken for a broken one.
        <p className="mt-2 max-w-[62ch] rounded-lg border border-dashed border-line/25 p-4 text-[13px] leading-relaxed text-muted">
          {s.filesFailed > 0
            ? "Alles wat werd meegestuurd is onderweg misgelopen — zie hierboven."
            : "Deze aanvrager heeft niets meegestuurd. Er is ook niets misgegaan: de trays in het formulier zijn gewoon leeg gebleven."}
        </p>
      ) : (
        <>
          <MediaGallery
            files={s.files}
            categoryLabel={(key) => CATEGORY[key] ?? key}
          />
          {s.files.some((f) => f.access === "public") ? (
            <p className="mt-3 max-w-[62ch] font-mono text-[10.5px] leading-relaxed text-[color:var(--ember-text)]">
              Let op: een of meer van deze bestanden staan op een openbare URL.
              De opslag weigerde een privé-upload, en dan gaan de bestanden
              liever alsnog door dan verloren. De adressen zijn niet te raden,
              maar wie er een heeft kan hem openen.
            </p>
          ) : (
            <p className="mt-3 max-w-[62ch] font-mono text-[10.5px] leading-relaxed text-muted">
              Deze bestanden staan in privéopslag en zijn alleen bereikbaar als
              je hier ingelogd bent. Een link kopiëren en doorsturen werkt niet
              — de ontvanger krijgt 401.
            </p>
          )}
        </>
      )}

      {/* --------------------------------------------------- transcript */}
      {!orphan && (
        <>
          <h3 className="mt-9 font-mono text-[11px] uppercase tracking-[0.17em] text-muted">
            De antwoorden
          </h3>
          {/* Monospaced, unreflowed: it is a transcript, and turning it
              into prose would lose the question-and-answer shape the
              studio reads it by. */}
          <pre className="mt-2 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg border border-line/15 bg-background p-5 font-mono text-[12.5px] leading-relaxed text-foreground/85">
            {s.transcript}
          </pre>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- workspace */

/* -------------------------------------------------------------- recovery */

/**
 * Files that lost their record, and the one button that gives them back.
 *
 * This is the visible half of the reference bug: the folder is intact,
 * the photographs are intact, and only the link between them and the
 * enquiry went missing. Repairing it moves nothing and deletes nothing,
 * which is why the button can say plainly what it will do.
 */
function OrphanBanner({ orphans }: { orphans: OrphanFolder[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const total = orphans.reduce((n, o) => n + o.files.length, 0)

  const repair = async () => {
    if (busy) return
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/intake-recovery", { method: "POST" })
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { repaired?: number; files?: number }
      setResult(
        `${body.files ?? 0} bestand${body.files === 1 ? "" : "en"} teruggekoppeld aan ${body.repaired ?? 0} aanvraag${body.repaired === 1 ? "" : "en"}.`
      )
      router.refresh()
    } catch {
      setResult("Herstellen lukte niet. Er is niets gewijzigd.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="doc-chrome mb-6 rounded-lg border border-gronn-ember bg-gronn-ember/5 p-4">
      <p className="font-heading text-sm font-semibold text-[color:var(--ember-text)]">
        {orphans.length} aanvraag{orphans.length === 1 ? "" : "en"} mist{" "}
        {total} bestand{total === 1 ? "" : "en"}
      </p>
      <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-muted">
        De bestanden zijn er nog — ze staan onder een net andere schrijfwijze van
        dezelfde verwijzing dan de aanvraag zelf. Herstellen koppelt ze terug aan
        het juiste dossier. Er wordt niets verplaatst en niets verwijderd.
      </p>
      <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted">
        {orphans.map((o) => (
          <li key={o.reference}>
            {o.belongsTo} ← {o.files.length} bestand{o.files.length === 1 ? "" : "en"}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={repair}
        disabled={busy}
        className="tap-target mt-3 rounded-full bg-gronn-green px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-colors hover:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Bezig…" : "Herstel koppeling"}
      </button>
      {result && (
        <p aria-live="polite" className="mt-2.5 text-[13px] text-foreground">
          {result}
        </p>
      )}
    </div>
  )
}

export function IntakeWorkspace({
  submissions,
  status = "ok",
  orphans = [],
}: {
  submissions: IntakeSubmission[]
  /** Whether the archive could be read at all — see readArchive. */
  status?: ArchiveStatus
  /** Folders whose files lost their record to the reference bug. */
  orphans?: OrphanFolder[]
}) {
  const [selected, setSelected] = useState(0)
  // Under lg the two panes cannot share the screen, so one is shown at a
  // time and this says which.
  const [showRecord, setShowRecord] = useState(false)
  // Exactly one sheet is ever in the document, and only while printing.
  const [printing, setPrinting] = useState<IntakeSubmission | null>(null)

  useEffect(() => {
    if (!printing) return
    // `afterprint` rather than a timer: it fires whether the dialog was
    // confirmed or cancelled, so the sheet always leaves the document.
    const done = () => setPrinting(null)
    window.addEventListener("afterprint", done)
    window.print()
    return () => window.removeEventListener("afterprint", done)
  }, [printing])

  const current = submissions[selected]

  // "Storage did not answer" is not "you have no enquiries", and showing
  // the second when the first happened is how an outage reads as an
  // empty business.
  if (status === "unavailable") {
    return (
      <main className="doc-chrome w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-[clamp(1.7rem,3.5vw,2.3rem)] font-semibold tracking-tight">
          Intakes
        </h1>
        <div className="mt-8 rounded-lg border border-gronn-ember bg-gronn-ember/5 p-8">
          <p className="font-heading text-lg font-semibold text-[color:var(--ember-text)]">
            De opslag antwoordde niet.
          </p>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted">
            Dit betekent niet dat er geen aanvragen zijn — alleen dat ze nu niet
            gelezen konden worden. Ververs de pagina zo nog eens.
          </p>
        </div>
      </main>
    )
  }

  if (submissions.length === 0 && orphans.length === 0) {
    return (
      <main className="doc-chrome w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-[clamp(1.7rem,3.5vw,2.3rem)] font-semibold tracking-tight">
          Intakes
        </h1>
        <div className="mt-8 rounded-lg border border-dashed border-line/30 p-10 text-center">
          <p className="font-heading text-lg font-semibold text-accent">
            Nog niets binnengekomen.
          </p>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted">
            Zodra iemand het uitgebreide formulier op{" "}
            <code className="font-mono text-[13px]">/contact/intake</code>{" "}
            verstuurt, verschijnt de aanvraag hier — ook als er geen
            Slack-kanaal is ingesteld en er dus geen melding uitgaat.
          </p>
          <Link
            href="/dashboard/intakes/new"
            className="tap-target mt-6 inline-block rounded-full bg-gronn-green px-5 py-2.5 text-sm text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
          >
            Zelf een intake invullen
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      {/* doc-chrome is what the print rules already hide, so the sheet
          below is the only thing on the printed page. */}
      <main className="doc-chrome w-full px-4 py-7 sm:px-6 sm:py-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="font-heading text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-tight">
            Intakes
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              {submissions.length}{" "}
              {submissions.length === 1 ? "aanvraag" : "aanvragen"} · nieuwste
              eerst
            </p>
            {/* Until now an intake could only arrive one way: a visitor
                submitting the public form. Everything learned on the
                phone had to be retyped into it afterwards, or kept
                somewhere else entirely. */}
            <Link
              href="/dashboard/intakes/new"
              className="tap-target rounded-full bg-gronn-green px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Zelf invullen
            </Link>
          </div>
        </div>

        {orphans.length > 0 && (
          <div className="mt-6">
            <OrphanBanner orphans={orphans} />
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
          {/* The list stays put while you read — that is what makes two
              enquiries comparable at all. */}
          <nav
            aria-label="Aanvragen"
            className={cn(
              "lg:sticky lg:top-6 lg:max-h-[calc(100svh-4rem)] lg:self-start lg:overflow-y-auto",
              showRecord && "hidden lg:block"
            )}
          >
            <ul className="divide-y divide-line/12 border-y border-line/12">
              {submissions.map((s, i) => (
                <ListRow
                  key={s.reference}
                  s={s}
                  active={i === selected}
                  onSelect={() => {
                    setSelected(i)
                    setShowRecord(true)
                  }}
                />
              ))}
            </ul>
          </nav>

          <div className={cn(!showRecord && "hidden lg:block")}>
            {current && (
              <Record
                // Keyed by reference so opening a different enquiry
                // remounts this pane. Every piece of state in it is about
                // one enquiry — an armed delete most of all — and
                // carrying an armed delete across a selection change is
                // how the wrong enquiry gets removed.
                key={current.reference}
                s={current}
                onPrint={() => setPrinting(current)}
                onBack={() => setShowRecord(false)}
                // The deleted row is about to leave the server-rendered
                // list, and `selected` is an index into it. Left alone it
                // would point at whatever slid into that position — so
                // the selection goes back to the top rather than to a
                // different client's enquiry.
                onDeleted={() => {
                  setSelected(0)
                  setShowRecord(false)
                }}
              />
            )}
          </div>
        </div>
      </main>

      {printing && (
        <div className="doc-stage hidden print:block">
          <IntakeSheet s={printing} />
        </div>
      )}
    </>
  )
}
