import { expect, test } from "@playwright/test"

import { STACK, STACK_GROEPEN } from "@/lib/data/stack"
import { MERKEN } from "@/lib/data/stack-merken"
import { VIDEOS } from "@/lib/data/vijverrenovatie"

// /stack, terug sinds 24 sep 2026 als "Techniek" (eigenaar: "a tech stack
// page similar to the old one, but more intuitive and interactive").
// Wat hier bewaakt wordt: de pagina bestaat weer (geen 307 naar de
// voorpagina), de pillen filteren precies wat de data zegt, het werkt met
// alleen een toetsenbord, en de telefoon krijgt geen zijwaartse overloop.

const PAD = "/nl/stack"
const kaarten = (page: import("@playwright/test").Page) => page.locator("[data-stack-kaart]:visible")

test("stack: de pagina staat er weer, in beide talen, zonder omleiding", async ({ page, request }) => {
  for (const pad of ["/stack", "/nl/stack"]) {
    const res = await request.get(pad, { maxRedirects: 0 })
    expect(res.status(), `${pad} leidt nog om`).toBe(200)
  }
  await page.goto(PAD)
  await expect(page.getByRole("heading", { level: 1, name: "Waar ik mee werk." })).toBeVisible()
  await page.goto("/stack")
  await expect(page.getByRole("heading", { level: 1, name: "What I work with." })).toBeVisible()
})

test("stack: in de sitemap, in de voet en onder Studio in het kruimelpad", async ({ page, request }) => {
  const xml = await (await request.get("/sitemap.xml")).text()
  expect(xml).toContain("https://gronn.studio/stack<")
  expect(xml).toContain("https://gronn.studio/nl/stack<")

  await page.goto(PAD)
  await expect(page.locator("footer a[href='/nl/stack']")).toHaveCount(1)
  const kruimels = page.locator("nav[aria-label='Kruimelpad'] ol > li")
  await expect(kruimels).toHaveText(["Home", "Studio", "Techniek"])
})

test("stack: elke kaart uit de data staat erop, met de iPhone en het Ulanzi-statief", async ({ page }) => {
  await page.goto(PAD)
  await expect(kaarten(page)).toHaveCount(STACK.length)
  await expect(page.locator("[data-stack-telling]")).toHaveText(`${STACK.length} van ${STACK.length} onderdelen`)
  for (const naam of ["iPhone 13", "Ulanzi MA38", "Next.js", "Vercel", "FormSubmit", "Playwright + axe"]) {
    // Vercel staat er twee keer: als platform en als koppeling van Claude.
    await expect(page.getByRole("heading", { level: 3, name: naam, exact: true }).first()).toBeVisible()
  }
  // Het statief is aantoonbaar gebruikt: de link naar de vijverrenovatie
  // staat zichtbaar onder de kaart, niet achter een klik.
  const statief = page.locator("[data-stack-kaart='ulanzi']")
  await expect(statief.getByRole("link", { name: /vijverrenovatie/ })).toBeVisible()
  await expect(statief).toContainText("Favoriet")
})

test("stack: elke pil toont precies de kaarten van zijn groep, met de juiste telling", async ({ page }) => {
  await page.goto(PAD)
  for (const g of STACK_GROEPEN) {
    const verwacht = STACK.filter((o) => o.groep === g.id)
    const pil = page.getByRole("radio", { name: new RegExp(`^${g.label.nl} ${verwacht.length}$`) })
    // Op de telefoon ligt de dock over de onderrand: zet de pil in het
    // midden, anders landt de klik op de dock in plaats van op de pil.
    await pil.evaluate((el) => (el.closest("label") ?? el).scrollIntoView({ block: "center" }))
    await pil.check({ force: true })
    await expect(pil).toBeChecked()
    await expect(kaarten(page)).toHaveCount(verwacht.length)
    for (const o of verwacht) await expect(page.locator(`[data-stack-kaart='${o.id}']`)).toBeVisible()
    // Alleen de gekozen groep heeft een zichtbare kop.
    await expect(page.locator("[data-stack-groep]:visible")).toHaveCount(1)
    await expect(page.locator(`[data-stack-groep='${g.id}']`)).toBeVisible()
    await expect(page.locator("[data-stack-telling]")).toHaveText(`${verwacht.length} van ${STACK.length} onderdelen`)
  }
  await page.getByRole("radio", { name: new RegExp(`^Alles ${STACK.length}$`) }).check({ force: true })
  await expect(kaarten(page)).toHaveCount(STACK.length)
})

test("stack: zoeken, niets vinden en weer alles tonen", async ({ page }) => {
  await page.goto(PAD)
  const zoek = page.getByRole("searchbox", { name: "Zoek op naam" })
  await zoek.fill("ulanzi")
  await expect(kaarten(page)).toHaveCount(1)
  await expect(page.locator("[data-stack-kaart='ulanzi']")).toBeVisible()
  // Op pakketnaam: "@vercel/blob" staat niet in de naam "Vercel Blob".
  await zoek.fill("@vercel/blob")
  await expect(kaarten(page)).toHaveCount(1)
  await zoek.fill("grasmaaier")
  await expect(kaarten(page)).toHaveCount(0)
  await expect(page.getByText("Niets gevonden.", { exact: false })).toBeVisible()
  await page.getByRole("button", { name: "Toon alles" }).click()
  await expect(zoek).toHaveValue("")
  await expect(kaarten(page)).toHaveCount(STACK.length)
})

test("stack: met alleen het toetsenbord filteren en een kaart openen", async ({ page, isMobile }) => {
  test.skip(isMobile, "toetsenbordbediening")
  await page.goto(PAD)
  const alles = page.getByRole("radio", { name: /^Alles/ })
  await alles.focus()
  // Pijl naar rechts in een radiogroep kiest de volgende: Vastleggen.
  await page.keyboard.press("ArrowRight")
  const eerste = STACK_GROEPEN[0]
  await expect(page.getByRole("radio", { name: new RegExp(`^${eerste.label.nl}`) })).toBeChecked()
  await expect(kaarten(page)).toHaveCount(STACK.filter((o) => o.groep === eerste.id).length)

  // Terug naar alles, dan de kaart van Next.js openen met Enter.
  await page.keyboard.press("ArrowLeft")
  await expect(alles).toBeChecked()
  const kaart = page.locator("[data-stack-kaart='next'] details")
  const kop = kaart.locator("summary")
  await kop.focus()
  await expect(kop).toBeFocused()
  await expect(kaart).not.toHaveAttribute("open", "")
  await page.keyboard.press("Enter")
  await expect(kaart).toHaveAttribute("open", "")
  await expect(kaart.getByText("Pakket en versie")).toBeVisible()
  // De versie komt uit package.json, niet uit de hand.
  await expect(kaart.locator("dd.font-mono")).toContainText(/^next \d+\.\d+\.\d+$/)
  await page.keyboard.press("Space")
  await expect(kaart).not.toHaveAttribute("open", "")
})

for (const breedte of [320, 375]) {
  test(`stack: geen zijwaartse overloop op ${breedte}px, ook met een kaart open`, async ({ page }) => {
    await page.setViewportSize({ width: breedte, height: 740 })
    await page.goto(PAD)
    await page.locator("[data-stack-kaart='playwright'] summary").click()
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
    expect(sw).toBeLessThanOrEqual(iw)
    // De pillen blijven binnen de pagina en minstens 44px hoog.
    for (const pil of await page.locator("[data-stack-kiezer] fieldset label > span").all()) {
      const box = (await pil.boundingBox())!
      expect(box.x + box.width).toBeLessThanOrEqual(breedte)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })
}

// Merktekens (eigenaar, 29 sep 2026: "en logos van techstack software?"):
// alleen waar de data een `merk` noemt, ongewijzigd uit Simple Icons, in
// één vlakke kleur (currentColor = de tekstkleur van de kaart) en
// verborgen voor schermlezers, want de naam staat er als tekst naast.
test("stack: merktekens alleen bij een merk, verborgen en in de tekstkleur", async ({ page }) => {
  await page.goto(PAD)
  const met = STACK.filter((o) => o.merk)
  expect(met.length).toBeGreaterThan(0)
  await expect(page.locator("[data-stack-merk]")).toHaveCount(met.length)
  for (const o of STACK) {
    const merk = page.locator(`[data-stack-kaart='${o.id}'] [data-stack-merk]`)
    if (!o.merk) {
      await expect(merk, `${o.id} heeft geen eigen merk`).toHaveCount(0)
      continue
    }
    await expect(merk).toHaveCount(1)
    await expect(merk).toBeVisible()
    await expect(merk).toHaveAttribute("aria-hidden", "true")
    await expect(merk).toHaveAttribute("fill", "currentColor")
    await expect(merk.locator("path")).toHaveAttribute("d", MERKEN[o.merk].pad)
    // Eén vlakke kleur: de vulling is de tekstkleur, geen merkkleur.
    const [vulling, tekst] = await merk.evaluate((el) => {
      const kop = el.closest("h3")!
      return [getComputedStyle(el).fill, getComputedStyle(kop).color]
    })
    expect(vulling, o.id).toBe(tekst)
    const box = (await merk.boundingBox())!
    expect(box.width).toBe(20)
    expect(box.height).toBe(20)
  }
  // De toegankelijke naam van de kop is alleen de productnaam.
  await expect(page.getByRole("heading", { level: 3, name: "Next.js", exact: true })).toBeVisible()
})

// Het statief in gebruik (eigenaar, 29 sep 2026: "ulanzi MA38 statief,
// gebruik fotos van statief"): Nicks eigen clip van de vijverrenovatie
// bij Vastleggen, stil en in een lus, met de glaslaag en het bijschrift.
test("stack: de statiefclip staat bij Vastleggen, met bijschrift", async ({ page }) => {
  await page.goto(PAD)
  const beeld = page.locator("[data-stack-groep='vastleggen'] [data-stack-beeld='vastleggen']")
  await expect(beeld).toBeVisible()
  const video = beeld.locator("video")
  await expect(video).toHaveAttribute("poster", VIDEOS.V01.poster)
  await expect(video).toHaveAttribute("src", VIDEOS.V01.src)
  await expect(video).toHaveAttribute("aria-label", VIDEOS.V01.beschrijving)
  expect(await video.evaluate((v: HTMLVideoElement) => [v.muted, v.loop, v.playsInline])).toEqual([true, true, true])
  await expect(beeld.locator("figcaption")).toHaveText(VIDEOS.V01.bijschrift!)
  await expect(beeld.locator(".photo-glass")).toHaveCount(1)
  // Bij een andere groep is hij weg, met Vastleggen weer terug.
  await page.getByRole("radio", { name: /^Controle/ }).check({ force: true })
  await expect(beeld).toBeHidden()
  await page.getByRole("radio", { name: /^Vastleggen/ }).check({ force: true })
  await expect(beeld).toBeVisible()
  // In het Engels het Engelse bijschrift.
  await page.goto("/stack")
  await expect(page.locator("[data-stack-beeld='vastleggen'] figcaption")).toHaveText(/^Capturing the work on the fly/)
})

test("stack: bij minder beweging staat de clip stil op de poster, met bediening", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(PAD)
  const video = page.locator("[data-stack-beeld='vastleggen'] video")
  await expect(video).toHaveAttribute("controls", "")
  await page.waitForTimeout(500)
  expect(await video.evaluate((v: HTMLVideoElement) => [v.paused, v.autoplay])).toEqual([true, false])
})

// Geen zijbubbels op Techniek (eigenaar, 29 sep 2026: "op techniek pagina
// schakel bubbels langs zijkanten uit!"); elders blijven ze. De knop naar
// boven staat los van de bubbels en blijft rechtsonder.
test("stack: geen zijbubbels op /stack, wel op /services; de knop naar boven blijft", async ({ page, isMobile }) => {
  test.skip(isMobile, "de zijbubbels staan alleen vanaf xl")
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/nl/services")
  await expect(page.locator('[data-element="ContactBubbel"]')).toHaveCount(1)
  await expect(page.locator('[data-element="HemelBubbel"]')).toHaveCount(1)
  for (const pad of [PAD, "/stack"]) {
    await page.goto(pad)
    await page.waitForLoadState("networkidle")
    await expect(page.locator('[data-element="ContactBubbel"]'), pad).toHaveCount(0)
    await expect(page.locator('[data-element="HemelBubbel"]'), pad).toHaveCount(0)
  }
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
  const knop = page.locator('[data-element="NaarBovenKnop"]')
  await expect(knop).toBeVisible()
  await expect(knop).not.toHaveAttribute("inert", "")
  await page.waitForTimeout(400) // de overgang van 300 ms
  const box = (await knop.boundingBox())!
  expect(1440 - (box.x + box.width)).toBeCloseTo(16, 0)
  expect(900 - (box.y + box.height)).toBeCloseTo(16, 0)
})

// De koppelingen van Claude en hoe we het volgen (eigenaar, 29 sep 2026:
// "zet in techniek pagina ook welke connectors aan claude zijn gekoppeld
// en hoe we de website en code in de gaten houden").
test("stack: gekoppeld aan Claude en in de gaten houden, elk met een eigen kop", async ({ page }) => {
  await page.goto(PAD)
  for (const id of ["claude", "bewaken"] as const) {
    const g = STACK_GROEPEN.find((x) => x.id === id)!
    const sectie = page.locator(`[data-stack-groep='${id}']`)
    await expect(sectie.getByRole("heading", { level: 2, name: g.label.nl })).toBeVisible()
    await expect(sectie.locator("[data-stack-kaart]")).toHaveCount(STACK.filter((o) => o.groep === id).length)
  }
  await expect(page.locator("[data-stack-groep='claude'] [data-stack-kaart='claude']")).toBeVisible()
  // Nergens staat dat Claude de site bouwt (eigenaar, 29 sep 2026).
  await expect(page.locator("main")).not.toContainText(/Claude (bouwt|schrijft|draait|opent|maakt|volgt)/)
  await expect(page.locator("main")).not.toContainText(/bouwt deze site/i)
  // Alleen verbonden koppelingen: Figma is nog niet toegevoegd.
  await expect(page.locator("[data-stack-groep='claude']")).not.toContainText("Figma")
})
