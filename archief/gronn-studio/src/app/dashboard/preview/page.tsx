import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { ownerNav } from "@/app/dashboard/nav"
import { PreviewToolbar } from "./preview-toolbar"

export const metadata: Metadata = {
  title: "Toolbar preview",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// A local-only workbench for the document toolbar.
//
// `process.env.VERCEL` is set on every Vercel build and every Vercel
// runtime, production and preview alike, and cannot be unset from
// project settings. So this page cannot exist in the deployed
// application — not by a typo in the environment variables, not on
// purpose. It renders only when someone runs the app on their own
// machine.
//
// It holds no session check because it reaches nothing that needs one:
// the documents are invented in the browser and no route, archive or
// database is touched. That is the difference between a workbench and a
// way in.
export default function ToolbarPreviewPage() {
  if (process.env.VERCEL) notFound()
  return (
    <DashboardShell groups={ownerNav()} user="preview@local">
      <PreviewToolbar />
    </DashboardShell>
  )
}
