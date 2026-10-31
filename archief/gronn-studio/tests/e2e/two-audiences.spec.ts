import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// One address, two dashboards.
//
// /dashboard serves the studio and a client. The studio gets the full
// panel; a client gets a shorter one built from their own dossier. What
// this file guards is that the second is a DIFFERENT PAGE and not the
// first with things styled out — a blur or a `hidden` class over the
// studio's figures would put every household's name and every amount in
// the markup of a page a client can open.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")

test.describe("what a client may not see is not rendered", () => {
  test("the client branch returns before any owner archive is read", () => {
    const source = code("src/app/dashboard/page.tsx")
    const clientBranch = source.slice(
      source.indexOf('if (viewer.kind === "client")'),
      source.indexOf("const [intakes, archive]")
    )
    // The owner's two archives hold every client's enquiries and every
    // invoice. The client path must not touch them at all — not to read
    // and discard, not to render and hide.
    expect(clientBranch.includes("readArchive")).toBe(false)
    expect(clientBranch.includes("readDocuments")).toBe(false)
    expect(clientBranch).toContain("readDossier")
    expect(clientBranch).toContain("return")
  })

  test("the client's overview never imports the studio's sources", () => {
    const source = code("src/app/dashboard/client-overview.tsx")
    for (const owned of [
      "intake-archive",
      "document-archive",
      "document-store",
      "client-admin",
      "lib/supabase",
    ]) {
      expect(source, `client overview must not reach ${owned}`).not.toContain(
        owned
      )
    }
    // Its one source is the RLS-scoped dossier.
    expect(source).toContain("client-dossier")
  })

  test("nothing is hidden with CSS in place of not being rendered", () => {
    const source = code("src/app/dashboard/client-overview.tsx")
    // The ask was "blur the tiles a client cannot use". A blur over real
    // figures is a picture of a lock, not a lock. The client's tiles are
    // their own data instead.
    for (const trick of ["blur-", "opacity-0", "invisible", "select-none"]) {
      expect(source, `${trick} would be styling out real data`).not.toContain(
        trick
      )
    }
  })

  test("the client rail carries no counts", () => {
    const source = code("src/app/dashboard/nav.ts")
    const fn = source.slice(source.indexOf("export function clientNav"))
    // A badge is a number about the studio's work.
    expect(fn.includes("badge")).toBe(false)
  })

  test("owner-only surfaces send a signed-in client home, not to a login", () => {
    for (const surface of ["agenda", "intakes", "offertes"]) {
      const source = code(`src/app/dashboard/${surface}/page.tsx`)
      expect(source, `${surface} should redirect a client`).toContain(
        'if (viewer.kind === "client") redirect("/dashboard")'
      )
    }
  })

  test("a client signs out through Supabase, not next-auth", () => {
    const shell = code("src/app/dashboard/dashboard-shell.tsx")
    // Calling next-auth's signOut on a Supabase session clears a cookie
    // that was never set and leaves the real one standing: signed out to
    // the eye, signed in to the server.
    expect(shell).toContain("signOutHref")
    expect(code("src/app/dashboard/page.tsx")).toContain(
      '"/api/clients/auth/signout"'
    )
  })
})

test.describe("the gate offers both doors", () => {
  test("signed out, /dashboard asks who you are and shows nothing else", async ({
    page,
  }) => {
    await page.goto("/dashboard")

    await expect(
      page.getByRole("link", { name: "Inloggen met e-mail" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Inloggen met Google" })
    ).toBeVisible()

    const body = await page.content()
    for (const leak of [
      "Gefactureerd",
      "Kopieer de antwoorden",
      "Maak offerte",
      "Alle aanvragen",
    ]) {
      expect(body, `the gate must not render "${leak}"`).not.toContain(leak)
    }
  })

  test("the client door leads to the client sign-in", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(
      page.getByRole("link", { name: "Inloggen met e-mail" })
    ).toHaveAttribute("href", "/clients/login")
  })

  test("the old portal address still resolves", async ({ page }) => {
    await page.goto("/clients/portaal")
    expect(new URL(page.url()).pathname).toBe("/dashboard")
  })
})

test.describe("the client portal cannot take the studio's panel down with it", () => {
  // This shipped and broke production. `NEXT_PUBLIC_SUPABASE_URL` was set
  // in Vercel to something that is not a URL, `createServerClient` threw
  // where it stood, and because `getPanelViewer` asks the client-session
  // question in front of EVERY panel surface, the studio's own dashboard
  // answered 500 — over a variable the studio's Google sign-in does not
  // use. Digest 615944990, `Invalid supabaseUrl`.
  //
  // `lib/supabase.ts` states the contract these two forgot: a missing or
  // broken configuration is a state, not a crash.
  const code = (p: string) =>
    readFileSync(join(ROOT, p), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")

  test("a URL that is not a URL never reaches createServerClient", () => {
    const source = code("src/lib/client-auth.ts")
    // Guarded by VALIDATION rather than by catching, which is the better
    // shape and is `main`'s: the value is parsed once into `PROJECT_URL`,
    // and anything that will not parse is refused before a client is
    // built. A truthiness check is what let a pasted pair of quotes
    // through and turned into a site-wide 500.
    expect(source).toContain("projectUrl(RAW_URL)")
    expect(source).toContain("createServerClient(PROJECT_URL")
    // The raw value must never be handed to the constructor.
    expect(source.includes("createServerClient(RAW_URL")).toBe(false)
  })

  test("verifying the session cannot throw out of getClientUser", () => {
    const source = code("src/lib/client-auth.ts")
    const fn = source.slice(source.indexOf("export async function getClientUser"))
    // getUser is a network call: a paused or unreachable project makes it
    // reject rather than return `{ error }`.
    expect(fn).toContain("auth.getUser()")
    expect(fn.indexOf("try {")).toBeLessThan(fn.indexOf("auth.getUser()"))
  })

  test("reading the dossier cannot throw either", () => {
    const source = code("src/lib/client-dossier.ts")
    const fn = source.slice(source.indexOf("export async function readDossier"))
    expect(fn.indexOf("try {")).toBeLessThan(fn.indexOf('.from("clients")'))
    expect(fn).toContain('status: "unavailable"')
  })
})
