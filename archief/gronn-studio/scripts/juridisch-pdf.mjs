// De juridische documenten als echte PDF-bestanden (public/pdf/juridisch/).
//
// Art. 6:234 BW: voorwaarden gaan naar de klant in een vorm die hij kan
// opslaan. Dit script maakt die PDF uit precies de pagina die de site toont,
// met de printopmaak uit globals.css ("Juridische documenten op papier").
//
// ALLEEN documenten zonder open plekken ([[...]]) krijgen een PDF: een PDF
// met gaten erin neemt die gaten mee in een overeenkomst. De pagina zegt
// zelf hoeveel gaten hij heeft (data-open), dus hier staat geen tweede lijst.
//
// Gebruik (met een draaiende build, bv. `npm run build && npm start`):
//   node scripts/juridisch-pdf.mjs [http://localhost:3000]
//
// Schrijft src/lib/data/legal/pdf-bron.json: per document het bestand, de
// datum en een vingerafdruk van de tekst. juridisch-pdf.spec.ts rekent die
// na op de live pagina; wijkt hij af, dan moet dit script opnieuw draaien.

import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { chromium } from "@playwright/test"

const basis = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")
const uit = join(process.cwd(), "public", "pdf", "juridisch")
mkdirSync(uit, { recursive: true })

// De routes van de juridische documenten. De tekst is Nederlands en bindend
// (legal-document.tsx), dus alleen de Nederlandse pagina.
const ROUTES = ["/nl/voorwaarden", "/nl/herroeping", "/nl/voorwaarden-zakelijk", "/nl/privacy", "/nl/portaal"]

/** Dezelfde functie staat in juridisch-pdf.spec.ts; houd ze gelijk. */
export function vingerafdruk(tekst) {
  return createHash("sha256").update(tekst).digest("hex").slice(0, 16)
}

const pad = "/opt/pw-browsers/chromium"
const browser = await chromium.launch(existsSync(pad) ? { executablePath: pad } : {})
const bron = {}
for (const route of ROUTES) {
  const context = await browser.newContext({ locale: "nl-NL" })
  await context.addInitScript(() => {
    try {
      localStorage.setItem("theme", "goldenhour")
      localStorage.setItem("gronn-theme-mode", "manual")
      sessionStorage.setItem("gronn-intro", "1")
    } catch {}
  })
  const page = await context.newPage()
  const res = await page.goto(basis + route, { waitUntil: "networkidle" })
  if (!res || res.status() !== 200) throw new Error(`${route}: status ${res?.status()}`)
  const doc = page.locator("[data-juridisch]")
  const [id, updated, open] = await Promise.all(["data-juridisch", "data-updated", "data-open"].map((a) => doc.getAttribute(a)))
  if (Number(open) > 0) {
    console.log(`${id}: ${open} open plekken, geen PDF`)
    await context.close()
    continue
  }
  const tekst = await page.locator("[data-juridisch-tekst]").evaluate((el) => el.textContent.replace(/\s+/g, " ").trim())
  const bestand = `${id}-${updated}.pdf`
  await page.emulateMedia({ media: "print" })
  await page.pdf({
    path: join(uit, bestand),
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
  })
  bron[id] = { bestand, updated, vingerafdruk: vingerafdruk(tekst) }
  console.log(`${bestand}: ${bron[id].vingerafdruk}`)
  await context.close()
}
await browser.close()

// Oude versies weg: de bestandsnaam draagt de datum, een oude datum is een
// oude tekst.
const houden = new Set(Object.values(bron).map((b) => b.bestand))
for (const f of readdirSync(uit)) if (f.endsWith(".pdf") && !houden.has(f)) rmSync(join(uit, f))

writeFileSync(join(process.cwd(), "src", "lib", "data", "legal", "pdf-bron.json"), JSON.stringify(bron, null, 2) + "\n")
