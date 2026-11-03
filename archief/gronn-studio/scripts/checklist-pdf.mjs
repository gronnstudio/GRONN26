// De checklist vooraf als echt PDF-bestand (public/pdf/).
//
// Nick, 24 sep 2026: één knop om te printen en één om de PDF direct te
// downloaden, "want op mobiel gaat dat vaak niet goed" — het printvenster
// van een telefoon heeft vaak geen "Opslaan als PDF". Daarom een vast
// bestand, gemaakt uit precies de pagina die de site toont en met
// dezelfde printopmaak (globals.css, "De checklist op papier").
//
// Gebruik (met een draaiende build, bv. `npm run build && npm start`):
//   node scripts/checklist-pdf.mjs [http://localhost:3000]
//
// Naast de PDF's schrijft het checklist-bron.json: een vingerafdruk van de
// tekst (koppen en punten) waaruit ze gemaakt zijn. nieuwsbrief.spec.ts
// berekent dezelfde vingerafdruk op de live pagina; wijkt die af, dan is de
// checklist veranderd en moet dit script opnieuw draaien.

import { createHash } from "node:crypto"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { chromium } from "@playwright/test"

const basis = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")
const uit = join(process.cwd(), "public", "pdf")
mkdirSync(uit, { recursive: true })

const TALEN = [
  { taal: "nl", pad: "/nl/checklist", bestand: "checklist-vooraf.pdf" },
  { taal: "en", pad: "/checklist", bestand: "checklist-before-you-start.pdf" },
]

/** Dezelfde functie staat in nieuwsbrief.spec.ts; houd ze gelijk. */
export function vingerafdruk(tekst) {
  return createHash("sha256").update(tekst).digest("hex").slice(0, 16)
}

const pad = "/opt/pw-browsers/chromium"
const browser = await chromium.launch(existsSync(pad) ? { executablePath: pad } : {})
const bron = {}
for (const { taal, pad: url, bestand } of TALEN) {
  const context = await browser.newContext({ locale: taal === "nl" ? "nl-NL" : "en-GB" })
  await context.addInitScript(() => {
    try {
      localStorage.setItem("theme", "goldenhour")
      localStorage.setItem("gronn-theme-mode", "manual")
      sessionStorage.setItem("gronn-intro", "1")
    } catch {}
  })
  const page = await context.newPage()
  const res = await page.goto(basis + url, { waitUntil: "networkidle" })
  if (!res || res.status() !== 200) throw new Error(`${url}: status ${res?.status()}`)
  const tekst = await page.evaluate(() =>
    [...document.querySelectorAll("main h1, main h2, [data-punt]")].map((e) => e.textContent?.replace(/\s+/g, " ").trim()).join("\n")
  )
  bron[taal] = vingerafdruk(tekst)
  await page.emulateMedia({ media: "print" })
  await page.pdf({
    path: join(uit, bestand),
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
  })
  await context.close()
  console.log(`${bestand}: ${bron[taal]}`)
}
await browser.close()
writeFileSync(join(uit, "checklist-bron.json"), JSON.stringify(bron, null, 2) + "\n")
