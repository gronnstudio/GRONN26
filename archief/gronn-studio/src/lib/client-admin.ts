import "server-only"

import { serviceClient } from "@/lib/supabase"

// The owner's side of the client dossier.
//
// Everything here runs on the service role, which bypasses every policy
// in the schema — that is what makes it the owner's hand rather than a
// client's. So every function in this file must only ever be called from
// a route that has already established the caller is Nick, through
// `getOwnerSession` and not a presence check.
//
// The counterpart, `lib/client-dossier.ts`, deliberately does the
// opposite: it reads under the visitor's own token so the policies
// decide. Two files, two connections, and no call site where the wrong
// one is convenient.

export type AdminClient = {
  id: string
  name: string
  email: string | null
  phone: string | null
  activated_at: string | null
  created_at: string
}

/** Every dossier, newest first. Null when there is no database. */
export async function listClients(): Promise<AdminClient[] | null> {
  const db = serviceClient()
  if (!db) return null
  const { data, error } = await db
    .from("clients")
    .select("id, name, email, phone, activated_at, created_at")
    .order("created_at", { ascending: false })
  if (error) return null
  return (data as AdminClient[] | null) ?? []
}

/**
 * Create a dossier, or return the one that already carries this address.
 *
 * Matching on the lowercased email is the same normalisation the
 * schema's index uses, and doing it here rather than relying on the
 * unique constraint means the owner pressing the button twice gets one
 * dossier and a calm answer instead of a failed write.
 *
 * An enquiry often carries a phone number in its contact field rather
 * than an address — the intake labels it "Telefoon / e-mail" — so the
 * email is optional. A dossier with no address simply cannot be claimed
 * by a registration until the studio adds one, which is the correct
 * outcome rather than a missing feature.
 */
export async function createClient(input: {
  name: string
  email?: string | null
  phone?: string | null
  note?: string | null
}): Promise<AdminClient | null> {
  const db = serviceClient()
  if (!db) return null
  const email = input.email?.toLowerCase().trim() || null

  if (email) {
    const { data: existing } = await db
      .from("clients")
      .select("id, name, email, phone, activated_at, created_at")
      .eq("email", email)
      .maybeSingle()
    if (existing) return existing as AdminClient
  }

  const { data, error } = await db
    .from("clients")
    .insert({
      name: input.name.trim().slice(0, 200) || "Naamloos",
      email,
      phone: input.phone?.trim().slice(0, 60) || null,
      note: input.note?.trim().slice(0, 2000) || null,
    })
    .select("id, name, email, phone, activated_at, created_at")
    .maybeSingle()

  if (error || !data) return null
  return data as AdminClient
}
