import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// "Vercel Blob: Failed to retrieve the client token" — the sentence that
// cost three rounds of looking in the wrong place.
//
// #103 made the browser record WHY an upload failed, and it worked: the
// message above is what the first real failure produced. But that is the
// SDK's own sentence for "the token request did not come back", and the
// SDK never reads the body of our reply — so the `reason` the token
// route so carefully computes is discarded before anyone sees it. A
// refused file type, a wrong folder and a store that is not configured
// at all all reach the studio as the same string.
//
// Two channels fix that, and neither is the response body:
//
//   · the server log, which the studio can read and a visitor cannot
//   · a hint on the stored line, so the record says which SIDE the
//     problem is on without needing the log at all
//
// Verified against the running route while writing this: with a Blob
// token present it answers 200 and a client token for both a PNG and a
// PDF under a minted reference; with none it answers 400. So the path
// and type checks were never the failure.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

const ROUTE = "src/app/api/intake/photo/route.ts"
const FORM = "src/components/intake/deep-intake.tsx"

test.describe("a refused upload token says where the problem is", () => {
  test("the route writes the real message to the server log", () => {
    const source = read(ROUTE)
    const fn = source.slice(source.lastIndexOf("} catch (error) {"))
    // The message itself, not a category. Everything else in the reply
    // is deliberately coarse; this is the one place the truth survives.
    expect(fn).toContain("console.error")
    expect(fn).toContain("[gronn] intake upload token refused")
    expect(fn).toContain("message")
  })

  test("a store that cannot answer is not reported as a refused file", () => {
    // "No read-write token found" is the studio's problem. Reading it as
    // "your file was not allowed" sends the wrong person looking.
    const source = read(ROUTE)
    expect(source).toContain('"store"')
    const fn = source.slice(source.lastIndexOf("} catch (error) {"))
    expect(fn).toContain('lower.includes("token")')
  })

  test("the reply still describes nothing about the store", () => {
    // The route is public. The log is where detail belongs; the body
    // carries a category and no more.
    //
    // EVERY reply, not the first one found. There are two now — the
    // misconfiguration guard answers before `handleUpload` is called —
    // and a check that slices from the first match to the end of the
    // file reads the other one's `message` variable and fails for a
    // reason that has nothing to do with what is asserted here.
    const source = read(ROUTE)
    const replies = [...source.matchAll(/\{ error: "upload refused"[^}]*\}/g)]
    expect(replies.length).toBeGreaterThanOrEqual(2)
    for (const [reply] of replies) {
      expect(reply).toContain("reason")
      expect(reply.includes("message")).toBe(false)
    }
  })

  test("a store linked without a read-write token is named as such", () => {
    // The failure that cost days, pinned so it cannot come back quietly.
    //
    // `@vercel/blob` has two credential paths and only one of them takes
    // Vercel's OIDC identity. `put()` does, so the submission record is
    // stored; `handleUpload()` does not, so every file is refused. A
    // store linked with BLOB_STORE_ID alone therefore looks healthy from
    // every direction except this route.
    //
    // The guard checks the two variables SEPARATELY and says which is
    // missing. If we ever move this route to the presigned flow — which
    // does run on OIDC — this test has to be rewritten deliberately
    // rather than keep passing while describing something untrue.
    const source = read(ROUTE)
    expect(source).toContain("BLOB_READ_WRITE_TOKEN")
    expect(source).toContain("BLOB_STORE_ID")
    // Refused before the SDK is asked, so the log line is ours and says
    // the part the SDK's own message leaves out.
    const guard = source.slice(
      source.indexOf("function readWriteTokenMissing"),
      source.indexOf("export async function POST")
    )
    expect(guard).toContain("process.env.BLOB_READ_WRITE_TOKEN")
    expect(guard).toContain("process.env.BLOB_STORE_ID")
    // And the guard runs before handleUpload, not inside its catch.
    // The call site, not the declaration — `readWriteTokenMissing():`
    // contains the same characters and sits above everything, so
    // matching on it would pass without proving the order.
    expect(source.indexOf("= readWriteTokenMissing()")).toBeGreaterThan(-1)
    expect(source.indexOf("= readWriteTokenMissing()")).toBeLessThan(
      source.indexOf("await handleUpload(")
    )
  })

  test("the stored line names the side the problem is on", () => {
    const source = read(FORM)
    expect(source).toContain("/client token/i")
    // In Dutch, in the record the studio actually reads.
    expect(source).toContain("niet aan het bestand")
    // And it points at the log rather than pretending to know more.
    expect(source).toContain("serverlog")
  })

  test("the hint is added only to that failure, not to every one", () => {
    // A type refusal and a size refusal have their own words already.
    // Pasting a storage hint onto those would be the same mistake in
    // reverse — telling a visitor their own file is the studio's fault.
    const source = read(FORM)
    const hint = source.slice(source.indexOf("const hint ="))
    expect(hint.slice(0, 400)).toContain('? "')
    expect(hint.slice(0, 400)).toContain(': ""')
  })
})
