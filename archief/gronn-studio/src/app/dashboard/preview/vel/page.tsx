import { notFound } from "next/navigation"

import { SheetPreview } from "./sheet-preview"

export const dynamic = "force-dynamic"

// The printed sheet, on a bench.
//
// Same local-only rule as the toolbar workbench next door, and the same
// reason: the real sheet lives behind Google sign-in, so CI has never
// once looked at the thing the whole panel exists to produce. The
// document here is invented — no archive, no session, no account number
// — which is why this page can hold no session check and still be safe.
//
// It renders the two-variant layout on purpose. One column is the easy
// case; two is where the money columns sit side by side, and where they
// ran into each other until the cells were given a gutter.
export default function SheetPreviewPage() {
  if (process.env.VERCEL) notFound()
  return <SheetPreview />
}
