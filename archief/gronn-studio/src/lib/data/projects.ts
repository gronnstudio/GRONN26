import type { L } from "@/lib/i18n"

export type ProjectCategory =
  | "gardens"
  | "water"
  | "habitat"
  | "planting"
  | "consultation"
  | "in-progress"

export type CaseSection = {
  index: string
  title: L
  body: L
  points?: L[]
}

// Outcome data — the numbers ARE the layout (campaign Phase 2, the
// Patagonia move: species before and after, litres retained, materials
// reused, seasons of soil recovery). Placeholder fiction by owner
// decision 2 Aug 2026, same register as the rest of the content —
// values swap in place when real project data lands.
export type Outcome = {
  label: L
  // Short numeric strings; CountUp animates the first number in
  // `after`. `before` is optional — some outcomes have no meaningful
  // starting figure ("80% of stone reused").
  before?: L
  after: L
  note?: L
}

export type Project = {
  slug: string
  title: L
  location: string
  category: ProjectCategory
  objective: L
  intervention: L
  status: L
  // Hand-picked picsum IDs (landscape/plant/water shots) — unified into the
  // brand's material language by the `photo-glass` screen, the same
  // treatment the hero mosaic and every other photograph carries.
  imageId: number
  // Editor-uploaded photograph (Vercel Blob URL). When present it wins
  // over imageId — see projectImage() in @/lib/placeholder.
  image?: string
  featured?: boolean
  metrics?: { label: L; value: L }[]
  outcomes?: Outcome[]
  // Before/after pair for the comparison slider — placeholder ids until
  // real project photography exists (same rule as imageId).
  transformation?: { beforeId: number; afterId: number; caption?: L }
  sections?: CaseSection[]
}

export const CATEGORY_LABELS: Record<ProjectCategory, L> = {
  gardens: { en: "Garden Transformation", nl: "Tuintransformatie" },
  water: { en: "Ecological Water Design", nl: "Ecologisch waterontwerp" },
  habitat: { en: "Habitat Creation", nl: "Habitatcreatie" },
  planting: { en: "Planting Design", nl: "Beplantingsontwerp" },
  consultation: { en: "Consultation", nl: "Advies" },
  "in-progress": { en: "Work in Progress", nl: "In uitvoering" },
}

const STATUS = {
  completed: { en: "Completed", nl: "Afgerond" },
  developing: { en: "Developing", nl: "In ontwikkeling" },
  inProgress: { en: "In Progress", nl: "In uitvoering" },
} satisfies Record<string, L>

export const PROJECTS: Project[] = [
  {
    slug: "two-ponds-one-living-system",
    title: {
      en: "Two Ponds, One Living System",
      nl: "Twee vijvers, één levend systeem",
    },
    location: "Utrecht, Netherlands",
    category: "water",
    objective: {
      en: "Connect two failing ornamental ponds into a single circulating, self-filtering water system.",
      nl: "Twee falende siervijvers verbinden tot één circulerend, zelffilterend watersysteem.",
    },
    intervention: {
      en: "Planted stream connection, wetland biofilter, wildlife edges",
      nl: "Beplante beekverbinding, moerasbiofilter, natuurvriendelijke oevers",
    },
    status: STATUS.developing,
    imageId: 28,
    featured: true,
    metrics: [
      {
        label: { en: "Water retained on site", nl: "Water vastgehouden op locatie" },
        value: { en: "≈ 18 m³", nl: "≈ 18 m³" },
      },
      {
        label: { en: "Hard surface removed", nl: "Verharding verwijderd" },
        value: { en: "42 m²", nl: "42 m²" },
      },
      {
        label: { en: "Habitat zones created", nl: "Habitatzones gecreëerd" },
        value: { en: "6", nl: "6" },
      },
      {
        label: { en: "Native species added", nl: "Inheemse soorten toegevoegd" },
        value: { en: "58", nl: "58" },
      },
      {
        label: { en: "Water circulation", nl: "Watercirculatie" },
        value: {
          en: "Continuous, gravity-assisted",
          nl: "Continu, ondersteund door zwaartekracht",
        },
      },
      {
        label: { en: "Materials reused", nl: "Materialen hergebruikt" },
        value: {
          en: "80% of excavated stone",
          nl: "80% van het uitgegraven steen",
        },
      },
    ],
    transformation: {
      beforeId: 17,
      afterId: 28,
      caption: {
        en: "The same ground, two summers apart: a mown corridor became circulating water, planted banks and stone refuges.",
        nl: "Dezelfde grond, twee zomers later: een gemaaide strook werd circulerend water, beplante oevers en schuilplekken van steen.",
      },
    },
    outcomes: [
      {
        label: {
          en: "Aquatic and marginal species observed",
          nl: "Waargenomen water- en oeversoorten",
        },
        before: { en: "11", nl: "11" },
        after: { en: "34", nl: "34" },
        note: {
          en: "Counted along both ponds and the stream edge, seasons one and two.",
          nl: "Geteld langs beide vijvers en de beekrand, seizoen één en twee.",
        },
      },
      {
        label: {
          en: "Rainwater retained per storm event",
          nl: "Regenwater vastgehouden per bui",
        },
        before: { en: "0 m³", nl: "0 m³" },
        after: { en: "18 m³", nl: "18 m³" },
        note: {
          en: "Roof and terrace runoff now feeds the system instead of the sewer.",
          nl: "Afvoer van dak en terras voedt nu het systeem in plaats van het riool.",
        },
      },
      {
        label: {
          en: "Excavated stone returned as habitat",
          nl: "Uitgegraven steen teruggebracht als habitat",
        },
        after: { en: "80%", nl: "80%" },
        note: {
          en: "Dry-stacked into edges and refuges rather than hauled away.",
          nl: "Droog gestapeld tot randen en schuilplekken in plaats van afgevoerd.",
        },
      },
      {
        label: {
          en: "Maintenance hours per season",
          nl: "Onderhoudsuren per seizoen",
        },
        before: { en: "26 h", nl: "26 u" },
        after: { en: "6 h", nl: "6 u" },
        note: {
          en: "The biofilter does the work the weekly regime used to.",
          nl: "Het biofilter doet het werk dat eerst wekelijks onderhoud vroeg.",
        },
      },
      {
        label: {
          en: "Soil organic matter, planted banks",
          nl: "Organische stof in de beplante oevers",
        },
        before: { en: "2.1%", nl: "2,1%" },
        after: { en: "4.8%", nl: "4,8%" },
        note: {
          en: "Three seasons tracked; undisturbed soil and mulch left in place.",
          nl: "Drie seizoenen gevolgd; ongestoorde bodem en mulch bleven liggen.",
        },
      },
    ],
    sections: [
      {
        index: "01",
        title: { en: "Project Introduction", nl: "Projectintroductie" },
        body: {
          en: "A private garden with two separate ornamental ponds, both installed a decade apart and both struggling. The client wanted clear water, less maintenance and more life — without losing the character of the garden.",
          nl: "Een privétuin met twee losse siervijvers, met tien jaar tussenpoos aangelegd en allebei in de problemen. De klant wilde helder water, minder onderhoud en meer leven — zonder het karakter van de tuin te verliezen.",
        },
      },
      {
        index: "02",
        title: { en: "Existing Situation", nl: "Bestaande situatie" },
        body: {
          en: "The upper pond sat in full sun with no planting and turned green every summer. The lower pond was shaded, silted and slowly leaking. Neither had shallow edges, so wildlife could reach the water but not use it.",
          nl: "De bovenste vijver lag in de volle zon zonder beplanting en sloeg elke zomer groen uit. De onderste vijver lag in de schaduw, was dichtgeslibd en lekte langzaam. Geen van beide had ondiepe oevers, dus dieren konden het water wel bereiken maar niet gebruiken.",
        },
      },
      {
        index: "03",
        title: { en: "Ecological Challenge", nl: "Ecologische uitdaging" },
        body: {
          en: "Both ponds were isolated elements: no circulation, no filtration, no connection to the soil and planting around them.",
          nl: "Beide vijvers waren geïsoleerde elementen: geen circulatie, geen filtering, geen verbinding met de bodem en beplanting eromheen.",
        },
        points: [
          {
            en: "Water leaving the site too quickly through the leak",
            nl: "Water dat via het lek te snel van de locatie verdween",
          },
          {
            en: "No circulation between sun-warmed and shaded water",
            nl: "Geen circulatie tussen zonverwarmd en beschaduwd water",
          },
          {
            en: "Limited habitat — steep liner edges, no marginal planting",
            nl: "Beperkte habitat — steile folieranden, geen oeverbeplanting",
          },
          {
            en: "Nutrient load with nothing planted to absorb it",
            nl: "Voedingsstoffenbelasting zonder beplanting die deze opneemt",
          },
        ],
      },
      {
        index: "04",
        title: { en: "Design Strategy", nl: "Ontwerpstrategie" },
        body: {
          en: "Treat the two ponds as one system. Water is lifted once from the lower pond and returns by gravity through a planted stream, a wetland biofilter and a shallow spillway — so every metre of the route filters, oxygenates or hosts life.",
          nl: "Behandel de twee vijvers als één systeem. Water wordt eenmalig opgepompt uit de onderste vijver en stroomt via zwaartekracht terug door een beplante beek, een moerasbiofilter en een ondiepe overloop — zodat elke meter van de route filtert, zuurstof toevoegt of leven herbergt.",
        },
      },
      {
        index: "05",
        title: { en: "System Diagram", nl: "Systeemdiagram" },
        body: {
          en: "The upper pond overflows into a planted stream that drops through a gravel wetland. The wetland's root zone strips nutrients before the water re-enters the lower pond across a stone spillway that doubles as a bird bath and insect drinking edge.",
          nl: "De bovenste vijver loopt over in een beplante beek die door een grindmoeras zakt. De wortelzone van het moeras onttrekt voedingsstoffen voordat het water via een stenen overloop — die tegelijk vogelbad en drinkrand voor insecten is — terugstroomt in de onderste vijver.",
        },
      },
      {
        index: "06",
        title: { en: "Materials and Planting", nl: "Materialen en beplanting" },
        body: {
          en: "Excavated stone was reused for the spillway and stream bed. Planting follows wet-to-dry gradients: submerged oxygenators, marginal rushes and sedges, moisture-loving perennials on the banks, and a native hedge line for shelter.",
          nl: "Uitgegraven steen is hergebruikt voor de overloop en de beekbedding. De beplanting volgt gradiënten van nat naar droog: ondergedoken zuurstofplanten, russen en zeggen langs de oever, vochtminnende vaste planten op de taluds en een inheemse haag voor beschutting.",
        },
      },
      {
        index: "07",
        title: { en: "Construction Process", nl: "Uitvoeringsproces" },
        body: {
          en: "Phase one repaired the lower pond and shaped the new edges. Phase two built the stream and wetland filter. Phase three planted the system and calibrated flow rates over several weeks of observation.",
          nl: "Fase één herstelde de onderste vijver en vormde de nieuwe oevers. Fase twee bouwde de beek en het moerasfilter. Fase drie beplantte het systeem en stelde de doorstroming af tijdens enkele weken van observatie.",
        },
      },
      {
        index: "08",
        title: { en: "Result", nl: "Resultaat" },
        body: {
          en: "Clear water within one season, dragonflies and amphibians in the first summer, and a garden that now sounds like moving water instead of a pump.",
          nl: "Helder water binnen één seizoen, libellen en amfibieën in de eerste zomer, en een tuin die nu klinkt naar stromend water in plaats van naar een pomp.",
        },
      },
      {
        index: "09",
        title: {
          en: "Long-Term Development",
          nl: "Ontwikkeling op lange termijn",
        },
        body: {
          en: "The wetland filter matures over two to three years as root mass builds. Maintenance shifts from cleaning to editing: thinning vigorous planting and letting the system settle into its own balance.",
          nl: "Het moerasfilter rijpt in twee tot drie jaar naarmate de wortelmassa groeit. Het onderhoud verschuift van schoonmaken naar bijsturen: krachtige beplanting uitdunnen en het systeem zijn eigen evenwicht laten vinden.",
        },
      },
    ],
  },
  {
    slug: "lawn-to-living-garden",
    title: {
      en: "From Lawn to Living Garden",
      nl: "Van gazon naar levende tuin",
    },
    location: "Arnhem, Netherlands",
    category: "gardens",
    objective: {
      en: "Convert a paved, lawn-dominated garden into a layered, water-retaining landscape.",
      nl: "Een betegelde, door gazon gedomineerde tuin omvormen tot een gelaagd, waterbergend landschap.",
    },
    intervention: {
      en: "Hardscape removal, soil recovery, layered planting",
      nl: "Verharding verwijderen, bodemherstel, gelaagde beplanting",
    },
    status: STATUS.completed,
    imageId: 17,
    metrics: [
      {
        label: { en: "Hard surface removed", nl: "Verharding verwijderd" },
        value: { en: "65 m²", nl: "65 m²" },
      },
      {
        label: {
          en: "Soil de-compacted and mulched",
          nl: "Bodem losgemaakt en gemulcht",
        },
        value: { en: "180 m²", nl: "180 m²" },
      },
      {
        label: { en: "Native species added", nl: "Inheemse soorten toegevoegd" },
        value: { en: "74", nl: "74" },
      },
    ],
    sections: [
      {
        index: "01",
        title: { en: "Project Introduction", nl: "Projectintroductie" },
        body: {
          en: "A typical suburban garden: tight lawn, concrete tiles, two shrubs and a fence. The brief was simple — more life, less maintenance, somewhere to actually be.",
          nl: "Een typische buitenwijktuin: strak gazon, betontegels, twee heesters en een schutting. De opdracht was simpel — meer leven, minder onderhoud, een plek om echt te zijn.",
        },
      },
      {
        index: "02",
        title: { en: "Existing Situation", nl: "Bestaande situatie" },
        body: {
          en: "Compacted subsoil under the lawn, rainwater running straight to the drain, and planting with no relationship to the site or to each other.",
          nl: "Verdichte ondergrond onder het gazon, regenwater dat rechtstreeks het riool in liep, en beplanting zonder relatie met de plek of met elkaar.",
        },
      },
      {
        index: "03",
        title: { en: "Ecological Challenge", nl: "Ecologische uitdaging" },
        body: {
          en: "The garden shed water and repelled life.",
          nl: "De tuin stootte water af en weerde leven.",
        },
        points: [
          {
            en: "Compacted soil with almost no organic matter",
            nl: "Verdichte bodem met nauwelijks organische stof",
          },
          {
            en: "Excessive hardscape draining to the sewer",
            nl: "Overmatige verharding die afwatert op het riool",
          },
          {
            en: "Isolated planting with no layers and no succession",
            nl: "Geïsoleerde beplanting zonder lagen en zonder successie",
          },
        ],
      },
      {
        index: "04",
        title: { en: "Design Strategy", nl: "Ontwerpstrategie" },
        body: {
          en: "Remove two-thirds of the paving, break the compaction, and rebuild the garden as planted layers around a gravel path that doubles as an infiltration zone. Every downpipe now feeds the garden, not the drain.",
          nl: "Twee derde van de bestrating eruit, de verdichting doorbreken en de tuin heropbouwen als beplante lagen rond een grindpad dat tegelijk infiltratiezone is. Elke regenpijp voedt nu de tuin in plaats van het riool.",
        },
      },
      {
        index: "08",
        title: { en: "Result", nl: "Resultaat" },
        body: {
          en: "A garden that swallows cloudbursts, feeds pollinators from March to November and needs one maintenance day per season.",
          nl: "Een tuin die hoosbuien opvangt, bestuivers voedt van maart tot november en één onderhoudsdag per seizoen vraagt.",
        },
      },
    ],
  },
  {
    slug: "hedgerow-habitat-network",
    title: {
      en: "Hedgerow Habitat Network",
      nl: "Habitatnetwerk van hagen",
    },
    location: "Veluwe edge, Netherlands",
    category: "habitat",
    objective: {
      en: "Link an isolated rural garden to the surrounding landscape with native hedgerows and a wildlife pond.",
      nl: "Een geïsoleerde landelijke tuin verbinden met het omliggende landschap via inheemse hagen en een natuurvijver.",
    },
    intervention: {
      en: "Native hedging, deadwood structures, amphibian pond",
      nl: "Inheemse hagen, doodhoutstructuren, amfibieënpoel",
    },
    status: STATUS.completed,
    imageId: 12,
    sections: [
      {
        index: "01",
        title: { en: "Project Introduction", nl: "Projectintroductie" },
        body: {
          en: "A large rural plot surrounded by farmland, ecologically cut off despite its size. The owners wanted birds, hedgehogs and amphibians back.",
          nl: "Een groot landelijk perceel omringd door landbouwgrond, ecologisch afgesneden ondanks de omvang. De eigenaren wilden vogels, egels en amfibieën terug.",
        },
      },
      {
        index: "04",
        title: { en: "Design Strategy", nl: "Ontwerpstrategie" },
        body: {
          en: "Plant mixed native hedgerows along two boundaries to reconnect the plot to a nearby woodland strip, add a shallow amphibian pond in the wettest corner, and build deadwood and brash structures as shelter stepping-stones.",
          nl: "Gemengde inheemse hagen langs twee perceelgrenzen om het terrein te verbinden met een nabijgelegen bosstrook, een ondiepe amfibieënpoel in de natste hoek, en doodhout- en takkenstructuren als beschutte stapstenen.",
        },
      },
      {
        index: "08",
        title: { en: "Result", nl: "Resultaat" },
        body: {
          en: "Twelve bird species nesting in year two, smooth newts in the pond in the first spring, and a garden that now functions as a corridor rather than an island.",
          nl: "Twaalf vogelsoorten die in jaar twee broeden, kleine watersalamanders in de poel in het eerste voorjaar, en een tuin die nu functioneert als corridor in plaats van als eiland.",
        },
      },
    ],
  },
  {
    slug: "shade-garden-plant-communities",
    title: {
      en: "Shade Garden Plant Communities",
      nl: "Plantengemeenschappen voor de schaduwtuin",
    },
    location: "Amersfoort, Netherlands",
    category: "planting",
    objective: {
      en: "Replace struggling lawn under mature trees with self-sustaining woodland-edge planting.",
      nl: "Kwakkelend gazon onder volwassen bomen vervangen door zelfvoorzienende bosrandbeplanting.",
    },
    intervention: {
      en: "Layered shade planting, soil building, leaf-litter cycling",
      nl: "Gelaagde schaduwbeplanting, bodemopbouw, bladstrooiselkringloop",
    },
    status: STATUS.completed,
    imageId: 33,
    sections: [
      {
        index: "01",
        title: { en: "Project Introduction", nl: "Projectintroductie" },
        body: {
          en: "Grass will not grow under old beeches — and it shouldn't have to. This design works with the shade instead of fighting it.",
          nl: "Gras groeit niet onder oude beuken — en dat hoeft ook niet. Dit ontwerp werkt mét de schaduw in plaats van ertegen.",
        },
      },
      {
        index: "04",
        title: { en: "Design Strategy", nl: "Ontwerpstrategie" },
        body: {
          en: "A woodland-edge community: spring bulbs and ephemerals, ferns and sedges as the persistent matrix, and flowering shade perennials in the brighter pockets. Leaf litter stays where it falls and becomes the mulch layer.",
          nl: "Een bosrandgemeenschap: voorjaarsbollen en -bloeiers, varens en zeggen als blijvende matrix, en bloeiende schaduwplanten in de lichtere plekken. Bladstrooisel blijft liggen waar het valt en wordt de mulchlaag.",
        },
      },
      {
        index: "08",
        title: { en: "Result", nl: "Resultaat" },
        body: {
          en: "Full ground cover in eighteen months, no watering after establishment, and the first spring carpet the garden has had in decades.",
          nl: "Volledige bodembedekking in achttien maanden, geen bewatering na aanslaan, en het eerste voorjaarstapijt dat de tuin in decennia heeft gehad.",
        },
      },
    ],
  },
  {
    slug: "pond-rescue-consultation",
    title: { en: "Pond Rescue Consultation", nl: "Reddingsadvies voor een vijver" },
    location: "Zeist, Netherlands",
    category: "consultation",
    objective: {
      en: "Diagnose a chronically murky swimming pond and deliver a phased recovery plan.",
      nl: "Een chronisch troebele zwemvijver diagnosticeren en een gefaseerd herstelplan leveren.",
    },
    intervention: {
      en: "System analysis, biofilter redesign advice, planting plan",
      nl: "Systeemanalyse, advies voor biofilterherontwerp, beplantingsplan",
    },
    status: STATUS.completed,
    imageId: 10,
    sections: [
      {
        index: "01",
        title: { en: "Project Introduction", nl: "Projectintroductie" },
        body: {
          en: "A beautiful swimming pond with a persistent algae problem the installer couldn't solve. One site visit, a full system analysis, and a phased plan the owners could implement themselves.",
          nl: "Een prachtige zwemvijver met een hardnekkig algenprobleem dat de installateur niet kon oplossen. Eén locatiebezoek, een volledige systeemanalyse en een gefaseerd plan dat de eigenaren zelf konden uitvoeren.",
        },
      },
      {
        index: "04",
        title: { en: "Design Strategy", nl: "Ontwerpstrategie" },
        body: {
          en: "The regeneration zone was undersized and starved of flow. The plan rebalanced circulation, tripled the planted filter area and swapped sterile gravel for a living substrate.",
          nl: "De regeneratiezone was te klein en kreeg te weinig doorstroming. Het plan herstelde de circulatie, verdrievoudigde het beplante filteroppervlak en verving steriel grind door een levend substraat.",
        },
      },
      {
        index: "08",
        title: { en: "Result", nl: "Resultaat" },
        body: {
          en: "Clear water by the following summer, without chemicals and without rebuilding the pond.",
          nl: "Helder water in de zomer erna, zonder chemicaliën en zonder de vijver opnieuw te bouwen.",
        },
      },
    ],
  },
  {
    slug: "courtyard-rain-garden",
    title: { en: "Courtyard Rain Garden", nl: "Regentuin op een binnenplaats" },
    location: "Nijmegen, Netherlands",
    category: "in-progress",
    objective: {
      en: "Turn a flood-prone paved courtyard into a rain-fed garden that stores every drop on site.",
      nl: "Een betegelde binnenplaats met wateroverlast omvormen tot een regengevoede tuin die elke druppel ter plekke bergt.",
    },
    intervention: {
      en: "Depaving, infiltration planting beds, rainwater cascade",
      nl: "Onttegelen, infiltratieplantvakken, regenwatercascade",
    },
    status: STATUS.inProgress,
    imageId: 25,
    sections: [
      {
        index: "01",
        title: { en: "Project Introduction", nl: "Projectintroductie" },
        body: {
          en: "An enclosed urban courtyard that flooded in every downpour. Currently under construction: the paving is out, the soil is breathing again, and the rain cascade is being built this season.",
          nl: "Een omsloten stadsbinnenplaats die bij elke hoosbui onderliep. Momenteel in uitvoering: de tegels zijn eruit, de bodem ademt weer en de regencascade wordt dit seizoen gebouwd.",
        },
      },
      {
        index: "04",
        title: { en: "Design Strategy", nl: "Ontwerpstrategie" },
        body: {
          en: "Roof water is made visible — a steel runnel feeds a planted cascade that fills sunken infiltration beds. Overflow only reaches the drain after 40 mm of rain.",
          nl: "Dakwater wordt zichtbaar gemaakt — een stalen goot voedt een beplante cascade die verdiepte infiltratievakken vult. Pas na 40 mm regen bereikt overtollig water het riool.",
        },
      },
    ],
  },
]

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug)
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "gardens",
  "water",
  "habitat",
  "planting",
  "consultation",
  "in-progress",
]
