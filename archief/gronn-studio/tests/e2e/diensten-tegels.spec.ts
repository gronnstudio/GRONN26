import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

import { beeldVan, SERVICES, SERVICE_GROUPS, servicesInGroup } from "@/lib/data/services"
import { DIENST_PANEEL, PLANTGROEP_ICONEN, PLANTGROEP_VOLGORDE, RAND_DREMPEL } from "@/lib/iconen"
import { metroIndeling, PHI } from "@/lib/metro"

// Huisstijl Editie 02 op /services en home (eigenaar, 28 sep 2026):
// - de drie niveaus heten Ontwerp / Aanleg / Onderhoud en tellen 6 / 1 / 4;
// - een dienstkaart zonder ECHTE eigen foto toont de tegel van haar niveau,
//   zonder conceptlabel; een kaart met eigen werk houdt die foto;
// - Beplanting toont de plantgroepen (vier op de kaart, acht op de pagina);
// - in Donker verdwijnt de antraciete Ontwerp-tegel niet in de antraciete
//   grond: zijn rand haalt ≥ 1,3:1, gemeten in pixels.

const SERVICES_NL = "/nl/services"
const kaart = (page: Page, slug: string) => page.locator(`main a[href="/nl/services/${slug}"]`)
const MET_FOTO = SERVICES.filter((s) => beeldVan(s)?.bron === "werk").map((s) => s.slug)
const ZONDER_FOTO = SERVICES.filter((s) => beeldVan(s)?.bron !== "werk").map((s) => s.slug)

async function thema(page: Page, uur: "goldenhour" | "bluehour") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t)
      localStorage.setItem("gronn-theme-mode", "manual")
      sessionStorage.setItem("gronn-intro", "1")
    } catch {}
  }, uur)
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

test("/services: drie secties ontwerp, aanleg, onderhoud met 6, 1 en 4 diensten", async ({ page }) => {
  await page.goto(SERVICES_NL)
  const secties = page.locator("main section[id]").filter({ has: page.locator('a[href^="/nl/services/"]') })
  await expect(secties).toHaveCount(3)
  expect(await secties.evaluateAll((els) => els.map((e) => e.id))).toEqual(["ontwerp", "aanleg", "onderhoud"])
  const telling = { ontwerp: 6, aanleg: 1, onderhoud: 4 }
  for (const [id, n] of Object.entries(telling)) {
    await expect(page.locator(`main section#${id} a[href^="/nl/services/"]`), id).toHaveCount(n)
  }
  // Dezelfde telling als de data: de pagina volgt servicesInGroup.
  for (const g of SERVICE_GROUPS) expect(servicesInGroup(SERVICES, g.kind)).toHaveLength(telling[g.kind])
  // Elk niveau draagt zijn tegel (64px) boven "0n · Naam".
  const namen = ["01 · Ontwerp", "02 · Aanleg", "03 · Onderhoud"]
  for (const [i, id] of ["ontwerp", "aanleg", "onderhoud"].entries()) {
    const tegel = page.locator(`main section#${id} svg[data-icoon="dienst:${id}"]`).first()
    await expect(tegel).toHaveAttribute("aria-hidden", "true")
    const box = (await tegel.boundingBox())!
    expect([box.width, box.height]).toEqual([64, 64])
    const label = page.locator(`main section#${id}`).getByText(namen[i], { exact: true })
    await expect(label).toBeVisible()
    // Boven het label, links op dezelfde lijn.
    const lb = (await label.boundingBox())!
    expect(lb.y).toBeGreaterThan(box.y + box.height)
    expect(Math.abs(lb.x - box.x)).toBeLessThan(1)
  }
})

test("/services: een kaart zonder eigen foto toont de tegel van haar niveau, geen Conceptbeeld", async ({ page }) => {
  await page.goto(SERVICES_NL)
  expect(ZONDER_FOTO.length).toBeGreaterThan(0)
  for (const slug of ZONDER_FOTO) {
    const k = kaart(page, slug)
    await expect(k, slug).toHaveCount(1)
    await expect(k.locator("img"), slug).toHaveCount(0)
    await expect(k.locator("[data-concept-label]"), slug).toHaveCount(0)
    await expect(k, slug).not.toContainText("Conceptbeeld")
    await expect(k, slug).not.toContainText("Stockfoto")
    const vlak = k.locator('[data-element="IcoonVlak"]')
    await expect(vlak, slug).toHaveAttribute("aria-hidden", "true")
    // Dezelfde 16:10 als een foto — behalve in het grote blok van het
    // metroraster (vanaf lg), waar het vlak de vrije hoogte vult.
    const groot = (await page.locator(`main li[data-metro-rol="groot"] a[href="/nl/services/${slug}"]`).count()) > 0
    const b = (await vlak.boundingBox())!
    if (groot && (page.viewportSize()?.width ?? 0) >= 1024) expect(b.height, slug).toBeGreaterThan(b.width / 1.6)
    else expect(Math.abs(b.width / b.height - 1.6), slug).toBeLessThan(0.02)
  }
  // De tegel hoort bij het niveau van de sectie.
  for (const g of SERVICE_GROUPS) {
    for (const s of servicesInGroup(SERVICES, g.kind).filter((x) => ZONDER_FOTO.includes(x.slug) && x.slug !== "planting-habitat")) {
      await expect(kaart(page, s.slug).locator('[data-element="IcoonVlak"]'), s.slug).toHaveAttribute("data-vlak", `dienst:${g.kind}`)
    }
  }
})

// Sinds 29 sep 2026 (coördinator namens de eigenaar: de lichte vlakken
// waren in Donker "te zwaar"): het vlak is het paneel van het niveau, een
// thema-token — licht in Licht, een donkere tint in Donker.
test("/services: het vlak is het paneel van het niveau, per thema; de tegel staat op 44 % van de hoogte", async ({ page }) => {
  await page.goto(SERVICES_NL)
  const vlak = kaart(page, "garden-design").locator('[data-element="IcoonVlak"]')
  await vlak.scrollIntoViewIfNeeded()
  const v = (await vlak.boundingBox())!
  const t = (await vlak.locator("svg").boundingBox())!
  expect(Math.abs(t.x + t.width / 2 - (v.x + v.width / 2))).toBeLessThan(1)
  expect(Math.abs(t.y + t.height / 2 - (v.y + v.height * 0.44))).toBeLessThan(1)

  const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`
  for (const [uur, kant] of [["goldenhour", "licht"], ["bluehour", "donker"]] as const) {
    await thema(page, uur)
    await page.goto(SERVICES_NL)
    await expect(page.locator("html")).toHaveClass(new RegExp(uur))
    for (const g of SERVICE_GROUPS) {
      const vlakken = page.locator(`main section#${g.kind} [data-element="IcoonVlak"][data-vlak="dienst:${g.kind}"]`)
      const n = await vlakken.count()
      for (let i = 0; i < n; i++) {
        await expect(vlakken.nth(i), `${g.kind} ${uur}`).toHaveCSS("background-color", rgb(DIENST_PANEEL[g.kind][kant]))
        await expect(vlakken.nth(i), `${g.kind} ${uur}`).toHaveCSS("border-bottom-width", "1px")
      }
    }
    // In Donker geen lichte plaat meer: elk dienstvlak is donker (luminantie < 0,05).
    if (kant === "donker") {
      const l = await page.locator('main [data-element="IcoonVlak"]').evaluateAll((els) =>
        els.map((v) => {
          const [r, g, b] = (getComputedStyle(v).backgroundColor.match(/[\d.]+/g) ?? []).slice(0, 3).map((x) => {
            const c = Number(x) / 255
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
          })
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        })
      )
      expect(l.length).toBeGreaterThan(0)
      expect(Math.max(...l)).toBeLessThan(0.05)
    }
  }
})

test("/services: een kaart met eigen foto houdt die foto en zijn label", async ({ page }) => {
  await page.goto(SERVICES_NL)
  expect(MET_FOTO.length).toBeGreaterThanOrEqual(4)
  for (const slug of MET_FOTO) {
    const k = kaart(page, slug)
    await expect(k.locator("img"), slug).toHaveCount(1)
    await expect(k.locator('[data-element="IcoonVlak"]'), slug).toHaveCount(0)
    await expect(k.locator("[data-concept-label]"), slug).toHaveText(/^Eigen werk/)
  }
})

// Metro (eigenaar, 29 sep 2026): "waarom zit hier hoogte verschil? we
// kunnen metro aanhouden als dat mooi uitziet, een groot blok, twee
// kleine ernaast, beetje golden ratio principe aanhouden en daar op de
// achtergrond ook zo'n curve achterzetten". Het hoogteverschil kwam van
// Drijf (elke kaart een eigen scrolltempo); die is weg. Vanaf lg: per drie
// kaarten een groot blok (twee rijen) met twee kleine ernaast, φ : 1, om en
// om links en rechts, met de gulden spiraal erachter.

type Kader = { top: number; bottom: number; left: number; right: number; h: number; w: number }

/** De kaarten per eenheid in één sectie, in paginacoördinaten. */
async function eenheden(page: Page, id: string) {
  return page.locator(`main section#${id} li[data-metro-rol]`).evaluateAll((els) =>
    els.map((li) => {
      const r = li.querySelector("a")!.getBoundingClientRect()
      return {
        slug: li.querySelector("a")!.getAttribute("href")!.split("/").pop()!,
        rol: li.getAttribute("data-metro-rol")!,
        eenheid: Number(li.getAttribute("data-metro-eenheid")),
        gespiegeld: li.hasAttribute("data-metro-gespiegeld"),
        kader: { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, h: r.height, w: r.width },
      }
    })
  )
}

for (const breedte of [1280, 1440, 1920]) {
  test(`metro op ${breedte}px: blok = klein + 16 + klein, bovenkanten gelijk, kolommen φ : 1`, async ({ page, isMobile }) => {
    test.skip(isMobile, "de metro is vanaf lg")
    await page.setViewportSize({ width: breedte, height: 1000 })
    await page.goto(SERVICES_NL)
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
    expect(sw).toBeLessThanOrEqual(iw)
    let gemeten = 0
    for (const g of SERVICE_GROUPS) {
      const vakken = await eenheden(page, g.kind)
      // Dezelfde indeling als de functie: welk blok, welke rol, welke kant.
      const verwacht = metroIndeling(servicesInGroup(SERVICES, g.kind), (s) => beeldVan(s)?.bron === "werk")
      expect(vakken.map((v) => `${v.slug}:${v.rol}:${v.gespiegeld}`), g.kind).toEqual(
        verwacht.map((p) => `${p.item.slug}:${p.rol}:${p.gespiegeld}`)
      )
      for (const n of new Set(vakken.map((v) => v.eenheid))) {
        const deel = vakken.filter((v) => v.eenheid === n)
        const blok = deel.find((v) => v.rol === "groot")
        if (!blok) continue
        const [een, twee] = deel.filter((v) => v.rol === "klein").map((v) => v.kader).sort((a, b) => a.top - b.top) as [Kader, Kader]
        const b = blok.kader
        const tag = `${g.kind} eenheid ${n}`
        // Precies op de lijnen van het raster.
        expect(Math.abs(b.h - (een.h + 16 + twee.h)), `${tag}: hoogte`).toBeLessThanOrEqual(1)
        expect(Math.abs(b.top - een.top), `${tag}: bovenkant`).toBeLessThanOrEqual(1)
        expect(Math.abs(b.bottom - twee.bottom), `${tag}: onderkant`).toBeLessThanOrEqual(1)
        expect(Math.abs(twee.top - een.bottom - 16), `${tag}: tussenruimte`).toBeLessThanOrEqual(1)
        expect(Math.abs(een.left - twee.left) + Math.abs(een.w - twee.w), `${tag}: kleine kaarten onder elkaar`).toBeLessThanOrEqual(1)
        // Gulden snede, en de kant wisselt.
        expect(Math.abs(b.w / een.w / PHI - 1), `${tag}: φ`).toBeLessThan(0.02)
        expect(b.left < een.left, `${tag}: blok links`).toBe(!blok.gespiegeld)
        const gat = blok.gespiegeld ? b.left - een.right : een.left - b.right
        expect(Math.abs(gat - 16), `${tag}: gat tussen de kolommen`).toBeLessThanOrEqual(1)
        gemeten++
      }
      // Een brede kaart ligt: beeld in de brede kolom, dus even breed als het blok erboven.
      for (const v of vakken.filter((x) => x.rol === "breed")) {
        const beeld = await page.locator(`main a[href="/nl/services/${v.slug}"] > span`).first().boundingBox()
        const blok = vakken.find((x) => x.rol === "groot")
        if (blok) expect(Math.abs(beeld!.width - blok.kader.w), `${v.slug}: brede kolom`).toBeLessThanOrEqual(2)
        expect(beeld!.width / v.kader.w, `${v.slug}: beeld beslaat de φ-kolom`).toBeGreaterThan(0.58)
      }
    }
    // Ontwerp (6): twee eenheden; Onderhoud (4): één eenheid + een brede kaart.
    expect(gemeten).toBe(3)
  })
}

test("metro: het grote blok is een kaart met een echte eigen foto, waar die er is", async ({ page, isMobile }) => {
  test.skip(isMobile, "de metro is vanaf lg")
  await page.goto(SERVICES_NL)
  const groot = await page.locator('main li[data-metro-rol="groot"] a').evaluateAll((els) => els.map((a) => a.getAttribute("href")!.split("/").pop()))
  // Ontwerp: vijvers en water en advies op locatie; Onderhoud heeft geen eigen foto, dus de eerste.
  expect(groot).toEqual(["water-systems", "consultancy", "leaf-net"])
  await expect(page.locator('main li[data-metro-rol="groot"] a img')).toHaveCount(2)
  // Het grote vlak: de tegel φ keer zo groot, het vlak vult de hoogte.
  const tegel = (await page.locator('main a[href="/nl/services/leaf-net"] svg[data-icoon]').boundingBox())!
  expect(Math.abs(tegel.width - 88 * PHI)).toBeLessThan(1)
})

test("metro: de gulden spiraal achter elke eenheid — decoratief, φ : 1, in lijnen", async ({ page, isMobile }) => {
  test.skip(isMobile, "de spiraal hoort bij de metro, vanaf lg")
  await page.goto(SERVICES_NL)
  const blokken = page.locator('main li[data-metro-rol="groot"]')
  const n = await blokken.count()
  expect(n).toBe(3)
  for (let i = 0; i < n; i++) {
    const li = blokken.nth(i)
    const svg = li.locator("svg[data-metro-spiraal]")
    await expect(svg).toHaveCount(1)
    await expect(svg).toHaveAttribute("aria-hidden", "true")
    await expect(svg).toHaveCSS("pointer-events", "none")
    await expect(svg).toBeVisible()
    const [, , w, h] = (await svg.getAttribute("viewBox"))!.split(" ").map(Number)
    expect(Math.abs(w / h / PHI - 1)).toBeLessThan(0.01)
    // Geometrisch waar: nooit uitgerekt, en de getekende maat is ook φ : 1.
    expect(await svg.getAttribute("preserveAspectRatio")).toBeNull()
    const b = (await svg.boundingBox())!
    expect(Math.abs(b.width / b.height / PHI - 1)).toBeLessThan(0.01)
    // Even hoog als de eenheid (het blok), lijnen van 1px, geen vulling, geen oranje.
    const blok = (await li.locator("a").boundingBox())!
    expect(Math.abs(b.height - blok.height)).toBeLessThanOrEqual(1)
    const paden = await svg.locator("path").evaluateAll((ps) =>
      ps.map((p) => ({ fill: p.getAttribute("fill"), w: getComputedStyle(p).strokeWidth, stroke: getComputedStyle(p).stroke }))
    )
    expect(paden.length).toBe(1)
    for (const p of paden) {
      expect(p.fill).toBe("none")
      expect(p.w).toBe("1px")
      expect(p.stroke).not.toMatch(/219, 105, 35|161, 67, 18/)
    }
    // Onder de kaarten: de kaart ligt erboven, dus een klik op het blok landt op de link.
    await li.evaluate((n) => n.scrollIntoView({ block: "center" }))
    const midden = await li.locator("a").evaluate((a) => {
      const r = a.getBoundingClientRect()
      return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest("a") === a
    })
    expect(midden, `blok ${i}`).toBe(true)
  }
  // De snedes tussen de vierkanten: geen buitenrand, en geknipt tot de
  // eenheid (de bovenrand liep als een losse liniaal door de marge).
  for (let i = 0; i < n; i++) {
    const li = blokken.nth(i)
    const laag = li.locator("[data-metro-snedes]")
    await expect(laag).toHaveAttribute("aria-hidden", "true")
    await expect(laag).toHaveCSS("overflow", "hidden")
    const eenheid = Number(await li.getAttribute("data-metro-eenheid"))
    const kaarten = await li.locator("xpath=..").locator(`li[data-metro-eenheid="${eenheid}"] a`).evaluateAll((as) =>
      as.map((a) => a.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))
    )
    const k = (await laag.boundingBox())!
    expect(Math.abs(k.x - Math.min(...kaarten.map((c) => c.l))), `snedes ${i}: links`).toBeLessThanOrEqual(1)
    expect(Math.abs(k.x + k.width - Math.max(...kaarten.map((c) => c.r))), `snedes ${i}: rechts`).toBeLessThanOrEqual(1)
    expect(Math.abs(k.y - Math.min(...kaarten.map((c) => c.t))), `snedes ${i}: boven`).toBeLessThanOrEqual(1)
    expect(Math.abs(k.y + k.height - Math.max(...kaarten.map((c) => c.b))), `snedes ${i}: onder`).toBeLessThanOrEqual(1)
    // Alleen snedes: rechte lijnen (M…V/H), geen rechthoeken en geen bogen.
    const d = (await laag.locator("path").getAttribute("d"))!
    expect(d).toMatch(/^(M[\d.]+,[\d.]+[VH][\d.]+)+$/)
    // Geen lijn op de buitenrand: een verticale snede niet op x = 0 of de
    // volle breedte, een horizontale niet op y = 0 of de volle hoogte.
    const [, , vbW, vbH] = (await laag.locator("svg").getAttribute("viewBox"))!.split(" ").map(Number)
    for (const [, x, y, as] of d.matchAll(/M([\d.]+),([\d.]+)([VH])/g)) {
      if (as === "V") expect([0, vbW].includes(Number(x)), `snede op x=${x}`).toBe(false)
      else expect([0, vbH].includes(Number(y)), `snede op y=${y}`).toBe(false)
    }
  }

  // Onder lg geen spiraal.
  await page.setViewportSize({ width: 800, height: 900 })
  await expect(page.locator("main svg[data-metro-spiraal]").first()).toBeHidden()
})

for (const breedte of [320, 390, 768]) {
  test(`${breedte}px: geen metro, niets steekt buiten beeld`, async ({ page, isMobile }) => {
    test.skip(isMobile, "de breedte staat vast in de test")
    await page.setViewportSize({ width: breedte, height: 900 })
    await page.goto(SERVICES_NL)
    await page.waitForLoadState("networkidle")
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
    expect(sw).toBeLessThanOrEqual(iw)
    for (const g of SERVICE_GROUPS) {
      const vakken = await eenheden(page, g.kind)
      for (const v of vakken) {
        expect(v.kader.left, `${g.kind} ${v.slug}`).toBeGreaterThanOrEqual(0)
        expect(v.kader.right, `${g.kind} ${v.slug}`).toBeLessThanOrEqual(breedte)
      }
      // Een gewone stapel: kaarten in een rij even hoog en even breed.
      const rijen = new Map<number, Kader[]>()
      for (const v of vakken) rijen.set(Math.round(v.kader.top), [...(rijen.get(Math.round(v.kader.top)) ?? []), v.kader])
      for (const [top, ks] of rijen) {
        expect(Math.max(...ks.map((k) => k.h)) - Math.min(...ks.map((k) => k.h)), `${g.kind} rij op ${top}`).toBeLessThanOrEqual(1)
        expect(Math.max(...ks.map((k) => k.w)) - Math.min(...ks.map((k) => k.w)), `${g.kind} rij op ${top}`).toBeLessThanOrEqual(1)
      }
    }
    await expect(page.locator("main svg[data-metro-spiraal]").first()).toBeHidden()
  })
}

// Coördinator namens de eigenaar, 29 sep 2026: "Onderhoudsabonnemen-t" op
// 390px. Een kaarttitel breekt alleen tussen woorden of op een zacht
// afbreekstreepje (zachtAfbreken), nooit midden in een woord.
for (const breedte of [320, 390]) {
  test(`${breedte}px: kaarttitels breken nergens midden in een woord`, async ({ page, isMobile }) => {
    test.skip(isMobile, "de breedte staat vast in de test")
    await page.setViewportSize({ width: breedte, height: 900 })
    for (const pad of [SERVICES_NL, "/services"]) {
      await page.goto(pad)
      const lelijk = await page.locator('main li[data-metro-rol] a [class*="tekst-h3"]').evaluateAll((titels) =>
        titels.flatMap((el) => {
          const tekst = el.firstChild
          if (!tekst || tekst.nodeType !== Node.TEXT_NODE) return []
          const s = tekst.textContent ?? ""
          const r = document.createRange()
          const top = (i: number) => {
            r.setStart(tekst, i)
            r.setEnd(tekst, i + 1)
            // De laatste rect: een letter aan het begin van een regel geeft
            // soms ook een lege rect aan het eind van de vorige.
            const rects = [...r.getClientRects()].filter((x) => x.width > 0)
            return Math.round((rects.at(-1) ?? r.getBoundingClientRect()).top)
          }
          const fout: string[] = []
          let vorige = -1
          let laatste = -1
          for (let i = 0; i < s.length; i++) {
            if (s[i] === " " || s[i] === "\u00AD") continue
            const t = top(i)
            // Een nieuwe regel die begint na een letter (geen spatie of zacht streepje ertussen).
            if (vorige >= 0 && t > vorige && laatste === i - 1) fout.push(`${s.replace(/\u00AD/g, "")} bij "${s.slice(0, i).replace(/\u00AD/g, "")}|"`)
            vorige = t
            laatste = i
          }
          return fout
        })
      )
      expect(lelijk, pad).toEqual([])
      // En de titel past: niets steekt buiten zijn kaart.
      const buiten = await page.locator('main li[data-metro-rol] a').evaluateAll((as) =>
        as.filter((a) => {
          const t = a.querySelector('[class*="tekst-h3"]')!
          return t.scrollWidth > t.clientWidth + 1 || t.getBoundingClientRect().right > a.getBoundingClientRect().right
        }).map((a) => a.getAttribute("href"))
      )
      expect(buiten, pad).toEqual([])
    }
    // Het woord zelf blijft heel voor wie leest of zoekt: de toegankelijke naam heeft geen streepje.
    await page.goto(SERVICES_NL)
    await expect(page.getByRole("link", { name: /Onderhoudsabonnement/ }).first()).toBeAttached()
  })
}

test("axe: /nl/services met het metroraster", async ({ page }) => {
  await page.goto(SERVICES_NL, { waitUntil: "networkidle" })
  await page.waitForTimeout(1000)
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .include("main")
    .analyze()
  expect(results.violations, results.violations.map((v) => `${v.id}: ${v.nodes.length}× — ${v.help}`).join("\n")).toEqual([])
})

test("Beplanting: vier plantgroepen op de kaart, alle acht op de dienstpagina", async ({ page }) => {
  await page.goto(SERVICES_NL)
  const tegels = kaart(page, "planting-habitat").locator('[data-element="IcoonVlak"] svg[data-icoon^="plantgroep:"]')
  await expect(tegels).toHaveCount(4)

  await page.goto("/nl/services/planting-habitat")
  const blok = page.locator("[data-plantgroepen]")
  await expect(blok.getByRole("heading", { name: "De acht plantgroepen" })).toBeVisible()
  const items = blok.locator("[data-plantgroep]")
  await expect(items).toHaveCount(8)
  expect(await items.evaluateAll((els) => els.map((e) => e.getAttribute("data-plantgroep")))).toEqual([...PLANTGROEP_VOLGORDE])
  await expect(items).toHaveText(PLANTGROEP_VOLGORDE.map((s) => PLANTGROEP_ICONEN[s].naam.nl))
  await expect(blok.locator("svg[data-icoon]")).toHaveCount(8)

  await page.goto("/services/planting-habitat")
  await expect(page.locator("[data-plantgroep]")).toHaveText(PLANTGROEP_VOLGORDE.map((s) => PLANTGROEP_ICONEN[s].naam.en))
  // Een andere dienst heeft dit blok niet.
  await page.goto("/nl/services/garden-design")
  await expect(page.locator("[data-plantgroepen]")).toHaveCount(0)
})

test("home: drie niveaus met hun tegel en geen Conceptbeeld", async ({ page }) => {
  await page.goto("/nl")
  const rijen = page.locator("#diensten .g-rij")
  await expect(rijen).toHaveCount(3)
  for (const [i, id] of ["ontwerp", "aanleg", "onderhoud"].entries()) {
    await expect(rijen.nth(i)).toHaveAttribute("href", `/nl/services#${id}`)
    const tegel = rijen.nth(i).locator(`svg[data-icoon="dienst:${id}"]`).first()
    await expect(tegel).toHaveAttribute("width", "32")
  }
  await expect(page.locator("#diensten [data-concept-label]")).toHaveCount(0)
  await expect(page.locator("#diensten img")).toHaveCount(0)
})

/**
 * Het contrast tussen de rand van een tegel en de grond ernaast, uit een
 * schermafdruk. De grond is de pixel 4px buiten de rechterrand, de rand
 * de buitenste pixelkolom van de tegel, beide op `hoogte` (standaard de
 * helft: daar ligt bij Ontwerp geen vorm, de grote boog heeft zijn
 * middelpunt linksonder). `binnen` is een pixel zoveel px binnen de rand,
 * waar alleen de grond van de tegel ligt.
 */
async function randContrast(page: Page, tegel: Locator, { hoogte = 0.5, binnen = 6 } = {}) {
  await tegel.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  const b = (await tegel.boundingBox())!
  const shot = (await page.screenshot({ clip: { x: b.x - 8, y: b.y, width: b.width + 16, height: b.height } })).toString("base64")
  return page.evaluate(
    async ({ shot, w, hoogte, binnen: diep }) => {
      const img = new Image()
      img.src = "data:image/png;base64," + shot
      await img.decode()
      const c = document.createElement("canvas")
      c.width = img.width
      c.height = img.height
      const g = c.getContext("2d")!
      g.drawImage(img, 0, 0)
      const dpr = img.width / (w + 16)
      const px = (x: number, y: number) => Array.from(g.getImageData(Math.floor(x * dpr), Math.floor(y * dpr), 1, 1).data.slice(0, 3))
      const lum = (p: number[]) => {
        const [r, gg, bb] = p.map((v) => {
          const s = v / 255
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * r + 0.7152 * gg + 0.0722 * bb
      }
      const ratio = (a: number[], b: number[]) => {
        const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
        return (x + 0.05) / (y + 0.05)
      }
      const midden = (img.height / dpr) * hoogte
      const grond = px(8 + w + 4, midden)
      const rand = px(8 + w - 0.5, midden)
      const binnen = px(8 + w - diep, midden)
      return { rand: ratio(rand, grond), binnen: ratio(binnen, grond) }
    },
    { shot, w: b.width, hoogte, binnen }
  )
}

test("Donker: de Ontwerp-tegel heeft een zichtbare rand (≥ 1,3:1), Licht heeft hem niet nodig", async ({ page, isMobile }) => {
  test.skip(isMobile, "pixels meten op één breedte is genoeg")
  await thema(page, "bluehour")
  await page.goto(SERVICES_NL)
  await expect(page.locator("html")).toHaveClass(/bluehour/)
  const tegel = page.locator('main section#ontwerp svg[data-icoon="dienst:ontwerp"]').first()
  await expect(tegel.locator("[data-donkerrand]")).toBeVisible()
  const m = await randContrast(page, tegel)
  // Zonder rand: antraciet op antraciet.
  expect(m.binnen).toBeLessThan(1.1)
  expect(m.rand).toBeGreaterThanOrEqual(RAND_DREMPEL)

  // Op home, klein (32px), op het vlak van de kaart of de grond.
  await page.goto("/nl")
  const klein = page.locator('#diensten svg[data-icoon="dienst:ontwerp"]').first()
  expect((await randContrast(page, klein)).rand).toBeGreaterThanOrEqual(RAND_DREMPEL)

  // In Licht staat de rand er niet: antraciet op gebroken wit is zichtbaar genoeg.
  await thema(page, "goldenhour")
  await page.goto(SERVICES_NL)
  await expect(page.locator("html")).toHaveClass(/goldenhour/)
  await expect(page.locator('main section#ontwerp svg[data-icoon="dienst:ontwerp"] [data-donkerrand]').first()).toBeHidden()
})

// Eigenaar, 29 sep 2026 ("alle punten zijn prima!"): de Onderhoud-tegel
// kwam in Licht te weinig los van de lichte grond — dezelfde regel als
// Ontwerp in Donker, gespiegeld.
test("Licht: de Onderhoud-tegel heeft een zichtbare rand (≥ 1,3:1), Donker heeft hem niet nodig", async ({ page, isMobile }) => {
  test.skip(isMobile, "pixels meten op één breedte is genoeg")
  await thema(page, "goldenhour")
  await page.goto(SERVICES_NL)
  await expect(page.locator("html")).toHaveClass(/goldenhour/)
  const tegel = page.locator('main section#onderhoud svg[data-icoon="dienst:onderhoud"]').first()
  await expect(tegel.locator("[data-donkerrand]")).toBeVisible()
  // Op 3/4 van de hoogte, 2px binnen de rand: daar ligt bij Onderhoud
  // geen kwart, alleen de grond (#E6D9D0).
  const m = await randContrast(page, tegel, { hoogte: 0.75, binnen: 2 })
  // Zonder rand: oranje-licht op gebroken wit, 1,19:1.
  expect(m.binnen).toBeLessThan(RAND_DREMPEL)
  expect(m.rand).toBeGreaterThanOrEqual(RAND_DREMPEL)

  // Op home, klein (32px).
  await page.goto("/nl")
  const klein = page.locator('#diensten svg[data-icoon="dienst:onderhoud"]').first()
  expect((await randContrast(page, klein, { hoogte: 0.75, binnen: 1 })).rand).toBeGreaterThanOrEqual(RAND_DREMPEL)

  // Het lichte vlak op een dienstkaart krijgt onderaan dezelfde lijn.
  await page.goto(SERVICES_NL)
  const vlak = page.locator('main section#onderhoud [data-element="IcoonVlak"][data-vlak="dienst:onderhoud"]').first()
  await expect(vlak).toHaveCSS("border-bottom-width", "1px")

  // In Donker staat de rand er niet: oranje-licht op antraciet is zichtbaar genoeg.
  // (Het vlak eronder is sinds 29 sep 2026 het oranjepaneel, en dat houdt
  // in beide thema's zijn lijn: zie de test hierboven.)
  await thema(page, "bluehour")
  await page.goto(SERVICES_NL)
  await expect(page.locator("html")).toHaveClass(/bluehour/)
  await expect(page.locator('main section#onderhoud svg[data-icoon="dienst:onderhoud"] [data-donkerrand]').first()).toBeHidden()
})

// Eigenaar, 29 sep 2026 ("alle punten zijn prima!"): het plantgroepvlak
// was in Donker het felste blok op /services. Nu het mospaneel.
test("Beplanting: het plantgroepvlak is het mospaneel — licht in Licht, donker in Donker", async ({ page }) => {
  const vlak = () => kaart(page, "planting-habitat").locator('[data-element="IcoonVlak"][data-vlak="plantgroepen"]')
  for (const [uur, rgb] of [
    ["goldenhour", "rgb(222, 224, 217)"],
    ["bluehour", "rgb(40, 43, 39)"],
  ] as const) {
    await thema(page, uur)
    await page.goto(SERVICES_NL)
    await expect(page.locator("html")).toHaveClass(new RegExp(uur))
    await expect(vlak(), uur).toHaveCSS("background-color", rgb)
    // Onderaan de lijn van 1px: het paneel komt in geen van beide thema's los van de kaart.
    await expect(vlak(), uur).toHaveCSS("border-bottom-width", "1px")
  }
  // In Donker geen fel blok meer: de luminantie van de donkere mostint
  // (#282B27 ≈ 0,024) in plaats van het lichte vlak (#DEE0D9 ≈ 0,74).
  const l = await vlak().evaluate((v) => {
    const [r, g, b] = (getComputedStyle(v).backgroundColor.match(/[\d.]+/g) ?? []).slice(0, 3).map((x) => {
      const s = Number(x) / 255
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  })
  expect(l).toBeLessThan(0.05)
})

// Eigenaar, 29 sep 2026: "de iconen aub niet afronden, dat doet afbreuk
// aan". Een ronde hoek sneed in de kwartcirkels; elke tegel is vierkant.
for (const pad of ["/nl", SERVICES_NL, "/nl/services/planting-habitat"]) {
  test(`${pad}: elke icoontegel is vierkant, nergens afgerond`, async ({ page }) => {
    await page.goto(pad)
    const tegels = page.locator("svg[data-icoon]")
    expect(await tegels.count()).toBeGreaterThan(0)
    const rond = await tegels.evaluateAll((els) =>
      els
        .map((el) => {
          const s = getComputedStyle(el)
          const rx = [...el.querySelectorAll("rect")].some((r) => Number(r.getAttribute("rx") ?? 0) > 0)
          return s.clipPath !== "none" || s.borderRadius !== "0px" || rx ? el.getAttribute("data-icoon") : null
        })
        .filter(Boolean),
    )
    expect(rond, `afgerond: ${rond.join(", ")}`).toEqual([])
  })
}
