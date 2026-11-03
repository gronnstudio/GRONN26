import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// The client portal: a household reading its own garden.
//
// Everything that decides whether it reads only its OWN garden is either
// a line of SQL or a single call in a route, and CI has no Supabase
// project to prove it against. So the properties are asserted where they
// live, the way secrets.spec.ts does — and the live half below drives the
// screens that must work with no database at all.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

/**
 * The file with its comments removed.
 *
 * These assertions are about what the code DOES, and several of the
 * comments in these modules name the very call they exist to explain —
 * "no `.eq("client_id")` here, the policies do that". Read raw, this spec
 * failed on the sentence describing its own rule.
 */
function code(path: string): string {
  return read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
}

test.describe("the portal's guards", () => {
  test("a session is verified against the auth server, never read off the cookie", () => {
    const source = code("src/lib/client-auth.ts")
    // getSession reads the cookie and believes it; getUser asks whether
    // the token is real. On a server that is the whole difference
    // between a session and a forged cookie.
    expect(source).toContain("auth.getUser()")
    expect(
      source.includes("auth.getSession()"),
      "getSession trusts the cookie — it must not be the gate"
    ).toBe(false)
  })

  test("a client's own data is read under RLS, not with the service role", () => {
    const source = code("src/lib/client-dossier.ts")
    // The service role bypasses every policy in the schema. If it ever
    // appears here, the database's guarantee silently becomes an `if` in
    // application code — which is the thing the schema exists to replace.
    expect(source.includes("serviceClient")).toBe(false)
    expect(source).toContain("clientAuthServer")
    // And no hand-written ownership filter either: the policies do that
    // job, and a filter someone forgets is one client reading another's.
    expect(source.includes('.eq("client_id"')).toBe(false)
  })

  test("hours are unreachable from the client side", () => {
    const source = code("src/lib/client-dossier.ts")
    // The schema grants `hours` no policy at all, so this connection
    // reads zero rows from it. Not querying it is the second lock.
    expect(source.includes('from("hours")')).toBe(false)
  })

  test("linking a dossier demands a confirmed address", () => {
    const source = read("src/app/api/clients/link/route.ts")
    // Without this, typing a client's email into the registration form
    // would hand over their dossier before the real owner of that inbox
    // heard about it. Supabase sets this only once the mailed link is
    // followed.
    expect(source).toContain("email_confirmed_at")
    // And only an unclaimed dossier is linked — in the update itself, so
    // two requests racing cannot both win.
    expect(source).toContain('.is("auth_user_id", null)')
  })

  test("the mailed-link callback cannot be turned into an open redirect", () => {
    const source = read("src/app/api/clients/auth/callback/route.ts")
    // `//evil.example` is a valid protocol-relative URL and passes a
    // naive startsWith("/") check. A link that arrives in a real mail
    // from a real sender and lands elsewhere is the whole prize here.
    expect(source).toContain('startsWith("//")')
  })

  test("signing out is a POST, so no prefetcher can do it", () => {
    const source = code("src/app/api/clients/auth/signout/route.ts")
    expect(source).toContain("export async function POST")
    expect(source.includes("export async function GET")).toBe(false)
  })
})

test.describe("the portal runs with no database configured", () => {
  // CI has no Supabase project. These pages are most of what a client
  // ever sees, so "it only renders when fully wired" would mean they are
  // never tested at all.

  test("the dossier is not served to someone signed out", async ({ page }) => {
    // /clients/portaal folded into the panel: a client's dossier is now
    // what /dashboard renders for a client. The address still resolves,
    // and what matters is unchanged — signed out, no dossier comes back.
    const res = await page.goto("/clients/portaal")
    expect(res?.status()).toBeLessThan(400)
    expect(new URL(page.url()).pathname).toBe("/dashboard")
    await expect(
      page.getByRole("link", { name: "Inloggen met e-mail" })
    ).toBeVisible()
    const body = await page.content()
    for (const leak of ["Tuinen in behandeling", "Lopende abonnementen"]) {
      expect(body, `the gate must not render "${leak}"`).not.toContain(leak)
    }
  })

  for (const [route, heading] of [
    ["/clients/login", "Klantportaal"],
    ["/clients/registreren", "Account aanmaken"],
    ["/clients/wachtwoord-vergeten", "Wachtwoord vergeten"],
  ] as const) {
    test(`${route} renders and every field carries a visible label`, async ({
      page,
    }) => {
      await page.goto(route)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading)

      // Design rule 1: a control a first-time visitor cannot name is a
      // defect, and this is a form people arrive at already frustrated.
      const inputs = page.locator("input")
      for (let i = 0; i < (await inputs.count()); i++) {
        const input = inputs.nth(i)
        const id = await input.getAttribute("id")
        expect(id, "every input needs an id its label can point at").toBeTruthy()
        await expect(page.locator(`label[for="${id}"]`)).toBeVisible()
      }
    })
  }

  test("a recovery link with no session says so instead of offering the form", async ({
    page,
  }) => {
    await page.goto("/clients/wachtwoord-herstellen")
    // Reaching this form without a session would make it an invitation
    // to try changing somebody's password.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Deze link werkt niet meer"
    )
    await expect(page.locator("input")).toHaveCount(0)
  })
})

test.describe("the owner side of the dossier", () => {
  // These routes hold the service role, which bypasses every policy in
  // the schema. What is behind them is every household's name, address
  // and phone number, so the gate is the whole of their safety.
  const OWNER_ROUTES = [
    "src/app/api/admin/clients/route.ts",
    "src/app/api/admin/intake/[reference]/link/route.ts",
    "src/app/api/admin/intake/[reference]/route.ts",
  ]

  for (const route of OWNER_ROUTES) {
    test(`${route} answers only to the owner`, () => {
      const source = code(route)
      expect(source).toContain("getOwnerSession")
      // The distinction lib/auth.ts exists to keep: a client session must
      // never satisfy one of these.
      expect(source.includes("getClientUser")).toBe(false)
    })
  }

  test("a dossier is created by the studio, never by a registration", () => {
    // The asymmetry is the design. `/api/clients/link` may only ATTACH an
    // account to a dossier that already exists; if it could insert one, a
    // sign-up form would decide who the studio's clients are.
    const link = code("src/app/api/clients/link/route.ts")
    expect(link.includes(".insert(")).toBe(false)
    // Creation lives in the owner-side module instead — the one that
    // holds the service role and is server-only by import.
    const admin = code("src/lib/client-admin.ts")
    expect(admin).toContain(".insert(")
    expect(read("src/lib/client-admin.ts")).toContain('import "server-only"')
  })

  test("an enquiry is attached to a dossier by a person, not by matching text", () => {
    const source = code("src/lib/intake-archive.ts")
    const fn = source.slice(source.indexOf("export async function linkSubmission"))
    const body = fn.slice(0, fn.indexOf("\n}\n"))
    // The record is re-read before it is rewritten. Patching the panel's
    // page-load snapshot back would undo anything that landed in between
    // — a recovery that reattached files, most of all.
    expect(body).toContain("readBlob(recordPath(reference))")
    // Nothing here derives an identity from the contact field.
    expect(body.includes("contact")).toBe(false)
  })
})
