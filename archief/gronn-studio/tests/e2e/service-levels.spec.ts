import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import {
  SERVICES,
  SERVICE_GROUPS,
  levelOf,
  servicesInGroup,
  type Service,
  type ServiceKind,
} from "@/lib/data/services"
import { DIENST_VOLGORDE } from "@/lib/iconen"

// De drie instapniveaus, en de twee bronnen die het over dezelfde
// diensten eens moeten zijn.
//
// WAAROM DIT BESTAAT. De diensten staan op twee plekken: de getypte
// array in `src/lib/data/services.ts` en de gecommitte momentopname in
// `content/site-content.json`, die de pagina's werkelijk renderen (de
// editor schrijft over die tweede heen). Toen de niveaus in de eerste
// werden gezet en niet in de tweede, viel het op /services zo uit:
//
//     advies 0 · ontwerp 6 · aanleg 5
//
// in plaats van 2 · 4 · 5 — want zonder `kind` valt een dienst terug op
// het middelste niveau, en `pond-survey` stond nog als `seasonal`. De
// pagina zag er intact uit; alleen de indeling klopte niet. Precies het
// soort fout waar niemand op klikt.
//
// Sinds 28 sep 2026 (eigenaar) zijn de niveaus Ontwerp / Aanleg /
// Onderhoud, gelijk aan de huisstijl en de iconen: advies aan huis en de
// vijverdoorlichting openen Ontwerp, het seizoenswerk en het abonnement
// zijn Onderhoud. De telling is 6 · 1 · 4.

const ROOT = process.cwd()
type ContentService = { slug: string; kind?: string }
const contentServices = (): ContentService[] =>
  JSON.parse(readFileSync(join(ROOT, "content/site-content.json"), "utf8"))
    .services

test.describe("de drie instapniveaus", () => {
  test("de twee bronnen delen elke dienst in op hetzelfde niveau", () => {
    const inCode = new Map(SERVICES.map((s) => [s.slug, levelOf(s)]))
    const mismatched: string[] = []

    for (const entry of contentServices()) {
      const code = inCode.get(entry.slug)
      if (!code) continue // alleen in de content: geen tegenhanger om mee te vergelijken
      const content = levelOf(entry as Service)
      if (content !== code) {
        mismatched.push(`${entry.slug}: json=${content} code=${code}`)
      }
    }
    expect(mismatched, mismatched.join(" · ")).toEqual([])
  })

  test("elke dienst in de content noemt zijn niveau met zoveel woorden", () => {
    // Niet "levelOf geeft iets terug" — dat doet hij altijd, want hij
    // heeft een terugval. De vraag is of de dienst het zélf zegt. De
    // terugval is er voor iets dat de eigenaar in /editor aanmaakt, niet
    // als slaapplaats voor de elf die hier al staan.
    const silent = contentServices()
      .filter((s) => !["ontwerp", "aanleg", "onderhoud"].includes(s.kind ?? ""))
      .map((s) => `${s.slug} (${s.kind ?? "geen"})`)
    expect(silent, silent.join(", ")).toEqual([])
  })

  test("elk niveau draagt diensten, en samen dragen ze alles", () => {
    // Een niveau zonder diensten is een lege kop in elk menu, en dat is
    // precies wat deze ronde wilde afschaffen.
    const counts = SERVICE_GROUPS.map((g) => ({
      kind: g.kind,
      n: servicesInGroup(SERVICES, g.kind).length,
    }))
    for (const { kind, n } of counts) {
      expect(n, `niveau ${kind} is leeg`).toBeGreaterThan(0)
    }
    // En geen dienst valt tussen wal en schip of telt dubbel.
    expect(counts.reduce((sum, c) => sum + c.n, 0)).toBe(SERVICES.length)
  })

  test("de niveaus staan in de volgorde waarin een tuin ze doorloopt", () => {
    // Ontwerp, aanleg, onderhoud: dezelfde drie en dezelfde volgorde als
    // de diensticonen. Advies aan huis staat vooraan in Ontwerp, zodat
    // wie alleen wil laten meekijken dat nog steeds als eerste tegenkomt.
    expect(SERVICE_GROUPS.map((g) => g.kind)).toEqual(["ontwerp", "aanleg", "onderhoud"])
    expect(SERVICE_GROUPS.map((g) => g.kind)).toEqual([...DIENST_VOLGORDE])
  })

  test("de indeling van 28 sep 2026: 6 ontwerp, 1 aanleg, 4 onderhoud", () => {
    const per = (kind: ServiceKind) => servicesInGroup(SERVICES, kind).map((s) => s.slug).sort()
    expect(per("ontwerp")).toEqual(
      ["consultancy", "garden-design", "garden-transformation", "planting-habitat", "pond-survey", "water-systems"]
    )
    expect(per("aanleg")).toEqual(["implementation"])
    expect(per("onderhoud")).toEqual(["leaf-net", "maintenance-subscription", "pond-autumn-service", "winterising"])
  })

  // WAT DE HERNOEMING WÉRKELIJK BRAK, en wat geen enkele test zag.
  //
  // `kind` werd op drie plekken rechtstreeks vergeleken met de oude
  // waarden, buiten `levelOf` om. Na de hernoeming was elk van die drie
  // vergelijkingen stilletjes altijd onwaar:
  //
  //   • de homepagina filterde `kind !== "seasonal"` en groeide dus van
  //     zes kaarten naar elf;
  //   • `DATED_SERVICES` verzamelde `kind === "seasonal"` en het
  //     seizoensbord kromp van zes diensten naar vier;
  //   • elke dienstpagina noemde zichzelf "Ontwerp" in zijn eigen
  //     bovenregel en bood het ontwerpintro aan in plaats van de
  //     postcodecheck.
  //
  // Niets crashte. Eén regel in `seasons.spec.ts` merkte het, en dat was
  // toeval — die test ging over sorteervolgorde.
  //
  // Dus: de bron zelf is de assertie. `levelOf` mag `kind` lezen, want
  // dat is waar de terugval hoort; verder leest niemand hem rechtstreeks.
  test("niemand vergelijkt `kind` buiten levelOf om", () => {
    const LEGACY = /\bkind\s*(===|!==)\s*["'](design|seasonal|advies|ontwerp|aanleg|onderhoud)["']/
    const offenders: string[] = []

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(path)
          continue
        }
        if (!/\.tsx?$/.test(entry.name)) continue
        // Waar de terugval woont. Dit is de ENIGE plek die `kind` mag
        // uitpakken, en dat is het hele punt van de regel.
        if (path.endsWith(join("lib", "data", "services.ts"))) continue
        readFileSync(path, "utf8")
          .split("\n")
          .forEach((line, i) => {
            // Commentaar telt niet. De drie plekken die dit opving
            // dragen nu allemaal een regel die de oude vergelijking
            // CITEERT om uit te leggen waarom hij weg is, en een test
            // die zijn eigen verklaring afkeurt is een test die vraagt
            // om weggehaald te worden.
            const code = line.trim()
            if (code.startsWith("//") || code.startsWith("*")) return
            if (LEGACY.test(line)) offenders.push(`${path}:${i + 1}`)
          })
      }
    }
    walk(join(ROOT, "src"))
    expect(offenders, offenders.join("\n")).toEqual([])
  })

  test("oude opgeslagen waarden verdwijnen niet uit de menu's", () => {
    // Diensten die de eigenaar vóór deze ronde in /editor bewerkte
    // dragen `design` of `seasonal`. Die mogen nergens uit beeld vallen.
    expect(levelOf({ kind: "seasonal" } as Service)).toBe("onderhoud")
    expect(levelOf({ kind: "design" } as Service)).toBe("ontwerp")
    expect(levelOf({} as Service)).toBe("ontwerp")
  })

  test("advies van vóór 28 sep 2026 landt in ontwerp", () => {
    // De drie niveaus van aug–sep 2026 hadden `advies`; een document dat
    // de eigenaar toen in /editor publiceerde, draagt dat nog.
    expect(levelOf({ kind: "advies" } as Service)).toBe("ontwerp")
    expect(levelOf({ slug: "consultancy", kind: "advies" } as Service)).toBe("ontwerp")
    expect(levelOf({ slug: "pond-survey", kind: "advies" } as Service)).toBe("ontwerp")
  })

  test("een opgeslagen aanleg bij een onderhoudsdienst wordt onderhoud, echte aanleg blijft aanleg", () => {
    // Vóór de splitsing stonden de vier onderhoudsdiensten als `aanleg`.
    for (const slug of ["leaf-net", "pond-autumn-service", "winterising", "maintenance-subscription"]) {
      expect(levelOf({ slug, kind: "aanleg" } as Service), slug).toBe("onderhoud")
    }
    expect(levelOf({ slug: "implementation", kind: "aanleg" } as Service)).toBe("aanleg")
    // Een nieuwe dienst die de eigenaar als aanleg opslaat, blijft aanleg.
    expect(levelOf({ slug: "nieuwe-dienst", kind: "aanleg" } as Service)).toBe("aanleg")
    // En de oude opslag komt op /services in het juiste niveau terecht.
    const oud = SERVICES.map((s) => ({ ...s, kind: (s.kind === "onderhoud" ? "aanleg" : s.kind === "ontwerp" && ["consultancy", "pond-survey"].includes(s.slug) ? "advies" : s.kind) as Service["kind"] }))
    for (const g of SERVICE_GROUPS) {
      expect(servicesInGroup(oud, g.kind).map((s) => s.slug), g.kind).toEqual(servicesInGroup(SERVICES, g.kind).map((s) => s.slug))
    }
  })
})
