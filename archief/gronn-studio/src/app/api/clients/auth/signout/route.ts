import { NextResponse } from "next/server"

import { clientAuthServer } from "@/lib/client-auth"

// Signing out, as a POST.
//
// Not a link: a GET that destroys a session is followed by every link
// prefetcher and every mail scanner, and a client would find themselves
// logged out because something walked the page for them.
export async function POST(request: Request) {
  const supabase = await clientAuthServer()
  if (supabase) await supabase.auth.signOut()
  // `/dashboard` rather than `/clients/login`, for the same reason the
  // menu stopped offering three doors: signed out, `/dashboard` IS the
  // gate, and it offers both sign-ins. Sending a client to the
  // client-only login is right until the moment the owner signs out of a
  // client's session to get back into their own panel — and then it is a
  // dead end that looks like the wrong page.
  return NextResponse.redirect(new URL("/dashboard", new URL(request.url).origin), {
    // 303: the browser must follow with GET, not repeat the POST.
    status: 303,
  })
}
