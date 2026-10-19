import { expect, test } from "@playwright/test"

// Muziek standaard aan, start bij de eerste tik, zwevende knop rechts midden
// zet hem uit en dat blijft bewaard; weg van de site = pauze (19 okt 2026).
test("muziek: aan na eerste tik, knop zet uit en onthoudt", async ({ context, page }) => {
  // Tel play/pause op de speler, los van of de browser het mp3 echt afspeelt.
  await context.addInitScript(() => {
    const w = window as unknown as { log: string[] }
    w.log = []
    HTMLMediaElement.prototype.play = function () { w.log.push("play"); return Promise.resolve() }
    HTMLMediaElement.prototype.pause = function () { w.log.push("pause") }
  })
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

  await page.mouse.click(vp.width / 2, 200)
  await expect.poll(log).toBe("play")

  await knop.click()
  await expect(knop).toHaveAttribute("aria-label", "Muziek aan")
  expect(await log()).toBe("play,pause")
  // Een tweede tabblad in plaats van reload: op CI breekt een tweede
  // navigatie op dezelfde pagina soms af (ERR_ABORTED).
  const tweede = await context.newPage()
  await tweede.goto("/")
  await expect(tweede.locator("button[data-muziek]")).toHaveAttribute("aria-label", "Muziek aan")
  await tweede.mouse.click(vp.width / 2, 200)
  await tweede.waitForTimeout(300)
  expect(await tweede.evaluate(() => (window as unknown as { log: string[] }).log.join(","))).toBe("")
})
