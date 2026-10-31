import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { DEFAULT_SET } from "../../src/lib/themes"

// De twee knoppen bovenin: Weergave en Kleur.
//
// Ze dragen wat de binnenring van het menuwiel droeg. Verdwijnt hier
// iets, dan verdwijnen de voorkeuren op de telefoon helemaal — en dat
// treft precies de bezoeker die ze nodig heeft. Vandaar dat elke
// instelling hier apart wordt aangeraakt en niet als groep.
//
// De vorm komt 1-op-1 uit V2C: regels met een vinkje voor "één uit een
// rijtje", regels met een zichtbaar schuifje voor "los aan of uit", en
// een "alles terugzetten" die alleen verschijnt als er iets te
// herstellen valt. Die tests staan hier omdat het gimmicks zijn die je
// per ongeluk wegpoetst.

const WEERGAVE = /Weergave/
const KLEUR = /Kleur/

test.describe("de twee hoekknoppen", () => {
  test.skip(({ isMobile }) => !isMobile, "de knoppen zijn telefoonchroom")

  test("staan naast elkaar, halen 44 px, en raken het logo niet", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const weergave = page.getByRole("button", { name: WEERGAVE })
    const kleur = page.getByRole("button", { name: KLEUR })
    const logo = page.getByRole("link", { name: /GRØNN/ }).first()

    const w = (await weergave.boundingBox())!
    const k = (await kleur.boundingBox())!
    const l = (await logo.boundingBox())!

    for (const [naam, box] of [
      ["Weergave", w],
      ["Kleur", k],
    ] as const) {
      expect(box.width, naam).toBeGreaterThanOrEqual(44)
      expect(box.height, naam).toBeGreaterThanOrEqual(44)
    }
    // Naast elkaar, niet over elkaar.
    expect(k.x).toBeGreaterThan(w.x + w.width - 1)
    // En allebei rechts van het merk. Op `left-3` landde de linkerknop
    // precies op het logo; dat is de regressie die dit pint.
    expect(w.x).toBeGreaterThan(l.x + l.width - 1)
  })

  // De alfa van de knop stond hier ooit vastgepind op 1: dekkend, geen
  // glas, precies zoals het conceptproject het doet. Die test is eruit.
  //
  // Niet omdat het argument verkeerd was — een half doorzichtig vlak
  // laat het contrast van zijn icoon afhangen van wat er toevallig
  // onder ligt — maar omdat het het verkeerde DING meet zodra de blur
  // het werk doet. Dat de alfa 1 is, bewijst niets over leesbaarheid;
  // dat het icoon 3:1 haalt boven de zwaarste foto van de site, wel.
  //
  // Die meting staat in `dock-contrast.spec.ts`, in pixels.

  // Het PANEEL is wel dekkend, anders dan de knop. Het hangt in de
  // bovenbalk, die zelf een backdrop-filter heeft; een blur daarbinnen
  // ziet de pagina niet, en op de iPhone schemerde de tekst eronder
  // door het paneel heen (eigenaar, 23 sep 2026: "Panelen slecht
  // leesbaar op mobiel"). Een paneel met tekst krijgt dus alfa 1, in
  // beide Uren.
  for (const thema of ["goldenhour", "bluehour"]) {
    test(`beide panelen zijn dekkend (${thema})`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("theme", t)
          localStorage.setItem("gronn-theme-mode", "manual")
        } catch {}
      }, thema)
      await page.goto("/nl", { waitUntil: "networkidle" })
      for (const naam of [WEERGAVE, KLEUR]) {
        const knop = page.getByRole("button", { name: naam })
        await knop.click()
        const paneel = page.locator(`#${await knop.getAttribute("aria-controls")}`)
        await expect(paneel).toBeVisible()
        const achtergrond = await paneel.evaluate((el) => {
          const s = getComputedStyle(el)
          return { kleur: s.backgroundColor, filter: s.backdropFilter }
        })
        const alfa = achtergrond.kleur.startsWith("rgba")
          ? Number(achtergrond.kleur.split(",")[3].replace(")", ""))
          : achtergrond.kleur.includes("/")
            ? Number(achtergrond.kleur.split("/")[1].replace(")", ""))
            : 1
        expect(alfa, `${achtergrond.kleur}`).toBe(1)
        await page.keyboard.press("Escape")
      }
    })
  }

  test("Escape sluit en geeft de focus terug aan de knop", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const knop = page.getByRole("button", { name: WEERGAVE })
    await knop.click()
    await expect(knop).toHaveAttribute("aria-expanded", "true")

    await page.keyboard.press("Escape")
    await expect(knop).toHaveAttribute("aria-expanded", "false")
    await expect(knop).toBeFocused()
  })

  test("aanwijzen buiten het paneel sluit het", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const knop = page.getByRole("button", { name: WEERGAVE })
    await knop.click()
    await expect(knop).toHaveAttribute("aria-expanded", "true")

    // Net onder het paneel. Het paneel is sinds 25 sep 2026 bijna
    // schermbreed, dus "midden op de pagina" ligt er nu binnen.
    const box = (await page.getByRole("group", { name: WEERGAVE }).boundingBox())!
    await page.mouse.click(30, box.y + box.height + 6)
    await expect(knop).toHaveAttribute("aria-expanded", "false")
  })

  // ── DE TWEE SOORTEN REGEL ─────────────────────────────────────────

  test("tekstgrootte is één uit drie, met een vinkje bij de gekozene", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: WEERGAVE }).click()
    const paneel = page.getByRole("group", { name: WEERGAVE })

    // Drie keuzes, en er staat er altijd precies één aan.
    const keuzes = paneel.locator("button[aria-pressed]")
    await expect(keuzes).toHaveCount(3)
    await expect(paneel.locator("button[aria-pressed='true']")).toHaveCount(1)

    const voor = await page.evaluate(
      () => parseFloat(getComputedStyle(document.documentElement).fontSize)
    )
    await paneel.getByRole("button", { name: /Groter/ }).click()
    await expect(page.locator("html")).toHaveAttribute("data-text", "larger")
    await expect(paneel.locator("button[aria-pressed='true']")).toHaveCount(1)

    const na = await page.evaluate(
      () => parseFloat(getComputedStyle(document.documentElement).fontSize)
    )
    expect(na).toBeCloseTo(voor * 1.25, 1)
  })

  // Een regel waar niets naast staat als hij uit staat, ziet eruit als
  // een regel die niets doet. Het schuifje is in BEIDE standen te zien,
  // en dat is precies wat hier wordt vastgelegd.
  test("de schakelaars zijn echte switches en schrijven hun attribuut", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: WEERGAVE }).click()
    const paneel = page.getByRole("group", { name: WEERGAVE })

    const switches = paneel.getByRole("switch")
    expect(await switches.count()).toBeGreaterThanOrEqual(4)

    const onderstreep = paneel.getByRole("switch", {
      name: /Links onderstrepen/,
    })
    await expect(onderstreep).toHaveAttribute("aria-checked", "false")
    // Het schuifje staat er ook als hij UIT staat.
    await expect(onderstreep.locator("span[aria-hidden]").last()).toBeVisible()

    await onderstreep.click()
    await expect(onderstreep).toHaveAttribute("aria-checked", "true")
    await expect(page.locator("html")).toHaveAttribute("data-underline", "on")

    const contrast = paneel.getByRole("switch", { name: /Extra contrast/ })
    await contrast.click()
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "more")
  })

  test("alles terugzetten verschijnt pas als er iets te herstellen valt", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: WEERGAVE }).click()
    const paneel = page.getByRole("group", { name: WEERGAVE })
    const herstel = paneel.getByRole("button", { name: /terugzetten/i })

    await expect(herstel).toHaveCount(0)

    // `\b` na "Groot" sluit "Groter" uit: tussen "t" en "e" staat geen
    // woordgrens. De naam draagt ook de hint, dus een anker op het eind
    // werkt hier niet.
    await paneel.getByRole("button", { name: /^Groot\b/ }).click()
    await paneel.getByRole("switch", { name: /Links onderstrepen/ }).click()
    await expect(herstel).toBeVisible()

    await herstel.click()
    // Alles weg van <html>, en de knop verdwijnt weer.
    for (const attr of ["data-text", "data-underline", "data-contrast", "data-motion"]) {
      await expect(page.locator("html")).not.toHaveAttribute(attr, /.*/)
    }
    await expect(herstel).toHaveCount(0)
  })

  // ── HET KLEURPANEEL ───────────────────────────────────────────────

  test("automatisch plus tien paletten, en kiezen stopt de klok", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: KLEUR }).click()
    const paneel = page.getByRole("group", { name: KLEUR })

    // Alleen de paletregels tellen: `[data-staal]` is het staaltje, en de
    // taalschakelaar onderin draagt óók `aria-pressed` zonder er een te
    // hebben.
    const aantal = 1 + DEFAULT_SET.options.length
    await expect(
      paneel.locator("button[aria-pressed]:has([data-staal])")
    ).toHaveCount(aantal)

    await paneel.getByRole("button", { name: /^(Donker|Dark)/ }).click()
    await expect(page.locator("html")).toHaveClass(/bluehour/)
    // Een palet kiezen is een overrule: de klok stopt met sturen.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("gronn-theme-mode")))
      .toBe("manual")

    // En automatisch is een weg terug, geen doodlopend pad.
    await paneel.getByRole("button", { name: /Automatisch|Automatic/ }).click()
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("gronn-theme-mode")))
      .toBe("auto")
  })

  test("geen enkele regel in de kiezer wordt afgekapt op 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 780 })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: KLEUR }).click()
    const paneel = page.getByRole("group", { name: KLEUR })
    await expect(paneel).toBeVisible()

    const afgekapt = await paneel.evaluate((el) => {
      const uit: string[] = []
      for (const span of el.querySelectorAll<HTMLElement>("button span span")) {
        if (span.scrollWidth > span.clientWidth + 1) uit.push(span.textContent ?? "?")
      }
      return uit
    })
    expect(afgekapt, afgekapt.join(", ")).toEqual([])

    // En het paneel zelf blijft binnen beeld.
    const box = (await paneel.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320.5)
  })

  // De taal op de telefoon: twee vlaggen in één schakelaar, dezelfde
  // ronde vlaggen als de knop op desktop (eigenaar, 23 sep 2026: "op
  // mobiel twee vlaggen als op desktop met een toggle"). De naam blijft
  // de volledige taal — een vlag is geen taal, en "EN" voorgelezen is
  // twee letters.
  test("de taal is een schakelaar met twee vlaggen, en blijft op dezelfde pagina", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/nl/projects", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: KLEUR }).click()
    const paneel = page.getByRole("group", { name: KLEUR })
    const taal = paneel.getByRole("group", { name: "Taal" })
    await expect(taal).toBeVisible()

    const en = taal.getByRole("button", { name: "English", exact: true })
    const nl = taal.getByRole("button", { name: "Nederlands", exact: true })
    await expect(nl).toHaveAttribute("aria-pressed", "true")
    await expect(en).toHaveAttribute("aria-pressed", "false")

    const vakken = await taal.boundingBox()
    for (const [code, knop] of [
      ["EN", en],
      ["NL", nl],
    ] as const) {
      // De vlag van desktop, niet een nieuwe tekening: rond en
      // bijgesneden tot hetzelfde vierkant.
      const vlag = knop.locator("svg")
      await expect(vlag).toHaveCount(1)
      await expect(vlag).toHaveAttribute("viewBox", "4 0 16 16")
      await expect(knop).toHaveText(code, { ignoreCase: true })

      const box = (await knop.boundingBox())!
      expect(box.height, code).toBeGreaterThanOrEqual(44)
      // Twee helften van één schakelaar, samen over de breedte.
      expect(box.width, code).toBeGreaterThan(vakken!.width / 2 - 8)
    }

    // Helemaal rond, zoals de rest van de bediening.
    const radius = await taal.evaluate((el) =>
      parseFloat(getComputedStyle(el).borderTopLeftRadius)
    )
    expect(radius).toBeGreaterThanOrEqual(vakken!.height / 2)

    // Een tik is een route: dezelfde pagina, in het Engels.
    await en.click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page).not.toHaveURL(/\/nl\//)
  })

  // ── DE VERDUBBELING DIE EERLIJK MOET BLIJVEN ──────────────────────
  //
  // De staaltjes staan hardgecodeerd in `themes.ts`, en dat is met
  // reden: de kiezer tekent ze vóór de hydratie, wanneer de custom
  // properties van een palet dat nog niet is toegepast niet te lezen
  // zijn. Een verdubbeling die niemand controleert drijft weg — dus
  // wordt ze hier tegen de echte tokenblokken gelegd.
  test("elk staaltje klopt met het echte tokenblok", async () => {
    const css = readFileSync(
      join(process.cwd(), "src/app/globals.css"),
      "utf8"
    )

    const fouten: string[] = []
    for (const optie of DEFAULT_SET.options) {
      const blok = css.match(
        new RegExp(`\\n\\.${optie.name}\\s*\\{([\\s\\S]*?)\\n\\}`)
      )
      if (!blok) {
        // `light` is de :root-standaard en heeft geen eigen klasse.
        if (optie.name === "light") continue
        fouten.push(`${optie.name}: geen tokenblok in globals.css`)
        continue
      }
      const lees = (naam: string) =>
        blok[1].match(new RegExp(`--${naam}:\\s*([^;]+);`))?.[1].trim()

      const bg = lees("background")
      const dot = lees("accent")
      if (bg && bg.toLowerCase() !== optie.bg.toLowerCase()) {
        fouten.push(`${optie.name}: staal bg ${optie.bg} ≠ token ${bg}`)
      }
      if (dot && dot.toLowerCase() !== optie.dot.toLowerCase()) {
        fouten.push(`${optie.name}: staal dot ${optie.dot} ≠ token ${dot}`)
      }
    }
    expect(fouten, fouten.join("\n")).toEqual([])
  })

  // ── GEEN TOEGANKELIJKHEIDSOVERLAY ─────────────────────────────────
  //
  // Zo'n overlay doet precies één ding goed: het lijkt alsof er iets
  // gedaan is. Deze test bestaat zodat er nooit "even snel" een
  // voorleesknop bij komt.
  test("er zit geen toegankelijkheidsoverlay in het paneel", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: WEERGAVE }).click()
    const tekst = (
      await page.getByRole("group", { name: WEERGAVE }).innerText()
    ).toLowerCase()
    for (const verboden of ["voorlez", "dyslexie", "grote cursor", "screen reader mode"]) {
      expect(tekst, verboden).not.toContain(verboden)
    }
  })
})
