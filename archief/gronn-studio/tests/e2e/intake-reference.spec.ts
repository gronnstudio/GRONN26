import { expect, test } from "@playwright/test"

import {
  intakeFolder,
  isMintedReference,
  isOrphanOf,
  mintReference,
  ownedBy,
  safeReference,
} from "@/lib/intake-reference"

// The test that holds the dropped-files bug down.
//
// For months the browser and the server each computed an intake's folder
// name with their own transform, and for five of every nine realistic
// project names the two disagreed. The photographs landed in one folder,
// the record in another, and the submission route's prefix check then
// dropped every file from the enquiry that described them. The studio
// received intakes that said "4 foto's" and carried none.
//
// Nothing about that was visible: no error, no warning, no failing test —
// which is why the repair is not complete without this file. There is one
// implementation now, and these assertions are what stops a second one
// growing back.

/** What the browser used to do, kept here as the thing we must not do. */
function oldClientTransform(project: string): string {
  return `2026-08-30-${
    project.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) ||
    "intake"
  }`
}

/** What the server used to do. */
function oldServerTransform(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "intake"
  )
}

// Every one of these lost all of its files in production.
const REGRESSIONS = [
  "Tuin!",
  "'t Gooi",
  "Achtertuin (Hilversum)",
  "Vijver en border achter het huis van de familie Jansen",
  "!!!",
]

test.describe("intake reference", () => {
  test("the two old transforms disagreed on real project names", () => {
    // Not a test of current behaviour — a record of why this file exists.
    // If this ever stops failing, the bug was never real.
    for (const project of REGRESSIONS) {
      const client = oldClientTransform(project)
      expect(oldServerTransform(client), project).not.toBe(client)
    }
  })

  test("one implementation now answers for both ends", () => {
    for (const project of [...REGRESSIONS, "Jansen Tuin", "Tuin", "  "]) {
      const reference = safeReference(oldClientTransform(project))
      // Whatever the browser sends, the server must compute the same
      // folder from it — which is only true if applying the function
      // again changes nothing.
      expect(safeReference(reference), project).toBe(reference)
      expect(ownedBy(`${intakeFolder(reference)}current-a.jpg`, reference)).toBe(true)
    }
  })

  test("a file never escapes its own submission", () => {
    const mine = safeReference("2026-08-30-tuin")
    const yours = safeReference("2026-08-30-vijver")
    expect(ownedBy(`intake/${yours}/current-a.jpg`, mine)).toBe(false)
    expect(ownedBy(`intake/${mine}/../${yours}/a.jpg`, mine)).toBe(false)
    expect(ownedBy(`${intakeFolder(mine)}submission.json`, mine)).toBe(false)
  })

  test("minted references are dated, unguessable and recognised", () => {
    const a = mintReference(new Date("2026-08-30T12:00:00Z"))
    const b = mintReference(new Date("2026-08-30T12:00:00Z"))
    expect(a.startsWith("2026-08-30-")).toBe(true)
    expect(a).not.toBe(b)
    expect(isMintedReference(a)).toBe(true)
    // The shape the public upload route checks before it issues a token.
    // A name a visitor could have typed must never pass it.
    expect(isMintedReference("2026-08-30-jansen-tuin")).toBe(false)
    expect(isMintedReference("intake")).toBe(false)
  })

  test("an orphan folder is recognised by the record it belongs to", () => {
    // The recovery half: the folder the browser wrote, and the record the
    // server wrote, for the same enquiry.
    const folder = "2026-08-30-tuin-"
    const record = "2026-08-30-tuin"
    expect(isOrphanOf(folder, record)).toBe(true)
    // Not its own orphan, and not another enquiry's.
    expect(isOrphanOf(record, record)).toBe(false)
    expect(isOrphanOf("2026-08-30-vijver", record)).toBe(false)
  })
})
