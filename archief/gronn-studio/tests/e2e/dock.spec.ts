import { expect, test, type Page } from "@playwright/test"

// De telefoondock, gemeten op vier breedtes.
//
// ── WAAROM DIT BESTAND BESTAAT ─────────────────────────────────────
//
// Zijn voorganger, `menuwiel.spec.ts`, was 943 regels en mat een ding
// dat op vier breedtes tegelijk moest kloppen: acht slots op een
// poolcirkel, labels eronder, een tweede ring erbinnen. Dat had die 943
// regels nodig — en het ding is er alsnog aan bezweken.
//
// Dit is korter omdat het onderwerp eenvoudiger is. Zes vakken op één
// rij, altijd alle zes, altijd op dezelfde plaats. Wat er te meten valt
// is of het raster klopt en of niets onder de maat zakt.
//
// ── DE DRIE DIE ECHT IETS BEWIJZEN ─────────────────────────────────
//
// 1. Het midden van elk icoon tegen het midden van zijn capsule. Dit is
//    waar dit soort menu's op stukloopt: een `absolute` kind rekent zijn
//    procenten over de PADDINGBOX van zijn voorouder, een flexkind
//    verdeelt de CONTENTBOX. Die twee schelen precies de padding van de
//    balk, dus ze vallen in het midden samen en lopen naar de randen uit
//    elkaar. In de build waar deze pil vandaan komt is dat twee keer
//    gebeurd, met afwijkingen van −4 tot +4px, en beide keren viel het
//    alleen op de buitenste vakken op. Eén vak meten bewijst dus niets.
//
// 2. Elk tikdoel op 44 × 44. Tijdens het lezen verdwijnt de balk en
//    komen er drie losse cirkels voor in de plaats; dát gedrag staat in
//    `behaviors.spec.ts`, want het gaat over twee balken tegelijk.
//
// 3. Bij 125% tekst groeit de dock niet mee. Chroom in px, tekst in rem
//    (CLAUDE.md ontwerpregel 6). Dat is letterlijk de fout die de
//    wielknoppen van het podium joeg: één `size-11` maakte ze 55 × 55.

const DOCK = "nav[data-nav='dock']"
// De dock draagt twee lagen: het menu en, tijdens het lezen, drie losse
// cirkels. Alles hieronder meet het MENU, dus altijd via de rij.
const RIJ = `${DOCK} [data-dock-row]`
const BREEDTES = [320, 375, 390, 430] as const

type Vak = { naam: string; x: number; w: number; h: number; cx: number }

async function meet(page: Page) {
  return await page.evaluate((sel) => {
    const nav = document.querySelector(sel)
    if (!nav) return null
    const rij = nav.querySelector("[data-dock-row]")!
    const cap = nav.querySelector("[data-dock='capsule']")!
    const box = (e: Element) => {
      const b = e.getBoundingClientRect()
      return { x: b.x, w: b.width, h: b.height, cx: b.x + b.width / 2 }
    }
    const vakken = [...rij.querySelectorAll("a, button")].map((e) => ({
      naam: e.textContent?.trim() || "?",
      ...box(e),
    }))
    const icoon = nav.querySelector("a[aria-current='page'] svg")
    return {
      rij: box(rij),
      capsule: box(cap),
      capsuleZichtbaar: getComputedStyle(cap).opacity !== "0",
      vakken,
      afwijking: icoon ? Math.abs(box(icoon).cx - box(cap).cx) : null,
      viewport: document.documentElement.clientWidth,
    }
  }, DOCK)
}

test.describe("de telefoondock", () => {
  test.skip(({ isMobile }) => !isMobile, "de dock is telefoonchroom")

  for (const breedte of BREEDTES) {
    test(`op ${breedte}px staan de vijf vakken en haalt elk 44 × 44`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breedte, height: 780 })
      // `/nl` en niet een sectiepagina: de dienstkaarten lopen op 320px
      // horizontaal over (een bestaand gebrek in die kaarten, niet in de
      // pil), en dan is de nav zelf ook breder dan het venster. Dat zou
      // hier een fout melden die ergens anders zit.
      await page.goto("/nl", { waitUntil: "networkidle" })
      await page.waitForTimeout(600)

      const m = await meet(page)
      expect(m, "geen dock gevonden").not.toBeNull()

      const namen = m!.vakken.map((v: Vak) => v.naam)
      expect(namen).toEqual([
        "Home",
        "Diensten",
        "Projecten",
        "Studio",
        "Contact",
      ])

      for (const v of m!.vakken as Vak[]) {
        expect(v.w, `${v.naam} is te smal`).toBeGreaterThanOrEqual(44)
        expect(v.h, `${v.naam} is te laag`).toBeGreaterThanOrEqual(44)
      }

      // De rij blijft binnen het beeld. Niet de hele pagina — die kan om
      // heel andere redenen overlopen — maar de balk zelf.
      expect(m!.rij.x).toBeGreaterThanOrEqual(0)
      expect(m!.rij.x + m!.rij.w).toBeLessThanOrEqual(m!.viewport + 0.5)

      // En geen twee vakken overlappen elkaar.
      const v = m!.vakken as Vak[]
      for (let i = 1; i < v.length; i++) {
        expect(
          v[i].x,
          `${v[i].naam} ligt over ${v[i - 1].naam}`
        ).toBeGreaterThanOrEqual(v[i - 1].x + v[i - 1].w - 0.5)
      }
    })

    test(`op ${breedte}px staat het groen onder elk van de vijf`, async ({
      page,
    }) => {
      // Vijf volledige paginaladingen met networkidle: 30s is krap in de
      // volle ronde (gemeten 25 sep 2026), los laadt elke pagina < 3s.
      test.setTimeout(60_000)
      await page.setViewportSize({ width: breedte, height: 780 })

      for (const route of [
        "/nl",
        "/nl/services",
        "/nl/projects",
        "/nl/studio",
        "/nl/contact",
      ]) {
        // "load" + fonts, niet networkidle: die bleef in de volle ronde op
        // /nl/projects bij 320px hangen (25 sep 2026); de meting is opmaak.
        await page.goto(route, { waitUntil: "load" })
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(500)
        const m = await meet(page)
        expect(m!.capsuleZichtbaar, route).toBe(true)
        // Een halve pixel. Dat is scherp, en met opzet: de fout die dit
        // vangt was 4px en zou onder elke ruimere grens door glippen op
        // precies de vakken waar hij het kleinst is.
        expect(m!.afwijking, `${route} op ${breedte}px`).toBeLessThan(0.5)
      }
    })

    test(`op ${breedte}px groeit de dock niet mee met 125% tekst`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breedte, height: 780 })
      await page.goto("/nl", { waitUntil: "networkidle" })
      await page.waitForTimeout(500)
      const normaal = await meet(page)

      // Via de echte voorkeur, niet via een geïnjecteerde stijl: het is
      // die voorkeur die de wortelmaat op 125% zet, en het is precies
      // deze weg die ooit stilletjes uitging bij de hydratie.
      await page.evaluate(() => {
        localStorage.setItem("gronn-a11y-text", "larger")
      })
      await page.reload({ waitUntil: "networkidle" })
      await page.waitForTimeout(700)
      await expect(page.locator("html")).toHaveAttribute("data-text", "larger")

      const groot = await meet(page)

      // De HOOGTE is wat hier telt, en de padding eromheen. Die mogen
      // niet meegroeien, want daar zit het tikdoel in.
      //
      // De BREEDTE van een vak mag wél meebewegen: hij is een zesde van
      // de rij, en de rij vult zijn container. Daar is op 320px iets
      // vervelends aan de hand dat NIET van de dock is — bij 125% tekst
      // loopt de pagina-inhoud horizontaal over, en een `inset-x-0`-balk
      // groeit dan mee met het document. Dat is een echt gebrek en het
      // staat genoteerd, maar het hier meten zou een fout melden die
      // ergens anders zit.
      for (let i = 0; i < 5; i++) {
        const a = (normaal!.vakken as Vak[])[i]
        const b = (groot!.vakken as Vak[])[i]
        expect(b.h, `${a.naam} werd hoger bij 125% tekst`).toBeCloseTo(a.h, 0)
        expect(b.h, `${a.naam} zakte onder 44px`).toBeGreaterThanOrEqual(44)
      }
      // De labels (eigenaar, 25 sep 2026) hebben een vaste regelhoogte:
      // ze blijven even groot en blijven in hun vak.
      const lab = await page.evaluate(() =>
        [...document.querySelectorAll("nav[data-nav='dock'] [data-dock-row] a")].map((a) => {
          const l = a.querySelector("[data-dock-label]") as HTMLElement
          const v = a.getBoundingClientRect()
          const b = l.getBoundingClientRect()
          return {
            h: b.height,
            fs: getComputedStyle(l).fontSize,
            ff: getComputedStyle(l).fontFamily,
            binnen: b.top >= v.top - 0.5 && b.bottom <= v.bottom + 0.5 &&
              b.left >= v.left - 0.5 && b.right <= v.right + 0.5,
          }
        })
      )
      // Sinds 1 okt 2026 Montserrat zoals in de ING-app, 10–12px met de
      // schermbreedte (vw, dus niet met de tekstgrootte), regel 13px.
      for (const l of lab) {
        expect(l.h).toBeCloseTo(13, 0)
        expect(parseFloat(l.fs)).toBeGreaterThanOrEqual(10)
        expect(parseFloat(l.fs)).toBeLessThanOrEqual(12)
        expect(l.ff).toMatch(/montserrat/i)
        expect(l.binnen).toBe(true)
      }
      const pil = await page.locator("nav[data-nav='dock'] [data-dock-compact]").boundingBox()
      expect(pil!.height, "de leesstand werd hoger bij 125% tekst").toBeCloseTo(58, 0)
      expect(
        groot!.rij.h,
        "de rij werd hoger bij 125% tekst"
      ).toBeCloseTo(normaal!.rij.h, 0)

      // En de capsule blijft even hoog als zijn vak, dus hij kan niet
      // uit de rij groeien.
      expect(groot!.capsule.h).toBeCloseTo(normaal!.capsule.h, 0)
    })
  }

  // ── HET SCHERMTOETSENBORD ─────────────────────────────────────────
  //
  // Twee voorwaarden, en ze moeten allebei waar zijn. Een gekrompen
  // venster alleen bewijst niets: de adresbalk die inklapt tijdens
  // scrollen doet precies hetzelfde met de viewport, en een dock die
  // daarvoor wegduikt is stuk.
  test("de dock wijkt voor een toetsenbord, niet voor een adresbalk", async ({
    page,
  }) => {
    await page.goto("/nl/contact", { waitUntil: "networkidle" })
    await page.waitForTimeout(800)
    const nav = page.locator(RIJ)

    // Een kleiner venster zonder focus in een veld: hij blijft staan.
    await page.setViewportSize({ width: 390, height: 560 })
    await page.waitForTimeout(400)
    await expect(nav).not.toHaveClass(/translate-y-\[130%\]/)

    // Focus in een veld, zónder gekrompen visuele viewport (een
    // bluetooth-toetsenbord op een tablet): hij blijft óók staan. Dat is
    // de tweede voorwaarde, en zonder haar dook hij weg zodra iemand een
    // formulier aanraakte.
    const veld = page.locator("main input, main textarea").first()
    await veld.scrollIntoViewIfNeeded()
    await veld.focus()
    await page.waitForTimeout(400)
    await expect(nav).not.toHaveClass(/translate-y-\[130%\]/)
  })

  // ── DE KOMEET, OVERAL DEZELFDE ────────────────────────────────────
  //
  // Eigenaar, 25 sep 2026: "De comet wil ik ook op de bovenste dock, en
  // de vijf iconen in ingeklapte modus maak dat ook maar een dock met
  // een comet, dan is het gewoon overal hetzelfde." Eén bron (`Komeet`),
  // dus ook één animatie en één rand.
  test("de komeet loopt op de bovenbalk en op de dock in beide standen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 812 })
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.waitForTimeout(700)
    const dragers = await page.evaluate(() =>
      [
        "[data-nav='topbar'] [data-topbar-row]",
        "nav[data-nav='dock'] [data-dock-row]",
        "nav[data-nav='dock'] [data-dock-compact]",
      ].map((sel) => {
        const pil = document.querySelector(sel)!
        const k = pil.querySelectorAll(":scope > [data-komeet]")
        const a = k[0]?.getBoundingClientRect()
        const b = pil.getBoundingClientRect()
        return {
          sel,
          aantal: k.length,
          // De boog draait als ::before (een transform, op de
          // compositor); de rand zelf staat stil.
          animatie: k[0] ? getComputedStyle(k[0], "::before").animationName : null,
          // De boog ligt op de rand van zijn pil: `inset-0` meet binnen
          // de rand van 1px, dus hooguit 1px per kant verschil.
          past: a
            ? Math.abs(a.x - b.x) <= 1.5 && Math.abs(a.width - b.width) <= 2.5 &&
              Math.abs(a.height - b.height) <= 2.5
            : false,
        }
      })
    )
    for (const d of dragers) {
      expect(d.aantal, d.sel).toBe(1)
      expect(d.animatie, d.sel).toBe("orbit-ring")
      expect(d.past, d.sel).toBe(true)
    }
  })

  // ── MINDER BEWEGING ───────────────────────────────────────────────
  //
  // De voorkeur staat boven het besturingssysteem, in beide richtingen
  // (zie `use-a11y-prefs.ts`). Dit meet de kant die het vaakst stukgaat:
  // een animatie die doorloopt terwijl iemand om rust heeft gevraagd.
  test("met minder beweging staat de komeet en de halo stil", async ({
    page,
  }) => {
    await page.goto("/nl", { waitUntil: "networkidle" })
    await page.evaluate(() => {
      localStorage.setItem("gronn-a11y-motion", "reduced")
    })
    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(700)
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")

    const stil = await page.evaluate((sel) => {
      const nav = document.querySelector(sel)!
      const lees = (el: Element | null) => {
        if (!el) return null
        // De komeet draait op zijn ::before; de halo op zichzelf.
        const cs = getComputedStyle(el, el.hasAttribute("data-komeet") ? "::before" : null)
        return {
          naam: cs.animationName,
          duur: cs.animationDuration,
        }
      }
      // Alle drie de komeetdragers: de volle rij, de pil van de
      // leesstand en de bovenbalk (eigenaar, 25 sep 2026).
      const boven = document.querySelector("[data-nav='topbar']")!
      return {
        komeetRij: lees(nav.querySelector("[data-dock-row] [data-komeet]")),
        komeetLeesstand: lees(nav.querySelector("[data-dock-compact] [data-komeet]")),
        komeetBoven: lees(boven.querySelector("[data-komeet]")),
        halo: lees(nav.querySelector(".ember-halo")),
      }
    }, DOCK)

    for (const [wat, a] of Object.entries(stil)) {
      expect(a, `${wat} ontbreekt`).not.toBeNull()
      // Of de animatie is weg, of ze is tot stilstand geklemd door de
      // globale regel voor `data-motion="reduced"`.
      // De globale klem voor `data-motion="reduced"` zet de duur op
      // 0.01ms, wat de browser als "1e-05s" teruggeeft. Numeriek lezen
      // dus, niet als tekst vergelijken.
      const seconden = parseFloat(a!.duur)
      expect(
        a!.naam === "none" || seconden <= 0.001,
        `${wat} loopt nog: ${a!.naam} / ${a!.duur}`
      ).toBe(true)
    }
  })
})
