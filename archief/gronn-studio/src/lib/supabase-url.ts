// What counts as a Supabase project URL, in one place.
//
// This module exists because of an outage. `NEXT_PUBLIC_SUPABASE_URL`
// was set in Vercel with the value wrapped in quotes — the commonest
// paste error there is — and every page that asks who is signed in went
// down with it: `/dashboard` and all four `/clients` screens returned
// "A server error occurred" and nothing else.
//
// The reason it was fatal rather than degraded is that both callers
// guarded on TRUTHINESS. `if (!URL) return null` passes a string of
// quotes, a bare hostname and a lone newline straight through to
// `createServerClient`, whose own `validateSupabaseUrl` then throws
// SYNCHRONOUSLY — before any promise, so no `.catch` anywhere sees it,
// and there is no error boundary between there and the renderer.
//
// `client-auth.ts` already states the contract this restores: "A missing
// configuration is a state, not a crash." That was enforced against
// `undefined` and against nothing else. A misconfiguration is a state
// too, and the panel should show a sign-in screen over it rather than a
// stack trace.
//
// The test deliberately mirrors supabase-js's own `validateSupabaseUrl`
// (scheme required, then `new URL`). If the two ever disagree, this one
// is the one that must be wrong in the safe direction — refusing a value
// the SDK would have accepted costs a sign-in screen; accepting one it
// refuses costs the outage this file was written for.

/**
 * The configured project URL, or null when what is set cannot be one.
 *
 * Whitespace is trimmed, because a trailing newline off a copied line is
 * nobody's decision. Nothing else is repaired: stripping the quotes off
 * `"https://…"` would paper over a mistake that stays in the dashboard,
 * and the next person to read that variable deserves to see it.
 */
export function projectUrl(raw: string | undefined): string | null {
  const value = (raw ?? "").trim()
  if (!value) return null
  // The scheme check first, exactly as the SDK does it: `new URL` alone
  // accepts `mailto:` and other things that are valid URLs and not this.
  if (!/^https?:\/\//i.test(value)) return null
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return null
  }
  // And no path. A project URL is a bare origin: supabase-js appends
  // `/rest/v1`, `/auth/v1` and `/storage/v1` itself.
  //
  // This rule is here because of the near miss it would have caught.
  // Supabase's own dashboard shows `https://<ref>.supabase.co/rest/v1/`
  // on the Data API page — it is the REST endpoint, and it is the
  // obvious thing to copy. Pasted here it produces requests to
  // `/rest/v1/rest/v1/…` and `/rest/v1/auth/v1/…`, so everything 404s
  // while the value looks perfectly correct in the dashboard. That is a
  // worse afternoon than a value that is visibly wrong.
  //
  // A query or a fragment is the same mistake wearing a different hat.
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) return null
  return value
}

/**
 * Say so in the server log, once per process.
 *
 * A silent degradation would trade one invisible failure for another:
 * the owner would see a sign-in screen they cannot get past and nothing
 * would say why. This names the variable and the value's shape without
 * printing the value, since the same call sites also handle keys.
 */
let warned = false
export function warnOnce(variable: string, raw: string | undefined): void {
  if (warned) return
  warned = true
  const value = (raw ?? "").trim()
  const shape = !value
    ? "empty"
    : /^["']|["']$/.test(value)
      ? "wrapped in quotes"
      : /^sb_|^eyJ/.test(value)
        ? "an API key, not a URL"
        : !/^https?:\/\//i.test(value)
          ? "missing the https:// scheme"
          : /^https?:\/\/[^/]+\/./.test(value)
            ? "carrying a path — a project URL is a bare origin, with no /rest/v1"
            : "not a valid URL"
  console.error(
    `[gronn] ${variable} is ${shape}, so Supabase is treated as not configured. ` +
      `Expected something like https://<project-ref>.supabase.co`
  )
}
