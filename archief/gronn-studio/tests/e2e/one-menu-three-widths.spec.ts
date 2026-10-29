import { expect, test, type Page } from "@playwright/test"

// Dezelfde vijf secties, dezelfde regels, op alle drie de breedtes.
//
// WAAROM DIT BESTAAT. De navigatie was drie keer gebouwd — de zwevende
// pil onder 768px, de kaart tussen 768 en 1024, de balk daarboven — en
// drie implementaties die in de pas moeten blijven zijn drie
// implementaties die uit de pas lopen. Dat is deze zomer twee keer
// gebeurd, en de derde keer stond er al toen deze test werd geschreven:
//
//   De telefoondock las `menuFor()` en toonde onder Projecten zes
//   projecten. De tabletkaart las `section.children`, en die is leeg voor
//   Projecten en Journaal — dus daar stond een kop zonder één regel
//   eronder. De balk had voor die twee secties helemaal geen lijst, maar
//   een kop, een zin en één uitgelichte foto.
//
// Niets crashte, niets zag er kapot uit, en het was op geen enkele
// pagina te merken zonder de drie naast elkaar te leggen. Dus legt deze
// test ze naast elkaar.
//
// HET GAAT OVER INHOUD, NIET OVER VORM. Een duim en een muis krijgen
// terecht een ander oppervlak: de dock opent één sectie tegelijk, de
// kaart toont alles onder elkaar, de balk hangt een paneel per sectie.
// Wat er IN staat mag niet verschillen. Daarom meet dit de hrefs en niet
// de opmaak.

/** Elke href die in een menu-oppervlak te vinden is, ontdaan van locale. */
const hrefsIn = (page: Page, selector: string) =>
  page.locator(selector).evaluate((root) =>
    Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href") ?? "")
      .map((h) => h.replace(/^\/(nl|en)(?=\/|$)/, ""))
      .filter((h) => h.startsWith("/"))
  )

/** De rijen die een sectiemenu hoort te dragen, per sectie. */
// Sinds V5 (sep 2026): geen werkwijze, lab of journaal meer; het
// Studio-paneel draagt de twee delen van "Over Nick", en sinds 24 sep
// 2026 weer de techniekpagina.
const EXPECTED: Record<string, string[]> = {
  Studio: ["/studio#uitgangspunten", "/studio#manifest", "/stack"],
  Contact: ["/contact#seasonal"],
}

test.describe("één navigatiemodel, drie breedtes", () => {
  // ── De telefoon: vijf bestemmingen, geen vellen ────────────────────
  //
  // Deze test las de sectievellen van het menuwiel: tik een slot, lees
  // wat eronder openklapt. Die vellen bestaan niet meer. De dock
  // navigeert rechtstreeks, en de lijst die het vel droeg staat op de
  // sectiepagina zelf — één lijst in plaats van twee.
  //
  // Wat overblijft om hier te bewaken is of de vijf vakken werkelijk
  // naar hun sectie gaan, en of de twee die niet in de dock staan
  // (Werkwijze en Journaal) nog ergens vandaan bereikbaar zijn. Dát de
  // sectiepagina's compleet zijn wordt hieronder op de balk en de
  // tabletkaart gemeten, uit dezelfde `menuFor()`.
  test("de telefoondock brengt je naar elk van de vijf", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "de dock is telefoonchroom")

    // De rij, niet de hele nav: de ingeklapte laag draagt óók een Home.
    const DOCK = "nav[data-nav='dock'] [data-dock-row]"
    const doel: Record<string, RegExp> = {
      Home: /^\/(nl|en)?$/,
      Diensten: /\/services$/,
      Projecten: /\/projects$/,
      Studio: /\/studio$/,
      Contact: /\/contact$/,
    }

    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(1500)

    for (const [label, href] of Object.entries(doel)) {
      await expect(
        page.locator(DOCK).getByRole("link", { name: label, exact: true })
      ).toHaveAttribute("href", href)
    }

    // En ze navigeren ook echt — een href die klopt maar niet aankomt is
    // geen menu.
    await page.locator(DOCK).getByRole("link", { name: "Diensten", exact: true }).click()
    await page.waitForURL(/\/services$/)
    // Sinds de labels (25 sep 2026) is het zichtbare label de naam.
    await expect(
      page.locator(`${DOCK} a[aria-current='page']`)
    ).toHaveAccessibleName("Diensten")
  })

  // Werkwijze en Journaal hebben geen eigen vak meer. Ze mogen daarom
  // niet onbereikbaar worden: ze vallen onder Studio, en Studio licht op
  // als je erop staat. Dat is de belofte die deze verschuiving draagt.
  test("een pagina onder Studio laat Studio branden", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "de dock is telefoonchroom")
    // Werkwijze en journaal vielen hier eerst onder; die zijn er sinds
    // V5 niet meer. De eigen pagina blijft het bewijs dat de regel werkt.
    await page.goto("/nl/studio", { waitUntil: "networkidle" })
    const actief = page.locator("nav[data-nav='dock'] [data-dock-row] a[aria-current='page']")
    await expect(actief).toHaveCount(1)
    await expect(actief).toHaveAccessibleName("Studio")
  })

  test("elk balkpaneel draagt de regels van zijn sectie", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "de balk begint bij lg")
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    // Waar de regels van een sectie naartoe wijzen. Voor drie van de
    // vier is dat de sectie zelf; Studio's kinderen hebben hun eigen
    // adressen, want /approach hangt onder Studio zonder eronder te
    // wonen.
    const rowsOf: Record<string, (href: string) => boolean> = {
      studio: (h) => h.startsWith("/studio#"),
      services: (h) => h.startsWith("/services/"),
      projects: (h) => h.startsWith("/projects/"),
    }

    for (const [label, id] of [
      ["Studio", "studio"],
      ["Diensten", "services"],
      ["Projecten", "projects"],
    ] as const) {
      await page.getByRole("button", { name: label, exact: true }).click()
      const panel = page.locator(`#bar-panel-${id}`)
      await expect(panel).toBeVisible()
      const hrefs = await hrefsIn(page, `#bar-panel-${id}`)

      // De regressie waar dit bestand voor geschreven is: Projecten en
      // Journaal droegen hier géén lijst, alleen een uitgelichte kaart.
      // Eén foto is geen menu.
      const own = hrefs.filter(rowsOf[id])
      // Projecten heeft sinds V5 alleen echt werk, en dat is nu één
      // project; de lijst moet het dan wél dragen.
      expect(
        own.length,
        `${label} draagt alleen een uitgelichte kaart en geen lijst`
      ).toBeGreaterThanOrEqual(id === "projects" ? 1 : 2)
    }
  })

  // ── De kaart: alle vijf tegelijk ────────────────────────────────────
  //
  // Deze draait op `desktop` (viewport 1280) noch op `mobile`, want het
  // is de band ertussen. De viewport wordt hier expliciet gezet.
  test("de tabletkaart draagt alle secties compleet", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "de kaart zit tussen md en lg")
    await page.setViewportSize({ width: 900, height: 1000 })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    await page.locator("button[aria-controls='tablet-menu']").click()
    await expect(page.locator("#tablet-menu")).toBeVisible()
    const hrefs = await hrefsIn(page, "#tablet-menu")

    for (const section of ["/studio", "/services", "/projects", "/contact"]) {
      expect(hrefs, `${section} ontbreekt op de kaart`).toContain(section)
    }
    for (const child of [...EXPECTED.Studio, ...EXPECTED.Contact]) {
      expect(hrefs, `${child} ontbreekt op de kaart`).toContain(child)
    }
    // Projecten en Journaal stonden hier als kale koppen.
    expect(
      hrefs.filter((h) => h.startsWith("/projects/")).length,
      "Projecten is een kop zonder projecten"
    ).toBeGreaterThan(0)
    expect(hrefs.filter((h) => h.startsWith("/services/")).length)
      .toBeGreaterThanOrEqual(10)
  })

  // De tabletkaart is het enige oppervlak dat de hele boom tegelijk
  // toont, dus hij is ook de enige die ALLES moet dragen wat de vier
  // balkpanelen samen dragen. Eén vergelijking, en scheefgroei tussen
  // die twee wordt een falende test in plaats van een ontdekking.
  test("de kaart mist niets wat de balk wel heeft", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "beide oppervlakken zitten boven md")
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(3500)

    const fromBar = new Set<string>()
    for (const [label, id] of [
      ["Studio", "studio"],
      ["Diensten", "services"],
      ["Projecten", "projects"],
    ] as const) {
      await page.getByRole("button", { name: label, exact: true }).click()
      await expect(page.locator(`#bar-panel-${id}`)).toBeVisible()
      for (const h of await hrefsIn(page, `#bar-panel-${id}`)) fromBar.add(h)
    }

    await page.setViewportSize({ width: 900, height: 1000 })
    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(3500)
    await page.locator("button[aria-controls='tablet-menu']").click()
    await expect(page.locator("#tablet-menu")).toBeVisible()
    const fromCard = new Set(await hrefsIn(page, "#tablet-menu"))

    // Alleen de echte bestemmingen vergelijken. De balk draagt meubilair
    // dat de kaart bewust niet heeft — de uitgelichte foto's, de
    // inlogknop, de externe kanalen — en dat is vorm, geen inhoud.
    const destinations = (set: Set<string>) =>
      [...set].filter((h) => /^\/(studio|services|projects|contact)/.test(h))

    const missing = destinations(fromBar).filter((h) => !fromCard.has(h))
    expect(missing, `de kaart mist: ${missing.join(", ")}`).toEqual([])
  })
})
