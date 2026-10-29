import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { projectUrl, warnOnce } from "@/lib/supabase-url"

// The database connection, and the two rules around it.
//
// FIRST: this module is server-only, enforced by the import above rather
// than by remembering. The service-role key bypasses every row-level
// policy in the schema, so a single accidental import from a client
// component would put it in a JavaScript chunk anyone can request. This
// repository has already shipped a secret that way once — the studio's
// IBAN, in the bundle until #89 — and that was only an account number.
//
// SECOND: a missing configuration is not an error. CI runs `next build`
// and the whole Playwright suite with no database and no secrets, and
// every path that touches this has to render a signed-out state without
// a connection. So this returns null rather than throwing, and every
// caller is forced by the type to say what happens when there is no
// database. That is not defensive politeness; it is the difference
// between a green pipeline and one that cannot run at all.

// Validated, and named so it does not shadow the global `URL`. Same
// reason as in `client-auth.ts`: a truthiness guard let a malformed
// value reach `createClient`, which throws synchronously.
const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROJECT_URL = projectUrl(RAW_URL)
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/** Is there a database to talk to at all? */
export function hasDatabase(): boolean {
  return Boolean(PROJECT_URL && SERVICE_KEY)
}

/**
 * Does the SERVER hold this project's credentials, right now?
 *
 * Read at call time and off the service-role key on purpose, and both
 * details carry the whole value of this function.
 *
 * `NEXT_PUBLIC_*` is INLINED at build. A deployment built before those
 * variables existed carries `undefined` in its JavaScript forever, and
 * no amount of setting them afterwards changes that bundle — so the
 * public variables cannot tell you whether the project is configured,
 * only whether it was configured when this build ran. The service-role
 * key is never inlined anywhere; it is a genuine runtime lookup.
 *
 * So: server yes, browser no is not "no project". It is "this build
 * predates the keys, or they are not scoped to this environment" — the
 * two things an owner can actually fix, and the difference between a
 * sign-in screen that says "ring the studio" and one that says what is
 * wrong.
 */
export function serverHasProject(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Is a project URL configured but not usable as one?
 *
 * The third case, and it needs its own answer because the advice
 * differs. `NEXT_PUBLIC_*` is inlined at build on BOTH sides, so this
 * reads the value the build was given:
 *
 *   nothing here, service key present  →  the build predates the keys,
 *                                         or they are not scoped to this
 *                                         environment. Redeploy.
 *   something here, and it is not a URL →  the value itself is wrong.
 *                                         Redeploying changes nothing.
 *
 * Telling somebody to redeploy over a pair of stray quotes would send
 * them round the loop that produced the outage in the first place.
 */
export function serverUrlMalformed(): boolean {
  return Boolean(RAW_URL) && !PROJECT_URL
}

/**
 * The service-role client: bypasses RLS, so it is the owner's hand.
 *
 * Every write in this application goes through here, from a route that
 * has already established who is asking. The policies in
 * `supabase/migrations` are the second lock, not the first — they exist
 * so that a mistake in a route cannot become a client reading another
 * client's garden.
 */
export function serviceClient(): SupabaseClient | null {
  if (!SERVICE_KEY) return null
  if (!PROJECT_URL) {
    if (RAW_URL) warnOnce("NEXT_PUBLIC_SUPABASE_URL", RAW_URL)
    return null
  }
  return createClient(PROJECT_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
