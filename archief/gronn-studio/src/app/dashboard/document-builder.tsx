"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { DocumentSheet } from "./document-sheet"
import {
  addDaysISO,
  blankDocument,
  documentBaseName,
  duplicate,
  isoToDutch,
  toInvoice,
  toISO,
  TERM_DAYS,
  emptyBlock,
  emptyItem,
  isDocument,
  upsert,
  type ColumnCount,
  type DocKind,
  type Masthead,
  type StudioDocument,
  type TextBlock,
} from "@/lib/documents"
import {
  documentsServerSnapshot,
  documentsSnapshot,
  saveStateServerSnapshot,
  saveStateSnapshot,
  subscribeDocuments,
  subscribeSaveState,
  watchFocus,
  writeDocuments,
} from "@/lib/document-store"
import { cn } from "@/lib/utils"
import { downloadText, fileName } from "@/lib/download"
import { field } from "@/app/dashboard/ui"
import { DocumentToolbar } from "./document-toolbar"

/* ------------------------------------------------------------- controls */


function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 mt-3 block text-xs text-muted">
      {children}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 first:mt-0">
      <h2 className="mb-2 border-b border-line/15 pb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Remove-this-row button — icon plus a real label for screen readers. */
function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-gronn-ember/10 hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M2.5 2.5l9 9m0-9l-9 9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2.5 w-full rounded-md border border-dashed border-line/25 px-3 py-2 text-sm text-muted transition-colors hover:border-gronn-green hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
    >
      {children}
    </button>
  )
}

const MASTHEAD_OPTIONS: { id: Masthead; label: string; hint: string }[] = [
  { id: "logo", label: "Logo", hint: "Het logo draagt de naam en de tagline al" },
  { id: "mark", label: "Beeldmerk + naam", hint: "Het oranje merkteken naast de gezette naam" },
  { id: "wordmark", label: "Alleen naam", hint: "Gezette naam, geen beeld" },
]


/**
 * A date, two ways: pick it from the calendar, or type it. The picker
 * writes the Dutch long form into the text field; the text field stays
 * free, so "in overleg" or "bij oplevering" is always possible.
 */
function DateRow({
  id,
  label,
  text,
  iso,
  onChange,
  quick,
}: {
  id: string
  label: string
  text: string
  iso: string
  onChange: (next: { text: string; iso: string }) => void
  quick?: { label: string; onClick: () => void }
}) {
  return (
    <>
      <div className="mb-1 mt-3 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs text-muted">
          {label}
        </label>
        {quick && (
          <button
            type="button"
            onClick={quick.onClick}
            className="tap-target font-mono text-[10px] uppercase tracking-[0.14em] text-muted underline decoration-line/40 underline-offset-2 transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
          >
            {quick.label}
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          id={id}
          value={text}
          onChange={(e) => onChange({ text: e.target.value, iso })}
          className={field}
        />
        <input
          type="date"
          aria-label={`${label} — kies uit de kalender`}
          value={iso}
          onChange={(e) => {
            const next = e.target.value
            onChange({ text: next ? isoToDutch(next) : text, iso: next })
          }}
          className={cn(field, "w-auto shrink-0")}
        />
      </div>
    </>
  )
}

/**
 * Fits the A4 page to whatever width the stage has, by measuring rather
 * than reflowing — the preview has to predict the PDF, and a reflowed
 * page breaks its lines somewhere else. Only ever scales down.
 *
 * Callback refs rather than a mount effect: the panel opens on the empty
 * state, where neither node exists yet, so an effect that ran once on
 * mount attached its observer to nothing and the page stayed unscaled
 * for the rest of the session. These re-attach whenever either node
 * appears. The ResizeObserver fires once when observation starts, which
 * is the initial measurement.
 */
function useSheetScale() {
  const [box, setBox] = useState({ scale: 1, width: 0, height: 0 })
  const nodes = useRef<{
    stage: HTMLDivElement | null
    sheet: HTMLDivElement | null
  }>({ stage: null, sheet: null })
  const observer = useRef<ResizeObserver | null>(null)

  const attach = useCallback(() => {
    observer.current?.disconnect()
    observer.current = null
    const { stage, sheet } = nodes.current
    if (!stage || !sheet) return
    // Measure the page itself, never the wrapper: the wrapper is what
    // this hook resizes, so measuring it fed the new width straight back
    // in and every second pass computed a scale of 1. The page holds its
    // 210mm regardless (offsetWidth ignores the transform), which makes
    // it the only stable ruler here.
    const page = sheet.querySelector<HTMLElement>(".doc-sheet")
    if (!page) return
    const next = new ResizeObserver(() => {
      const available = stage.clientWidth - STAGE_PADDING
      const natural = page.offsetWidth
      const naturalHeight = page.offsetHeight
      if (!natural || !naturalHeight || available <= 0) return
      const scale = Math.min(1, available / natural)
      setBox({ scale, width: natural * scale, height: naturalHeight * scale })
    })
    next.observe(stage)
    next.observe(page)
    observer.current = next
  }, [])

  const stage = useCallback(
    (node: HTMLDivElement | null) => {
      nodes.current.stage = node
      attach()
    },
    [attach]
  )

  const sheet = useCallback(
    (node: HTMLDivElement | null) => {
      nodes.current.sheet = node
      attach()
    },
    [attach]
  )

  return { stage, sheet, ...box }
}

/** Breathing room around the page, matching the stage's own padding. */
const STAGE_PADDING = 32

/* -------------------------------------------------------------- builder */

export function DocumentBuilder({ iban }: { iban: string }) {
  // The saved documents come straight from the store; the draft is the
  // one being edited. Falling back to the most recent saved document
  // means reopening the panel lands you where you left off.
  const docs = useSyncExternalStore(
    subscribeDocuments,
    documentsSnapshot,
    documentsServerSnapshot
  )
  // What the archive is doing right now. A localStorage write either
  // happened or threw; a round trip to the studio's store can be in
  // flight, or have failed while the owner kept typing — so the panel
  // has to be able to say which, rather than claiming "saved" the
  // instant a key is pressed.
  const save = useSyncExternalStore(
    subscribeSaveState,
    saveStateSnapshot,
    saveStateServerSnapshot
  )
  const [draft, setDraft] = useState<StudioDocument | null>(null)
  const [status, setStatus] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const { stage, sheet, scale, width, height } = useSheetScale()
  const doc = draft ?? docs[0] ?? null

  // Two tabs share one archive, so a backgrounded tab catches up before
  // it can write a stale list over a newer one.
  useEffect(() => watchFocus(), [])

  // Persist quietly a beat after typing stops — the owner never has to
  // remember to save, and a burst of keystrokes writes once. The store
  // owns the round trip and reports it through `save`; this effect only
  // hands over the latest state.
  useEffect(() => {
    if (!draft) return
    const id = setTimeout(() => {
      writeDocuments(upsert(documentsSnapshot(), draft))
      setStatus("")
    }, 700)
    return () => clearTimeout(id)
  }, [draft])

  const patch = (changes: Partial<StudioDocument>) => {
    if (!doc) return
    setDraft({ ...doc, ...changes })
  }

  const start = (kind: DocKind) => {
    setDraft(blankDocument(kind, docs))
    setStatus("Nieuw document")
  }

  // First run, or every document deleted: nothing to edit yet.
  if (!doc) {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Nog geen documenten
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Begin een offerte of een factuur. Alles wat je typt wordt vanzelf
            bewaard in je eigen archief, en staat op elk apparaat waar je
            inlogt.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => start("offerte")}
            className="rounded-full bg-gronn-green px-5 py-2.5 text-sm text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
          >
            Nieuwe offerte
          </button>
          <button
            type="button"
            onClick={() => start("factuur")}
            className="rounded-full border border-line/25 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
          >
            Nieuwe factuur
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
          >
            Bestand openen
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importJson(file)
              e.target.value = ""
            }}
          />
        </div>
      </div>
    )
  }

  const isInvoice = doc.kind === "factuur"
  /** Has this document been saved, or is it still a fresh draft? Also
   *  what the picker uses to decide whether to show its "— nieuw" row. */
  const stored = docs.some((d) => d.id === doc.id)

  /* ---------------------------------------------------------- actions */

  // An invoice bills the option the client already chose, so it never
  // offers a comparison: switching to one collapses to a single price
  // column and the choice disappears from the panel.
  const switchKind = (kind: DocKind) =>
    patch({
      kind,
      amountsHeading: kind === "factuur" ? "Specificatie" : "Investering",
      ...(kind === "factuur" ? { columns: 1 as ColumnCount } : {}),
    })

  /**
   * What pressing Offerte or Factuur actually means.
   *
   * The written spec asks simply that the control switch the document's
   * type. Doing exactly that is what produced the defect this round
   * began with: `switchKind` rewrote the kind of whatever was open and
   * KEPT ITS NUMBER, so an invoice already sent as 2026-0002 could
   * become a quote carrying an invoice number. Dutch invoicing wants an
   * unbroken series; a quote number is far freer.
   *
   * So the control stays live — the spec's interaction is preserved —
   * and only its meaning depends on what is open:
   *
   *  · a draft that was never saved switches outright, which is also the
   *    only way to start a standalone invoice once the archive holds
   *    something (the "Nieuw" button inherits the open document's kind);
   *  · a stored quote converts through `toInvoice`, the same path Beheer
   *    uses, minting a new document with the next invoice number and
   *    leaving the quote intact;
   *  · a stored invoice does not move, and says why.
   */
  const chooseKind = (kind: DocKind) => {
    if (kind === doc.kind) return
    if (!stored) {
      switchKind(kind)
      return
    }
    if (kind === "factuur") {
      // A multi-column quote has no single accepted option to bill, so
      // the choice belongs to the Beheer panel, which asks which one.
      if (doc.columns === 1) convertToInvoice(0)
      else setStatus("Kies onder Beheer welke variant de factuur wordt")
      return
    }
    setStatus("Een verstuurd factuurnummer blijft staan — maak een nieuwe offerte")
  }

  const convertToInvoice = (variant: number) => {
    setDraft(toInvoice(doc!, variant, docs))
    setStatus("Factuur gemaakt van deze offerte")
  }

  const duplicateDocument = () => {
    setDraft(duplicate(doc!, docs))
    setStatus("Kopie gemaakt")
  }

  const openDocument = (id: string) => {
    const found = docs.find((d) => d.id === id)
    if (found) setDraft(found)
  }

  const removeDocument = () => {
    const next = docs.filter((d) => d.id !== doc.id)
    writeDocuments(next)
    setDraft(next[0] ?? null)
    setStatus("Document verwijderd")
  }

  const exportJson = () => {
    // De naam kwam hier uit `gronn-${kind}-${number}`, en dat brak zodra
    // de nummering die van de boekhouding volgde: `GR-F // 2026-0908-0010`
    // draagt een schuine streep, en die mag in geen enkele bestandsnaam.
    // `documentBaseName` maakt er `GR_F_Klant_Partner_2026-0908-0010` van.
    downloadText(fileName(documentBaseName(doc), "json"), JSON.stringify(doc, null, 2))
    setStatus("Document opgeslagen")
  }

  /**
   * De hele administratie in één bestand.
   *
   * Geen elegante export maar een back-up, en dat is het punt: alles staat
   * in één blob bij Vercel, dus één mislukte schrijf raakt alles tegelijk.
   * Een knop die de stand van vandaag op je eigen schijf zet is de
   * goedkoopste verzekering die er is. Archiefstukken gaan mee — juist
   * die wil je terug kunnen halen.
   */
  const exportArchive = () => {
    const all = documentsSnapshot()
    if (all.length === 0) {
      setStatus("Er is nog niets om op te slaan")
      return
    }
    const today = toISO(new Date())
    downloadText(
      fileName(["GRONN", "administratie", today], "json"),
      JSON.stringify(all, null, 2)
    )
    setStatus(`${all.length} documenten opgeslagen`)
  }

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isDocument(parsed)) throw new Error("not a document")
      setDraft(parsed)
      setStatus("Bestand geopend")
    } catch {
      setStatus("Dit bestand kan ik niet lezen — kies een json die hier is opgeslagen")
    }
  }

  /* ------------------------------------------------------ line editing */

  const patchItem = (id: string, changes: Partial<(typeof doc.items)[number]>) =>
    patch({ items: doc.items.map((i) => (i.id === id ? { ...i, ...changes } : i)) })

  const patchAmount = (id: string, column: number, raw: string) => {
    const value = raw.trim() === "" ? null : Number(raw)
    patch({
      items: doc.items.map((item) => {
        if (item.id !== id) return item
        const amounts = [...item.amounts]
        amounts[column] = value !== null && Number.isFinite(value) ? value : null
        return { ...item, amounts }
      }),
    })
  }

  const patchBlock = (
    where: "blocksBefore" | "blocksAfter",
    id: string,
    changes: Partial<TextBlock>
  ) =>
    patch({
      [where]: doc[where].map((b) => (b.id === id ? { ...b, ...changes } : b)),
    } as Partial<StudioDocument>)

  const blockEditor = (where: "blocksBefore" | "blocksAfter") => (
    <>
      {doc[where].map((block) => (
        <div key={block.id} className="mt-2.5 rounded-lg border border-line/15 bg-surface/60 p-3">
          <div className="flex items-center gap-2">
            <input
              value={block.heading}
              onChange={(e) => patchBlock(where, block.id, { heading: e.target.value })}
              placeholder="Kop"
              className={field}
            />
            <RemoveButton
              label="Tekstblok verwijderen"
              onClick={() =>
                patch({
                  [where]: doc[where].filter((b) => b.id !== block.id),
                } as Partial<StudioDocument>)
              }
            />
          </div>
          <textarea
            value={block.body}
            onChange={(e) => patchBlock(where, block.id, { body: e.target.value })}
            placeholder="Tekst — een lege regel maakt een nieuwe alinea"
            rows={4}
            className={cn(field, "mt-2 resize-y leading-relaxed")}
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-muted max-lg:min-h-[36px]">
            <input
              type="checkbox"
              checked={block.callout}
              onChange={(e) => patchBlock(where, block.id, { callout: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--gronn-ember)]"
            />
            Als notitie met oranje streep
          </label>
        </div>
      ))}
      <AddButton
        onClick={() => patch({ [where]: [...doc[where], emptyBlock()] } as Partial<StudioDocument>)}
      >
        Tekstblok toevoegen
      </AddButton>
    </>
  )

  /* --------------------------------------------------------------- ui */

  return (
    <>
      <DocumentToolbar
        documents={docs}
        current={doc}
        isDraft={!stored}
        save={save}
        status={status}
        onSelectKind={chooseKind}
        onOpen={openDocument}
        onNew={() => start(doc.kind)}
        onExport={exportJson}
        onExportAll={exportArchive}
        onImport={(file) => void importJson(file)}
        onPrint={() => window.print()}
      />

      <div className="grid items-start lg:grid-cols-[380px_1fr]">
        {/* Editor pane */}
        <div className=// `--panel-bars-h` is the shell's top bar plus this toolbar, declared
        // once in globals.css. It used to be a hardcoded 57px that matched
        // only one of the toolbar's two heights.
        "doc-chrome border-b border-line/15 px-4 pb-16 pt-5 sm:px-5 lg:sticky lg:top-[var(--panel-bars-h)] lg:h-[calc(100svh-var(--panel-bars-h))] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          {/* On a phone the form comes first and the sheet below it — a
              long way down. One jump, so checking what the client will
              see is not a scroll through the whole form. */}
          <a
            href="#vel"
            className="tap-target inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-muted underline decoration-line/40 underline-offset-4 transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] lg:hidden"
          >
            Naar het vel ↓
          </a>
          <Section title="Document">
            <Label htmlFor="nummer">Nummer</Label>
            <input
              id="nummer"
              value={doc.number}
              onChange={(e) => patch({ number: e.target.value })}
              className={field}
            />
            <DateRow
              id="datum"
              label="Datum"
              text={doc.date}
              iso={doc.dateISO}
              onChange={({ text, iso }) => patch({ date: text, dateISO: iso })}
            />
            <DateRow
              id="deadline"
              label={isInvoice ? "Vervaldatum" : "Geldig tot"}
              text={doc.deadline}
              iso={doc.deadlineISO}
              onChange={({ text, iso }) => patch({ deadline: text, deadlineISO: iso })}
              quick={{
                label: `+${TERM_DAYS[doc.kind]} dagen`,
                onClick: () => {
                  const from = doc.dateISO || toISO(new Date())
                  const iso = addDaysISO(from, TERM_DAYS[doc.kind])
                  patch({ deadline: isoToDutch(iso), deadlineISO: iso })
                },
              }}
            />
            <Label htmlFor="klant">Klant</Label>
            <textarea
              id="klant"
              value={doc.client}
              onChange={(e) => patch({ client: e.target.value })}
              rows={2}
              className={cn(field, "resize-y")}
            />
            <Label htmlFor="extra-label">Extra regel — label en waarde</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                id="extra-label"
                value={doc.extraLabel}
                onChange={(e) => patch({ extraLabel: e.target.value })}
                placeholder="Uitvoering"
                className={field}
              />
              <input
                value={doc.extraValue}
                onChange={(e) => patch({ extraValue: e.target.value })}
                placeholder="Eén tot twee werkdagen"
                className={field}
              />
            </div>
          </Section>

          <Section title="Kop">
            <Label htmlFor="titel">Titel — enter maakt een nieuwe regel</Label>
            <textarea
              id="titel"
              value={doc.title}
              onChange={(e) => patch({ title: e.target.value })}
              rows={2}
              className={cn(field, "resize-y")}
            />
            <Label htmlFor="lead">Inleiding</Label>
            <textarea
              id="lead"
              value={doc.intro}
              onChange={(e) => patch({ intro: e.target.value })}
              rows={4}
              className={cn(field, "resize-y leading-relaxed")}
            />
          </Section>

          <Section title="Tekst boven de bedragen">{blockEditor("blocksBefore")}</Section>

          <Section title="Bedragen">
            {isInvoice ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Een factuur toont één bedrag per regel — de klant heeft zijn
                keuze al gemaakt. Varianten naast elkaar horen bij de offerte.
              </p>
            ) : (
              <>
                <Label htmlFor="kolommen">Kolommen</Label>
                <select
                  id="kolommen"
                  value={doc.columns}
                  onChange={(e) =>
                    patch({ columns: Number(e.target.value) as ColumnCount })
                  }
                  className={field}
                >
                  <option value={1}>Eén bedrag per regel</option>
                  <option value={2}>Twee varianten naast elkaar</option>
                  <option value={3}>Drie varianten naast elkaar</option>
                </select>
              </>
            )}

            <div className="grid grid-cols-2 items-end gap-2.5">
              <div>
                <div className="mb-1 mt-3 flex items-baseline justify-between gap-2">
                  <label htmlFor="btw" className="text-xs text-muted">
                    Btw %
                  </label>
                  {/* Wider gaps on a phone: three 10px numerals a fingertip
                      apart, each with a 44px press area (`tap-target`). */}
                  <span className="flex gap-[14px] lg:gap-1.5">
                    {[21, 9, 0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => patch({ vatRate: rate })}
                        className={cn(
                          "tap-target font-mono text-[10px] tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]",
                          doc.vatRate === rate
                            ? "text-gronn-ember"
                            : "text-muted hover:text-foreground"
                        )}
                      >
                        {rate}
                      </button>
                    ))}
                  </span>
                </div>
                <input
                  id="btw"
                  type="number"
                  min={0}
                  max={100}
                  value={doc.vatRate}
                  onChange={(e) => patch({ vatRate: Number(e.target.value) || 0 })}
                  className={field}
                />
              </div>
              <div>
                <Label htmlFor="kop-bedragen">Kop</Label>
                <input
                  id="kop-bedragen"
                  value={doc.amountsHeading}
                  onChange={(e) => patch({ amountsHeading: e.target.value })}
                  className={field}
                />
              </div>
            </div>

            {!isInvoice && doc.columns > 1 && (
              <div
                className={cn(
                  "mt-2 grid gap-2.5",
                  doc.columns === 2 ? "grid-cols-2" : "grid-cols-3"
                )}
              >
                {doc.variantNames.slice(0, doc.columns).map((name, i) => (
                  <div key={i}>
                    <Label htmlFor={`variant-${i}`}>Kolom {i + 1}</Label>
                    <input
                      id={`variant-${i}`}
                      value={name}
                      onChange={(e) => {
                        const names = [...doc.variantNames]
                        names[i] = e.target.value
                        patch({ variantNames: names })
                      }}
                      className={field}
                    />
                  </div>
                ))}
              </div>
            )}

            {doc.items.map((item) => (
              <div key={item.id} className="mt-2.5 rounded-lg border border-line/15 bg-surface/60 p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={item.description}
                    onChange={(e) => patchItem(item.id, { description: e.target.value })}
                    placeholder="Omschrijving"
                    className={field}
                  />
                  <RemoveButton
                    label="Regel verwijderen"
                    onClick={() => patch({ items: doc.items.filter((i) => i.id !== item.id) })}
                  />
                </div>
                <input
                  value={item.detail}
                  onChange={(e) => patchItem(item.id, { detail: e.target.value })}
                  placeholder="Toelichting (optioneel)"
                  className={cn(field, "mt-2")}
                />
                <div
                  className={cn(
                    "mt-2 grid gap-2",
                    doc.columns === 3 ? "grid-cols-3" : "grid-cols-1"
                  )}
                >
                  {Array.from({ length: doc.columns }, (_, k) => (
                    <div key={k}>
                      <label htmlFor={`${item.id}-${k}`} className="sr-only">
                        {doc.columns === 3 ? doc.variantNames[k] : "Bedrag"}
                      </label>
                      <input
                        id={`${item.id}-${k}`}
                        type="number"
                        step="0.01"
                        value={item.amounts[k] ?? ""}
                        onChange={(e) => patchAmount(item.id, k, e.target.value)}
                        placeholder={doc.columns === 3 ? doc.variantNames[k] : "Bedrag"}
                        disabled={item.included}
                        className={cn(field, item.included && "opacity-40")}
                      />
                    </div>
                  ))}
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-muted max-lg:min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={(e) => patchItem(item.id, { included: e.target.checked })}
                    className="h-4 w-4 accent-[color:var(--gronn-ember)]"
                  />
                  Toon als inbegrepen — telt niet mee in het totaal
                </label>
              </div>
            ))}
            <AddButton onClick={() => patch({ items: [...doc.items, emptyItem()] })}>
              Regel toevoegen
            </AddButton>
          </Section>

          <Section title="Tekst onder de bedragen">{blockEditor("blocksAfter")}</Section>

          <Section title="Briefhoofd">
            <div role="group" aria-label="Briefhoofd" className="mt-1 space-y-1.5">
              {MASTHEAD_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors",
                    doc.masthead === option.id
                      ? "border-gronn-green bg-surface"
                      : "border-line/15 hover:border-line/30"
                  )}
                >
                  <input
                    type="radio"
                    name="masthead"
                    checked={doc.masthead === option.id}
                    onChange={() => patch({ masthead: option.id })}
                    className="mt-0.5 h-4 w-4 accent-[color:var(--gronn-ember)]"
                  />
                  <span>
                    <span className="block text-sm text-foreground">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">
                      {option.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Alleen voor jou">
            <Label htmlFor="note">Interne notitie — komt niet op het vel</Label>
            <textarea
              id="note"
              value={doc.note}
              onChange={(e) => patch({ note: e.target.value })}
              rows={3}
              className={cn(field, "resize-y leading-relaxed")}
            />
            {isInvoice && (
              <label className="mt-3 flex items-center gap-2 text-sm text-foreground max-lg:min-h-[36px]">
                <input
                  type="checkbox"
                  checked={doc.paid}
                  onChange={(e) => patch({ paid: e.target.checked })}
                  className="h-4 w-4 accent-[color:var(--gronn-green)]"
                />
                Betaald
              </label>
            )}
          </Section>

          <Section title="Beheer">
            {!isInvoice && (
              <>
                <Label htmlFor="convert-variant">
                  Offerte geaccepteerd? Maak er de factuur van
                </Label>
                {doc.columns === 1 ? (
                  <button
                    type="button"
                    onClick={() => convertToInvoice(0)}
                    className="w-full rounded-md bg-gronn-green px-3 py-2 text-sm text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
                  >
                    Factuur maken
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {doc.variantNames.slice(0, doc.columns).map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => convertToInvoice(i)}
                        className="flex-1 rounded-md bg-gronn-green px-3 py-2 text-sm text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
                      >
                        Factuur van {name}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  De offerte zelf blijft staan — je krijgt een nieuwe factuur met
                  hetzelfde werk, de gekozen prijs, een nieuw nummer en de
                  betaaltermijn.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={duplicateDocument}
              className="mt-4 w-full rounded-md border border-line/20 px-3 py-2 text-sm text-foreground transition-colors hover:border-gronn-green focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Dupliceren
            </button>
            <button
              type="button"
              onClick={removeDocument}
              className="mt-2 w-full rounded-md border border-line/20 px-3 py-2 text-sm text-muted transition-colors hover:border-gronn-ember hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Dit document verwijderen
            </button>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Documenten staan in je eigen archief, achter dezelfde login als
              dit paneel — niet meer alleen in deze browser. Je opent ze dus
              ook op je telefoon, en een gewiste browser kost je niets. De pdf
              blijft het echte stuk voor de administratie.
            </p>
          </Section>
        </div>

        {/* The sheet, scaled to fit the stage */}
        <div
          ref={stage}
          id="vel"
          /* min-w-0: a grid column is min-content wide by default, so
             the 210mm page would push the column wider than the screen
             and the stage would never measure a constraint to fit to. */
          // `scroll-mt`: "Naar het vel" lands below the two sticky bars
          // a phone has (the top bar and the 65px strip), not under them.
          className="doc-stage flex min-w-0 scroll-mt-[calc(var(--panel-topbar-h)+65px)] justify-center overflow-hidden bg-gronn-mineral/15 p-4 sm:p-7 lg:scroll-mt-0"
        >
          <div
            className="doc-scaler"
            style={width ? { width, height } : undefined}
          >
            <div ref={sheet} style={{ "--doc-scale": scale } as React.CSSProperties}>
              <DocumentSheet doc={doc} iban={iban} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
