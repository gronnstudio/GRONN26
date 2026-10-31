import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// "Het klantportaal is nog niet aangesloten" — over a portal that was.
//
// `NEXT_PUBLIC_*` is inlined into the JavaScript when the site is built.
// A deployment made before those variables existed carries `undefined`
// forever, and setting them afterwards changes nothing about that
// bundle. So the browser saying "no project" does not mean there is no
// project; it can equally mean this build predates the keys, or that
// they are not scoped to this environment.
//
// The two faults need two sentences, because they need two different
// actions — and the first one told the owner to ring the studio, which
// is themselves.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

const FORMS = [
  "src/app/clients/login/login-form.tsx",
  "src/app/clients/registreren/register-form.tsx",
  "src/app/clients/wachtwoord-vergeten/forgot-form.tsx",
  "src/app/clients/wachtwoord-herstellen/reset-form.tsx",
]

const PAGES = [
  "src/app/clients/login/page.tsx",
  "src/app/clients/registreren/page.tsx",
  "src/app/clients/wachtwoord-vergeten/page.tsx",
  "src/app/clients/wachtwoord-herstellen/page.tsx",
]

test.describe("the sign-in screen can tell a missing project from a stale build", () => {
  test("the server check reads the one credential that is never inlined", () => {
    const source = read("src/lib/supabase.ts")
    const fn = source.slice(source.indexOf("export function serverHasProject"))
    const body = fn.slice(0, fn.indexOf("\n}"))

    // The service-role key, read at CALL time. A module-scope constant
    // would be evaluated once per process, which is fine, but reading it
    // here is what keeps it a genuine runtime lookup rather than
    // something a bundler can fold away.
    expect(body).toContain("process.env.SUPABASE_SERVICE_ROLE_KEY")
    // Never the public pair: those are exactly the values that go stale.
    expect(body.includes("NEXT_PUBLIC_")).toBe(false)
  })

  test("the check stays on the server side of the boundary", () => {
    // It lives in the `server-only` module, so importing it from a client
    // component is a build error rather than a leaked key. What crosses
    // to the forms is a BOOLEAN — see tests/e2e/panel-boundary.spec.ts
    // for the outage that followed from crossing with anything else.
    expect(read("src/lib/supabase.ts").startsWith('import "server-only"')).toBe(true)

    for (const page of PAGES) {
      expect(read(page), page).toContain("serverHasProject()")
    }
    for (const form of FORMS) {
      const source = read(form)
      expect(source, form).toContain("serverHasProject?: boolean")
      // A client component must never read the server's key itself.
      expect(source.includes("SUPABASE_SERVICE_ROLE_KEY"), form).toBe(false)
    }
  })

  test("every form picks the message that names the actual fault", () => {
    for (const form of FORMS) {
      const source = read(form)
      // Three branches, because the fix differs each time.
      expect(source, form).toContain("serverUrlMalformed")
      expect(source, form).toContain("BAD_URL")
      expect(source, form).toContain("STALE_BUILD")
      expect(source, form).toContain("UNCONFIGURED")
    }
  })

  test("a malformed value is not answered with 'redeploy'", () => {
    // The ordering is the whole point: `serverUrlMalformed` is tested
    // FIRST. A redeploy over a pair of stray quotes changes nothing, and
    // sending somebody round that loop is how an afternoon disappears.
    for (const form of FORMS) {
      const source = read(form)
      // The whole ternary, whitespace-normalised: asserting on the shape
      // rather than on two indexes, because a form has several
      // `setError(` calls and slicing to the first one tests nothing.
      const flat = source.replace(/\s+/g, " ")
      expect(flat, form).toContain(
        "serverUrlMalformed ? BAD_URL : serverHasProject ? STALE_BUILD : UNCONFIGURED"
      )
    }
  })

  test("the BROWSER client validates too — the module the first repair missed", () => {
    // This is where the second afternoon went. `client-auth.ts` and
    // `supabase.ts` were validated; this one was not, and it is the one
    // the sign-in button actually calls. `createBrowserClient` throws
    // synchronously on a malformed URL exactly like its server twin.
    const source = read("src/lib/client-auth-browser.ts")
    expect(source).toContain("projectUrl(")
    expect(source.includes("if (!url || !key) return null")).toBe(false)
    // The URL must be validated BEFORE it reaches the constructor.
    const flat = source.replace(/\s+/g, " ")
    expect(flat.indexOf("projectUrl(")).toBeLessThan(
      flat.indexOf("createBrowserClient(")
    )
  })

  test("a thrown error in a submit handler can never be silent", () => {
    // An async handler's rejection is discarded by React: no message, no
    // spinner, no navigation. The visitor presses the button and nothing
    // whatsoever happens, which is worse than a crash — a crash at least
    // says where it happened.
    for (const form of FORMS) {
      const source = read(form)
      expect(source, form).toContain("onSubmit(event).catch(")
      // And the form must attach the GUARDED handler, not the raw one.
      expect(source, form).toContain("<form onSubmit={guarded}")
      expect(source.includes("<form onSubmit={onSubmit}"), form).toBe(false)
    }
  })

  test("the malformed check reads the build's own value, not the key", () => {
    const source = read("src/lib/supabase.ts")
    const fn = source.slice(source.indexOf("export function serverUrlMalformed"))
    const body = fn.slice(0, fn.indexOf("\n}"))
    // RAW_URL is what the build was handed; PROJECT_URL is that value
    // after validation. Set-but-invalid is exactly the gap between them.
    expect(body).toContain("RAW_URL")
    expect(body).toContain("PROJECT_URL")
  })

  test("the two messages ask for two different things", () => {
    const messages = read("src/app/clients/auth-messages.ts")
    expect(messages).toContain("UNCONFIGURED")
    expect(messages).toContain("STALE_BUILD")
    // The distinction is the whole point: one is a phone call, the other
    // is a deploy. If they ever say the same thing, this file is a lie.
    const unconfigured = messages.slice(messages.indexOf("export const UNCONFIGURED"))
    const stale = messages.slice(messages.indexOf("export const STALE_BUILD"))
    const bad = messages.slice(messages.indexOf("export const BAD_URL"))
    expect(unconfigured.slice(0, 200)).toContain("Neem contact op")
    expect(stale.slice(0, 200)).toContain("opnieuw uit")
    // And the third asks for neither — it points at the value itself.
    expect(bad.slice(0, 250)).toContain("Vercel")
    expect(bad.slice(0, 250)).not.toContain("opnieuw uit")
  })

  test("the unconfigured state still renders rather than throwing", async ({ page }) => {
    // CI has no Supabase project, which makes it the exact case this
    // guards: the screen has to draw, with fields, and not a crash.
    const response = await page.goto("/clients/login")
    expect(response?.status()).toBe(200)
    await expect(page.getByLabel("E-mailadres")).toBeVisible()
    await expect(page.getByRole("button", { name: "Inloggen" })).toBeVisible()
  })
})
