import Link from "next/link"

import { Logo } from "@/components/logo"

// The frame every client-facing auth screen sits in.
//
// Dutch only, like the owner panel: this is the studio's own portal for
// its own clients, not a page a visitor lands on from a search result,
// so it does not carry the site's EN/NL machinery.
//
// Deliberately plainer than the marketing site. Someone reaching this
// screen is trying to get in, not to be persuaded — the fine line-work
// and the survey annotations would be decoration in the way of a task.
export function AuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string
  intro: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto h-9 w-auto" />
        <h1 className="mt-7 text-center font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">
          {intro}
        </p>
        {children}
        {footer && (
          <div className="mt-6 space-y-2 text-center text-[13px] text-muted">
            {footer}
          </div>
        )}
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

/** One labelled field. Every control on these screens carries a visible
 *  label — design rule 1, and doubly so on a form people fail at. */
export function Field({
  id,
  label,
  type,
  autoComplete,
  required = true,
  hint,
}: {
  id: string
  label: string
  type: string
  autoComplete?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div className="mt-4 text-left">
      <label
        htmlFor={id}
        className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        // 16px on a phone, and it is one pixel that matters: below 16
        // iOS Safari zooms the page in on focus and does not zoom back
        // out. This sat at 15, so signing in on a phone left the reader
        // zoomed into a form they then had to pan around. `sm:` keeps
        // the 15px the sheet was drawn at everywhere else.
        className="mt-1.5 w-full rounded-lg border border-line/30 bg-surface px-3.5 py-2.5 text-[16px] text-foreground outline-none transition-colors focus-visible:border-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)] sm:text-[15px]"
      />
      {hint && <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{hint}</p>}
    </div>
  )
}

export const submitButton =
  "tap-target mt-6 w-full rounded-full bg-gronn-green px-5 py-3 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"

// `tap-target` because these are 14-16px lines of text that are
// nonetheless the only way out of a form: "forgotten your password",
// "register here". The drawn line stays a line; only the pressed area
// becomes 44px, out of flow, so the sentence around it does not move.
export const quietLink =
  "tap-target underline underline-offset-4 transition-colors hover:text-gronn-ember active:text-gronn-ember"
