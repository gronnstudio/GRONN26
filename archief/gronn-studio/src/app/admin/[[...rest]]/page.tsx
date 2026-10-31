import { permanentRedirect } from "next/navigation"

// /admin moved to /dashboard.
//
// A catch-all rather than three stubs, so a bookmarked
// /admin/intakes lands on its own successor instead of the dashboard —
// the owner's bookmarks are the whole reason this file exists rather
// than a deleted directory and a 404.
//
// Permanent (308), which also preserves the method: a POST to an old
// path would keep its body, though nothing here posts.
export default async function AdminMoved({
  params,
}: {
  params: Promise<{ rest?: string[] }>
}) {
  const { rest } = await params
  const tail = rest?.length ? `/${rest.join("/")}` : ""
  permanentRedirect(`/dashboard${tail}`)
}
