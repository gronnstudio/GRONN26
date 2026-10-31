import { execSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// The secret that must never reach a browser.
//
// This repository has shipped one before: the studio's IBAN sat in a
// client chunk until #89, because a module that read it was imported
// from a component that runs in the browser. That was an account number
// on an invoice the client receives anyway.
//
// `SUPABASE_SERVICE_ROLE_KEY` is a different order of mistake. It
// bypasses every row-level policy in the schema, so anyone holding it
// can read and write every client's dossier — the photographs, the
// addresses, the invoices. Next.js only inlines `NEXT_PUBLIC_` variables,
// so the accident is not automatic; it takes someone renaming the
// variable or pasting a value. These assertions make that visible in
// review rather than after.

const ROOT = process.cwd()
const SECRET = "SUPABASE_SERVICE_ROLE_KEY"

/** Every file under a directory, recursively. */
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

test.describe("the service-role key stays on the server", () => {
  test("only one module reads it, and that module is server-only", () => {
    // `git grep` rather than a walk, so .gitignore is respected and a
    // stray .env.local cannot fail somebody's run. `--untracked` matters:
    // without it this passes on a file that has not been committed yet,
    // which is exactly when someone would be adding a second reader.
    const hits = execSync(`git grep -l --untracked ${SECRET} -- src || true`, {
      cwd: ROOT,
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean)

    expect(hits, `only src/lib/supabase.ts may read ${SECRET}`).toEqual([
      "src/lib/supabase.ts",
    ])

    const source = readFileSync(join(ROOT, "src/lib/supabase.ts"), "utf8")
    // The import is the enforcement. Without it, a client component
    // importing this module fails at runtime in the browser instead of
    // at build time — which is to say, in front of a visitor.
    expect(source).toContain('import "server-only"')
  })

  test("it is never prefixed NEXT_PUBLIC_, which would inline it", () => {
    const hits = execSync(
      `git grep -l --untracked "NEXT_PUBLIC_SUPABASE_SERVICE" -- src .env.example || true`,
      { cwd: ROOT, encoding: "utf8" }
    ).trim()
    expect(hits, "a NEXT_PUBLIC_ prefix puts a secret in every browser").toBe("")
  })

  test("no built client chunk mentions it", () => {
    const dir = join(ROOT, ".next/static")
    test.skip(!existsSync(dir), "no build output to scan")

    const offenders = walk(dir)
      .filter((f) => f.endsWith(".js"))
      .filter((f) => readFileSync(f, "utf8").includes(SECRET))
      .map((f) => f.replace(ROOT, ""))

    expect(offenders, offenders.join(", ")).toEqual([])
  })
})
