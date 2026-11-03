import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// Art. 6:234 BW: voorwaarden gaan naar de klant in een vorm die hij kan
// opslaan. Nick, 24 sep 2026: "maak het ook zo dat alles in pdf kan worden
// gedownload". Maar een PDF met open plekken ([[...]]) neemt die gaten mee
// in een overeenkomst — daarom krijgt alleen een compleet document er één.

const ROUTES = ["/nl/voorwaarden", "/nl/herroeping", "/nl/voorwaarden-zakelijk", "/nl/privacy", "/nl/portaal"]

type Bron = Record<string, { bestand: string; updated: string; vingerafdruk: string }>
const bron: Bron = JSON.parse(readFileSync(join(process.cwd(), "src", "lib", "data", "legal", "pdf-bron.json"), "utf8"))

/** Dezelfde functie staat in scripts/juridisch-pdf.mjs; houd ze gelijk. */
const vingerafdruk = (tekst: string) => createHash("sha256").update(tekst).digest("hex").slice(0, 16)

test.describe("juridische documenten als PDF", () => {
  test.skip(({ isMobile }) => isMobile, "één keer is genoeg")

  for (const route of ROUTES) {
    test(`${route}: een PDF alleen zonder open plekken, en dan uit de huidige tekst`, async ({ page }) => {
      await page.goto(route)
      const doc = page.locator("[data-juridisch]")
      const id = (await doc.getAttribute("data-juridisch"))!
      const open = Number(await doc.getAttribute("data-open"))
      const knop = page.locator("[data-juridisch] a[data-pdf]")

      if (open > 0) {
        await expect(knop, `${id} heeft ${open} open plekken en mag geen PDF aanbieden`).toHaveCount(0)
        expect(bron[id], `${id} heeft open plekken maar staat in pdf-bron.json`).toBeUndefined()
        return
      }

      const b = bron[id]
      expect(b, `${id} is compleet maar heeft geen PDF — draai npm run juridisch:pdf`).toBeDefined()
      expect(b.updated).toBe(await doc.getAttribute("data-updated"))
      await expect(knop).toBeVisible()
      await expect(knop).toHaveAttribute("href", `/pdf/juridisch/${b.bestand}`)
      expect(await knop.getAttribute("download")).toMatch(/^GRØNN Studio – .+ \(\d{4}-\d{2}-\d{2}\)\.pdf$/)

      const res = await page.request.get(`/pdf/juridisch/${b.bestand}`)
      expect(res.status()).toBe(200)
      expect(res.headers()["content-type"]).toContain("application/pdf")
      expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-")

      const tekst = await page.locator("[data-juridisch-tekst]").evaluate((el) => el.textContent!.replace(/\s+/g, " ").trim())
      expect(vingerafdruk(tekst), `${id}: de tekst is veranderd sinds de PDF — draai npm run juridisch:pdf`).toBe(b.vingerafdruk)
    })
  }

  test("op papier alleen de tekst: geen kop, voet, knop of printhint", async ({ page }) => {
    await page.goto("/nl/herroeping")
    await page.emulateMedia({ media: "print" })
    await expect(page.locator("footer")).toBeHidden()
    await expect(page.locator("header").first()).toBeHidden()
    await expect(page.locator("[data-juridisch] a[data-pdf]")).toBeHidden()
    await expect(page.locator("[data-juridisch-tekst]")).toBeVisible()
    await expect(page.getByText("printbaar via je browser")).toBeHidden()
  })
})
