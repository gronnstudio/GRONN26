import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { LEGAL_DOCUMENTS } from "@/lib/data/legal"

// Every legal document the catalogue names has a page.
//
// WHY THIS FILE EXISTS. `/colofon` does not link a hand-written list; it
// iterates `LEGAL_DOCUMENTS` and builds `/{locale}/{doc.slug}` from
// whatever it finds. That is the right shape — add a document and it
// appears — but it means the catalogue is TRUSTED, and nothing was
// checking that the trust was warranted. It wasn't: the withdrawal form
// was added to the catalogue and shipped without a route, so the colofon
// linked to a 404 on a live page.
//
// The test walks the catalogue rather than a list of paths, on purpose.
// A list of paths would have to be kept in step with the catalogue by
// hand, which is the same failure one level up.

const ROOT = process.cwd()

test.describe("the legal catalogue and the routes agree", () => {
  for (const doc of LEGAL_DOCUMENTS) {
    test(`/nl/${doc.slug} answers — ${doc.title}`, async ({ page }) => {
      const response = await page.goto(`/nl/${doc.slug}`)
      expect(response?.status(), `/nl/${doc.slug} must not 404`).toBe(200)

      // Not just a 200: Next's not-found page also answers 200 on some
      // paths. The document's own intro is the proof that THIS document
      // is what came back.
      await expect(
        page.getByText(doc.intro.slice(0, 60), { exact: false })
      ).toBeVisible()
    })
  }

  test("every document is in the sitemap", () => {
    const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8")
    for (const doc of LEGAL_DOCUMENTS) {
      // A legal page that search cannot find is a page a client has to be
      // sent rather than one they can look up — which is exactly the
      // situation the withdrawal form is meant to prevent.
      expect(sitemap, `${doc.slug} missing from the sitemap`).toContain(
        `"/${doc.slug}"`
      )
    }
  })
})
