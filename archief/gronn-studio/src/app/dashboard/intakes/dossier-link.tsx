"use client"

import { useState } from "react"

import type { IntakeSubmission } from "@/lib/intake-archive"

// "Van aanvraag naar dossier" — the join the archive has carried a field
// for since it was written, with nothing in the panel to set it.
//
// It is a deliberate act by the owner, never an inference. The enquiry's
// contact field is labelled "Telefoon / e-mail" and frequently holds a
// phone number, so there is nothing here to match on safely; guessing
// would eventually attach one household's garden to another, which is
// the single failure the client portal exists to prevent.
//
// The client list is fetched when the control is OPENED rather than
// rendered into the page. Every dossier's name, address and phone number
// would otherwise be in the markup of a page about one enquiry — an
// owner-only page, but the whole list travelling to read one record is
// more than the job needs.

type AdminClient = {
  id: string
  name: string
  email: string | null
}

const control =
  "tap-target rounded-full border border-line/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"

export function DossierLink({ s }: { s: IntakeSubmission }) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<AdminClient[] | null>(null)
  const [linkedTo, setLinkedTo] = useState<string | null>(s.clientId ?? null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const linkedName =
    clients?.find((c) => c.id === linkedTo)?.name ?? (linkedTo ? "een dossier" : null)

  async function load() {
    setOpen(true)
    if (clients) return
    setBusy(true)
    setNote(null)
    try {
      const res = await fetch("/api/admin/clients")
      if (!res.ok) throw new Error("refused")
      const body = (await res.json()) as { clients?: AdminClient[] }
      setClients(body.clients ?? [])
    } catch {
      // A database that did not answer is not a studio with no clients.
      setNote("De dossiers konden niet gelezen worden. Er is niets gewijzigd.")
    } finally {
      setBusy(false)
    }
  }

  async function link(clientId: string | null) {
    setBusy(true)
    setNote(null)
    try {
      const res = await fetch(
        `/api/admin/intake/${encodeURIComponent(s.reference)}/link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        }
      )
      if (!res.ok) throw new Error("refused")
      const body = (await res.json()) as { clientId?: string | null }
      setLinkedTo(body.clientId ?? null)
      setOpen(false)
      setNote(clientId ? "Gekoppeld." : "Ontkoppeld.")
    } catch {
      setNote("Koppelen lukte niet. Er is niets gewijzigd.")
    } finally {
      setBusy(false)
    }
  }

  async function createFromIntake() {
    setBusy(true)
    setNote(null)
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name || s.project || s.reference,
          // The intake asks for "Telefoon / e-mail" in one field, so this
          // is the only honest reading of it: an address if it looks like
          // one, otherwise a phone number. A dossier without an address
          // simply cannot be claimed by a registration yet, which is the
          // right outcome — not a reason to store a phone number in the
          // column a login is matched against.
          email: s.contact.includes("@") ? s.contact : null,
          phone: s.contact.includes("@") ? null : s.contact,
          note: `Aangemaakt vanuit aanvraag ${s.reference}`,
        }),
      })
      if (!res.ok) throw new Error("refused")
      const body = (await res.json()) as { client?: AdminClient }
      if (!body.client) throw new Error("empty")
      setClients((list) => [body.client!, ...(list ?? [])])
      await link(body.client.id)
    } catch {
      setNote("Aanmaken lukte niet. Er is niets gewijzigd.")
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 border-t border-line/15 pt-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Dossier
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
        {linkedTo
          ? `Deze aanvraag hoort bij ${linkedName}.`
          : "Deze aanvraag hoort nog bij geen enkel dossier."}
      </p>

      {!open ? (
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button type="button" onClick={load} className={control}>
            {linkedTo ? "Wijzig dossier" : "Koppel aan dossier"}
          </button>
          {linkedTo && (
            <button
              type="button"
              onClick={() => link(null)}
              disabled={busy}
              className={control}
            >
              Ontkoppel
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3">
          {busy && !clients && (
            <p className="text-[13px] text-muted">Dossiers laden…</p>
          )}
          {clients && clients.length > 0 && (
            <ul className="max-h-56 space-y-1.5 overflow-y-auto">
              {clients.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => link(c.id)}
                    disabled={busy}
                    className="w-full rounded-lg border border-line/20 px-3.5 py-2.5 text-left transition-colors hover:border-gronn-ember disabled:opacity-60"
                  >
                    <span className="block text-[14px] text-foreground">
                      {c.name}
                    </span>
                    {c.email && (
                      <span className="mt-0.5 block font-mono text-[11px] text-muted">
                        {c.email}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {clients && clients.length === 0 && (
            <p className="text-[13px] leading-relaxed text-muted">
              Er zijn nog geen dossiers.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={createFromIntake}
              disabled={busy}
              className="tap-target rounded-full bg-gronn-green px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gronn-white transition-colors hover:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? "Bezig…" : "Maak dossier van deze aanvraag"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className={control}
            >
              Annuleer
            </button>
          </div>
        </div>
      )}

      {note && (
        <p aria-live="polite" className="mt-2.5 text-[13px] text-foreground">
          {note}
        </p>
      )}
    </div>
  )
}
