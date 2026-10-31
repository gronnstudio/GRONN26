import { expect, test } from "@playwright/test"

// Foto's op kaarten staan tot aan de rand van de kaart, met een rechte kant
// naar de tekst; de hoeken komen van de kaart zelf (eigenaar, 3 okt 2026:
// "Maak de fotos op kaarten recht bovenkant en vul de ruimte op").

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})


test("home: de foto van het uitgelichte project vult het vlak tot de rand", async ({ page }) => {
  await page.goto("/nl")
  const vlak = page.locator('section[aria-labelledby="project-kop"] [data-element="BosVlak"]')
  await vlak.scrollIntoViewIfNeeded()
  const foto = vlak.locator('[data-element="Beeld"] > div').first()
  // Kaart en foto in één meting, na de lettertypes: een late font-swap
  // tussen twee metingen verschoof de kaart eerder 24px.
  await page.evaluate(() => document.fonts.ready)
  const { k, f } = await vlak.evaluate((n) => {
    const r = (el: Element) => {
      const b = el.getBoundingClientRect()
      return { x: b.left, y: b.top, width: b.width, height: b.height }
    }
    return { k: r(n), f: r(n.querySelector('[data-element="Beeld"] > div')!) }
  })
  const breed = page.viewportSize()!.width >= 1024
  // Rechts en onder altijd tegen de rand; op de telefoon ook links.
  expect(Math.abs(k.x + k.width - (f.x + f.width))).toBeLessThanOrEqual(1)
  expect(Math.abs(k.y + k.height - (f.y + f.height))).toBeLessThanOrEqual(1)
  if (breed) expect(Math.abs(k.y - f.y)).toBeLessThanOrEqual(1)
  else expect(Math.abs(k.x - f.x)).toBeLessThanOrEqual(1)
  expect(await foto.evaluate((n) => getComputedStyle(n).borderTopLeftRadius)).toBe("0px")
})

test("/projects: geen eigen afronding op de kaartfoto's, de breedte gevuld", async ({ page }) => {
  await page.goto("/nl/projects")
  const kaarten = page.locator("main ul > li a[data-cursor]")
  await expect(kaarten).toHaveCount(2)
  for (let i = 0; i < 2; i++) {
    const kaart = kaarten.nth(i)
    await kaart.scrollIntoViewIfNeeded()
    const img = kaart.locator("img").first()
    await page.evaluate(() => document.fonts.ready)
    const [k, f] = await kaart.evaluate((n) =>
      [n, n.querySelector("img")!].map((el) => {
        const b = el.getBoundingClientRect()
        return { x: b.left, y: b.top, width: b.width }
      }),
    )
    // Links en boven tegen de rand van de kaart (de rand van 1px meegeteld).
    expect(Math.abs(k.x - f.x)).toBeLessThanOrEqual(1.5)
    expect(Math.abs(k.y - f.y)).toBeLessThanOrEqual(1.5)
    const rond = await img.evaluate((n) => {
      for (let el: Element | null = n; el && !el.matches("a"); el = el.parentElement) {
        if (getComputedStyle(el).borderTopLeftRadius !== "0px") return getComputedStyle(el).borderTopLeftRadius
      }
      return "0px"
    })
    expect(rond, `kaart ${i + 1}`).toBe("0px")
    if (page.viewportSize()!.width < 1024) expect(Math.abs(k.width - f.width)).toBeLessThanOrEqual(2)
  }
})
