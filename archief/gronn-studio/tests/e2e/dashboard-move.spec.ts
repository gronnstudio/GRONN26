import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { config as proxyConfig } from "@/proxy"

// The panel has moved twice: /admin → /clients/admin → /dashboard.
//
// `TIMEVAULT/PROBLEMS.md` records what happens when only the links are
// updated: /nl/admin returned 404 twice, and the second time was from the
// owner's own bookmark, because the first fix corrected every link and
// left the ADDRESS broken. So both old addresses are pinned here, with
// their tails, and so is the locale list that the move quietly fell out
// of — the sweep in behaviors.spec.ts caught /nl/dashboard the same
// afternoon this landed.

// `/admin` and its tails are already pinned in behaviors.spec.ts ("the
// old owner panel keeps its URLs"). What that block does not cover is the
// SECOND move — /clients/admin — so only those are added here, in the
// same shape.
test.describe("the panel's second old address still leads somewhere", () => {
  for (const [from, to] of [
    ["/clients/admin", "/dashboard"],
    ["/clients/admin/intakes", "/dashboard/intakes"],
    ["/clients/admin/offertes", "/dashboard/offertes"],
  ] as const) {
    test(`${from} → ${to}`, async ({ page }) => {
      const res = await page.request.get(from, { maxRedirects: 0 })
      expect(res.status(), `${from} should redirect`).toBe(308)
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe(to)
    })
  }
})

test.describe("the panel says whose it is before it asks who you are", () => {
  // This used to skip on a phone, on the grounds that "the whole frame is
  // `hidden lg:flex`". That stopped being true twice over: signed out,
  // `/dashboard` renders `PanelGate`, which is its own page and has never
  // used the panel frame at all — and the frame's large-screen refusal is
  // now a choice the caller makes (`phoneReady`) rather than a rule of
  // the shell. So the gate draws at every width, and this runs at every
  // width.

  test("signed out, the rail carries the sign-in and names it internal", async ({
    page,
  }) => {
    await page.goto("/dashboard")
    // The gate draws the frame now rather than replacing the page with a
    // bare logo and a button. What it must NOT draw is anything read from
    // storage — that is asserted in behaviors.spec.ts against
    // /dashboard/intakes.
    await expect(page.getByText("Alleen voor intern gebruik")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Inloggen met Google" })
    ).toBeVisible()
  })

  test("it points a client at their own door instead", async ({ page }) => {
    await page.goto("/dashboard")
    // The two audiences were living under one path, which is exactly how
    // they got confused. The gate now names both and sends each its own
    // way — see two-audiences.spec.ts for the rest of that contract.
    const portal = page.getByRole("link", { name: "Inloggen met e-mail" })
    await expect(portal).toHaveAttribute("href", "/clients/login")
  })
})

test.describe("the two lists that have to agree", () => {
  // `UNLOCALIZED` in lib/locale.ts and the proxy's `matcher` are the same
  // fact written twice: which trees live outside `[locale]`. Next needs
  // the matcher to be a literal it can read at build time, so it cannot
  // be derived from the other one — which means the only thing keeping
  // them in step is this test.
  //
  // Both have now been missed, separately, by the same move. Adding
  // /dashboard to UNLOCALIZED fixed the LINKS (a Dutch page had been
  // generating /nl/dashboard); the matcher still rewrote /dashboard to
  // /en/dashboard, which has no route, so the entire panel answered 404
  // from every address at once.
  test("every unlocalized tree is also excluded from the proxy", () => {
    const locale = readFileSync(join(process.cwd(), "src/lib/locale.ts"), "utf8")
    const list = locale.match(/const UNLOCALIZED = \[([^\]]*)\]/)
    expect(list, "UNLOCALIZED should be a literal array").toBeTruthy()

    const trees = [...list![1].matchAll(/"\/([a-z-]+)"/g)].map((m) => m[1])
    expect(trees.length).toBeGreaterThan(3)

    const matcher = proxyConfig.matcher.join(" ")
    for (const tree of trees) {
      expect(
        matcher,
        `/${tree} is unlocalized but the proxy still rewrites it into [locale]`
      ).toContain(tree)
    }
  })
})

/* ── signing out lands on the door, not on the front of the site ───── */

// Signing out of a tool is not leaving it. The usual reason is to sign
// in as somebody else — the studio's account, or a client's, to see what
// they see — and landing on the marketing homepage means finding the way
// back in from scratch.
//
// Signed out, `/dashboard` IS the gate and it offers both doors, so both
// sign-outs point there.
test.describe("signing out returns to the door", () => {
  test("the studio's button goes back to /dashboard", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/dashboard/dashboard-shell.tsx"),
      "utf8"
    )
    const call = source.slice(source.indexOf("signOut({"))
    expect(call.slice(0, 80)).toContain('callbackUrl: "/dashboard"')
  })

  test("and so does the client's sign-out route", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/clients/auth/signout/route.ts"),
      "utf8"
    )
    // The redirect target, not just any mention: the comment above it
    // legitimately names the old destination while explaining the change.
    const redirect = source.slice(source.indexOf("NextResponse.redirect"))
    expect(redirect.slice(0, 90)).toContain('"/dashboard"')
  })

  test("that address answers, signed out", async ({ page }) => {
    const res = await page.goto("/dashboard", { waitUntil: "domcontentloaded" })
    expect(res?.status()).toBeLessThan(400)
    // And it is the gate, not a panel: no signed-in surface leaks here.
    await expect(page.getByText("Inloggen met Google")).toBeVisible()
  })
})
