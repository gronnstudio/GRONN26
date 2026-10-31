import { expect, test } from "@playwright/test"
import { BUSINESS } from "../../src/lib/business"

// The behaviours that have actually regressed (or nearly) in this
// repo's history, pinned so they cannot regress silently again.

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile)

  test("skip link is first focusable and moves focus to #main", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.keyboard.press("Tab")
    await expect(page.locator("a[href='#main']")).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("#main")).toBeFocused()
  })

  // The full-screen curtain is gone: both bar variants replaced it, and
  // the hamburger with it. What survives is the rule the curtain taught
  // us — a panel in the bar is a DISCLOSURE, so focus must be able to
  // leave it. A trap here would be the bug.
  test("bar panel: disclosure, not a dialog — Escape restores", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    // No curtain, no hamburger — asserted, not assumed.
    await expect(page.locator("#site-menu")).toHaveCount(0)

    const trigger = page.locator("button[aria-controls='bar-panel-services']")
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await trigger.focus()
    await page.keyboard.press("Enter")
    await expect(page.locator("#bar-panel-services")).toBeVisible()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")

    await page.keyboard.press("Escape")
    await expect(page.locator("#bar-panel-services")).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("bar: only ever one panel open at a time", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.locator("button[aria-controls='bar-panel-services']").click()
    await expect(page.locator("#bar-panel-services")).toBeVisible()
    await page.locator("button[aria-controls='bar-panel-studio']").click()
    // The whole point of one controller instead of five: the first must
    // be gone, not merely on its way out.
    await expect(page.locator("#bar-panel-services")).toHaveCount(0)
    await expect(page.locator("#bar-panel-studio")).toBeVisible()
  })

  test("time-of-day boot lands on an Hours default unless overridden", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const cls = await page.evaluate(() => document.documentElement.className)
    expect(cls).toMatch(/goldenhour|bluehour/)
  })
})

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile)

  // ── DE TELEFOONPIL ────────────────────────────────────────────────
  //
  // Dit blok droeg de gedragstests van het menuwiel: sectievellen die
  // opengingen, acht slots die ronddraaiden, een balk die tot twee
  // hoeken inklapte. Dat is er allemaal uit. Wat ervoor in de plaats
  // komt is kleiner omdat het ding zelf kleiner is — vijf links die
  // navigeren, en niets dat onderweg van vorm verandert.
  //
  // Wat NIET mee terug mocht: de sectievellen. De dock navigeert
  // rechtstreeks naar /services, en die pagina draagt de elf diensten
  // zelf. Eén lijst in plaats van twee.

  const DOCK = "nav[data-nav='dock']"
  // De dock draagt twee lagen over elkaar: het menu en, tijdens het
  // lezen, drie losse cirkels. Een selector op de `nav` zelf vindt ze
  // allebei — dus wordt er altijd op de laag gemikt die bedoeld is.
  const RIJ = `${DOCK} [data-dock-row]`
  const CIRKELS = `${DOCK} [data-dock-compact]`

  test("de dock draagt vijf vakken, elk met een zichtbaar label dat zijn naam is", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const nav = page.locator(RIJ)
    await expect(nav).toBeVisible()

    // Vijf links, en GEEN knop. Het open menu is een menu: vijf
    // bestemmingen en niets anders. De pijl omhoog reed hier ooit mee
    // als zesde vak — dat is eruit, want hij navigeert nergens heen en
    // hij hoort bij de ingeklapte stand.
    await expect(nav.locator("a")).toHaveCount(5)
    await expect(nav.locator("button")).toHaveCount(0)

    for (const naam of [
      "Home",
      "Diensten",
      "Projecten",
      "Studio",
      "Contact",
    ]) {
      await expect(nav.getByRole("link", { name: naam, exact: true })).toBeVisible()
    }

    // Eigenaar, 25 sep 2026: "Wellicht een minimaal klein label onder
    // het icoon om aan te geven wat het doet?" Het zichtbare label IS de
    // naam: geen `aria-label` ernaast, dus niets dubbel voorgelezen.
    await expect(nav.locator("[aria-label]")).toHaveCount(0)
    await expect(nav.locator("[data-dock-label]")).toHaveText([
      "Home",
      "Diensten",
      "Projecten",
      "Studio",
      "Contact",
    ])
  })

  // De labels in beide standen: zichtbaar, binnen hun vak, nooit
  // afgekapt of overlopend, en op 125 % tekst groeit de balk niet.
  for (const breedte of [320, 375, 390, 430]) {
    test(`de labels passen in hun vak, in beide standen (${breedte}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breedte, height: 812 })
      await page.goto("/nl", { waitUntil: "networkidle" })
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(1200)

      const labels = (laag: string) =>
        page.locator(laag).evaluate((pil) =>
          [...pil.querySelectorAll("a, button")].map((el) => {
            const l = el.querySelector("[data-dock-label]") as HTMLElement
            const v = el.getBoundingClientRect()
            const b = l.getBoundingClientRect()
            const i = el.querySelector("svg")!.getBoundingClientRect()
            return {
              naam: l.textContent,
              zichtbaar: b.width > 0 && getComputedStyle(l).visibility !== "hidden",
              binnen:
                b.left >= v.left - 0.5 && b.right <= v.right + 0.5 &&
                b.top >= v.top - 0.5 && b.bottom <= v.bottom + 0.5,
              afgekapt: l.scrollWidth > l.clientWidth,
              onderIcoon: b.top >= i.bottom - 0.5,
              // Icoon + label samen gecentreerd in het vak.
              scheef: Math.abs((i.top - v.top) - (v.bottom - b.bottom)),
            }
          })
        )

      const check = (m: Awaited<ReturnType<typeof labels>>, namen: string[]) => {
        expect(m.map((x) => x.naam)).toEqual(namen)
        for (const x of m) {
          expect(x.zichtbaar, `${x.naam} zichtbaar`).toBe(true)
          expect(x.binnen, `${x.naam} binnen zijn vak`).toBe(true)
          expect(x.afgekapt, `${x.naam} afgekapt op ${breedte}px`).toBe(false)
          expect(x.onderIcoon, `${x.naam} onder het icoon`).toBe(true)
          expect(x.scheef, `${x.naam} gecentreerd`).toBeLessThanOrEqual(1.5)
        }
      }

      await expect(page.locator(RIJ)).toHaveCSS("opacity", "1")
      check(await labels(RIJ), ["Home", "Diensten", "Projecten", "Studio", "Contact"])

      for (let i = 0; i < 14; i++) {
        await page.mouse.wheel(0, 180)
        await page.waitForTimeout(60)
      }
      await page.waitForTimeout(700)
      await expect(page.locator(CIRKELS)).toHaveCSS("opacity", "1")
      await expect(page.locator(CIRKELS).locator("[aria-label]")).toHaveCount(0)
      check(await labels(CIRKELS), ["Home", "Zoeken", "WhatsApp", "Delen", "Omhoog"])
    })
  }

  test("elk tikdoel haalt 44 bij 44", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const vakken = page.locator(`${RIJ} a, ${RIJ} button`)
    const n = await vakken.count()
    expect(n).toBe(5)
    for (let i = 0; i < n; i++) {
      const box = await vakken.nth(i).boundingBox()
      const naam = (await vakken.nth(i).textContent())?.trim() || "?"
      expect(box, naam).not.toBeNull()
      expect(box!.width, naam).toBeGreaterThanOrEqual(44)
      expect(box!.height, naam).toBeGreaterThanOrEqual(44)
    }
  })

  // De meting waar dit soort menu's op stukloopt, en waar het concept
  // waar deze pil vandaan komt twee keer op is gevallen: een `absolute`
  // kind rekent zijn procenten over de PADDINGBOX, een flexkind over de
  // CONTENTBOX. Die twee schelen precies de padding van de balk, dus ze
  // vallen in het midden samen en lopen naar de randen uit elkaar —
  // gemeten −4 tot +4px. Eén vak controleren bewijst daarom niets; alle
  // vijf wel.
  for (const [route, naam] of [
    ["/nl", "Home"],
    ["/nl/services", "Diensten"],
    ["/nl/projects", "Projecten"],
    ["/nl/studio", "Studio"],
    ["/nl/contact", "Contact"],
  ] as const) {
    test(`het groen staat precies onder ${naam}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" })
      const nav = page.locator(DOCK)
      await expect(nav.locator("a[aria-current='page']")).toHaveCount(1)

      const afwijking = await page.evaluate((sel) => {
        const nav = document.querySelector(sel)!
        const cap = nav.querySelector("[data-dock='capsule']")!
        const icoon = nav.querySelector("a[aria-current='page'] svg")!
        const mid = (e: Element) => {
          const b = e.getBoundingClientRect()
          return b.x + b.width / 2
        }
        return Math.abs(mid(icoon) - mid(cap))
      }, DOCK)

      expect(afwijking).toBeLessThan(0.5)
    })
  }

  test("een detailpagina houdt zijn eigen sectie actief", async ({ page }) => {
    for (const [route, naam] of [
      ["/nl/services/leaf-net", "Diensten"],
      // Werkwijze en journaal bestaan sinds V5 niet meer; het echte
      // project is de detailpagina onder Projecten.
      ["/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop", "Projecten"],
    ] as const) {
      await page.goto(route, { waitUntil: "networkidle" })
      const actief = page.locator(`${DOCK} a[aria-current='page']`)
      await expect(actief).toHaveCount(1)
      await expect(actief).toHaveText(naam)
    }
  })

  // Een pagina die onder geen van de vijf valt licht NIETS op. Dat is
  // beter dan een willekeurig vak laten branden, en het is precies wat
  // er misgaat als je `index` niet op −1 laat staan.
  test("een juridische pagina laat de capsule verdwijnen", async ({ page }) => {
    await page.goto("/nl/privacy", { waitUntil: "networkidle" })
    await expect(page.locator(`${DOCK} a[aria-current='page']`)).toHaveCount(0)
    await expect(page.locator(`${DOCK} [data-dock='capsule']`)).toHaveCSS(
      "opacity",
      "0"
    )
  })

  // ── WAT ER GEBEURT ALS JE GAAT LEZEN ──────────────────────────────
  //
  // Vier rondes. De dock werd eerst smaller (384 → 288, afgewezen), toen
  // drie kleine cirkels van 44, toen één pil met drie knoppen. Wat de
  // eigenaar wil (23 sep 2026): "gewoon 3 cirkels maar wel even groot als
  // de uitgeklapte versie" — drie losse cirkels, elk zo hoog als de balk,
  // over zijn volle breedte — en de bovenbalk blijft staan.
  //
  // Het wisselen hangt nog steeds aan één store (`scroll-rest.ts`).
  test("lezen laat één pil met vijf knoppen en een komeet staan, en de bovenbalk blijft", async ({
    page,
  }) => {
    // 375 en niet de 412 van de Pixel: daar valt de maximumbreedte van
    // 384 toevallig samen met scherm-min-marges, en een leesstand die
    // op een iPhone rechts wegliep, slaagde hier gewoon.
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(1200)

    const rij = page.locator(RIJ)
    const boven = page.locator("[data-nav='topbar']")
    const cirkels = page.locator(CIRKELS)

    await expect(rij).toHaveCSS("opacity", "1")
    await expect(boven).toHaveCSS("opacity", "1")
    const vol = (await rij.boundingBox())!

    for (let i = 0; i < 14; i++) {
      await page.mouse.wheel(0, 180)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(700)

    // De volle rij is weg en ONBEREIKBAAR — niet alleen onzichtbaar.
    // Een balk op `opacity-0` blijft met Tab te bereiken.
    await expect(rij).toHaveCSS("opacity", "0")
    await expect(rij).toHaveAttribute("inert", "")

    // De bovenbalk blijft staan en blijft bereikbaar.
    await expect(boven).toHaveCSS("opacity", "1")
    await expect(boven).not.toHaveAttribute("inert", "")
    await expect(boven.getByRole("link", { name: /GRØNN/ })).toBeVisible()

    // Eén pil (eigenaar, 25 sep 2026: "maak dat ook maar een dock met
    // een comet"): even hoog en breed als de volle balk, met de komeet,
    // en daarin vijf knoppen van 44 hoog en een kolom breed (sinds de
    // labels: "WHATSAPP" past niet in 44).
    await expect(cirkels).toHaveCSS("opacity", "1")
    const pil = (await cirkels.boundingBox())!
    expect(Math.abs(pil.height - vol.height), "pil hoogte").toBeLessThanOrEqual(1)
    expect(Math.abs(pil.width - vol.width), "pil breedte").toBeLessThanOrEqual(1)
    await expect(cirkels.locator("[data-komeet]")).toHaveCount(1)
    const knoppen = page.locator(`${CIRKELS} a, ${CIRKELS} button`)
    await expect(knoppen).toHaveCount(5)
    const namen: string[] = []
    const vakken = []
    for (let i = 0; i < 5; i++) {
      const el = knoppen.nth(i)
      namen.push((await el.textContent())?.trim() || "?")
      const box = (await el.boundingBox())!
      expect(Math.abs(box.height - 44), `knop ${i} hoogte`).toBeLessThanOrEqual(0.5)
      expect(box.width, `knop ${i} breedte`).toBeGreaterThanOrEqual(44)
      vakken.push(box)
    }
    expect(namen).toEqual(["Home", "Zoeken", "WhatsApp", "Delen", "Omhoog"])
    expect(vakken[0].x).toBeGreaterThanOrEqual(vol.x - 1)
    expect(vakken[4].x + vakken[4].width).toBeLessThanOrEqual(vol.x + vol.width + 1)
    expect(vakken[4].x + vakken[4].width).toBeLessThanOrEqual(375 - 12 + 1)

    // Omhoog vegen brengt de volle rij terug.
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, -200)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(700)
    await expect(rij).toHaveCSS("opacity", "1")
    await expect(boven).toHaveCSS("opacity", "1")
    await expect(cirkels).toHaveCSS("opacity", "0")
  })

  // Eigenaar, 24 sep 2026, bij twee schermafdrukken: "Icons dont align
  // on vertical axis." De cirkels stonden tegen de randen van de pil,
  // de vakken op een raster daarbinnen; op 390px stond Home 13px links
  // van het huisje en de pijl 13px rechts van Contact, en bij het
  // wisselen sprongen de iconen opzij. Het midden klopte toevallig wel,
  // dus één cirkel meten bewijst niets — alle drie, op vier breedtes,
  // en 320 omdat daar een cirkel (58) breder is dan zijn kolom (56,4).
  for (const breedte of [320, 375, 390, 430]) {
    test(`vijf knoppen in één pil, elk op het midden van zijn vak (${breedte}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breedte, height: 812 })
      await page.goto("/nl", { waitUntil: "networkidle" })
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(1200)

      const middens = (selector: string) =>
        page.locator(selector).evaluateAll((els) =>
          els.map((el) => {
            const r = el.querySelector("svg")!.getBoundingClientRect()
            return r.x + r.width / 2
          })
        )

      await expect(page.locator(RIJ)).toHaveCSS("opacity", "1")
      const vol = await middens(`${RIJ} a`)
      expect(vol).toHaveLength(5)

      for (let i = 0; i < 14; i++) {
        await page.mouse.wheel(0, 180)
        await page.waitForTimeout(60)
      }
      await page.waitForTimeout(700)
      await expect(page.locator(CIRKELS)).toHaveCSS("opacity", "1")

      const knoppen = `${CIRKELS} a, ${CIRKELS} button`
      const rust = await middens(knoppen)
      expect(rust).toHaveLength(5)

      const regels = `vol ${vol.map((x) => x.toFixed(2)).join(" ")} · rust ${rust
        .map((x) => x.toFixed(2))
        .join(" ")}`
      expect(Math.abs(rust[0] - vol[0]), `Home · ${regels}`).toBeLessThanOrEqual(1)
      const namen = ["Home", "Zoeken", "WhatsApp", "Delen", "Omhoog"]
      for (const [i, naam] of namen.entries()) {
        expect(Math.abs(rust[i] - vol[i]), `${naam} · ${regels}`).toBeLessThanOrEqual(1)
      }

      // Even groot als de uitgeklapte balk, binnen het scherm, en niet
      // over elkaar.
      const vakken = await page.locator(knoppen).evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect()
          return { x: r.x, b: r.width, h: r.height }
        })
      )
      // 44 hoog, minstens 44 breed, binnen het scherm, nooit over elkaar.
      for (const [i, v] of vakken.entries()) {
        expect(v.b, `knop ${i} breedte`).toBeGreaterThanOrEqual(44)
        expect(Math.abs(v.h - 44), `knop ${i} hoogte`).toBeLessThanOrEqual(0.5)
        expect(v.x, `knop ${i} links`).toBeGreaterThanOrEqual(0)
        expect(v.x + v.b, `knop ${i} rechts`).toBeLessThanOrEqual(breedte)
      }
      for (let i = 1; i < vakken.length; i++) {
        expect(
          vakken[i].x - (vakken[i - 1].x + vakken[i - 1].b),
          `lucht tussen knop ${i - 1} en ${i}`
        ).toBeGreaterThanOrEqual(0)
      }
      // Eén pil, binnen het scherm.
      const pil = (await page.locator(CIRKELS).boundingBox())!
      expect(pil.x).toBeGreaterThanOrEqual(0)
      expect(pil.x + pil.width).toBeLessThanOrEqual(breedte)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(breedte)
    })
  }

  // Eigenaar, 23 sep 2026, bij een schermafdruk van de leesstand:
  // "Iconen hebben niet dezelfde grootte". Het waren er drie maten:
  // 20 bovenin, 22 voor Home en Zoeken, 26 voor de pijl en de vakken.
  // Nu is het één (`ICON_SIZE`), en deze test meet elk icoon van het
  // telefoonchroom in beide standen.
  test("elk icoon in het telefoonchroom is even groot", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(1200)

    const maten = async (selector: string) =>
      page.locator(selector).evaluateAll((els) =>
        els.map((el) => {
          const r = el.querySelector("svg")!.getBoundingClientRect()
          return { naam: el.getAttribute("aria-label") ?? el.textContent ?? "?", b: Math.round(r.width), h: Math.round(r.height) }
        })
      )

    const boven = await maten("[data-nav='topbar'] button")
    const vakken = await maten(`${RIJ} a`)

    for (let i = 0; i < 14; i++) {
      await page.mouse.wheel(0, 180)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(700)
    await expect(page.locator(CIRKELS)).toHaveCSS("opacity", "1")
    const cirkels = await maten(`${CIRKELS} a, ${CIRKELS} button`)

    const alles = [...boven, ...vakken, ...cirkels]
    expect(boven).toHaveLength(2)
    expect(vakken).toHaveLength(5)
    expect(cirkels).toHaveLength(5)
    const regels = alles.map((m) => `${m.naam}: ${m.b}×${m.h}`).join("\n")
    for (const m of alles) {
      expect(m.b, regels).toBe(24)
      expect(m.h, regels).toBe(24)
    }
  })

  // Zoeken was er op de telefoon helemaal niet: de trigger zat achter
  // ⌘K in de desktopbalk. Dit is het eerste zoekoppervlak dat een
  // telefoon heeft, en daarom staat er een test op dát het opengaat.
  test("de zoekcirkel opent het zoekpaneel", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(1200)
    for (let i = 0; i < 14; i++) {
      await page.mouse.wheel(0, 180)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(700)

    await page.locator(CIRKELS).getByRole("button", { name: "Zoeken" }).click()
    await expect(page.getByRole("dialog", { name: "Zoek op deze site" })).toBeVisible()
  })

  // Delen: eigenaar, 25 sep 2026 — als app is er geen deelknop van de
  // browser. Drie gevallen: de native deelsheet, het klembord als die
  // ontbreekt, en een tik die de balk NIET wekt.
  const naarRust = async (page: import("@playwright/test").Page) => {
    await page.waitForTimeout(1200)
    for (let i = 0; i < 14; i++) {
      await page.mouse.wheel(0, 180)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(700)
    await expect(page.locator(CIRKELS)).toHaveCSS("opacity", "1")
  }

  test("de deelcirkel roept navigator.share aan", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __gedeeld: unknown[] }
      w.__gedeeld = []
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data: unknown) => {
          w.__gedeeld.push(data)
        },
      })
    })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await naarRust(page)
    await page.locator(CIRKELS).getByRole("button", { name: "Delen" }).click()
    const gedeeld = await page.evaluate(
      () => (window as unknown as { __gedeeld: { title: string; url: string }[] }).__gedeeld
    )
    expect(gedeeld).toHaveLength(1)
    expect(gedeeld[0].url).toBe(page.url())
    expect(gedeeld[0].title).toBe(await page.title())
  })

  test("zonder navigator.share gaat de link naar het klembord", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __klembord: string[] }
      w.__klembord = []
      Object.defineProperty(navigator, "share", { configurable: true, value: undefined })
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (tekst: string) => {
            w.__klembord.push(tekst)
          },
        },
      })
    })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await naarRust(page)
    await page.locator(CIRKELS).getByRole("button", { name: "Delen" }).click()
    const status = page.locator(`${CIRKELS} [role='status']`)
    await expect(status).toHaveText("Link gekopieerd")
    await expect(status).toHaveAttribute("aria-live", "polite")
    expect(
      await page.evaluate(() => (window as unknown as { __klembord: string[] }).__klembord)
    ).toEqual([page.url()])
  })

  test("de WhatsApp-cirkel wijst naar business.whatsapp", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await naarRust(page)
    const wa = page.locator(CIRKELS).getByRole("link", { name: "WhatsApp" })
    await expect(wa).toHaveAttribute("href", BUSINESS.whatsapp)
    await expect(wa).toHaveAttribute("target", "_blank")
    await expect(wa).toHaveAttribute("rel", /noopener/)
  })

  test("een tik op Delen wekt de balk niet", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async () => {},
      })
    })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await naarRust(page)
    await page.locator(CIRKELS).getByRole("button", { name: "Delen" }).click()
    await page.waitForTimeout(500)
    await expect(page.locator(CIRKELS)).toHaveCSS("opacity", "1")
    await expect(page.locator(RIJ)).toHaveCSS("opacity", "0")
  })

  // De capsule mag nooit hoger dan breed worden — dat is het staande ei
  // waar de smalle stand op stukging voordat er een ondergrens van
  // 2.75rem in kwam.
  test("de capsule is nooit een staand ei", async ({ page }) => {
    await page.goto("/nl/projects", { waitUntil: "networkidle" })
    const meet = async () =>
      await page.evaluate((sel) => {
        const nav = document.querySelector(sel)!
        const cap = nav.querySelector("[data-dock='capsule']")!.getBoundingClientRect()
        const vak = nav.querySelector("[data-dock-row] a[aria-current='page']")!.getBoundingClientRect()
        return { capW: cap.width, capH: cap.height, vakW: vak.width }
      }, DOCK)

    const vol = await meet()
    expect(vol.capW).toBeGreaterThanOrEqual(vol.capH)
    expect(vol.capW).toBeLessThanOrEqual(vol.vakW + 0.5)

    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 180)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(600)

    const rust = await meet()
    expect(rust.capW).toBeGreaterThanOrEqual(rust.capH)
    expect(rust.capW).toBeLessThanOrEqual(rust.vakW + 0.5)
  })

  // ── DE TWEE HOEKKNOPPEN ───────────────────────────────────────────
  //
  // Ze dragen wat de binnenring van het wiel droeg. Verdwijnt er hier
  // iets, dan verdwijnen de voorkeuren op de telefoon helemaal — en dat
  // treft precies de bezoeker die ze nodig heeft.

  test("de twee knoppen staan naast elkaar, groot genoeg, en raken het logo niet", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const weergave = page.getByRole("button", { name: /Weergave/ })
    const kleur = page.getByRole("button", { name: /Kleur/ })
    const logo = page.getByRole("link", { name: /GRØNN/ }).first()

    const w = (await weergave.boundingBox())!
    const k = (await kleur.boundingBox())!
    const l = (await logo.boundingBox())!

    for (const [naam, box] of [["Weergave", w], ["Kleur", k]] as const) {
      expect(box.width, naam).toBeGreaterThanOrEqual(44)
      expect(box.height, naam).toBeGreaterThanOrEqual(44)
    }
    // Naast elkaar, niet over elkaar.
    expect(k.x).toBeGreaterThan(w.x + w.width - 1)
    // En allebei rechts van het logo. Op `top-3 left-3` landde de
    // linkerknop precies op het merk; dat is de regressie die dit pint.
    expect(w.x).toBeGreaterThan(l.x + l.width - 1)
  })

  test("Escape sluit het paneel en geeft de focus terug aan de knop", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    const knop = page.getByRole("button", { name: /Weergave/ })
    await knop.click()
    await expect(knop).toHaveAttribute("aria-expanded", "true")

    await page.keyboard.press("Escape")
    await expect(knop).toHaveAttribute("aria-expanded", "false")
    // Zonder dit staat een toetsenbordgebruiker na het sluiten weer
    // bovenaan de pagina en moet hij opnieuw naar beneden tabben.
    await expect(knop).toBeFocused()
  })

  // Wat de binnenring van het wiel droeg, staat er nog — en het ONTHOUDT
  // zichzelf. Die tweede helft is waar dit over gaat.
  //
  // `hoekknoppen.spec.ts` meet de VORM van deze panelen (regels, vinkjes,
  // schuifjes). Dit meet het GEHEUGEN, en dat is een andere valkuil: de
  // pre-paint-regel in `layout.tsx` zet de voorkeuren op <html> vóór de
  // eerste verf, en React haalde ze er bij de hydratie ~100ms later weer
  // af — tot `providers.tsx` ze na mount opnieuw ging zetten. Gemeten:
  // op t=0 stonden ze er alle vier, op t=100ms geen enkele. "Onderstreep
  // elke link" en "minder beweging" gingen dus bij ELKE paginalading
  // stilletjes uit, op productie.
  test("de voorkeuren van het wiel staan er nog, en onthouden zichzelf", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: /Weergave/ }).click()
    const paneel = page.getByRole("group", { name: /Weergave/ })

    // `\b` sluit "Groter" uit: tussen "t" en "e" staat geen woordgrens.
    await paneel.getByRole("button", { name: /^Groot\b/ }).click()
    await expect(page.locator("html")).toHaveAttribute("data-text", "large")

    await paneel.getByRole("switch", { name: /Minder beweging/ }).click()
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")

    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    await expect(page.locator("html")).toHaveAttribute("data-text", "large")
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
  })

  test("het kleurpaneel draait de bestaande themalogica", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: /Kleur/ }).click()
    const paneel = page.getByRole("group", { name: /Kleur/ })

    // Een palet kiezen is een overrule: de klok stopt met sturen, en dat
    // blijft zo tot Automatisch weer wordt gekozen.
    await paneel.getByRole("button", { name: /^(Donker|Dark)/ }).click()
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("gronn-theme-mode")))
      .toBe("manual")
    await expect(page.locator("html")).toHaveClass(/bluehour/)
  })

  test("interactive controls meet the 24px WCAG minimum", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)
    // Elk zichtbaar bedieningselement in de dock en de twee hoekknoppen —
    // de oppervlakken die een duim werkelijk gebruikt.
    //
    // De uitzondering leest `::before`, want dat is wat `@utility
    // tap-target` tekent. Hij las ooit `::after` en gold dus nergens;
    // dat viel niet op omdat alles al boven de maat zat.
    const small = await page.evaluate(() => {
      const out: string[] = []
      for (const el of document.querySelectorAll<HTMLElement>(
        "nav a, nav button, [role='group'] button"
      )) {
        const cs = getComputedStyle(el)
        if (cs.opacity === "0" || cs.visibility === "hidden") continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const pseudo = getComputedStyle(el, "::before")
        const w = Math.max(r.width, parseFloat(pseudo.minWidth) || 0)
        const h = Math.max(r.height, parseFloat(pseudo.minHeight) || 0)
        if (w < 24 || h < 24) {
          out.push(
            `${el.getAttribute("aria-label") ?? el.textContent?.trim() ?? el.tagName}: ${Math.round(w)}x${Math.round(h)}`
          )
        }
      }
      return out
    })
    expect(small, small.join(", ")).toEqual([])
  })
})

// `/editor` and `/admin` live outside the [locale] tree, so `LocaleLink`
// must not prefix them. It only knows that from `UNLOCALIZED` in
// src/lib/locale.ts — and `/admin` was linked from the footer, curtain
// and dock for a whole release before it was added there, sending every
// Dutch visitor who clicked it to /nl/admin, a 404. The href is the
// regression, so the href is what this pins.
test.describe("owner tools stay unlocalized", () => {
  for (const locale of ["/", "/nl"]) {
    test(`no language prefix on owner links: ${locale}`, async ({ page }) => {
      await page.goto(locale, { waitUntil: "networkidle" })
      await page.waitForTimeout(3500)
      const hrefs = await page
        .locator("footer a[href$='/editor'], footer a[href$='/dashboard']")
        .evaluateAll((links) =>
          links.map((a) => new URL((a as HTMLAnchorElement).href).pathname)
        )
      // One door now, not three: the site editor moved into the panel's
      // own rail, where it belongs once you are signed in as the one
      // person who can use it. The rule this test exists for is
      // unchanged — whatever IS listed must carry no language prefix.
      expect(hrefs.length).toBeGreaterThan(0)
      expect(hrefs.sort()).toEqual(["/dashboard"])
    })
  }

  // The footer check above only sees the footer. This sweeps every anchor
  // on the Dutch page — footer, curtain and dock alike — because the bug
  // was one component linking a route the locale helper did not know
  // about, and the next one could just as easily be the dock.
  test("nothing anywhere on a Dutch page links into a localized owner path", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    const bad = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => new URL((a as HTMLAnchorElement).href).pathname)
        .filter((p) => /^\/(en|nl)\/(editor|admin|clients)(\/|$)/.test(p))
    )
    expect(bad, bad.join(", ")).toEqual([])
  })
})

// Fixing the links was only half of it: a bookmark, a typed URL or a
// browser history entry can still ask for /nl/admin, and answering 404
// is the same dead end whether a link or a finger put it there.
test.describe("prefixed owner URLs redirect to the real route", () => {
  for (const [from, to] of [
    ["/nl/admin", "/admin"],
    ["/nl/editor", "/editor"],
    ["/nl/clients", "/clients"],
  ]) {
    test(`${from} → ${to}`, async ({ page }) => {
      // Not page.goto: /editor and /admin answer 500 in CI, where
      // NextAuth has no credentials. The redirect is what is under test,
      // so follow it manually and assert on the hop itself.
      const res = await page.request.get(from, { maxRedirects: 0 })
      expect(res.status(), `${from} should redirect`).toBe(308)
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe(to)
    })
  }
})

// The owner panel moved to /dashboard, and the owner's bookmarks did
// not move with it. Every old path keeps its own successor rather than
// all of them landing on the dashboard — a bookmarked inbox that opens
// the inbox is the whole point of the catch-all.
test.describe("the old owner panel keeps its URLs", () => {
  for (const [from, to] of [
    ["/admin", "/dashboard"],
    ["/admin/intakes", "/dashboard/intakes"],
    ["/admin/offertes", "/dashboard/offertes"],
  ]) {
    test(`${from} → ${to}`, async ({ page }) => {
      const res = await page.request.get(from, { maxRedirects: 0 })
      expect(res.status(), `${from} should redirect`).toBe(308)
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe(to)
    })
  }
})

// Reaching into an open panel used to be impossible with a mouse. The
// bar is 80px tall but the trigger row is only as tall as its text, and
// the card hangs at top-20 — a ~30px band belonged to neither. Walking
// down through it fired pointerleave and started the 200ms close, which
// ran out before the cursor arrived: the panel shut under it.
//
// This walks the cursor the way a hand does. It must NOT use hover():
// Playwright jumps straight to an element's centre, skips the band
// entirely, and passes on a build where the bug is fully present.
test.describe("desktop: reaching into a panel", () => {
  test.skip(({ isMobile }) => isMobile)

  test("walking the cursor from trigger into panel keeps it open", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    const trigger = page.locator("button[aria-controls='bar-panel-services']")
    const tb = (await trigger.boundingBox())!
    const x = tb.x + tb.width / 2
    await page.mouse.move(x, tb.y + tb.height / 2, { steps: 6 })

    const panel = page.locator("#bar-panel-services")
    await expect(panel).toBeVisible()
    const pb = (await panel.boundingBox())!

    // Eight small steps with real time between them — slower than the
    // 200ms close delay, which is the whole point.
    const from = tb.y + tb.height
    const to = pb.y + 40
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(x, from + ((to - from) * i) / 8, { steps: 2 })
      await page.waitForTimeout(40)
    }

    await page.waitForTimeout(700)
    await expect(panel).toBeVisible()
    await expect(panel.locator("a").first()).toBeVisible()
  })
})

// Search, the hours switch, the language flag and the concept panel are
// four separate controls because one palette button holding everything
// hid three labelled toggles behind an unlabelled icon — and because a
// bar carrying every labelled toggle at once pushed the logo into the
// nav at 1280px.
test.describe("desktop: header controls", () => {
  test.skip(({ isMobile }) => isMobile)

  test("⌘K opens search and a service is two keystrokes away", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.keyboard.press("Meta+k")
    const dialog = page.locator("[role='dialog'][aria-modal='true']")
    await expect(dialog).toBeVisible()
    await page.keyboard.type("bladnet")
    await expect(dialog.locator("a, button", { hasText: /Bladnet/i }).first()).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
  })

  test("the hours switch flips light and dark", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    const before = await page.evaluate(() => document.documentElement.className)
    // aria-label carries the destination, so it is the honest selector.
    await page.locator("header button[aria-label='Naar licht'], header button[aria-label='Naar donker']").first().click()
    await page.waitForTimeout(400)
    const after = await page.evaluate(() => document.documentElement.className)
    expect(after).not.toBe(before)
    expect(`${before} ${after}`).toMatch(/goldenhour/)
    expect(`${before} ${after}`).toMatch(/bluehour/)
  })

  test("reduced motion can be chosen here, overriding the system", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.locator("button[aria-controls='concept-menu']").click()
    const panel = page.locator("#concept-menu")
    await expect(panel).toBeVisible()
    await panel.getByRole("button", { name: /Beweging/ }).click()
    // The attribute is what CSS reads, so the attribute is what is pinned.
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
  })
})

// The 768–1024 band had no navigation at all. The bar drops every
// section but Diensten below `lg`, the dock is a phone surface, and the
// hamburger that used to bridge the gap left with the full-screen
// curtain — so four of the five sections were unreachable on a tablet.
// PR #76 closed exactly this gap in July; removing the curtain reopened
// it, because that change was measured at 1280 and 1600 and never at 900.
// 900 is therefore the width this test states out loud.
test.describe("tablet: the 900px band", () => {
  test.skip(({ isMobile }) => isMobile)
  test.use({ viewport: { width: 900, height: 1000 } })

  test("every section is reachable from the Menu button", async ({ page }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    // The premise: the bar carries NOTHING here — not even Diensten,
    // which used to hold this band on its own beside a button that
    // opens all five.
    for (const id of ["studio", "services", "projects", "contact"]) {
      await expect(
        page.locator(`button[aria-controls='bar-panel-${id}']`)
      ).toBeHidden()
    }

    const trigger = page.locator("button[aria-controls='tablet-menu']")
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await trigger.click()

    const panel = page.locator("#tablet-menu")
    await expect(panel).toBeVisible()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    for (const href of [
      "/studio",
      "/services",
      "/projects",
      "/contact",
    ]) {
      // `.first()`: /studio staat er sinds 23 sep 2026 twee keer — als
      // sectiekop én als eerste rij "Over mij" (eigenaar: het verhaal
      // voorop). Bereikbaar is wat hier telt.
      await expect(panel.locator(`a[href$='${href}']`).first()).toBeVisible()
    }

    // And EVERY menu item, not just the five headings — the sub-pages
    // are the half that had no route in at this width at all. A priced
    // service carries its from-price here exactly as it does in the bar
    // and the phone sheet.
    for (const href of ["/studio#uitgangspunten", "/studio#manifest", "/contact#seasonal"]) {
      await expect(panel.locator(`a[href$='${href}']`)).toBeVisible()
    }
    const service = panel.locator("a[href$='/services/leaf-net']")
    await expect(service).toBeVisible()
    await expect(service).toContainText(/vanaf/)

    // Disclosure, not dialog — same contract as the bar's own panels.
    await page.keyboard.press("Escape")
    await expect(page.locator("#tablet-menu")).toHaveCount(0)
    await expect(trigger).toBeFocused()

    await trigger.click()
    await page.locator("#tablet-menu a[href$='/projects']").first().click()
    await expect(page).toHaveURL(/\/nl\/projects$/)
  })
})

// The site emitted BreadcrumbList JSON-LD on all three detail routes —
// its own docstring promising "search results show the trail instead of
// a bare URL" — while no detail page showed a trail at all. Each route
// hand-wrote its own array for the crawler, so nothing checked that what
// Google was told matched where the page actually hangs.
//
// Both now read `trailFor()`. This is the assertion that keeps them
// reading it: the visible <ol> and the structured data, name for name.
test.describe("breadcrumbs", () => {
  test.skip(({ isMobile }) => isMobile)

  for (const [path, expected] of [
    ["/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop", ["Home", "Projecten"]],
    ["/nl/services/water-systems", ["Home", "Diensten"]],
  ] as const) {
    test(`visible trail matches the JSON-LD: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })
      await page.waitForTimeout(3500)

      const crumbs = page.locator("nav[aria-label='Kruimelpad'] ol > li")
      const visible = (await crumbs.allTextContents()).map((s) => s.trim())

      const schema = await page.evaluate(() => {
        const scripts = Array.from(
          document.querySelectorAll("script[type='application/ld+json']")
        )
        for (const s of scripts) {
          const data = JSON.parse(s.textContent!)
          if (data["@type"] === "BreadcrumbList")
            return (data.itemListElement as { name: string }[]).map(
              (i) => i.name
            )
        }
        return null
      })

      expect(schema, "no BreadcrumbList on the page").not.toBeNull()
      expect(visible).toEqual(schema)
      // And it really is Home › Section › …, not just self-consistently empty.
      expect(visible.slice(0, 2)).toEqual([...expected])

      // The last crumb is the page you are on: a label, not a link.
      const last = crumbs.last()
      await expect(last.locator("a")).toHaveCount(0)
      await expect(last.locator("[aria-current='page']")).toHaveCount(1)
    })
  }
})

// De evolutietijdlijn op /stack is met de V5-site (sep 2026) weg, en haar
// tests gingen mee. /stack zelf is sinds 24 sep 2026 terug als
// techniekpagina: stack.spec.ts.

// The editor's upload limit.
//
// The route checked `content-length` — a claim the client makes about
// itself. Omit the header and `Number(null ?? 0)` is 0, which passes; a
// body of any size then went straight into arrayBuffer(). The check
// enforced nothing, and no test noticed because none of them lied.
//
// What can be asserted from here is narrower than it looks. NextAuth
// has no secret in CI, so `getOwnerSession()` throws and the route
// answers 500 rather than 401 — this repository has already deleted one
// test for asserting 401 against exactly that, because an assertion
// that fails for a reason it does not name is worse than none.
//
// So this pins the property that actually matters and holds either way:
// an unauthenticated upload NEVER succeeds, whatever the body claims
// about itself. The byte-counting limit is enforced after the session
// gate, which cannot be reached from here at all.
test.describe("the editor upload is gated before it is read", () => {
  test.skip(({ isMobile }) => isMobile)

  test("no session, no upload — whatever the body claims", async ({ page }) => {
    for (const [name, headers] of [
      ["plain", { "content-type": "image/png" }],
      // The shape that defeated the old check: no content-length at all.
      ["chunked", { "content-type": "image/png", "transfer-encoding": "chunked" }],
      // And one that lies about being small.
      ["lying", { "content-type": "image/png", "content-length": "1" }],
      // And a type the route does not accept.
      ["wrong type", { "content-type": "image/svg+xml" }],
    ] as const) {
      const res = await page.request.post("/api/editor/upload?filename=x.png", {
        headers,
        data: "x".repeat(4096),
      })
      expect(res.status(), `${name} should not be accepted`).toBeGreaterThanOrEqual(400)
      expect(res.status(), `${name} should not be accepted`).not.toBe(200)
    }
  })
})

// Keyboard shortcuts, and the WCAG 2.1.4 failure they had to fix.
//
// Character Key Shortcuts is Level A: a shortcut that is a single
// letter, digit or punctuation mark must be possible to turn off, remap
// or confine to focus. This site shipped `/` opening search with none of
// the three. Guarding against typing in a field is careful, and is not
// one of the three things the criterion asks for.
test.describe("keyboard shortcuts", () => {
  test.skip(({ isMobile }) => isMobile)

  test("g then a digit jumps to a section", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.keyboard.press("g")
    await page.keyboard.press("2")
    await expect(page).toHaveURL(/\/services$/)
  })

  test("g h goes home", async ({ page }) => {
    await page.goto("/projects", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.keyboard.press("g")
    await page.keyboard.press("h")
    await expect(page).toHaveURL(/localhost:3210\/$/)
  })

  test("? opens the list, Escape closes it", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.keyboard.press("?")
    const help = page.locator("[role='dialog'][aria-labelledby='shortcut-help-title']")
    await expect(help).toBeVisible()
    await expect(help).toContainText("⌘")
    await page.keyboard.press("Escape")
    await expect(help).toHaveCount(0)
  })

  // The part that is not optional: typing "/" or "g" into a field must
  // reach the field.
  //
  // The search box is the right place to prove it. It is the one text
  // input reachable from any page — the intake form opens on a choice,
  // not a field — and it is where someone would most naturally type a
  // "/" and expect a slash.
  test("shortcuts never steal a keystroke from a field", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.keyboard.press("Meta+k")
    const field = page.locator("[role='dialog'][aria-modal='true'] input").first()
    await expect(field).toBeFocused()

    await page.keyboard.type("g2/?")
    await expect(field).toHaveValue("g2/?")
    // No jump, and no help sheet over the top of what is being typed.
    await expect(page).toHaveURL(/localhost:3210\/$/)
    await expect(
      page.locator("[role='dialog'][aria-labelledby='shortcut-help-title']")
    ).toHaveCount(0)
  })

  // The criterion itself: they can be switched off, and then they are.
  test("switching them off switches them off", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.locator("button[aria-controls='concept-menu']").click()
    await page.getByRole("button", { name: /Shortcuts on/i }).click()
    await expect(
      page.getByRole("button", { name: /Shortcuts off/i })
    ).toBeVisible()
    await page.keyboard.press("Escape")

    await page.keyboard.press("?")
    await expect(
      page.locator("[role='dialog'][aria-labelledby='shortcut-help-title']")
    ).toHaveCount(0)
    await page.keyboard.press("g")
    await page.keyboard.press("2")
    await expect(page).toHaveURL(/localhost:3210\/$/)
  })

  // Chorded shortcuts are outside 2.1.4 and stay on: a modifier cannot
  // be produced by a stray keypress or by speech input.
  test("Meta+K still works with shortcuts off", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.evaluate(() => {
      localStorage.setItem("gronn-a11y-shortcuts", "off")
      window.dispatchEvent(new Event("gronn-a11y-change"))
    })
    await page.keyboard.press("Meta+k")
    await expect(page.locator("[role='dialog'][aria-modal='true']")).toBeVisible()
  })
})

// The long design intake at /contact/intake.
//
// Four things here are load-bearing and none of them are obvious from
// reading the component, so they are pinned:
//
//  · The draft survives a reload. Forty questions is an evening's work,
//    and losing it once is losing the enquiry.
//  · The draft is not claimed before it exists. The page said "kept on
//    this device" the moment it loaded, which was untrue and exactly the
//    kind of untrue that makes someone distrust a form about their home.
//  · Section 08 is the studio's survey: never on the client's screen,
//    always on the printed sheet. Both halves matter — the sheet is
//    carried to the site.
//  · Print keeps the material samples that were chosen and drops the
//    other forty-eight. Sixty swatches over four pages is not a document.
test.describe("the deep intake", () => {
  // This test used to assert the opposite: that the long sheet was
  // reachable from step one of the short form. The reversal is the
  // point, so the test is rewritten rather than deleted.
  //
  // The deep intake is now the studio's instrument, offered to people
  // who are signed in from /dashboard. A first-time visitor on /contact
  // meets one door — four steps, two minutes — instead of being asked
  // to choose between that and an evening's work before anyone has
  // spoken to them.
  //
  // What has NOT changed is that the address still answers, so a link
  // already sent to a client keeps working. Unlinked, not removed —
  // and both halves of that are checked here.
  test("no longer offered from the public site, but still answers", async ({
    page,
  }) => {
    await page.goto("/contact", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await expect(page.locator("a[href$='/contact/intake']")).toHaveCount(0)

    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await expect(page.locator("[data-intake-section]")).toHaveCount(8)
  })

  test("says nothing is kept until something is typed", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    // On the attribute, not the prose: the sentence is translated, and
    // both of its states legitimately mention this device — the first
    // version of this test matched the wrong one and failed for it.
    const line = page.locator("[data-draft]")
    await expect(line).toHaveAttribute("data-draft", "none")

    await page.locator("[data-chip]").first().click()
    await expect(line).toHaveAttribute("data-draft", "kept")
  })

  test("the draft survives a reload", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    const first = page.locator("[data-chip]").first()
    await first.click()
    // `data-chip`, not `aria-pressed`: a picker that takes ONE answer is
    // a radio group and reports `aria-checked` instead, which is correct
    // for it and would make this assertion depend on which block happens
    // to come first in the sheet. `data-chip` is the state marker both
    // kinds carry, and it is here for exactly this.
    await expect(first).toHaveAttribute("data-chip", "on")

    const box = page.locator("textarea").first()
    await box.fill("A Saturday morning in May, coffee, nobody watching.")
    // The save is debounced; give it the window it asks for.
    await page.waitForTimeout(1400)

    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await expect(page.locator("[data-chip]").first()).toHaveAttribute(
      "data-chip",
      "on"
    )
    await expect(page.locator("textarea").first()).toHaveValue(
      /Saturday morning in May/
    )
  })

  test("emptying the form empties the draft too", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.locator("textarea").first().fill("something")
    await page.waitForTimeout(1400)

    await page
      .locator("button", { hasText: /Empty the form|Leeg het formulier/ })
      .click()
    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await expect(page.locator("textarea").first()).toHaveValue("")
  })

  // The survey was a fold first: the questions were hidden but the
  // heading, the "this part is for GRØNN" line and a button all stayed
  // on the client's screen. "Why am I seeing this?" was the right
  // reaction, so now they are not seeing it at all — it exists only on
  // the printed sheet, which is the reason it is on this page.
  test("the survey is the studio's: never on screen, always on paper", async ({
    page,
  }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    const survey = page.locator('[data-intake-section="survey"]')
    await expect(survey).toBeHidden()
    // Not the questions alone — the heading and the explanation of who
    // it is for were the part the client kept having to scroll past.
    await expect(survey.locator("h2")).toBeHidden()
    await expect(page.locator("[data-survey-toggle]")).toHaveCount(0)

    await page.emulateMedia({ media: "print" })
    await expect(survey).toBeVisible()
    await expect(survey.locator("textarea")).toHaveCount(12)
    await page.emulateMedia({ media: "screen" })
  })

  // The form asked for earlier designs "as PDF please" and then gave no
  // way to attach one. A question you cannot answer is worse than one
  // that is not asked.
  test("drawings and earlier plans take a PDF", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    const tray = page.locator('[data-intake-section="existing"] input[type="file"]')
    await expect(tray).toHaveCount(1)
    const accept = await tray.getAttribute("accept")
    expect(accept).toContain("application/pdf")

    await tray.setInputFiles({
      name: "ontwerp-2019.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n% a drawing that is not a photograph\n"),
    })
    // A PDF has no thumbnail, so it must not render as a broken image.
    const item = page.locator('[data-intake-section="existing"] li', {
      hasText: "ontwerp-2019.pdf",
    })
    await expect(item).toBeVisible()
    await expect(item.locator("img")).toHaveCount(0)
    await expect(item).toContainText("PDF")
  })

  // And the photograph trays stay photograph trays: a PDF dropped into
  // "what repels you" is a mistake, not a submission.
  test("the photograph trays still refuse a PDF", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    const tray = page.locator('[data-intake-section="photos"] input[type="file"]').first()
    expect(await tray.getAttribute("accept")).not.toContain("pdf")
    await tray.setInputFiles({
      name: "nope.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n"),
    })
    await expect(
      page.locator('[data-intake-section="photos"] li', { hasText: "nope.pdf" })
    ).toHaveCount(0)
  })

  test("print keeps the samples chosen and drops the rest", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    const chips = page.locator("[data-chip]")
    const total = await chips.count()
    expect(total).toBeGreaterThan(40)
    await chips.nth(0).click()
    await chips.nth(9).click()

    await page.emulateMedia({ media: "print" })
    await expect(page.locator("[data-chip]:visible")).toHaveCount(2)
    // And nothing you could press: a printed sheet with a Send button on
    // it is a sheet somebody will try to press.
    await expect(page.locator("[data-print='hide']:visible")).toHaveCount(0)
    await page.emulateMedia({ media: "screen" })
  })
})

// The site follows the visitor's language until the visitor chooses,
// and then their choice wins — the same contract the theme has, where
// the clock stops driving the moment you pick a palette.
//
// The two guards are the point of these tests. A crawler asking for
// /projects must GET /projects, or the English tree becomes effectively
// uncrawlable and the two languages compete for the same content; and
// a visitor who has chosen must never be second-guessed.
test.describe("the site follows the visitor's language", () => {
  // A real browser context with a real locale, not setExtraHTTPHeaders:
  // the context's own Accept-Language wins over an extra header, which
  // is why the first version of this test saw no redirect and blamed
  // the proxy.
  async function visit(browser: import("@playwright/test").Browser, locale: string) {
    const context = await browser.newContext({ locale })
    const page = await context.newPage()
    await page.goto("/projects", { waitUntil: "domcontentloaded" })
    const url = page.url()
    await context.close()
    return url
  }

  test("a Dutch browser lands on Dutch, without asking", async ({ browser }) => {
    expect(await visit(browser, "nl-NL")).toMatch(/\/nl\/projects$/)
  })

  test("an English browser is left where it asked", async ({ browser }) => {
    expect(await visit(browser, "en-GB")).toMatch(/\/projects$/)
    expect(await visit(browser, "en-GB")).not.toMatch(/\/nl\//)
  })

  // German is a language this site does not speak. Falling through to
  // the site's own default is right; picking whichever of ours happens
  // to sit further down their header is not.
  test("a language the site does not speak falls back, not sideways", async ({
    browser,
  }) => {
    expect(await visit(browser, "de-DE")).toMatch(/\/projects$/)
  })

  test("having chosen once, the guessing stops", async ({ browser }) => {
    const context = await browser.newContext({ locale: "nl-NL" })
    await context.addCookies([
      { name: "gronn-lang-mode", value: "manual", url: "http://localhost:3210" },
      { name: "gronn-lang", value: "en", url: "http://localhost:3210" },
    ])
    const page = await context.newPage()
    await page.goto("/projects", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/projects$/)
    await context.close()
  })

  // Not a browser navigation: no Sec-Fetch-Mode and no request for a
  // document. That is the shape a crawler and a prefetch both take, and
  // redirecting either would make the English tree uncrawlable.
  test("a non-navigation request is never redirected", async ({ page }) => {
    const res = await page.request.get("/projects", {
      headers: { "Accept-Language": "nl-NL,nl;q=0.9" },
      maxRedirects: 0,
    })
    expect(res.status()).toBe(200)
    expect(res.headers()["location"]).toBeUndefined()
  })

  // ── THE CHOICE IS APPLIED, NOT ONLY OBEYED ─────────────────────────
  //
  // Owner, 23 Sep 2026: "taal switch onthouden". Choosing Dutch used to
  // stop the guessing and nothing more: the next unprefixed address —
  // `/` from the home-screen app, a bookmark, a typed URL — was served
  // in English. Each test chooses through the real switch, in a browser
  // whose own language says the OPPOSITE, so the only thing that can
  // put the visitor where the test expects is the remembered choice.

  /**
   * Choose a language the way a visitor does: the flag in the desktop
   * header, or the toggle in the phone's "Kleur en taal" panel. Which one
   * is decided by the viewport, because the header button only exists
   * from `md` up.
   */
  async function kies(page: import("@playwright/test").Page, locale: "en" | "nl") {
    const phone = (page.viewportSize()?.width ?? 1280) < 768
    if (phone) {
      await page.getByRole("button", { name: /Kleur en taal|Colour and language/ }).click()
      await page
        .getByRole("group", { name: /^(Taal|Language)$/ })
        .getByRole("button", { name: locale === "nl" ? "Nederlands" : "English", exact: true })
        .click()
    } else {
      await page
        .getByRole("button", {
          name: locale === "nl" ? /Switch to Dutch|Schakel naar Nederlands/ : /Switch to English|Schakel naar Engels/,
        })
        .click()
    }
    const dutch = (url: URL) => /^\/nl(\/|$)/.test(url.pathname)
    await page.waitForURL((url) => (locale === "nl" ? dutch(url) : !dutch(url)))
  }

  // Contexts made here inherit the project's device (Pixel 7 in
  // `mobile`), so the phone run chooses through the phone panel.
  test("having chosen Dutch, `/` opens in Dutch", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-GB" })
    const page = await context.newPage()
    await page.goto("/", { waitUntil: "networkidle" })
    await expect(page).not.toHaveURL(/\/nl/)
    await kies(page, "nl")

    // Both stores carry it: the cookie the server reads, the backup the
    // app view keeps.
    expect(await page.evaluate(() => localStorage.getItem("gronn-lang"))).toBe("nl")

    await page.goto("/", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/nl$/)
    await page.goto("/projects", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/nl\/projects$/)
    await context.close()
  })

  test("choosing English after Dutch wins, even in a Dutch browser", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "nl-NL" })
    const page = await context.newPage()
    await page.goto("/nl", { waitUntil: "networkidle" })
    await kies(page, "en")
    expect(await page.evaluate(() => localStorage.getItem("gronn-lang"))).toBe("en")

    await page.goto("/", { waitUntil: "networkidle" })
    await expect(page).not.toHaveURL(/\/nl/)
    // And it stays there: the backup agrees with the cookie, so nothing
    // on the client moves it either.
    await page.waitForTimeout(500)
    await expect(page).not.toHaveURL(/\/nl/)
    await context.close()
  })

  // Cookies cleared, site data kept — or a home-screen app with a cookie
  // jar of its own. The backup in localStorage writes the cookie back
  // and moves the page, once.
  test("with only the localStorage backup left, `/` still ends on Dutch", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ locale: "en-GB" })
    const page = await context.newPage()
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await page.evaluate(() => localStorage.setItem("gronn-lang", "nl"))
    await context.clearCookies()

    await page.goto("/", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/nl$/)

    // The cookie is back, so the next unprefixed visit is the server's
    // job again — straight to Dutch, no English page on the way.
    const cookies = await context.cookies(baseURL)
    expect(cookies.find((c) => c.name === "gronn-lang")?.value).toBe("nl")
    expect(cookies.find((c) => c.name === "gronn-lang-mode")?.value).toBe("manual")
    const res = await page.request.get("/projects", {
      headers: { Accept: "text/html", "Sec-Fetch-Mode": "navigate" },
      maxRedirects: 0,
    })
    expect(res.status()).toBe(307)
    expect(res.headers()["location"]).toBe("/nl/projects")
    await context.close()
  })

  // The same crawler guard as below, now with a Dutch choice in the jar:
  // remembering a choice must never make the English tree uncrawlable.
  test("a remembered choice never redirects a non-navigation", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ locale: "en-GB" })
    await context.addCookies([
      { name: "gronn-lang-mode", value: "manual", url: baseURL! },
      { name: "gronn-lang", value: "nl", url: baseURL! },
    ])
    const page = await context.newPage()
    const res = await page.request.get("/projects", {
      headers: { Accept: "*/*" },
      maxRedirects: 0,
    })
    expect(res.status()).toBe(200)
    expect(res.headers()["location"]).toBeUndefined()

    // And the navigation it is not: temporary, and declaring its Vary.
    const nav = await page.request.get("/projects", {
      headers: { Accept: "text/html", "Sec-Fetch-Mode": "navigate" },
      maxRedirects: 0,
    })
    expect(nav.status()).toBe(307)
    expect(nav.headers()["location"]).toBe("/nl/projects")
    expect(nav.headers()["vary"] ?? "").toMatch(/Cookie/i)
    await context.close()
  })

  // The redirect is the response a shared cache could hand to the wrong
  // visitor, so it is the one that has to declare what it varies by.
  // (The rewrite cannot: Next sets its own Vary on that path.)
  test("the redirect says it varies by language", async ({ page }) => {
    const res = await page.request.get("/projects", {
      headers: {
        "Accept-Language": "nl-NL,nl;q=0.9",
        Accept: "text/html",
        "Sec-Fetch-Mode": "navigate",
      },
      maxRedirects: 0,
    })
    expect(res.status()).toBe(307)
    expect(res.headers()["location"]).toBe("/nl/projects")
    expect(res.headers()["vary"] ?? "").toMatch(/Accept-Language/i)
  })

  // Temporary, never permanent: the right answer depends on who is
  // asking, and a 308 would be cached by the browser and then applied
  // to a visitor whose language is different.
  test("the redirect is temporary", async ({ page }) => {
    const res = await page.request.get("/", {
      headers: {
        "Accept-Language": "nl",
        Accept: "text/html",
        "Sec-Fetch-Mode": "navigate",
      },
      maxRedirects: 0,
    })
    expect(res.status()).toBe(307)
    expect(res.headers()["location"]).toBe("/nl")
  })
})

// The intake archive, and the gate in front of it.
//
// A submission is now a record in Blob storage that /admin/intakes reads
// back, not just a notification. That makes the gate load-bearing in a
// way it was not before: what sits behind it is a stranger's answers
// about their house and photographs of it, so an unauthenticated request
// must never receive any of it.
//
// These assert what holds in CI as well as in production. NextAuth has
// no secret in the test environment, so the routes answer 500 rather
// than 401 — this repository has already deleted one test for asserting
// 401 against exactly that. So they pin the part that is true either
// way: never a 200, and never a body carrying somebody's enquiry.
test.describe("the intake archive is behind the gate", () => {
  test("/dashboard/intakes never serves submissions to a stranger", async ({ page }) => {
    const res = await page.request.get("/dashboard/intakes", { maxRedirects: 0 })
    if (res.status() === 200) {
      // A 200 here is the sign-in gate, which is a legitimate answer —
      // but it must be the gate and not the inbox.
      const body = await res.text()
      // NOT the bare word "Intakes": it is the page title and a label in
      // the rail, and the gate draws the rail on purpose. Asserting on it
      // failed the moment the panel got a secret to run with, over a
      // page that had leaked nothing. What is asserted is the furniture
      // that exists only once a record is on screen.
      for (const leak of [
        "Kopieer de antwoorden",
        "Maak offerte",
        "Alle aanvragen",
        "Verwijder deze aanvraag",
      ]) {
        expect(body, `the gate must not render "${leak}"`).not.toContain(leak)
      }
      // And the way in must actually be there, or this is a blank wall.
      expect(body).toContain("Inloggen met Google")
    }
  })

  test("an attachment is never served unauthenticated", async ({ page }) => {
    const res = await page.request.get(
      "/api/admin/intake-file/intake/2026-01-01-test/current-photo.jpg",
      { maxRedirects: 0 }
    )
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).not.toBe(200)
  })

  // The path comes from a stored record, and a record is only ever as
  // trustworthy as whatever wrote it.
  test("the attachment route refuses a path that climbs out", async ({ page }) => {
    for (const path of [
      "/api/admin/intake-file/images/site-photo.jpg",
      "/api/admin/intake-file/intake/../images/site-photo.jpg",
    ]) {
      const res = await page.request.get(path, { maxRedirects: 0 })
      expect(res.status()).not.toBe(200)
    }
  })
})

// A phone number in "Phone / email" must not break delivery.
//
// Reported from production: pressing Send opened a Gmail draft. That is
// the last-resort fallback, and it fired because FormSubmit was handed
// the visitor's contact as its reply-to address — and the head field is
// labelled "Phone / email", so a phone number there is the normal thing
// to type. FormSubmit rejects a reply-to that is not an address, and
// every such submission fell through to mailto.
test.describe("sending survives a phone number", () => {
  test("a phone number is never used as the relay's reply-to", async ({ page }) => {
    await page.goto("/nl/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    // Fill the head the way the label invites: a phone number.
    const contact = page.locator('[data-intake-print="head"] input').nth(3)
    await contact.fill("06 12 34 56 78")
    await page.locator("textarea").first().fill("Een moment in mei.")

    // Both relays are intercepted, so nothing leaves the test and both
    // are observable.
    let replyTo: string | null = null
    await page.route("**/api/intake", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":false}' })
    )
    await page.route("https://formsubmit.co/**", async (route) => {
      const sent = JSON.parse(route.request().postData() ?? "{}")
      replyTo = sent.email
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"success":"true"}',
      })
    })

    await page.locator("button", { hasText: /Verstuur naar de studio/ }).click()
    await expect(page.getByText(/Binnen\. Dank je\.|Received\. Thank you\./)).toBeVisible({
      timeout: 15000,
    })
    // Whatever it is, it must be an address — otherwise the relay
    // refuses and the visitor gets a mail draft instead of a thank-you.
    expect(replyTo).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
  })

  test("a real email address is still used as the reply-to", async ({ page }) => {
    await page.goto("/nl/contact/intake", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.locator('[data-intake-print="head"] input').nth(3).fill("nick@voorbeeld.nl")
    await page.locator("textarea").first().fill("Een moment in mei.")

    let replyTo: string | null = null
    await page.route("**/api/intake", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":false}' })
    )
    await page.route("https://formsubmit.co/**", async (route) => {
      replyTo = JSON.parse(route.request().postData() ?? "{}").email
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"success":"true"}',
      })
    })

    await page.locator("button", { hasText: /Verstuur naar de studio/ }).click()
    await expect(page.getByText(/Binnen\. Dank je\.|Received\. Thank you\./)).toBeVisible({
      timeout: 15000,
    })
    expect(replyTo).toBe("nick@voorbeeld.nl")
  })
})

// The dashboard is one surface with three doors, and every one of them
// is shut to a stranger.
//
// Documents moved out of the browser and onto the studio's own storage
// in this round, which means an administration that used to be
// unreachable by definition — it lived in one laptop — now answers an
// HTTP request. So the route that serves it gets the same treatment the
// intake archive already had: refused without a session, in both
// directions, before anything else is asserted about it.
test.describe("the owner dashboard is behind the gate", () => {
  for (const path of [
    "/dashboard",
    "/dashboard/offertes",
    "/dashboard/intakes",
  ]) {
    test(`no administration is served unauthenticated: ${path}`, async ({ page }) => {
      const res = await page.request.get(path, { maxRedirects: 0 })
      // A 200 is the sign-in gate, which is a legitimate answer — but it
      // has to be the gate, never the surface behind it.
      if (res.status() === 200) {
        const body = await res.text()
        expect(body).not.toContain("Nog te ontvangen")
        expect(body).not.toContain("Laatste aanvragen")
        expect(body).not.toContain("Dit document verwijderen")
      }
    })
  }

  test("the documents archive refuses to be read without a session", async ({ page }) => {
    const res = await page.request.get("/api/admin/documents", { maxRedirects: 0 })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).not.toBe(200)
  })

  // The write side matters more than the read side: an unauthenticated
  // PUT that got through would not leak an administration, it would
  // REPLACE one.
  test("the documents archive refuses to be written without a session", async ({ page }) => {
    const res = await page.request.put("/api/admin/documents", {
      data: { documents: [] },
      maxRedirects: 0,
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).not.toBe(200)
  })
})

// The intake form has to actually offer what the archive can now hold.
// Video was refused at three separate points before this round — the
// token route, the file filter and the input's own accept attribute —
// and the one a visitor meets first is the file picker.
test("the intake trays accept video, not only stills", async ({ page }) => {
  await page.goto("/contact/intake", { waitUntil: "domcontentloaded" })
  const inputs = page.locator('input[type="file"]')
  const count = await inputs.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    expect(await inputs.nth(i).getAttribute("accept")).toContain("video/")
  }
})

/* ── the intake, shortened and put on a phone ──────────────────────── */

// The form asked twenty-four written questions and a visitor met them on
// a page that had never been measured at phone width. Both halves of
// that are pinned here, because both are the kind of thing that creeps
// back one field and one class at a time.
//
// Sizes are MEASURED, not read off class names. The suite already
// visited this page eleven times on a Pixel 7 without noticing a 24px
// close button, a slider with no height, or six inputs small enough to
// make iOS zoom the page in — because nothing ever asked how big
// anything was.
test.describe("the intake asks less and fits a phone", () => {
  test("a visitor meets at most five text boxes", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "domcontentloaded" })
    // Section 08 is the studio's own survey. It is `hidden print:block`,
    // so it is off the screen for everyone and its twelve questions are
    // not a visitor's burden — counting only what is visible is the
    // whole distinction.
    const boxes = page.locator("textarea:visible")
    const n = await boxes.count()
    expect(n).toBeGreaterThan(0)
    expect(n).toBeLessThanOrEqual(5)
  })

  test("the choices that take one answer say so", async ({ page }) => {
    await page.goto("/contact/intake", { waitUntil: "domcontentloaded" })
    const budget = page.locator('[role="radiogroup"]').first()
    await expect(budget).toBeVisible()
    const options = budget.locator('[role="radio"]')
    expect(await options.count()).toBeGreaterThan(1)

    // Picking a second replaces the first rather than adding to it.
    await options.nth(0).click()
    await expect(options.nth(0)).toHaveAttribute("aria-checked", "true")
    await options.nth(1).click()
    await expect(options.nth(1)).toHaveAttribute("aria-checked", "true")
    await expect(options.nth(0)).toHaveAttribute("aria-checked", "false")

    // And it can be taken back — a budget you can set but never unset is
    // a trap, not a shortcut.
    await options.nth(1).click()
    await expect(options.nth(1)).toHaveAttribute("aria-checked", "false")
  })

  // These three MEASURE, and measuring a page mid-animation is how a
  // test lies. The first versions walked the DOM from the test process —
  // `count()`, then `nth(i).evaluate()` eighteen times — while framer
  // was still revealing sections, so an element could be replaced
  // between the two calls and `getComputedStyle` came back empty. That
  // reads as `NaN`, which fails an assertion about font size while
  // saying nothing about font size.
  //
  // So each of these now takes ONE reading inside the browser, on
  // `networkidle` rather than `domcontentloaded`. No round trip can land
  // between two halves of the same measurement.
  test("no input is small enough to make iOS zoom the page in", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    // Safari zooms on focus below 16px and does not zoom back out. The
    // other cure is `maximum-scale=1`, which takes pinch zoom from
    // everybody — so the font size is the fix and this is its guard.
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll("input, textarea")]
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: (el as HTMLInputElement).type ?? "",
          px: parseFloat(getComputedStyle(el).fontSize),
        }))
    )
    expect(sizes.length).toBeGreaterThan(0)
    const small = sizes.filter((f) => !(f.px >= 16))
    expect(small, JSON.stringify(small)).toEqual([])
  })

  test("the slider is tall enough to drag with a thumb", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    // Measured where it stands. `scrollIntoViewIfNeeded` was the first
    // attempt and it times out here — Lenis owns scrolling on this site,
    // so Playwright's scroll and Lenis's fight each other. A height does
    // not need the element on screen to be read.
    const height = await page.evaluate(() => {
      const el = document.querySelector('input[type="range"]')
      return el ? el.getBoundingClientRect().height : null
    })
    expect(height).not.toBeNull()
    // `tap-target` cannot help here: its pseudo-element is out of flow
    // and a range input only answers pointer events on itself. The
    // height has to be real, which is why this measures rather than
    // checking for a utility class.
    expect(height!).toBeGreaterThanOrEqual(44)
  })

  test("the button that throws a photograph away can be hit", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile)
    await page.goto("/contact/intake", { waitUntil: "networkidle" })
    const input = page.locator('input[type="file"]').first()
    await input.setInputFiles({
      name: "tuin.png",
      mimeType: "image/png",
      // A 1x1 PNG, enough to make the tray render a thumbnail.
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
      ),
    })
    // The tray reads the file and makes an object URL before it renders
    // anything, so the button does not exist on the next tick. Attached
    // rather than visible: the thumbnail animates in, and a press target
    // is a size question, not a paint question.
    const remove = page
      .locator("button[aria-label^='Verwijder'], button[aria-label^='Remove']")
      .first()
    await expect(remove).toBeAttached({ timeout: 10_000 })
    // The disc is drawn at 24px on purpose — bigger would cover the
    // photograph. `tap-target` lifts only the PRESSED area to 44, so the
    // pseudo-element is what this measures.
    const pressable = await remove.evaluate((el) => {
      const r = getComputedStyle(el, "::before")
      return { h: parseFloat(r.minHeight), w: parseFloat(r.minWidth) }
    })
    expect(pressable.h).toBeGreaterThanOrEqual(44)
    expect(pressable.w).toBeGreaterThanOrEqual(44)
  })
})
