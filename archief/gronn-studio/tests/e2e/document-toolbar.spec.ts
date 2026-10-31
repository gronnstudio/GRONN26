import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { fileName, safePart } from "@/lib/download"
import { documentBaseName } from "@/lib/documents"
import { legalToText, VOORWAARDEN_CONSUMENT } from "@/lib/data/legal"

// The document toolbar.
//
// It is driven here through /dashboard/preview — a local-only workbench
// that renders the bar with invented documents and reaches no session,
// archive or database. The real page is behind Google sign-in, which CI
// does not have, so without this the most-looked-at screen in the panel
// would be the one nothing ever looks at. `TIMEVAULT/PROBLEMS.md` opens
// with exactly that failure: "building is not looking".

const ROOT = process.cwd()
const code = (p: string) =>
  readFileSync(join(ROOT, p), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")

test.describe("the toolbar holds its line", () => {
  test.skip(({ isMobile }) => isMobile)

  for (const width of [1280, 1440, 1920]) {
    test(`every control shares one height and baseline at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto("/dashboard/preview")

      const boxes = await page.evaluate(() => {
        const bar = document.querySelector('[class*="panel-toolbar-h"]')
        if (!bar) return null
        const controls = [
          ...bar.querySelectorAll('button, select, [role="group"]'),
        ].filter(
          (el) =>
            el.getAttribute("role") === "group" || !el.closest('[role="group"]')
        )
        return controls.map((el) => {
          const r = el.getBoundingClientRect()
          return { h: Math.round(r.height), top: Math.round(r.top) }
        })
      })

      expect(boxes, "the toolbar should be on screen").not.toBeNull()
      expect(boxes!.length).toBeGreaterThanOrEqual(6)

      // Four different heights used to sit in this bar — a 40px segmented
      // control, a 32px kind pill, buttons and a picker at 32-34px — so
      // nothing shared a baseline. 36px is `h-9`, the panel's one
      // already-measured control height (panel-search.tsx).
      const heights = [...new Set(boxes!.map((b) => b.h))]
      expect(heights, `control heights: ${heights.join(", ")}`).toEqual([36])

      // Two rows, and every control sits on one of them.
      const tops = [...new Set(boxes!.map((b) => b.top))].sort((a, b) => a - b)
      expect(tops.length, `distinct rows: ${tops.join(", ")}`).toBe(2)
    })
  }

  test("the bar never wraps or scrolls the page sideways", async ({ page }) => {
    // `flex-wrap` used to let the bar become a third row in the
    // 1024-1200px band while the editor column beside it stayed pinned to
    // a single hardcoded height and misaligned against it.
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto("/dashboard/preview")
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    )
    expect(overflow, "the page itself must not scroll sideways").toBe(false)
  })

  test("a long status message does not push the actions off their edge", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 })
    await page.goto("/dashboard/preview")

    const right = async () =>
      Math.round(
        (await page
          .getByRole("button", { name: "Afdrukken naar pdf" })
          .boundingBox())!.x +
          (await page
            .getByRole("button", { name: "Afdrukken naar pdf" })
            .boundingBox())!.width
      )

    const quiet = await right()
    // The longest of the thirteen texts this one line can carry.
    await page.getByRole("button", { name: "conflict", exact: true }).click()
    await expect(
      page.getByText("Een ander tabblad was je voor")
    ).toBeVisible()
    expect(await right()).toBe(quiet)
  })

  test("the primary action is the only filled one, and it is green", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 })
    await page.goto("/dashboard/preview")
    const bg = await page
      .getByRole("button", { name: "Afdrukken naar pdf" })
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    // --gronn-green, bosgroen #23483a since the Brand Guide 2026 (was
    // #197b4f). One of only two fills that carry white text at AA;
    // scripts/check-contrast.mjs asserts both.
    expect(bg).toBe("rgb(35, 72, 58)")
  })
})

test.describe("an issued invoice number never changes kind", () => {
  test("the toggle routes a stored document through toInvoice, not switchKind", () => {
    const source = code("src/app/dashboard/document-builder.tsx")
    const fn = source.slice(source.indexOf("const chooseKind"))
    const body = fn.slice(0, fn.indexOf("\n  const "))

    // A draft may switch outright; a stored document may not. This is the
    // defect the round began with: switchKind rewrote the kind of whatever
    // was open and kept its number, so an invoice sent as 2026-0002 could
    // become a quote carrying an invoice number.
    expect(body).toContain("if (!stored)")
    expect(body).toContain("convertToInvoice")
    // And nothing converts an issued invoice back.
    expect(body).toContain("blijft staan")
  })

  test("the workbench cannot exist on Vercel", () => {
    const source = code("src/app/dashboard/preview/page.tsx")
    // VERCEL is set on every Vercel build and runtime, production and
    // preview alike, and cannot be unset from project settings. This page
    // renders documents that are invented rather than read, but a panel
    // shell on a public URL is still not something to ship by accident.
    expect(source).toContain("process.env.VERCEL")
    expect(source).toContain("notFound()")
  })
})

test.describe("the printed sheet, on the bench", () => {
  test.skip(({ isMobile }) => isMobile)

  test("two money columns keep a gutter between them", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/dashboard/preview/vel")
    await page.locator("#document-sheet").waitFor()

    // The defect this pins: the amount cells carried no horizontal
    // padding, so on a two-variant quote the right-aligned headings ran
    // together and "Basisaanleg" + "Met cortenstaal" printed as one
    // word. Measured rather than asserted from the source — a source
    // check would pass on a gutter of a tenth of a millimetre.
    const gap = await page.evaluate(() => {
      const heads = [...document.querySelectorAll("#document-sheet thead th")]
      if (heads.length < 3) return null
      // The cells themselves abut by design; what must not touch is the
      // ink. A range over each heading's text gives where the letters
      // actually start and stop, which is what a reader sees.
      const ink = (el: Element) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return range.getBoundingClientRect()
      }
      return ink(heads[heads.length - 1]).left - ink(heads[heads.length - 2]).right
    })

    expect(gap).not.toBeNull()
    // 6mm at 96dpi is ~22.7px; anything under a comfortable word space
    // is the collision coming back.
    expect(gap!).toBeGreaterThan(12)
  })

  test("printing puts the page on paper, not on the night sky", async ({
    page,
  }) => {
    await page.goto("/dashboard/preview/vel")
    await page.locator("#document-sheet").waitFor()
    await page.emulateMedia({ media: "print" })

    // `.doc-stage` was forced white long ago, but the page it floats in
    // was not. With "background graphics" on in the print dialog, the
    // theme's ground printed into every gap the sheet did not fill — a
    // slab of Blue Hour under the last page of a quote, which is exactly
    // where the signature block sits.
    const grounds = await page.evaluate(() => [
      getComputedStyle(document.documentElement).backgroundColor,
      getComputedStyle(document.body).backgroundColor,
    ])
    for (const ground of grounds) expect(ground).toBe("rgb(255, 255, 255)")
  })

  test("the sheet workbench cannot exist on Vercel either", () => {
    const source = code("src/app/dashboard/preview/vel/page.tsx")
    expect(source).toContain("process.env.VERCEL")
    expect(source).toContain("notFound()")
  })

  test("the workbench never reaches the real account number", () => {
    const source = code("src/app/dashboard/preview/vel/sheet-preview.tsx")
    // The sheet takes the IBAN as a prop precisely so it cannot import
    // it. A workbench that imported business-private would put the
    // studio's account number into a client chunk — the exact leak that
    // split the module in two.
    expect(source).not.toContain("business-private")
    expect(source).not.toContain("studioIban")
  })
})

test.describe("een bestandsnaam die de reis overleeft", () => {
  // De aanleiding: de nummering volgt sinds september de reeks van de
  // boekhouding, en die draagt een schuine streep — `GR-F // 2026-0908-0010`.
  // Een `/` mag op geen enkel besturingssysteem in een bestandsnaam, dus de
  // download `gronn-factuur-GR-F // 2026-0908-0010.json` kwam er verminkt
  // uit of helemaal niet.

  test("no separator from a document number survives into the name", () => {
    expect(safePart("GR-F // 2026-0908-0010")).toBe("GR-F_2026-0908-0010")
    expect(safePart("Klant & Partner")).toBe("Klant_Partner")
    // De Ø is één teken en valt niet onder de accentontleding, dus die
    // krijgt zijn eigen regel. Zonder die regel werd GRØNN "GR_NN".
    expect(safePart("GRØNN Studio")).toBe("GRONN_Studio")

    const name = fileName(["GR", "F", "Klant & Partner", "2026-0908-0010"], "json")
    expect(name).toBe("GR_F_Klant_Partner_2026-0908-0010.json")
    for (const forbidden of ["/", "\\", ":", "*", "?", '"', "<", ">", "|"]) {
      expect(name.includes(forbidden), `bevat ${forbidden}`).toBe(false)
    }
  })

  test("the name says what the sheet is, and stays unique per document", () => {
    const base = {
      client: "Klant & Partner\nVoorbeeldstraat 1\n1000 AA Voorbeeldstad",
      number: "GR-F // 2026-0908-0010",
      kind: "factuur" as const,
    }
    // Alleen de eerste regel van het klantveld: de rest is een adres, en
    // dat hoort niet in een bestandsnaam die per mail rondgaat.
    const invoice = fileName(
      documentBaseName(base as never),
      "json"
    )
    expect(invoice).toBe("GR_F_Klant_Partner_2026-0908-0010.json")
    expect(invoice.includes("Voorbeeldstraat")).toBe(false)

    // Een bijlage draagt hetzelfde nummer als de factuur waar hij bij
    // hoort; zonder eigen woord zou de download de factuur overschrijven.
    const annex = fileName(
      documentBaseName({ ...base, annex: true } as never),
      "json"
    )
    expect(annex).toBe("GR_F_Klant_Partner_Specificatie_2026-0908-0010.json")
    expect(annex).not.toBe(invoice)
  })

  test("a legal document becomes plain text with its status on it", () => {
    const text = legalToText(VOORWAARDEN_CONSUMENT)

    expect(text).toContain(VOORWAARDEN_CONSUMENT.title.toUpperCase())
    // Een pdf of txt reist verder dan de pagina waar hij vandaan kwam. Wie
    // hem over een half jaar in een mailbijlage terugvindt moet nog steeds
    // kunnen zien dat een jurist er niet naar heeft gekeken.
    expect(text).toContain("CONCEPT")
    // Open plekken blijven staan: ze wegpoetsen levert een document op dat
    // af lijkt terwijl het dat niet is.
    expect(text).toMatch(/\[\[[^\]]+\]\]/)
    expect(text.endsWith("\n")).toBe(true)
  })
})
