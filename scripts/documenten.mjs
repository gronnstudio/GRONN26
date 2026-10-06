// Maakt de PDF's in public/documenten opnieuw uit de drukversies (/drukwerk/…)
// en pakt de bijlagen voor een particuliere klant in één zip.
// Gebruik: npx next build && npx next start -p 3399 & ; node scripts/documenten.mjs
import { execFileSync } from "node:child_process"
import { chromium } from "@playwright/test"

const BASIS = process.env.BASIS ?? "http://localhost:3399"
const MAP = new URL("../public/documenten/", import.meta.url).pathname
const PDF = {
  voorwaarden: "GRONN-algemene-voorwaarden-particulier.pdf",
  herroeping: "GRONN-modelformulier-herroeping.pdf",
  privacy: "GRONN-privacyverklaring.pdf",
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM })
const context = await browser.newContext()
// geen openingsdoek en geen installatiemelding in de PDF
await context.addInitScript(() => {
  sessionStorage.setItem("gronn-intro", "1")
  localStorage.setItem("gronn-app-weg", String(Date.now()))
})
const pagina = await context.newPage()
for (const [slug, naam] of Object.entries(PDF)) {
  await pagina.goto(`${BASIS}/drukwerk/${slug}`, { waitUntil: "networkidle" })
  await pagina.pdf({ path: MAP + naam, format: "A4", printBackground: true, margin: { top: "10mm", bottom: "12mm" } })
  console.log("gemaakt:", naam)
}
await browser.close()
execFileSync("zip", ["-q", "-j", "-FS", MAP + "GRONN-bijlagen-particulier.zip",
  MAP + PDF.voorwaarden, MAP + PDF.herroeping, MAP + "GRONN-fototoestemming.pdf"])
console.log("gemaakt: GRONN-bijlagen-particulier.zip")
