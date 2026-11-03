import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { projectUrl } from "@/lib/supabase-url"

// The outage this file exists for.
//
// `NEXT_PUBLIC_SUPABASE_URL` was set in Vercel with the value wrapped in
// quotes. Both callers guarded on truthiness — `if (!URL) return null` —
// so the quoted string went straight through to `createServerClient`,
// whose own validation throws SYNCHRONOUSLY. Not a rejected promise: a
// throw, before any `await`, with no error boundary between it and the
// renderer.
//
// Every page that asks who is signed in went down together: `/dashboard`
// and all four `/clients` screens, each showing "A server error
// occurred" and nothing else. Reproduced locally on the shipped build
// before the fix, and it is the whole reason `projectUrl` exists.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

test.describe("a malformed project URL is a state, not a crash", () => {
  test("the values that caused the outage are refused", () => {
    // The one that actually happened, first.
    expect(projectUrl('"https://daymxmkicegpfbumarhi.supabase.co"')).toBe(null)
    expect(projectUrl("'https://daymxmkicegpfbumarhi.supabase.co'")).toBe(null)
    // A bare hostname: what you get from copying the project ref line.
    expect(projectUrl("daymxmkicegpfbumarhi.supabase.co")).toBe(null)
    // Truthy, and not a URL. `if (!URL)` let all of these through.
    expect(projectUrl(" ")).toBe(null)
    expect(projectUrl("\n")).toBe(null)
    expect(projectUrl("undefined")).toBe(null)
    expect(projectUrl("https://")).toBe(null)
    // Valid URL, wrong kind — the scheme test is why this is refused.
    expect(projectUrl("mailto:hello@gronn.studio")).toBe(null)
    expect(projectUrl(undefined)).toBe(null)
    expect(projectUrl("")).toBe(null)
  })

  test("the REST endpoint is refused — a project URL is a bare origin", () => {
    // The near miss that put this rule here. Supabase's own Data API
    // page shows `https://<ref>.supabase.co/rest/v1/`, which is the
    // obvious thing to copy — and supabase-js appends `/rest/v1`,
    // `/auth/v1` and `/storage/v1` itself, so pasting it produces
    // `/rest/v1/rest/v1/…` and every call 404s while the value looks
    // perfectly correct in the dashboard.
    const ref = "https://daymxmkicegpfbumarhi.supabase.co"
    expect(projectUrl(`${ref}/rest/v1/`)).toBe(null)
    expect(projectUrl(`${ref}/rest/v1`)).toBe(null)
    expect(projectUrl(`${ref}/auth/v1`)).toBe(null)
    // A query or a fragment is the same mistake in another hat.
    expect(projectUrl(`${ref}?apikey=x`)).toBe(null)
    expect(projectUrl(`${ref}#anything`)).toBe(null)
    // A bare origin passes, with or without the root slash.
    expect(projectUrl(ref)).toBe(ref)
    expect(projectUrl(`${ref}/`)).toBe(`${ref}/`)
  })

  test("an API key pasted into the URL field is refused", () => {
    // What was actually in the variable when the portal stayed dark: the
    // publishable key, sitting in NEXT_PUBLIC_SUPABASE_URL. Neither key
    // format begins with a scheme, so both were already refused — this
    // pins that down, and the log line names the shape.
    expect(projectUrl("sb_publishable_7S8FS-wCYRUbi3yYGCTVxg_1u753YMV")).toBe(null)
    expect(projectUrl("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.x.y")).toBe(null)
  })

  test("a real project URL survives, and a stray newline is forgiven", () => {
    const url = "https://daymxmkicegpfbumarhi.supabase.co"
    expect(projectUrl(url)).toBe(url)
    // Trailing whitespace off a copied line is nobody's decision.
    expect(projectUrl(`  ${url}\n`)).toBe(url)
    expect(projectUrl("http://localhost:54321")).toBe("http://localhost:54321")
  })

  test("the quotes are refused rather than stripped", () => {
    // Repairing the value would hide a mistake that stays in the Vercel
    // dashboard for the next person to trip over. Refusing it costs a
    // sign-in screen and a log line that names the variable.
    expect(projectUrl('"https://x.supabase.co"')).not.toBe("https://x.supabase.co")
  })

  test("both clients validate before constructing anything", () => {
    for (const file of ["src/lib/client-auth.ts", "src/lib/supabase.ts"]) {
      const source = read(file)
      expect(source, file).toContain("projectUrl(")
      // The specific regression: a truthiness-only guard in front of the
      // constructor. If `if (!URL` comes back, so does the outage.
      expect(source.includes("if (!URL"), file).toBe(false)
      // And the shadowing trap that made the fix awkward: a module-scope
      // `const URL` hides the global constructor this validation needs.
      expect(source.includes("const URL ="), file).toBe(false)
    }
  })

  test("a failed dossier read never renders as an empty dossier", () => {
    // `projects.error` and `subscriptions.error` were not read, so a
    // failed read collapsed into `[]` with status "ok" — and the portal
    // told a paying client their garden was not there. The `clients`
    // query was guarded against exactly this; the other two were not.
    const source = read("src/lib/client-dossier.ts")
    const guard = source.indexOf("if (projects.error || subscriptions.error)")
    expect(guard, "both errors must be read before the dossier is built").toBeGreaterThan(-1)
    // What the guard returns, not merely that it exists: an early return
    // that still said "ok" would pass a containment check and ship the
    // same lie. Read to the end of that one block.
    const block = source.slice(guard, source.indexOf("}", guard) + 1)
    expect(block).toContain('status: "unavailable"')
    expect(block).toContain("...EMPTY")
    // The client is kept — who they are WAS read successfully, so the
    // page can still greet them while saying the rest did not load.
    expect(block).toContain("client,")
  })

  test("the migration can be run twice", () => {
    // Postgres has no `create type if not exists`, and a migration runs
    // as one transaction — so re-running the file aborted at the enum
    // and rolled back everything after it, leaving two tables and an
    // error about a type that already existed.
    const sql = read("supabase/migrations/0001_client_dossier.sql")
    expect(sql).toContain("when duplicate_object then null")
    const bare = sql
      .split("\n")
      .filter((l) => l.trim().startsWith("create type "))
      .filter((l) => !l.includes("--"))
    // The only `create type` left must be the guarded one inside the block.
    expect(bare).toHaveLength(1)
    expect(sql.indexOf("do $$")).toBeLessThan(sql.indexOf("create type "))
  })
})
