import type { L } from "@/lib/i18n"

export type Article = {
  slug: string
  title: L
  category: L
  date: string
  question: L
  excerpt: L
  body: { heading: L; text: L }[]
  principle: L
}

export const ARTICLES: Article[] = [
  {
    slug: "why-a-pond-should-not-stand-alone",
    title: {
      en: "Why a Pond Should Not Stand Alone",
      nl: "Waarom een vijver niet op zichzelf moet staan",
    },
    category: { en: "Water", nl: "Water" },
    date: "2026-05-14",
    question: {
      en: "Why do most garden ponds fail within five years?",
      nl: "Waarom falen de meeste tuinvijvers binnen vijf jaar?",
    },
    excerpt: {
      en: "A pond is not a water feature. It is the wettest point of a system that starts at the gutter and ends in the soil.",
      nl: "Een vijver is geen waterornament. Het is het natste punt van een systeem dat begint bij de dakgoot en eindigt in de bodem.",
    },
    body: [
      {
        heading: { en: "The isolated pond", nl: "De geïsoleerde vijver" },
        text: {
          en: "Most ponds are installed as objects: a hole, a liner, a pump. Cut off from the soil, the planting and the rainwater around them, they depend entirely on machinery and maintenance to stay alive. When either stops, the pond turns green.",
          nl: "De meeste vijvers worden aangelegd als objecten: een gat, folie, een pomp. Afgesneden van de bodem, de beplanting en het regenwater eromheen zijn ze volledig afhankelijk van techniek en onderhoud om in leven te blijven. Zodra één van beide stopt, slaat de vijver groen uit.",
        },
      },
      {
        heading: {
          en: "What a pond actually needs",
          nl: "Wat een vijver werkelijk nodig heeft",
        },
        text: {
          en: "Stable water chemistry comes from relationships — marginal plants absorbing nutrients, shaded and sunlit zones exchanging water, shallow edges where life can enter and leave. Circulation, filtration and habitat are not accessories; they are the pond.",
          nl: "Stabiele waterchemie komt voort uit relaties — oeverplanten die voedingsstoffen opnemen, beschaduwde en zonnige zones die water uitwisselen, ondiepe randen waar leven in en uit kan. Circulatie, filtering en habitat zijn geen accessoires; ze zíjn de vijver.",
        },
      },
      {
        heading: { en: "In practice", nl: "In de praktijk" },
        text: {
          en: "In our Two Ponds project, connecting two failing ponds with a planted stream and a wetland filter solved problems ten years of pump upgrades could not. The intervention was ecological, not mechanical.",
          nl: "In ons project Twee Vijvers loste het verbinden van twee falende vijvers met een beplante beek en een moerasfilter problemen op waar tien jaar aan pompupgrades niets aan konden doen. De ingreep was ecologisch, niet mechanisch.",
        },
      },
    ],
    principle: {
      en: "Design the water system, not the water feature.",
      nl: "Ontwerp het watersysteem, niet het waterornament.",
    },
  },
  {
    slug: "soil-as-living-infrastructure",
    title: {
      en: "Soil as Living Infrastructure",
      nl: "Bodem als levende infrastructuur",
    },
    category: { en: "Soil", nl: "Bodem" },
    date: "2026-04-02",
    question: {
      en: "What is the most expensive thing to ignore in a garden?",
      nl: "Wat is het duurste om te negeren in een tuin?",
    },
    excerpt: {
      en: "Every function a garden performs — drainage, growth, resilience, carbon — runs through the soil first.",
      nl: "Elke functie die een tuin vervult — afwatering, groei, veerkracht, koolstof — loopt eerst door de bodem.",
    },
    body: [
      {
        heading: { en: "The hidden system", nl: "Het verborgen systeem" },
        text: {
          en: "A single gram of healthy soil holds more organisms than there are people on earth. That biology builds structure, stores water, feeds roots and buffers drought. Compacted, sealed or stripped soil does none of it.",
          nl: "Eén gram gezonde bodem bevat meer organismen dan er mensen op aarde zijn. Die biologie bouwt structuur, bergt water, voedt wortels en buffert droogte. Verdichte, afgedekte of afgegraven bodem doet niets van dat alles.",
        },
      },
      {
        heading: {
          en: "Building soil deliberately",
          nl: "Bewust bodem opbouwen",
        },
        text: {
          en: "We de-compact before we plant, mulch instead of digging, and keep roots in the ground year round. Soil recovery is slow but compounding — the cheapest infrastructure a garden will ever get.",
          nl: "We maken de bodem los vóór we planten, mulchen in plaats van spitten en houden het hele jaar wortels in de grond. Bodemherstel is traag maar cumulatief — de goedkoopste infrastructuur die een tuin ooit zal krijgen.",
        },
      },
    ],
    principle: {
      en: "Build living soil before anything that stands on it.",
      nl: "Bouw levende bodem vóór alles wat erop staat.",
    },
  },
  {
    slug: "designing-gardens-for-water",
    title: {
      en: "Designing Gardens for Water",
      nl: "Tuinen ontwerpen voor water",
    },
    category: { en: "Water", nl: "Water" },
    date: "2026-03-11",
    question: {
      en: "Where does the rain that falls on your garden actually go?",
      nl: "Waar gaat de regen die op je tuin valt eigenlijk heen?",
    },
    excerpt: {
      en: "In most gardens, straight to the sewer. A regenerative garden slows, spreads and stores that water instead.",
      nl: "In de meeste tuinen rechtstreeks het riool in. Een regeneratieve tuin vertraagt, verspreidt en bergt dat water juist.",
    },
    body: [
      {
        heading: { en: "Slow, spread, store", nl: "Vertragen, verspreiden, bergen" },
        text: {
          en: "Downpipes can feed planting beds. Paths can infiltrate. Low points can become rain gardens that flood beautifully for a day and feed the subsoil for a month. The technique is old; only the will is new.",
          nl: "Regenpijpen kunnen plantvakken voeden. Paden kunnen infiltreren. Laagtes kunnen regentuinen worden die één dag prachtig onder water staan en de ondergrond een maand lang voeden. De techniek is oud; alleen de wil is nieuw.",
        },
      },
      {
        heading: {
          en: "Drought is a design problem",
          nl: "Droogte is een ontwerpprobleem",
        },
        text: {
          en: "The same garden that floods in October is bone dry in July — because the water was never kept. Retention is the answer to both extremes at once.",
          nl: "Dezelfde tuin die in oktober onderloopt, is in juli kurkdroog — omdat het water nooit is vastgehouden. Retentie is het antwoord op beide extremen tegelijk.",
        },
      },
    ],
    principle: {
      en: "Keep water in the landscape.",
      nl: "Houd water in het landschap.",
    },
  },
  {
    slug: "the-role-of-plant-communities",
    title: {
      en: "The Role of Plant Communities",
      nl: "De rol van plantengemeenschappen",
    },
    category: { en: "Plants", nl: "Planten" },
    date: "2026-02-18",
    question: {
      en: "Why do some plantings thrive on neglect while others die of care?",
      nl: "Waarom gedijen sommige beplantingen bij verwaarlozing terwijl andere sterven aan zorg?",
    },
    excerpt: {
      en: "Plants evolved in communities, not in beds. Design the community and the maintenance designs itself.",
      nl: "Planten zijn geëvolueerd in gemeenschappen, niet in borders. Ontwerp de gemeenschap en het onderhoud ontwerpt zichzelf.",
    },
    body: [
      {
        heading: {
          en: "Specimens versus systems",
          nl: "Solitairen versus systemen",
        },
        text: {
          en: "A traditional border is a collection of individuals competing for the same light and water, held apart by bare mulch and labour. A plant community layers species that occupy different niches — in space, in season, in root depth — so the planting closes itself against weeds.",
          nl: "Een traditionele border is een verzameling individuen die om hetzelfde licht en water concurreren, uit elkaar gehouden door kale mulch en arbeid. Een plantengemeenschap stapelt soorten die verschillende niches innemen — in ruimte, in seizoen, in worteldiepte — zodat de beplanting zichzelf sluit tegen onkruid.",
        },
      },
      {
        heading: { en: "Designing the layers", nl: "De lagen ontwerpen" },
        text: {
          en: "Matrix grasses and sedges carry the ground layer. Seasonal theme plants flower through it. Structural species give the winter its architecture. Each layer earns its place ecologically before it earns it visually.",
          nl: "Matrixgrassen en zeggen dragen de bodemlaag. Seizoensplanten bloeien erdoorheen. Structuursoorten geven de winter zijn architectuur. Elke laag verdient zijn plek eerst ecologisch en daarna pas visueel.",
        },
      },
    ],
    principle: {
      en: "Design communities, not compositions.",
      nl: "Ontwerp gemeenschappen, geen composities.",
    },
  },
  {
    slug: "habitat-before-decoration",
    title: {
      en: "Habitat Before Decoration",
      nl: "Habitat vóór decoratie",
    },
    category: { en: "Habitat", nl: "Habitat" },
    date: "2026-01-27",
    question: {
      en: "What turns a green garden into a living one?",
      nl: "Wat maakt van een groene tuin een levende tuin?",
    },
    excerpt: {
      en: "Food, shelter, water and connection — if one is missing, wildlife visits but never stays.",
      nl: "Voedsel, beschutting, water en verbinding — ontbreekt er één, dan komen dieren op bezoek maar blijven ze nooit.",
    },
    body: [
      {
        heading: { en: "The four requirements", nl: "De vier vereisten" },
        text: {
          en: "A bird needs more than a feeder: nesting cover, insect prey, water and a safe route between them. Habitat design means providing all four in reach of each other, all year round.",
          nl: "Een vogel heeft meer nodig dan een voederhuisje: nestgelegenheid, insecten als prooi, water en een veilige route ertussen. Habitatontwerp betekent alle vier binnen elkaars bereik bieden, het hele jaar door.",
        },
      },
      {
        heading: {
          en: "Beauty is not the opposite",
          nl: "Schoonheid is niet het tegendeel",
        },
        text: {
          en: "Deadwood can be sculptural. A brash hedge can be an elegant boundary. The most biodiverse features in our projects are usually the ones visitors photograph first.",
          nl: "Doodhout kan sculpturaal zijn. Een takkenril kan een elegante erfgrens zijn. De meest biodiverse elementen in onze projecten zijn meestal degene die bezoekers als eerste fotograferen.",
        },
      },
    ],
    principle: {
      en: "Create habitat; the beauty follows.",
      nl: "Creëer habitat; de schoonheid volgt.",
    },
  },
  {
    slug: "what-happens-after-a-garden-is-built",
    title: {
      en: "What Happens After a Garden Is Built",
      nl: "Wat er gebeurt nadat een tuin is aangelegd",
    },
    category: { en: "Field Notes", nl: "Veldnotities" },
    date: "2025-12-09",
    question: {
      en: "Is a garden finished the day the crew leaves?",
      nl: "Is een tuin af op de dag dat de hoveniers vertrekken?",
    },
    excerpt: {
      en: "A conventional garden peaks on handover day. A living system is at its worst — it only improves from there.",
      nl: "Een conventionele tuin piekt op de dag van oplevering. Een levend systeem is dan op zijn slechtst — het wordt alleen maar beter.",
    },
    body: [
      {
        heading: { en: "Year one is establishment", nl: "Jaar één is aanslaan" },
        text: {
          en: "Roots go down before anything goes up. The first season looks sparse because the growth is underground. Watering, editing and patience matter more than any intervention.",
          nl: "Wortels gaan eerst omlaag voordat er iets omhoog gaat. Het eerste seizoen oogt schraal omdat de groei ondergronds zit. Water geven, bijsturen en geduld doen er meer toe dan welke ingreep dan ook.",
        },
      },
      {
        heading: { en: "Years two to five", nl: "Jaar twee tot vijf" },
        text: {
          en: "The layers close, the soil life returns, the maintenance drops. Our role shifts from builder to editor: thinning, adjusting, letting the system reveal what it wants to become.",
          nl: "De lagen sluiten zich, het bodemleven keert terug, het onderhoud neemt af. Onze rol verschuift van bouwer naar redacteur: uitdunnen, bijstellen, het systeem laten tonen wat het wil worden.",
        },
      },
    ],
    principle: {
      en: "Design for the tenth year, not the photo shoot.",
      nl: "Ontwerp voor het tiende jaar, niet voor de fotoshoot.",
    },
  },
]

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug)
}
