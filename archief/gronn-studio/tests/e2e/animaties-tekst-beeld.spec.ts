import { expect, test, type Page } from "@playwright/test"

// "Tekst en beeld": de binnenkomst van de oude site, nu in de V5-elementen
// (eigenaar, 23 sep 2026: "Kunnen we ook de animaties van de oude site in
// de nieuwe verwerken?"). Koppen schuiven regel voor regel uit een masker,
// foto's komen iets te groot en onscherp binnen en zetten zich scherp,
// getallen tellen op. Wat hier vastligt is wat daarbij stuk kan gaan: de
// zin die een schermlezer hoort, de stilstand bij minder beweging, en een
// telling die op precies de echte waarde eindigt.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("gronn-intro", "1")
      localStorage.setItem("theme", "goldenhour")
      localStorage.setItem("gronn-theme-mode", "manual")
    } catch {}
  })
})

/** Elk woord van een kop staat binnen zijn masker, zonder verschuiving. */
async function woordenInRust(page: Page, kop: string) {
  return page.locator(kop).evaluate((h) =>
    [...h.querySelectorAll<HTMLElement>(".g-regel")].every((w) => {
      const m = w.parentElement!.getBoundingClientRect()
      const r = w.getBoundingClientRect()
      const s = getComputedStyle(w)
      return (
        s.translate === "none" &&
        w.getAnimations().length === 0 &&
        r.top >= m.top - 1 &&
        r.bottom <= m.bottom + 1
      )
    })
  )
}

test("koppen: de hele zin via de rol, één keer in de toegankelijkheidsboom", async ({ page }) => {
  await page.goto("/nl")
  const h1 = page.getByRole("heading", { level: 1 })
  await expect(h1).toHaveText("Een vijver en tuin die gezond blijven.")
  // Eén regel, geen losse woorden eronder: de woorden zijn aria-hidden en
  // de zin staat één keer als naam op de kop.
  expect(await h1.ariaSnapshot()).toBe('- heading "Een vijver en tuin die gezond blijven." [level=1]')
  await expect.poll(() => woordenInRust(page, "#opening-kop")).toBe(true)

  // Een kop verderop wacht tot hij in beeld komt, en schuift dan per regel.
  const kop = page.getByRole("heading", { name: "Twee vijvers. Eén samenhangend watersysteem." })
  await expect(kop).toHaveAttribute("data-regels", "wacht")
  await kop.scrollIntoViewIfNeeded()
  await expect(kop).toHaveAttribute("data-regels", "nu")
  await expect.poll(() => woordenInRust(page, "#project-kop")).toBe(true)
  const regels = await kop.evaluate((h) => {
    const woorden = [...h.querySelectorAll<HTMLElement>(".g-regel")]
    const toppen = [...new Set(woorden.map((w) => Math.round(w.getBoundingClientRect().top)))].sort((a, b) => a - b)
    return woorden.map((w) => ({
      r: Number(w.style.getPropertyValue("--r")),
      regel: toppen.indexOf(Math.round(w.getBoundingClientRect().top)),
    }))
  })
  // Woorden op één regel delen hun vertraging; de kop breekt echt af.
  expect(regels.map((w) => w.r)).toEqual(regels.map((w) => w.regel))
  expect(Math.max(...regels.map((w) => w.r))).toBeGreaterThanOrEqual(1)
})

test("beeld: het portret komt onscherp binnen en staat daarna scherp", async ({ page }) => {
  await page.goto("/nl", { waitUntil: "networkidle" })
  // Het LCP-beeld boven de vouw krijgt geen binnenkomst.
  const lcp = page.locator('main img[src*="F10"]').first()
  expect(await lcp.evaluate((i) => i.closest("[data-beeld]"))).toBeNull()
  expect(await lcp.evaluate((i) => getComputedStyle(i).opacity)).toBe("1")

  const laag = page.locator('section[aria-labelledby="nick-kop"] [data-beeld]')
  await expect(laag).toHaveAttribute("data-beeld", "wacht")
  expect(await laag.evaluate((e) => getComputedStyle(e).filter)).toBe("blur(10px)")
  await laag.scrollIntoViewIfNeeded()
  await expect(laag).toHaveAttribute("data-beeld", "nu")
  await expect
    .poll(() =>
      laag.evaluate((e) => {
        const s = getComputedStyle(e)
        return [s.opacity, s.filter, s.scale, e.getAnimations().length].join(" ")
      })
    )
    .toBe("1 none none 0")
})

for (const [naam, zet] of [
  ["systeem (prefers-reduced-motion)", (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })],
  [
    "eigen keuze (gronn-a11y-motion)",
    (page: Page) => page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced")),
  ],
] as const) {
  test(`minder beweging, ${naam}: koppen, beelden en getallen staan meteen stil`, async ({ page }) => {
    await zet(page)
    await page.goto("/nl", { waitUntil: "networkidle" })
    // Ruim na de hydratie: een telling zou nu al op nul zijn gezet.
    await page.waitForTimeout(500)
    const stand = () =>
      page.evaluate(() => ({
        woorden: [...document.querySelectorAll<HTMLElement>(".g-regel")].map((w) => {
          const s = getComputedStyle(w)
          return `${s.translate}|${s.animationName}`
        }),
        beelden: [...document.querySelectorAll<HTMLElement>("[data-beeld]")].map((b) => {
          const s = getComputedStyle(b)
          return `${s.opacity}|${s.filter}|${s.scale}|${s.animationName}`
        }),
        getallen: [...document.querySelectorAll<HTMLElement>("[data-telt]")].map(
          (t) => `${t.dataset.telt}|${t.querySelector("[aria-hidden]")!.textContent === t.querySelector(".sr-only")!.textContent}`
        ),
      }))
    const voor = await stand()
    expect(voor.woorden.length).toBeGreaterThan(10)
    expect(new Set(voor.woorden)).toEqual(new Set(["none|none"]))
    expect(voor.beelden.length).toBeGreaterThan(0)
    expect(new Set(voor.beelden)).toEqual(new Set(["1|none|none|none"]))
    expect(voor.getallen).toEqual(["rust|true", "rust|true", "rust|true", "rust|true"])

    // En ook op het moment dat alles in beeld komt: niets begint alsnog.
    await page.locator("#nick-kop").scrollIntoViewIfNeeded()
    const na = await stand()
    expect(new Set(na.woorden)).toEqual(new Set(["none|none"]))
    expect(new Set(na.beelden)).toEqual(new Set(["1|none|none|none"]))
    expect(na.getallen).toEqual(voor.getallen)
  })
}

test("getallen: echte waarde in de server-HTML, tellen op en eindigen exact", async ({ page, request }) => {
  const WAARDEN = ["2", "5.000", "120", "50"]
  const html = await (await request.get("/nl")).text()
  for (const w of WAARDEN) expect(html).toContain(`>${w}<`)

  await page.goto("/nl", { waitUntil: "networkidle" })
  const cellen = page.locator('section[aria-labelledby="project-kop"] dd [data-telt]')
  await expect(cellen).toHaveCount(4)
  // Onder de vouw: klaargezet op nul, onzichtbaar voor de bezoeker.
  for (let i = 0; i < 4; i++) await expect(cellen.nth(i)).toHaveAttribute("data-telt", "wacht")
  // Een schermlezer hoort ondertussen gewoon de echte waarde.
  expect(await cellen.locator(".sr-only").allTextContents()).toEqual(WAARDEN)

  await cellen.nth(1).evaluate((c) => {
    const zicht = c.querySelector("[aria-hidden]")!
    const log: string[] = [zicht.textContent!]
    ;(window as unknown as { telLog: string[] }).telLog = log
    new MutationObserver(() => log.push(zicht.textContent!)).observe(zicht, {
      childList: true,
      characterData: true,
      subtree: true,
    })
  })
  await cellen.first().scrollIntoViewIfNeeded()
  await expect
    .poll(() => cellen.evaluateAll((cs) => cs.map((c) => c.querySelector("[aria-hidden]")!.textContent)))
    .toEqual(WAARDEN)
  for (let i = 0; i < 4; i++) await expect(cellen.nth(i)).toHaveAttribute("data-telt", "klaar")

  // Echt geteld: van 0 via tussenstanden, oplopend, in NL-notatie, tot 5.000.
  const log = await page.evaluate(() => (window as unknown as { telLog: string[] }).telLog)
  expect(log[0]).toBe("0")
  expect(log.at(-1)).toBe("5.000")
  expect(log.length).toBeGreaterThan(5)
  for (const stap of log) expect(stap).toMatch(/^\d{1,3}(\.\d{3})*$/)
  const getallen = log.map((s) => Number(s.replace(/\./g, "")))
  expect(getallen).toEqual([...getallen].sort((a, b) => a - b))
})
