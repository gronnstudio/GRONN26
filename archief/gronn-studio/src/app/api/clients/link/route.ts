import { NextResponse } from "next/server"

import { getClientUser } from "@/lib/client-auth"
import { serviceClient } from "@/lib/supabase"

// Attach a newly registered account to the dossier the studio already
// made for that household.
//
// A client cannot do this themselves and the schema is built that way:
// no policy grants an insert or an update anywhere, so this runs on the
// service role. Which makes it the most dangerous route in the portal,
// and the guards below are the whole of its safety.
//
//  1. The user is read with `getClientUser`, which verifies the token
//     against the auth server. A cookie is not an identity here.
//
//  2. THE EMAIL MUST BE CONFIRMED. This is the one that matters. Anyone
//     can sign up claiming any address; without this check, typing a
//     client's email into the registration form would hand over their
//     dossier — their address, their garden, their subscriptions —
//     before the real owner of that inbox ever heard about it. Supabase
//     only sets `email_confirmed_at` once the link in the mail is
//     followed, so that timestamp is the proof of ownership and nothing
//     else here is.
//
//  3. Only an UNCLAIMED dossier is linked. `auth_user_id is null` is in
//     the update itself, not checked and then written, so two requests
//     racing cannot both win — the second updates zero rows.
//
//  4. Matching is on `lower(email)`, the same normalisation the schema's
//     index uses. Anything else is a second dossier for one household.
//
// Nothing here CREATES a dossier. A household that registers before the
// studio has a record of them stays unlinked, and the portal says so.
// Self-service dossier creation would mean an enquiry could invent a
// client row, which is the studio's decision to make, not a form's.
export async function POST() {
  const user = await getClientUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { ok: false, error: "email not confirmed" },
      { status: 403 }
    )
  }

  const email = user.email?.toLowerCase().trim()
  if (!email) {
    return NextResponse.json({ ok: false, error: "no email" }, { status: 400 })
  }

  const db = serviceClient()
  if (!db) {
    return NextResponse.json({ ok: false, error: "no database" }, { status: 503 })
  }

  // Already linked? Then this is a repeat call — a second tab, a
  // refresh — and it is a success, not a conflict.
  const { data: mine } = await db
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (mine) return NextResponse.json({ ok: true, linked: true })

  const { data, error } = await db
    .from("clients")
    .update({ auth_user_id: user.id, activated_at: new Date().toISOString() })
    .eq("email", email)
    .is("auth_user_id", null)
    .select("id")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ ok: false, error: "link failed" }, { status: 503 })
  }

  // No row matched. Either no dossier carries this address, or one does
  // and somebody has already claimed it — and this deliberately does not
  // say which. The difference is exactly the fact that would tell a
  // stranger whether a given household is a client of the studio.
  if (!data) return NextResponse.json({ ok: true, linked: false })

  return NextResponse.json({ ok: true, linked: true })
}
