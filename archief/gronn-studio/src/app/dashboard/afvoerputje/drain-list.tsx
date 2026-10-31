"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import type { IntakeSubmission } from "@/lib/intake-archive"

// The floor of the drain.
//
// Everything else in the panel is reversible. This is the one surface
// where something stops existing, and it is the whole reason the button
// on an enquiry no longer does that itself: two decisions, taken in two
// places, with the second one taken in front of a count of what it will
// destroy.
//
// The count matters more than the wording. "Weet je het zeker" says
// nothing; "en de 7 foto's die eronder staan" is the sentence that stops
// somebody who forgot the photographs were the only copy.

function when(iso: string | undefined): string {
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

export function DrainList({ deleted }: { deleted: IntakeSubmission[] }) {
  return (
    <div className="min-w-0">
      <h1 className="font-heading text-[clamp(1.6rem,3.4vw,2.2rem)] font-semibold tracking-tight">
        Afvoerputje
      </h1>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">
        Weggehaalde aanvragen wachten hier. Ze staan niet meer in de lijst en
        tellen nergens mee, maar er is nog niets weg — de antwoorden en de
        bestanden staan er precies zoals ze binnenkwamen. Terugzetten kan
        altijd. Definitief weggooien kan alleen hier, en dan is het echt weg.
      </p>

      {deleted.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line/20 p-6 text-sm leading-relaxed text-muted">
          Het putje is leeg.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {deleted.map((s) => (
            <Row key={s.reference} s={s} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Row({ s }: { s: IntakeSubmission }) {
  const router = useRouter()
  const [busy, setBusy] = useState<"restore" | "purge" | null>(null)
  const [arming, setArming] = useState(false)
  const [failed, setFailed] = useState("")

  const restore = async () => {
    if (busy) return
    setBusy("restore")
    setFailed("")
    try {
      const res = await fetch(
        `/api/admin/intake/${encodeURIComponent(s.reference)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleted: false }),
        }
      )
      if (!res.ok) throw new Error("refused")
      router.refresh()
    } catch {
      setFailed("Terugzetten is niet gelukt. De aanvraag staat er nog.")
      setBusy(null)
    }
  }

  // The only irreversible call in the panel. It reaches the same DELETE
  // handler the button used to reach directly, unchanged — the guard was
  // never the problem, the single click was.
  const purge = async () => {
    if (busy) return
    setBusy("purge")
    setFailed("")
    try {
      const res = await fetch(
        `/api/admin/intake/${encodeURIComponent(s.reference)}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("refused")
      setArming(false)
      router.refresh()
    } catch {
      setFailed("Verwijderen is niet gelukt. Er is niets weggegooid.")
      setBusy(null)
    }
  }

  const files = s.files.length

  return (
    <li className="rounded-lg border border-line/20 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold tracking-tight">
            {s.project || s.reference}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {s.name || "zonder naam"} · binnengekomen {when(s.receivedAt)}
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          weggehaald {when(s.deletedAt)}
          {files > 0 && (
            <>
              {" · "}
              <span className="tabular-nums text-accent">
                {files} {files === 1 ? "bestand" : "bestanden"}
              </span>
            </>
          )}
        </p>
      </div>

      {!arming ? (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={restore}
            disabled={busy !== null}
            className="tap-target rounded-full bg-gronn-green px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-colors hover:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70"
          >
            {busy === "restore" ? "Bezig…" : "Terugzetten"}
          </button>
          <button
            type="button"
            onClick={() => setArming(true)}
            disabled={busy !== null}
            className={action}
          >
            Definitief verwijderen
          </button>
        </div>
      ) : (
        <div
          className="mt-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setArming(false)
          }}
        >
          <p className="max-w-[62ch] text-[13px] leading-relaxed text-foreground">
            {files === 0 ? (
              <>
                Dit wist de aanvraag en alles wat eronder staat. Het kan niet
                ongedaan gemaakt worden.
              </>
            ) : (
              <>
                Dit wist de aanvraag én{" "}
                {files === 1 ? "het bestand" : `de ${files} bestanden`} die
                eronder {files === 1 ? "staat" : "staan"}. Daarvan heeft de
                studio geen tweede kopie. Het kan niet ongedaan gemaakt worden.
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              autoFocus
              onClick={purge}
              disabled={busy !== null}
              className="tap-target rounded-full bg-gronn-ember-strong px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
            >
              {busy === "purge" ? "Bezig…" : "Ja, wis alles"}
            </button>
            <button
              type="button"
              onClick={() => setArming(false)}
              disabled={busy !== null}
              className={action}
            >
              Annuleer
            </button>
          </div>
        </div>
      )}

      {failed && (
        <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--ember-text)]">
          {failed}
        </p>
      )}
    </li>
  )
}
