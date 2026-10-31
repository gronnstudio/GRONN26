import { permanentRedirect } from "next/navigation"

// /clients/admin moved to /dashboard.
//
// The second move this panel has made — it was /admin before — and the
// second redirect, for the same reason both times. `TIMEVAULT/PROBLEMS.md`
// records /nl/admin returning 404 twice: the first fix corrected the
// LINKS, and the owner hit it again from a bookmark, because the URL
// still did not resolve. Fixing links is not fixing an address.
//
// A catch-all, so a bookmarked /clients/admin/intakes lands on
// /dashboard/intakes rather than on the overview.
//
// It also matters that this path is no longer under /clients at all in
// spirit: /clients is now the CLIENT portal, and the studio's own panel
// living inside it was the thing that made the two easy to confuse.
export default async function PanelMoved({
  params,
}: {
  params: Promise<{ rest?: string[] }>
}) {
  const { rest } = await params
  const tail = rest?.length ? `/${rest.join("/")}` : ""
  permanentRedirect(`/dashboard${tail}`)
}
