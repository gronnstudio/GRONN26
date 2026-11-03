import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { ownerPhoneNav } from "@/app/dashboard/nav"

// The panel in a pocket.
//
// This file started from a wall that was meant to stay: the builder, the
// intake tables and the figures were tools for a big screen, and the
// owner asked for one thing through it — the paperwork, "zodat ik ze snel
// uit m'n telefoon kan toveren". So a phone got the two READING surfaces
// (the documents shelf and the small print) and nothing else.
//
// 25 September 2026 the owner reversed that. He opened /dashboard on his
// iPhone 13, got "Dit paneel is voor een groot scherm gemaakt", and said
// he wants to USE the dashboard on his phone — overzicht, offertes,
// intakes — not that notice. Every owner surface is phone-ready since,
// measured one by one in paneel-op-telefoon.spec.ts with a real owner
// session. What stays here is the shelf itself (the paperwork errand is
// still the fastest thing to do on a phone) and the strip as the plank
// workbench draws it: now the owner's whole panel, still within the
// screen, still with 44px pills.

const ROOT = process.cwd()
const code = (p: string) =>
  readFileSync(join(ROOT, p), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")

test.describe("the studio's paperwork, on a phone", () => {
  test("the navigation strip no longer runs off the edge", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/plank", { waitUntil: "networkidle" })
    await page.waitForTimeout(600)

    const strip = page.locator("nav[aria-label='Beheer']:visible")
    await expect(strip).toHaveCount(1)

    // Measured, because this is what the owner photographed: a green
    // pill sitting half off the screen edge. At 412px the two surfaces
    // ended at 332px; "Bekijk de site" was pushing the content to 498px.
    //
    // Since 25 Sep 2026 the strip carries the owner's whole panel — nine
    // pills — so it DOES scroll, sideways and inside itself, on purpose.
    // What still must not happen is the thing in the photograph: the
    // strip's own box past the screen edge, or the page scrolling with it.
    const viewport = page.viewportSize()!.width
    const box = (await strip.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, "the strip should end at the screen edge").toBeLessThanOrEqual(viewport)
    const pageOver = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
    expect(pageOver, "the page must not scroll with the strip").toBeLessThanOrEqual(0)

    // It is not a surface — it leaves the panel — so it is not in the row
    // of surfaces. It moved to the top bar.
    await expect(strip.locator("a[href='/']")).toHaveCount(0)
    await expect(
      page.locator("header a[href='/'][aria-label='Bekijk de site']")
    ).toBeVisible()
  })

  test("the phone strip offers the owner's whole panel", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/plank", { waitUntil: "networkidle" })
    const items = page.locator("nav[aria-label='Beheer']:visible a")

    // It used to be exactly two — the shelf and the small print — because
    // every other item led back to the large-screen notice. Since the
    // owner reversed that (25 Sep 2026) nothing does, and the strip is
    // the rail plus the shelf, derived in nav.ts rather than listed here.
    const expected = ownerPhoneNav().flatMap((g) => g.items.map((i) => i.href))
    await expect(items).toHaveCount(expected.length)
    expect(
      await items.evaluateAll((els) => els.map((el) => el.getAttribute("href")))
    ).toEqual(expected)
    // The two reading surfaces are still on it.
    expect(expected).toContain("/dashboard/documenten")
    expect(expected).toContain("/dashboard/kleine-letters")
    for (let i = 0; i < expected.length; i++) {
      await items.nth(i).scrollIntoViewIfNeeded()
      const box = await items.nth(i).boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })

  test("nothing on the shelf is too small to hit, and it does not scroll sideways", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/plank", { waitUntil: "networkidle" })
    await page.waitForTimeout(600)

    const small = await page.evaluate(() => {
      const MIN = 24
      return [...document.querySelectorAll<HTMLElement>("a, button, input")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect()
          const pad = getComputedStyle(el, "::before")
          const over = pad.content !== "none" && pad.position === "absolute"
          return {
            w: Math.max(r.width, over ? parseFloat(pad.minWidth) || 0 : 0),
            h: Math.max(r.height, over ? parseFloat(pad.minHeight) || 0 : 0),
            txt: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24),
          }
        })
        .filter((x) => x.w > 4 && x.h > 4)
        .filter((x) => x.w < MIN || x.h < MIN)
        .map((x) => `${x.txt} ${Math.round(x.w)}×${Math.round(x.h)}`)
    })
    expect(small, small.join(", ")).toEqual([])

    // The search box must not make iOS zoom the page in.
    const tiny = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("input")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => parseFloat(getComputedStyle(el).fontSize))
        .filter((px) => !(px >= 16))
    )
    expect(tiny, JSON.stringify(tiny)).toEqual([])

    const over = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
    expect(over).toBeLessThanOrEqual(0)
  })

  test("the search box finds a document by client, number or title", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/plank", { waitUntil: "networkidle" })
    const rows = page.locator("main ul > li")
    await expect(rows).toHaveCount(3)

    await page.getByLabel("Zoek in documenten").fill("Kerkstraat")
    await expect(rows).toHaveCount(1)

    await page.getByLabel("Zoek in documenten").fill("0010")
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText("Eerste termijn")
  })

  test("the large-screen notice is a door, not a dead end", () => {
    // Source, not browser. Since 25 Sep 2026 no panel page draws the
    // notice at all (paneel-op-telefoon.spec.ts holds every one of them
    // to `phoneReady`); it is the safety net for a surface nobody has
    // measured on a phone yet. If it ever shows, it must still lead
    // somewhere: the overview, and the two reading surfaces.
    const source = code("src/app/dashboard/dashboard-shell.tsx")
    const wall = source.slice(
      source.indexOf("Dit paneel is voor een groot scherm"),
      source.indexOf("Terug naar de site")
    )
    expect(wall).toContain('href="/dashboard"')
    expect(wall).toContain("/dashboard/documenten")
    expect(wall).toContain("/dashboard/kleine-letters")
  })

  test("the shelf reads and never writes", () => {
    const source = code("src/app/dashboard/documenten/document-shelf.tsx")
    // A reading screen that can quietly also write is a builder with
    // fewer buttons. The builder itself is on the phone since 25 Sep
    // 2026; the shelf stays the quick, read-only way to the paperwork.
    for (const write of ["writeDocuments", "fetch(", "archive(", "onSubmit"]) {
      expect(source, `the shelf must not ${write}`).not.toContain(write)
    }
    // And it is the owner's: a client is sent to their own dashboard
    // before the archive is read at all.
    const page = code("src/app/dashboard/documenten/page.tsx")
    const beforeRead = page.slice(0, page.indexOf("readDocuments()"))
    expect(beforeRead).toContain('viewer.kind === "client"')
    expect(beforeRead).toContain("redirect")
  })
})

// ── the footer ────────────────────────────────────────────────────────

test.describe("the footer says who we are without reciting it", () => {
  test("the address, phone and e-mail are not in the footer any more", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    // `getByRole("contentinfo")` and not `locator("footer")`: a document
    // sheet carries its own <footer> element, so the tag alone is
    // ambiguous. The page's footer is the landmark one.
    const footer = page.getByRole("contentinfo")
    const text = (await footer.textContent()) ?? ""
    // They live on /colofon, which the footer links to from every page.
    // Art. 3:15d BW asks for "easily, directly and permanently
    // accessible", which a linked page satisfies; it does not ask for
    // the details to be repeated at the foot of every page.
    for (const gone of ["Kelderstraat", "+316", "hello@gronn.studio"]) {
      expect(text, `${gone} should have moved to the colophon`).not.toContain(
        gone
      )
    }
    await expect(footer.locator("a[href$='/colofon']").first()).toHaveCount(1)
  })

  test("the two registration numbers stay, each one its own copy button", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/nl", { waitUntil: "networkidle" })

    const kvk = page.getByRole("button", { name: /KVK-nummer/ })
    const btw = page.getByRole("button", { name: /BTW-nummer/ })
    await expect(kvk).toBeVisible()
    await expect(btw).toBeVisible()

    // A registration number is transcribed, not read — into a
    // bookkeeper's form, off a phone screen — and that is where a digit
    // goes missing. So the value has to actually reach the clipboard.
    await kvk.click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "42072154"
    )
    await btw.click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "NL005473265B04"
    )
    // One chip copies one number: a control that copies more than it
    // shows pastes something the reader did not ask for.
    expect(await btw.textContent()).not.toContain("42072154")
  })

  test("the way in is a button, not another line of prose", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const door = page.locator("footer a[href='/dashboard']")
    await expect(door).toHaveCount(1)

    // In a column of underlined text links it read as more reading. A
    // filled ground is what says "this is a door" without a caption.
    const filled = await door.evaluate((el) => {
      const s = getComputedStyle(el)
      return { bg: s.backgroundColor, radius: parseFloat(s.borderRadius) }
    })
    expect(filled.bg).not.toBe("rgba(0, 0, 0, 0)")
    // A button shape, not a text link's square run. The Brand Guide 2026
    // sets buttons at exactly 8px ("pillen alleen voor compacte
    // bediening"), so 8 is the floor, where it used to be a pill.
    expect(filled.radius).toBeGreaterThanOrEqual(8)
  })
})
