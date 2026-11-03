import { NextResponse } from "next/server"

import { clientAuthServer } from "@/lib/client-auth"

// Where every link Supabase mails a client comes back to.
//
// Confirmation mail and recovery mail both carry a one-time `code`, and
// a code is not a session. Exchanging it sets the session cookies, and
// only a route handler can — a Server Component is not allowed to write
// cookies, which is exactly why these links point here and not straight
// at a page.
//
// `next` decides where the visitor lands afterwards, and it is the one
// thing here an attacker controls. An unchecked `next` is an open
// redirect: a link that looks like gronn.studio, arrives in a real mail
// from a real sender, and lands on somebody else's site. So it is
// required to be a path on this origin — one leading slash, and not the
// protocol-relative `//evil.example` that also passes a naive check.
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard"
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard"
  return raw
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeNext(url.searchParams.get("next"))
  const code = url.searchParams.get("code")

  if (!code) {
    // Supabase reports its own failures here — an expired link, a
    // cancelled confirmation. The pages downstream already say what an
    // unusable link means, so this hands over rather than inventing a
    // second vocabulary for it.
    return NextResponse.redirect(new URL(next, url.origin))
  }

  const supabase = await clientAuthServer()
  if (!supabase) {
    return NextResponse.redirect(new URL("/clients/login", url.origin))
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL(next, url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
