"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn } from "next-auth/react"
import { LockIcon, UserIcon } from "lucide-react"

import { Logo } from "@/components/logo"

// Two doors to one panel.
//
// The studio signs in with Google and gets the full dashboard. A client
// signs in with an e-mail address and gets a dashboard of their own —
// not this one with things taken away, but a different set of surfaces
// built from their own dossier. `nav.ts` keeps the two rails apart for
// the same reason.
//
// Which door someone needs is not something to make them guess at, so
// both are on screen with a sentence saying who each is for. Design rule
// 1: a control a first-time visitor cannot name is a defect, and half
// the people reaching this page will be clients who have never seen it.
//
// This is a component the page RETURNS instead of its content, not a
// redirect, and that is the security property: an unauthenticated
// request receives this markup and nothing read from storage — no
// document, no client name, no amount.
export function PanelGate() {
  const pathname = usePathname()

  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-md">
        <Logo className="mx-auto h-9 w-auto" />
        <h1 className="mt-7 text-center font-heading text-2xl font-semibold tracking-tight">
          Inloggen
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">
          Dit paneel is niet openbaar en staat niet in zoekmachines.
        </p>

        <div className="mt-8 space-y-3">
          {/* The client door first: more people arrive here needing it. */}
          <div className="rounded-xl border border-line/20 bg-surface p-5">
            <p className="flex items-center gap-2 font-heading text-[15px] font-semibold">
              <UserIcon size={16} aria-hidden />
              Klant
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Bekijk je tuin, je abonnement en je aanvragen.
            </p>
            <Link
              href="/clients/login"
              className="tap-target mt-4 block rounded-full bg-gronn-green px-5 py-2.5 text-center text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Inloggen met e-mail
            </Link>
          </div>

          <div className="rounded-xl border border-line/20 bg-surface p-5">
            <p className="flex items-center gap-2 font-heading text-[15px] font-semibold">
              <LockIcon size={16} aria-hidden />
              Studio
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Alleen voor intern gebruik — het account van de studio zelf.
            </p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: pathname })}
              className="tap-target mt-4 w-full rounded-full border border-line/25 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-gronn-ember active:border-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Inloggen met Google
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[13px] text-muted">
          Nog geen klantaccount?{" "}
          <Link
            href="/clients/registreren"
            className="tap-target underline underline-offset-4 transition-colors hover:text-gronn-ember active:text-gronn-ember"
          >
            Registreer je hier
          </Link>
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="tap-target font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-gronn-ember active:text-gronn-ember"
          >
            Terug naar gronn.studio
          </Link>
        </div>
      </div>
    </main>
  )
}

/** The name the rest of the panel already imports. */
export { PanelGate as OwnerGate }
