import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { checklist } from "@/components/gronn/checklist-lijst"

// De kaart "Wat erin staat" naast het aanmeldformulier op home
// (ChecklistBlok in checklist-aanbod.tsx, element PuntenLijst).
//
// Nick, 29 sep 2026: "zet hier een lijst van 21 punten ipv maar 4, kleed
// dat leuk aan". De kaart toont nu ALLE punten van de checklist, uit
// dezelfde `checklist()` als /checklist. Deze spec legt de kaart tegen die
// data: hetzelfde aantal, dezelfde volgorde, dezelfde tekst, doorlopend
// genummerd — zodat een punt dat erbij komt of verandert niet alleen op
// /checklist verschijnt.

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

let aan = false
test.beforeAll(async ({ playwright }, info) => {
  const ctx = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  aan = (await ctx.get("/nl/checklist")).status() === 200
  await ctx.dispose()
})

test.beforeEach(async ({ page }) => {
  test.skip(!aan, "de maillijst staat uit in deze build (nieuwsbrief.spec.ts bewijst dan dat er niets te zien is)")
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

const kaart = (page: Page) => page.locator("section#checklist [data-checklist-inhoud]")

for (const [pad, locale] of [
  ["/nl", "nl"],
  ["/", "en"],
] as const) {
  test(`${pad}: de kaart noemt alle punten van de checklist, in volgorde, genummerd 01–${checklist(locale).reduce((n, o) => n + o.punten.length, 0)}`, async ({ page }) => {
    const onderdelen = checklist(locale)
    const verwacht = onderdelen.flatMap((o) => o.punten.map((p) => p.tekst))
    expect(verwacht.length, "de checklist zelf heeft punten").toBeGreaterThan(4)

    await page.goto(pad)
    const k = kaart(page)
    await k.scrollIntoViewIfNeeded()

    // Het getal in de kop is geteld, niet getikt.
    await expect(k).toContainText(locale === "nl" ? `Wat erin staat · ${verwacht.length} punten` : `What’s in it · ${verwacht.length} points`)

    const punten = k.locator("li[data-punt-nr]")
    await expect(punten).toHaveCount(verwacht.length)
    // textContent: de koppen staan in kapitalen (CSS), de data niet.
    expect(await k.locator("[data-punt-tekst]").allTextContents()).toEqual(verwacht)
    expect(await k.locator("[data-punt-nummer]").allTextContents()).toEqual(
      verwacht.map((_, i) => String(i + 1).padStart(2, "0")),
    )

    // Per onderdeel een kop (h3) met zijn eigen punten, in dezelfde volgorde.
    const groepen = k.locator("[data-puntengroep]")
    await expect(groepen).toHaveCount(onderdelen.length)
    for (const [i, o] of onderdelen.entries()) {
      const g = groepen.nth(i)
      await expect(g.getByRole("heading", { level: 3 })).toHaveAccessibleName(o.kop)
      expect(await g.locator("[data-punt-tekst]").allTextContents()).toEqual(o.punten.map((p) => p.tekst))
    }
  })
}

for (const breedte of [320, 390, 768, 1024, 1440]) {
  test(`${breedte}px: geen horizontale overloop, de kaart past en houdt 16px`, async ({ page }) => {
    await page.setViewportSize({ width: breedte, height: 900 })
    await page.goto("/nl")
    const k = kaart(page)
    await k.scrollIntoViewIfNeeded()
    const maten = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("section#checklist [data-checklist-inhoud]")!
      const r = el.getBoundingClientRect()
      const uit = [...el.querySelectorAll<HTMLElement>("*")].filter((c) => {
        const b = c.getBoundingClientRect()
        if (b.width === 0 && b.height === 0) return false // display: none
        return b.right > r.right + 0.5 || b.left < r.left - 0.5
      })
      return {
        pagina: document.documentElement.scrollWidth,
        venster: document.documentElement.clientWidth,
        rechts: r.right,
        uit: uit.length,
        radius: getComputedStyle(el).borderTopLeftRadius,
      }
    })
    expect(maten.pagina, "pagina scrollt niet opzij").toBeLessThanOrEqual(maten.venster)
    expect(maten.rechts).toBeLessThanOrEqual(maten.venster)
    expect(maten.uit, "niets steekt buiten de kaart").toBe(0)
    expect(maten.radius).toBe("16px")
  })
}

test("minder beweging: elk punt staat meteen volledig in beeld", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/nl")
  const k = kaart(page)
  await k.scrollIntoViewIfNeeded()
  const stand = await k.locator("li[data-punt-nr]").evaluateAll((li) =>
    li.map((el) => ({ opacity: getComputedStyle(el).opacity, animatie: getComputedStyle(el).animationName })),
  )
  expect(stand.length).toBeGreaterThan(0)
  for (const s of stand) {
    expect(s.opacity).toBe("1")
    expect(s.animatie).toBe("none")
  }
})

for (const uur of ["goldenhour", "bluehour"] as const) {
  test(`axe (${uur}): de checklistkaart op home`, async ({ page }) => {
    await page.addInitScript((u) => {
      localStorage.setItem("theme", u)
      localStorage.setItem("gronn-theme-mode", "manual")
    }, uur)
    // Stil, zodat axe de punten in hun eindstand meet en niet halverwege
    // een inschuif.
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await kaart(page).scrollIntoViewIfNeeded()
    const res = await new AxeBuilder({ page }).include("section#checklist").withTags(AXE_TAGS).analyze()
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
  })
}

// Op de telefoon klapt elke groep in, de eerste staat open (eigenaar, 3 okt
// 2026: "Maak dit ook inklapbaar want op mobiel erg langdradig zo"). Vanaf
// sm staat alles open en is de kop gewoon een kop.
test("telefoon: de groepen klappen in, de eerste staat open", async ({ page, isMobile }) => {
  test.skip(!isMobile, "inklappen is er alleen onder sm")
  await page.goto("/nl")
  const k = kaart(page)
  await k.scrollIntoViewIfNeeded()
  const knoppen = k.getByRole("button")
  const groepen = checklist("nl")
  await expect(knoppen).toHaveCount(groepen.length)
  await expect(knoppen.first()).toHaveAttribute("aria-expanded", "true")
  for (let i = 1; i < groepen.length; i++) await expect(knoppen.nth(i)).toHaveAttribute("aria-expanded", "false")

  // Alleen de punten van de eerste groep staan in beeld.
  await expect(k.locator("li[data-punt-nr]:visible")).toHaveCount(groepen[0].punten.length)

  // Een tik op de tweede kop klapt hem open; nog een tik weer dicht. De kop
  // houdt zijn naam, en de knop is minstens 44px hoog.
  const tweede = knoppen.nth(1)
  await expect(page.getByRole("heading", { level: 3, name: groepen[1].kop })).toHaveCount(1)
  expect((await tweede.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await tweede.click()
  await expect(tweede).toHaveAttribute("aria-expanded", "true")
  await expect(k.locator(`[data-puntengroep="${groepen[1].id}"] li[data-punt-nr]`).first()).toBeVisible()
  await tweede.click()
  await expect(tweede).toHaveAttribute("aria-expanded", "false")
  await expect(k.locator(`[data-puntengroep="${groepen[1].id}"] li[data-punt-nr]`).first()).toBeHidden()
})

test("breed scherm: alles open, geen knoppen", async ({ page, isMobile }) => {
  test.skip(isMobile, "de telefoon heeft de knoppen")
  await page.goto("/nl")
  const k = kaart(page)
  await k.scrollIntoViewIfNeeded()
  await expect(k.getByRole("button")).toHaveCount(0)
  const totaal = checklist("nl").reduce((n, o) => n + o.punten.length, 0)
  await expect(k.locator("li[data-punt-nr]:visible")).toHaveCount(totaal)
})
