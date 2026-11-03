import { expect, test, type Page } from "@playwright/test"

// LeesTekst (eigenaar, 28 sep 2026: "licht tekst op na scrollen zodat het
// lijkt alsof je leest"): woord voor woord van gedimd naar vol terwijl de
// alinea door het scherm schuift. Wat hier vastligt: de gedimde stand is
// een overgang en nooit een eindstand, minder beweging en afdrukken zijn
// meteen vol, en de alinea blijft voor schermlezer en klembord één zin.

const MERKBASIS =
  "GRØNN Studio ontwerpt, legt aan en onderhoudt vijvers en tuinen bij particulieren in Stein en omgeving. Planten, water en bodem als één systeem, zodat het gezond blijft met weinig ingrijpen."
const OVER_MIJ_0 =
  "Ik ben Nick Peters. Vader van twee kinderen, hovenier, ecologisch ontwerper en de persoon achter GRØNN Studio."
const MOESTUIN =
  "Moestuinieren: in de eigen tuin en op een vakantiepark in Beringe (België). Zelf kweken houdt de handen in de grond."
// Sinds 3 okt 2026 ook elke tekst-intro van Sectie en PaginaKop (eigenaar:
// "Kunnen we dit effect overal toepassen op tekst?").
const NIVEAUS_INTRO = "Drie niveaus, in de volgorde waarin een tuin ze doorloopt — niet geordend naar wat ik het liefst verkoop."
const CHECKLIST_INTRO = "Wat je kunt nakijken voordat je aan je tuin of vijver begint. Het zijn de dingen waar ik zelf naar kijk als ik langskom."
const WERKWIJZE_INTRO = "Zes stappen, van eerst kijken tot laten groeien. Elke tuin doorloopt ze in zijn eigen tempo."
const MANIFEST =
  "“Ik heb ontzettend genoten van dit eerste project. Van het uitdenken van de waterstromen tot het moment waarop de onderdelen samenkomen. Het vertrouwen om dit te mogen maken was een belangrijke stap in het opbouwen van GRØNN Studio.”"

const PLEKKEN = [
  { pad: "/nl", teksten: [MERKBASIS, NIVEAUS_INTRO, CHECKLIST_INTRO, OVER_MIJ_0] },
  { pad: "/nl/studio", teksten: [MOESTUIN, WERKWIJZE_INTRO, MANIFEST] },
]

function thema(page: Page, naam: "goldenhour" | "bluehour") {
  return page.addInitScript((n) => {
    try {
      sessionStorage.setItem("gronn-intro", "1")
      localStorage.setItem("theme", n)
      localStorage.setItem("gronn-theme-mode", "manual")
    } catch {}
  }, naam)
}

/** Per LeesTekst-alinea: staat elk woord in de kleur van de alinea zelf? */
function stand(page: Page) {
  return page.locator(".g-lees").evaluateAll((alineas) =>
    alineas.map((p) => {
      const kleur = getComputedStyle(p).color
      const bron = p.querySelector<HTMLElement>(".g-lees-bron")!
      const laag = p.querySelector<HTMLElement>(".g-lees-woorden")!
      const woorden = [...p.querySelectorAll<HTMLElement>(".g-lees-w")]
      const beweegt = getComputedStyle(laag).display !== "none"
      return {
        beweegt,
        // Zonder beweging draagt de bron de tekst; met beweging de woorden.
        vol: beweegt
          ? woorden.every((w) => getComputedStyle(w).color === kleur)
          : getComputedStyle(bron).color === kleur,
        gedimd: woorden.filter((w) => getComputedStyle(w).color !== kleur).length,
      }
    })
  )
}

for (const naam of ["goldenhour", "bluehour"] as const) {
  test(`${naam}: gedimd vóór het scrollen, daarna vol op elke plek`, async ({ page }) => {
    // Twee pagina's en een volle scroll per pagina: ruimer dan de standaard 30 s.
    test.setTimeout(90_000)
    await thema(page, naam)
    for (const { pad, teksten } of PLEKKEN) {
      await page.goto(pad)
      const alineas = page.locator(".g-lees")
      await expect(alineas).toHaveCount(teksten.length)

      // Onder de vouw: de woordlaag draait en een woord verderop is gedimd.
      const laatste = alineas.last()
      const voor = await laatste.evaluate((p) => {
        const w = [...p.querySelectorAll<HTMLElement>(".g-lees-w")].at(-1)!
        return { woord: getComputedStyle(w).color, alinea: getComputedStyle(p).color }
      })
      expect(voor.woord, pad).not.toBe(voor.alinea)

      // Helemaal naar beneden: elk woord van elke alinea is vol.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await expect.poll(() => stand(page)).toEqual(teksten.map(() => ({ beweegt: true, vol: true, gedimd: 0 })))

      // En niet pas aan het eind: een alinea die ruim boven het midden
      // staat is al vol.
      await alineas.first().evaluate((p) => window.scrollBy(0, p.getBoundingClientRect().top - innerHeight * 0.3))
      await expect.poll(async () => (await stand(page))[0]).toEqual({ beweegt: true, vol: true, gedimd: 0 })
    }
  })
}

test.describe("minder beweging: alles meteen vol, zonder woordlaag", () => {
  for (const [soort, zet] of [
    ["systeem (prefers-reduced-motion)", (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })],
    ["eigen keuze (gronn-a11y-motion)", (page: Page) => page.addInitScript(() => localStorage.setItem("gronn-a11y-motion", "reduced"))],
  ] as const) {
    test(soort, async ({ page }) => {
      await thema(page, "goldenhour")
      await zet(page)
      for (const { pad, teksten } of PLEKKEN) {
        await page.goto(pad)
        await expect(page.locator(".g-lees")).toHaveCount(teksten.length)
        // Zonder te scrollen, ook de alinea's ver onder de vouw.
        await expect.poll(() => stand(page)).toEqual(teksten.map(() => ({ beweegt: false, vol: true, gedimd: 0 })))
      }
    })
  }
})

test("afdrukken: één gewone alinea in de volle kleur", async ({ page }) => {
  await thema(page, "goldenhour")
  await page.emulateMedia({ media: "print" })
  await page.goto("/nl")
  await expect.poll(() => stand(page)).toEqual(PLEKKEN[0].teksten.map(() => ({ beweegt: false, vol: true, gedimd: 0 })))
})

test("schermlezer, textContent en klembord: de oorspronkelijke zin", async ({ page }) => {
  await thema(page, "goldenhour")
  for (const { pad, teksten } of PLEKKEN) {
    await page.goto(pad)
    const alineas = page.locator(".g-lees")
    expect(await alineas.allTextContents()).toEqual(teksten)
    for (const [i, tekst] of teksten.entries()) {
      const p = alineas.nth(i)
      // Eén alinea in de toegankelijkheidsboom, met de zin één keer.
      // (YAML zet een zin met een dubbele punt tussen aanhalingstekens.)
      const boom = await p.ariaSnapshot()
      expect(boom.split("\n")).toHaveLength(1)
      expect([`- paragraph: ${tekst}`, `- paragraph: "${tekst}"`]).toContain(boom)
      await expect(p.locator(".g-lees-woorden")).toHaveAttribute("aria-hidden", "true")
      // Wat je selecteert en kopieert is de gewone tekst, niet de woordlaag.
      const selectie = await p.evaluate((el) => {
        const r = document.createRange()
        r.selectNodeContents(el)
        const s = getSelection()!
        s.removeAllRanges()
        s.addRange(r)
        return s.toString()
      })
      expect(selectie.trim()).toBe(tekst)
    }
  }
})

test("intro's lezen mee op elke pagina, lopende tekst niet", async ({ page }) => {
  await thema(page, "goldenhour")
  for (const pad of ["/nl/services", "/nl/herfstbeurt", "/nl/contact", "/nl/projects"]) {
    await page.goto(pad)
    // De intro onder de h1 is een LeesTekst.
    await expect(page.locator('[data-element="PaginaKop"] .g-lees, h1 ~ .g-lees').first(), pad).toBeVisible()
  }
  // De lopende tekst van Over mij leest niet mee (te lang om woord voor woord op te lichten).
  await page.goto("/nl/studio")
  await expect(page.locator("[data-over-mij].g-lees")).toHaveCount(0)
})
