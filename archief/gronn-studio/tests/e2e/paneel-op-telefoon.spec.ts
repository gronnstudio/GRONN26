import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { expect, test, type BrowserContext, type Page } from "@playwright/test"
import { encode } from "next-auth/jwt"

import { clientNav, ownerNav, ownerPhoneNav } from "@/app/dashboard/nav"

// Het paneel op de telefoon — het hele paneel.
//
// 25 september 2026. De eigenaar opende /dashboard op zijn iPhone 13 en
// kreeg "Dit paneel is voor een groot scherm gemaakt." Zijn antwoord: hij
// wil het dashboard op zijn telefoon GEBRUIKEN — overzicht, offertes,
// intakes, … — en niet die melding lezen. Dat draait een eerdere
// beslissing om (het paneel als gereedschap voor een groot scherm, zie
// paneel-op-zak.spec.ts voor wat daarvan over is), dus wat hier gemeten
// wordt is dat de omkering echt is: elk scherm van de eigenaar tekent op
// 390px, zonder de melding, zonder dat de pagina zijwaarts schuift, met
// een strip die de hele set draagt en niet buiten beeld loopt.
//
// Een ECHTE eigenaarssessie, geen werkbank: een NextAuth-JWT ondertekend
// met hetzelfde NEXTAUTH_SECRET als de server, zoals dev-laag.spec.ts.
// CI zet `ci-gate-only-not-a-real-secret`; zonder geheim slaan de
// browsertests over. Er is in CI geen Blob-opslag, dus elk scherm staat
// leeg of meldt dat de opslag niet antwoordde — dat is juist de toestand
// waarin een eigenaar zijn eerste telefoonbezoek doet, en de lege
// toestanden zijn ook schermen die moeten passen.

const WALL = "Dit paneel is voor een groot scherm gemaakt"

/** Every owner surface that wears the shell, and what it is called. */
const OWNER_ROUTES = [
  "/dashboard",
  "/dashboard/agenda",
  "/dashboard/intakes",
  "/dashboard/intakes/new",
  "/dashboard/offertes",
  "/dashboard/documenten",
  "/dashboard/analytics",
  "/dashboard/afvoerputje",
  "/dashboard/kleine-letters",
] as const

async function signInAsOwner(context: BrowserContext, baseURL: string) {
  const secret = process.env.NEXTAUTH_SECRET!
  const email = (process.env.EDITOR_ALLOWED_EMAIL ?? "hello@gronn.studio").toLowerCase()
  const token = await encode({
    token: { email, name: "Nick", sub: "eigenaar" },
    secret,
  })
  await context.addCookies([
    { name: "next-auth.session-token", value: token, url: baseURL },
  ])
}

async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
}

/** Pixels the page itself scrolls sideways. Zero is the only answer. */
const sideways = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  )

/**
 * Controls a thumb cannot hit: under 24px either way (WCAG 2.5.8).
 *
 * `tap-target` draws its 44px as an out-of-flow ::before, so the larger
 * of the two counts. A checkbox or radio inside its <label> is measured
 * by the label: the whole row is the press target, which is the
 * exception 2.5.8 itself makes.
 */
const tooSmall = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("a,button,[role=button],input,select,textarea")]
      .filter((el) => el.offsetParent !== null)
      .filter((el) => {
        const b = el.getBoundingClientRect()
        return b.width > 4 && b.height > 4
      })
      .map((el) => {
        const boxed =
          el instanceof HTMLInputElement &&
          (el.type === "checkbox" || el.type === "radio") &&
          el.closest("label")
            ? el.closest("label")!
            : el
        const b = boxed.getBoundingClientRect()
        const before = getComputedStyle(el, "::before")
        return {
          h: Math.round(Math.max(b.height, parseFloat(before.minHeight) || 0)),
          w: Math.round(Math.max(b.width, parseFloat(before.minWidth) || 0)),
          txt: (el.textContent || el.getAttribute("aria-label") || el.tagName)
            .trim()
            .slice(0, 30),
        }
      })
      .filter((x) => !/Direct naar inhoud|Skip to content/.test(x.txt))
      .filter((x) => x.h < 24 || x.w < 24)
  )

/** Visible fields under 16px — the ones iOS zooms the page in on. */
const zooming = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("input,textarea,select")]
      .filter((el) => el.offsetParent !== null)
      .filter((el) => el.getBoundingClientRect().width > 4)
      .filter((el) => !["checkbox", "radio", "range", "file"].includes((el as HTMLInputElement).type))
      .map((el) => ({
        px: parseFloat(getComputedStyle(el).fontSize),
        what: el.getAttribute("aria-label") || el.id || el.tagName,
      }))
      .filter((f) => !(f.px >= 16))
  )

test.describe("het paneel van de eigenaar, op een telefoon", () => {
  test.skip(({ isMobile }) => !isMobile, "gemeten op de telefoonbreedte")
  test.skip(!process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET ontbreekt in de testomgeving")

  test.beforeEach(async ({ context, page, baseURL }) => {
    await signInAsOwner(context, baseURL!)
    // An iPhone 13 is 390 wide — the phone this was reported on.
    await page.setViewportSize({ width: 390, height: 844 })
  })

  for (const route of OWNER_ROUTES) {
    test(`${route} draws on a 390px phone, and fits it`, async ({ page }) => {
      await open(page, route)

      // Signed in for real: the gate would also lack the wall, and then
      // this test would be measuring the wrong page.
      await expect(page.getByRole("button", { name: "Inloggen met Google" })).toHaveCount(0)

      await expect(page.getByText(WALL)).toHaveCount(0)
      expect(await sideways(page), "the page must not scroll sideways").toBeLessThanOrEqual(0)

      const small = await tooSmall(page)
      expect(small, JSON.stringify(small)).toEqual([])
      const tiny = await zooming(page)
      expect(tiny, JSON.stringify(tiny)).toEqual([])
    })

    test(`the strip on ${route} carries the whole panel and stays on screen`, async ({
      page,
    }) => {
      await open(page, route)
      const strip = page.locator("nav[aria-label='Beheer']:visible")
      await expect(strip).toHaveCount(1)

      // The owner's full set, in the order nav.ts derives it.
      const expected = ownerPhoneNav().flatMap((g) => g.items.map((i) => i.href))
      const hrefs = await strip
        .locator("a")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")))
      expect(hrefs).toEqual(expected)

      // The strip scrolls INSIDE itself; its own box never passes the
      // screen edge, which is what "does not overflow" means for a row
      // of nine pills.
      const box = (await strip.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(390)

      // And the pill for the screen you are on is fully in view: the
      // strip is the only "you are here" a phone has.
      const current = strip.locator("a[aria-current='page']")
      await expect(current).toHaveCount(1)
      const pill = (await current.boundingBox())!
      expect(pill.x).toBeGreaterThanOrEqual(box.x - 1)
      expect(pill.x + pill.width).toBeLessThanOrEqual(box.x + box.width + 1)
      expect(pill.height).toBeGreaterThanOrEqual(44)
    })
  }

  test("every pill in the strip can be reached and hit", async ({ page }) => {
    await open(page, "/dashboard")
    const pills = page.locator("nav[aria-label='Beheer']:visible a")
    const count = await pills.count()
    for (let i = 0; i < count; i++) {
      await pills.nth(i).scrollIntoViewIfNeeded()
      await expect(pills.nth(i)).toBeInViewport()
      const b = (await pills.nth(i).boundingBox())!
      expect(b.height).toBeGreaterThanOrEqual(44)
    }
    // Scrolling the strip never scrolled the page.
    expect(await sideways(page)).toBeLessThanOrEqual(0)
  })

  test("the strip fits a 320px phone too", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const route of ["/dashboard", "/dashboard/offertes", "/dashboard/kleine-letters"]) {
      await open(page, route)
      expect(await sideways(page), route).toBeLessThanOrEqual(0)
      const box = (await page.locator("nav[aria-label='Beheer']:visible").boundingBox())!
      expect(box.x + box.width, route).toBeLessThanOrEqual(320)
      // The top bar holds its own contents at the narrowest width.
      const spills = await page.evaluate(() => {
        const header = document.querySelector("header")!
        const bounds = header.getBoundingClientRect()
        return [...header.querySelectorAll<HTMLElement>("*")]
          .filter((el) => el.offsetParent !== null)
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && (r.right > bounds.right + 1 || r.left < bounds.left - 1)
          })
          .map((el) => el.tagName)
      })
      expect(spills, route).toEqual([])
    }
  })

  test("the builder opens a quote on a phone, and print stays on screen", async ({
    page,
  }) => {
    await open(page, "/dashboard/offertes")
    // No archive in CI, so the builder starts empty; a new quote is the
    // first thing an owner does there anyway. It lives in memory only —
    // the save that follows has no store to reach.
    await page.getByRole("button", { name: "Nieuwe offerte" }).click()
    await expect(page.locator("#nummer")).toBeVisible()
    await page.waitForTimeout(400)

    await expect(page.getByText(WALL)).toHaveCount(0)
    expect(await sideways(page)).toBeLessThanOrEqual(0)

    // The toolbar wraps on a phone instead of scrolling its actions away.
    const print = page.getByRole("button", { name: "Afdrukken naar pdf" })
    await print.scrollIntoViewIfNeeded()
    const p = (await print.boundingBox())!
    expect(p.x).toBeGreaterThanOrEqual(0)
    expect(p.x + p.width).toBeLessThanOrEqual(390)

    // It does not stick under the phone strip either: both sticky at the
    // same offset hid one behind the other.
    const position = await page
      .locator('[class*="panel-toolbar-h"]')
      .evaluate((el) => getComputedStyle(el).position)
    expect(position).not.toBe("sticky")

    // The A4 sheet is scaled to the width, not wider than the screen.
    const sheet = (await page.locator("#vel").boundingBox())!
    expect(sheet.x + sheet.width).toBeLessThanOrEqual(390)

    const small = await tooSmall(page)
    expect(small, JSON.stringify(small)).toEqual([])
    const tiny = await zooming(page)
    expect(tiny, JSON.stringify(tiny)).toEqual([])
  })
})

/* ── in the source ──────────────────────────────────────────────────── */

const ROOT = process.cwd()
const code = (p: string) =>
  readFileSync(join(ROOT, p), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return pages(full)
    return name === "page.tsx" ? [relative(ROOT, full)] : []
  })
}

test.describe("the reversal holds in the source", () => {
  test("every panel page that wears the shell says it works on a phone", () => {
    // The flag stays opt-in as a safety net (dashboard-shell.tsx), so a
    // new surface that forgets it falls on the notice the owner said he
    // does not want to see. This is where that is caught instead.
    //
    // One exception, and it is not a panel page: the toolbar workbench
    // at /dashboard/preview exists only off Vercel and is measured at
    // desktop widths by document-toolbar.spec.ts.
    const EXEMPT = new Set(["src/app/dashboard/preview/page.tsx"])
    const shells = pages(join(ROOT, "src/app/dashboard"))
      .filter((p) => !EXEMPT.has(p))
      .filter((p) => code(p).includes("<DashboardShell"))
    expect(shells.length).toBeGreaterThanOrEqual(OWNER_ROUTES.length)
    for (const p of shells) {
      const src = code(p)
      expect(src, `${p} should pass phoneReady`).toMatch(/\bphoneReady\b/)
      expect(src, `${p} must not switch it off`).not.toMatch(/phoneReady=\{(false|!)/)
    }
  })

  test("the owner's strip is the rail, plus the shelf — derived, not a copy", () => {
    const rail = ownerNav({ intakes: 2, overdue: 1, drain: 3, letters: 4 })
    const strip = ownerPhoneNav({ intakes: 2, overdue: 1, drain: 3, letters: 4 })
    const railItems = rail.flatMap((g) => g.items)
    const stripItems = strip.flatMap((g) => g.items)
    // Everything on the rail, with its badge, and nothing taken away.
    for (const item of railItems) {
      expect(stripItems, item.href).toContainEqual(item)
    }
    expect(stripItems.map((i) => i.href)).toContain("/dashboard/documenten")
    expect(stripItems.length).toBe(railItems.length + 1)
  })

  test("owner and client strips never share an item", () => {
    // The client side is a different tool in the same frame (nav.ts):
    // "Mijn dossier" and "Nieuwe aanvraag" are theirs, the studio's
    // surfaces are not, and the phone change touched only the owner's.
    const owner = new Set(ownerPhoneNav().flatMap((g) => g.items.map((i) => i.label)))
    for (const item of clientNav().flatMap((g) => g.items)) {
      expect(owner.has(item.label), item.label).toBe(false)
    }
    // Where both audiences share one page, each gets its own strip.
    const intake = code("src/app/dashboard/intakes/new/page.tsx")
    expect(intake).toContain("groups={studio ? ownerNav() : clientNav()}")
    expect(intake).toContain("phoneGroups={studio ? ownerPhoneNav() : undefined}")
  })
})
