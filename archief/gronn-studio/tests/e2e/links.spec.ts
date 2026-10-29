import { expect, test } from "@playwright/test"

import { BUSINESS } from "../../src/lib/business"
import { SERVICE_GROUPS, vanafPrijs } from "../../src/lib/data/services"
import { SERVICES } from "../../src/lib/data/services"
import { LINKS_HOST } from "../../src/lib/locale"

// De bento-linkpagina (eigenaar, 27 sep 2026: "kun je op gronn.studio ook
// een subdomein creëren en een soort bentobox linktree maken?"). Op
// gronn.studio/links en, via src/proxy.ts, op links.gronn.studio.

const TEGELS = ["intro", "kennismaking", "whatsapp", "email", "vijver", "terras", "visitekaartje", "website", "diensten"]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gronn-install-dismissed", "32503680000000"))
})

test("negen tegels, zonder de omlijsting van de site, in het Nederlands", async ({ page }) => {
  const res = await page.goto("/links")
  expect(res?.status()).toBe(200)
  await expect(page.locator("html")).toHaveAttribute("lang", "nl")
  for (const t of TEGELS) await expect(page.locator(`[data-bento="${t}"]`)).toBeVisible()
  // Dit is zelf het menu: geen header, dock, voet of zijbubbels.
  await expect(page.locator("footer")).toHaveCount(0)
  await expect(page.locator("nav[data-nav='dock']")).toHaveCount(0)
  await expect(page.locator("header")).toHaveCount(0)
})

test("de links gaan naar de echte plekken, absoluut naar gronn.studio", async ({ page }) => {
  await page.goto("/links")
  const href = (t: string) => page.locator(`[data-bento="${t}"]`).getAttribute("href")
  expect(await href("kennismaking")).toBe("https://gronn.studio/nl/contact")
  expect(await href("whatsapp")).toBe(BUSINESS.whatsapp)
  await expect(page.locator('[data-bento="whatsapp"]')).toHaveAttribute("target", "_blank")
  expect(await href("email")).toBe(BUSINESS.emailHref)
  expect(await href("vijver")).toBe("https://gronn.studio/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop")
  expect(await href("terras")).toBe("https://gronn.studio/nl/projects/terras-geulle-24-m2-betontegels")
  expect(await href("visitekaartje")).toBe("/contact.vcf")
  await expect(page.locator('[data-bento="visitekaartje"]')).toHaveAttribute("download", "gronn-studio.vcf")
  expect(await href("website")).toBe("https://gronn.studio/nl")
  const diensten = page.locator('[data-bento="diensten"] a')
  await expect(diensten).toHaveCount(3)
  for (const [i, g] of SERVICE_GROUPS.entries()) {
    await expect(diensten.nth(i)).toHaveAttribute("href", `https://gronn.studio/nl/services#${g.kind}`)
  }
})

test("de dienstenprijzen zijn dezelfde als op home (één helper)", async ({ page }) => {
  await page.goto("/links")
  const rijen = page.locator('[data-bento="diensten"] a')
  for (const [i, g] of SERVICE_GROUPS.entries()) {
    const vanaf = vanafPrijs(SERVICES, g.kind)
    await expect(rijen.nth(i)).toContainText(vanaf ? `vanaf € ${vanaf}` : "op maat")
  }
  await page.goto("/nl")
  for (const g of SERVICE_GROUPS) {
    const vanaf = vanafPrijs(SERVICES, g.kind)
    await expect(page.locator("#diensten")).toContainText(vanaf ? `vanaf € ${vanaf}` : "op maat")
  }
})

test("noindex, canonical op het hoofddomein, niet in de sitemap", async ({ page, request }) => {
  await page.goto("/links")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /(?<!no)follow/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://gronn.studio/links")
  const xml = await (await request.get("/sitemap.xml")).text()
  expect(xml).not.toContain("/links<")
})

test("/nl/links gaat naar /links, zonder lus", async ({ request }) => {
  const r = await request.get("/nl/links", { maxRedirects: 0 })
  expect(r.status()).toBe(308)
  expect(new URL(r.headers()["location"]!, "http://x").pathname).toBe("/links")
  const nl = await request.get("/links", { headers: { "accept-language": "nl-NL,nl;q=0.9", accept: "text/html" }, maxRedirects: 0 })
  expect(nl.status()).toBe(200)
})

test.describe("het subdomein", () => {
  test.skip(({ isMobile }) => !!isMobile, "HTTP: één keer is genoeg")

  test("links.gronn.studio/ is de linkpagina, ook voor een Nederlandse browser", async ({ request }) => {
    const r = await request.get("/", {
      headers: { host: LINKS_HOST, "accept-language": "nl-NL,nl;q=0.9", accept: "text/html" },
      maxRedirects: 0,
    })
    expect(r.status()).toBe(200)
    const html = await r.text()
    expect(html).toContain('data-element="LinksPagina"')
    expect(html).toContain('href="https://gronn.studio/links"')
  })

  test("elk ander pagina-pad op het subdomein gaat naar het hoofddomein", async ({ request }) => {
    for (const pad of ["/studio", "/nl/contact", "/projects?x=1"]) {
      const r = await request.get(pad, { headers: { host: LINKS_HOST, accept: "text/html" }, maxRedirects: 0 })
      expect(r.status(), pad).toBe(308)
      expect(r.headers()["location"], pad).toBe(`https://gronn.studio${pad}`)
    }
  })

  test("het visitekaartje werkt ook op het subdomein", async ({ request }) => {
    const r = await request.get("/contact.vcf", { headers: { host: LINKS_HOST } })
    expect(r.status()).toBe(200)
    expect(await r.text()).toContain("BEGIN:VCARD")
  })

  test("de gewone host blijft zoals hij was", async ({ request }) => {
    const r = await request.get("/", { headers: { "accept-language": "nl-NL,nl;q=0.9", accept: "text/html" }, maxRedirects: 0 })
    expect(r.status()).toBe(307)
    expect(r.headers()["location"]).toMatch(/\/nl$/)
  })
})

test("op de telefoon: twee kolommen, niets breder dan het scherm, elke tegel ≥ 44px", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon")
  await page.goto("/links")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const raster = page.locator('[data-element="BentoRaster"]')
  const kolommen = await raster.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length)
  expect(kolommen).toBe(2)
  for (const t of TEGELS) {
    const b = (await page.locator(`[data-bento="${t}"]`).boundingBox())!
    expect(b.height, t).toBeGreaterThanOrEqual(44)
  }
})

test("op desktop: vier kolommen", async ({ page, isMobile }) => {
  test.skip(!!isMobile, "alleen desktop")
  await page.goto("/links")
  const kolommen = await page
    .locator('[data-element="BentoRaster"]')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length)
  expect(kolommen).toBe(4)
})

test("Licht en Donker met dezelfde schakelaar als de site, ook op de telefoon", async ({ page }) => {
  // Eigenaar, 28 sep 2026: "fix ook de link tree met de twee themas,
  // gebruik dezelfde switch als op main". Begin in Licht, handmatig.
  // Alleen bij het eerste laden: een reload moet de keuze van de knop zien.
  await page.addInitScript(() => {
    if (sessionStorage.getItem("links-test-begin")) return
    sessionStorage.setItem("links-test-begin", "1")
    localStorage.setItem("theme", "goldenhour")
    localStorage.setItem("gronn-theme-mode", "manual")
  })
  await page.goto("/links")
  const html = page.locator("html")
  await expect(html).toHaveClass(/goldenhour/)
  const pil = page.locator('[data-element="UrenPil"]')
  await expect(pil).toBeVisible()
  const knop = pil.getByRole("button", { name: "Naar donker" })
  await expect(knop).toBeVisible()
  await expect(page.locator('[data-bento="intro"] img[src*="woordmerk-antraciet"]')).toBeVisible()

  await knop.click()
  await expect(html).toHaveClass(/bluehour/)
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(32, 32, 32)")
  // Het primaire logo op Donker, net als in de kop van de site.
  await expect(page.locator('[data-bento="intro"] img[src*="woordmerk-primair"]')).toBeVisible()
  // De keuze blijft: de klok beslist niet meer.
  expect(await page.evaluate(() => localStorage.getItem("gronn-theme-mode"))).toBe("manual")
  await page.reload()
  await expect(html).toHaveClass(/bluehour/)
  await expect(pil.getByRole("button", { name: "Naar licht" })).toBeVisible()
})

test("de taalvlag: Engels, onthouden in cookie én localStorage, ook na het wissen van de cookie", async ({ page, context }) => {
  // Eigenaar, 28 sep 2026: "ik wil daar ook de language switch, met local
  // storage zoals homepage". Zonder keuze Nederlands.
  await page.goto("/links")
  await expect(page.locator("html")).toHaveAttribute("lang", "nl")
  const pil = page.locator('[data-element="TaalPil"]')
  await expect(pil).toBeVisible()
  await pil.getByRole("button", { name: "Schakel naar Engels" }).click()

  // Zelfde adres, andere taal: geen /en/links.
  await expect(page.locator('[data-bento="diensten"]')).toContainText("Services")
  expect(new URL(page.url()).pathname).toBe("/links")
  await expect(page.locator('[data-bento="kennismaking"]')).toHaveAttribute("href", "https://gronn.studio/contact") // Engels heeft geen prefix
  expect(await page.evaluate(() => localStorage.getItem("gronn-lang"))).toBe("en")
  expect((await context.cookies()).find((c) => c.name === "gronn-lang")?.value).toBe("en")

  // De cookie weg (zoals na een opschoning): localStorage zet hem terug.
  await context.clearCookies({ name: "gronn-lang" })
  await page.reload()
  await expect(page.locator('[data-bento="diensten"]')).toContainText("Services")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  // De projecttitels blijven Nederlands, en zeggen dat.
  await expect(page.locator('[data-bento="vijver"] p[lang="nl"]').first()).toBeVisible()
})
