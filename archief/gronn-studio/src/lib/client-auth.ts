import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { SupabaseClient, User } from "@supabase/supabase-js"

import { projectUrl, warnOnce } from "@/lib/supabase-url"

// The CLIENT side of authentication — a household reading its own
// garden, not the studio reading all of them.
//
// `lib/auth.ts` already says why this is a separate file rather than a
// widened helper: every owner route reads `if (!session) return 401`,
// which is indistinguishable from a presence check, and there are nine
// of them. If client sessions came back from `getOwnerSession`, those
// nine would silently become "is anyone signed in" over the studio's
// invoices and photographs of clients' houses. So: different helper,
// different cookie, different provider, and no code path where one can
// be mistaken for the other.
//
// Two things about this file are load-bearing:
//
// FIRST, the anon key. It is public by design and safe to inline — it
// is what row-level security is written against. Every read here goes
// through a client holding the VISITOR's token, never the service role,
// so the policies in supabase/migrations decide what comes back. Using
// the service role here would work, look identical in development, and
// quietly turn the database's guarantee back into an `if` in
// application code.
//
// SECOND, `getUser` and never `getSession`. `getSession` reads the
// cookie and believes it. `getUser` asks the auth server whether the
// token is real. On a server that is the entire difference between a
// session and a forged cookie, and it is why every gate below awaits a
// network call rather than reading a JWT it already has.

// `PROJECT_URL`, not `URL`: the old name shadowed the global `URL`
// constructor for this whole module, which the validation below needs.
//
// `projectUrl` rather than the raw value, because a truthiness guard is
// what turned a pasted pair of quotes into a site-wide 500 — see
// `lib/supabase-url.ts` for the whole account.
const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROJECT_URL = projectUrl(RAW_URL)
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Is there an auth service configured at all?
 *
 * Same contract as `hasDatabase()` in `lib/supabase.ts`, for the same
 * reason: CI builds and runs the whole Playwright suite with no Supabase
 * project, so every surface here has to render a signed-out state
 * without one. A missing configuration is a state, not a crash.
 */
export function hasClientAuth(): boolean {
  return Boolean(PROJECT_URL && ANON_KEY)
}

/**
 * A Supabase client bound to this request's cookies.
 *
 * Returns null when unconfigured, so callers are forced by the type to
 * say what happens with no auth service rather than discovering it in
 * front of a visitor.
 */
export async function clientAuthServer(): Promise<SupabaseClient | null> {
  if (!ANON_KEY) return null
  if (!PROJECT_URL) {
    // Configured with something that is not a URL. Null, the same as
    // unconfigured, because that is what the caller can do something
    // about — and a log line so the cause is not invisible.
    if (RAW_URL) warnOnce("NEXT_PUBLIC_SUPABASE_URL", RAW_URL)
    return null
  }
  const store = await cookies()
  // No try around this any more, and that is main's fix rather than
  // mine: `PROJECT_URL` is a value that has already been PARSED as a
  // URL, so the throw that took production down cannot start here — it
  // is refused above, with a log line, before a client is ever built.
  // Validating up front beats catching afterwards.
  return createServerClient(PROJECT_URL, ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options)
          }
        } catch {
          // A Server Component cannot set cookies. That is not an error
          // here: the refreshed token is written by the route handler or
          // the proxy on the next request that can write, and the read
          // this call is serving still succeeds.
        }
      },
    },
  })
}

/**
 * The signed-in client, verified against the auth server.
 *
 * Null covers three different situations on purpose — nobody signed in,
 * a cookie that does not verify, and no auth service configured. All
 * three mean the same thing to every caller: show the sign-in screen.
 */
export async function getClientUser(): Promise<User | null> {
  const supabase = await clientAuthServer()
  if (!supabase) return null
  try {
    // getUser, not getSession — see the note at the top of this file.
    // And it is a NETWORK CALL, which is why this is wrapped: an
    // unreachable or not-yet-provisioned Supabase project makes it
    // reject rather than return `{ error }`.
    //
    // This shipped unwrapped once and took production down. `getPanelViewer`
    // asks this question before every surface in the panel, so a throw
    // here is not "the client portal is unavailable" — it is a 500 on
    // the studio's own dashboard, caused by a service the studio's own
    // sign-in does not use. Unreachable means not signed in, which is
    // the same contract `lib/supabase.ts` states for the database:
    // a missing configuration is a state, not a crash.
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user
  } catch {
    return null
  }
}
