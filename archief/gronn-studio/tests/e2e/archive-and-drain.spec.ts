import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import {
  active,
  archive,
  normalize,
  unarchive,
  upsert,
  type StudioDocument,
} from "@/lib/documents"
import { intakeFolder, safeReference } from "@/lib/intake-reference"

// Two ways out of a list, and only one of them destroys anything.
//
// Documents are ARCHIVED and never deleted — art. 52 AWR puts a
// seven-year retention on an invoice, so a button that really removed
// one would be a button that can damage the bookkeeping. Intakes go into
// a DRAIN first and can only be destroyed from there, because the
// photographs under an enquiry are the only copy the studio has of
// somebody's garden.
//
// The assertions below are what stops either half quietly becoming the
// other one.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

function doc(over: Partial<StudioDocument> = {}): StudioDocument {
  return {
    id: "doc-1",
    kind: "factuur",
    number: "2026-0007",
    client: "Familie Jansen",
    title: "Voortuin",
    items: [],
    blocksBefore: [],
    blocksAfter: [],
    updatedAt: "2026-08-01T10:00:00.000Z",
    ...over,
  } as StudioDocument
}

/* ------------------------------------------------------------ documents */

test.describe("archiving a document files it away without touching it", () => {
  test("normalize leaves a document without archivedAt alone", () => {
    // The field is OPTIONAL and has to stay that way: every document
    // already in the studio's store predates it, and a `normalize` that
    // filled in a default would archive the entire administration or
    // stamp a false "was filed away on" date across it.
    const before = doc()
    const after = normalize(before)

    expect("archivedAt" in after && after.archivedAt !== undefined).toBe(false)
    expect(active([after])).toHaveLength(1)
  })

  test("normalize does not resurrect an archived document", () => {
    const filed = archive(doc(), "2026-08-20T09:00:00.000Z")
    expect(normalize(filed).archivedAt).toBe("2026-08-20T09:00:00.000Z")
  })

  test("an archived document drops out of the list and stays in the archive", () => {
    const one = doc({ id: "a" })
    const two = doc({ id: "b", number: "2026-0008" })
    const filed = archive(two, "2026-08-20T09:00:00.000Z")
    const all = upsert([one, two], filed)

    expect(active(all).map((d) => d.id)).toEqual(["a"])
    // Still there — that is the whole difference from a delete.
    expect(all.map((d) => d.id).sort()).toEqual(["a", "b"])
    expect(all.find((d) => d.id === "b")?.archivedAt).toBeTruthy()
  })

  test("taking it back out removes the field rather than blanking it", () => {
    const filed = archive(doc(), "2026-08-20T09:00:00.000Z")
    const back = unarchive(filed)

    // Not `archivedAt: ""`. An empty string is falsy and would work, but
    // it leaves every future export of this invoice reading "was filed
    // away once", which is not a fact about the invoice.
    expect(Object.prototype.hasOwnProperty.call(back, "archivedAt")).toBe(false)
    expect(active([back])).toHaveLength(1)
  })

  test("nothing in the panel deletes a document", () => {
    // The retention rule, held down in source. If a delete ever appears
    // here it should have to argue with this test first.
    const lib = read("src/lib/documents.ts")
    expect(lib.includes("export function remove")).toBe(false)
    expect(lib.includes("export function deleteDocument")).toBe(false)

    const table = read("src/app/dashboard/documents-table.tsx")
    expect(table).toContain("archive")
    expect(table.toLowerCase().includes("verwijder")).toBe(false)
  })
})

/* -------------------------------------------------------------- intakes */

test.describe("an enquiry goes into the drain before it can be destroyed", () => {
  // `readArchive` needs a Blob store, so the split itself is asserted on
  // the source: what matters is that the live list is filtered by the
  // field and the drain is not, in ONE place rather than at five call
  // sites.
  const source = read("src/lib/intake-archive.ts")

  test("the archive splits the drain out of the live list", () => {
    expect(source).toContain("deletedAt?: string")
    expect(source).toContain("submissions.filter((s) => !s.deletedAt)")
    expect(source).toContain("deleted: IntakeSubmission[]")
  })

  test("restoring removes the field, so the record comes back whole", () => {
    const fn = source.slice(source.indexOf("export async function setDeleted"))
    const body = fn.slice(0, fn.indexOf("\n}\n"))

    // Re-read then rewrite: the panel holds a snapshot from page load,
    // and writing that back would undo a dossier link or a recovered
    // file that landed in between.
    expect(body).toContain("readBlob(recordPath(reference))")
    expect(body).toContain("delete next.deletedAt")
    // Everything else is carried over by the spread — a restore that
    // rebuilt the record from fields would be a restore that loses one.
    expect(body).toContain("{ ...record")
  })

  test("the enquiry's own button is reversible; only the drain is not", () => {
    const workspace = read("src/app/dashboard/intakes/intake-workspace.tsx")
    expect(workspace).toContain('method: "PATCH"')
    expect(
      workspace.includes('method: "DELETE"'),
      "the enquiry view must not reach the destructive path directly"
    ).toBe(false)

    const drain = read("src/app/dashboard/afvoerputje/drain-list.tsx")
    expect(drain).toContain('method: "DELETE"')
    // The count is the sentence that stops somebody. Without it the
    // confirmation says nothing a reflex cannot get past.
    expect(drain).toContain("files === 1")
  })

  test("the drain is owner-only, like the archive it draws from", () => {
    const page = read("src/app/dashboard/afvoerputje/page.tsx")
    expect(page).toContain("getPanelViewer")
    expect(page).toContain('viewer.kind === "client"')

    const route = read("src/app/api/admin/intake/[reference]/route.ts")
    // Both verbs, not just the destructive one: a client session that
    // could PATCH could empty the studio's list without deleting a byte.
    expect(route.match(/getOwnerSession\(\)/g)?.length).toBe(2)
  })

  test("deleteSubmission can only ever reach the folder of that one reference", () => {
    // The guard is `intakeFolder(safeReference(...))`, and this is what
    // it is worth: every shape of traversal collapses to a folder under
    // the prefix, never a prefix that spans two enquiries.
    for (const hostile of [
      "2026-08-30-abc/../2026-08-30-def",
      "../../published",
      "2026-08-30-abc/",
      "..",
      "a/b/c",
    ]) {
      const folder = intakeFolder(hostile)
      expect(folder.startsWith("intake/")).toBe(true)
      expect(folder.includes("..")).toBe(false)
      // Exactly one segment between the prefix and the trailing slash.
      expect(folder.slice("intake/".length).split("/").filter(Boolean)).toHaveLength(1)
    }

    // And a legitimate reference is not a prefix of its neighbour's
    // folder, so a listing under it cannot pick up somebody else's files.
    const one = intakeFolder(safeReference("2026-08-30-210d82b10654"))
    const two = intakeFolder(safeReference("2026-08-30-210d82b10654-b"))
    expect(two.startsWith(one)).toBe(false)

    const fn = read("src/lib/intake-archive.ts").slice(
      read("src/lib/intake-archive.ts").indexOf("export async function deleteSubmission")
    )
    const body = fn.slice(0, fn.indexOf("\n}\n"))
    // Rebuilt from the reference — never a list of paths the caller sent.
    expect(body).toContain("intakeFolder(reference)")
    expect(body).toContain('throw new Error("out of scope")')
    // Paged: a half-finished delete leaves photographs of somebody's
    // house under a reference the panel no longer shows.
    expect(body).toContain("hasMore")
  })
})
