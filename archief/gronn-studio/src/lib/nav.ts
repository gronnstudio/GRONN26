import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
} from "@/lib/data/projects"
import { SERVICE_GROUPS, levelOf, type Service } from "@/lib/data/services"
import type { L } from "@/lib/i18n"
import { stripLocale } from "@/lib/locale"

// The site's destinations, in one place. The header, both bar variants
// and the phone dock all read this — written per component they drift,
// and the annotations are exactly the kind of copy that drifts first.
//
// A bare word is only obvious to someone who already knows the site.
// Home needs no gloss; everything else gets one.

export type NavItem = { href: string; label: L; note?: L }

export const NAV: NavItem[] = [
  { href: "/", label: { en: "Home", nl: "Home" } },
  {
    href: "/studio",
    label: { en: "Studio", nl: "Studio" },
    note: { en: "Who is behind GRØNN", nl: "Wie er achter GRØNN zit" },
  },
  {
    href: "/services",
    label: { en: "Services", nl: "Diensten" },
    note: {
      en: "Design, build and care",
      nl: "Ontwerp, aanleg en onderhoud",
    },
  },
  {
    href: "/projects",
    label: { en: "Projects", nl: "Projecten" },
    note: {
      en: "Real work, told step by step",
      nl: "Echt werk, stap voor stap verteld",
    },
  },
  {
    href: "/contact",
    label: { en: "Contact", nl: "Contact" },
    note: {
      en: "Start a project or book a job",
      nl: "Een project starten of een klus inplannen",
    },
  },
]

// Reachable from the footer already, but they belong to the studio's own
// story rather than the top-level bar, so the Studio panel carries them.
// Werkwijze en veldlab zijn met de V5-site (sep 2026) verdwenen; stack
// kwam op 24 sep 2026 terug als "Techniek", achteraan in deze lijst.
// Wat het Studio-paneel nu draagt zijn de twee delen van "Over Nick" waar
// je rechtstreeks heen wilt — een paneel zonder regels is een leeg vel
// (menu-model.spec.ts).
// In de volgorde van de pagina, met het verhaal zelf voorop. Eerst stonden
// alleen de twee ankers hier en hing "Over de studio" onderaan als
// voetlink: de eigenaar (23 sep 2026) vond die volgorde onbegrijpelijk —
// twee secties vóór de pagina waar ze op staan.
export const STUDIO_EXTRAS: NavItem[] = [
  {
    href: "/studio",
    label: { en: "About me", nl: "Over mij" },
    note: { en: "My story: who I am and how I look at a garden", nl: "Mijn verhaal: wie ik ben en hoe ik naar een tuin kijk" },
  },
  {
    href: "/studio#uitgangspunten",
    label: { en: "What I pay attention to", nl: "Waar ik op let" },
    note: { en: "Five things I always bring along", nl: "Vijf dingen die ik altijd meeneem" },
  },
  {
    href: "/studio#werkwijze",
    label: { en: "How I work", nl: "Zo werk ik" },
    note: { en: "Six steps, from looking first to letting it grow", nl: "Zes stappen, van eerst kijken tot laten groeien" },
  },
  {
    href: "/studio#manifest",
    label: { en: "What I stand for", nl: "Waar ik voor sta" },
    note: { en: "In my own words, and a quote from my first project", nl: "In mijn eigen woorden, met een citaat uit mijn eerste project" },
  },
  // Een eigen pagina, geen anker, dus na het verhaal (24 sep 2026).
  {
    href: "/stack",
    label: { en: "Tech stack", nl: "Techniek" },
    note: { en: "What I work with, from phone to code", nl: "Waar ik mee werk, van telefoon tot code" },
  },
]

/**
 * One door.
 *
 * There used to be three: a client portal, the site editor and the
 * panel — and the copy above them had to explain which of the three was
 * yours ("the last two are the studio's own"). That was a menu asking
 * the reader to know which audience they belonged to before they could
 * pick a link.
 *
 * `/dashboard` already answers that question itself. `getPanelViewer()`
 * reads the session and renders the studio's panel, a client's own
 * dossier, or a screen offering both sign-ins — so the menu can stop
 * sorting people and simply point at the door.
 *
 * The site editor is not missing: it lives in the panel's own rail
 * under "Algemeen", which is where a tool belongs once you are through
 * the door and signed in as the one person who can use it.
 *
 * NOTE: this route lives outside the [locale] tree — see UNLOCALIZED in
 * src/lib/locale.ts.
 */
export const DASHBOARD: Required<NavItem> = {
  href: "/dashboard",
  label: { en: "Dashboard", nl: "Dashboard" },
  note: {
    en: "Your garden and requests — or, for the studio, the panel",
    nl: "Je tuin en je aanvragen — of, voor de studio, het paneel",
  },
}

export const START_PROJECT: L = {
  en: "Start a Project",
  nl: "Start een project",
}

// ── The tree ────────────────────────────────────────────────────────────
//
// Five sections, and everything the site has hangs under one of them.
// Home is deliberately absent: it is the logo, a mark rather than a menu
// item, and listing it as a sixth peer was part of what made the old
// menus read as a pile.
//
// This is the ONE source. The bar panels, the phone dock's sheet and the
// footer all render it — before this, each carried its own array and the
// three had already drifted (the dock's PRIMARY held four items, its
// SECONDARY put Projecten and Contact between Privacy and Voorwaarden).
//
// Services deliberately carry NO children here: they come from
// SERVICE_GROUPS and servicesInGroup() so that what the owner edits in
// /editor reaches every menu. A copy here would be a second source of
// exactly the kind this constant exists to abolish.

export type SectionId =
  | "studio"
  | "services"
  | "projects"
  | "contact"

export type NavSection = {
  id: SectionId
  /** The section's own page — the trigger always leads somewhere real. */
  href: string
  label: L
  note: L
  /** Empty for services, which are resolved from the content document. */
  children: NavItem[]
}

export const SECTIONS: NavSection[] = [
  {
    id: "studio",
    href: "/studio",
    label: { en: "Studio", nl: "Studio" },
    note: { en: "Who is behind GRØNN", nl: "Wie er achter GRØNN zit" },
    // Here the section's own page IS the first child ("Over mij"), in
    // page order with the two anchors after it. The panel's footer strip
    // therefore does not repeat /studio: it points to the next step,
    // an introduction. Owner, 23 Sep 2026.
    children: [...STUDIO_EXTRAS],
  },
  {
    id: "services",
    href: "/services",
    label: { en: "Services", nl: "Diensten" },
    note: {
      en: "Design, build and care",
      nl: "Ontwerp, aanleg en onderhoud",
    },
    children: [],
  },
  {
    id: "projects",
    href: "/projects",
    label: { en: "Projects", nl: "Projecten" },
    note: {
      en: "Real work, told step by step",
      nl: "Echt werk, stap voor stap verteld",
    },
    children: [
    ],
  },
  {
    id: "contact",
    href: "/contact",
    label: { en: "Contact", nl: "Contact" },
    note: {
      en: "Start a project or book a job",
      nl: "Een project starten of een klus inplannen",
    },
    children: [
      {
        href: "/contact#seasonal",
        label: { en: "Book seasonal work", nl: "Seizoenswerk inplannen" },
        note: {
          en: "A dated job with a published price",
          nl: "Een klus met een datum en een prijs",
        },
      },
      // No "Design intake" here any more, and the reversal is deliberate
      // rather than a tidy-up.
      //
      // It was put in the menu because the long sheet was reachable ONLY
      // from a link inside step one of the short form, so anyone who did
      // not start that form never learned it existed. That was true, and
      // the fix was right for what the sheet was then: a public
      // questionnaire anybody could fill in.
      //
      // The sheet is now the studio's instrument. A first enquiry comes
      // through the short form on /contact — four steps, two minutes —
      // and the long intake follows once there is somebody to send it to,
      // from `/dashboard` where they are signed in. Two front doors of
      // very different weight, offered side by side, asked a first-time
      // visitor to pick between two minutes and an evening before anyone
      // had spoken to them.
      //
      // `/contact/intake` still answers on its own address, so a link
      // already sent to a client keeps working.
    ],
  },
]

export function sectionById(id: SectionId): NavSection {
  const found = SECTIONS.find((s) => s.id === id)
  if (!found) throw new Error(`No nav section: ${id}`)
  return found
}

// ── Breadcrumbs ─────────────────────────────────────────────────────────
//
// One crumb. The label stays Localized rather than resolved to a string,
// because the SAME array feeds two consumers with different needs: the
// JSON-LD builder, which knows the locale of the page it is stamping,
// and the visible <Breadcrumbs>, a client component that resolves with
// useT and must re-resolve when the visitor flips language.
export type Crumb = { label: L; path: string }

/**
 * The trail to a detail page: its section, then the page itself.
 *
 * `breadcrumbSchema()` puts Home in front, and `<Breadcrumbs>` renders
 * the same. Both read THIS function — before it, each of the three
 * detail routes hand-wrote its own array for the crawler while the page
 * showed no trail at all, so nothing checked that the structured data
 * described where the page actually hangs.
 *
 * Route depth tops out at two (`/services/[slug]`), so a trail is always
 * Home › Section › Page — short enough to keep honest.
 */
export function trailFor(section: SectionId, page: Crumb): Crumb[] {
  const s = sectionById(section)
  return [{ label: s.label, path: s.href }, page]
}

// ── Het menu, één keer beschreven ───────────────────────────────────────
//
// WAAROM DIT BESTAAT. De navigatie was drie keer gebouwd: de zwevende dock
// onder 768px, de kaart tussen 768 en 1024, en de balk daarboven. Drie
// implementaties die in de pas moeten blijven zijn drie implementaties
// die uit de pas lopen — dat is deze zomer twee keer gebeurd, één keer
// met een sectie die aan de ene kant wel en aan de andere niet bestond.
//
// Hieronder staat wat er in een sectiemenu hoort. De drie componenten
// tekenen die uitkomst en beslissen zelf niets meer. Waar ze nog van
// elkaar verschillen is de VORM — een sheet, een kaart, een paneel —
// en dat is precies het verschil dat een telefoon van een desktop
// scheidt.
//
// De inhoud wordt AFGELEID waar dat kan. Projecten en Journaal hielden
// een lege `children` en zouden dus een menu met nul regels opleveren;
// ze hebben allebei al een `category` op elk item, dus het menu leest
// die in plaats van een tweede lijst bij te houden die gaat afwijken.

export type MenuRow = {
  href: string
  label: L
  note?: L
  /**
   * De slug wanneer de regel een dienst is.
   *
   * Zodat een renderer er de vanafprijs bij kan zetten zonder dat dit
   * bestand iets van prijzen hoeft te weten.
   */
  service?: string
}

export type MenuGroup = {
  /** Afwezig bij één ongegroepeerde lijst. */
  label?: L
  /** Eén zin. Alleen de diensten hebben er een. */
  intro?: L
  rows: MenuRow[]
}

export type SectionMenu = {
  id: SectionId
  /** De eigen pagina van de sectie — altijd bereikbaar. */
  href: string
  label: L
  note: L
  groups: MenuGroup[]
  /**
   * Niets te tonen.
   *
   * Dan linkt de renderer rechtstreeks door naar de pagina in plaats van
   * een leeg vel open te schuiven. Een menu dat opengaat en niets zegt is
   * een tik die niets oplevert.
   */
  empty: boolean
}

/** Wat het menu nodig heeft om zichzelf te vullen. */
export type MenuContent = {
  /**
   * `kind` is meegetypt als dat van een dienst, niet als `string`.
   *
   * Met `string` accepteert `levelOf` het alleen via een cast, en een
   * cast hier zou precies de fout verbergen die deze ronde aan het licht
   * bracht: een dienst met een niveau dat niet bestaat valt stil terug op
   * het middelste en niemand ziet het.
   */
  services: (Pick<Service, "slug" | "title" | "kind"> & { tagline?: L })[]
  projects: { slug: string; title: L; category: string }[]
  articles: { slug: string; title: L; category: L }[]
}

/** Kinderen uit `SECTIONS` als menuregels. */
function childRows(section: NavSection): MenuRow[] {
  return section.children.map((child) => ({
    href: child.href,
    label: child.label,
    note: child.note,
  }))
}

/**
 * Groepeer op een sleutel, met behoud van de volgorde waarin de items
 * binnenkwamen.
 *
 * Bewust géén lege groepen: zes projecten over zes categorieën zou zes
 * groepen van één opleveren, en een categorie zonder projecten is een kop
 * die nergens heen gaat.
 */
function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const bucket = out.get(k)
    if (bucket) bucket.push(item)
    else out.set(k, [item])
  }
  return out
}

/**
 * Het menu van één sectie.
 *
 * De vijf secties vullen zich elk op hun eigen manier, en dat is geen
 * inconsistentie maar een erkenning: Studio en Contact hebben een
 * handgeschreven lijst omdat die zelden verandert, Diensten volgt de
 * drie instapniveaus, en Projecten en Journaal leiden zich af uit hun
 * eigen inhoud zodat een nieuw project vanzelf in het menu staat.
 */
export function menuFor(id: SectionId, content: MenuContent): SectionMenu {
  const section = sectionById(id)
  const base = {
    id,
    href: section.href,
    label: section.label,
    note: section.note,
  }

  const groups: MenuGroup[] = (() => {
    switch (id) {
      case "services": {
        // De drie niveaus, in de volgorde waarin je je eraan verbindt.
        // De volgorde en de teksten komen uit SERVICE_GROUPS, dezelfde
        // bron die /services gebruikt.
        return SERVICE_GROUPS.map((group) => ({
          label: group.label,
          intro: group.intro,
          rows: content.services
            .filter((s) => levelOf(s) === group.kind)
            .map((s) => ({
              href: `/services/${s.slug}`,
              label: s.title,
              note: s.tagline,
              service: s.slug,
            })),
        })).filter((g) => g.rows.length > 0)
      }

      case "projects": {
        // Per categorie, en alleen de categorieën die werkelijk
        // projecten hebben. De volgorde volgt PROJECT_CATEGORIES zodat
        // hij gelijkloopt met de filterknoppen op /projects.
        const byCategory = groupBy(content.projects, (p) => p.category)
        return PROJECT_CATEGORIES.filter((c) => byCategory.has(c)).map(
          (category) => ({
            label: CATEGORY_LABELS[category],
            rows: (byCategory.get(category) ?? []).map((p) => ({
              href: `/projects/${p.slug}`,
              label: p.title,
            })),
          })
        )
      }

      default: {
        // Studio en Contact: één ongegroepeerde lijst uit `children`.
        const rows = childRows(section)
        return rows.length > 0 ? [{ rows }] : []
      }
    }
  })()

  // Groeperen verdient zijn plek, of het gaat eruit.
  //
  // Zes projecten over zes categorieën levert zes koppen van één regel:
  // meer kader dan inhoud, en een kop die maar één ding overkoepelt
  // overkoepelt niets.
  //
  // DE DREMPEL IS HET GEMIDDELDE, niet "draagt er ééntje er twee?". Dat
  // was de eerste versie, en het journaal liet meteen zien waarom hij te
  // soepel was: zes artikelen over vijf categorieën, waarvan Water er
  // twee had. Eén groep met gezelschap hield dus de koppen overeind voor
  // de vier eenlingen ernaast — vijf koppen boven zes regels.
  //
  // Gemiddeld twee per groep is de eerlijke vraag: overkoepelen deze
  // koppen sámen genoeg om hun eigen regels waard te zijn? De koppen
  // komen vanzelf terug zodra de inhoud ze verdient — bij twaalf
  // artikelen over vijf categorieën staan ze er weer.
  //
  // Dit geldt niet voor de diensten: daar zijn de koppen de drie
  // instapniveaus, en die zijn het punt van het menu, niet een
  // bijproduct van de inhoud.
  const rowCount = groups.reduce((n, g) => n + g.rows.length, 0)
  const worthGrouping = id === "services" || groups.length * 2 <= rowCount
  const shaped: MenuGroup[] = worthGrouping
    ? groups
    : groups.length > 0
      ? [{ rows: groups.flatMap((g) => g.rows) }]
      : []

  return {
    ...base,
    groups: shaped,
    empty: shaped.every((g) => g.rows.length === 0),
  }
}

/** Alle vijf de menu's, in de volgorde van de balk. */
export function menus(content: MenuContent): SectionMenu[] {
  return SECTIONS.map((s) => menuFor(s.id, content))
}

// ── DE TELEFOONPIL ──────────────────────────────────────────────────
//
// Vijf vaste bestemmingen onderaan het scherm, en niets anders. Dit
// vervangt het menuwiel van acht met zijn sheets en panelen — dat was
// in het hoofd beter uitgedacht dan in de praktijk, en het heeft elf
// ronden en een numerieke fitter gekost om de labels niet onder de
// knoppen te laten vallen.
//
// ── WAAROM HIER EN NIET IN DE PIL ZELF ───────────────────────────────
//
// `SECTIONS` hierboven is de ene navigatiebron; de balk, de tabletkaart
// en de voettekst lezen er allemaal uit. De dock voegt daar twee dingen
// aan toe die de rest niet kent — Home als zesde begrip, en een andere
// indeling van wat waar onder valt — en die horen dus hier te staan,
// afgeleid van `SECTIONS`, en niet als een tweede lijst in een
// component. Precies die tweede lijst is wat de drie menu's deze zomer
// twee keer uit elkaar heeft laten lopen.
//
// ── WAT ER VERSCHUIFT TEN OPZICHTE VAN HET WIEL ─────────────────────
//
// Het wiel droeg er acht: Studio, Diensten, Projecten, Home, Journaal,
// Contact, Direct contact en Start een project. Vijf blijven er over.
//
//   · Werkwijze en Journaal vallen onder Studio. Geen van beide verdwijnt
//     — ze staan in de balk op desktop, in de voettekst, en achter het
//     kopje Studio. Wat verdwijnt is hun eigen vak in een rij van acht
//     waarin geen enkel vak nog opviel.
//   · Direct contact (de kanalenrij) gaat eruit: de contactrail en de
//     contactpagina dragen dat al, en een derde plek was een derde bron.
//   · Start een project is geen bestemming maar een oproep, en die staat
//     op elke pagina waar hij hoort.
//   · Thema en toegankelijkheid verhuizen naar de twee hoekknoppen —
//     zie `hoek-paneel.tsx`. Zonder die verhuizing zou het opheffen van
//     de binnenring die instellingen op de telefoon laten verdwijnen.
//
// ── WAAROM HET VIJFDE VAK "STUDIO" HEET EN NIET "OVER" ──────────────
//
// Het concept waar deze pil vandaan komt noemt het Over. Deze site
// noemt diezelfde sectie overal Studio — in de balk, in de kruimels, in
// de voettekst. Eén woord op de telefoon veranderen zou precies de
// scheefgroei zijn die `SECTIONS` moet voorkomen. De vorm komt mee, het
// vocabulaire blijft van hier.

export type DockId = "home" | "services" | "projects" | "studio" | "contact"

/** De volgorde in de balk. Vijf vakken, links naar rechts. */
export const DOCK_ORDER: DockId[] = [
  "home",
  "services",
  "projects",
  "studio",
  "contact",
]

/**
 * Welke paden welk vak laten oplichten.
 *
 * Home heeft er bewust geen: een lege lijst kan niet vooraan matchen, en
 * `/` hoort alleen zichzelf op te lichten. Zou Home `["/"]` dragen, dan
 * lichtte hij op elke pagina van de site op.
 *
 * Studio draagt er drie. Dat is de hele verhuizing van hierboven in één
 * regel: wie op /werkwijze of in het journaal staat, ziet Studio
 * oplichten en weet dus waar hij die pagina terugvindt. Een pagina die
 * nergens onder valt licht niets op — dat is beter dan een willekeurig
 * vak laten branden.
 */
const DOCK_OWNS: Record<DockId, string[]> = {
  home: [],
  // De najaarsactie hangt in het kruimelpad onder Diensten.
  services: ["/services", "/herfstbeurt"],
  projects: ["/projects"],
  // /stack staat in het Studio-paneel, dus licht Studio daar op. /calendar
  // staat niet in een menu, maar hangt in het kruimelpad onder Studio.
  studio: ["/studio", "/stack", "/calendar"],
  contact: ["/contact"],
}

/** Home is geen sectie in `SECTIONS`; hier krijgt hij zijn twee velden. */
const DOCK_HOME = {
  href: "/",
  label: { en: "Home", nl: "Home" } satisfies L,
}

export function dockHref(id: DockId): string {
  return id === "home" ? DOCK_HOME.href : sectionById(id).href
}

export function dockLabel(id: DockId): L {
  return id === "home" ? DOCK_HOME.label : sectionById(id).label
}

/**
 * Welk vak licht op voor dit pad?
 *
 * Neemt de RUWE `usePathname()` en ontdoet hem zelf van de taalprefix.
 * Dat moet hier gebeuren en niet bij de aanroeper: bij een verse load
 * laat de middleware-rewrite `usePathname()` op `/en` staan, en
 * Nederlandse pagina's dragen altijd `/nl`. Een kale vergelijking miste
 * daardoor de huidige pagina tot de eerste client-side navigatie — die
 * fout is hier al een keer gemaakt.
 *
 * `null` als niets past (een juridische pagina, een 404). De dock laat de
 * capsule dan verdwijnen in plaats van hem op vak 0 te laten hangen.
 */
export function activeSection(pathname: string): DockId | null {
  const route = stripLocale(pathname).replace(/\/+$/, "") || "/"
  if (route === "/") return "home"
  for (const id of DOCK_ORDER) {
    for (const owned of DOCK_OWNS[id]) {
      if (route === owned || route.startsWith(owned + "/")) return id
    }
  }
  return null
}
