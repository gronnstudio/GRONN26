import { expect, test } from "@playwright/test"

// De diensten op de voorpagina schuiven op de telefoon over elkaar
// (LinkShowcase). Van een ondergeschoven kaart blijft de rij met tegel en
// "01 · Ontwerp" zichtbaar: met 14px bleven er lege randen over en las de
// stapel als ingeklapt (eigenaar, 3 okt 2026: "Wat gebeurt hier met
// inklappen?"). En onder de laatste kaart geen extra gat.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

test("telefoon: elke ondergeschoven kaart laat zijn nummer en soort zien", async ({ page, isMobile }) => {
  test.skip(!isMobile, "de stapel is er alleen onder sm")
  await page.goto("/nl")
  const kaarten = page.locator("[data-showcase-kaart]")
  await expect(kaarten).toHaveCount(3)

  const maten = await kaarten.evaluateAll((ks) =>
    ks.map((k) => {
      const kop = k.querySelector(".tekst-annotatie")!.getBoundingClientRect()
      return { top: parseFloat(getComputedStyle(k).top), kaart: k.getBoundingClientRect().top, label: kop.bottom }
    })
  )
  const stap = maten[1].top - maten[0].top
  expect(maten[2].top - maten[1].top).toBe(stap)
  // Het label van elke kaart valt binnen de rand die de volgende kaart vrijlaat.
  for (const m of maten) expect(m.label - m.kaart).toBeLessThanOrEqual(stap)

  // Opgeschoven tot de laatste kaart op zijn plek ligt: alle drie de labels in beeld.
  const lijst = page.locator('[data-element="LinkShowcase"]')
  await lijst.evaluate((u) => {
    const laatste = u.lastElementChild as HTMLElement
    scrollTo(0, laatste.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(laatste).top))
  })
  for (const soort of ["01 · Ontwerp", "02 · Aanleg", "03 · Onderhoud"]) {
    const label = lijst.getByText(soort, { exact: true })
    const zichtbaar = await label.evaluate((n) => {
      const r = n.getBoundingClientRect()
      const boven = document.elementFromPoint(r.left + 4, r.top + r.height / 2)
      return !!boven && n.contains(boven)
    })
    expect(zichtbaar, soort).toBe(true)
  }

  // Geen opvulling onder de laatste kaart: die liet een leeg gat achter.
  const gat = await lijst.evaluate((u) => u.getBoundingClientRect().bottom - u.lastElementChild!.getBoundingClientRect().bottom)
  expect(gat).toBe(0)
})
