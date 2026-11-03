import type { SearchItem } from "@/app/dashboard/panel-search"
import { euro } from "@/lib/format"
import { totals, type StudioDocument } from "@/lib/documents"
import type { IntakeSubmission } from "@/lib/intake-archive"

// What the panel's search looks through, built on the server from data
// the page already read.
//
// One function rather than three, because a row that appears on the
// dashboard and not on the intake screen is the kind of difference
// nobody notices until they are looking for something they know exists.

export function panelSearchItems(
  submissions: IntakeSubmission[],
  documents: StudioDocument[]
): SearchItem[] {
  const intakes: SearchItem[] = submissions.map((s) => ({
    id: `intake-${s.reference}`,
    label: s.project || s.reference,
    sub: [s.name, s.contact].filter(Boolean).join(" · ") || "geen naam opgegeven",
    href: "/dashboard/intakes",
    kind: "intake",
  }))

  const docs: SearchItem[] = documents.map((d) => ({
    id: `doc-${d.id}`,
    label: d.client.split("\n")[0] || d.title || d.number,
    sub: `${d.number} · ${euro(totals(d).gross[0] ?? 0)}`,
    href: "/dashboard/offertes",
    kind: d.kind === "factuur" ? "factuur" : "offerte",
  }))

  return [...intakes, ...docs]
}
