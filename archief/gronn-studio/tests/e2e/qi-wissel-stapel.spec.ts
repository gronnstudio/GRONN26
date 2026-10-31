import { expect, test, type Locator, type Page } from "@playwright/test"

// Twee elementen naar Qi Addons (eigenaar, 24 sep 2026):
// - BeeldWissel: op een projectkaart vloeit onder de muis een tweede ECHTE
//   foto over de eerste; op touch nooit, bij minder beweging zonder
//   vloeien, bij toetsenbordfocus ook.
// - FotoStapel: op de telefoon liggen twee staande foto's als stapel met
//   een knop "Volgende foto" en een teller; vanaf md het gewone raster.

const PROJECTEN = "/nl/projects"
const VIJVER = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"

const KAARTEN = [
  { naam: "vijver", eerste: "F01.jpg", tweede: "/projecten/vijverrenovatie/F10.jpg", titel: /Twee vijvers\. Eén samenhangend watersysteem\./, tweedeAlt: /waterval stroomt/ },
  { naam: "terras", eerste: "T01.jpg", tweede: "/projecten/terras-geulle/T03.jpg", titel: /Een terras van 24\sm²/, tweedeAlt: /Nick staat op het nieuwe tegelpad/ },
] as const

const kaart = (page: Page, eerste: string) =>
  page.locator("main li a").filter({ has: page.locator(`img[src*="${eerste}"]:not([data-beeld-wissel])`) })

const laag = (k: Locator) => k.locator("[data-beeld-wissel]")
const opacity = (l: Locator) => l.evaluate((e) => getComputedStyle(e).opacity)

test.describe("BeeldWissel: desktop", () => {
  test.skip(({ isMobile }) => isMobile, "met een muis")

  for (const k of KAARTEN) {
    test(`${k.naam}: onder de muis vloeit de tweede echte foto over de eerste`, async ({ page }) => {
      await page.goto(PROJECTEN)
      const a = kaart(page, k.eerste)
      await expect(a).toHaveCount(1)
      const l = laag(a)
      await expect(l).toHaveCount(1)
      await expect(l).toHaveAttribute("alt", "")
      await expect(l).toHaveAttribute("loading", "lazy")
      // De naam van de kaart blijft de eerste foto plus de tekst: de laag
      // voegt niets toe.
      await expect(a).toHaveAccessibleName(k.titel)
      await expect(a).not.toHaveAccessibleName(k.tweedeAlt)

      await a.scrollIntoViewIfNeeded()
      expect(await opacity(l)).toBe("0")
      // Geen verspringing: de laag vult precies het vak van de eerste foto.
      // Gemeten in lay-out (offsetWidth/-Height), niet op het scherm: de
      // eerste foto van de vijver komt met een schaal binnen
      // (BeeldOnthulling).
      const maten = await l.evaluate((laag: HTMLElement) => {
        const vak = laag.parentElement!
        const eerste = [...vak.querySelectorAll("img")].find((i) => i !== laag)!
        const r = laag.getBoundingClientRect()
        const v = vak.getBoundingClientRect()
        return {
          laagInVak: [r.left - v.left, r.top - v.top, r.width - v.width, r.height - v.height],
          eersteInVak: [eerste.offsetWidth - vak.clientWidth, eerste.offsetHeight - vak.clientHeight],
          breedte: eerste.offsetWidth,
        }
      })
      expect(maten.breedte).toBeGreaterThan(100)
      for (const d of [...maten.laagInVak, ...maten.eersteInVak]) expect(Math.abs(d)).toBeLessThanOrEqual(1)

      await a.hover()
      await expect.poll(() => opacity(l)).toBe("1")
      await expect
        .poll(() => l.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0 && decodeURIComponent(e.currentSrc)))
        .toContain(k.tweede)

      // De kanteling doet nog mee: de muis bewegen draait de kaart.
      const box = (await a.boundingBox())!
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2, { steps: 4 })
      await expect
        .poll(() => a.locator("xpath=ancestor::*[@data-kanteling][1]").evaluate((e) => getComputedStyle(e).transform))
        .not.toBe("none")

      // Weg met de muis: de eerste foto komt terug.
      await page.mouse.move(2, 2)
      await expect.poll(() => opacity(l)).toBe("0")
    })
  }

  test("toetsenbord: focus op de kaart toont ook de tweede foto", async ({ page }) => {
    await page.goto(PROJECTEN)
    const a = kaart(page, "F01.jpg")
    const l = laag(a)
    // Echt met Tab, zodat :focus-visible geldt.
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab")
      if (await a.evaluate((e) => e === document.activeElement)) break
    }
    await expect(a).toBeFocused()
    await expect.poll(() => opacity(l)).toBe("1")
  })

  test("de overvloeiing duurt 400 ms; bij minder beweging wisselt hij meteen", async ({ page }) => {
    await page.goto(PROJECTEN)
    const l = laag(kaart(page, "F01.jpg"))
    await expect.poll(() => l.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe("0.4s")
    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect.poll(() => l.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe("0s")
    await kaart(page, "F01.jpg").hover()
    await expect.poll(() => opacity(l)).toBe("1")
  })

  test("home: het uitgelichte project wisselt ook naar de waterval", async ({ page }) => {
    await page.goto("/nl")
    const vlak = page.locator("section[aria-labelledby='project-kop'] .g-wissel-groep")
    const l = vlak.locator("[data-beeld-wissel]")
    await expect(l).toHaveCount(1)
    await expect(l).toHaveAttribute("alt", "")
    await vlak.scrollIntoViewIfNeeded()
    expect(await opacity(l)).toBe("0")
    await vlak.hover()
    await expect.poll(() => opacity(l)).toBe("1")
    await expect.poll(() => l.evaluate((e: HTMLImageElement) => decodeURIComponent(e.currentSrc))).toContain("/projecten/vijverrenovatie/F10.jpg")
  })
})

test.describe("BeeldWissel: touch", () => {
  test.skip(({ isMobile }) => !isMobile, "op de telefoon")

  test("een tik wisselt niet: de eerste foto blijft staan", async ({ page }) => {
    await page.goto(PROJECTEN)
    // De tik mag niet navigeren, anders valt er niets meer te meten.
    await page.evaluate(() =>
      window.addEventListener(
        "click",
        (e) => {
          e.preventDefault()
          e.stopPropagation()
        },
        true
      )
    )
    for (const k of KAARTEN) {
      const a = kaart(page, k.eerste)
      const l = laag(a)
      const eerste = a.locator(`img[src*="${k.eerste}"]:not([data-beeld-wissel])`)
      await eerste.scrollIntoViewIfNeeded()
      await eerste.tap()
      await page.waitForTimeout(600)
      expect(await opacity(l), k.naam).toBe("0")
      await expect(page).toHaveURL(new RegExp(`${PROJECTEN}$`))
    }
  })
})

test.describe("FotoStapel: telefoon", () => {
  test.skip(({ isMobile }) => !isMobile, "alleen onder md")

  test("twee staande foto's als stapel: 1/2 → 2/2 → 1/2, beide foto's met alt", async ({ page }) => {
    await page.goto(VIJVER)
    const stapel = page.locator('[data-foto="F02"]')
    await expect(stapel).toHaveAttribute("data-foto-stapel", "")
    await stapel.scrollIntoViewIfNeeded()
    const teller = stapel.locator("[data-stapel-teller]")
    const knop = stapel.getByRole("button", { name: "Volgende foto" })
    await expect(teller).toBeVisible()
    await expect(teller).toHaveAttribute("aria-live", "polite")
    await expect(teller).toContainText("1/2")
    await expect(knop).toBeVisible()

    const imgs = stapel.locator("figure img")
    await expect(imgs).toHaveCount(2)
    for (let i = 0; i < 2; i++) expect(((await imgs.nth(i).getAttribute("alt")) ?? "").length).toBeGreaterThanOrEqual(20)
    await expect(stapel.locator("figcaption")).toHaveCount(2)

    const kaarten = stapel.locator(".g-stapel-kaart")
    const bovenop = () =>
      stapel.evaluate((s) => {
        const r = s.querySelector(".g-stapel-vak")!.getBoundingClientRect()
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 3)
        return [...s.querySelectorAll(".g-stapel-kaart")].findIndex((k) => k.contains(el))
      })
    await expect(kaarten.nth(0)).toHaveAttribute("data-plek", "voor")
    await expect(kaarten.nth(1)).toHaveAttribute("data-plek", "achter")
    await expect.poll(bovenop).toBe(0)
    // De achterste ligt 12px rechtsboven; alleen translate.
    await expect.poll(() => kaarten.nth(1).evaluate((e) => getComputedStyle(e).translate)).toBe("12px -12px")

    await knop.tap()
    await expect(teller).toContainText("2/2")
    await expect(kaarten.nth(1)).toHaveAttribute("data-plek", "voor")
    await expect.poll(bovenop).toBe(1)

    // Terug met het toetsenbord: Enter en Spatie op de knop.
    await knop.focus()
    await page.keyboard.press("Enter")
    await expect(teller).toContainText("1/2")
    await expect.poll(bovenop).toBe(0)
    await page.keyboard.press(" ")
    await expect(teller).toContainText("2/2")
  })

  test("een reeks met een AI-visualisatie stapelt nooit, het label blijft zichtbaar", async ({ page }) => {
    await page.goto(VIJVER)
    const f03 = page.locator('[data-foto="F03"]')
    await expect(f03).toHaveCount(1)
    expect(await f03.getAttribute("data-foto-stapel")).toBeNull()
    const labels = f03.locator("[data-concept-label]")
    await expect(labels).toHaveCount(2)
    for (let i = 0; i < 2; i++) {
      await labels.nth(i).scrollIntoViewIfNeeded()
      await expect(labels.nth(i)).toBeVisible()
    }
    // F07 is gemengd (liggend + staand): ook geen stapel.
    expect(await page.locator('[data-foto="F07"]').getAttribute("data-foto-stapel")).toBeNull()
  })

  test("minder beweging: de kaarten schuiven zonder overgang", async ({ page }) => {
    await page.goto(VIJVER)
    const k = page.locator('[data-foto="F02"] .g-stapel-kaart').first()
    await expect.poll(() => k.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe("0.4s")
    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect.poll(() => k.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe("0s")
  })
})

test.describe("FotoStapel: desktop", () => {
  test.skip(({ isMobile }) => isMobile, "vanaf md")

  test("vanaf md het gewone raster: naast elkaar, geen knop, geen verschuiving", async ({ page }) => {
    await page.goto(VIJVER)
    const stapel = page.locator('[data-foto="F02"]')
    await stapel.scrollIntoViewIfNeeded()
    await expect(stapel.getByRole("button", { name: "Volgende foto" })).toBeHidden()
    await expect(stapel.locator("[data-stapel-teller]")).toBeHidden()
    const imgs = stapel.locator("figure img")
    await expect(imgs).toHaveCount(2)
    const [a, b] = [(await imgs.nth(0).boundingBox())!, (await imgs.nth(1).boundingBox())!]
    expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1)
    expect(b.x).toBeGreaterThan(a.x + a.width)
    const translates = await stapel.locator(".g-stapel-kaart").evaluateAll((ks) => ks.map((k) => getComputedStyle(k).translate))
    expect(translates).toEqual(["none", "none"])
    await expect(stapel.locator("figcaption").nth(1)).toHaveCSS("opacity", "1")
  })
})

test("geen zijwaartse overloop op 320 en 375", async ({ page }) => {
  for (const breedte of [320, 375]) {
    await page.setViewportSize({ width: breedte, height: 740 })
    for (const pad of [PROJECTEN, VIJVER]) {
      await page.goto(pad)
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
      expect(sw, `${pad} @ ${breedte}`).toBeLessThanOrEqual(iw)
    }
  }
})
