import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// The intake the STUDIO fills in.
//
// Same questionnaire as the public one, mounted inside the owner panel
// for someone already signed in. What differs is the notification half,
// and that difference is the whole reason this is not simply the visitor
// form dropped into a new route.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")

test.describe("a studio intake never rings a doorbell at the studio", () => {
  test("it writes through the owner route, not the public one", () => {
    const source = code("src/components/intake/deep-intake.tsx")
    // One payload, two endpoints. The archive cannot tell the two apart,
    // which is the point — /dashboard/intakes reads them the same way.
    expect(source).toContain('studio ? "/api/admin/intake" : "/api/intake"')
  })

  test("the e-mail doorbell and the mailto fallback are visitor-only", () => {
    const source = code("src/components/intake/deep-intake.tsx")
    // With no Slack webhook configured — today's setup — every visitor
    // submission takes the FormSubmit path. Left unguarded, the panel
    // would e-mail hello@gronn.studio to announce an intake to the
    // person who had just finished typing it.
    expect(source).toContain("if (!studio && result.relay === \"none\")")
    // And the archive-failed branch must not put a client's address and
    // 36 answers through a third party on a path nobody chose.
    const fail = source.slice(source.indexOf("} catch {", source.indexOf("throw new Error(\"not_archived\")")))
    const guard = fail.slice(0, fail.indexOf("ringByEmail(false)"))
    expect(guard, "the studio must return before any e-mail fallback").toContain(
      "if (studio)"
    )
  })

  test("the owner route posts nowhere and accepts a dossier", () => {
    const source = code("src/app/api/admin/intake/route.ts")
    expect(source).toContain("getOwnerSession")
    // No Slack, no webhook, no relay of any kind.
    expect(source.includes("SLACK_WEBHOOK_URL")).toBe(false)
    expect(source.includes("formsubmit")).toBe(false)
    // On the phone the owner knows whose garden this is — the one moment
    // that fact is trustworthy. /api/intake deliberately does not take it.
    expect(source).toContain("clientId")
  })

  test("the two modes keep separate drafts", () => {
    const source = code("src/components/intake/deep-intake.tsx")
    // A visitor fills this in once. The owner fills one in per phone
    // call, and a single shared key would open call two on top of call
    // one's answers.
    expect(source).toContain("gronn-intake-draft-studio")
    expect(source).toContain("draftKey(mode)")
  })

  test("the sheet is mounted in Dutch, or the archive fills with English", () => {
    const source = code("src/app/dashboard/intakes/new/page.tsx")
    // /dashboard has no layout of its own, so it inherits the root
    // provider, which carries no locale and defaults to English. And
    // `transcript()` depends on `t`, so without this the ARCHIVED text
    // would be English too, sitting beside Dutch submissions.
    expect(source).toContain('<LanguageProvider locale="nl">')
    // The page serves both audiences now, so the mode is chosen rather
    // than fixed — and who is typing is what decides whether a doorbell
    // rings. The studio needs none; a client is the case it exists for.
    expect(source).toContain('mode={studio ? "studio" : "visitor"}')
    expect(source).toContain('viewer.kind === "owner"')
  })
})

test.describe("it is behind the same gate as the rest of the panel", () => {
  test("signed out, the form is not served", async ({ page }) => {
    const res = await page.request.get("/dashboard/intakes/new", {
      maxRedirects: 0,
    })
    if (res.status() === 200) {
      const body = await res.text()
      // The gate may legitimately answer 200 — but it must be the gate.
      expect(body).toContain("Inloggen met Google")
      for (const leak of ["Wat is de aanleiding", "Verstuur de intake"]) {
        expect(body).not.toContain(leak)
      }
    }
  })

  test("the write route refuses an unauthenticated post", async ({ page }) => {
    const res = await page.request.post("/api/admin/intake", {
      data: { reference: "2026-01-01-aaaaaaaaaaaa", transcript: "x" },
      failOnStatusCode: false,
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).not.toBe(200)
  })
})
