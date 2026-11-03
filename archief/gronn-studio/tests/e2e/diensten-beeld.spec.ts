import { expect, test, type Locator, type Page } from "@playwright/test"

import { beeldLabel, beeldVan, SERVICES, type DienstBeeld } from "@/lib/data/services"
import { TERRAS_SLUG } from "@/lib/data/terras-geulle"
import { VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { pick } from "@/lib/i18n"

// De foto's op de dienstkaarten (Nick, 25 sep 2026: "relevantere fotos,
// mogen pexels stock fotos zijn. Maar passend bij de titels"). Een mix:
// eigen werk waar het past, stock voor de rest. Wat hier bewaakt wordt:
// - een dienst met een `beeld` toont DAT beeld, met het juiste label;
// - stock draagt altijd "Stockfoto" en woont in /diensten/;
// - een AI-visualisatie (F03) gaat nooit door voor werk op /services;
// - een stockfoto staat nooit bij een project;
// - het label is leesbaar in beide uren, ook boven het lichtste beeld.
//
// Sinds huisstijl Editie 02 (28 sep 2026) toont /services alleen nog de
// ECHTE eigen foto's; een stock- of plaatshouderfoto werd de tegel van het
// niveau (diensten-tegels.spec.ts). De stockdata blijft bestaan en wordt
// hier nog bewaakt, maar staat niet meer op een kaart.

const SERVICES_NL = "/nl/services"
const PROJECTEN = ["/nl/projects", `/nl/projects/${VIJVER_SLUG}`, `/nl/projects/${TERRAS_SLUG}`]

const MET_BEELD = SERVICES.flatMap((s) => {
  const b = beeldVan(s)
  return b ? [{ slug: s.slug, beeld: b, label: pick(beeldLabel(s)!, "nl") }] : []
})
const STOCK = MET_BEELD.filter((m) => m.beeld.bron === "stock")
const WERK = MET_BEELD.filter((m) => m.beeld.bron === "werk")

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

/** De kaart van één dienst: de link in main, niet die in het megamenu. */
const kaart = (page: Page, slug: string) => page.locator(`main a[href="/nl/services/${slug}"]`)

/** src en srcset van een <img>, ontdaan van de /_next/image-verpakking. */
async function bronnen(img: Locator) {
  return img.evaluate((el: HTMLImageElement) =>
    decodeURIComponent(`${el.getAttribute("src") ?? ""} ${el.getAttribute("srcset") ?? ""}`)
  )
}

test.describe("de regel zelf", () => {
  test.skip(({ isMobile }) => isMobile, "data, één keer is genoeg")

  test("stock → Stockfoto, eigen werk → het project, niets → Conceptbeeld, editorfoto → geen label", () => {
    const stock: DienstBeeld = { src: "/diensten/x.jpg", alt: { nl: "x", en: "x" }, bron: "stock", credit: "Iemand", url: "https://www.pexels.com/photo/1/" }
    expect(beeldLabel({ slug: "x", beeld: stock })).toEqual({ nl: "Stockfoto", en: "Stock photo" })
    const vijver: DienstBeeld = { src: "/projecten/vijverrenovatie/F10.jpg", alt: { nl: "x", en: "x" }, bron: "werk", project: "vijver" }
    expect(beeldLabel({ slug: "x", beeld: vijver })).toEqual({ nl: "Eigen werk · Vijverrenovatie", en: "Own work · Pond renovation" })
    expect(beeldLabel({ slug: "x", beeld: { ...vijver, project: "terras" } })).toEqual({ nl: "Eigen werk · Terras", en: "Own work · Terrace" })
    expect(beeldLabel({ slug: "bestaat-niet" })).toEqual({ nl: "Conceptbeeld", en: "Concept image" })
    expect(beeldLabel({ slug: "bestaat-niet", image: "https://blob.example/x.jpg" })).toBeNull()
  })

  test("eigen werk komt uit een project en is nooit F03; stock woont in /diensten/ met bron", () => {
    // De vier van 25 sep 2026; zakt dit, dan viel er een foto weg.
    expect(MET_BEELD.filter((m) => m.beeld.bron === "werk").map((m) => m.slug).sort()).toEqual(
      ["consultancy", "implementation", "pond-survey", "water-systems"]
    )
    for (const { slug, beeld } of MET_BEELD) {
      expect(beeld.alt.nl.length, `${slug}: alt nl`).toBeGreaterThanOrEqual(20)
      expect(beeld.alt.en.length, `${slug}: alt en`).toBeGreaterThanOrEqual(20)
      if (beeld.bron === "werk") {
        expect(beeld.src, slug).toMatch(/^\/projecten\/(vijverrenovatie|terras-geulle)\//)
        expect(beeld.src, `${slug}: AI-visualisatie`).not.toMatch(/F03/)
        expect(beeld.project, slug).toBeTruthy()
      } else {
        expect(beeld.src, slug).toMatch(/^\/diensten\//)
        expect(beeld.credit, `${slug}: fotograaf`).toBeTruthy()
        expect(beeld.url, `${slug}: fotopagina`).toMatch(/^https:\/\/www\.pexels\.com\/photo\//)
      }
    }
  })
})

test("/services: elke dienst met eigen werk toont die foto met het juiste label", async ({ page }) => {
  await page.goto(SERVICES_NL)
  expect(WERK.length).toBeGreaterThanOrEqual(4)
  for (const { slug, beeld, label } of WERK) {
    const k = kaart(page, slug)
    await expect(k, slug).toHaveCount(1)
    await k.scrollIntoViewIfNeeded()
    const img = k.locator("img")
    expect(await bronnen(img), slug).toContain(beeld.src)
    await expect(img, slug).toHaveAttribute("alt", beeld.alt.nl)
    // Echt geladen, niet alleen een attribuut: lazy beelden laden pas in beeld.
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth), { message: slug }).toBeGreaterThan(0)
    await expect(k.locator("[data-concept-label]"), slug).toHaveText(label)
    if (beeld.focus) {
      await expect(img, slug).toHaveCSS("object-position", beeld.focus)
    }
  }
})

test("/services: geen stockfoto en geen Conceptbeeld meer; elke foto draagt zijn label", async ({ page }) => {
  await page.goto(SERVICES_NL)
  const main = page.locator("main")
  await expect(main.getByText("Stockfoto", { exact: true })).toHaveCount(0)
  await expect(main.getByText("Conceptbeeld", { exact: true })).toHaveCount(0)
  // Een kaart heeft een foto met precies één label, of een tegel zonder.
  const kaarten = page.locator('main a[href^="/nl/services/"]')
  const n = await kaarten.count()
  expect(n).toBe(SERVICES.length)
  for (let i = 0; i < n; i++) {
    const k = kaarten.nth(i)
    const fotos = await k.locator("img").count()
    await expect(k.locator("[data-concept-label]")).toHaveCount(fotos ? 1 : 0)
    await expect(k.locator('[data-element="IcoonVlak"]')).toHaveCount(fotos ? 0 : 1)
  }
})

/**
 * Alle beeldbronnen op de pagina in één keer: het aantal <img> verandert
 * na hydratie (menu's), dus niet één voor één op index.
 */
async function alleBronnen(page: Page) {
  await page.waitForLoadState("networkidle")
  return page.locator("img").evaluateAll((els) =>
    els.map((el) => decodeURIComponent(`${el.getAttribute("src") ?? ""} ${el.getAttribute("srcset") ?? ""}`))
  )
}

test("/services: geen AI-visualisatie (F03) in beeld", async ({ page }) => {
  await page.goto(SERVICES_NL)
  const srcs = await alleBronnen(page)
  expect(srcs.length).toBeGreaterThanOrEqual(WERK.length)
  expect(srcs.filter((s) => /F03/.test(s))).toEqual([])
})

test("projecten: geen stockfoto van de diensten", async ({ page }) => {
  for (const pad of PROJECTEN) {
    const res = await page.goto(pad)
    expect(res?.status(), pad).toBe(200)
    const srcs = await alleBronnen(page)
    expect(srcs.length, pad).toBeGreaterThan(0)
    expect(srcs.filter((s) => s.includes("/diensten/")), pad).toEqual([])
    for (const { beeld } of STOCK) expect(srcs.filter((s) => s.includes(beeld.src)), pad).toEqual([])
  }
})

// Het label is merkconstant (wit op zwart 60 %), dus het moet boven het
// LICHTSTE denkbare beeld nog lezen. Samengesteld op een wit vlak in het
// canvas van de browser zelf, zodat de kleurnotatie er niet toe doet.
for (const uur of ["goldenhour", "bluehour"] as const) {
  test(`het beeldlabel haalt 4,5:1 boven wit in ${uur}`, async ({ page }) => {
    await page.addInitScript((t) => {
      localStorage.setItem("theme", t)
      localStorage.setItem("gronn-theme-mode", "manual")
    }, uur)
    await page.goto(SERVICES_NL)
    await expect(page.locator("html")).toHaveClass(new RegExp(uur))
    const label = kaart(page, WERK[0].slug).locator("[data-concept-label]")
    await label.scrollIntoViewIfNeeded()
    const ratio = await label.evaluate((el) => {
      const cs = getComputedStyle(el)
      const c = document.createElement("canvas")
      c.width = c.height = 1
      const x = c.getContext("2d")!
      const px = (kleur: string) => {
        x.fillStyle = "#fff"
        x.fillRect(0, 0, 1, 1)
        x.fillStyle = kleur
        x.fillRect(0, 0, 1, 1)
        return Array.from(x.getImageData(0, 0, 1, 1).data.slice(0, 3))
      }
      const lum = (rgb: number[]) => {
        const [r, g, b] = rgb.map((v) => {
          const s = v / 255
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const a = lum(px(cs.backgroundColor))
      const b = lum(px(cs.color))
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    })
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
}
