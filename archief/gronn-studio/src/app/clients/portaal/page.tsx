import { redirect } from "next/navigation"

// The client's dossier moved into the panel at /dashboard.
//
// It lived here first, as a standalone page, while the panel was still
// the studio's alone. Now /dashboard serves both audiences — a client
// signing in gets their own shorter set of surfaces in the same frame —
// and two addresses for one screen is how they drift apart.
//
// Kept as a redirect rather than deleted: this path was linked from the
// sign-in flow and from the mailed confirmation link, and a bookmark
// answering 404 is the failure TIMEVAULT/PROBLEMS.md records twice.
export default function PortalMoved() {
  redirect("/dashboard")
}
