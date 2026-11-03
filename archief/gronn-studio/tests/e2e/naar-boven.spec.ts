import { expect, test, type Page } from "@playwright/test"

// Terug naar boven op desktop: `NaarBovenKnop` rechtsonder (eigenaar,
// 27 sep 2026: "ik zie dat op desktop geen back to top button is te
// vinden in de rechter onderhoek"). De telefoon heeft het Omhoog-vak in
// de dock; daar is deze knop er niet.

const VIJVER = "/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop"
const KNOP = '[data-naar-boven="los"]'

async function metOpslag(page: Page, items: Record<string, string> = {}) {
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("__nb_init")) return
    sessionStorage.setItem("__nb_init", "1")
    localStorage.setItem("gronn-install-dismissed", "32503680000000")
    // Geen openingsdoek: dat ligt in de Blauwe Uur 2,45 s over de pagina
    // (lijnlogo, #215) en een pixelmeting zou het doek meten.
    sessionStorage.setItem("gronn-intro", "1")
    for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v)
  }, items)
}

async function omlaag(page: Page, schermen = 2) {
  await page.evaluate((n) => window.scrollTo(0, window.innerHeight * n), schermen)
  await page.waitForTimeout(500)
}

/** WCAG-verhouding van een deel van de knop, uit de pixels van een schermafdruk (zie dock-contrast.spec.ts). */
async function meet(page: Page, doel: "svg[data-pijl]", ringPx: number) {
  const vak = await page.locator(`${KNOP} ${doel}`).first().boundingBox()
  expect(vak).not.toBeNull()
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  const shot = (await page.screenshot()).toString("base64")
  return page.evaluate(
    async ({ shot, v, dpr, ringPx }) => {
      const img = new Image()
      img.src = "data:image/png;base64," + shot
      await img.decode()
      const c = document.createElement("canvas")
      c.width = img.width
      c.height = img.height
      const g = c.getContext("2d")!
      g.drawImage(img, 0, 0)
      const lum = (px: number[]) => {
        const f = (x: number) => {
          const s = x / 255
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(px[0]) + 0.7152 * f(px[1]) + 0.0722 * f(px[2])
      }
      const X = Math.round(v.x * dpr), Y = Math.round(v.y * dpr)
      const W = Math.round(v.width * dpr), H = Math.round(v.height * dpr)
      const PAD = Math.round(ringPx * dpr)
      // De ondergrond: de meest voorkomende kleur in de ring eromheen.
      const buiten = g.getImageData(X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2)
      const tel = new Map<string, number>()
      for (let yy = 0; yy < buiten.height; yy++)
        for (let xx = 0; xx < buiten.width; xx++) {
          if (xx >= PAD && xx < PAD + W && yy >= PAD && yy < PAD + H) continue
          const i = (yy * buiten.width + xx) * 4
          const k = `${buiten.data[i]},${buiten.data[i + 1]},${buiten.data[i + 2]}`
          tel.set(k, (tel.get(k) ?? 0) + 1)
        }
      let grond = [0, 0, 0], max = 0
      for (const [k, n] of tel) if (n > max) { max = n; grond = k.split(",").map(Number) }
      // De lijn: de pixel binnen het vak die het verst van die grond ligt.
      const binnen = g.getImageData(X, Y, W, H).data
      let lijn = grond, verst = 0
      for (let i = 0; i < binnen.length; i += 4) {
        const px = [binnen[i], binnen[i + 1], binnen[i + 2]]
        const d = Math.abs(lum(px) - lum(grond))
        if (d > verst) { verst = d; lijn = px }
      }
      const [hi, lo] = [lum(lijn), lum(grond)].sort((a, b) => b - a)
      return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2))
    },
    { shot, v: vak!, dpr, ringPx }
  )
}

test.describe("terug naar boven, desktop", () => {
  test.skip(({ isMobile }) => !!isMobile, "de telefoon heeft het Omhoog-vak in de dock")

  test("pas na scrollen zichtbaar, rechtsonder, met een naam", async ({ page }) => {
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    const knop = page.locator(KNOP)
    await expect(knop).toHaveAttribute("inert", "")
    await expect(page.getByRole("button", { name: "Omhoog" })).toHaveCount(0)

    await omlaag(page)
    await expect(knop).not.toHaveAttribute("inert", /.*/)
    await expect(page.getByRole("button", { name: "Omhoog" })).toBeVisible()
    const box = (await knop.boundingBox())!
    const vp = page.viewportSize()!
    // Alleen de pijl, in het midden (eigenaar, 27 sep 2026): geen tekst,
    // en het midden van het icoon valt op het midden van de knop.
    expect((await knop.innerText()).trim()).toBe("")
    const pijl = (await knop.locator("svg[data-pijl]").boundingBox())!
    expect(Math.abs(pijl.x + pijl.width / 2 - (box.x + box.width / 2))).toBeLessThanOrEqual(1)
    expect(Math.abs(pijl.y + pijl.height / 2 - (box.y + box.height / 2))).toBeLessThanOrEqual(1)
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(vp.width - (box.x + box.width)).toBeGreaterThanOrEqual(16)
    expect(vp.width - (box.x + box.width)).toBeLessThanOrEqual(40)
    expect(vp.height - (box.y + box.height)).toBeGreaterThanOrEqual(16)
    expect(vp.height - (box.y + box.height)).toBeLessThanOrEqual(40)
  })

  test("een klik brengt je naar boven en de focus naar de inhoud", async ({ page }) => {
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await omlaag(page, 3)
    await page.getByRole("button", { name: "Omhoog" }).click()
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBe(0)
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("main")
    await expect(page.locator(KNOP)).toHaveAttribute("inert", "")
  })

  test("minder beweging: meteen boven", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await metOpslag(page, { "gronn-a11y-motion": "reduced" })
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await omlaag(page, 3)
    await page.getByRole("button", { name: "Omhoog" }).click()
    await page.waitForTimeout(100)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test("de voortgangsring loopt vol met het scrollen, van boven", async ({ page }) => {
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    const ring = page.locator(`${KNOP} svg[data-ring]`)
    const cirkel = ring.locator("circle")
    await expect(ring).toHaveAttribute("aria-hidden", "true")
    const offset = () => cirkel.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset))
    const max = () => page.evaluate(() => document.documentElement.scrollHeight - innerHeight)

    // Bovenaan leeg, halverwege half, onderaan rond.
    expect(await offset()).toBeGreaterThan(98)
    await page.evaluate((y) => window.scrollTo(0, y / 2), await max())
    await expect.poll(offset).toBeLessThan(60)
    expect(await offset()).toBeGreaterThan(40)
    await page.evaluate((y) => window.scrollTo(0, y), await max())
    await expect.poll(offset).toBeLessThan(2)

    // Precies over de rand van de knop, en in de kleur van de pijl.
    const b = (await page.locator(KNOP).boundingBox())!
    const r = (await ring.boundingBox())!
    expect(Math.abs(r.x - b.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(r.width - b.width)).toBeLessThanOrEqual(1)
    const kleur = (sel: string, eig: "stroke" | "color") =>
      page.locator(sel).first().evaluate((el, e) => getComputedStyle(el)[e], eig)
    expect(await kleur(`${KNOP} svg[data-ring] circle`, "stroke")).toBe(await kleur(KNOP, "color"))
  })

  test("minder beweging: geen ring, wel de pijl", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await metOpslag(page)
    await page.goto("/nl")
    await page.waitForLoadState("networkidle")
    await omlaag(page)
    await expect(page.locator(`${KNOP} svg[data-ring]`)).toBeHidden()
    await expect(page.locator(`${KNOP} svg[data-pijl]`)).toBeVisible()
  })

  for (const [palet, pad] of [
    ["goldenhour", "/nl"],
    ["bluehour", "/nl"],
    ["goldenhour", VIJVER],
    ["bluehour", VIJVER],
  ] as const) {
    test(`pijl ≥ 3:1 op het glas (${palet}, ${pad === "/nl" ? "home" : "vijver"})`, async ({ page }) => {
      await metOpslag(page, { theme: palet, "gronn-theme-mode": "manual" })
      await page.goto(pad)
      await page.waitForLoadState("networkidle")
      for (const schermen of [1.5, 2.5]) {
        await omlaag(page, schermen)
        // De halo knippert; meet buiten zijn moment.
        await page.addStyleTag({ content: ".ember-halo{animation:none!important;opacity:0!important}" })
        expect(await meet(page, "svg[data-pijl]", 5), `pijl, ${schermen} schermen`).toBeGreaterThanOrEqual(3)
      }
    })
  }
})

test("telefoon: geen losse knop, de dock houdt de zijne", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon")
  await metOpslag(page)
  await page.goto("/nl")
  await page.waitForLoadState("networkidle")
  await omlaag(page)
  await expect(page.locator(KNOP)).toBeHidden()
  await expect(page.locator('[data-naar-boven="cirkel"]')).toBeAttached()
})
