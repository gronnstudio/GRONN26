import { expect, test } from "./fixtures"

// Muziek standaard aan, start bij de eerste tik, zwevende knop rechts midden
// zet hem uit en dat blijft bewaard; weg van de site = pauze (19 okt 2026).
test("muziek: aan na eerste tik, knop zet uit en onthoudt", async ({ context, page }) => {
  // Tel play/pause op de speler, los van of de browser het mp3 echt afspeelt.
  await context.addInitScript(() => {
    // Zonder intro: anders ligt het doek seconden lang over de knop.
    sessionStorage.setItem("gronn-intro", "1")
    const w = window as unknown as { log: string[] }
    w.log = []
    HTMLMediaElement.prototype.play = function () { w.log.push("play"); return Promise.resolve() }
    HTMLMediaElement.prototype.pause = function () { w.log.push("pause") }
  })
  // Onder belasting is de pagina soms pas na seconden gehydrateerd; een tik
  // daarvoor valt weg. Dus ruimer de tijd, en tikken tot hij speelt (na de
  // eerste tik die telt luistert de site niet meer, dus nooit twee keer play).
  test.setTimeout(60_000)
  const log = () => page.evaluate(() => (window as unknown as { log: string[] }).log.join(","))
  await page.goto("/")
  await page.waitForTimeout(500)
  expect(await log()).toBe("")
  const knop = page.locator("button[data-muziek]")
  await expect(knop).toHaveAttribute("aria-label", "Muziek uit")
  const vak = await knop.boundingBox()
  const vp = page.viewportSize()!
  expect(Math.abs(vak!.y + vak!.height / 2 - vp.height / 2)).toBeLessThan(4)
  expect(vp.width - (vak!.x + vak!.width)).toBeLessThan(24)

  await expect(async () => {
    await page.mouse.click(vp.width / 2, 200)
    expect(await log()).toBe("play")
  }).toPass({ timeout: 20_000 })

  await knop.click()
  await expect(knop).toHaveAttribute("aria-label", "Muziek aan")
  expect(await log()).toBe("play,pause")
  // Een tweede tabblad in plaats van reload: op CI breekt een tweede
  // navigatie soms af (ERR_ABORTED), ook in een nieuw tabblad; dan nog eens.
  const tweede = await context.newPage()
  for (let poging = 1; ; poging++) {
    try {
      await tweede.goto("/", { waitUntil: "domcontentloaded" })
      break
    } catch (fout) {
      if (poging === 3) throw fout
    }
  }
  await expect(tweede.locator("button[data-muziek]")).toHaveAttribute("aria-label", "Muziek aan", { timeout: 15_000 })
  await tweede.mouse.click(vp.width / 2, 200)
  await tweede.waitForTimeout(300)
  expect(await tweede.evaluate(() => (window as unknown as { log: string[] }).log.join(","))).toBe("")
})
