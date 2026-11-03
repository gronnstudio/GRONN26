"use client"

import { useState } from "react"

import {
  browserUrlMalformed,
  clientAuthBrowser,
} from "@/lib/client-auth-browser"
import { authMessage, BAD_URL, STALE_BUILD, UNCONFIGURED } from "../auth-messages"
import { Field, submitButton } from "../auth-shell"

export function ForgotForm({
  /**
   * Whether the SERVER can see the project. Passed from the page, which
   * reads the service-role key at request time — the one credential
   * that is not frozen into the JavaScript when the site is built.
   */
  serverHasProject = false,
  serverUrlMalformed = false,
}: { serverHasProject?: boolean; serverUrlMalformed?: boolean } = {}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const supabase = clientAuthBrowser()
    if (!supabase) {
      // Three faults, three sentences, because the fix differs each
      // time. A value that is not a URL is not repaired by a redeploy;
      // a build older than the keys is not repaired by editing them;
      // and telling either visitor to ring the studio sent the owner to
      // ring themselves.
      // The browser's own copy is asked FIRST. What it holds was frozen
      // at build time and need not match what the server reads now, and
      // it is the copy that actually failed.
      setError(
        browserUrlMalformed() || serverUrlMalformed
          ? BAD_URL
          : serverHasProject
            ? STALE_BUILD
            : UNCONFIGURED
      )
      return
    }
    setBusy(true)
    setError(null)
    const { error: failed } = await supabase.auth.resetPasswordForEmail(
      String(form.get("email") ?? "").trim(),
      {
        redirectTo: `${window.location.origin}/api/clients/auth/callback?next=/clients/wachtwoord-herstellen`,
      }
    )
    // A rate limit is worth showing, because it tells the visitor to
    // wait rather than to keep pressing. Anything else is swallowed: see
    // the confirmation copy below for why.
    if (failed && /rate limit|too many/i.test(failed.message)) {
      setError(authMessage(failed.message))
      setBusy(false)
      return
    }
    setSent(true)
    setBusy(false)
  }

  if (sent) {
    return (
      <div className="mt-7 rounded-lg border border-line/25 bg-surface p-5 text-left">
        <p className="font-heading text-[15px] font-semibold">
          Als dit adres bij ons bekend is, is de mail onderweg
        </p>
        {/* Phrased as a condition on purpose. "Onbekend adres" would let
            anyone use this form to find out who is a client of the
            studio, one address at a time. */}
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          In die mail staat een link waarmee je een nieuw wachtwoord instelt. De
          link is beperkt geldig. Kijk ook in ongewenste mail.
        </p>
      </div>
    )
  }

  /**
   * The handler, with a floor under it.
   *
   * `onSubmit` is async, so anything it throws rejects a promise nobody
   * awaits: React discards the rejection and the screen shows no
   * message, no spinner and no navigation. A visitor presses the button
   * and the page declines to react — which is precisely what a malformed
   * Supabase URL did here, because `createBrowserClient` throws
   * synchronously and the throw landed outside every catch.
   *
   * "Er ging iets mis" is a poor answer. It is an infinitely better one
   * than silence, and the console keeps the detail.
   */
  const guarded = (event: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(event).catch((cause) => {
      console.error("[gronn] sign-in form failed", cause)
      setError(authMessage(undefined))
      setBusy(false)
    })
  }

  return (
    <form onSubmit={guarded}>
      <Field id="email" label="E-mailadres" type="email" autoComplete="email" />
      {error && (
        <p
          aria-live="polite"
          className="mt-4 text-[13px] leading-relaxed text-[color:var(--ember-text)]"
        >
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={submitButton}>
        {busy ? "Bezig…" : "Stuur mij een herstellink"}
      </button>
    </form>
  )
}
