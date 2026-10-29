"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  browserUrlMalformed,
  clientAuthBrowser,
} from "@/lib/client-auth-browser"
import { authMessage, BAD_URL, STALE_BUILD, UNCONFIGURED } from "../auth-messages"
import { Field, quietLink, submitButton } from "../auth-shell"

export function LoginForm({
  /**
   * Whether the SERVER can see the project. Passed from the page, which
   * reads the service-role key at request time — the one credential
   * that is not frozen into the JavaScript when the site is built.
   */
  serverHasProject = false,
  serverUrlMalformed = false,
}: { serverHasProject?: boolean; serverUrlMalformed?: boolean } = {}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    const { error: failed } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    })
    if (failed) {
      setError(authMessage(failed.message))
      setBusy(false)
      return
    }
    // Signing in is also when a dossier gets claimed. It cannot happen at
    // registration: the account is unconfirmed then, and linking on an
    // unconfirmed address would hand a stranger somebody's garden. By the
    // first successful sign-in the address is proven, so this is the
    // earliest safe moment — and it is harmless on every later one.
    await fetch("/api/clients/link", { method: "POST" }).catch(() => {})
    // refresh() first: the portal is server-rendered from the session
    // cookie this call just set, and pushing without it can render the
    // page against the previous (signed-out) state.
    router.refresh()
    router.push("/dashboard")
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
    <form onSubmit={guarded} noValidate={false}>
      <Field id="email" label="E-mailadres" type="email" autoComplete="email" />
      <Field
        id="password"
        label="Wachtwoord"
        type="password"
        autoComplete="current-password"
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
        {busy ? "Bezig…" : "Inloggen"}
      </button>
      <p className="mt-5 text-center text-[13px] text-muted">
        <Link href="/clients/wachtwoord-vergeten" className={quietLink}>
          Wachtwoord vergeten?
        </Link>
      </p>
    </form>
  )
}
