import { expect, test } from "@playwright/test"

// Two things a client could not find from the site itself.
//
// The panel grew a second audience, but the navigation kept describing
// it as the studio's alone — "hier valt voor bezoekers niets te halen",
// in the mega menu and again in the footer. And the long design intake
// was reachable ONLY from a link inside step one of the short form on
// /contact, so anyone who did not start that form never learned it
// existed, including a client who had been told to fill one in.
//
// The first repair listed THREE destinations and a sentence explaining
// which of them was yours. That solved the finding and left a menu that
// asks the reader to sort themselves before they can click. One door
// now: `/dashboard` reads the session and decides.

test.describe("a client can find their way in from the site", () => {
  test.skip(({ isMobile }) => isMobile)

  test("the Studio menu offers one door, not a choice of three", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })

    // One door, and it is the panel itself. The column used to hold
    // three rows — client portal, site editor, panel — above a sentence
    // saying which of them was yours. `/dashboard` reads the session and
    // decides that itself, so the menu stopped sorting people.
    const door = page.getByRole("link", { name: /Dashboard/ })

    // The HOVER is retried, not just the assertion, and that is the
    // point of `toPass` here.
    //
    // This test passed alone and failed in the full suite — three times,
    // once in CI, once on a pull request that changes nothing but a
    // markdown file. A first guess (the hover lands on the opening veil)
    // was wrong: adding `networkidle` and a 3.5s wait changed nothing.
    //
    // What the evidence supports is that one hover sometimes does not
    // take. The bar opens on `pointerenter` after a 120ms intent delay
    // (`OPEN_DELAY` in bar-panels.tsx) and closes again on
    // `pointerleave`; under the load of two projects running fully in
    // parallel, a cursor parked on a button that then shifts underneath
    // it produces exactly this. Waiting longer before hovering cannot
    // fix that — only hovering again can.
    //
    // So the retry is honest rather than a workaround: the claim under
    // test is "the menu offers one door", not "a single synthetic hover
    // always lands on a CPU-starved runner".
    await expect(async () => {
      await page.getByRole("button", { name: /Studio/ }).first().hover()
      await expect(door.first()).toBeVisible({ timeout: 2000 })
    }).toPass({ timeout: 20_000 })

    await expect(door.first()).toHaveAttribute("href", "/dashboard")

    // And no route the visitor has to choose between.
    await expect(page.locator('a[href="/clients/login"]')).toHaveCount(0)
    await expect(page.locator('a[href="/editor"]')).toHaveCount(0)

    // The sentence that was false for weeks.
    await expect(
      page.getByText("hier valt voor bezoekers niets te halen")
    ).toHaveCount(0)
    // And the one that replaced it, which the collapse made false in turn.
    await expect(
      page.getByText("onderste twee zijn van de studio")
    ).toHaveCount(0)
  })

  // The second half of this file's original finding has been reversed on
  // purpose, and saying so is cheaper than letting somebody rediscover
  // it as a regression.
  //
  // The finding was real: the long intake was reachable ONLY from a link
  // inside step one of the short form, so anyone who did not start that
  // form never learned it existed. The fix — an entry in the mega menu —
  // was right for what the sheet was then, a public questionnaire.
  //
  // It is not that any more. The sheet belongs to people who are signed
  // in, and the public site offers one way to start a conversation
  // rather than two of wildly different weight. So the menu carries no
  // route to it, and neither does the footer.
  test("the design intake is not a public door any more", async ({ page }) => {
    await page.goto("/nl")
    await expect(page.locator('a[href$="/contact/intake"]')).toHaveCount(0)
  })
})

test.describe("the footer says the same thing", () => {
  test("it points at the same single door", async ({
    page,
  }) => {
    await page.goto("/nl")
    const footer = page.locator("footer")
    await expect(
      footer.getByRole("link", { name: /Dashboard/ })
    ).toHaveAttribute("href", "/dashboard")
    await expect(
      footer.getByText("Hier valt voor bezoekers niets te halen")
    ).toHaveCount(0)
  })
})
