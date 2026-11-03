import { clientAuthServer } from "@/lib/client-auth"

// What a signed-in client may see: their own row, their own gardens,
// their own subscriptions. Nothing else exists as far as this file is
// concerned, and that is enforced one layer down rather than here.
//
// Every query below runs through `clientAuthServer()` — a connection
// holding the VISITOR's token and the anon key. The three policies in
// supabase/migrations/0001_client_dossier.sql then answer each select
// with the rows belonging to `auth.uid()` and no others. There is
// deliberately no `.eq("client_id", …)` filter doing that job in
// application code: a filter someone forgets is a client reading another
// client's garden, and the whole reason this data went into Postgres
// instead of a JSON blob was so that forgetting is not enough.
//
// `hours` is absent, and its absence is the design. The schema grants it
// no policy at all, so this connection reads zero rows from it however
// it asks — the studio's own register is not a client's business.

export type DossierClient = {
  id: string
  name: string
  email: string | null
  phone: string | null
  activated_at: string | null
}

export type DossierProject = {
  id: string
  name: string
  address: string | null
  created_at: string
  archived_at: string | null
}

export type DossierSubscription = {
  id: string
  project_id: string | null
  service_slug: string
  status: "active" | "paused" | "ended"
  started_at: string
  renews_at: string | null
  ended_at: string | null
}

export type Dossier = {
  client: DossierClient | null
  projects: DossierProject[]
  subscriptions: DossierSubscription[]
  /**
   * Could the database be reached?
   *
   * Separated from "you have no projects" for the same reason
   * `ArchiveStatus` is: an outage that renders as an empty dossier tells
   * a client the studio has no record of them, which is the single worst
   * thing this page could say.
   */
  status: "ok" | "unavailable" | "unconfigured"
  /**
   * Signed in, but no dossier carries this address.
   *
   * The normal case for a household that registered before the studio
   * created their record — self-service cannot create a dossier, by
   * design, so this is a real state and the portal names it rather than
   * showing an empty page.
   */
  unlinked: boolean
}

const EMPTY = { client: null, projects: [], subscriptions: [] }

export async function readDossier(): Promise<Dossier> {
  const supabase = await clientAuthServer()
  if (!supabase) {
    return { ...EMPTY, status: "unconfigured", unlinked: false }
  }

  // Every query below is a network call, and a project that is paused,
  // unreachable or not yet provisioned makes them REJECT rather than
  // return `{ error }`. This page is rendered on the server, so an
  // escaping rejection is a 500 rather than a message — and the panel
  // has already been taken down once that way. "The database did not
  // answer" is a state this type carries on purpose.
  try {
    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, name, email, phone, activated_at")
      .limit(1)

    if (error) return { ...EMPTY, status: "unavailable", unlinked: false }

    const client = (clients?.[0] as DossierClient | undefined) ?? null
    // RLS returned nothing: either this account is not linked to a
    // dossier, or there is no dossier. Both look the same from here and
    // both mean the portal has nothing to show yet.
    if (!client) return { ...EMPTY, status: "ok", unlinked: true }

    const [projects, subscriptions] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, address, created_at, archived_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("id, project_id, service_slug, status, started_at, renews_at, ended_at")
        .order("started_at", { ascending: false }),
    ])

    // Both errors are read, and that is a repair rather than tidiness.
    //
    // They were ignored, so `?? []` collapsed a failed read into an empty
    // list with `status: "ok"` — and the portal then told a paying client
    // "je dossier is er, maar er staat nog geen tuin of abonnement in"
    // over a garden that was simply unreadable. That is the exact sentence
    // the note on `status` above says must never appear over a failure;
    // the `clients` query was guarded against it and these two were not.
    //
    // The client is kept: who they are was read successfully, so the page
    // can still greet them by name while saying the rest did not load.
    if (projects.error || subscriptions.error) {
      return { ...EMPTY, client, status: "unavailable", unlinked: false }
    }

    return {
      client,
      projects: (projects.data as DossierProject[] | null) ?? [],
      subscriptions: (subscriptions.data as DossierSubscription[] | null) ?? [],
      status: "ok",
      unlinked: false,
    }
  } catch {
    // And the whole thing is wrapped, because an `error` field only
    // exists when the call RESOLVED. A paused or unreachable project
    // makes these reject instead, and this is rendered on the server:
    // an escaping rejection is a 500 rather than a message.
    return { ...EMPTY, status: "unavailable", unlinked: false }
  }
}
