import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

// V4 · De waterroute: de homepage en het eerste echte project.

const PROJECT = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

test("projectpagina: alle hoofdstukken, beide tabellen, citaat, contactdeur", async ({ page }) => {
  await page.goto(PROJECT)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Twee vijvers. Eén samenhangend watersysteem."
  )
  for (const kop of [
    "Het project in cijfers",
    "De opgave: ieder onderdeel op elkaar afstemmen",
    "Hoe de twee vijvers samenwerken",
    "Drukvast pvc en een zorgvuldig gekozen leidingroute",
    "Een beschadigd filter herstellen: een project binnen het project",
    "Elf plantmanden en zeven soorten in het oorspronkelijke plan",
    "Een vijver die weer past bij de tuin",
  ]) {
    await expect(page.getByRole("heading", { name: kop })).toBeVisible()
  }
  await expect(page.getByText("toegepaste buis gespecificeerd tot 7,5 bar")).toBeVisible()
  await expect(page.getByRole("table")).toContainText("Penningkruid, beekpunge, watermunt")
  await expect(page.locator("blockquote")).toContainText("Ik heb ontzettend genoten")
  const deur = page.getByRole("link", { name: /Bespreek jouw vijverproject/ })
  await expect(deur).toHaveAttribute("href", "/nl/contact")
  await expect(page).toHaveTitle("Vijverrenovatie met waterval en beekloop — GRØNN Studio")
})

test("projectpagina: geen lege beeldvakken en geen kapotte beelden", async ({ page }) => {
  await page.goto(PROJECT)
  const imgs = page.locator("article img")
  const n = await imgs.count()
  for (let i = 0; i < n; i++) {
    const src = await imgs.nth(i).getAttribute("src")
    expect(src).toBeTruthy()
  }
  // Elk beeldvak dat er staat, draagt minstens één echte foto: een vak
  // zonder foto hoort niet te renderen.
  const vakken = page.locator("[data-foto]")
  for (let i = 0; i < (await vakken.count()); i++) {
    await expect(vakken.nth(i).locator("img")).not.toHaveCount(0)
  }
})

test("projectpagina en homepage: geen zijwaartse overloop, geen axe-fouten", async ({ page }) => {
  for (const path of [PROJECT, "/nl", "/"]) {
    await page.goto(path)
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
    expect(sw, path).toBeLessThanOrEqual(iw)
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`), path).toEqual([])
  }
})

test("homepage: wie, wat, waarom — en de deuren naar diensten, project en contact", async ({ page }) => {
  await page.goto("/nl")
  // De kop zegt wat (positionering, 3 okt 2026); de belofte komt
  // letterlijk uit de Brand Guide 2026.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Een vijver en tuin die gezond blijven.")
  await expect(page.getByText("Een tuin die met je meegroeit.")).toBeVisible()
  // De opening toont echt werk: de waterval van de vijver (F10), zonder
  // label Sfeerbeeld (eigenaar, 25 sep 2026). Er staat bovenaan dus geen
  // sfeerbeeld meer — en een foto van echt werk draagt dat label nooit.
  const opening = page.locator('main section').first().locator('img[src*="F10"]').first()
  await expect(opening).toBeVisible()
  await expect(page.locator('main section').first().locator('img[src*="sfeer"]')).toHaveCount(0)
  await expect(page.locator('main section').first().getByText("Sfeerbeeld", { exact: true })).toHaveCount(0)
  // Drie niveaus als grote regels (de link showcase).
  await expect(page.locator(".g-rij")).toHaveCount(3)
  // Het echte project is bereikbaar vanuit het blok Uitgelicht. De
  // opening draagt sinds 2 okt 2026 geen projectkaart en geen tweede knop
  // meer ("Rustiger").
  await expect(page.locator(`main a[href="${PROJECT}"]`).filter({ visible: true }).first()).toBeVisible()
  await expect(page.getByRole("heading", { name: "Twee vijvers. Eén samenhangend watersysteem." })).toBeVisible()
  // De hoofddeur gaat naar contact.
  await expect(page.getByRole("link", { name: /Plan een kennismaking/ }).first()).toHaveAttribute("href", "/nl/contact")
})

test("reduced motion: reveals en parallax staan stil", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/nl")
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".g-in")!).animationName)).toBe("none")
  // De opening draagt sinds 25 sep 2026 geen parallax meer (de canna moest
  // in beeld blijven); het portret op Studio wel.
  await page.goto("/nl/studio")
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".g-parallax")!).animationName)).toBe("none")
})

// Alleen echt werk, elk met zijn eigen status. Sinds 24 sep 2026 twee:
// de vijver (in afronding) en het terras in Geulle (afgerond).
test("projectenoverzicht: alleen echte projecten, elk met zijn status", async ({ page }) => {
  await page.goto("/nl/projects")
  const kaarten = page.locator('main a[href^="/nl/projects/"]')
  await expect(kaarten).toHaveCount(2)
  await expect(page.locator('main a[href="/nl/projects/terras-geulle-24-m2-betontegels"]')).toContainText("Afgerond")
  const kaart = page.locator(`main a[href="${PROJECT}"]`).first()
  await expect(kaart).toContainText("In afronding")
  await kaart.click()
  await expect(page).toHaveURL(PROJECT)
})

// De gids: "Sfeerbeelden zijn geen bewijs van uitgevoerde projecten."
test("een sfeerbeeld staat nooit op de projectpagina", async ({ page }) => {
  await page.goto(PROJECT)
  await expect(page.locator('img[src*="sfeer"]')).toHaveCount(0)
})

// De pagina zelf scrolde niet zijwaarts, maar het bosgroene projectblok op
// de voorpagina was op de telefoon breder dan zijn kaart: de kop en de
// cijfers liepen onder de afgeronde rand weg (eigenaar, 23 sep 2026).
// `overflow: hidden` op de kaart verborg dat voor de toets hierboven.
// Daarom: geen tekst mag voorbij de rand van het scherm staan, behalve
// in een vak dat bewust zijwaarts scrolt (het waterrouteschema).
test("telefoon: geen tekst loopt onder een kaartrand weg", async ({ page, isMobile }) => {
  test.skip(!isMobile, "gaat over de smalle breedte")
  for (const path of ["/nl", "/nl/projects", PROJECT, "/nl/services", "/nl/services/pond-autumn-service", "/nl/studio", "/nl/contact"]) {
    await page.goto(path, { waitUntil: "networkidle" })
    const buiten = await page.evaluate(() => {
      const scrollt = (el: Element) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX
          if (o === "auto" || o === "scroll") return true
        }
        return false
      }
      // `span` erbij: de projectkaart op /nl/projects is één link met
      // spans erin, en daar liep de titel onder de kaartrand weg.
      return [...document.querySelectorAll("main h1, main h2, main h3, main p, main dt, main dd, main a, main span")]
        .filter((el) => !scrollt(el))
        // Alleen voor schermlezers (sr-only): niet zichtbaar, dus niet
        // onder een rand weg te lopen.
        .filter((el) => !el.closest(".sr-only"))
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
        .map((el) => `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 40)}" → ${Math.round(el.getBoundingClientRect().right)}px`)
    })
    expect(buiten, `${path} (${await page.evaluate(() => innerWidth)}px breed)`).toEqual([])
  }
})

// Het waterrouteschema scrolde op de telefoon opzij en was dan maar half
// te zien (eigenaar, 23 sep 2026). Op de telefoon staat nu een staande
// tekening die in de breedte past: niets scrolt, en de liggende versie is
// er niet. Sinds 24 sep 2026 draagt de projectkaart de foto; het schema
// staat alleen nog op de projectpagina.
test("telefoon: het waterrouteschema past zonder te scrollen", async ({ page, isMobile }) => {
  test.skip(!isMobile, "gaat over de smalle breedte")
  for (const path of [PROJECT]) {
    await page.goto(path, { waitUntil: "networkidle" })
    const staand = page.locator('svg[data-schema="staand"]').first()
    await expect(staand, path).toBeVisible()
    const box = (await staand.boundingBox())!
    const breedte = await page.evaluate(() => innerWidth)
    expect(box.x, path).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, path).toBeLessThanOrEqual(breedte)
    await expect(page.locator('[role="region"][aria-label*="horizontaal te scrollen"]').first(), path).toBeHidden()
  }
})


// De getallen in een cijferrij delen één lijn, ook als de labels erboven
// op een ander aantal regels afbreken (eigenaar, 23 sep 2026: "nummers
// zitten niet op de zelfde hoogte").
test("de cijfers in een rij staan op dezelfde hoogte", async ({ page }) => {
  for (const path of ["/nl", "/nl/projects"]) {
    await page.goto(path, { waitUntil: "networkidle" })
    const rijen = await page.evaluate(() =>
      [...document.querySelectorAll("main dl")].map((dl) => {
        const dd = [...dl.querySelectorAll(":scope > div > dd")].map((d) => d.getBoundingClientRect())
        // Groepeer per visuele rij (zelfde top van de cel)
        const perRij = new Map<number, number[]>()
        for (const [i, r] of dd.entries()) {
          const cel = dl.querySelectorAll(":scope > div")[i].getBoundingClientRect()
          const k = Math.round(cel.top)
          perRij.set(k, [...(perRij.get(k) ?? []), Math.round(r.bottom)])
        }
        return [...perRij.values()]
      })
    )
    for (const dl of rijen) for (const rij of dl) {
      expect(Math.max(...rij) - Math.min(...rij), `${path}: ${rij.join(", ")}`).toBeLessThanOrEqual(1)
    }
  }
})

// De projectkaart (voorpagina, projectenoverzicht) toont de eerste foto
// zodra die er is (ProjectBeeld). Sinds 24 sep 2026 is dat zo; het
// compacte waterrouteschema was de plaatshouder daarvoor.
test("de projectkaart toont de eerste echte foto", async ({ page }) => {
  for (const path of ["/nl", "/nl/projects"]) {
    await page.goto(path, { waitUntil: "networkidle" })
    const foto = page.locator('img[src*="projecten%2Fvijverrenovatie%2FF01"], img[src*="/projecten/vijverrenovatie/F01"]').first()
    await expect(foto, path).toBeVisible()
    await expect(page.locator('[role="region"][aria-label*="horizontaal te scrollen"]'), path).toHaveCount(0)
  }
})

// De inhoudsopgave links wijst aan welk hoofdstuk je leest, en de koppen
// rechts dragen geen nummer meer: dat stond dubbel (eigenaar, 23 sep 2026).
test("desktop: de inhoudsopgave wijst het hoofdstuk aan dat je leest", async ({ page, isMobile }) => {
  test.skip(isMobile, "de sticky inhoudsopgave is een desktoponderdeel")
  await page.goto(PROJECT, { waitUntil: "networkidle" })
  const inhoud = page.getByRole("navigation", { name: "Inhoud van dit project" })
  for (const [id, kort] of [
    ["waterroute", "De waterroute"],
    ["filter", "Het filter"],
    ["opgave", "De opgave"],
  ]) {
    await page.locator(`#${id}-kop`).evaluate((el) => el.closest("section")!.scrollIntoView({ block: "start" }))
    await expect(inhoud.getByRole("link", { name: kort }), id).toHaveAttribute("aria-current", "location")
    await expect(inhoud.locator('a[aria-current="location"]'), id).toHaveCount(1)
  }
  // De nummers in de inhoudsopgave zelf blijven.
  await expect(inhoud.getByRole("link").first()).toContainText("01")
  // Boven de hoofdstukkoppen staat niets meer: de kop is het eerste kind.
  const koppen = page.locator('article section[id][aria-labelledby$="-kop"] > h2')
  expect(await koppen.count()).toBeGreaterThan(3)
  const ervoor = await koppen.evaluateAll((hs) => hs.map((h) => h.previousElementSibling?.outerHTML ?? null))
  expect(ervoor).toEqual(ervoor.map(() => null))
})
