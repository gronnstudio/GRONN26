import { expect, test } from "@playwright/test"

// The menu a phone gets when you turn it sideways.
//
// This whole file exists because of an arithmetic fact nobody had
// noticed. Tailwind's `md` is 768px, the dock is `md:hidden` and the
// tablet menu is `hidden md:block lg:hidden` — and every current phone in
// LANDSCAPE is wider than 768px:
//
//     Pixel 7    412 × 915  →  915 × 412
//     iPhone 14  390 × 844  →  844 × 390
//
// So rotating a phone swaps the entire navigation for a component
// written for an iPad, in a viewport under 400px tall. The suite drove
// that component once, at 900 × 1000, which is a shape no device has.
//
// The two things the owner asked for on the upright sheet — a visible
// sign that the list scrolls, and no ragged price column — were fixed
// there and were still broken here. These measure both, at the height a
// hand actually holds.

const menu = "button[aria-controls='tablet-menu']"

test.describe("a rotated phone still has a whole menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
  })

  test("the dock steps aside and the Menu button takes over", async ({
    page,
  }) => {
    // Asserted, not assumed: this is the premise the rest of the file
    // rests on, and it is exactly the kind of thing a breakpoint change
    // would silently undo.
    // `data-nav` en niet het label: de dock en de balk op desktop dragen
    // allebei "Hoofdmenu", wat mag omdat er altijd precies één zichtbaar
    // is — maar een test kan ze daaraan niet uit elkaar houden.
    await expect(page.locator("nav[data-nav='dock']")).toBeHidden()
    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toHaveAttribute("aria-expanded", "false")
  })

  test("it carries the whole tree, sections and services alike", async ({
    page,
  }) => {
    await page.locator(menu).click()
    const card = page.locator("#tablet-menu")
    await expect(card).toBeVisible()

    for (const section of [
      "/studio",
      "/services",
      "/projects",
      "/contact",
    ]) {
      await expect(
        card.locator(`a[href$='${section}']`).first(),
        `${section} missing from the menu`
      ).toHaveCount(1)
    }
    // Sinds V5 draagt Studio de twee delen van "Over Nick".
    for (const child of ["/studio#uitgangspunten", "/studio#manifest"]) {
      await expect(card.locator(`a[href$='${child}']`)).toHaveCount(1)
    }
    // Eleven services, reachable from the only navigation this width has.
    const services = card.locator("a[href*='/services/']")
    expect(await services.count()).toBeGreaterThanOrEqual(10)
  })

  // The complaint, one breakpoint up from where it was fixed. At 360px
  // tall the card is ~264px of a two-column tree: it clips, and before
  // this it clipped against a hard edge with nothing to say there was
  // more.
  test("the card's bottom edge says whether the list carries on", async ({
    page,
  }) => {
    await page.locator(menu).click()
    const card = page.locator("#tablet-menu")
    await expect(card).toBeVisible()
    await page.waitForTimeout(600)

    // The scroller is the inner box, not the positioning wrapper (since
    // 28 Sep 2026 there is also a BREEDTE wrapper around it; the scroller
    // carries its own marker).
    const box = card.locator("[data-paneel-scroller]")
    const overflow = await box.evaluate(
      (el) => el.scrollHeight - el.clientHeight
    )
    // If it ever stops overflowing at this height, this test proves
    // nothing and should be told so rather than passing quietly.
    expect(overflow, "the card must overflow at 360px tall").toBeGreaterThan(50)

    const masked = () =>
      box.evaluate((el) => getComputedStyle(el).maskImage !== "none")
    expect(await masked()).toBe(true)

    await box.evaluate((el) => el.scrollTo(0, el.scrollHeight))
    await expect.poll(masked).toBe(false)
  })

  // Only six of the eleven services have a price. Hung in a `trailing`
  // column, "Ontwerp en aanleg" showed one amount against five blanks.
  test("a service's price is in its own gloss, not in a column", async ({
    page,
  }) => {
    await page.locator(menu).click()
    const card = page.locator("#tablet-menu")
    await expect(card).toBeVisible()

    const service = card.locator("a[href$='/services/leaf-net']")
    await service.scrollIntoViewIfNeeded()
    await expect(service).toContainText(/vanaf/)

    const line = await service.evaluate((a) => {
      const amount = Array.from(a.querySelectorAll("span")).find(
        (el) => el.children.length === 0 && /€/.test(el.textContent ?? "")
      )
      return amount?.parentElement?.textContent ?? "no price found"
    })
    expect(line).toMatch(/Vóór de bladval.+€/)
  })

  test("Escape closes it and hands focus back", async ({ page }) => {
    const trigger = page.locator(menu)
    await trigger.click()
    await expect(page.locator("#tablet-menu")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.locator("#tablet-menu")).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("nothing in the open menu is too small to hit, and it does not scroll sideways", async ({
    page,
  }) => {
    await page.locator(menu).click()
    await expect(page.locator("#tablet-menu")).toBeVisible()

    const small = await page.evaluate(() => {
      const MIN = 24
      return [...document.querySelectorAll<HTMLElement>("a, button")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect()
          const pad = getComputedStyle(el, "::before")
          const overhangs = pad.content !== "none" && pad.position === "absolute"
          return {
            w: Math.max(r.width, overhangs ? parseFloat(pad.minWidth) || 0 : 0),
            h: Math.max(r.height, overhangs ? parseFloat(pad.minHeight) || 0 : 0),
            txt: (el.textContent || el.getAttribute("aria-label") || "")
              .trim()
              .slice(0, 30),
          }
        })
        .filter((x) => x.w > 4 && x.h > 4)
        .filter((x) => !/Direct naar inhoud|Skip to content/.test(x.txt))
        .filter((x) => x.w < MIN || x.h < MIN)
        .map((x) => `${x.txt} ${Math.round(x.w)}×${Math.round(x.h)}`)
    })
    expect(small, small.join(", ")).toEqual([])

    const over = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
    expect(over).toBeLessThanOrEqual(0)
  })
})
