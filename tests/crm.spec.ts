import { expect, test, type Page } from "./fixtures"
import { KOEKJE, maakKoekje } from "../src/lib/eigenaar"

// Het CRM van begin tot calculatie, tegen de echte build: een aanvraag komt
// binnen, wordt een klant, krijgt een tuin met opname en foto, en een
// calculatie met twee versies. Plus de deur: zonder inlog kom je nergens.
// De server draait met CRM_LOKAAL=1 (playwright.config.ts), dus alles staat in
// .crm-data/ en niet in Blob.

process.env.AUTH_SECRET = "alleen-voor-tests"

/** Een tab boven de vragen van de intake (categorie, Zones, Open punten). */
const tab = (page: Page, naam: RegExp) => page.getByRole("navigation", { name: "Categorieën" }).getByRole("button", { name: naam })

async function log(page: Page) {
  await page.context().addCookies([{ name: KOEKJE, value: await maakKoekje("hello@gronn.studio"), url: "http://localhost:3210" }])
}

test("zonder inlog: dashboard dicht, API's weigeren", async ({ request }) => {
  const r = await request.get("/dashboard/klanten", { maxRedirects: 0 })
  expect(r.status()).toBe(307)
  expect(r.headers().location).toContain("/api/inloggen")
  expect((await request.post("/api/assistent", { data: { vraag: "Wie zijn mijn klanten?" } })).status()).toBe(401)
  expect((await request.get("/api/crm/foto?id=00000000-0000-0000-0000-000000000000")).status()).toBe(401)
  expect((await request.post("/api/crm/foto", { multipart: { klant: "a", tuin: "b" } })).status()).toBe(401)
  expect((await request.get("/dashboard/catalogus/export", { maxRedirects: 0 })).status()).not.toBe(200)
})

test("van aanvraag tot calculatie", async ({ page, request }) => {
  test.setTimeout(90_000)
  const naam = `Test Klant ${Date.now()}`
  const telefoon = `06 ${String(Date.now()).slice(-8)}`

  // 1. Aanvraag via het formulier, twee keer verstuurd: telt één keer.
  for (let i = 0; i < 2; i++) {
    const r = await request.post("/api/aanvraag", { data: { naam, contact: telefoon, wat: "Nieuwe oprit in klinkers, 55 m²" } })
    expect(r.ok()).toBeTruthy()
  }
  await log(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/dashboard/aanvragen")
  const kaart = page.locator("li", { hasText: naam })
  await expect(kaart).toHaveCount(1)

  // 2. Aanvraag wordt klant.
  await kaart.getByRole("button", { name: "Maak klant →" }).click()
  await expect(page.locator("h1")).toHaveText(naam)
  await expect(page.locator('input[name="telefoon"]')).toHaveValue(telefoon)
  await expect(page.locator('input[name="opvolgen"]')).not.toHaveValue("")
  const klantUrl = page.url()

  // Nog een keer omzetten (dezelfde persoon belt opnieuw): geen tweede kaart.
  const opnieuw = await request.post("/api/aanvraag", { data: { naam, contact: telefoon, wat: "Nog een vraag" } })
  expect(opnieuw.ok()).toBeTruthy()
  await page.goto("/dashboard/aanvragen")
  await page.locator("li", { hasText: "Nog een vraag" }).getByRole("button", { name: "Maak klant →" }).click()
  await expect(page).toHaveURL(klantUrl.split("?")[0])

  // 3. Fase en lead bewaren; de tijdlijn houdt het bij.
  await page.locator('select[name="fase"]').selectOption("Opname")
  await page.locator('input[name="kans"]').fill("60")
  await page.getByRole("button", { name: "Bewaren", exact: true }).click()
  await page.getByRole("link", { name: /Tijdlijn/ }).click()
  await expect(page.getByText("Aanvraag → Opname")).toBeVisible()
  await expect(page.getByText(/Nog een vraag/)).toBeVisible()

  // 4. Tuin met opname en een foto.
  await page.getByRole("link", { name: /^Tuinen/ }).click()
  await page.locator('input[name="naam"]').fill("Oprit")
  await page.getByRole("button", { name: "+ Tuin en opname" }).click()
  await expect(page.locator('input[name="naam"]')).toHaveValue("Oprit")
  // De intake bewaart zichzelf: werkzaamheden, maten, ja/nee, aandachtspunt, notitie.
  const bewaard = page.getByRole("status").filter({ hasText: /Bewaard ✓|Bewaren…|Nog niet bewaard/ })
  await expect(tab(page, /E · Bestrating/)).toHaveCount(0)
  await page.getByRole("button", { name: "Bestrating", exact: true }).click()
  await expect(tab(page, /E · Bestrating/)).toBeVisible()
  await tab(page, /C · Bestaande situatie/).click()
  await page.getByLabel(/^Oppervlak totaal/).fill("55")
  await page.getByLabel(/^Grondsoort/).selectOption("Onbekend")
  const grond = page.locator("#v-grond")
  await grond.getByRole("button", { name: "Markeer als aandachtspunt" }).click()
  await grond.getByRole("button", { name: "+ Notitie" }).click()
  await grond.getByLabel("Notitie bij Grondsoort").fill("Proefgat maken bij de schuur")
  await tab(page, /B · Bereikbaarheid/).click()
  await page.getByLabel(/^Toegang/).selectOption("Minigraver past (≥ 1 m)")
  await page.getByRole("group", { name: /minigraver naar de werkplek/ }).getByRole("button", { name: "Ja" }).click()
  await expect(bewaard).toHaveText("Bewaard ✓")

  // Zonder bereik blijft het in de browser staan en gaat het mee zodra er weer verbinding is.
  await tab(page, /C · Bestaande situatie/).click()
  await page.context().setOffline(true)
  await page.getByLabel(/^Oppervlak totaal/).fill("56")
  await expect(bewaard).toContainText("Nog niet bewaard")
  await page.context().setOffline(false)
  await expect(bewaard).toHaveText("Bewaard ✓", { timeout: 20_000 })

  await page.reload()
  await tab(page, /C · Bestaande situatie/).click()
  await expect(page.getByLabel(/^Oppervlak totaal/)).toHaveValue("56")
  await expect(page.locator("#v-grond").getByRole("button", { name: "! Aandachtspunt" })).toBeVisible()
  await expect(page.locator("#v-grond").getByLabel("Notitie bij Grondsoort")).toHaveValue("Proefgat maken bij de schuur")
  await expect(page.getByRole("button", { name: "Bestrating", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByText("56 m²").first()).toBeVisible()

  // Open punten: het aandachtspunt bovenaan. Vervolginspectie toont alleen wat open is.
  await tab(page, /^Open punten/).click()
  await expect(page.locator("#open-kop ~ ul button").first()).toContainText("Grondsoort")
  await page.getByRole("button", { name: "Vervolg", exact: true }).click()
  await tab(page, /C · Bestaande situatie/).click()
  await expect(page.locator("#v-grond")).toBeVisible()
  await expect(page.locator("#v-oppervlak")).toHaveCount(0)
  await page.getByRole("button", { name: "Snel", exact: true }).click()
  await expect(page.locator("#v-grond")).toHaveCount(0)
  await page.getByRole("button", { name: "Uitgebreid", exact: true }).click()

  // Een zone met maten: 7 × 10 = 70 m².
  await tab(page, /^Zones/).click()
  await page.getByRole("button", { name: "+ Zone toevoegen" }).click()
  await page.getByLabel("Lengte").fill("7")
  await page.getByLabel("Breedte").fill("10")
  await expect(page.getByText("70 m² (lengte × breedte)")).toBeVisible()
  await expect(bewaard).toHaveText("Bewaard ✓")

  const jpg = await page.evaluate(async () => {
    const c = document.createElement("canvas")
    c.width = 40
    c.height = 30
    c.getContext("2d")!.fillRect(0, 0, 40, 30)
    const b = await new Promise<Blob>((ok) => c.toBlob((x) => ok(x!), "image/jpeg"))
    return Array.from(new Uint8Array(await b.arrayBuffer()))
  })
  await page.locator('input[type="file"]').setInputFiles({ name: "voor.jpg", mimeType: "image/jpeg", buffer: Buffer.from(jpg) })
  const foto = page.locator('img[src^="/api/crm/foto?id="]')
  await expect(foto).toHaveCount(1, { timeout: 15_000 })
  const src = (await foto.getAttribute("src"))!
  expect((await page.request.get(src)).status()).toBe(200)
  // een ander (zonder inlog) krijgt de foto niet
  expect((await request.get(src)).status()).toBe(401)

  // 5. Calculatie met de maten uit de opname: rekenhulp 56 m² + 7 % = 59,92 m².
  await page.getByRole("link", { name: "Calculatie met deze maten →" }).click()
  await expect(page.getByRole("heading", { name: "Nieuwe calculatie" })).toBeVisible()
  await page.getByLabel("Oppervlak m²").fill("56")
  await expect(page.getByText("= 59,92 m²")).toBeVisible()
  await page.getByRole("button", { name: "+ Als regel" }).click()
  const regel = page.locator("tbody tr").last()
  await expect(regel.getByLabel("Aantal")).toHaveValue("59,92")
  await regel.getByLabel("Inkoop per eenheid").fill("25")
  await page.getByPlaceholder("bijv. 24").fill("40")
  // 59,92 × € 28,75 = € 1.722,70 verkoop; arbeid 40 × € 50 = € 2.000
  await expect(regel.getByText("€ 1.722,70")).toBeVisible()
  await expect(page.locator("aside").getByText("€ 3.722,70", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Bewaar bij klant" }).click()
  await expect(page).toHaveURL(/\/calculatie\/[0-9a-f-]{36}$/)
  await expect(page.getByRole("link", { name: "1", exact: true })).toBeVisible()
  await page.getByPlaceholder("bijv. 24").fill("44")
  await page.getByRole("button", { name: "Bewaar als versie 2" }).click()
  await expect(page.getByRole("status")).toHaveText("Versie 2 bewaard.")

  // 6. ★ zet de prijs in de catalogus.
  await page.locator("tbody tr").last().getByRole("button", { name: "Prijs onthouden in de catalogus" }).click()
  await expect(page.getByRole("status")).toContainText("staat in de catalogus")

  // 7. De klant staat in de tabel met de calculatie als waarde.
  await page.goto(`/dashboard/klanten?weergave=tabel&q=${encodeURIComponent(naam)}`)
  const rij = page.locator("tbody tr", { hasText: naam })
  await expect(rij).toHaveCount(1)
  await expect(rij).toContainText("Opname")

  // 8. Offerte met privélink uit versie 2; de klant geeft akkoord zonder inlog.
  await rij.getByRole("link", { name: naam }).click()
  await page.getByRole("link", { name: /^Calculaties/ }).click()
  await page.getByRole("link", { name: /Oprit/ }).first().click()
  await page.getByRole("button", { name: "Offerte met link maken (v2)" }).click()
  await expect(page).toHaveURL(/tab=stukken/)
  const href = (await page.getByRole("link", { name: "Bekijk als klant ↗" }).getAttribute("href"))!
  expect(href).toMatch(/^\/offerte\/[A-Za-z0-9_-]{32}$/)
  const klant = await page.context().browser()!.newContext({ baseURL: "http://localhost:3210" })
  const kp = await klant.newPage()
  await kp.goto(href)
  await expect(kp.getByRole("heading", { level: 1 })).toContainText("Oprit")
  await expect(kp.getByText("€ 1.722,70")).toBeVisible()
  await expect(kp.getByText("Totaal incl. btw")).toBeVisible()
  // inkoop (€ 25,00 per m²), opslag en uren staan er niet op
  await expect(kp.locator("article")).not.toContainText("€ 25,00")
  await expect(kp.locator("article")).not.toContainText(/opslag|inkoop|44 uur/i)
  await kp.getByLabel("Je naam").fill("Test Klant")
  await kp.getByLabel(/Ik ga akkoord/).check()
  await kp.getByRole("button", { name: "Akkoord geven" }).click()
  await expect(kp.getByRole("heading", { name: "Akkoord, dank je wel" })).toBeVisible()
  await klant.close()
  await page.reload()
  await expect(page.getByRole("button", { name: "Akkoord ✓" })).toBeVisible()
  // een verzonnen sleutel geeft niets
  expect((await request.get("/offerte/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).status()).toBe(404)
})

test("vragenlijst: een nieuwe vraag verschijnt in de intake, vervallen haalt hem weg", async ({ page }) => {
  await log(page)
  const vraag = `Ladder mee ${Date.now()}?`
  await page.goto("/dashboard/vragenlijst")
  await page.locator("summary").filter({ hasText: "Meenemen" }).click()
  const meenemen = page.locator("details").filter({ hasText: "Meenemen" })
  await meenemen.getByLabel("Nieuwe vraag").fill(vraag)
  await meenemen.getByRole("button", { name: "Meenemen bewaren" }).click()
  await expect(page.locator("summary").filter({ hasText: "Meenemen" })).toContainText("5 vragen")
  await expect(page.getByLabel(`Vraag: ${vraag}`)).toBeVisible()

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/dashboard/klanten")
  await page.getByLabel("Naam", { exact: true }).fill(`Vragenlijst ${Date.now()}`)
  await page.getByRole("button", { name: "+ Klant" }).click()
  await page.getByRole("link", { name: /^Tuinen/ }).click()
  await page.locator('input[name="naam"]').fill("Voortuin")
  await page.getByRole("button", { name: "+ Tuin en opname" }).click()
  await tab(page, /^Meenemen/).click()
  await expect(page.getByRole("group", { name: vraag })).toBeVisible()
  await page.getByRole("group", { name: vraag }).getByRole("button", { name: "Ja" }).click()
  await expect(page.getByRole("status").filter({ hasText: "Bewaard ✓" })).toBeVisible()
  const tuin = page.url()

  await page.goto("/dashboard/vragenlijst")
  await page.locator("summary").filter({ hasText: "Meenemen" }).click()
  const rij = page.locator("details").filter({ hasText: "Meenemen" }).locator("div.border-t").filter({ has: page.getByLabel(`Vraag: ${vraag}`) })
  await rij.getByLabel("Vervallen").check()
  await page.getByRole("button", { name: "Meenemen bewaren" }).click()
  await expect(page.getByText(/vragen in \d+ categorieën · versie/)).toBeVisible()
  await page.goto(tuin)
  await tab(page, /^Meenemen/).click()
  await expect(page.getByRole("group", { name: vraag })).toHaveCount(0)
  // Het antwoord op de vervallen vraag blijft terug te lezen.
  await expect(page.locator("section").filter({ hasText: "Niet in de huidige vragen" })).toContainText(`${vraag}: Ja`)

  // Op de telefoon: niets loopt buiten beeld, knoppen zijn groot genoeg om te tikken.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(tuin)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  const ja = page.locator("#v-meetwiel-of-rolmaat-30-m-duimstok-waterp").getByRole("button", { name: "Ja" })
  expect((await ja.boundingBox())!.height).toBeGreaterThanOrEqual(44)

  // Een traag verzoek: wat onderweg is blijft in de lokale buffer tot de server het bevestigt.
  await page.route("**/dashboard/klanten/**", async (r) => {
    if (r.request().method() === "POST") await new Promise((z) => setTimeout(z, 4000))
    await r.continue()
  })
  await ja.click()
  await page.waitForTimeout(1200)
  await page.locator("#v-telefoon-met-volle-batterij-voor-foto-s").getByRole("button", { name: "Ja" }).click()
  const buffer = await page.evaluate(() => Object.entries(localStorage).find(([k]) => k.startsWith("gronn-intake-"))?.[1] ?? "")
  expect(buffer).toContain("meetwiel-of-rolmaat-30-m-duimstok-waterp")
  expect(buffer).toContain("telefoon-met-volle-batterij-voor-foto-s")
  await expect(page.getByRole("status").filter({ hasText: "Bewaard ✓" })).toBeVisible({ timeout: 15_000 })
  expect(await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith("gronn-intake-")))).toBe(false)
})

test("klant met dezelfde naam maakt geen tweede kaart", async ({ page }) => {
  await log(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/dashboard/klanten")
  await page.getByLabel("Naam", { exact: true }).fill("Noah Goffin")
  await page.getByRole("button", { name: "+ Klant" }).click()
  await expect(page).toHaveURL(/\/dashboard\/klanten\/noah-goffin\?bestond=1/)
  await expect(page.getByRole("status")).toContainText("bestond al")
})

test("systeem: elke pagina één h1, geen fouten, geen overloop, licht en donker", async ({ page }) => {
  test.setTimeout(90_000)
  await log(page)
  const fouten: string[] = []
  page.on("pageerror", (e) => fouten.push(e.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  const paden = [
    "/dashboard",
    "/dashboard/aanvragen",
    "/dashboard/klanten",
    "/dashboard/klanten?weergave=tabel",
    "/dashboard/klanten/clannad-stijn",
    "/dashboard/klanten/clannad-stijn?tab=tuinen",
    "/dashboard/klanten/clannad-stijn?tab=stukken",
    "/dashboard/klanten/clannad-stijn?tab=activiteit",
    "/dashboard/vragenlijst",
    "/dashboard/planning",
    "/dashboard/calculaties",
    "/dashboard/prijs",
    "/dashboard/catalogus",
    "/dashboard/leveranciers",
    "/dashboard/geld",
    "/dashboard/uren",
    "/dashboard/social",
    "/dashboard/links",
  ]
  for (const pad of paden) {
    const r = await page.goto(pad)
    expect(r?.status(), pad).toBe(200)
    await expect(page.locator("h1:visible"), pad).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), pad).toBe(0)
    await expect(page.getByRole("navigation", { name: "Onderdelen" }).locator('[aria-current="page"]'), pad).toHaveCount(1)
  }
  // donker: dezelfde pagina's, andere tokens (de grond is houtskool, niet wit)
  await page.evaluate(() => localStorage.setItem("gronn-weergave", JSON.stringify({ kleur: "donker" })))
  for (const pad of ["/dashboard", "/dashboard/klanten/clannad-stijn"]) {
    await page.goto(pad)
    const grond = await page.locator(".crm").first().evaluate((e) => getComputedStyle(e).backgroundColor)
    expect(grond, pad).toBe("rgb(22, 22, 20)")
  }
  expect(fouten).toEqual([])
})

test("oude adressen van het dashboard leiden naar het nieuwe onderdeel", async ({ page }) => {
  await log(page)
  for (const [oud, nieuw] of [["klanten", "/dashboard/aanvragen"], ["geld", "/dashboard/geld"], ["social", "/dashboard/social"], ["links", "/dashboard/links"]]) {
    await page.goto(`/dashboard?tab=${oud}`)
    await expect(page).toHaveURL(nieuw)
  }
})

test("zoekvenster: ⌘K vindt een klant, Enter opent de kaart; zonder treffer zegt het dat", async ({ page }) => {
  await log(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/dashboard")
  await page.keyboard.press("ControlOrMeta+k")
  const veld = page.getByRole("combobox", { name: /Zoek een klant/ })
  await expect(veld).toBeFocused()
  await veld.fill("hairdiel")
  await expect(page.getByRole("option").first()).toContainText("HairDiel")
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/dashboard\/klanten\/hairdiel$/)
  await expect(page.locator("h1")).toContainText("HairDiel")
  // geen contactgegevens in het zoekvenster
  await page.keyboard.press("ControlOrMeta+k")
  await veld.fill("zzzz-bestaat-niet")
  await expect(page.getByText(/Niets gevonden/)).toBeVisible()
})

test("schil: inklappen blijft bewaard, Grønn opent op de klantkaart met die klant", async ({ page }) => {
  await log(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/dashboard/klanten/noah-goffin")
  await page.getByRole("button", { name: "Vraag Grønn over deze klant" }).click()
  const paneel = page.getByRole("complementary", { name: "Grønn" })
  await expect(paneel).toBeVisible()
  await expect(paneel).toContainText("kent deze klant")
  await page.getByRole("button", { name: "Zijbalk inklappen" }).click()
  await page.reload()
  await expect(page.getByRole("button", { name: "Zijbalk uitklappen" })).toBeVisible()
  await expect(page.getByRole("complementary", { name: "Grønn" })).toBeVisible()
})
