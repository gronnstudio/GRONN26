import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// What a phone can reach, and whether it can hit it.
//
// This file exists because the suite already visited every one of these
// pages on a Pixel 7 and noticed none of what was wrong with them. It
// checked behaviour and never SIZE, so eleven 16px links, a 20px back
// button, a login form that made iOS zoom, and a dashboard that was in
// the menu on a desktop and nowhere at all on a phone all survived it.
//
// So these measure. Class names are not evidence: `tap-target` was
// already on the footer's e-mail link and missing from the identical
// link in the home page's closing call to action, and no amount of
// reading the source would have told you which.

const PHONE_ROUTES = [
  "/nl",
  "/nl/studio",
  "/nl/services",
  "/nl/services/garden-design",
  "/nl/projects",
  "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop",
  "/nl/contact",
  "/nl/contact/intake",
  "/dashboard",
  // The client's own dashboard, through the local-only workbench — see
  // `src/app/dashboard/preview/dossier/page.tsx`. It renders the REAL
  // shell and the REAL overview; only the dossier is invented. Without
  // it this whole file has never once measured the surface a client
  // actually gets, because that surface needs a session CI does not have.
  "/dashboard/preview/dossier",
  "/clients/login",
]

test.describe("a phone can reach the site's own doors", () => {
  test("de deur naar je eigen dossier is twee tikken, niet de voettekst", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)

    // Niet de voettekst. Die heeft hem altijd al gedragen; de klacht
    // was dat je voor je eigen dossier naar de onderkant moest scrollen
    // van welke pagina je ook open had.
    //
    // HIJ IS TWEE KEER VERHUISD. Eerst van onder alle vijf de
    // sectievellen naar één plek in het contactpaneel van het menuwiel.
    // Dat wiel is er nu uit, en daarmee ook dat paneel — de dock
    // navigeert en opent niets. Dus staat hij nu op de contactpagina,
    // en die is één van de vijf vakken in de dock.
    //
    // Wat deze test bewaakt is door alle drie de verhuizingen heen
    // hetzelfde gebleven: op een telefoon is je eigen deur bereikbaar
    // zonder naar de voettekst te scrollen.
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(1000)

    // Tik één: Contact, uit de dock.
    await page.locator("nav[data-nav='dock'] [data-dock-row]").getByRole("link", { name: "Contact", exact: true }).click()
    await page.waitForURL(/\/contact$/)

    // Tik twee: de deur, en hij staat in de pagina en niet in de
    // voettekst.
    const door = page.locator("main a[href='/dashboard']")
    await expect(door).toHaveCount(1)
    await door.scrollIntoViewIfNeeded()
    await expect(door).toBeVisible()

    // And it is a real press target, not a line of text.
    const box = await door.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  // What this used to say and what it proved were two different things.
  //
  // It visited `/dashboard` SIGNED OUT and asserted the large-screen
  // notice was absent — but signed out that address renders `PanelGate`,
  // a standalone page that has never used the panel frame and therefore
  // never carried the notice, before or after the change it was written
  // for. It would have passed on a build where the client's dossier
  // refused a phone completely.
  //
  // The workbench is what makes the real answer testable.
  test("the client's own dashboard draws on a phone, wall and all", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/dossier", { waitUntil: "networkidle" })

    // The refusal was the STUDIO's rule, and a client was always meant
    // through; nobody had checked. Since 25 Sep 2026 it is nobody's rule:
    // the owner reversed it for his own panel too (paneel-op-telefoon).
    await expect(
      page.getByText("Dit paneel is voor een groot scherm gemaakt")
    ).toHaveCount(0)

    // Their own figures are on screen, not a shrunken owner panel.
    await expect(
      page.getByRole("heading", { name: "Familie Voorbeeld" })
    ).toBeVisible()
    await expect(page.getByText("Tuinen in behandeling")).toBeVisible()
  })

  test("and every screen in the client's rail is reachable from it", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/dossier", { waitUntil: "networkidle" })

    // `phoneReady` swaps the desktop rail for a strip of pills. The
    // sidebar itself stays in the tree — it is the same component at
    // `lg` and wider — so this asks specifically for what a phone can
    // SEE, and that every one of those is a real press target.
    const strip = page.locator("nav[aria-label='Beheer']:visible")
    await expect(strip).toHaveCount(1)
    const items = strip.locator("a")
    const count = await items.count()
    expect(count, "the client strip should offer more than one screen").toBeGreaterThan(1)
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).toBeVisible()
      const box = await items.nth(i).boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })

  // The panel's top bar had never been looked at on a phone either. At
  // 412px the search field shrinks, but the ⌘K hint inside it does not —
  // so it pushed out through the field's own rounded border and came to
  // rest underneath the avatar. Measured against the header's own box,
  // because "looks fine" is what the previous test said.
  test("nothing in the panel's top bar overflows its own header", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/dashboard/preview/dossier", { waitUntil: "networkidle" })
    const spills = await page.evaluate(() => {
      const header = document.querySelector("header")
      if (!header) return ["NO HEADER"]
      const bounds = header.getBoundingClientRect()
      return Array.from(header.querySelectorAll<HTMLElement>("*"))
        .filter((el) => el.offsetParent !== null)
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && (r.right > bounds.right + 1 || r.left < bounds.left - 1)
        })
        .map((el) => `${el.tagName}:${el.textContent?.trim().slice(0, 20)}`)
    })
    expect(spills, spills.join(", ")).toEqual([])
  })

  // An environment without a database showed a signed-in client their
  // name and then nothing at all: only `unavailable` was handled, and
  // `unconfigured` fell through every branch. From a client's chair the
  // two are the same event.
  test("a dossier that cannot be read says so instead of showing an empty page", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/dashboard/client-overview.tsx"),
      "utf8"
    )
    // Pinned at the source: reproducing an unconfigured environment in a
    // browser test would mean tearing the database out from under the
    // whole suite.
    expect(source).toContain('dossier.status !== "ok"')
    expect(source).not.toContain('dossier.status === "unavailable" &&')
  })
})

test.describe("what a thumb can hit", () => {
  for (const route of PHONE_ROUTES) {
    test(`every control on ${route} is at least 24px`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile)
      await page.goto(route, { waitUntil: "networkidle" })
      await page.waitForTimeout(1200)

      const small = await page.evaluate(() => {
        return [...document.querySelectorAll("a,button,[role=button],input,select,textarea")]
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .filter((el) => {
            const b = el.getBoundingClientRect()
            // Skips two deliberate 1x1 shapes: the honeypot, which must
            // stay invisible to be worth anything, and the `sr-only`
            // file inputs the tray proxies through a full-width button.
            // Neither is a pointer target, and flagging them would teach
            // the next reader to ignore this list.
            return b.width > 4 && b.height > 4
          })
          .map((el) => {
            const b = el.getBoundingClientRect()
            const before = getComputedStyle(el, "::before")
            return {
              // `tap-target` draws its 44px box as a ::before, out of
              // flow, so the pressable area is the larger of the two.
              h: Math.round(Math.max(b.height, parseFloat(before.minHeight) || 0)),
              w: Math.round(Math.max(b.width, parseFloat(before.minWidth) || 0)),
              txt: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30),
            }
          })
          // The skip link is 16x32 and stays that way: it is painted
          // only while focused, for a keyboard, and has no touch
          // equivalent to be too small for.
          .filter((x) => !/Direct naar inhoud|Skip to content/.test(x.txt))
          .filter((x) => x.h < 24 || x.w < 24)
      })
      expect(small, JSON.stringify(small)).toEqual([])
    })

    test(`no input on ${route} makes iOS zoom in`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile)
      await page.goto(route, { waitUntil: "networkidle" })
      await page.waitForTimeout(1200)
      const tiny = await page.evaluate(() =>
        [...document.querySelectorAll("input,textarea,select")]
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .filter((el) => el.getBoundingClientRect().width > 4)
          .map((el) => ({
            px: parseFloat(getComputedStyle(el).fontSize),
            type: (el as HTMLInputElement).type ?? el.tagName.toLowerCase(),
          }))
          .filter((f) => !(f.px >= 16))
      )
      expect(tiny, JSON.stringify(tiny)).toEqual([])
    })

    test(`${route} does not scroll sideways`, async ({ page, isMobile }) => {
      test.skip(!isMobile)
      await page.goto(route, { waitUntil: "networkidle" })
      await page.waitForTimeout(1200)
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(over).toBeLessThanOrEqual(0)
    })
  }
})

/* ── the one screen that refuses must not also mislead ─────────────── */

// The large-screen notice told people to "open gronn.studio/clients on a
// laptop". That address has never existed — `src/app/clients/` holds
// `login`, `registreren` and friends but no page of its own — so the
// screen that already cannot help you also sent you to a 404.
//
// Two halves, because fixing only the copy would let the same class of
// mistake back in: the premise is measured, and the copy is pinned.
//
// Since 25 Sep 2026 no panel page draws the notice (the owner wants the
// whole dashboard on his phone; paneel-op-telefoon.spec.ts). It stays as
// the safety net for an unmeasured new surface, so its copy still has to
// be true.
test.describe("the large-screen notice points somewhere real", () => {
  test("the address it names is not a 404", async ({ page }) => {
    const res = await page.goto("/dashboard", { waitUntil: "domcontentloaded" })
    expect(res?.status()).toBeLessThan(400)
  })

  test("and /clients on its own still is one, which is why", async ({
    page,
  }) => {
    // Not a wish for it to exist — a record of why the copy changed. If
    // somebody later adds `src/app/clients/page.tsx`, this test fails and
    // the comment above tells them the notice may point there again.
    const res = await page.goto("/clients", { waitUntil: "domcontentloaded" })
    expect(res?.status()).toBe(404)
  })

  test("the notice no longer names it", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/dashboard/dashboard-shell.tsx"),
      "utf8"
    )
    // The comment in that file explains the change and legitimately
    // quotes the old string, so the assertion is on the rendered copy:
    // the span the visitor reads.
    const rendered = source.slice(source.indexOf('<span className="font-mono text-[13px]">'))
    expect(rendered.slice(0, 120)).not.toContain("gronn.studio/clients")
    expect(rendered.slice(0, 120)).toContain("gronn.studio/dashboard")
  })
})

/* De oude /stack en zijn "wat we niet bouwden"-sectie zijn met V5 (sep
   2026) weg; die tests gingen mee. De nieuwe /stack (24 sep 2026) meet
   zijn eigen breedte op 320 en 375 in stack.spec.ts. */
