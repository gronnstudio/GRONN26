/**
 * Generates content/site-content.json from the TypeScript content
 * modules — the committed fallback document for src/lib/content.ts and
 * the seed for the first editor publish.
 *
 *   npx tsx scripts/export-content.ts
 */
import { writeFileSync } from "node:fs"
import { join } from "node:path"

import { ARTICLES } from "../src/lib/data/journal"
import { PROJECTS } from "../src/lib/data/projects"
import { SERVICES } from "../src/lib/data/services"
import { STACK_LAYERS, STACK_TECH } from "../src/lib/stack"
import type { SiteContent } from "../src/lib/content-types"

const content: SiteContent = {
  siteCopy: {
    heroTitle: [
      { en: "Landscapes designed", nl: "Landschappen ontworpen" },
      { en: "as living systems.", nl: "als levende systemen." },
    ],
    heroSubtitle: {
      en: "GRØNN Studio designs regenerative gardens, ecological water systems and resilient outdoor spaces that work with nature rather than against it.",
      nl: "GRØNN Studio ontwerpt regeneratieve tuinen, ecologische watersystemen en veerkrachtige buitenruimtes die mét de natuur werken in plaats van ertegen.",
    },
    heroLocation: {
      en: "Regenerative Landscape Design — Stein (LB), NL",
      nl: "Regeneratief landschapsontwerp — Stein (LB), NL",
    },
    availability: {
      en: "Taking new projects",
      nl: "Ruimte voor nieuwe projecten",
    },
    ctaTitle: [
      { en: "Let the landscape become", nl: "Laat het landschap deel" },
      { en: "part of the solution.", nl: "van de oplossing worden." },
    ],
    ctaSubtitle: {
      en: "Tell us about your garden, pond or ecological challenge — every project begins with understanding the site.",
      nl: "Vertel ons over je tuin, vijver of ecologische uitdaging — elk project begint met het begrijpen van de locatie.",
    },
  },
  studio: {
    heroTitle: [
      { en: "Ecological design", nl: "Ecologisch ontwerp" },
      { en: "begins with observation.", nl: "begint met observatie." },
    ],
    about: {
      en: "GRØNN Studio is a specialist ecological design practice for gardens, water systems, habitat creation and regenerative landscape transformation. We start from how a site actually works — its water, soil, light and life — and design from those relationships outward. The result is not a decorated plot but a functioning landscape that grows richer with every season.",
      nl: "GRØNN Studio is een gespecialiseerd ecologisch ontwerpbureau voor tuinen, watersystemen, habitatcreatie en regeneratieve landschapstransformatie. We vertrekken vanuit hoe een locatie werkelijk werkt — het water, de bodem, het licht en het leven — en ontwerpen vanuit die relaties naar buiten. Het resultaat is geen gedecoreerd perceel, maar een functionerend landschap dat elk seizoen rijker wordt.",
    },
    founderName: { en: "Nick", nl: "Nick" },
    founderRoles: [
      { en: "Ecological designer", nl: "Ecologisch ontwerper" },
      { en: "Systems thinker", nl: "Systeemdenker" },
      { en: "Practical maker", nl: "Praktische maker" },
      { en: "Garden observer", nl: "Tuinobservator" },
      { en: "Founder of GRØNN Studio", nl: "Oprichter van GRØNN Studio" },
    ],
    founderBio: {
      en: "Nick founded GRØNN to close the gap between ecological knowledge and everyday gardens — translating how living systems work into designs that can be built, maintained and loved.",
      nl: "Nick richtte GRØNN op om de kloof te dichten tussen ecologische kennis en alledaagse tuinen — door te vertalen hoe levende systemen werken naar ontwerpen die gebouwd, onderhouden en geliefd kunnen worden.",
    },
    mission: {
      en: "To make ecological intelligence understandable, practical and visually powerful.",
      nl: "Ecologische intelligentie begrijpelijk, praktisch en visueel krachtig maken.",
    },
    philosophy: [
      { en: "Nature is a system", nl: "Natuur is een systeem" },
      {
        en: "Beauty and function belong together",
        nl: "Schoonheid en functie horen bij elkaar",
      },
      { en: "Soil and water come first", nl: "Bodem en water komen eerst" },
      {
        en: "Every intervention should perform multiple functions",
        nl: "Elke ingreep moet meerdere functies vervullen",
      },
      {
        en: "Landscapes should improve over time",
        nl: "Landschappen moeten met de tijd beter worden",
      },
    ],
    manifestoTitle: [
      {
        en: "We do not add nature to a design.",
        nl: "We voegen geen natuur toe aan een ontwerp.",
      },
      { en: "Nature is the design.", nl: "Natuur ís het ontwerp." },
    ],
    manifestoBody: {
      en: "We design soil that can recover. Water that stays in the landscape. Plant communities that support life. Habitats that become richer over time.",
      nl: "We ontwerpen bodem die kan herstellen. Water dat in het landschap blijft. Plantengemeenschappen die leven ondersteunen. Habitats die rijker worden met de tijd.",
    },
    manifestoClose: {
      en: "We design living systems.",
      nl: "We ontwerpen levende systemen.",
    },
  },
  home: {
    observationTitle: {
      en: "Every landscape begins with attention.",
      nl: "Elk landschap begint met aandacht.",
    },
    observationBody: {
      en: "Before anything is designed, the site is read: how water moves, where light falls, what the soil holds, which life is already present. The design starts from what the landscape is already trying to do.",
      nl: "Voordat er iets wordt ontworpen, wordt de locatie gelezen: hoe water beweegt, waar licht valt, wat de bodem bevat, welk leven er al is. Het ontwerp vertrekt vanuit wat het landschap al probeert te doen.",
    },
    observationPins: [
      { en: "Soil", nl: "Bodem" },
      { en: "Water", nl: "Water" },
      { en: "Light", nl: "Licht" },
      { en: "Movement", nl: "Beweging" },
      { en: "Existing habitat", nl: "Bestaande habitat" },
    ],
    systemTitle: {
      en: "Eight elements, one system",
      nl: "Acht elementen, één systeem",
    },
    systemHint: {
      en: "Select an element to see how it connects to the rest of the landscape.",
      nl: "Selecteer een element om te zien hoe het verbonden is met de rest van het landschap.",
    },
    systemElements: [
      {
        label: { en: "Soil", nl: "Bodem" },
        text: {
          en: "Living soil stores water, feeds roots and hosts the biology every other element depends on. We build it first: de-compaction, organic matter, permanent cover.",
          nl: "Levende bodem bergt water, voedt wortels en herbergt de biologie waar elk ander element van afhangt. We bouwen die eerst op: verdichting doorbreken, organische stof, permanente bedekking.",
        },
      },
      {
        label: { en: "Water", nl: "Water" },
        text: {
          en: "Water can be retained, slowed, filtered and reused within the landscape. Downpipes feed planting, low points become rain gardens, ponds circulate through planted filters instead of machinery.",
          nl: "Water kan binnen het landschap worden vastgehouden, vertraagd, gefilterd en hergebruikt. Regenpijpen voeden beplanting, laagtes worden regentuinen, vijvers circuleren door beplante filters in plaats van door techniek.",
        },
      },
      {
        label: { en: "Plants", nl: "Planten" },
        text: {
          en: "Plant communities — not specimens — occupy every layer and season. They shade soil, pump carbon into it, filter water and feed everything with wings or legs.",
          nl: "Plantengemeenschappen — geen solitairen — bezetten elke laag en elk seizoen. Ze beschaduwen de bodem, pompen er koolstof in, filteren water en voeden alles met vleugels of poten.",
        },
      },
      {
        label: { en: "Fungi", nl: "Schimmels" },
        text: {
          en: "Mycorrhizal networks connect roots into one trading system, moving water and nutrients where they are needed. Undisturbed soil and woody mulch keep the network intact.",
          nl: "Mycorrhizanetwerken verbinden wortels tot één handelssysteem dat water en voedingsstoffen brengt waar ze nodig zijn. Ongestoorde bodem en houtige mulch houden het netwerk intact.",
        },
      },
      {
        label: { en: "Wildlife", nl: "Dieren" },
        text: {
          en: "Insects, birds and amphibians are the workforce: pollination, pest control, decomposition. They stay when food, shelter, water and safe routes exist together.",
          nl: "Insecten, vogels en amfibieën zijn de werkkrachten: bestuiving, plaagbeheersing, afbraak. Ze blijven wanneer voedsel, beschutting, water en veilige routes samen aanwezig zijn.",
        },
      },
      {
        label: { en: "Materials", nl: "Materialen" },
        text: {
          en: "Durable, repairable, low-impact — and preferably already on site. Excavated stone becomes spillways; old paving becomes footings; nothing leaves that can still work.",
          nl: "Duurzaam, repareerbaar, met lage impact — en het liefst al op de locatie aanwezig. Uitgegraven steen wordt een overloop; oude bestrating wordt fundering; niets vertrekt dat nog kan werken.",
        },
      },
      {
        label: { en: "Climate", nl: "Klimaat" },
        text: {
          en: "Every design is stress-tested against cloudbursts and drought. Retained water, shaded soil and layered planting are the buffer that keeps the system stable as extremes sharpen.",
          nl: "Elk ontwerp wordt getest op hoosbuien en droogte. Vastgehouden water, beschaduwde bodem en gelaagde beplanting vormen de buffer die het systeem stabiel houdt terwijl de extremen scherper worden.",
        },
      },
      {
        label: { en: "People", nl: "Mensen" },
        text: {
          en: "Landscapes must stay usable, understandable and maintainable. Paths, sightlines and seasonal rhythm are designed so people remain part of the system, not visitors to it.",
          nl: "Landschappen moeten bruikbaar, begrijpelijk en onderhoudbaar blijven. Paden, zichtlijnen en seizoensritme zijn zo ontworpen dat mensen deel van het systeem blijven, geen bezoekers ervan.",
        },
      },
    ],
    processTitle: { en: "How GRØNN works", nl: "Zo werkt GRØNN" },
    processStages: [
      {
        title: { en: "Observe", nl: "Observeren" },
        text: {
          en: "Study the landscape before introducing change.",
          nl: "Bestudeer het landschap voordat je iets verandert.",
        },
      },
      {
        title: { en: "Map", nl: "In kaart brengen" },
        text: {
          en: "Identify patterns, constraints, flows and opportunities.",
          nl: "Breng patronen, beperkingen, stromen en kansen in kaart.",
        },
      },
      {
        title: { en: "Connect", nl: "Verbinden" },
        text: {
          en: "Create relationships between soil, water, planting, habitat and people.",
          nl: "Leg relaties tussen bodem, water, beplanting, habitat en mensen.",
        },
      },
      {
        title: { en: "Design", nl: "Ontwerpen" },
        text: {
          en: "Translate ecological intelligence into a clear spatial system.",
          nl: "Vertaal ecologische intelligentie naar een helder ruimtelijk systeem.",
        },
      },
      {
        title: { en: "Establish", nl: "Vestigen" },
        text: {
          en: "Build, plant, monitor and guide the landscape through its early development.",
          nl: "Bouw, beplant, monitor en begeleid het landschap door zijn eerste ontwikkeling.",
        },
      },
      {
        title: { en: "Evolve", nl: "Evolueren" },
        text: {
          en: "Allow the landscape to mature and adapt over time.",
          nl: "Laat het landschap rijpen en zich aanpassen in de loop van de tijd.",
        },
      },
    ],
    brandTitle: [
      { en: "Nature is not decoration.", nl: "Natuur is geen decoratie." },
      { en: "Nature is infrastructure.", nl: "Natuur is infrastructuur." },
    ],
    brandBody: {
      en: "Every garden is a network of relationships between soil, water, plants, wildlife, materials and people. GRØNN designs those relationships as one functioning system.",
      nl: "Elke tuin is een netwerk van relaties tussen bodem, water, planten, dieren, materialen en mensen. GRØNN ontwerpt die relaties als één functionerend systeem.",
    },
    principles: [
      { en: "Observe before acting.", nl: "Observeer voordat je handelt." },
      { en: "Keep water in the landscape.", nl: "Houd water in het landschap." },
      { en: "Build living soil.", nl: "Bouw levende bodem." },
      { en: "Design relationships.", nl: "Ontwerp relaties." },
      { en: "Create habitat.", nl: "Creëer habitat." },
      { en: "Reduce unnecessary materials.", nl: "Beperk overbodige materialen." },
      { en: "Allow nature to evolve.", nl: "Laat de natuur evolueren." },
      { en: "Make beauty functional.", nl: "Maak schoonheid functioneel." },
    ],
    studioIntroTitle: [
      { en: "Designing", nl: "Ontwerpen" },
      { en: "with life.", nl: "met leven." },
    ],
    studioIntroBody: {
      en: "GRØNN Studio is an ecological design practice founded by Nick. The studio combines observation, systems thinking, practical craftsmanship and ecological knowledge to create gardens and landscapes that become richer, stronger and more resilient over time.",
      nl: "GRØNN Studio is een ecologisch ontwerpbureau, opgericht door Nick. De studio combineert observatie, systeemdenken, praktisch vakmanschap en ecologische kennis om tuinen en landschappen te maken die in de loop van de tijd rijker, sterker en veerkrachtiger worden.",
    },
    studioIntroTag: {
      en: "Ecological intelligence translated into practical design.",
      nl: "Ecologische intelligentie vertaald naar praktisch ontwerp.",
    },
    ticker: {
      en: "Grow green · Live wild · Thrive together · Rooted in nature · ",
      nl: "Groei groen · Leef wild · Bloei samen · Geworteld in de natuur · ",
    },
    testimonialsTitle: {
      en: "What the gardens' people say",
      nl: "Wat de mensen van de tuinen zeggen",
    },
    // Placeholder fiction awaiting real client quotes — same register
    // and rule as the placeholder projects they reference.
    testimonials: [
      {
        quote: {
          en: "The pond stopped being a chore and became the reason we sit outside. This spring we counted dragonflies we had never seen before.",
          nl: "De vijver is geen klus meer maar de reden dat we buiten zitten. Dit voorjaar telden we libellen die we nog nooit hadden gezien.",
        },
        name: "Familie Verhoeven",
        context: {
          en: "Two Ponds, One Living System — Utrecht",
          nl: "Twee vijvers, één levend systeem — Utrecht",
        },
      },
      {
        quote: {
          en: "We asked for less lawn and got back an hour every weekend — and a garden that hums in July.",
          nl: "We vroegen om minder gazon en kregen elk weekend een uur terug — en een tuin die zoemt in juli.",
        },
        name: "M. de Bruin",
        context: {
          en: "From Lawn to Living Garden — Eindhoven",
          nl: "Van gazon naar levende tuin — Eindhoven",
        },
      },
      {
        quote: {
          en: "GRØNN read the site before drawing a single line. The design felt less like an imposition and more like a translation.",
          nl: "GRØNN las eerst de plek voordat er één lijn werd getekend. Het ontwerp voelde niet opgelegd, maar als een vertaling.",
        },
        name: "S. Jansen",
        context: {
          en: "Ecological consultancy — Limburg",
          nl: "Ecologisch advies — Limburg",
        },
      },
    ],
  },
  approach: {
    heroTitle: [
      { en: "A landscape is a system,", nl: "Een landschap is een systeem," },
      { en: "not a composition.", nl: "geen compositie." },
    ],
    heroIntro: {
      en: "Seven elements form the core framework of every GRØNN design. The process that carries them from observation to maturity runs in five phases.",
      nl: "Zeven elementen vormen het kernraamwerk van elk GRØNN-ontwerp. Het proces dat ze van observatie naar volwassenheid brengt, verloopt in vijf fasen.",
    },
    framework: [
      {
        title: { en: "Soil", nl: "Bodem" },
        text: {
          en: "Build and protect the living foundation.",
          nl: "Bouw en bescherm het levende fundament.",
        },
      },
      {
        title: { en: "Water", nl: "Water" },
        text: {
          en: "Slow it, spread it, store it and circulate it.",
          nl: "Vertraag het, verspreid het, berg het en laat het circuleren.",
        },
      },
      {
        title: { en: "Plants", nl: "Planten" },
        text: {
          en: "Design communities rather than isolated specimens.",
          nl: "Ontwerp gemeenschappen in plaats van losse solitairen.",
        },
      },
      {
        title: { en: "Habitat", nl: "Habitat" },
        text: {
          en: "Create food, shelter, water and ecological connectivity.",
          nl: "Creëer voedsel, beschutting, water en ecologische verbinding.",
        },
      },
      {
        title: { en: "Materials", nl: "Materialen" },
        text: {
          en: "Use durable, repairable and low-impact materials.",
          nl: "Gebruik duurzame, repareerbare materialen met lage impact.",
        },
      },
      {
        title: { en: "Time", nl: "Tijd" },
        text: {
          en: "Design for succession, maturity and change.",
          nl: "Ontwerp voor successie, rijping en verandering.",
        },
      },
      {
        title: { en: "People", nl: "Mensen" },
        text: {
          en: "Create landscapes that remain usable, understandable and maintainable.",
          nl: "Creëer landschappen die bruikbaar, begrijpelijk en onderhoudbaar blijven.",
        },
      },
    ],
    frameworkNote: {
      en: "Every element performs more than one function.",
      nl: "Elk element vervult meer dan één functie.",
    },
    phases: [
      {
        index: { en: "Phase 1", nl: "Fase 1" },
        title: {
          en: "Consultation and Observation",
          nl: "Consult en observatie",
        },
        steps: [
          { en: "Client conversation", nl: "Gesprek met de klant" },
          { en: "Site visit", nl: "Locatiebezoek" },
          { en: "Measurements", nl: "Opmetingen" },
          {
            en: "Existing-condition assessment",
            nl: "Beoordeling bestaande situatie",
          },
          { en: "Initial recommendations", nl: "Eerste aanbevelingen" },
        ],
      },
      {
        index: { en: "Phase 2", nl: "Fase 2" },
        title: {
          en: "Preparation and Technical Planning",
          nl: "Voorbereiding en technische planning",
        },
        steps: [
          { en: "Design refinement", nl: "Ontwerpverfijning" },
          { en: "Material planning", nl: "Materiaalplanning" },
          { en: "Technical details", nl: "Technische details" },
          { en: "Cost estimate", nl: "Kostenraming" },
          { en: "Phasing", nl: "Fasering" },
        ],
      },
      {
        index: { en: "Phase 3", nl: "Fase 3" },
        title: {
          en: "Construction and Installation",
          nl: "Aanleg en installatie",
        },
        steps: [
          { en: "Groundworks", nl: "Grondwerk" },
          { en: "Water systems", nl: "Watersystemen" },
          { en: "Structural elements", nl: "Structurele elementen" },
          { en: "Planting preparation", nl: "Plantvoorbereiding" },
          { en: "Main implementation", nl: "Hoofduitvoering" },
        ],
      },
      {
        index: { en: "Phase 4", nl: "Fase 4" },
        title: { en: "Ecological Finishing", nl: "Ecologische afwerking" },
        steps: [
          { en: "Planting", nl: "Beplanting" },
          { en: "Habitat features", nl: "Habitatelementen" },
          { en: "Mulching", nl: "Mulchen" },
          { en: "System calibration", nl: "Systeemafstelling" },
          { en: "Final detailing", nl: "Laatste detaillering" },
        ],
      },
      {
        index: { en: "Phase 5", nl: "Fase 5" },
        title: { en: "Review and Development", nl: "Evaluatie en ontwikkeling" },
        steps: [
          { en: "System check", nl: "Systeemcontrole" },
          { en: "Adjustments", nl: "Bijstellingen" },
          { en: "Ecological monitoring", nl: "Ecologische monitoring" },
          { en: "Maintenance guidance", nl: "Onderhoudsbegeleiding" },
        ],
      },
    ],
  },
  stack: {
    heroTitle: [
      { en: "What this site", nl: "Waar deze site" },
      { en: "is actually built from.", nl: "werkelijk van gemaakt is." },
    ],
    heroIntro: {
      en: "Nineteen choices, four layers, and the trade-off each one carries. Pick a layer to narrow the view, open a technology to read why it is here and what it costs.",
      nl: "Negentien keuzes, vier lagen, en de afweging die elke keuze meebrengt. Kies een laag om de weergave te versmallen, open een techniek om te lezen waarom die er is en wat die kost.",
    },
    filterHint: {
      en: "Select a layer to filter, then open any technology for the reasoning behind it.",
      nl: "Selecteer een laag om te filteren en open daarna een techniek voor de redenering erachter.",
    },
    // Positional: index i is STACK_LAYERS[i] / STACK_TECH[i] in
    // src/lib/stack.ts. Structure there, sentences here.
    layers: STACK_LAYERS.map(({ title, summary }) => ({ title, summary })),
    tech: STACK_TECH.map(({ role, why, cost }) => ({ role, why, cost })),
    principlesTitle: {
      en: "The rules underneath the list",
      nl: "De regels onder de lijst",
    },
    principles: [
      {
        en: "One animation library. Never a second one beside it.",
        nl: "Eén animatiebibliotheek. Nooit een tweede ernaast.",
      },
      {
        en: "Colours are named after their role, never after a hex code — that is how five palettes come out of one set of components.",
        nl: "Kleuren heten naar hun rol, nooit naar een hexcode — zo komen er vijf paletten uit één set componenten.",
      },
      {
        en: "Every animation has a still version. Reduced motion is a supported way to read this site, not a degraded one.",
        nl: "Elke animatie heeft een stille versie. Reduced motion is een volwaardige manier om deze site te lezen, geen uitgeklede.",
      },
      {
        en: "Every control carries a visible word. Nothing here is an icon you have to decode.",
        nl: "Elk bedieningselement draagt een zichtbaar woord. Niets hier is een icoon dat je moet ontcijferen.",
      },
      {
        en: "Both languages are real addresses, not a switch in the browser — Dutch pages can be found, linked and indexed.",
        nl: "Beide talen zijn echte adressen, geen schakelaar in de browser — Nederlandse pagina's zijn vindbaar, deelbaar en indexeerbaar.",
      },
      {
        en: "Nothing merges until the type check, the linter and the production build are all silent.",
        nl: "Er wordt niets samengevoegd voordat de typecontrole, de linter en de productiebuild alle drie zwijgen.",
      },
    ],
    closing: {
      en: "The same manifest is kept byte-identical in the Equilibrium repository, so either site can be checked against the other. Convergence is the plan; the version gap is the work.",
      nl: "Hetzelfde manifest wordt byte-identiek bijgehouden in de Equilibrium-repository, zodat beide sites tegen elkaar te controleren zijn. Convergentie is het plan; het versieverschil is het werk.",
    },
  },
  pages: {
    projects: {
      heroTitle: [
        { en: "From isolated elements", nl: "Van losse elementen" },
        { en: "to functioning systems.", nl: "naar functionerende systemen." },
      ],
      heroIntro: {
        en: "Every project starts with a site that isn't working as a system — water leaving too fast, soil sealed shut, life locked out — and ends with the relationships restored.",
        nl: "Elk project begint met een locatie die niet als systeem functioneert — water dat te snel verdwijnt, een dichtgeslagen bodem, buitengesloten leven — en eindigt met herstelde relaties.",
      },
    },
    journal: {
      heroTitle: [
        { en: "Field notes from", nl: "Veldnotities uit" },
        { en: "living landscapes.", nl: "levende landschappen." },
      ],
      heroIntro: {
        en: "Ecological observations, project knowledge and practical guidance — the thinking behind the studio's work, documented as it develops.",
        nl: "Ecologische observaties, projectkennis en praktische begeleiding — het denken achter het werk van de studio, gedocumenteerd terwijl het zich ontwikkelt.",
      },
    },
    services: {
      heroTitle: [
        { en: "Ecological design", nl: "Ecologisch ontwerp" },
        { en: "for living landscapes.", nl: "voor levende landschappen." },
      ],
      heroIntro: {
        en: "Six ways of working, one method underneath: observe the site, understand its relationships, and design every element to perform more than one function.",
        nl: "Zes manieren van werken, één onderliggende methode: observeer de locatie, begrijp de relaties en ontwerp elk element zodat het meer dan één functie vervult.",
      },
    },
    contact: {
      heroTitle: [
        { en: "Every project begins with", nl: "Elk project begint met" },
        { en: "understanding the site.", nl: "het begrijpen van de locatie." },
      ],
      heroIntro: {
        en: "Tell us about your garden, pond or landscape challenge in four short steps. A first project assessment or site consultation may be recommended before design or implementation begins.",
        nl: "Vertel ons in vier korte stappen over je tuin-, vijver- of landschapsvraagstuk. Vóór ontwerp of uitvoering kan een eerste projectbeoordeling of locatieconsult worden aanbevolen.",
      },
    },
  },
  projects: PROJECTS,
  articles: ARTICLES,
  services: SERVICES,
}

const out = join(process.cwd(), "content", "site-content.json")
writeFileSync(out, JSON.stringify(content, null, 2) + "\n")
console.log(`wrote ${out}`)
