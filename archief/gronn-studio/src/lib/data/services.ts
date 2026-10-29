import type { L } from "@/lib/i18n"

import { priceHint } from "./pricing"

import { TERRAS_FOTOS } from "./terras-geulle"
import { fotosVoor, type Foto, type FotoId } from "./vijverrenovatie"

/**
 * De foto op een dienstkaart (Nick, 25 sep 2026: "relevantere fotos,
 * mogen pexels stock fotos zijn. Maar passend bij de titels").
 *
 * Twee bronnen, en de bezoeker ziet altijd welke:
 * - `werk`: een echte foto uit een eigen project. Het label noemt het
 *   project ("Eigen werk · Vijverrenovatie"). Nooit een AI-visualisatie
 *   (de F03-reeks): die toont geen uitgevoerd werk.
 * - `stock`: een stockfoto (Pexels), met `credit` en `url` naar de
 *   fotopagina. Het label zegt "Stockfoto". Stockbestanden staan in
 *   `public/diensten/` en nooit bij een project — diensten-beeld.spec.ts
 *   bewaakt dat.
 *
 * `focus` is de object-position voor de 16:10-uitsnede van de kaart,
 * wanneer het midden het onderwerp slecht snijdt.
 */
export type DienstBeeld = {
  src: string
  width?: number
  height?: number
  alt: L
  bron: "werk" | "stock"
  project?: "vijver" | "terras"
  credit?: string
  url?: string
  focus?: string
}

/** Een eigen projectfoto als dienstbeeld: pad en maten uit de projectdata. */
function werk(
  foto: Foto | undefined,
  project: NonNullable<DienstBeeld["project"]>,
  en: string,
  focus?: string
): DienstBeeld | undefined {
  if (!foto || foto.label) return undefined // een gelabeld beeld (AI-visualisatie) is geen werk
  return { src: foto.src, width: foto.width, height: foto.height, alt: { nl: foto.alt, en }, bron: "werk", project, focus }
}

const vijverFoto = (id: FotoId, n = 0) => fotosVoor(id)[n]

/**
 * The three ways in.
 *
 * Named rather than categorised: "Ontwerp en aanleg" describes the
 * studio's output, "Een plan dat klopt" describes what the visitor
 * walks away with. The names are Dutch in both languages' data because
 * they are the product, like Veldlab and Kleine letters elsewhere — the
 * English label translates the promise, not the name.
 */
export type ServiceKind = "ontwerp" | "aanleg" | "onderhoud"

/**
 * What `kind` held before. Read, never written: `design`/`seasonal` from
 * the first split, `advies` from the three levels of Aug–Sep 2026.
 */
type LegacyKind = "design" | "seasonal" | "advies"

/**
 * De onderhoudsdiensten die vóór 28 sep 2026 als `aanleg` zijn
 * opgeslagen. Toen werd "Handen in de grond" gesplitst in Aanleg en
 * Onderhoud (eigenaar: "Ontwerp/Aanleg/Onderhoud", zoals de huisstijl en
 * de iconen). Een gepubliceerd document in de editor kan deze vier nog
 * met `aanleg` dragen; zonder deze lijst zouden ze op /services onder
 * Aanleg blijven staan tot iemand ze opnieuw opslaat.
 */
const ONDERHOUD_VOOR_DE_SPLITSING = new Set([
  "leaf-net",
  "pond-autumn-service",
  "winterising",
  "maintenance-subscription",
])

/**
 * Which level a service sits at, legacy values and all.
 *
 * A service that arrives from `/editor` without a level lands in
 * `ontwerp`: a new bespoke offering is far more likely to be a plan than
 * a subscription, and the first of three is the least wrong place to be
 * wrong. `advies` (a second pair of eyes) is part of Ontwerp now: you buy
 * a judgement, and a judgement is where every plan starts.
 */
export function levelOf(service: Pick<Service, "kind"> & { slug?: string }): ServiceKind {
  switch (service.kind) {
    case "ontwerp":
    case "onderhoud":
      return service.kind
    case "aanleg":
      return service.slug && ONDERHOUD_VOOR_DE_SPLITSING.has(service.slug) ? "onderhoud" : "aanleg"
    case "seasonal":
      return "onderhoud"
    default:
      return "ontwerp"
  }
}

export type Service = {
  // Editor-uploaded card photograph (Blob URL); falls back to the
  // curated placeholder mapping in services-overview.
  image?: string
  /**
   * De gekozen dienstfoto, eigen werk of stock (zie DienstBeeld). Wint
   * van `image`. Staat in de code, niet in content/site-content.json —
   * lees hem via `beeldVan()`, die op slug terugvalt op SERVICES.
   */
  beeld?: DienstBeeld
  slug: string
  index: string
  title: L
  summary: L
  includes: L[]
  /**
   * Four to six words, for the mega menu. `summary` is a full sentence and
   * reads as truncated prose in a narrow column; a menu needs a label, not
   * an abstract. Same reason GitHub's own menu carries "Write better code
   * with AI" rather than the product paragraph.
   */
  tagline?: L
  /**
   * "What you do NOT get." The most useful block on a priced page: it shows
   * where the craft judgement sits, and it stops a fixed price from being
   * read as an unlimited one. Optional — a bespoke design has a scope
   * conversation instead.
   */
  excludes?: L[]
  /**
   * Which of the three entry levels this service belongs to.
   *
   * The split used to be `design` / `seasonal` — bespoke versus
   * standardised — which is how the STUDIO thinks about its work. From
   * Aug 2026 it was advies / ontwerp / aanleg ("how far in do I want
   * you"). Since 28 Sep 2026 it is Ontwerp / Aanleg / Onderhoud, the
   * three of the house style and its icons (Editie 02): advice on site
   * and the pond survey are the first step of Ontwerp, and the seasonal
   * work and the subscription have their own level instead of hiding
   * inside Aanleg.
   *
   * The FIELD NAME stays `kind` on purpose. Services edited in `/editor`
   * are stored with this key, and renaming it would strand them; the
   * legacy values are mapped on read instead (see `levelOf`).
   */
  kind?: ServiceKind | LegacyKind
}

export const SERVICES: Service[] = [
  {
    slug: "garden-design",
    kind: "ontwerp",
    index: "01",
    title: {
      en: "Garden design",
      nl: "Tuinontwerp",
    },
    summary: {
      en: "A design for your whole garden. I look at the soil, the water, the light and at how you use the garden, and turn that into one plan that can grow along over the years.",
      nl: "Een ontwerp voor je hele tuin. Ik kijk naar de bodem, het water, het licht en naar hoe jij de tuin gebruikt, en maak daar één plan van dat met de jaren mee kan groeien.",
    },
    tagline: {
      en: "The whole garden, thought through",
      nl: "De hele tuin, doordacht",
    },
    includes: [
      { en: "Looking at how your garden works now", nl: "Kijken hoe je tuin nu werkt" },
      { en: "A first sketch", nl: "Een eerste schets" },
      { en: "What goes where", nl: "Waar wat komt" },
      { en: "Which plants, and why", nl: "Welke planten, en waarom" },
      { en: "Materials that suit the place", nl: "Materialen die bij de plek passen" },
      { en: "Where the rainwater goes", nl: "Waar het regenwater heen gaat" },
      { en: "Room for birds, insects and other life", nl: "Plek voor vogels, insecten en ander leven" },
      { en: "A plan in steps, so not everything has to happen at once", nl: "Een plan in stappen, zodat niet alles tegelijk hoeft" },
    ],
    excludes: [
      {
        en: "Endless rounds of changes. One sketch round and one revision round are included; after that I work by the hour, and I say so up front.",
        nl: "Onbeperkt blijven bijschaven. Eén schetsronde en één revisieronde zitten erbij; daarna werk ik op uurbasis, en dat zeg ik vooraf.",
      },
      {
        en: "A photoreal render. It costs ten extra hours and sells no better than a good hand drawing with a clear planting plan. You are buying the thinking, not the draughtsmanship.",
        nl: "Een fotorealistische render. Die kost tien extra uur en verkoopt niet beter dan een goede handschets met een helder plantplan. Je koopt het denkwerk, niet de tekenvaardigheid.",
      },
      {
        en: "A design without a budget. Without one, I would draw something that will probably never be built.",
        nl: "Een ontwerp zonder budget. Zonder budget teken ik iets wat waarschijnlijk nooit gebouwd wordt.",
      },
    ],
  },
  {
    slug: "water-systems",
    beeld: werk(
      vijverFoto("F10"),
      "vijver",
      "The waterfall runs over natural stone into the pond, with a red-flowering canna in front and the pipes with a ball valve behind."
    ),
    kind: "ontwerp",
    index: "02",
    title: {
      en: "Ponds and water",
      nl: "Vijvers en water",
    },
    summary: {
      en: "Ponds, streams, waterfalls and wet zones. I look at how water moves through your garden, how it stays clean and how the rainwater gets a place.",
      nl: "Vijvers, beken, watervallen en natte zones. Ik kijk hoe het water door je tuin loopt, hoe het schoon blijft en hoe het regenwater een plek krijgt.",
    },
    tagline: {
      en: "Water that finds its way",
      nl: "Water dat zijn weg vindt",
    },
    includes: [
      { en: "Redesigning an existing pond", nl: "Een bestaande vijver opnieuw ontwerpen" },
      { en: "Water kept clean by plants and soil", nl: "Water dat met planten en bodem schoon blijft" },
      { en: "Biological filters", nl: "Biologische filters" },
      { en: "How the water circulates", nl: "Hoe het water rondgaat" },
      { en: "Streams and waterfalls", nl: "Beken en watervallen" },
      { en: "Plants for the wet edges", nl: "Planten voor de natte randen" },
      { en: "A safe edge for animals that come to drink", nl: "Een veilige rand voor dieren die komen drinken" },
      { en: "Rainwater that stays in the garden", nl: "Regenwater dat in de tuin blijft" },
      { en: "Finding out why a pond isn’t working", nl: "Uitzoeken waarom een vijver niet goed loopt" },
    ],
  },
  {
    slug: "planting-habitat",
    kind: "ontwerp",
    index: "03",
    title: {
      en: "Planting",
      nl: "Beplanting",
    },
    summary: {
      en: "Planting in layers, from ground cover to tree. Plants that suit the place and give food and shelter to bees, birds and other life.",
      nl: "Planten in lagen, van bodembedekker tot boom. Planten die passen bij de plek en voedsel en beschutting geven aan bijen, vogels en ander leven.",
    },
    tagline: {
      en: "Planting that feeds something",
      nl: "Beplanting die iets voedt",
    },
    includes: [
      { en: "A planting plan for each spot", nl: "Een beplantingsplan per plek" },
      {
        en: "Native plants, and plants that can handle drought and heat",
        nl: "Inheemse planten, en planten die droogte en hitte aankunnen",
      },
      { en: "Flowers for bees and butterflies", nl: "Bloei voor bijen en vlinders" },
      { en: "Room for birds", nl: "Plek voor vogels" },
      { en: "Room for frogs and toads", nl: "Plek voor kikkers en padden" },
      { en: "Planting in layers", nl: "Planten in lagen" },
      { en: "Something to see in every season", nl: "Iets te zien in elk seizoen" },
      {
        en: "Plants that also give something back, like fruit and herbs",
        nl: "Planten die ook iets opleveren, zoals fruit en kruiden",
      },
    ],
  },
  {
    slug: "garden-transformation",
    kind: "ontwerp",
    index: "04",
    title: { en: "Reworking an existing garden", nl: "Bestaande tuin omvormen" },
    summary: {
      en: "You already have a garden, but not much happens in it. I look at what can stay, what can go and how the garden gets more life, step by step.",
      nl: "Je hebt al een tuin, maar er gebeurt weinig in. Ik kijk wat kan blijven, wat weg mag en hoe de tuin stap voor stap meer leven krijgt.",
    },
    tagline: {
      en: "From lawn and paving to a garden that lives",
      nl: "Van gazon en tegels naar een tuin die leeft",
    },
    includes: [
      { en: "Walking through your current garden together", nl: "Samen door je huidige tuin lopen" },
      {
        en: "Paving out where it serves no purpose",
        nl: "Tegels eruit waar ze niets doen",
      },
      { en: "Getting the soil healthy again", nl: "De bodem weer gezond maken" },
      { en: "Holding on to rainwater instead of draining it away", nl: "Regenwater vasthouden in plaats van afvoeren" },
      { en: "More kinds of plants and animals", nl: "Meer soorten planten en dieren" },
      {
        en: "Reusing what is already there",
        nl: "Wat er al ligt opnieuw gebruiken",
      },
      {
        en: "Reworking in steps, at your pace",
        nl: "Omvormen in stappen, in jouw tempo",
      },
    ],
  },
  {
    slug: "consultancy",
    beeld: werk(
      vijverFoto("F08", 1),
      "vijver",
      "Nick crouching among the boulders at the pond edge, laughing, with a black part in his hand and an open box beside him.",
      // Staand beeld: het gezicht in de uitsnede, niet de knieën.
      "50% 8%"
    ),
    kind: "ontwerp",
    index: "05",
    title: { en: "Advice on site", nl: "Advies op locatie" },
    summary: {
      en: "I come and look, listen to what you want and tell you honestly what I would do. You get advice you can carry out yourself, in steps if that suits you better.",
      nl: "Ik kom kijken, luister naar wat je wilt en zeg eerlijk wat ik zou doen. Je krijgt een advies dat je zelf kunt uitvoeren, in stappen als dat beter past.",
    },
    tagline: {
      en: "A second pair of eyes",
      nl: "Een tweede paar ogen",
    },
    includes: [
      { en: "A visit to your garden", nl: "Een bezoek aan je tuin" },
      { en: "Finding out where the problem is", nl: "Uitzoeken waar het probleem zit" },
      { en: "Advice on pond and water", nl: "Advies over vijver en water" },
      { en: "Advice on planting", nl: "Advies over beplanting" },
      {
        en: "A plan to bring more life into it",
        nl: "Een plan om er meer leven in te krijgen",
      },
      { en: "Advice on materials", nl: "Advies over materialen" },
      { en: "What upkeep suits you", nl: "Welk onderhoud bij jou past" },
      { en: "What first, and what later", nl: "Wat eerst, en wat later" },
    ],
  },
  {
    slug: "implementation",
    beeld: werk(
      TERRAS_FOTOS.hoofd,
      "terras",
      "The new terrace of light concrete tiles under the canopy, with the edging along the sand bed.",
      // Staand beeld: de rand van het terras en het raam, niet de lucht.
      "50% 62%"
    ),
    kind: "aanleg",
    index: "06",
    title: { en: "Building your garden", nl: "Tuin aanleggen" },
    summary: {
      en: "I build what we came up with together, with the same attention as in the design. From the soil to the last plant.",
      nl: "Ik leg aan wat we samen bedacht hebben, met dezelfde aandacht als in het ontwerp. Van de grond tot de laatste plant.",
    },
    tagline: {
      en: "Built the way it was drawn",
      nl: "Aangelegd zoals getekend",
    },
    includes: [
      { en: "A schedule you know in advance", nl: "Een planning die je vooraf kent" },
      { en: "Preparing the ground", nl: "De grond klaarmaken" },
      { en: "Building ponds and water", nl: "Vijvers en water aanleggen" },
      { en: "Planting", nl: "Planten" },
      { en: "Places for animals", nl: "Plekken voor dieren" },
      { en: "Laying the materials", nl: "Materialen plaatsen" },
      {
        en: "A natural finish",
        nl: "Een natuurlijke afwerking",
      },
      { en: "Looking back together after handover", nl: "Na de oplevering samen terugkijken" },
    ],
  },

  // ---------------------------------------------------------------------
  // Seasonal work. Standardised, repeat, and priced — the half of the
  // practice that has a date on it rather than a design conversation.
  // ---------------------------------------------------------------------

  {
    slug: "leaf-net",
    kind: "onderhoud",
    index: "07",
    title: { en: "Leaf Netting", nl: "Bladnet plaatsen" },
    summary: {
      en: "A net over the pond before the leaves fall, and off again in December. The one pond job with an absolute deadline.",
      nl: "Een net over de vijver vóór de bladval, en er in december weer af. De enige vijverklus met een absolute deadline.",
    },
    tagline: {
      en: "Before the leaves fall",
      nl: "Vóór de bladval",
    },
    includes: [
      { en: "Measured on arrival", nl: "Opmeten bij aankomst" },
      { en: "Net cut to your pond", nl: "Net op maat gesneden" },
      { en: "Edges pinned every 60–80 cm", nl: "Randen om de 60–80 cm vastgezet" },
      {
        en: "Spans on ponds wider than 4 m",
        nl: "Spanten bij vijvers breder dan 4 m",
      },
      {
        en: "December collection booked on the spot",
        nl: "Ophalen in december meteen ingepland",
      },
      {
        en: "Every year if you like: on in autumn, off in December, same price",
        nl: "Elk jaar als je wilt: in het najaar erop, in december eraf, zelfde prijs",
      },
    ],
    excludes: [
      {
        en: "A net strung tight to the water. If it hangs in the pond it catches nothing and drowns what swims into it.",
        nl: "Een net dat strak op het water ligt. Hangt het in de vijver, dan vangt het niets en verdrinkt wat erin zwemt.",
      },
      {
        en: "A guarantee against every leaf. A net catches what falls from above, not what blows in sideways.",
        nl: "Een garantie tegen elk blad. Een net vangt wat van boven valt, niet wat er zijwaarts in waait.",
      },
    ],
  },

  {
    slug: "pond-autumn-service",
    kind: "onderhoud",
    index: "08",
    title: { en: "Autumn Pond Service", nl: "Najaarsbeurt vijver" },
    summary: {
      en: "Silt removed, dead growth cut back, filter cleaned, water measured before and after. The full reset before winter.",
      nl: "Slib afgezogen, afgestorven groei teruggeknipt, filter gereinigd, water gemeten vóór en na. De volledige reset voor de winter.",
    },
    tagline: {
      en: "The full reset before winter",
      nl: "De volledige reset voor de winter",
    },
    includes: [
      {
        en: "Water measured before anything is touched",
        nl: "Water gemeten vóórdat er iets gebeurt",
      },
      { en: "pH, KH, GH, nitrite, ammonium", nl: "pH, KH, GH, nitriet, ammonium" },
      { en: "Silt drawn from the deepest point", nl: "Slib vanaf het diepste punt" },
      {
        en: "Filter media rinsed in pond water",
        nl: "Filtermedia gespoeld in vijverwater",
      },
      { en: "UV lamp checked, hours logged", nl: "UV-lamp gecontroleerd, uren genoteerd" },
      { en: "Measured again, logged", nl: "Opnieuw gemeten, vastgelegd" },
      {
        en: "A written report with the readings and one piece of advice",
        nl: "Een verslag met de metingen en één advies",
      },
    ],
    excludes: [
      {
        en: "A sterile pond. Remove everything and you throw the biology away, and next year you have more algae than ever. I deliberately take out 60–70% of the sludge.",
        nl: "Een steriele vijver. Zuig je alles weg, dan gooi je de biologie weg, en volgend jaar heb je meer algen dan ooit. Ik haal bewust 60–70% van het slib weg.",
      },
      {
        en: "Filter media rinsed in tap water. Chlorine kills the bacterial culture that does the actual work.",
        nl: "Filtermedia gespoeld in kraanwater. Chloor doodt de bacteriecultuur die het eigenlijke werk doet.",
      },
      {
        en: "Silt down the drain. It goes into the border, where the nutrients belong.",
        nl: "Slib in het riool. Dat gaat de border in, waar de voeding thuishoort.",
      },
    ],
  },

  {
    slug: "winterising",
    kind: "onderhoud",
    index: "09",
    title: { en: "Winterising", nl: "Winterklaar maken" },
    summary: {
      en: "Technology out, ice-free keeper in, the pond set up to get through the cold without a pump running against it.",
      nl: "Techniek eruit, ijsvrijhouder erin, de vijver zo ingericht dat hij de kou doorkomt zonder pomp die ertegenin werkt.",
    },
    tagline: {
      en: "Through the frost, safely",
      nl: "Veilig door de vorst",
    },
    includes: [
      { en: "Pump and filter lifted and stored", nl: "Pomp en filter eruit en opgeslagen" },
      { en: "Pipework drained against frost", nl: "Leidingwerk leeg tegen vorst" },
      { en: "Ice-free keeper placed and tested", nl: "IJsvrijhouder geplaatst en getest" },
      { en: "Final water reading logged", nl: "Laatste watermeting vastgelegd" },
      { en: "Leaf net collected if one was placed", nl: "Bladnet opgehaald indien geplaatst" },
    ],
    excludes: [
      {
        en: "A hole hacked in the ice. The shockwave is what harms the fish; an ice-free keeper is there so nobody ever has to.",
        nl: "Een gat in het ijs hakken. De schokgolf is wat de vissen schaadt; een ijsvrijhouder staat er juist zodat dat nooit hoeft.",
      },
      {
        en: "A pump left running all winter. It drags cold water down to where the fish are sitting it out.",
        nl: "Een pomp die de hele winter doordraait. Die trekt koud water omlaag, precies waar de vissen de winter uitzitten.",
      },
    ],
  },

  {
    slug: "pond-survey",
    // F02-1, niet F02-2: het hele water met net en rand in één blik leest
    // als "eerst goed kijken"; F02-2 is vooral muur en boom.
    beeld: werk(
      vijverFoto("F02", 0),
      "vijver",
      "The existing pond before the renovation, covered with a net, with a natural-stone edge along the brick path.",
      "50% 58%"
    ),
    kind: "ontwerp",
    index: "10",
    title: { en: "Pond Survey", nl: "Vijverdoorlichting" },
    summary: {
      en: "A paid diagnostic visit for a pond that is green, leaking, smelling or empty of life. Measured, not guessed, and written up.",
      nl: "Een betaald diagnosebezoek voor een vijver die groen is, lekt, stinkt of waar niets in leeft. Gemeten, niet geraden, en op papier.",
    },
    tagline: {
      en: "Measured, not guessed",
      nl: "Gemeten, niet geraden",
    },
    includes: [
      {
        en: "Full water panel — pH, KH, GH, nitrite, nitrate, ammonium, phosphate",
        nl: "Volledig waterpanel — pH, KH, GH, nitriet, nitraat, ammonium, fosfaat",
      },
      { en: "Silt depth measured in three places", nl: "Sliblaag op drie plekken gemeten" },
      { en: "Sun hours and planting cover", nl: "Zonuren en plantbezetting" },
      {
        en: "Pump capacity against pond volume",
        nl: "Pompcapaciteit tegenover vijverinhoud",
      },
      {
        en: "Surroundings — trees, lawn feed, run-off from paving",
        nl: "Omgeving — bomen, gazonbemesting, afspoeling van verharding",
      },
      {
        en: "A written report: what I saw, the pattern, why it happens, what to do",
        nl: "Een verslag: wat ik zag, het patroon, waarom het gebeurt, wat je doet",
      },
      {
        en: "Three routes costed — do it yourself, partly, or fully",
        nl: "Drie scenario's uitgewerkt — zelf doen, gedeeltelijk, volledig",
      },
    ],
    excludes: [
      {
        en: "Test strips. Too inaccurate to base a plan on, and it stays guesswork at the edge of your pond. I use drop tests.",
        nl: "Teststrips. Te onnauwkeurig om een plan op te baseren, en het blijft gokken aan je vijverrand. Ik gebruik druppeltests.",
      },
      {
        en: "A bottle of algae treatment. Algae is not the illness — it is the symptom of too much feeding.",
        nl: "Een fles algenmiddel. Alg is niet de ziekte — het is het symptoom van te veel voeding.",
      },
    ],
  },

  {
    slug: "maintenance-subscription",
    kind: "onderhoud",
    index: "11",
    title: { en: "Stewardship", nl: "Onderhoudsabonnement" },
    summary: {
      en: "A pond is not an appliance you install and forget. It changes every year, and a pond nobody looks after for a long time gets out of balance.",
      nl: "Een vijver is geen apparaat dat je installeert en vergeet. Hij verandert elk jaar, en een vijver waar lang niemand naar omkijkt, raakt uit balans.",
    },
    tagline: {
      en: "Four visits, one system",
      nl: "Vier bezoeken, één systeem",
    },
    includes: [
      { en: "Scheduled visits through the year", nl: "Ingeplande bezoeken door het jaar" },
      { en: "Technology in and out per season", nl: "Techniek in- en uitbouwen per seizoen" },
      {
        en: "Water measured and logged every visit",
        nl: "Water gemeten en vastgelegd bij elk bezoek",
      },
      {
        en: "A seasonal report with readings and a trend line",
        nl: "Een seizoensverslag met metingen en een trendlijn",
      },
      {
        en: "Questions answered within two working days",
        nl: "Vragen tussendoor beantwoord binnen twee werkdagen",
      },
    ],
    excludes: [
      {
        en: "Unlimited call-out. Priority on a fault means priority in the schedule, not a free repair.",
        nl: "Onbeperkt uitrukken. Voorrang bij een storing betekent voorrang bij het inplannen, geen gratis reparatie.",
      },
      {
        en: "A fixed price forever. The contract is indexed once a year, on 1 January, to the CBS price index.",
        nl: "Een prijs die eeuwig vaststaat. Het contract wordt jaarlijks per 1 januari geïndexeerd volgens de CBS-prijsindex.",
      },
    ],
  },
]

/**
 * De dienstfoto van een dienst, waar hij ook vandaan komt.
 *
 * De pagina's renderen de diensten uit content/site-content.json (of de
 * gepubliceerde versie van de editor), niet uit SERVICES — en daar staat
 * `beeld` niet in. Dus: een `beeld` op de dienst zelf wint, anders dat
 * van dezelfde slug in SERVICES. Zo hoeft de foto maar op één plek te
 * staan en overleeft hij een publicatie uit /editor.
 */
export function beeldVan(s: { slug: string; beeld?: DienstBeeld }): DienstBeeld | undefined {
  return s.beeld ?? SERVICES.find((x) => x.slug === s.slug)?.beeld
}

const PROJECTNAAM: Record<NonNullable<DienstBeeld["project"]>, L> = {
  vijver: { nl: "Vijverrenovatie", en: "Pond renovation" },
  terras: { nl: "Terras", en: "Terrace" },
}

/**
 * Het label óp een dienstbeeld: de bezoeker ziet altijd wat hij bekijkt.
 * - stock → "Stockfoto";
 * - eigen werk → "Eigen werk · <project>";
 * - geen dienstbeeld en geen editorfoto → de plaatshouder, "Conceptbeeld";
 * - alleen een editorfoto (`image`) → geen label, zoals altijd.
 */
export function beeldLabel(s: { slug: string; image?: string; beeld?: DienstBeeld }): L | null {
  const b = beeldVan(s)
  if (b?.bron === "stock") return { nl: "Stockfoto", en: "Stock photo" }
  if (b?.bron === "werk") {
    const p = b.project ? PROJECTNAAM[b.project] : null
    return p
      ? { nl: `Eigen werk · ${p.nl}`, en: `Own work · ${p.en}` }
      : { nl: "Eigen werk", en: "Own work" }
  }
  return s.image ? null : { nl: "Conceptbeeld", en: "Concept image" }
}

/**
 * How the three ways in are introduced, in one place.
 *
 * The /services page, the header's mega menu, the tablet card, the phone
 * sheet and the intake form all name and describe these groups. Written
 * more than once they drift, and the sentence is the whole point: it is
 * what tells a first-time visitor which of the three they are.
 */
export type ServiceGroup = {
  kind: ServiceKind
  label: L
  /** One sentence. Longer than that and nobody reads it in a menu. */
  intro: L
}

/**
 * Three levels, in the order a garden goes through them: Ontwerp, Aanleg,
 * Onderhoud — the same three as the house style's icons (Editie 02; owner,
 * 28 Sep 2026). Advice on site and the pond survey open Ontwerp, so
 * someone who only wants a judgement still meets that option first.
 */
export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    kind: "ontwerp",
    label: { en: "A plan that holds up", nl: "Een plan dat klopt" },
    intro: {
      // De tweede zin staat letterlijk als bron in de checklist vooraf
      // (checklist-lijst.ts, "Diensten · niveau Ontwerp").
      en: "From a second look to a whole plan. Sometimes you don’t need a design, just someone who looks along with you. I come round and tell you honestly what I would do. Every design gets its own quote: you’re paying for the thinking.",
      nl: "Van meekijken tot een heel plan. Soms heb je geen ontwerp nodig, maar iemand die meekijkt. Ik kom langs en zeg eerlijk wat ik zou doen. Elk ontwerp krijgt een eigen offerte: je betaalt voor het denkwerk.",
    },
  },
  {
    kind: "aanleg",
    label: { en: "Hands in the soil", nl: "Handen in de grond" },
    intro: {
      en: "The plan becomes a garden. I build what was drawn, with a fixed date and price wherever possible.",
      nl: "Het plan wordt een tuin. Ik leg aan wat getekend is, waar het kan met een vaste datum en een vaste prijs.",
    },
  },
  {
    kind: "onderhoud",
    label: { en: "All year round", nl: "Het hele jaar door" },
    intro: {
      en: "A pond or garden is never finished. With a little attention each season it stays healthy, with a fixed date and price wherever possible.",
      nl: "Een vijver of tuin is nooit af. Met een beetje aandacht per seizoen blijft hij gezond, waar het kan met een vaste datum en een vaste prijs.",
    },
  },
]

/**
 * A level's services out of the *merged* content list rather than a
 * static array, so an owner edit in `/editor` shows up everywhere the
 * level is rendered.
 *
 * Reads through `levelOf`, which is what keeps services stored under the
 * old `design`/`seasonal` keys from disappearing out of every menu at
 * once.
 */
export function servicesInGroup(
  services: Service[],
  kind: ServiceKind
): Service[] {
  return services.filter((s) => levelOf(s) === kind)
}

/**
 * De laagste vaste "vanaf"-prijs van een niveau, of `null` ("op maat"):
 * geen maandbedragen, want "vanaf € 25" voor een abonnement leest als een
 * losse klus. Eén bron voor de home-diensten en de linkpagina, zodat ze
 * nooit een ander bedrag noemen.
 *
 * Ontwerp is altijd "op maat" (eigenaar, 23 sep 2026: een ontwerp is
 * altijd een offerte). Sinds 28 sep 2026 staat de vijverdoorlichting, met
 * een vaste prijs, in dat niveau; "Ontwerp · vanaf € 175" zou lezen als een
 * ontwerp voor € 175. Die prijs staat op de kaart van de dienst zelf.
 */
export function vanafPrijs(services: Service[], kind: ServiceKind): number | null {
  if (kind === "ontwerp") return null
  const prijzen = servicesInGroup(services, kind)
    .map((s) => priceHint(s.slug))
    .filter((p): p is NonNullable<typeof p> => !!p && !p.monthly)
  return prijzen.length ? Math.min(...prijzen.map((p) => p.from)) : null
}

/**
 * The level a service belongs to, as the group itself.
 *
 * For the pages that want a level's *copy* rather than its members — the
 * eyebrow over a service's own hero, say. It exists because the three
 * levels replaced a two-way `design` / `seasonal` split that several
 * pages read directly off `kind`, and every one of those reads silently
 * became `false` the day the values were renamed: the homepage stopped
 * filtering, the season board lost two services, and every service page
 * began calling itself "Ontwerp". Nothing crashed. Going through
 * `levelOf` is what makes that impossible to repeat.
 */
export function groupOf(service: Pick<Service, "kind"> & { slug?: string }): ServiceGroup {
  const kind = levelOf(service)
  const found = SERVICE_GROUPS.find((g) => g.kind === kind)
  // Unreachable while SERVICE_GROUPS covers every ServiceKind — which is
  // the type system's job, and this is the runtime's receipt for it.
  if (!found) throw new Error(`No service group: ${kind}`)
  return found
}
