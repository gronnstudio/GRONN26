"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

import { projectUrl } from "@/lib/supabase-url"

// The browser half of client authentication.
//
// Only the anon key reaches here, and that is correct rather than a
// compromise: the anon key is public by design and is what the row-level
// policies in supabase/migrations are written against. The key that must
// never appear in a bundle is the service role, which lives in
// `lib/supabase.ts` behind an `import "server-only"` and is asserted by
// tests/e2e/secrets.spec.ts.
//
// One instance, memoised. Supabase's browser client owns a token refresh
// timer and a storage listener; constructing a second one on every
// render gives you two of each, racing to refresh the same session.

let cached: SupabaseClient | null = null

export function clientAuthBrowser(): SupabaseClient | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Unconfigured is a state the forms render, not a crash. CI has no
  // Supabase project and the sign-in screen still has to draw.
  if (!key) return null
  // Validated, exactly as `client-auth.ts` and `supabase.ts` do it — and
  // this module was the one the first repair MISSED, which cost a second
  // afternoon.
  //
  // `createBrowserClient` throws SYNCHRONOUSLY on a malformed URL, the
  // same as its server twin. Here that throw lands inside a form's async
  // submit handler, before `setBusy(true)` and outside any catch: the
  // promise rejects, React discards it, and the screen does absolutely
  // nothing. No message, no spinner, no navigation. A visitor presses
  // the button and the page simply declines to react.
  //
  // Silent is the worst of the three outcomes. A crash at least says
  // where it happened.
  const url = projectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  if (!url) return null
  if (!cached) cached = createBrowserClient(url, key)
  return cached
}

/**
 * Is the browser's own copy of the URL set but unusable?
 *
 * The forms need this to tell "no project" from "a project whose address
 * is mistyped" — and the browser has to answer for itself, because what
 * it holds is whatever was inlined at BUILD time, which is not
 * necessarily what the server is reading now.
 */
export function browserUrlMalformed(): boolean {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(raw) && !projectUrl(raw)
}
