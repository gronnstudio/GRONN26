import "server-only"

import type { User } from "@supabase/supabase-js"

import { getOwnerSession } from "@/lib/auth"
import { getClientUser } from "@/lib/client-auth"

// Who is looking at the panel.
//
// One place, because /dashboard now serves two audiences and the answer
// decides what is rendered — not what is hidden. That distinction is the
// whole of this file's job.
//
// `lib/auth.ts` explains why the two session helpers stay separate: nine
// owner routes read `if (!session) return 401`, and a helper that
// answered for both would silently turn every one of them into "is
// anyone signed in" over the studio's invoices. This does NOT merge
// them. It asks each in turn and reports which answered, so a caller has
// to switch on `kind` and cannot accidentally treat a client as the
// owner — the type will not let it.
//
// Owner first, deliberately. The studio's own Google account could in
// principle also hold a client account; if it ever does, the panel it
// gets is the studio's.

export type PanelViewer =
  | { kind: "owner"; email: string | null }
  | { kind: "client"; user: User }
  | null

export async function getPanelViewer(): Promise<PanelViewer> {
  const owner = await getOwnerSession()
  if (owner) return { kind: "owner", email: owner.user?.email ?? null }

  const client = await getClientUser()
  if (client) return { kind: "client", user: client }

  return null
}
