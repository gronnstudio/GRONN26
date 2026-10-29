import type { L } from "@/lib/i18n"

// The project's own history, as data.
//
// /stack answers "what is this built with". This answers "how did it get
// here, and why is it like this". The two are one ecosystem: every event
// names the technologies it touched with the SAME keys /stack uses
// (STACK_TECH.key), so the two pages can point at each other without a
// second list of technology names to keep in step.
//
// PROVENANCE IS PART OF THE DATA, not a footnote. This repository's git
// history begins on 20 July 2026 at PR #21 — everything before that was
// built in a working copy whose commits are not here. Those events are
// marked `reconstructed` and are sourced from the day logs in docs/log/,
// which were written at the time. An event is only `verified` when
// commits in this repository back it. Never promote a status to make the
// timeline look more solid than it is.
//
// The long form of every event lives in TIMEVAULT/entries/. What is
// here is the curated version the site shows.

export type TimevaultStatus =
  /** Backed by commits in this repository. */
  | "verified"
  /** Real, but reconstructed from the day logs — the commits are elsewhere. */
  | "reconstructed"
  /** Decided, not built. */
  | "proposed"
  /** Being built now. */
  | "in-progress"
  /** Shipped, then replaced by something later on this timeline. */
  | "superseded"

export type TimevaultCategory =
  | "architecture"
  | "design"
  | "ux"
  | "accessibility"
  | "technology"
  | "performance"
  | "research"

export type EraKey = "foundation" | "craft" | "commerce"

export type Era = {
  key: EraKey
  label: L
  /** The span this era covers, for the timeline's own axis. */
  from: string
  to: string
  note: L
}

export const ERAS: Era[] = [
  {
    key: "foundation",
    label: { en: "Foundation", nl: "Fundament" },
    from: "2026-07-10",
    to: "2026-07-27",
    note: {
      en: "A site from nothing to live, then made fast enough to keep.",
      nl: "Van niets naar live, en daarna snel genoeg om te houden.",
    },
  },
  {
    key: "craft",
    label: { en: "Craft", nl: "Vakwerk" },
    from: "2026-07-30",
    to: "2026-08-08",
    note: {
      en: "The year the site stopped looking built and started looking made.",
      nl: "De weken waarin de site ophield gebouwd te lijken en gemaakt werd.",
    },
  },
  {
    key: "commerce",
    label: { en: "Commerce", nl: "Handel" },
    from: "2026-08-22",
    to: "2026-08-27",
    note: {
      en: "Prices in the open, and a way through the site to find them.",
      nl: "Prijzen in de etalage, en een weg door de site om ze te vinden.",
    },
  },
]

export type Research = {
  question: L
  investigated: L[]
  finding: L
}

export type Decision = {
  choice: L
  why: L
  tradeoff: L
}

export type TimevaultEvent = {
  id: string
  /** ISO date, or the first day of a span. */
  date: string
  /** Last day, when the event covers more than one. */
  dateEnd?: string
  era: EraKey
  category: TimevaultCategory
  status: TimevaultStatus
  title: L
  /** One line. This is what the timeline itself shows. */
  summary: L
  /** Why we were working on this at all. */
  context: L
  /** What had to be understood first. Omitted when nothing did. */
  investigation?: L
  research?: Research
  decision?: Decision
  implementation: L
  result: L
  /** STACK_TECH keys — the join with /stack. */
  tech: string[]
  /** Pull requests in gronnstudio/gronn-studio. */
  prs: number[]
  /** Other event ids this one leans on or answers. */
  related: string[]
  /** File under TIMEVAULT/entries/, without the extension. */
  entry?: string
}

export const TIMEVAULT_EVENTS: TimevaultEvent[] = [
  {
    id: "first-build",
    date: "2026-07-10",
    dateEnd: "2026-07-19",
    era: "foundation",
    category: "architecture",
    status: "reconstructed",
    title: { en: "A site from nothing", nl: "Een site uit het niets" },
    summary: {
      en: "Ten days from empty repository to a live site on its own domain.",
      nl: "Tien dagen van lege repository naar een live site op een eigen domein.",
    },
    context: {
      en: "The studio had a name, a logo and no website. The brief was a marketing site that could carry real work later without being rebuilt for it.",
      nl: "De studio had een naam, een logo en geen website. De opdracht was een marketingsite die later echt werk kon dragen zonder ervoor herbouwd te hoeven worden.",
    },
    implementation: {
      en: "Seven pages, four palettes, English and Dutch, a motion system, a 3D wireframe terrain in three tiers, an SEO layer, an accessibility pass and Dutch legal pages. Infrastructure alongside it: DNS to Vercel, a private repository, Google Workspace mail with SPF and DKIM.",
      nl: "Zeven pagina's, vier paletten, Engels en Nederlands, een bewegingssysteem, een 3D-draadmodelterrein in drie niveaus, een SEO-laag, een toegankelijkheidsronde en Nederlandse juridische pagina's. Daarnaast de infrastructuur: DNS naar Vercel, een privérepository, Google Workspace-mail met SPF en DKIM.",
    },
    result: {
      en: "Live at gronn.studio. Halfway through, the owner's master brief became the project's governance and has held since.",
      nl: "Live op gronn.studio. Halverwege werd de master brief van de eigenaar het bestuur van dit project, en dat is het gebleven.",
    },
    decision: {
      choice: {
        en: "One animation library, not two.",
        nl: "Eén animatiebibliotheek, geen twee.",
      },
      why: {
        en: "Two motion systems on one page means two ways to express the same movement and two sets of reduced-motion fallbacks to remember.",
        nl: "Twee bewegingssystemen op één pagina betekent twee manieren om dezelfde beweging uit te drukken, en twee sets reduced-motion-terugvallen om te onthouden.",
      },
      tradeoff: {
        en: "Some timeline-style choreography is harder without GSAP. It has not yet been worth a second dependency.",
        nl: "Sommige choreografie is zonder GSAP lastiger. Dat is een tweede afhankelijkheid nog niet waard geweest.",
      },
    },
    tech: ["next", "react", "tailwind", "framer-motion", "three", "vercel"],
    prs: [],
    related: ["editor", "perf-and-locales"],
    entry: "2026-07-10-first-build",
  },
  {
    id: "editor",
    date: "2026-07-20",
    era: "foundation",
    category: "architecture",
    status: "verified",
    title: { en: "The studio gets an editor", nl: "De studio krijgt een editor" },
    summary: {
      en: "Click-to-edit on the live site, behind one Google account — instead of a CMS.",
      nl: "Klik-en-wijzig op de live site, achter één Google-account — in plaats van een CMS.",
    },
    context: {
      en: "Every word on the site was in TypeScript. The owner could not fix a typo without a developer, which is a bad place for a one-person studio to be.",
      nl: "Elk woord op de site stond in TypeScript. De eigenaar kon geen typefout herstellen zonder ontwikkelaar, en dat is een slechte plek voor een eenmansstudio.",
    },
    investigation: {
      en: "Where should the words live if not in the code, without adding a service that has to be paid for, backed up and kept alive?",
      nl: "Waar moeten de teksten wonen als niet in de code, zonder een dienst die betaald, geback-upt en levend gehouden moet worden?",
    },
    decision: {
      choice: {
        en: "A content document in blob storage, seeded from the code, edited in place on the site itself.",
        nl: "Een contentdocument in blob-opslag, gevoed vanuit de code, ter plekke op de site zelf bewerkt.",
      },
      why: {
        en: "The typed data stays the source of structure and the fallback, so the site still builds and renders with no document at all. Nothing new to log into.",
        nl: "De getypeerde data blijft de bron van de structuur én de terugval, dus de site bouwt en rendert ook zonder document. Niets nieuws om op in te loggen.",
      },
      tradeoff: {
        en: "No editorial workflow, no versioning, no second editor. For one owner editing their own site, that is the right amount of machinery.",
        nl: "Geen redactieproces, geen versiebeheer, geen tweede redacteur. Voor één eigenaar die zijn eigen site bewerkt is dat precies genoeg machinerie.",
      },
    },
    implementation: {
      en: "A content layer under every page, Google sign-in restricted to one address, and an edit mode that turns the real page into the editing surface. A Sanity foundation built alongside it was left dormant and removed later that month.",
      nl: "Een contentlaag onder elke pagina, Google-login beperkt tot één adres, en een bewerkmodus die de echte pagina tot bewerkoppervlak maakt. Een Sanity-fundament dat ernaast werd gebouwd bleef slapend en is later die maand verwijderd.",
    },
    result: {
      en: "The owner edits the live site from a phone. It is still how the words change today.",
      nl: "De eigenaar bewerkt de live site vanaf een telefoon. Zo veranderen de teksten vandaag nog steeds.",
    },
    tech: ["gronn-editor", "next-auth", "blob", "typescript"],
    prs: [21],
    related: ["first-build", "quality-gate"],
    entry: "2026-07-20-editor",
  },
  {
    id: "phone-as-app",
    date: "2026-07-21",
    era: "foundation",
    category: "ux",
    status: "verified",
    title: { en: "The phone stops being a small desktop", nl: "De telefoon is geen kleine desktop meer" },
    summary: {
      en: "Fifteen pull requests in one day, all about the thumb.",
      nl: "Vijftien pull requests op één dag, allemaal over de duim.",
    },
    context: {
      en: "Most visitors arrive on a phone. The site was a desktop layout that shrank, with a header nobody could reach one-handed.",
      nl: "De meeste bezoekers komen op een telefoon binnen. De site was een desktoplayout die kromp, met een balk die niemand met één hand kon bereiken.",
    },
    implementation: {
      en: "A floating dock within thumb reach; the header dropped on phones and then partly brought back for the logo alone; the pinned horizontal gallery swapped for cards that glide with the scroll; and a password-gated blur over the business credentials, for recording the screen.",
      nl: "Een zwevende dock binnen duimbereik; de balk van telefoons gehaald en daarna deels teruggebracht voor alleen het logo; de vastgezette horizontale galerij vervangen door kaarten die met de scroll meeglijden; en een blur met wachtwoord over de bedrijfsgegevens, voor schermopnames.",
    },
    result: {
      en: "The phone became the site's own shape rather than a narrower version of another one. Every navigation round since has started here.",
      nl: "De telefoon kreeg een eigen vorm in plaats van een smallere versie van een andere. Elke navigatieronde sindsdien begint hier.",
    },
    tech: ["framer-motion", "lenis", "tailwind"],
    prs: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    related: ["navigation-rebuilt", "app-mode"],
    entry: "2026-07-21-phone-as-app",
  },
  {
    id: "perf-and-locales",
    date: "2026-07-26",
    dateEnd: "2026-07-27",
    era: "foundation",
    category: "performance",
    status: "verified",
    title: { en: "Fast enough to keep, findable in Dutch", nl: "Snel genoeg om te houden, vindbaar in het Nederlands" },
    summary: {
      en: "The 3D layer learned to wait, and Dutch got URLs of its own.",
      nl: "De 3D-laag leerde wachten, en het Nederlands kreeg eigen URL's.",
    },
    context: {
      en: "The terrain was beautiful and expensive: it built on every page load whether or not anyone would scroll to it. And the Dutch site — the language of nearly every customer — existed only as a client-side switch, so search engines never saw it.",
      nl: "Het terrein was mooi en duur: het werd bij elke paginalading gebouwd, of iemand er ooit naartoe scrolde of niet. En de Nederlandse site — de taal van vrijwel elke klant — bestond alleen als een schakelaar in de browser, dus zoekmachines zagen hem nooit.",
    },
    research: {
      question: {
        en: "What is actually costing the first paint?",
        nl: "Wat kost de eerste weergave nu echt?",
      },
      investigated: [
        { en: "A committed Lighthouse baseline, so later rounds compare against a number instead of a memory", nl: "Een vastgelegde Lighthouse-basislijn, zodat latere rondes tegen een getal vergelijken en niet tegen een herinnering" },
        { en: "Which images were served raw rather than through the framework's pipeline", nl: "Welke beelden rauw werden geserveerd in plaats van via de pijplijn van het framework" },
        { en: "When the WebGL layer is built, and whether it keeps running off screen", nl: "Wanneer de WebGL-laag wordt gebouwd, en of hij buiten beeld blijft draaien" },
      ],
      finding: {
        en: "The terrain was the largest single cost and it was being paid before anyone could see it.",
        nl: "Het terrein was de grootste enkele kostenpost, en die werd betaald voordat iemand hem kon zien.",
      },
    },
    implementation: {
      en: "Every photograph through the image pipeline; the 3D layer built only when the browser is idle and the viewport is close, and paused when it leaves; and locale routes so Dutch has real, indexable URLs resolved on the server.",
      nl: "Elke foto door de beeldpijplijn; de 3D-laag alleen gebouwd als de browser niets te doen heeft en het venster in de buurt is, en gepauzeerd zodra hij uit beeld gaat; en localeroutes zodat het Nederlands echte, indexeerbare URL's heeft die op de server worden bepaald.",
    },
    result: {
      en: "An accessibility score of 100 and a boot sequence that paints before hydration. The pattern — build the expensive thing late, pause it when unseen — has been the rule for every heavy piece since.",
      nl: "Een toegankelijkheidsscore van 100 en een opstartvolgorde die tekent vóór de hydratie. Het patroon — bouw het dure ding laat, pauzeer het als niemand kijkt — is sindsdien de regel voor elk zwaar onderdeel.",
    },
    tech: ["next", "three", "vercel"],
    prs: [40, 41, 42, 43, 44, 45],
    related: ["first-build", "quality-gate", "seo-and-admin"],
    entry: "2026-07-26-performance-and-locales",
  },
  {
    id: "contrast-auditor",
    date: "2026-07-30",
    dateEnd: "2026-07-31",
    era: "craft",
    category: "accessibility",
    status: "verified",
    title: { en: "Colour gets a machine to answer to", nl: "Kleur krijgt een machine die het narekent" },
    summary: {
      en: "Ten palettes, and a script that refuses to let any of them fail.",
      nl: "Tien paletten, en een script dat er geen enkele laat zakken.",
    },
    context: {
      en: "Palettes were being added by eye. A palette that reads well on the designer's screen can still fail a contrast threshold, and nothing on the site was checking.",
      nl: "Paletten werden op het oog toegevoegd. Een palet dat op het scherm van de ontwerper goed leest, kan alsnog onder een contrastdrempel zakken, en niets op de site controleerde dat.",
    },
    research: {
      question: {
        en: "What actually makes a dark theme readable rather than merely dark?",
        nl: "Wat maakt een donker thema leesbaar in plaats van alleen donker?",
      },
      investigated: [
        { en: "Why a pure-black ground is the wrong floor, and where the industry's floor actually sits", nl: "Waarom een pikzwarte ondergrond de verkeerde bodem is, en waar de bodem in de praktijk ligt" },
        { en: "How elevation should be expressed when there is no light to cast a shadow", nl: "Hoe hoogte moet worden uitgedrukt als er geen licht is om een schaduw te werpen" },
        { en: "Why a saturated accent that works on white vibrates against a dark ground", nl: "Waarom een verzadigd accent dat op wit werkt, tegen een donkere ondergrond gaat trillen" },
      ],
      finding: {
        en: "Never a pure-black ground; in dark mode elevation is expressed as light, so a raised surface is lighter than its background rather than shadowed; and accents desaturate on dark. A mid-value tinted light ground reads muddy however good its numbers are — which is how the rejected \"Marl\" failed.",
        nl: "Nooit een pikzwarte ondergrond; in donkere modus wordt hoogte uitgedrukt als licht, dus een verhoogd vlak is lichter dan zijn achtergrond in plaats van beschaduwd; en accenten ontzadigen op donker. Een lichte ondergrond met middenwaarde leest modderig hoe goed de getallen ook zijn — daar sneuvelde het afgewezen \"Marl\" op.",
      },
    },
    decision: {
      choice: {
        en: "A contrast auditor that parses the real token blocks and exits non-zero on failure.",
        nl: "Een contrastauditor die de echte tokenblokken uitleest en met een foutcode stopt.",
      },
      why: {
        en: "It reads what ships rather than a copy of it, so the check cannot drift away from the palette it is supposed to be checking.",
        nl: "Hij leest wat er live gaat en niet een kopie ervan, dus de controle kan niet losraken van het palet dat hij hoort te controleren.",
      },
      tradeoff: {
        en: "Adding a palette now means satisfying a script as well as an eye. That is the point.",
        nl: "Een palet toevoegen betekent nu ook een script tevredenstellen, niet alleen een oog. Dat is precies de bedoeling.",
      },
    },
    implementation: {
      en: "A craft pass over the whole site, the auditor as a build check, and time-of-day theming: the site picks Golden Hour or Blue Hour from the visitor's own clock until they choose for themselves.",
      nl: "Een vakwerkronde over de hele site, de auditor als bouwcontrole, en thema's naar het uur van de dag: de site kiest Gouden uur of Blauwe uur op de klok van de bezoeker, tot die zelf kiest.",
    },
    result: {
      en: "122 colour pairs checked on every build. It has caught real failures since, including one hiding under a perfect Lighthouse score — because Lighthouse only measures the resting state and never sees a hover colour.",
      nl: "122 kleurenparen gecontroleerd bij elke build. Het heeft sindsdien echte fouten gevonden, waaronder één die zich verstopte onder een perfecte Lighthouse-score — want Lighthouse meet alleen de ruststand en ziet een hoverkleur nooit.",
    },
    tech: ["checks", "next-themes", "tailwind"],
    prs: [46, 48],
    related: ["quality-gate", "navigation-rebuilt"],
    entry: "2026-07-30-contrast-auditor",
  },
  {
    id: "tech-stack-page",
    date: "2026-08-01",
    era: "craft",
    category: "technology",
    status: "verified",
    title: { en: "The build becomes explorable", nl: "De bouw wordt verkenbaar" },
    summary: {
      en: "A stack page you can open, not a list of dependencies.",
      nl: "Een techniekpagina die je kunt openen, geen lijst met afhankelijkheden.",
    },
    context: {
      en: "The sister site had an engine section that named its technologies. The owner asked for something \"more interactive and intuitive\" — a list of package names says nothing a package.json could not.",
      nl: "De zustersite had een sectie die zijn technologie benoemde. De eigenaar vroeg om iets \"interactiever en intuïtiever\" — een lijst met pakketnamen zegt niets wat een package.json niet ook zegt.",
    },
    decision: {
      choice: {
        en: "Names and versions read from package.json at build time; the sentences from the content document.",
        nl: "Namen en versies worden bij het bouwen uit package.json gelezen; de zinnen komen uit het contentdocument.",
      },
      why: {
        en: "A version typed by hand is wrong the first time a dependency is upgraded. Reading it makes the page unable to lie.",
        nl: "Een met de hand getypt versienummer klopt niet meer zodra een afhankelijkheid wordt bijgewerkt. Uitlezen maakt liegen onmogelijk.",
      },
      tradeoff: {
        en: "Versions cannot be edited in the editor. They are facts, not copy.",
        nl: "Versies zijn niet in de editor te bewerken. Het zijn feiten, geen teksten.",
      },
    },
    implementation: {
      en: "Four layers as a cross-section, every technology opening to say why it was chosen and what it costs, and a filter for what the sister site runs too.",
      nl: "Vier lagen als dwarsdoorsnede, elke technologie te openen met waarom die gekozen is en wat die kost, en een filter voor wat de zustersite ook draait.",
    },
    result: {
      en: "/stack. This timeline is its second half — and the page you are reading it on.",
      nl: "/stack. Deze tijdlijn is de tweede helft daarvan — en de pagina waarop je hem leest.",
    },
    tech: ["next", "typescript", "gronn-editor"],
    prs: [47],
    related: ["timevault", "editor"],
    entry: "2026-08-01-tech-stack-page",
  },
  {
    id: "quality-gate",
    date: "2026-08-01",
    era: "craft",
    category: "architecture",
    status: "verified",
    title: { en: "A gate that runs a real browser", nl: "Een poort met een echte browser" },
    summary: {
      en: "Types, lint, contrast, build, and tests that actually open the page.",
      nl: "Types, lint, contrast, build, en tests die de pagina echt openen.",
    },
    context: {
      en: "Two defects had shipped from \"it builds\". Building is not evidence that anything works.",
      nl: "Twee fouten waren live gegaan op grond van \"hij bouwt\". Dat iets bouwt is geen bewijs dat het werkt.",
    },
    decision: {
      choice: {
        en: "End-to-end tests against the real production build, and an accessibility scan inside them.",
        nl: "End-to-end-tests tegen de echte productiebuild, met een toegankelijkheidsscan erin.",
      },
      why: {
        en: "The bugs this project actually produces are behavioural — a panel that closes under the cursor, a focus that lands nowhere. No amount of type checking sees those.",
        nl: "De fouten die dit project werkelijk maakt zijn gedragsfouten — een paneel dat onder de cursor dichtvalt, een focus die nergens landt. Geen typecontrole ziet die.",
      },
      tradeoff: {
        en: "The gate takes minutes rather than seconds. Cheaper than a bad deploy.",
        nl: "De poort kost minuten in plaats van seconden. Goedkoper dan een slechte deploy.",
      },
    },
    implementation: {
      en: "Continuous integration with real browser tests, three accessibility findings fixed, blur placeholders generated at build time for every static photograph, field vitals collected from real visits, and the dormant second content path removed.",
      nl: "Continue integratie met echte browsertests, drie toegankelijkheidsbevindingen hersteld, blur-plaatshouders bij het bouwen gegenereerd voor elke statische foto, veldmetingen uit echte bezoeken, en het slapende tweede contentpad verwijderd.",
    },
    result: {
      en: "Every change since has had to walk through it. The rule that came out of it — look at the thing, do not merely build it — is the one this project breaks most often and pays for every time.",
      nl: "Elke wijziging sindsdien moest erdoorheen. De regel die eruit voortkwam — kíjk naar het ding, bouw het niet alleen — is degene die dit project het vaakst breekt en er elke keer voor betaalt.",
    },
    tech: ["checks", "types", "eslint", "typescript", "vercel"],
    prs: [49, 53, 54, 55, 56],
    related: ["contrast-auditor", "navigation-rebuilt"],
    entry: "2026-08-01-quality-gate",
  },
  {
    id: "app-mode",
    date: "2026-08-02",
    era: "craft",
    category: "ux",
    status: "verified",
    title: { en: "Installed, and continuous", nl: "Geïnstalleerd, en aaneengesloten" },
    summary: {
      en: "The project you click becomes the page you land on.",
      nl: "Het project dat je aanklikt wordt de pagina waarop je landt.",
    },
    context: {
      en: "Clicking a project card threw the visitor to a new page and made them find their place again. And the site, added to a home screen, was still a browser tab in disguise.",
      nl: "Een projectkaart aanklikken wierp de bezoeker naar een nieuwe pagina, die daar opnieuw zijn plek moest zoeken. En de site, toegevoegd aan een beginscherm, was nog steeds een vermomde browsertab.",
    },
    implementation: {
      en: "View transitions carry the card's own photograph into the case study's hero, so the two pages are one movement. Installed, the site behaves as an app in its own right and keeps working beside the website rather than replacing it.",
      nl: "Viewtransities dragen de foto van de kaart mee naar de hero van de case study, zodat de twee pagina's één beweging zijn. Geïnstalleerd gedraagt de site zich als een eigen app en blijft naast de website werken in plaats van hem te vervangen.",
    },
    result: {
      en: "The clearest single piece of craft on the site, and the one visitors notice without being able to name.",
      nl: "Het duidelijkste stukje vakwerk op de site, en het enige dat bezoekers opmerken zonder het te kunnen benoemen.",
    },
    tech: ["next", "react", "framer-motion"],
    prs: [57, 59, 60, 61, 62, 63, 64],
    related: ["phone-as-app", "case-studies"],
    entry: "2026-08-02-app-mode",
  },
  {
    id: "case-studies",
    date: "2026-08-03",
    era: "craft",
    category: "design",
    status: "verified",
    title: { en: "Work that shows its figures", nl: "Werk dat zijn cijfers laat zien" },
    summary: {
      en: "Outcomes, a before-and-after slider, and the client's own words.",
      nl: "Resultaten, een voor-en-na-schuif, en de woorden van de klant zelf.",
    },
    context: {
      en: "The projects were photographs with captions. An ecological garden's argument is what changed — water held, species returned — and none of that was on the page.",
      nl: "De projecten waren foto's met bijschriften. Het argument van een ecologische tuin is wat er veranderde — water dat blijft, soorten die terugkomen — en daar stond niets van op de pagina.",
    },
    implementation: {
      en: "A measured outcomes block, a slider that wipes between the site before and after, and quotes attributed to the client rather than to the studio.",
      nl: "Een blok met gemeten resultaten, een schuif die tussen de locatie voor en na wist, en citaten van de klant in plaats van van de studio.",
    },
    result: {
      en: "The case study template the studio's real projects will drop into. The current entries are still placeholder fiction, waiting for real photography.",
      nl: "Het sjabloon waar de echte projecten van de studio in vallen. De huidige teksten zijn nog fictie, wachtend op echte fotografie.",
    },
    tech: ["framer-motion", "next", "gronn-editor"],
    prs: [65],
    related: ["app-mode", "published-prices"],
    entry: "2026-08-03-case-studies",
  },
  {
    id: "seo-and-admin",
    date: "2026-08-22",
    dateEnd: "2026-08-24",
    era: "commerce",
    category: "architecture",
    status: "verified",
    title: { en: "Found by search, run from a phone", nl: "Gevonden via zoeken, bestuurd vanaf een telefoon" },
    summary: {
      en: "Real structured data, and quotes and invoices behind one sign-in.",
      nl: "Echte gestructureerde data, en offertes en facturen achter één login.",
    },
    context: {
      en: "The Dutch pages carried English metadata, and the studio's paperwork lived in a spreadsheet.",
      nl: "De Nederlandse pagina's droegen Engelse metadata, en de administratie van de studio zat in een spreadsheet.",
    },
    implementation: {
      en: "Dutch metadata, per-page canonicals and structured data built from real business facts — no invented ratings, no invented coordinates. Alongside it an owner panel at /admin: quotes and invoices, a switchable letterhead, and a document sheet that prints the studio's details once, at the foot.",
      nl: "Nederlandse metadata, canonieke URL's per pagina en gestructureerde data uit echte bedrijfsfeiten — geen verzonnen beoordelingen, geen verzonnen coördinaten. Daarnaast een eigenaarspaneel op /admin: offertes en facturen, een omschakelbaar briefhoofd, en een documentvel dat de gegevens van de studio één keer afdrukt, onderaan.",
    },
    result: {
      en: "Dutch is now the site's first language to a crawler, as it always was to its customers.",
      nl: "Nederlands is nu ook voor een crawler de eerste taal van de site, zoals het voor de klanten altijd al was.",
    },
    tech: ["next", "next-auth", "typescript"],
    prs: [70, 71, 72, 73, 74],
    related: ["perf-and-locales", "published-prices"],
    entry: "2026-08-22-seo-and-admin",
  },
  {
    id: "published-prices",
    date: "2026-08-25",
    era: "commerce",
    category: "design",
    status: "verified",
    title: { en: "Prices in the open", nl: "Prijzen in de etalage" },
    summary: {
      en: "A page and a from-price per service, and a postcode check that says no.",
      nl: "Een pagina en een vanaf-prijs per dienst, en een postcodecheck die ook nee zegt.",
    },
    context: {
      en: "Seasonal work is standardised and datable, so hiding its price behind a quote form costs the studio the customers who were ready to book.",
      nl: "Seizoenswerk is gestandaardiseerd en inplanbaar, dus de prijs verstoppen achter een offerteformulier kost de studio juist de klanten die al wilden boeken.",
    },
    decision: {
      choice: {
        en: "Publish prices for seasonal work; keep design work quoted per project.",
        nl: "Publiceer prijzen voor seizoenswerk; houd ontwerpwerk per project geoffreerd.",
      },
      why: {
        en: "The two are different products. One is a dated job with a known scope; the other is months of thinking about a site that is like no other.",
        nl: "Het zijn twee verschillende producten. Het ene is een klus met een datum en een bekende omvang; het andere is maanden nadenken over een locatie die op geen andere lijkt.",
      },
      tradeoff: {
        en: "A published price can be undercut. It also filters out the enquiries that were never going to convert.",
        nl: "Een gepubliceerde prijs kan onderboden worden. Hij filtert ook de aanvragen weg die toch nooit klant werden.",
      },
    },
    implementation: {
      en: "A page per service with what is included and what deliberately is not, a from-price everywhere the service is named, and a service-area postcode check that answers honestly when the answer is no.",
      nl: "Een pagina per dienst met wat erbij zit en wat er bewust niet bij zit, een vanaf-prijs overal waar de dienst genoemd wordt, en een postcodecheck voor het werkgebied die eerlijk antwoordt als het antwoord nee is.",
    },
    result: {
      en: "Eleven services, priced or quoted, each with a URL of its own. Every menu on the site now carries those prices, from one source.",
      nl: "Elf diensten, met prijs of op offerte, elk met een eigen URL. Elk menu op de site draagt die prijzen nu, uit één bron.",
    },
    tech: ["next", "typescript", "gronn-editor"],
    prs: [75],
    related: ["navigation-rebuilt", "seo-and-admin"],
    entry: "2026-08-25-published-prices",
  },
  {
    id: "navigation-rebuilt",
    date: "2026-08-25",
    dateEnd: "2026-08-27",
    era: "commerce",
    category: "ux",
    status: "verified",
    title: { en: "One tree, three renderings", nl: "Eén boom, drie weergaven" },
    summary: {
      en: "Eleven pull requests to make every menu read the same source.",
      nl: "Elf pull requests om elk menu uit dezelfde bron te laten lezen.",
    },
    context: {
      en: "Eleven services had arrived and the menus could not hold them. The bar, the phone dock and the footer each kept their own list, and the three had already drifted apart.",
      nl: "Er waren elf diensten bij gekomen en de menu's konden ze niet dragen. De balk, de telefoondock en de footer hadden elk hun eigen lijst, en die drie waren al uit elkaar gegroeid.",
    },
    research: {
      question: {
        en: "How should one navigation structure carry every viewport without being three menus in a trenchcoat?",
        nl: "Hoe draagt één navigatiestructuur elk schermformaat zonder drie menu's in één jas te zijn?",
      },
      investigated: [
        { en: "Real navigation bars, from a reference the owner sent (navbar.gallery)", nl: "Echte navigatiebalken, uit een referentie van de eigenaar (navbar.gallery)" },
        { en: "A Dutch pond retailer's layout, for how a catalogue is actually shopped", nl: "De layout van een Nederlandse vijverwinkel, voor hoe een catalogus echt wordt bekeken" },
        { en: "GitHub's platform menu, for the floating-card shape", nl: "Het platformmenu van GitHub, voor de vorm van de zwevende kaart" },
      ],
      finding: {
        en: "The structure has to be data, not markup. Every surface that renders it can then differ in shape without differing in content.",
        nl: "De structuur moet data zijn, geen markup. Elk oppervlak dat hem toont mag dan van vorm verschillen zonder van inhoud te verschillen.",
      },
    },
    decision: {
      choice: {
        en: "Five sections in one file, read by the bar, the phone dock, the tablet menu and the footer.",
        nl: "Vijf secties in één bestand, gelezen door de balk, de telefoondock, het tabletmenu en de footer.",
      },
      why: {
        en: "Four hand-written copies of the same tree is four chances to drift, and they had already taken three of them.",
        nl: "Vier handgeschreven kopieën van dezelfde boom is vier kansen om af te dwalen, en drie daarvan waren al benut.",
      },
      tradeoff: {
        en: "Each surface needs its own rendering of that data, which is more code than one menu — but it is code that cannot disagree with itself.",
        nl: "Elk oppervlak heeft een eigen weergave van die data nodig, wat meer code is dan één menu — maar het is code die het niet met zichzelf oneens kan zijn.",
      },
    },
    implementation: {
      en: "A mega menu, then that menu as a floating card; the full-screen curtain replaced by panels hanging from the bar; per-section panels on the phone dock; four site controls gathered into one pill; a menu for the tablet band that had none; and breadcrumbs that read the same trail the structured data does.",
      nl: "Een mega menu, daarna datzelfde menu als zwevende kaart; het schermvullende gordijn vervangen door panelen onder de balk; per-sectiepanelen op de telefoondock; vier sitebedieningen samengebracht in één pil; een menu voor de tabletband die er geen had; en kruimelpaden die hetzelfde spoor lezen als de gestructureerde data.",
    },
    result: {
      en: "One source, four surfaces. The rounds it took are the honest part: a tablet gap closed in July was reopened by a change measured only at desktop widths, and an icon set rebuilt for consistency had to be reverted because nobody could tell what the icons were.",
      nl: "Eén bron, vier oppervlakken. Het aantal rondes is het eerlijke deel: een tabletgat dat in juli gedicht was ging weer open door een wijziging die alleen op desktopbreedtes was gemeten, en een iconenset die om consistentie was herbouwd moest terug omdat niemand kon zien wat de iconen voorstelden.",
    },
    tech: ["next", "framer-motion", "tailwind", "typescript"],
    prs: [76, 77, 78, 79, 80, 81, 82, 83, 84, 86],
    related: ["phone-as-app", "published-prices", "quality-gate"],
    entry: "2026-08-25-navigation-rebuilt",
  },
  {
    id: "timevault",
    date: "2026-08-27",
    era: "commerce",
    category: "research",
    status: "in-progress",
    title: { en: "This timeline", nl: "Deze tijdlijn" },
    summary: {
      en: "The record of how the site got here, joined to the record of what it is built with.",
      nl: "Het verslag van hoe de site hier kwam, gekoppeld aan het verslag van waar hij van gemaakt is.",
    },
    context: {
      en: "The day logs in docs/log/ hold the reasoning behind almost every decision on this site, and no visitor could ever see them. The stack page answers what; nothing answered how or why.",
      nl: "De dagverslagen in docs/log/ bevatten de redenering achter vrijwel elke beslissing op deze site, en geen bezoeker kon ze ooit zien. De techniekpagina beantwoordt wát; niets beantwoordde hoe of waarom.",
    },
    decision: {
      choice: {
        en: "One archive in the repository, one curated timeline on the site, and the same technology keys joining it to the stack.",
        nl: "Eén archief in de repository, één samengestelde tijdlijn op de site, en dezelfde technologiesleutels die hem aan de techniek koppelen.",
      },
      why: {
        en: "A public history that is written separately from the real one becomes marketing. Sourcing both from the same events means the page can only say what the archive says.",
        nl: "Een publieke geschiedenis die los van de echte wordt geschreven, wordt marketing. Beide uit dezelfde gebeurtenissen halen betekent dat de pagina alleen kan zeggen wat het archief zegt.",
      },
      tradeoff: {
        en: "The archive has to be updated with the work rather than after it, or the timeline quietly falls behind.",
        nl: "Het archief moet mét het werk worden bijgewerkt en niet erna, anders raakt de tijdlijn stilletjes achterop.",
      },
    },
    implementation: {
      en: "An internal archive under TIMEVAULT/, this typed event list, and an Evolution section on the stack page — desktop first, at the owner's instruction, with the full experience established before it is translated to smaller screens.",
      nl: "Een intern archief onder TIMEVAULT/, deze getypeerde gebeurtenissenlijst, en een sectie Evolutie op de techniekpagina — desktop eerst, op instructie van de eigenaar, waarbij de volledige ervaring eerst staat voordat hij naar kleinere schermen wordt vertaald.",
    },
    result: {
      en: "You are reading it.",
      nl: "Je leest hem nu.",
    },
    tech: ["next", "typescript", "framer-motion", "tailwind"],
    prs: [87],
    related: ["tech-stack-page", "navigation-rebuilt"],
    entry: "2026-08-27-timevault",
  },
]

/** Chronological, oldest first — the order the timeline renders. */
export const TIMEVAULT_ORDER = [...TIMEVAULT_EVENTS].sort((a, b) =>
  a.date.localeCompare(b.date)
)

export function eventById(id: string): TimevaultEvent | undefined {
  return TIMEVAULT_EVENTS.find((e) => e.id === id)
}

/** Every event that touched a given /stack technology key. */
export function eventsForTech(techKey: string): TimevaultEvent[] {
  return TIMEVAULT_ORDER.filter((e) => e.tech.includes(techKey))
}

export const CATEGORY_LABELS: Record<TimevaultCategory, L> = {
  architecture: { en: "Architecture", nl: "Architectuur" },
  design: { en: "Design", nl: "Ontwerp" },
  ux: { en: "UX", nl: "UX" },
  accessibility: { en: "Accessibility", nl: "Toegankelijkheid" },
  technology: { en: "Technology", nl: "Technologie" },
  performance: { en: "Performance", nl: "Prestatie" },
  research: { en: "Research", nl: "Onderzoek" },
}

export const STATUS_LABELS: Record<TimevaultStatus, L> = {
  verified: { en: "Verified", nl: "Geverifieerd" },
  reconstructed: { en: "Reconstructed", nl: "Gereconstrueerd" },
  proposed: { en: "Proposed", nl: "Voorgesteld" },
  "in-progress": { en: "In progress", nl: "Loopt nu" },
  superseded: { en: "Superseded", nl: "Vervangen" },
}

/** What each status actually claims — shown where the badge is explained. */
export const STATUS_NOTES: Record<TimevaultStatus, L> = {
  verified: {
    en: "Backed by commits in this repository.",
    nl: "Gedekt door commits in deze repository.",
  },
  reconstructed: {
    en: "Real, but rebuilt from the day logs — this repository's history begins later.",
    nl: "Echt gebeurd, maar herleid uit de dagverslagen — de historie van deze repository begint later.",
  },
  proposed: { en: "Decided, not built.", nl: "Besloten, niet gebouwd." },
  "in-progress": { en: "Being built now.", nl: "Wordt nu gebouwd." },
  superseded: {
    en: "Shipped, then replaced by something later on this timeline.",
    nl: "Live gegaan en later op deze tijdlijn vervangen.",
  },
}

// ── The steps behind each milestone ────────────────────────────────
//
// Thirteen marks for sixty-two commits was over-curated: the owner's
// verdict was that the timeline looked small next to the work. It was.
//
// So each milestone carries the real pull requests underneath it, dated
// and in order. The marks stay few because a survey line with sixty
// labels is unreadable — but the detail panel now shows every step, and
// the reversals sit next to the things they reversed, which is the part
// of this history worth keeping.
//
// Sourced from `git log` on main. PRs #1–#20 are not in this history;
// where a step has no number it comes from the day logs instead.

export type Step = {
  date: string
  pr?: number
  label: L
  /** Marks a step that undid an earlier one, usually the same day. */
  reversal?: boolean
}

export const STEPS: Record<string, Step[]> = {
  "first-build": [
    {
      date: "2026-07-10",
      label: { en: "Seven pages, four palettes, English and Dutch", nl: "Zeven pagina's, vier paletten, Engels en Nederlands" },
    },
    {
      date: "2026-07-12",
      label: { en: "Motion system: curtain menu, cursor, stacking cards", nl: "Bewegingssysteem: gordijnmenu, cursor, stapelende kaarten" },
    },
    {
      date: "2026-07-14",
      label: { en: "3D wireframe terrain, in three tiers", nl: "3D-draadmodelterrein, in drie niveaus" },
    },
    {
      date: "2026-07-15",
      label: { en: "SEO layer: sitemap, robots, OG card, JSON-LD", nl: "SEO-laag: sitemap, robots, OG-kaart, JSON-LD" },
    },
    {
      date: "2026-07-16",
      label: { en: "Dutch legal pages; the terms ship as a draft", nl: "Nederlandse juridische pagina's; de voorwaarden zijn concept" },
    },
    {
      date: "2026-07-17",
      label: { en: "A server relay for the contact form, proven impossible", nl: "Een serverrelais voor het formulier, onmogelijk gebleken" },
      reversal: true,
    },
    {
      date: "2026-07-18",
      label: { en: "The editorial redesign merged by mistake, then reverted", nl: "De redactionele herontwerp per ongeluk gemerged, daarna teruggedraaid" },
      reversal: true,
    },
    {
      date: "2026-07-19",
      label: { en: "Domain outage: nameservers reset by the transfer", nl: "Domeinstoring: nameservers gereset door de verhuizing" },
    },
    {
      date: "2026-07-19",
      label: { en: "Live on gronn.studio", nl: "Live op gronn.studio" },
    },
  ],
  editor: [
    { date: "2026-07-20", label: { en: "Content layer under every page", nl: "Contentlaag onder elke pagina" } },
    { date: "2026-07-20", label: { en: "Google sign-in, restricted to one address", nl: "Google-login, beperkt tot één adres" } },
    { date: "2026-07-20", label: { en: "Click-to-edit on the live page itself", nl: "Klik-en-wijzig op de live pagina zelf" } },
    { date: "2026-07-20", label: { en: "A Sanity foundation, built and left dormant", nl: "Een Sanity-fundament, gebouwd en slapend gelaten" } },
    { date: "2026-07-20", pr: 21, label: { en: "The editor joins the menus", nl: "De editor komt in de menu's" } },
  ],
  "phone-as-app": [
    { date: "2026-07-21", pr: 22, label: { en: "Dock: blur film, frosted glass, tuck, pull-to-refresh", nl: "Dock: blurfilm, matglas, wegduiken, pull-to-refresh" } },
    { date: "2026-07-21", pr: 23, label: { en: "The tilt sheen comes straight back out", nl: "De kantelglans gaat er meteen weer uit" }, reversal: true },
    { date: "2026-07-21", pr: 24, label: { en: "Instagram-liquid dock pill; Nocturne as default", nl: "Instagram-vloeibare dockpil; Nocturne als standaard" } },
    { date: "2026-07-21", pr: 25, label: { en: "Liquid glass across the rest of the chrome", nl: "Vloeibaar glas over de rest van de chrome" } },
    { date: "2026-07-21", pr: 26, label: { en: "The header is dropped on phones entirely", nl: "De balk verdwijnt volledig op telefoons" } },
    { date: "2026-07-21", pr: 27, label: { en: "Clear the dock beneath the horizontal gallery", nl: "Ruimte onder de horizontale galerij vrijmaken" } },
    { date: "2026-07-21", pr: 28, label: { en: "Phones get a grid — the pinned gallery clips", nl: "Telefoons krijgen een raster — de vaste galerij snijdt af" } },
    { date: "2026-07-21", pr: 29, label: { en: "The logo comes back; the header slims to logo-only", nl: "Het logo komt terug; de balk krimpt tot alleen het logo" }, reversal: true },
    { date: "2026-07-21", pr: 30, label: { en: "Project cards swipe horizontally", nl: "Projectkaarten vegen horizontaal" } },
    { date: "2026-07-21", pr: 31, label: { en: "The logo comes and goes with the scroll", nl: "Het logo komt en gaat met de scroll" } },
    { date: "2026-07-21", pr: 32, label: { en: "The card slide is linked to page scroll", nl: "Het kaartglijden wordt aan de paginascroll gekoppeld" } },
    { date: "2026-07-21", pr: 33, label: { en: "That glide is served to all phones", nl: "Dat glijden gaat naar alle telefoons" } },
    { date: "2026-07-21", pr: 34, label: { en: "Password-gated blur over the business credentials", nl: "Blur met wachtwoord over de bedrijfsgegevens" } },
    { date: "2026-07-21", pr: 35, label: { en: "A back-to-top button on desktop", nl: "Een terug-naar-boven-knop op desktop" } },
    { date: "2026-07-21", pr: 36, label: { en: "The blur boots with the page, and covers two more spots", nl: "De blur start mee met de pagina en dekt twee plekken extra" } },
  ],
  "perf-and-locales": [
    { date: "2026-07-26", pr: 38, label: { en: "A business roadmap, written down", nl: "Een zakelijke routekaart, opgeschreven" } },
    { date: "2026-07-26", pr: 39, label: { en: "The recording-blur flag moves to an external store", nl: "De blur-vlag verhuist naar een externe store" } },
    { date: "2026-07-26", pr: 40, label: { en: "Image pipeline for all photography; Lighthouse baseline committed", nl: "Beeldpijplijn voor alle fotografie; Lighthouse-basislijn vastgelegd" } },
    { date: "2026-07-26", pr: 37, label: { en: "The 21 July session reconstructed into the worklog", nl: "De sessie van 21 juli gereconstrueerd in het werklog" } },
    { date: "2026-07-27", pr: 41, label: { en: "The 3D layer builds when idle, pauses off screen", nl: "De 3D-laag bouwt bij rust, pauzeert buiten beeld" } },
    { date: "2026-07-27", pr: 42, label: { en: "Locale routes: Dutch gets indexable URLs", nl: "Localeroutes: Nederlands krijgt indexeerbare URL's" } },
    { date: "2026-07-27", pr: 43, label: { en: "Production perf results written up", nl: "Prestatieresultaten uit productie vastgelegd" } },
    { date: "2026-07-27", pr: 44, label: { en: "Accessibility floor: focus traps, skip link, focus ring", nl: "Toegankelijkheidsbodem: focusvallen, skiplink, focusring" } },
    { date: "2026-07-27", pr: 45, label: { en: "Accessibility to 100; paint before hydration", nl: "Toegankelijkheid naar 100; tekenen vóór hydratie" } },
  ],
  "contrast-auditor": [
    { date: "2026-07-30", pr: 46, label: { en: "Brand lockups as SVG", nl: "Merklockups als SVG" } },
    { date: "2026-07-31", pr: 48, label: { en: "Craft pass across the whole site", nl: "Vakwerkronde over de hele site" } },
    { date: "2026-07-31", pr: 48, label: { en: "The contrast auditor: 122 pairs, non-zero on failure", nl: "De contrastauditor: 122 paren, foutcode bij zakken" } },
    { date: "2026-07-31", pr: 48, label: { en: "\"Marl\" and \"Peat\" rejected — a tinted ground reads muddy", nl: "\"Marl\" en \"Peat\" afgewezen — een getinte ondergrond leest modderig" }, reversal: true },
    { date: "2026-07-31", pr: 48, label: { en: "The Hours: five palettes, and a second switcher", nl: "The Hours: vijf paletten, en een tweede schakelaar" } },
    { date: "2026-07-31", pr: 48, label: { en: "Time-of-day theming, on the visitor's own clock", nl: "Thema naar het uur, op de klok van de bezoeker" } },
  ],
  "tech-stack-page": [
    { date: "2026-08-01", pr: 47, label: { en: "Four layers as a cross-section", nl: "Vier lagen als dwarsdoorsnede" } },
    { date: "2026-08-01", pr: 47, label: { en: "Every technology opens: why it was chosen, what it costs", nl: "Elke techniek opent: waarom gekozen, wat het kost" } },
    { date: "2026-08-01", pr: 47, label: { en: "Versions read from package.json at build time", nl: "Versies bij het bouwen uit package.json gelezen" } },
    { date: "2026-08-01", pr: 50, label: { en: "Diagram auto-rotation, and a mobile touch fix", nl: "Diagram draait automatisch, plus een touchfix op mobiel" } },
  ],
  "quality-gate": [
    { date: "2026-08-01", pr: 49, label: { en: "The green photo film becomes one glass screen", nl: "De groene fotofilm wordt één glazen scherm" } },
    { date: "2026-08-01", pr: 55, label: { en: "CI with real browser tests; three axe findings fixed", nl: "CI met echte browsertests; drie axe-bevindingen hersteld" } },
    { date: "2026-08-01", pr: 54, label: { en: "Build-time blur placeholders for every photograph", nl: "Blur-plaatshouders bij het bouwen, voor elke foto" } },
    { date: "2026-08-01", pr: 56, label: { en: "Field vitals from real visits", nl: "Veldmetingen uit echte bezoeken" } },
    { date: "2026-08-01", pr: 53, label: { en: "The dormant Sanity path removed", nl: "Het slapende Sanity-pad verwijderd" }, reversal: true },
    { date: "2026-08-01", pr: 52, label: { en: "Terrain choreography archived by owner decision", nl: "Terreinchoreografie gearchiveerd op besluit van de eigenaar" } },
  ],
  "app-mode": [
    { date: "2026-08-02", pr: 57, label: { en: "View transitions: the card becomes the page", nl: "Viewtransities: de kaart wordt de pagina" } },
    { date: "2026-08-02", pr: 58, label: { en: "Campaign doc updated; the archive recorded", nl: "Campagnedocument bijgewerkt; het archief vastgelegd" } },
    { date: "2026-08-02", pr: 59, label: { en: "The three highlighted circles share one stadium", nl: "De drie gemarkeerde cirkels delen één stadion" } },
    { date: "2026-08-02", pr: 60, label: { en: "App mode: the installed site becomes a real app", nl: "App-modus: de geïnstalleerde site wordt een echte app" } },
    { date: "2026-08-02", pr: 61, label: { en: "Back-to-top swaps in place with the menu button", nl: "Terug-naar-boven wisselt ter plekke met de menuknop" } },
    { date: "2026-08-02", pr: 62, label: { en: "The wings fold away while reading", nl: "De vleugels vouwen weg tijdens het lezen" } },
    { date: "2026-08-02", pr: 63, label: { en: "An even glass ring around the collapsed button", nl: "Een gelijkmatige glasring om de ingeklapte knop" } },
    { date: "2026-08-02", pr: 64, label: { en: "Active page on a fresh load; the ember orbit ring", nl: "Actieve pagina bij verse lading; de ember-baanring" } },
  ],
  "case-studies": [
    { date: "2026-08-03", pr: 65, label: { en: "Measured outcomes, counted up", nl: "Gemeten resultaten, opgeteld" } },
    { date: "2026-08-03", pr: 65, label: { en: "A before-and-after wipe", nl: "Een voor-en-na-veeg" } },
    { date: "2026-08-03", pr: 65, label: { en: "Client voices, in the client's own words", nl: "Klantstemmen, in de woorden van de klant" } },
    { date: "2026-08-08", pr: 66, label: { en: "Dock: bigger icons — and then a fortnight of silence", nl: "Dock: grotere iconen — en daarna twee weken stilte" } },
  ],
  "seo-and-admin": [
    { date: "2026-08-22", pr: 70, label: { en: "Scroll locking fixed partway down long pages", nl: "Scrollvergrendeling hersteld halverwege lange pagina's" } },
    { date: "2026-08-22", pr: 71, label: { en: "Dutch metadata, canonicals, real structured data", nl: "Nederlandse metadata, canonieke URL's, echte gestructureerde data" } },
    { date: "2026-08-24", pr: 72, label: { en: "Quotes and invoices at /admin", nl: "Offertes en facturen op /admin" } },
    { date: "2026-08-24", pr: 73, label: { en: "Switchable letterhead, date pickers, columns, fit-to-width", nl: "Omschakelbaar briefhoofd, datumkiezers, kolommen, passend maken" } },
    { date: "2026-08-24", pr: 74, label: { en: "The studio's details print once, at the foot", nl: "De studiogegevens printen één keer, onderaan" } },
  ],
  "published-prices": [
    { date: "2026-08-25", pr: 75, label: { en: "Five seasonal services, with published prices", nl: "Vijf seizoensdiensten, met gepubliceerde prijzen" } },
    { date: "2026-08-25", pr: 75, label: { en: "A page per service: what is in, and what is not", nl: "Een pagina per dienst: wat erbij zit en wat niet" } },
    { date: "2026-08-25", pr: 75, label: { en: "A postcode check that answers honestly when it is no", nl: "Een postcodecheck die eerlijk nee zegt" } },
    { date: "2026-08-25", pr: 75, label: { en: "The placeholder that contradicted its own instruction", nl: "De plaatshouder die zijn eigen instructie tegensprak" }, reversal: true },
  ],
  "navigation-rebuilt": [
    { date: "2026-08-25", pr: 76, label: { en: "A services mega menu; navigation reaches tablets", nl: "Een diensten-megamenu; navigatie bereikt tablets" } },
    { date: "2026-08-26", pr: 77, label: { en: "The mega menu reshaped as a floating card", nl: "Het megamenu hervormd tot zwevende kaart" } },
    { date: "2026-08-26", pr: 78, label: { en: "Entry points follow the two-family structure", nl: "Ingangen volgen de tweedeling" } },
    { date: "2026-08-26", pr: 79, label: { en: "/nl/admin 404 — the links are fixed", nl: "/nl/admin 404 — de links zijn hersteld" } },
    { date: "2026-08-26", pr: 80, label: { en: "/nl/admin 404 again — the URL needed a redirect too", nl: "/nl/admin 404 opnieuw — ook de URL had een redirect nodig" }, reversal: true },
    { date: "2026-08-26", pr: 80, label: { en: "The curtain replaced by panels hanging from the bar", nl: "Het gordijn vervangen door panelen onder de balk" } },
    { date: "2026-08-26", pr: 81, label: { en: "One menu tree, five sections, three renderings", nl: "Eén menuboom, vijf secties, drie weergaven" } },
    { date: "2026-08-26", pr: 82, label: { en: "The cookie notice put on ice", nl: "De cookiemelding in de ijskast" } },
    { date: "2026-08-26", label: { en: "The shared-ground icon set, built and reverted the same day", nl: "De iconenset op één grondlijn, gebouwd en dezelfde dag teruggedraaid" }, reversal: true },
    { date: "2026-08-26", pr: 83, label: { en: "Per-section dock panels; one control pill; breadcrumbs", nl: "Dockpanelen per sectie; één bedieningspil; kruimelpaden" } },
    { date: "2026-08-26", pr: 83, label: { en: "A tablet menu — closing a gap reopened by #80", nl: "Een tabletmenu — een gat dat #80 heropende, weer dicht" } },
    { date: "2026-08-26", pr: 84, label: { en: "The + steps aside so an open dock carries five sections", nl: "De plus stapt opzij zodat een open dock vijf secties draagt" } },
    { date: "2026-08-27", pr: 85, label: { en: "The two brand faces self-hosted; fake bold forbidden", nl: "De twee merkletters zelf gehost; nep-vet verboden" } },
    { date: "2026-08-27", pr: 86, label: { en: "The dock line-up restored — asked for three times", nl: "De dockbezetting hersteld — drie keer om gevraagd" }, reversal: true },
    { date: "2026-08-27", pr: 86, label: { en: "The tablet bar emptied; everything behind one Menu", nl: "De tabletbalk leeggemaakt; alles achter één Menu" } },
  ],
  timevault: [
    { date: "2026-08-27", pr: 87, label: { en: "The archive: eleven documents, thirteen entries", nl: "Het archief: elf documenten, dertien entries" } },
    { date: "2026-08-27", pr: 87, label: { en: "Provenance on every event — verified, or reconstructed", nl: "Herkomst bij elke gebeurtenis — geverifieerd, of gereconstrueerd" } },
    { date: "2026-08-27", pr: 87, label: { en: "The survey line, with labels in lanes so nothing collides", nl: "De meetlijn, met labels in banen zodat niets botst" } },
    { date: "2026-08-27", pr: 87, label: { en: "The join with the stack, in both directions", nl: "De koppeling met de techniek, beide kanten op" } },
    { date: "2026-08-27", pr: 87, label: { en: "Marks that were unclickable, found by a test", nl: "Meetpunten die niet klikbaar waren, gevonden door een test" }, reversal: true },
    { date: "2026-08-27", pr: 87, label: { en: "Ember as small text at 2.82:1, found by axe", nl: "Ember als kleine tekst op 2,82:1, gevonden door axe" }, reversal: true },
  ],
}

export function stepsFor(id: string): Step[] {
  return STEPS[id] ?? []
}

/** Every step on the timeline, for the count the section reports. */
export const STEP_COUNT = Object.values(STEPS).reduce(
  (n, list) => n + list.length,
  0
)
