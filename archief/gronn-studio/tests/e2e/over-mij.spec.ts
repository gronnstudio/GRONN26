import { expect, test } from "@playwright/test"

// "Over mij" is Nicks eigen tekst, aangeleverd op 23 sep 2026 met de
// opdracht "letterlijk 1:1". De tekst staat hier NOG EENS, los van
// src/components/gronn/teksten.ts, zodat een goedbedoelde redactie daar
// deze toets laat falen in plaats van ongemerkt live te gaan.
const OVER_MIJ = [
  "Ik ben Nick Peters. Vader van twee kinderen, hovenier, ecologisch ontwerper en de persoon achter GRØNN Studio.",
  "Ik denk in beelden, patronen en verbanden. Als ik naar een tuin kijk, zie ik hoe licht, water, materialen en beplanting elkaar beïnvloeden. Maar ik ben ook benieuwd naar wie er leeft. Waar drink je ’s ochtends je koffie? Waar spelen de kinderen? En waar kom je na een drukke dag tot rust? Juist die dagelijkse dingen geven richting aan wat ik maak.",
  "Mijn liefde voor bouwen en zorgen kreeg ik van huis uit mee. Ik groeide op in een warm, praktisch gezin, waar aandacht en respect vanzelfsprekend waren. Mijn moeder liet me zien hoeveel het betekent om aanwezig te zijn. Met mijn vader verbouwde ik huizen. Daar leerde ik werken met mijn handen, oplossingen zoeken en doorzetten wanneer iets anders loopt dan bedacht.",
  "Mijn eigen weg verliep minder vanzelfsprekend. Binnen school en vaste systemen voelde ik me vaak niet op mijn plek. Later gaf de diagnose autisme woorden aan dingen die ik al langer ervoer. Buiten vond ik rust: in tuinieren, dieren, observeren en bezig zijn. De natuur is altijd een plek geweest waar ik me thuis voel.",
  "Het vaderschap maakte voor mij nog duidelijker wat belangrijk is: aandacht geven, verantwoordelijkheid nemen en een omgeving creëren waarin iemand zich veilig voelt. Dat neem ik mee in mijn werk. Ik luister, kijk zorgvuldig en wil begrijpen wat een plek voor iemand moet betekenen.",
  "In GRØNN Studio komen mijn manier van kijken en mijn plezier in maken samen. Ik wil tuinen ontwerpen en aanleggen waarin mensen zich thuis voelen en waarin ook ruimte is voor ander leven. Dat begint bij de bodem, bij hoe water zijn weg vindt en bij planten die passen bij de plek. Ik kijk daarbij ook vooruit: hoe groeit een tuin verder, hoe verandert hij met de seizoenen en welk onderhoud past bij de eigenaar?",
  "Thuis en in mijn werk zijn er altijd planten, ideeën en projecten. Vaak ook modder. Ik blijf nieuwsgierig naar hoe dingen groeien en hoe ik ze beter kan maken.",
  "Met die aandacht werk ik ook aan jouw tuin.",
]

test("/nl/studio draagt Nicks tekst letterlijk, volledig en op volgorde", async ({ page }) => {
  await page.goto("/nl/studio")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Over mij")
  const alineas = await page.locator("[data-over-mij]").allTextContents()
  expect(alineas).toEqual(OVER_MIJ)
})

test("de voorpagina opent met de eerste twee alinea's, letterlijk", async ({ page }) => {
  await page.goto("/nl")
  for (const alinea of OVER_MIJ.slice(0, 2)) {
    await expect(page.getByText(alinea, { exact: true })).toBeVisible()
  }
  await expect(page.getByRole("link", { name: "Lees mijn hele verhaal" })).toHaveAttribute("href", "/nl/studio")
})

// De bureautaal die Nicks eigen stem verving. Komt er een van terug, dan
// is dat bijna altijd een oude tekst die via een omweg weer opduikt.
const BUREAUTAAL = [
  /levende systemen/i,
  /ecologische intelligentie/i,
  /ontwerpbureau/i,
  /landschapstransformatie/i,
  /regeneratie(f|ve) tuinontwerp/i,
  /habitatintegratie/i,
]

for (const path of ["/nl", "/nl/studio", "/nl/services", "/nl/services/garden-design", "/nl/services/consultancy", "/nl/projects", "/nl/contact"]) {
  test(`geen bureautaal op ${path}`, async ({ page }) => {
    await page.goto(path)
    const tekst = await page.locator("body").innerText()
    const gevonden = BUREAUTAAL.filter((r) => r.test(tekst)).map(String)
    expect(gevonden, path).toEqual([])
  })
}
