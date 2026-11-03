"use client"

import { useState } from "react"

import {
  browserUrlMalformed,
  clientAuthBrowser,
} from "@/lib/client-auth-browser"
import { authMessage, BAD_URL, STALE_BUILD, UNCONFIGURED } from "../auth-messages"
import { Field, submitButton } from "../auth-shell"

export function RegisterForm({
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
    const password = String(form.get("password") ?? "")
    if (password.length < 8) {
      setError("Kies een wachtwoord van minstens acht tekens.")
      return
    }
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
    const { error: failed } = await supabase.auth.signUp({
      email: String(form.get("email") ?? "").trim(),
      password,
      options: {
        // Where the link in the confirmation mail lands. It carries a
        // code that only a server route can exchange for a session, which
        // is why this points at a route handler and not at a page.
        emailRedirectTo: `${window.location.origin}/api/clients/auth/callback?next=/dashboard`,
      },
    })
    if (failed) {
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
          Kijk in je mail
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          We hebben je een link gestuurd. Klik erop om je adres te bevestigen —
          daarna kun je inloggen. Niets gekregen? Kijk ook in ongewenste mail.
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
      <Field
        id="email"
        label="E-mailadres"
        type="email"
        autoComplete="email"
        hint="Gebruik het adres dat de studio van je kent — daarmee vinden we je dossier."
      />
      <Field
        id="password"
        label="Nieuw wachtwoord"
        type="password"
        autoComplete="new-password"
        hint="Minstens acht tekens."
      />
      {error && (
        <p
          aria-live="polite"
          className="mt-4 text-[13px] leading-relaxed text-[color:var(--ember-text)]"
        >
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={submitButton}>
        {busy ? "Bezig…" : "Account aanmaken"}
      </button>
    </form>
  )
}
