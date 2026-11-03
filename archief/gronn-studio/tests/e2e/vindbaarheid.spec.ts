import { expect, test, type Page } from "@playwright/test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { MERKBASIS, PORTRET } from "@/components/gronn/plekken"
import { Vertrouwen } from "@/components/gronn/elementen/vertrouwen"
import { VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { VIJVER_BIJGEWERKT, VIJVER_GEPUBLICEERD } from "@/lib/data/vijverrenovatie-datums"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"

// Vindbaarheid en bewijs (audit naar de principes van Dan Hoye, sep 2026):
// titels met vak en regio, het organisatieschema in de huidige positie,
// het vijverproject als bewijs naast de waterdiensten, een datum op het
// project en een vertrouwensblok dat onzichtbaar blijft tot Nick het vult.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

type Knoop = Record<string, unknown>

async function jsonLd(page: Page): Promise<Knoop[]> {
  const blokken = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blokken.map((b) => JSON.parse(b) as Knoop)
}

// ── 1. Titels en beschrijvingen: vak plus regio ──────────────────────────
for (const pad of ["/services", "/projects", "/studio", "/contact"]) {
  for (const prefix of ["", "/nl"]) {
    const url = `${prefix}${pad}`
    test(`titel en beschrijving noemen de regio: ${url}`, async ({ page }) => {
      await page.goto(url)
      await expect(page).toHaveTitle(/Limburg.* — GRØNN Studio$/)
      const beschrijving = await page.locator('meta[name="description"]').getAttribute("content")
      expect(beschrijving).toContain("Limburg")
    })
  }
}

// Elke dienstpagina: de dienst plus de regio in de titel.
for (const [url, titel] of [
  ["/services/winterising", "Winterising in Limburg — GRØNN Studio"],
  ["/nl/services/winterising", "Winterklaar maken in Limburg — GRØNN Studio"],
] as const) {
  test(`dienst: vak plus regio in de titel (${url})`, async ({ page }) => {
    await page.goto(url)
    await expect(page).toHaveTitle(titel)
  })
}

// ── 1b. De herfstbeurt: plaats in de titel, de prijzen in de JSON-LD ─────
for (const [url, titel] of [
  ["/herfstbeurt", /^Pond winterising around Stein — GRØNN Studio$/],
  ["/nl/herfstbeurt", /^Vijver winterklaar maken rond Stein — GRØNN Studio$/],
] as const) {
  test(`herfstbeurt: plaats in de titel en de drie najaarsprijzen (${url})`, async ({ page }) => {
    await page.goto(url)
    await expect(page).toHaveTitle(titel)
    const catalogus = (await jsonLd(page)).find((k) => k["@type"] === "OfferCatalog")
    expect(catalogus, "geen aanbod in de JSON-LD").toBeTruthy()
    expect(catalogus!.url).toBe(`https://gronn.studio${url}`)
    const aanbod = catalogus!.itemListElement as Knoop[]
    expect(aanbod.map((o) => (o.url as string).split("/").pop())).toEqual([
      "leaf-net",
      "pond-autumn-service",
      "winterising",
    ])
    // Dezelfde vanafprijzen als de pagina, uit pricing.ts.
    expect(aanbod.map((o) => (o.priceSpecification as Knoop).lowPrice)).toEqual([125, 250, 95])
  })
}

// ── 2. Het organisatieschema ─────────────────────────────────────────────
for (const url of ["/", "/nl"]) {
  test(`organisatieschema: Limburg, de plaatsen, Nick als oprichter (${url})`, async ({ page }) => {
    await page.goto(url)
    const org = (await jsonLd(page)).find((k) => k["@type"] === "ProfessionalService")
    expect(org, "geen organisatieknoop").toBeTruthy()

    expect(org!.description).toBe(MERKBASIS.nl)

    const gebied = org!.areaServed as Knoop[]
    expect(gebied.find((g) => g["@type"] === "AdministrativeArea")?.name).toBe("Limburg")
    expect(gebied.some((g) => g["@type"] === "Country")).toBe(false)
    expect(gebied.filter((g) => g["@type"] === "City").map((g) => g.name)).toEqual([...SERVICE_AREA_TOWNS])

    const oprichter = org!.founder as Knoop
    expect(oprichter["@type"]).toBe("Person")
    expect(oprichter.name).toBe("Nick Peters")
    expect(oprichter.image).toBe(`https://gronn.studio${PORTRET.src}`)

    // De oude positie is overal weg: in de JSON-LD en in de hele pagina.
    const html = await page.content()
    for (const oud of ["regenerative landscape transformation", "Landscapes designed as living systems", "Netherlands"]) {
      expect(JSON.stringify(org), oud).not.toContain(oud)
      expect(html, oud).not.toContain(oud)
    }
  })
}

// ── 3. Het vijverproject als bewijs op de waterdiensten ──────────────────
for (const slug of ["water-systems", "pond-survey", "pond-autumn-service"]) {
  for (const prefix of ["", "/nl"]) {
    const url = `${prefix}/services/${slug}`
    test(`bewijs: ${url} linkt naar de vijverrenovatie, zonder oranje`, async ({ page }) => {
      await page.goto(url)
      const blok = page.locator("[data-bewijs]")
      await expect(blok).toBeVisible()
      const link = blok.getByRole("link")
      await expect(link).toHaveAttribute("href", `${prefix}/projects/${VIJVER_SLUG}`)
      // Geen tweede oranje accent: de link staat in de tekstkleur van het blok.
      const [linkKleur, blokKleur] = await Promise.all([
        link.evaluate((el) => getComputedStyle(el).color),
        blok.evaluate((el) => getComputedStyle(el).color),
      ])
      expect(linkKleur).toBe(blokKleur)
    })
  }
}

test("bewijs: een tuindienst krijgt geen vijverblok", async ({ page }) => {
  await page.goto("/nl/services/garden-design")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.locator("[data-bewijs]")).toHaveCount(0)
})

// ── 4. Het project: datum zichtbaar en in de JSON-LD ─────────────────────
for (const [prefix, tekst] of [
  ["/nl", "Bijgewerkt op 23 september 2026"],
  ["", "Updated 23 September 2026"],
] as const) {
  test(`project: "${tekst}" en dezelfde datum in de JSON-LD`, async ({ page }) => {
    await page.goto(`${prefix}/projects/${VIJVER_SLUG}`)
    const regel = page.locator("[data-bijgewerkt]")
    await expect(regel).toHaveText(tekst)
    await expect(regel.locator("time")).toHaveAttribute("datetime", VIJVER_BIJGEWERKT)

    const artikel = (await jsonLd(page)).find((k) => k["@type"] === "Article")
    expect(artikel, "geen Article-knoop").toBeTruthy()
    expect(artikel!.datePublished).toBe(VIJVER_GEPUBLICEERD)
    expect(artikel!.dateModified).toBe(VIJVER_BIJGEWERKT)
    expect((artikel!.author as Knoop).name).toBe("Nick Peters")
    expect((artikel!.publisher as Knoop).name).toBe("GRØNN Studio")
  })
}

// ── 5. Vertrouwen ────────────────────────────────────────────────────────
// De lege staat op de echte home: nu is src/lib/data/vertrouwen.ts leeg,
// dus hoort er niets te staan — geen sectie, geen kop.
for (const url of ["/", "/nl"]) {
  test(`vertrouwen: onzichtbaar zolang de data leeg is (${url})`, async ({ page }) => {
    await page.goto(url)
    await expect(page.locator("#project-kop")).toBeVisible()
    await expect(page.locator("[data-vertrouwen]")).toHaveCount(0)
  })
}

// De gevulde staat kan op de site pas bestaan als Nick iets aanlevert, en
// een testvlag in productiecode die de data vervangt zou een tweede weg
// naar de pagina openen. Daarom rendert deze test het element zelf op de
// server (react-dom/server), met verzonnen TESTdata die nooit de site
// bereikt.
test.describe("vertrouwen: het element zelf", () => {
  test.skip(({ isMobile }) => isMobile, "geen browser nodig; één keer is genoeg")

  const render = (props: Parameters<typeof Vertrouwen>[0]) => renderToStaticMarkup(createElement(Vertrouwen, props))

  test("leeg of alleen spaties: niets", () => {
    expect(render({ locale: "nl" })).toBe("")
    expect(render({ locale: "nl", lidmaatschappen: [] })).toBe("")
    expect(render({ locale: "en", reactie: { tekst: "  ", naam: "A." }, lidmaatschappen: [{ naam: " " }] })).toBe("")
  })

  test("gevuld: reactie, naam en lidmaatschappen, zonder oranje", () => {
    const html = render({
      locale: "nl",
      reactie: { tekst: "TESTREACTIE", naam: "T.T." },
      lidmaatschappen: [{ naam: "TESTLID MET LINK", link: "https://example.org/lid" }, { naam: "TESTLID ZONDER LINK" }],
    })
    expect(html).toContain("data-vertrouwen")
    expect(html).toContain("Een klant over het werk")
    expect(html).toContain("“TESTREACTIE”")
    expect(html).toContain("— T.T.")
    expect(html).toContain('<a href="https://example.org/lid"')
    expect(html).toContain("TESTLID ZONDER LINK")
    expect(html).not.toMatch(/ember/)
  })

  test("alleen lidmaatschappen: geen reactiekop", () => {
    const html = render({ locale: "en", lidmaatschappen: [{ naam: "TESTLID" }] })
    expect(html).toContain("Memberships and qualifications")
    expect(html).not.toContain("A client on the work")
  })
})

// ── 6. Contact: kaarten 16px ─────────────────────────────────────────────
for (const url of ["/contact", "/nl/contact"]) {
  test(`contact: elke afgeronde kaart is 16px (${url})`, async ({ page }) => {
    await page.goto(url)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const afwijkend = await page.locator("main").evaluate((main) => {
      const fout: string[] = []
      let kaarten = 0
      for (const el of Array.from(main.querySelectorAll<HTMLElement>("*"))) {
        // Invoervelden zijn geen kaarten (die blijven zoals ze zijn).
        if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) continue
        const s = getComputedStyle(el)
        const r = parseFloat(s.borderTopLeftRadius)
        if (!r) continue
        const { width, height } = el.getBoundingClientRect()
        if (!width || !height) continue
        // Helemaal rond (knoppen, pillen, stippen) mag.
        if (r >= Math.min(width, height) / 2 - 0.5) continue
        kaarten++
        if (r !== 16) fout.push(`${el.tagName}.${el.className} → ${s.borderTopLeftRadius}`)
      }
      return { fout, kaarten }
    })
    expect(afwijkend.fout).toEqual([])
    // Het moet ook echt iets gemeten hebben: bosvlak, dossierkaart, formulier.
    expect(afwijkend.kaarten).toBeGreaterThanOrEqual(3)
  })
}
