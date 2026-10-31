import { expect, test } from "@playwright/test"

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { SECTIONS, menuFor, menus, type MenuContent } from "@/lib/nav"

// Eén navigatiemodel, en de eigenschappen die elke renderer erop mag
// vertrouwen.
//
// WAAROM DIT EEN DATATEST IS EN GEEN BROWSERTEST. De navigatie was drie
// keer gebouwd — de pil op een telefoon, de kaart op een tablet, de balk
// op een desktop — en ze liepen uit elkaar. Nu beschrijft `menuFor()` wat
// er in een sectiemenu hoort en tekenen de drie componenten die uitkomst.
// Dat betekent dat de meeste fouten die vroeger alleen in één breedte
// zichtbaar waren, hier vallen: zonder browser, zonder build, in
// milliseconden.

// Rechtstreeks uit de gecommitte momentopname, niet via `getContent()`:
// die zit in `unstable_cache` en heeft een Next-request nodig, en dit is
// toch de bron die meegaat als er niets gepubliceerd is.
const content = async (): Promise<MenuContent> => {
  const { services, projects, articles } = JSON.parse(
    readFileSync(join(process.cwd(), "content/site-content.json"), "utf8")
  )
  return { services, projects, articles }
}

test.describe("het menumodel", () => {
  test("vier secties, en elke sectie heeft een menu", async () => {
    // Vier sinds V5 (sep 2026): het journaal is uit de site en uit het menu.
    const all = menus(await content())
    expect(all).toHaveLength(4)
    expect(all.map((m) => m.id)).toEqual(SECTIONS.map((s) => s.id))
  })

  test("geen enkele sectie opent een leeg vel", async () => {
    // Dit is de reden dat deze ronde bestaat. Projecten en Journaal
    // hadden lege `children`, dus hun menu zou opengaan en niets zeggen —
    // een tik die niets oplevert. Ze leiden hun inhoud nu af.
    const bare = menus(await content())
      .filter((m) => m.empty || m.groups.length === 0)
      .map((m) => m.id)
    expect(bare, bare.join(", ")).toEqual([])
  })

  test("elke regel wijst naar een pad, en elke groep draagt regels", async () => {
    for (const menu of menus(await content())) {
      for (const group of menu.groups) {
        // Een groep zonder regels is een kop die nergens heen gaat.
        expect(group.rows.length, `${menu.id}: lege groep`).toBeGreaterThan(0)
        for (const row of group.rows) {
          expect(row.href, `${menu.id}: regel zonder pad`).toMatch(/^\//)
          expect(row.label.nl, `${menu.id}: regel zonder label`).toBeTruthy()
          expect(row.label.en, `${menu.id}: regel zonder Engels label`).toBeTruthy()
        }
      }
    }
  })

  test("de diensten staan onder de drie niveaus, in volgorde", async () => {
    const menu = menuFor("services", await content())
    // Ontwerp, Aanleg, Onderhoud (eigenaar, 28 sep 2026).
    expect(menu.groups.map((g) => g.label?.nl)).toEqual([
      "Een plan dat klopt",
      "Handen in de grond",
      "Het hele jaar door",
    ])
    expect(menu.groups.map((g) => g.rows.length)).toEqual([6, 1, 4])
    // Elke dienst draagt zijn slug mee, zodat een renderer er de
    // vanafprijs bij kan zetten zonder dat nav.ts iets van prijzen weet.
    const slugs = menu.groups.flatMap((g) => g.rows.map((r) => r.service))
    expect(slugs.every(Boolean)).toBe(true)
    expect(new Set(slugs).size, "een dienst staat dubbel").toBe(slugs.length)
  })

  test("projecten groeien mee met hun eigen inhoud", async () => {
    const c = await content()

    const projects = menuFor("projects", c)
    const inMenu = projects.groups.flatMap((g) => g.rows.length)
    expect(inMenu.reduce((a, b) => a + b, 0)).toBe(c.projects.length)
    // Alleen categorieën die werkelijk projecten hebben: een kop zonder
    // projecten eronder is precies wat de lege secties al deden.
    expect(projects.groups.every((g) => g.rows.length > 0)).toBe(true)
  })

  test("een kop die niets overkoepelt verdwijnt, en komt terug als hij dat wel doet", () => {
    // Gemeten op verzonnen inhoud, niet op de echte: de echte verschuift
    // zodra de eigenaar een project toevoegt, en dan zou deze test iets
    // anders meten dan hij zegt te meten.
    //
    // Dit mat eerst het journaal; dat is met de V5-site (sep 2026) uit
    // het menu. Dezelfde drempelregel geldt voor projecten per categorie.
    const project = (slug: string, category: string) =>
      ({ slug, title: { en: slug, nl: slug }, category }) as unknown as MenuContent["projects"][number]
    const base = { services: [], articles: [] }

    // Vijf categorieën over zes projecten — één kop met gezelschap en
    // vier eenlingen. Dat is meer kader dan inhoud, dus: platte lijst.
    const thin = menuFor("projects", {
      ...base,
      projects: [
        project("a", "water"),
        project("b", "water"),
        project("c", "gardens"),
        project("d", "habitat"),
        project("e", "planting"),
        project("f", "consultation"),
      ],
    })
    expect(thin.groups).toHaveLength(1)
    expect(thin.groups[0].label).toBeUndefined()
    expect(thin.groups[0].rows).toHaveLength(6)

    // Twee categorieën van twee: de koppen verdienen hun plek.
    const fat = menuFor("projects", {
      ...base,
      projects: [project("a", "water"), project("b", "water"), project("c", "gardens"), project("d", "gardens")],
    })
    expect(fat.groups.map((g) => g.label?.nl).sort()).toEqual(["Ecologisch waterontwerp", "Tuintransformatie"])
  })

  test("de eigen pagina van een sectie blijft altijd bereikbaar", async () => {
    // De kinderen zijn waar een sectie heen gaat, niet wat hij is. Een
    // menu dat alleen zijn kinderen toont maakt de sectiepagina zelf
    // onbereikbaar, en dat is eerder gebeurd.
    for (const menu of menus(await content())) {
      expect(menu.href).toMatch(/^\//)
      expect(menu.label.nl).toBeTruthy()
      expect(menu.note.nl).toBeTruthy()
    }
  })
})
