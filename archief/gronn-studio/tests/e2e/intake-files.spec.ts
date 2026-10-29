import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// The two halves of "the files never appear in the intakes".
//
// Neither can be driven live in CI: both need a Blob store and an
// authenticated owner session, and the pipeline runs with neither. What
// CAN be asserted is the property each bug violated, read off the source
// the way `secrets.spec.ts` does — which is the difference between a
// regression caught in review and one caught by the owner.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

const FILE_ROUTE = "src/app/api/admin/intake-file/[...path]/route.ts"
const ARCHIVE = "src/lib/intake-archive.ts"

test.describe("an intake attachment is served from whichever side it is on", () => {
  // The bug: this route asked storage for `access: "private"` and nothing
  // else, while the archive it serves writes public whenever a private
  // write is refused — and `filesIn` labels every listed blob private
  // because a listing cannot say which side it is on. So a publicly
  // stored photograph came back 404 and the gallery drew a broken tile
  // over a file that was in storage the whole time.
  test("the gated route reads through the archive's two-step, not private alone", () => {
    const source = read(FILE_ROUTE)

    expect(
      source,
      "the route must use getIntakeBlob, which tries private then public"
    ).toContain("getIntakeBlob")

    // The specific regression: a bare private-only read. If someone
    // reintroduces `get(pathname, { access: "private" })` here, the
    // public half of the archive becomes unreachable again.
    expect(
      source.includes('access: "private"'),
      "the route must not ask storage for one side directly"
    ).toBe(false)
  })

  test("the two-step itself tries private and then public", () => {
    const source = read(ARCHIVE)
    const fn = source.slice(source.indexOf("export async function getIntakeBlob"))
    const body = fn.slice(0, fn.indexOf("\n}"))

    expect(body).toContain('access: "private"')
    expect(body).toContain('access: "public"')
    // Order is the whole point: private first means a file that is on
    // both sides is served from the side that requires the session.
    expect(body.indexOf('access: "private"')).toBeLessThan(
      body.indexOf('access: "public"')
    )
  })
})

test.describe("deleting an enquiry is confined to one enquiry", () => {
  const DELETE_ROUTE = "src/app/api/admin/intake/[reference]/route.ts"

  test("it is owner-gated, and by the owner helper rather than a presence check", () => {
    const source = read(DELETE_ROUTE)
    // `lib/auth.ts` keeps two helpers apart on purpose: one answers "is
    // this Nick", the other will answer "is this a client". The
    // irreversible action must never move to the second.
    expect(source).toContain("getOwnerSession")
  })

  test("it answers only to DELETE, so no link or form submit reaches it", () => {
    const source = read(DELETE_ROUTE)
    expect(source).toContain("export async function DELETE")
    for (const verb of ["export async function GET", "export async function POST"]) {
      expect(source, `${verb} would make this reachable by navigation`).not.toContain(
        verb
      )
    }
  })

  test("the archive rebuilds the folder from a normalised reference", () => {
    const source = read(ARCHIVE)
    const fn = source.slice(source.indexOf("export async function deleteSubmission"))
    const body = fn.slice(0, fn.indexOf("\n}\n"))

    // Not a caller-supplied path list: the folder is derived, which is
    // what stops `intake/a/../b` or a bare prefix widening the blast
    // radius of the one action that cannot be undone.
    expect(body).toContain("intakeFolder(reference)")
    expect(body).toContain("INTAKE_PREFIX")
    expect(body).toContain('includes("..")')
  })

  test("it deletes every page, not just the first", () => {
    const source = read(ARCHIVE)
    const fn = source.slice(source.indexOf("export async function deleteSubmission"))
    const body = fn.slice(0, fn.indexOf("\n}\n"))

    // A single `list` returns one page. Stopping there would leave
    // photographs under a reference the panel no longer shows: storage
    // the owner pays for, holding pictures of a client's house, with no
    // way left to see them.
    expect(body).toContain("cursor")
    expect(body).toContain("hasMore")
  })
})
