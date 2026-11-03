"use client"

import Link from "next/link"
import { signIn, signOut } from "next-auth/react"

import { useEffect } from "react"

import { Logo } from "@/components/logo"
import { useT } from "@/components/language-provider"
import { EDITOR_HINT_KEY } from "@/editor/editor-context"

// Sign-in screen for the site editor. Deliberately quiet: brand tile,
// one labeled action. Only the studio's Google account is accepted —
// anyone else is bounced by the server-side allowlist.
export function EditorGate({ signedIn }: { signedIn: boolean }) {
  const t = useT()

  // The hint tells the (visitor-inert) EditorProvider on public pages
  // that arming edit mode is worth a session check.
  useEffect(() => {
    if (signedIn) localStorage.setItem(EDITOR_HINT_KEY, "1")
    else localStorage.removeItem(EDITOR_HINT_KEY)
  }, [signedIn])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-6 text-center">
      <Logo className="h-10 w-auto" />

      {signedIn ? (
        <>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {t({ en: "Editing is on", nl: "Bewerken staat aan" })}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
              {t({
                en: "Open any page of the site — editable text and images light up when you hover them. Publish from the toolbar when you're done.",
                nl: "Open een willekeurige pagina van de site — bewerkbare teksten en foto's lichten op als je eroverheen beweegt. Publiceer via de werkbalk als je klaar bent.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-gronn-green px-6 py-3 text-sm text-gronn-white transition-colors hover:bg-gronn-green/90"
            >
              {t({ en: "Go to the site", nl: "Naar de site" })}
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(EDITOR_HINT_KEY)
                signOut({ callbackUrl: "/" })
              }}
              className="rounded-full border border-line/25 px-6 py-3 text-sm text-muted transition-colors hover:border-gronn-ember hover:text-foreground"
            >
              {t({ en: "Sign out", nl: "Uitloggen" })}
            </button>
          </div>

          {/* Mirror of the owner panel's group: one sign-on covers both
              private surfaces, so each names the other — without this the
              paperwork side is reachable only by typing its URL. */}
          <nav
            aria-label={t({ en: "Restricted", nl: "Besloten" })}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              {t({ en: "Restricted", nl: "Besloten" })}
            </span>
            {/* Stated, not linked — this is the page you are on. The ember
                mark shows sighted visitors what aria-current announces. */}
            <span
              aria-current="page"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <span aria-hidden className="size-1 rounded-full bg-gronn-ember" />
              {t({ en: "Site editor", nl: "Site-editor" })}
            </span>
            <Link
              href="/dashboard"
              className="underline-draw text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              {t({ en: "Quotes & invoices", nl: "Offertes & facturen" })}
            </Link>
          </nav>
        </>
      ) : (
        <>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {t({ en: "Site editor", nl: "Site-editor" })}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
              {t({
                en: "Sign in with the studio's Google account to edit text and images directly on the site.",
                nl: "Log in met het Google-account van de studio om teksten en foto's direct op de site te bewerken.",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/editor" })}
            className="rounded-full bg-gronn-green px-6 py-3 text-sm text-gronn-white transition-colors hover:bg-gronn-green/90"
          >
            {t({ en: "Sign in with Google", nl: "Inloggen met Google" })}
          </button>
        </>
      )}

      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted underline-draw hover:text-foreground"
      >
        {t({ en: "Back to gronn.studio", nl: "Terug naar gronn.studio" })}
      </Link>
    </div>
  )
}
