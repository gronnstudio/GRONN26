import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
}

// The offline field marker — precached by the service worker and shown
// when a navigation fails without a network. Same visual language as
// the 404: a lost coordinate in the landscape. Static and bare (no site
// chrome): both languages render, because without a network there is no
// locale context to resolve.
export default function Offline() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <p
        aria-hidden
        className="pointer-events-none absolute select-none font-heading text-[28vw] font-semibold leading-none text-foreground/[0.05]"
      >
        ⌀
      </p>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--ember-text)]">
        Offline
      </p>
      <h1 className="mt-6 max-w-2xl font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        No signal from the field.
      </h1>
      <p className="mt-4 max-w-md text-muted">
        Geen verbinding — controleer je netwerk en probeer het opnieuw.
      </p>
      {/* A plain anchor on purpose: "try again" must be a full network
          request, not a client-side route change that would fail against
          the same dead connection. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="mt-10 inline-block rounded-full bg-gronn-green px-7 py-3.5 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong"
      >
        Try again — Probeer opnieuw
      </a>
    </main>
  )
}
