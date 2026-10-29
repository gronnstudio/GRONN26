import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import content from "../../content/site-content.json"
import { PRICING, priceHint, pricingFor, QUOTE_OFFSETS } from "@/lib/data/pricing"
import { consumerPrice } from "@/lib/format"
import type { Locale } from "@/lib/i18n"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"

// /faq — de veelgestelde vragen (eigenaar, 23 sep 2026, naar Dan Hoye:
// "help Google en AI-tools je te vinden, en beantwoord wat een
// tuinontwerper kost").
//
// De regel die hier bewaakt wordt: geen enkel antwoord verzint iets.
// Daarom rekent deze spec elke prijs ZELF uit `pricing.ts` na, los van
// de code die de antwoorden bouwt, en eist hij dat de FAQPage-JSON-LD
// woord voor woord zegt wat er op het scherm staat.
//
// En: een ontwerp is ALTIJD een offerte (eigenaar, 23 sep 2026). De
// vaste ontwerpprijzen die er stonden (vijverontwerp € 650, tuinontwerp
// € 950, tuin en vijver € 1.450) mogen nergens meer opduiken — niet in
// een antwoord, niet op een kaart, niet in JSON-LD, niet in de zoekfunctie.

const VRAGEN: Record<Locale, string[]> = {
  nl: [
    "Wat kost een tuinontwerp?",
    "Wat kost advies aan huis?",
    "Kan ik alleen hulp met mijn vijver krijgen?",
    "Leg je de tuin ook aan?",
    "Ik heb een budget. Kun je daarbinnen werken?",
    "Werk je ook in mijn plaats?",
    "Voor welke tuinen werk je?",
    "Hoe gaat zo’n traject?",
    "Hoe lang duurt een ontwerp of aanleg?",
    "Wie werkt er aan mijn tuin?",
    "Wanneer kan ik het best beginnen?",
    "Hoe begin ik?",
  ],
  en: [
    "How much does a garden design cost?",
    "How much does advice at home cost?",
    "Can I get help with just my pond?",
    "Do you also build the garden?",
    "I have a budget. Can you work within it?",
    "Do you also work where I live?",
    "What kind of gardens do you work on?",
    "How does a project go?",
    "How long does a design or a build take?",
    "Who works on my garden?",
    "When is the best time to start?",
    "How do I start?",
  ],
}

const PAD: Record<Locale, string> = { nl: "/nl/faq", en: "/faq" }

const services = (content as { services: { slug: string; title: { en: string; nl: string } }[] }).services
const titel = (slug: string, locale: Locale) => {
  const s = services.find((x) => x.slug === slug)
  if (!s) throw new Error(`geen dienst ${slug}`)
  return s.title[locale]
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim()

/** Alle vragen open, dan de antwoordtekst zoals een lezer hem ziet. */
async function antwoorden(page: Page) {
  await page.locator("details").evaluateAll((els) => els.forEach((d) => ((d as HTMLDetailsElement).open = true)))
  return page.locator("details").evaluateAll((els) =>
    els.map((d) => ({
      id: d.id,
      vraag: (d.querySelector("summary h2") as HTMLElement).innerText,
      antwoord: (d.querySelector("[data-antwoord]") as HTMLElement).innerText,
    }))
  )
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

for (const locale of ["nl", "en"] as const) {
  test(`${locale}: elke vraag staat er, als kop, en de eerste is open`, async ({ page }) => {
    await page.goto(PAD[locale])
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const koppen = page.locator("details summary h2")
    await expect(koppen).toHaveText(VRAGEN[locale])
    for (const v of VRAGEN[locale]) {
      await expect(page.getByRole("heading", { level: 2, name: v })).toBeVisible()
    }
    await expect(page.locator("details").first()).toHaveAttribute("open", "")
    await expect(page.locator("details[open]")).toHaveCount(1)
  })

  test(`${locale}: elke prijs komt uit pricing.ts, geen enkele is verzonnen`, async ({ page }) => {
    await page.goto(PAD[locale])
    const lijst = await antwoorden(page)
    const bij = (id: string) => norm(lijst.find((a) => a.id === id)?.antwoord ?? "")

    // Wat kost een tuinontwerp? — altijd een offerte: geen enkel bedrag,
    // wel de kennismaking en de verrekenregel.
    const ontwerp = bij("wat-kost-een-tuinontwerp")
    expect(ontwerp).not.toMatch(/€/)
    expect(ontwerp).toContain(locale === "nl" ? "offerte, na een kennismaking op locatie" : "quote per project, after an introduction on site")
    expect(ontwerp).toContain(norm(QUOTE_OFFSETS["garden-design"][locale]))
    // Wat kost advies aan huis? — elke trede van de vijverdoorlichting.
    for (const tier of PRICING["pond-survey"].tiers) {
      expect(bij("wat-kost-advies-aan-huis")).toContain(norm(`${tier.label[locale].toLowerCase()} ${consumerPrice(tier.amount, locale)}`))
    }
    // Alleen de vijver — elke waterdienst met de vanafprijs van de dienstenkaart.
    for (const slug of ["pond-survey", "leaf-net", "pond-autumn-service", "winterising", "maintenance-subscription"]) {
      const h = priceHint(slug)!
      const vanaf = `${locale === "nl" ? "Vanaf" : "From"} ${consumerPrice(h.from, locale)}${h.monthly ? (locale === "nl" ? " per maand" : " a month") : ""}`
      expect(bij("alleen-hulp-met-mijn-vijver")).toContain(norm(`${titel(slug, locale)}. ${vanaf}`))
    }
    // Een dienst zonder prijs krijgt er ook geen.
    expect(bij("alleen-hulp-met-mijn-vijver")).toContain(norm(`${titel("water-systems", locale)}. ${locale === "nl" ? "Op maat" : "Tailored"}`))

    // Geen enkel bedrag op de pagina dat niet in pricing.ts staat (de
    // verrekenregels tellen mee: "boven €750" staat daar letterlijk).
    const toegestaan = new Set<number>()
    for (const p of Object.values(PRICING)) {
      for (const tier of p.tiers) {
        toegestaan.add(tier.amount)
        if (tier.amountMax) toegestaan.add(tier.amountMax)
      }
      for (const m of (p.offset?.[locale] ?? "").matchAll(/€\s?([\d.,]+)/g)) toegestaan.add(Number(m[1].replace(/[.,]/g, "")))
    }
    const alles = lijst.map((a) => a.antwoord).join(" ")
    const bedragen = [...alles.matchAll(/€\s?([\d.,]+\d)/g)].map((m) => Number(m[1].replace(/[.,]/g, "")))
    expect(bedragen.length).toBeGreaterThan(5)
    for (const b of bedragen) expect(toegestaan, `€${b} staat niet in pricing.ts`).toContain(b)
  })

  test(`${locale}: de nieuwe antwoorden zijn die van Nick, niets meer`, async ({ page }) => {
    await page.goto(PAD[locale])
    const lijst = await antwoorden(page)
    const bij = (id: string) => norm(lijst.find((a) => a.id === id)?.antwoord ?? "")
    const nl = locale === "nl"
    expect(bij("voor-welke-tuinen-werk-je")).toBe(
      nl
        ? "De grootte van je tuin doet er niet toe. Is een project groter dan ik alleen aankan, dan ga ik samenwerken met andere hoveniers of ontwerpers."
        : "The size of your garden does not matter. If a project is bigger than I can take on alone, I work together with other landscape gardeners or designers."
    )
    expect(bij("hoe-lang-duurt-een-ontwerp-of-aanleg")).toBe(
      nl ? "Dat hangt af van wat ik aantref. Daarom begint het met de eerste stap: eerst kijken." : "That depends on what I find. That is why it starts with the first step: looking first."
    )
    expect(bij("wanneer-kan-ik-het-best-beginnen")).toBe(
      nl
        ? "Hoe lang je moet wachten, hangt af van mijn agenda. Het beste moment is de herfst, of net daarvoor. Dan plant je aan in de rustperiode, de winter, en krijgen de planten in het voorjaar een extra boost als ze uitlopen."
        : "How long you wait depends on my calendar. The best time is autumn, or just before it. Then you plant in the dormant period, the winter, and in spring the plants get an extra boost as they come into leaf."
    )
    // Garantie laat Nick bewust weg.
    expect(lijst.map((a) => a.vraag).join(" ")).not.toMatch(/garantie|guarantee|warranty/i)
  })

  test(`${locale}: werkgebied en contact komen uit werkgebied.ts en business.ts`, async ({ page }) => {
    await page.goto(PAD[locale])
    const lijst = await antwoorden(page)
    const plaats = norm(lijst.find((a) => a.id === "werk-je-ook-in-mijn-plaats")!.antwoord)
    for (const town of SERVICE_AREA_TOWNS) expect(plaats).toContain(town)
    expect(plaats).toContain("Stein, Limburg")
    const begin = norm(lijst.find((a) => a.id === "hoe-begin-ik")!.antwoord)
    expect(begin).toContain("hello@gronn.studio")
    // "Wat je krijgt" bij aanleg is de includes-lijst van de dienst, niets meer.
    const aanleg = norm(lijst.find((a) => a.id === "leg-je-de-tuin-ook-aan")!.antwoord)
    const impl = (content as { services: { slug: string; includes: { en: string; nl: string }[] }[] }).services.find((s) => s.slug === "implementation")!
    for (const x of impl.includes) expect(aanleg.toLowerCase()).toContain(x[locale].toLowerCase())
  })

  test(`${locale}: de FAQPage-JSON-LD zegt precies wat er staat`, async ({ page }) => {
    await page.goto(PAD[locale])
    const blokken = await page.locator('script[type="application/ld+json"]').allTextContents()
    const faq = blokken.map((b) => JSON.parse(b)).find((d) => d["@type"] === "FAQPage")
    expect(faq, "geen FAQPage-blok").toBeTruthy()
    expect(faq["@context"]).toBe("https://schema.org")
    const lijst = await antwoorden(page)
    expect(faq.mainEntity).toHaveLength(VRAGEN[locale].length)
    expect(faq.mainEntity).toHaveLength(lijst.length)
    faq.mainEntity.forEach((q: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }, i: number) => {
      expect(q["@type"]).toBe("Question")
      expect(q.name).toBe(lijst[i].vraag)
      expect(q.acceptedAnswer["@type"]).toBe("Answer")
      expect(norm(q.acceptedAnswer.text)).toBe(norm(lijst[i].antwoord))
    })
  })
}

// De vaste ontwerpprijzen die er stonden, in beide schrijfwijzen.
const OUDE_ONTWERPPRIJS = /€\s?(650|950|1[.,]450)(?!\d)/

test.describe("ontwerp is altijd een offerte", () => {
  test("pricing.ts kent geen ontwerpprijs, en de vijverdoorlichting blijft staan", () => {
    expect(PRICING["garden-design"]).toBeUndefined()
    expect(pricingFor("garden-design")).toBeUndefined()
    expect(priceHint("garden-design")).toBeNull()
    expect(PRICING["pond-survey"].tiers.map((t) => t.amount)).toEqual([195, 175, 295])
  })

  for (const pad of ["/nl", "/", "/nl/services", "/services", "/nl/services/garden-design", "/services/garden-design", "/nl/faq", "/faq"]) {
    test(`geen vaste ontwerpprijs op ${pad}, ook niet in JSON-LD`, async ({ page }) => {
      await page.goto(pad)
      const tekst = await page.locator("body").innerText()
      expect(tekst).not.toMatch(OUDE_ONTWERPPRIJS)
      const blokken = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b))
      for (const blok of blokken) {
        const json = JSON.stringify(blok)
        // Een dienst "garden-design" draagt nergens een aanbod met prijs.
        if (blok["@type"] === "Service" && String(blok.url).endsWith("/services/garden-design")) expect(blok.offers).toBeUndefined()
        if (blok["@type"] === "OfferCatalog") {
          const ontwerp = blok.itemListElement.find((o: { url: string }) => o.url.endsWith("/services/garden-design"))
          expect(ontwerp, "tuinontwerp staat in de catalogus").toBeTruthy()
          expect(ontwerp.priceSpecification).toBeUndefined()
        }
        expect(json).not.toMatch(OUDE_ONTWERPPRIJS)
      }
    })
  }

  test("de ontwerpdienst zegt op maat, met de verrekenregel in de ik-vorm", async ({ page }) => {
    await page.goto("/nl/services/garden-design")
    const main = page.locator("main")
    await expect(main.getByText("Prijs · op maat")).toBeVisible()
    await expect(main.getByText(QUOTE_OFFSETS["garden-design"].nl)).toBeVisible()
    expect(await main.innerText()).not.toMatch(/€/)
    await page.goto("/nl/services")
    await expect(page.locator("a[href$='/services/garden-design']")).toContainText("op maat")
    await page.goto("/nl")
    await expect(page.locator("a[href$='/services#ontwerp']")).toContainText("op maat")
  })

  test("zoeken toont geen ontwerpprijs", async ({ page, isMobile }) => {
    test.skip(isMobile, "⌘K is het toetsenbordpad; de telefoon zoekt via de dock")
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await page.keyboard.press("Control+k")
    const zoek = page.getByRole("dialog").locator("input")
    await expect(zoek).toBeFocused()
    await zoek.fill("ontwerp")
    await expect(page.getByRole("dialog").getByRole("button", { name: /Tuinontwerp/ }).first()).toBeVisible()
    expect(await page.getByRole("dialog").innerText()).not.toMatch(OUDE_ONTWERPPRIJS)
  })
})

test("toetsenbord: Tab bereikt een vraag, Enter en spatie klappen hem open en dicht", async ({ page, isMobile }) => {
  test.skip(isMobile, "toetsenbord")
  await page.goto("/nl/faq")
  const tweede = page.locator("details").nth(1)
  await expect(tweede).not.toHaveAttribute("open", "")
  // Via Tab, niet via focus(): de vraag moet in de tabvolgorde zitten.
  await page.locator("details").first().locator("summary").focus()
  await page.keyboard.press("Tab")
  // Tussen de eerste en de tweede vraag staat de verder-link van de eerste.
  for (let i = 0; i < 5; i++) {
    if (await tweede.locator("summary").evaluate((el) => el === document.activeElement)) break
    await page.keyboard.press("Tab")
  }
  await expect(tweede.locator("summary")).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(tweede).toHaveAttribute("open", "")
  await expect(tweede.locator("[data-antwoord]")).toBeVisible()
  await page.keyboard.press("Space")
  await expect(tweede).not.toHaveAttribute("open", "")
  await expect(tweede.locator("[data-antwoord]")).toBeHidden()
})

test("een #anker opent die ene vraag", async ({ page }) => {
  await page.goto("/nl/faq#werk-je-ook-in-mijn-plaats")
  await expect(page.locator("#werk-je-ook-in-mijn-plaats")).toHaveAttribute("open", "")
  await expect(page.locator("#werk-je-ook-in-mijn-plaats [data-antwoord]")).toBeVisible()
})

test("zoeken vindt een vraag en opent hem op /faq", async ({ page, isMobile }) => {
  test.skip(isMobile, "⌘K is het toetsenbordpad; de telefoon zoekt via de dock")
  await page.goto("/nl")
  await page.waitForLoadState("networkidle")
  await page.keyboard.press("Control+k")
  const zoek = page.getByRole("dialog").locator("input")
  await expect(zoek).toBeFocused()
  await zoek.fill("mijn plaats")
  await page.getByRole("button", { name: /Werk je ook in mijn plaats\?/ }).click()
  await expect(page).toHaveURL(/\/nl\/faq#werk-je-ook-in-mijn-plaats$/)
  await expect(page.locator("#werk-je-ook-in-mijn-plaats")).toHaveAttribute("open", "")
})

test("de deuren naar /faq: contactformulier, voet en sitemap", async ({ page, request }) => {
  await page.goto("/nl/contact")
  await expect(page.getByRole("link", { name: "Kijk bij de veelgestelde vragen" })).toHaveAttribute("href", "/nl/faq")
  await expect(page.locator("footer").getByRole("link", { name: "Veelgestelde vragen" })).toHaveAttribute("href", "/nl/faq")
  const kaart = await (await request.get("/sitemap.xml")).text()
  expect(kaart).toContain("https://gronn.studio/faq<")
  expect(kaart).toContain("https://gronn.studio/nl/faq<")
})

for (const pad of ["/nl/faq", "/faq"]) {
  test(`axe: ${pad}, alle vragen open, geen zijwaartse overloop`, async ({ page }) => {
    await page.goto(pad, { waitUntil: "networkidle" })
    await page.locator("details").evaluateAll((els) => els.forEach((d) => ((d as HTMLDetailsElement).open = true)))
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
    expect(sw).toBeLessThanOrEqual(iw)
    const res = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("canvas")
      .analyze()
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
  })
}
