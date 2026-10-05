import type { Project } from "@/lib/data/projects"
import type { L } from "@/lib/i18n"

// Het eerste echte project van GRØNN Studio: een vijverrenovatie.
//
// Bron: de overdracht van Nick Peters (22 sep 2026), "BEGIN PUBLIEKE
// PROJECTTEKST" tot "EINDE". De tekst staat hier woordelijk; wat niet in
// die tekst staat, staat hier niet. Vaste afspraken uit die overdracht:
//
// - status "in afronding", verdere aanplant voorjaar 2027 — alleen Nick
//   actualiseert dat;
// - waterinhoud, afmetingen en uren blijven "circa";
// - 11 manden / 44 planten / 7 soorten = het OORSPRONKELIJKE plan, geen
//   telling;
// - 7,5 bar = drukvastheid van de buis, geen systeemdruk;
// - geen klantnaam, geen bedragen, geen reparatiegarantie.
//
// De tekst is in het Nederlands aangeleverd. De Engelse versie (5 okt
// 2026, "ik wil de hele website twee talig") is een vertaling die Nick
// nog moet nalezen; de Nederlandse tekst blijft de bron.

export const VIJVER_SLUG = "vijverrenovatie-twee-vijvers-waterval-beekloop"

/** Redactionele foto-ID's uit het fotoplan. Geen bestandsnamen. */
export type FotoId =
  | "F01"
  | "F02"
  | "F03"
  | "F04"
  | "F05"
  | "F06"
  | "F07"
  | "F08"
  | "F09"
  | "F10"
  | "F11"

export type Foto = {
  /** Echt pad onder /public, of een Blob-URL. */
  src: string
  width: number
  height: number
  /** Geschreven NA het bekijken van de foto: wat zichtbaar is. */
  alt: string
  /** Alleen als de foto het draagt. */
  bijschrift?: string
  /** "eindresultaat" alleen als foto en status dat rechtvaardigen. */
  fase?: "bestaande situatie" | "uitvoering" | "proces" | "eindresultaat"
  /**
   * Een label óp het beeld, voor wat geen foto van het werk is (bijv.
   * "AI-visualisatie"). Zo gaat een visualisatie nooit door voor bewijs.
   */
  label?: string
  /** Engelse versie van alt, bijschrift en label (de Nederlandse velden blijven de bron). */
  en?: { alt: string; bijschrift?: string; label?: string }
}

/**
 * De foto's. Aangeleverd door Nick op 24 sep 2026 (Drive, map
 * "2vijvers1systeen"), met toestemming van de klant voor publicatie. De
 * webversies in /public/projecten/vijverrenovatie zijn verkleind en
 * ZONDER metadata opgeslagen: geen GPS, geen camera-info
 * (vijver-beeld.spec.ts bewaakt dat). Alt-teksten zijn geschreven na het
 * bekijken van elke foto. F06 (skimmer) heeft nog geen foto; een leeg
 * vak rendert NIETS. Aanvulling uit de Drive-map "content" (Nick, 24 sep
 * 2026: "Ja, zet ze erop"): F08-2, F11 en V02. V02 is ingekort tot
 * vóórdat er een kind in beeld komt. AI-visualisaties (F03-2, F03-3) staan alleen bij
 * het denkwerk, altijd met `label`, nooit met een fase: ze tonen geen
 * uitgevoerd werk.
 */
export const FOTOS: Partial<Record<FotoId, Foto | Foto[]>> = {
  F01: { src: "/projecten/vijverrenovatie/F01.jpg", width: 2000, height: 1500, alt: "Overzicht van de tuin tijdens de afronding: een klinkerpad, een treurwilg, ronde stapstenen in de vijver en borders met keien en jonge beplanting.", fase: "uitvoering", en: { alt: "Overview of the garden during finishing: a brick path, a weeping willow, round stepping stones in the pond and borders with boulders and young planting." } },
  F02: [
    { src: "/projecten/vijverrenovatie/F02-1.jpg", width: 1000, height: 1778, alt: "De bestaande vijver vóór de renovatie, afgedekt met een net, met een rand van natuursteen langs het klinkerpad.", fase: "bestaande situatie", en: { alt: "The existing pond before the renovation, covered with a net, with a natural stone edge along the brick path." } },
    { src: "/projecten/vijverrenovatie/F02-2.jpg", width: 1000, height: 1778, alt: "De oude situatie: een vijver tegen een gemetselde muur onder een boom, met keien en beplanting langs het klinkerpad.", fase: "bestaande situatie", en: { alt: "The old situation: a pond against a brick wall under a tree, with boulders and planting along the brick path." } },
  ],
  F03: [
    { src: "/projecten/vijverrenovatie/F03-1.jpg", width: 1000, height: 1333, alt: "Een lange baan vijverfolie uitgerold over het gazon om hem op maat te meten.", fase: "proces", en: { alt: "A long strip of pond liner rolled out over the lawn to measure it to size." } },
    { src: "/projecten/vijverrenovatie/F03-2.jpg", width: 1400, height: 1050, alt: "AI-visualisatie van het beoogde eindbeeld: twee vijvers met een waterval, stapstenen en beplanting in avondlicht. Geen foto.", bijschrift: "Visualisatie vooraf, geen foto van het resultaat.", label: "AI-visualisatie", en: { alt: "AI visualisation of the intended result: two ponds with a waterfall, stepping stones and planting in evening light. Not a photo.", bijschrift: "Visualisation made beforehand, not a photo of the result.", label: "AI visualisation" } },
    { src: "/projecten/vijverrenovatie/F03-3.jpg", width: 896, height: 1195, alt: "AI-visualisatie van de vijver met waterlelies en lissen tegen een gemetselde muur, omringd door grind, keien en beplanting. Geen foto.", bijschrift: "Visualisatie, geen foto van het resultaat.", label: "AI-visualisatie", en: { alt: "AI visualisation of the pond with water lilies and irises against a brick wall, surrounded by gravel, boulders and planting. Not a photo.", bijschrift: "Visualisation, not a photo of the result.", label: "AI visualisation" } },
  ],
  F04: [
    { src: "/projecten/vijverrenovatie/F04-1.jpg", width: 1000, height: 1333, alt: "Een gegraven sleuf langs de haag met twee grijze pvc-leidingen, op weg naar het filter naast de vijver.", fase: "uitvoering", en: { alt: "A dug trench along the hedge with two grey PVC pipes, on their way to the filter next to the pond." } },
    { src: "/projecten/vijverrenovatie/F04-2.jpg", width: 1000, height: 1333, alt: "Grijze drukvaste pvc-leidingen met twee blauwe kogelkranen tussen de keien bij de waterval.", fase: "uitvoering", en: { alt: "Grey pressure-rated PVC pipes with two blue ball valves between the boulders by the waterfall." } },
  ],
  F05: { src: "/projecten/vijverrenovatie/F05.jpg", width: 1200, height: 1600, alt: "Een zwarte filterbak met drie kamers, rechtop gezet naast de haag tijdens de werkzaamheden.", fase: "uitvoering", en: { alt: "A black three-chamber filter box, stood upright next to the hedge during the works." } },
  F07: [
    { src: "/projecten/vijverrenovatie/F07-1.jpg", width: 1400, height: 1050, alt: "De beschadigde filterbak van dichtbij, met een lijmpistool voor de reparatie en losse pvc-buizen eromheen.", fase: "proces", en: { alt: "The damaged filter box up close, with a glue gun for the repair and loose PVC pipes around it." } },
    { src: "/projecten/vijverrenovatie/F07-2.jpg", width: 1000, height: 1333, alt: "Een hand vol slib uit de filterbak, boven het troebele water in de kamer.", fase: "proces", en: { alt: "A handful of sludge from the filter box, above the murky water in the chamber." } },
  ],
  F08: [
    { src: "/projecten/vijverrenovatie/F08-1.jpg", width: 1000, height: 1333, alt: "Keien en natuursteen op de vijverfolie aan de rand bij het terras, waar het water overgaat in de tuin.", fase: "uitvoering", en: { alt: "Boulders and natural stone on the pond liner at the edge by the patio, where the water meets the garden." } },
    { src: "/projecten/vijverrenovatie/F08-2.jpg", width: 1000, height: 1333, alt: "Nick gehurkt tussen de keien aan de vijverrand, lachend, met een zwart onderdeel in de hand en een geopende doos naast zich.", bijschrift: "Nick aan het werk, september.", fase: "uitvoering", en: { alt: "Nick crouching between the boulders at the pond edge, laughing, with a black part in his hand and an opened box beside him.", bijschrift: "Nick at work, September." } },
  ],
  F09: [
    { src: "/projecten/vijverrenovatie/F09-1.jpg", width: 1000, height: 1333, alt: "Een hand zet een jong vijverplantje in een plantmand met grind, met het plantlabel ernaast.", fase: "uitvoering", en: { alt: "A hand places a young pond plant in a planting basket with gravel, with the plant label next to it." } },
    { src: "/projecten/vijverrenovatie/F09-2.jpg", width: 1000, height: 1333, alt: "Nick Peters lachend tussen de oeverplanten, aan het werk in de vijver.", bijschrift: "Nick aan het werk.", fase: "uitvoering", en: { alt: "Nick Peters laughing among the marginal plants, at work in the pond.", bijschrift: "Nick at work." } },
  ],
  F11: { src: "/projecten/vijverrenovatie/F11.jpg", width: 1000, height: 1333, alt: "Nick zit op de keien bij de beekloop in aanbouw, met vijverfolie, grind en een zwarte slang om hem heen.", bijschrift: "De beekloop in aanbouw, juli.", fase: "uitvoering", en: { alt: "Nick sits on the boulders by the stream under construction, with pond liner, gravel and a black hose around him.", bijschrift: "The stream under construction, July." } },
  F10: { src: "/projecten/vijverrenovatie/F10.jpg", width: 2000, height: 1500, alt: "De waterval stroomt over natuursteen de vijver in, met een rood bloeiende canna ervoor en de leidingen met een kogelkraan erachter.", fase: "uitvoering", en: { alt: "The waterfall flows over natural stone into the pond, with a red-flowering canna in front and the pipes with a ball valve behind it." } },
}

export type VideoId = "V01" | "V02"

export type Video = {
  src: string
  poster: string
  width: number
  height: number
  /** Wat er te zien is, voor schermlezers (aria-label). */
  beschrijving: L
  bijschrift?: L
}

/** Korte clips zonder geluid, omgezet naar H.264 zonder metadata. */
export const VIDEOS: Record<VideoId, Video> = {
  V01: {
    src: "/projecten/vijverrenovatie/V01.mp4",
    poster: "/projecten/vijverrenovatie/V01-poster.jpg",
    width: 720,
    height: 1280,
    beschrijving: {
      nl: "Een telefoonstatiefje op een bemoste kei in de tuin in aanbouw, met zand en leidingen op de achtergrond.",
      en: "A small phone tripod on a mossy boulder in the garden under construction, with sand and pipes in the background.",
    },
    bijschrift: {
      nl: "Het werk vastleggen onderweg, met een Ulanzi-statiefje op een kei.",
      en: "Recording the work along the way, with a Ulanzi tripod on a boulder.",
    },
  },
  V02: {
    src: "/projecten/vijverrenovatie/V02.mp4",
    poster: "/projecten/vijverrenovatie/V02-poster.jpg",
    width: 720,
    height: 1280,
    beschrijving: {
      nl: "Nick ligt op zijn buik aan de waterkant en zet oeverplanten tussen de stenen, onder een treurwilg.",
      en: "Nick lies on his stomach at the water's edge, setting marginal plants between the stones, under a weeping willow.",
    },
    bijschrift: { nl: "Oeverplanten zetten aan de waterkant.", en: "Setting marginal plants at the water's edge." },
  },
}

export const fotosVoor = (id: FotoId): Foto[] => {
  const f = FOTOS[id]
  return f ? (Array.isArray(f) ? f : [f]) : []
}

/**
 * De Nederlandse velden blijven strings (andere pagina's lezen ze zo);
 * `en` draagt dezelfde velden in het Engels.
 */
export const VIJVER = {
  titel: "Twee vijvers. Eén samenhangend watersysteem.",
  seoTitel: "Vijverrenovatie met waterval en beekloop — GRØNN Studio",
  omschrijving:
    "Twee vijvers, circa 5.000 liter water en 120 uur werk. Ontdek de techniek, het denkwerk en de beplanting achter deze vijverrenovatie van GRØNN Studio.",
  categorie: "Vijverrenovatie",
  auteur: "Nick Peters, GRØNN Studio",
  status: "In afronding",
  kaarttekst:
    "Twee vijvers, een waterval en een beekloop verbonden tot één watersysteem. Een renovatie met aandacht voor techniek, onderhoud en natuurlijke afwerking.",
  contactknop: "Bespreek jouw vijverproject",
  ondertitel:
    "Een vijverrenovatie waarin watertechniek, beplanting en natuurlijke afwerking samenkomen.",
  intro: [
    "Circa 5.000 liter water, twee vijvers, een waterval en een beekloop. Voor GRØNN Studio kwamen ze samen in een eerste vijverrenovatie waarin bijna ieder onderdeel invloed heeft op de rest. Van de route van een ondergrondse leiding tot de plek van een plantmand: achter het uiteindelijke beeld gaat veel uitzoekwerk, afstemming en aandacht schuil.",
    "Inmiddels is ongeveer 120 uur besteed aan de voorbereiding en uitvoering. Het project bevindt zich in de afrondende fase. De basis krijgt zijn definitieve vorm; de beplanting zal het geheel daarna verder laten groeien.",
  ],
  en: {
    titel: "Two ponds. One connected water system.",
    categorie: "Pond renovation",
    status: "Finishing",
    kaarttekst:
      "Two ponds, a waterfall and a stream connected into one water system. A renovation with attention to technology, maintenance and a natural finish.",
    contactknop: "Discuss your pond project",
    ondertitel: "A pond renovation in which water technology, planting and a natural finish come together.",
    intro: [
      "About 5,000 litres of water, two ponds, a waterfall and a stream. For GRØNN Studio they came together in a first pond renovation in which almost every part affects the rest. From the route of an underground pipe to the spot for a planting basket: behind the final picture lies a lot of research, coordination and care.",
      "By now, about 120 hours have gone into the preparation and the work itself. The project is in its final phase. The foundation is taking its definitive shape; after that, the planting will let the whole keep growing.",
    ],
  },
} as const

/** De vier uitgelichte cijfers uit het voorstel voor de pagina-opbouw. */
export const UITGELICHT: { waarde: string; eenheid: L; label: L }[] = [
  { waarde: "2", eenheid: { nl: "", en: "" }, label: { nl: "vijvers, één watersysteem", en: "ponds, one water system" } },
  { waarde: "5.000", eenheid: { nl: "l", en: "l" }, label: { nl: "open water, circa", en: "open water, approx." } },
  { waarde: "120", eenheid: { nl: "uur", en: "hours" }, label: { nl: "werk, circa, incl. denkwerk", en: "of work, approx., incl. thinking time" } },
  { waarde: "50", eenheid: { nl: "mm", en: "mm" }, label: { nl: "druk-pvc leidingwerk", en: "pressure PVC pipework" } },
]

export const CIJFERS: [L, L][] = [
  [{ nl: "Vijvers", en: "Ponds" }, { nl: "2, verbonden binnen één watersysteem", en: "2, connected within one water system" }],
  [{ nl: "Open water", en: "Open water" }, { nl: "Circa 5.000 liter", en: "About 5,000 litres" }],
  [{ nl: "Waterlijn", en: "Waterline" }, { nl: "Circa 12 meter", en: "About 12 metres" }],
  [{ nl: "Beekrand", en: "Stream edge" }, { nl: "Circa 6 meter", en: "About 6 metres" }],
  [{ nl: "Droge grind- en steenzone", en: "Dry gravel and stone zone" }, { nl: "Circa 3 m²", en: "About 3 m²" }],
  [{ nl: "Pvc-leidingwerk", en: "PVC pipework" }, { nl: "50 mm druk-pvc; toegepaste buis gespecificeerd tot 7,5 bar", en: "50 mm pressure PVC; pipe used rated up to 7.5 bar" }],
  [{ nl: "Bochten", en: "Bends" }, { nl: "2 tot maximaal 4 bochten van 90°; overige bochten 45°", en: "2 to at most 4 bends of 90°; other bends 45°" }],
  [{ nl: "Oppervlakteopvang", en: "Surface collection" }, { nl: "1 skimmer", en: "1 skimmer" }],
  [{ nl: "Onderhoudsaansluitingen", en: "Maintenance connections" }, { nl: "Losneembare koppelingen met schroefdraad", en: "Detachable threaded couplings" }],
  [{ nl: "Filter", en: "Filter" }, { nl: "3 kamers, met een bypass", en: "3 chambers, with a bypass" }],
  [{ nl: "Regelbare waterverdeling", en: "Adjustable water distribution" }, { nl: "2 takken: naar vijver A en naar de waterval", en: "2 branches: to pond A and to the waterfall" }],
  [{ nl: "Bestede tijd", en: "Time spent" }, { nl: "Circa 120 uur, inclusief voorbereiding en denkwerk", en: "About 120 hours, including preparation and thinking time" }],
  [{ nl: "Oorspronkelijk beplantingsplan", en: "Original planting plan" }, { nl: "11 manden, 44 planten en 7 soorten", en: "11 baskets, 44 plants and 7 species" }],
  [{ nl: "Projectstatus", en: "Project status" }, { nl: "In afronding; verdere aanplant voorzien voor voorjaar 2027", en: "Finishing; further planting planned for spring 2027" }],
]

/**
 * De fasen voor de FaseBalk (projectkaart, home, kop van de projectpagina).
 * Alleen uit de eigen projecttekst: de status is "In afronding" (VIJVER),
 * en CIJFERS zegt "verdere aanplant voorzien voor voorjaar 2027". Geen
 * percentages, geen data die Nick niet gaf. Verandert de status, dan
 * verschuift alleen `VIJVER_FASE_NU` — en dat doet alleen Nick.
 */
export const VIJVER_FASEN: { label: L; noot?: L }[] = [
  { label: { nl: "Opgave", en: "Brief" } },
  { label: { nl: "Uitvoering", en: "Construction" } },
  { label: { nl: "Afronding", en: "Finishing" } },
  { label: { nl: "Beplanting", en: "Planting" }, noot: { nl: "voorjaar 2027", en: "spring 2027" } },
]
/** Index in VIJVER_FASEN: "In afronding". */
export const VIJVER_FASE_NU = 2

export const CIJFERS_NOOT: L = {
  nl: "Afmetingen, waterinhoud en uren zijn benaderingen. De plantenaantallen beschrijven het oorspronkelijke plan.",
  en: "Dimensions, water volume and hours are approximations. The plant numbers describe the original plan.",
}

export type Hoofdstuk = {
  id: string
  /** Korte naam voor de inhoudsopgave en de homepage-stapel. */
  kort: L
  kop: L
  alineas: L[]
  foto?: FotoId
  video?: VideoId
  /** Waar de waterroute-tekening staat. */
  schema?: boolean
  planttabel?: boolean
}

export const HOOFDSTUKKEN: Hoofdstuk[] = [
  {
    id: "opgave",
    kort: { nl: "De opgave", en: "The brief" },
    kop: { nl: "De opgave: ieder onderdeel op elkaar afstemmen", en: "The brief: making every part work with the others" },
    alineas: [
      {
        nl: "Een vijverrenovatie bestaat uit veel samenhangende keuzes. Waar stroomt het water heen? Hoe komt het terug? Hoe wordt het verdeeld tussen de waterval en de andere vijver? En hoe blijven het filter en de aansluitingen bereikbaar wanneer de randen eenmaal zijn afgewerkt?",
        en: "A pond renovation consists of many interrelated choices. Where does the water flow? How does it come back? How is it divided between the waterfall and the other pond? And how do the filter and the connections stay accessible once the edges have been finished?",
      },
      {
        nl: "Bij dit project vraagt vooral de combinatie van twee vijvers, een waterval en een beekloop om een doordachte inrichting. Ze moeten technisch op elkaar aansluiten en in de tuin als één geheel aanvoelen. Dat betekent voortdurend schakelen tussen leidingen, waterverdeling, beplanting en de zichtbare afwerking.",
        en: "In this project it is above all the combination of two ponds, a waterfall and a stream that calls for a well-thought-out layout. They have to connect technically and feel like one whole in the garden. That means constantly switching between pipes, water distribution, planting and the visible finish.",
      },
      {
        nl: "De bestaande situatie vormt daarbij het vertrekpunt. De reconstructie richt zich op het verbinden en afstemmen van de onderdelen, met aandacht voor de plekken waar techniek overgaat in water, steen en groen.",
        en: "The existing situation is the starting point. The reconstruction focuses on connecting and aligning the parts, with attention to the places where technology gives way to water, stone and green.",
      },
    ],
    foto: "F02",
  },
  {
    id: "denkwerk",
    kort: { nl: "Het denkwerk", en: "The thinking" },
    kop: { nl: "Het onzichtbare werk: meten, tekenen en blijven puzzelen", en: "The invisible work: measuring, drawing and puzzling on" },
    video: "V01",
    alineas: [
      {
        nl: "Een belangrijk deel van het werk gebeurt voordat een leiding wordt aangesloten. Het begint met kijken, meten en de route van het water stap voor stap doordenken.",
        en: "An important part of the work happens before a single pipe is connected. It starts with looking, measuring and thinking through the route of the water step by step.",
      },
      {
        nl: "Waar kan een leiding lopen? Welke bochten en koppelingen zijn nodig? Op welke plek is een afsluiter nog bereikbaar? Hoe passen de aansluitingen op de pomp en het filter? En wat betekent een wijziging op één plek voor de rest van het systeem?",
        en: "Where can a pipe run? Which bends and couplings are needed? Where is a valve still within reach? How do the connections fit the pump and the filter? And what does a change in one place mean for the rest of the system?",
      },
      {
        nl: "Achter de schermen zijn de opstelling en aansluitingen steeds verder uitgewerkt. Daarbij zijn schema’s, materiaalkeuzes en de praktische mogelijkheden in de tuin naast elkaar gelegd. Tijdens de uitvoering vraagt de bestaande situatie soms opnieuw om afwegingen: een aansluiting komt anders uit, er is een extra bocht nodig of een kraan moet op een beter bereikbare plek worden gezet.",
        en: "Behind the scenes, the setup and connections were worked out in more and more detail. Diagrams, material choices and the practical possibilities in the garden were laid side by side. During the work, the existing situation sometimes calls for new decisions: a connection ends up differently, an extra bend is needed, or a valve has to move to a spot that is easier to reach.",
      },
      {
        nl: "Dat is het puzzelwerk dat straks grotendeels uit beeld verdwijnt. Het bepaalt wel hoe het systeem functioneert en hoe prettig eraan gewerkt kan worden wanneer onderhoud nodig is.",
        en: "That is the puzzling that will largely disappear from view. But it determines how the system works and how pleasant it is to work on when maintenance is needed.",
      },
      {
        nl: "De circa 120 bestede uren omvatten daarom zowel het zichtbare werk in de tuin als de voorbereiding, het uitzoeken en het uitdenken van het geheel. Omgerekend is dat ongeveer vijftien werkdagen van acht uur, verspreid over het traject.",
        en: "The roughly 120 hours spent therefore cover both the visible work in the garden and the preparation, the research and the thinking through of the whole. That comes to about fifteen eight-hour working days, spread over the project.",
      },
    ],
    foto: "F03",
  },
  {
    id: "waterroute",
    kort: { nl: "De waterroute", en: "The water route" },
    kop: { nl: "Hoe de twee vijvers samenwerken", en: "How the two ponds work together" },
    foto: "F11",
    alineas: [
      {
        nl: "Voor de technische uitwerking zijn de vijvers aangeduid als vijver A en vijver B. Vijver B is het vertrekpunt van het opgepompte water.",
        en: "For the technical design, the ponds are referred to as pond A and pond B. Pond B is where the pumped water starts.",
      },
      {
        nl: "Vanuit vijver B gaat het water via de pomp naar het driekamerfilter. Na de filtratie wordt het verdeeld over twee takken: één richting vijver A en één richting de waterval. Het water van de waterval loopt via de beekloop terug naar vijver B. Vijver A voert via de afvoer- en overloopverbinding terug naar vijver B.",
        en: "From pond B, the water goes through the pump to the three-chamber filter. After filtration it is divided over two branches: one towards pond A and one towards the waterfall. The water from the waterfall runs back to pond B via the stream. Pond A drains back to pond B via the outlet and overflow connection.",
      },
      {
        nl: "Zo ontstaan twee routes binnen hetzelfde watersysteem. De verdeling is regelbaar, zodat de toevoer naar vijver A en naar de waterval op elkaar kan worden afgestemd.",
        en: "This creates two routes within the same water system. The distribution is adjustable, so the flow to pond A and to the waterfall can be balanced against each other.",
      },
      {
        nl: "Het systeem is daarmee als geheel uitgedacht. De waterval, beekloop, vijvers en filteropstelling hebben ieder een eigen plek in de route van het water.",
        en: "The system has thus been thought through as a whole. The waterfall, stream, ponds and filter setup each have their own place in the route of the water.",
      },
    ],
    schema: true,
  },
  {
    id: "leidingwerk",
    kort: { nl: "Het leidingwerk", en: "The pipework" },
    kop: { nl: "Drukvast pvc en een zorgvuldig gekozen leidingroute", en: "Pressure-rated PVC and a carefully chosen pipe route" },
    alineas: [
      {
        nl: "Voor het vaste leidingwerk is gekozen voor druk-pvc met een diameter van 50 millimeter. De toegepaste buis is gespecificeerd tot een druk van 7,5 bar. Dat getal beschrijft de drukvastheid van de buis; de werkdruk van de vijverinstallatie is hier niet mee vastgesteld.",
        en: "For the fixed pipework, pressure PVC with a diameter of 50 millimetres was chosen. The pipe used is rated up to a pressure of 7.5 bar. That figure describes the pressure rating of the pipe; it does not establish the working pressure of the pond installation.",
      },
      {
        nl: "Bij de leidingroute is bewust aandacht besteed aan de bochten. Het aantal bochten van 90 graden is beperkt gehouden tot twee à maximaal vier. De overige richtingsveranderingen worden met bochten van 45 graden gemaakt. Het doel is om het water zo geleidelijk mogelijk door de leidingen te laten stromen en onnodige weerstand te beperken.",
        en: "The bends in the pipe route were given deliberate attention. The number of 90-degree bends was kept to two, four at most. The other changes of direction are made with 45-degree bends. The aim is to let the water flow through the pipes as smoothly as possible and to limit unnecessary resistance.",
      },
      {
        nl: "Daar gaat veel ruimtelijk puzzelwerk aan vooraf. Een leiding moet passen binnen de bestaande tuin, aansluiten op de apparatuur en voldoende ruimte laten om kranen en koppelingen te bedienen. Iedere bocht heeft daardoor een plaats in het ontwerp.",
        en: "That takes a lot of spatial puzzling. A pipe has to fit within the existing garden, connect to the equipment and leave enough room to operate valves and couplings. Every bend therefore has a place in the design.",
      },
      {
        nl: "Naast de buizen en bochten zijn T-stukken, verloopstukken, koppelingen en afsluiters verwerkt. Een T-stuk maakt een vertakking mogelijk; een verloopstuk verbindt onderdelen met verschillende aansluitmaten. Samen vormen die kleine onderdelen het complete leidingstelsel.",
        en: "Besides the pipes and bends, T-pieces, reducers, couplings and valves were fitted. A T-piece makes a branch possible; a reducer connects parts with different connection sizes. Together, those small parts make up the complete pipe system.",
      },
      {
        nl: "Bij deze renovatie bleken meer van die onderdelen nodig dan vooraf was voorzien. Het is een van de lessen uit het project: een globale route op papier moet op locatie worden vertaald naar alle afzonderlijke aansluitingen.",
        en: "In this renovation, more of those parts turned out to be needed than had been foreseen. It is one of the lessons of the project: a rough route on paper has to be translated on site into every individual connection.",
      },
    ],
    foto: "F04",
  },
  {
    id: "onderhoud",
    kort: { nl: "Onderhoud", en: "Maintenance" },
    kop: { nl: "Losneembare aansluitingen voor onderhoud", en: "Detachable connections for maintenance" },
    alineas: [
      {
        nl: "Bij de technische opstelling zijn koppelingen met schroefdraad gebruikt om onderdelen te kunnen afkoppelen. Zo kan onder meer het filter worden losgenomen voor onderhoud of werkzaamheden aan de opstelling.",
        en: "In the technical setup, threaded couplings were used so that parts can be disconnected. That way the filter, among other things, can be removed for maintenance or for work on the setup.",
      },
      {
        nl: "Die keuze vraagt al tijdens de aanleg om vooruitdenken. Er moet ruimte zijn om een koppeling los te draaien, een kraan te bedienen en een onderdeel daadwerkelijk uit de opstelling te halen.",
        en: "That choice calls for thinking ahead during construction. There has to be room to unscrew a coupling, operate a valve and actually take a part out of the setup.",
      },
      {
        nl: "De bereikbaarheid is daarom meegenomen in het leidingontwerp en de afwerking. Ook wanneer het project klaar is, moet er aan de installatie gewerkt kunnen worden.",
        en: "Accessibility was therefore built into the pipe design and the finish. Even when the project is done, it must be possible to work on the installation.",
      },
    ],
  },
  {
    id: "filter",
    kort: { nl: "Het filter", en: "The filter" },
    kop: { nl: "Drie filterkamers, twee regelbare takken en een bypass", en: "Three filter chambers, two adjustable branches and a bypass" },
    alineas: [
      {
        nl: "De technische opstelling combineert een AquaForte DM-10000 Vario S-pomp met een driekamerfilter. Rond het filter is een bypass opgenomen: een alternatieve route waarmee het water langs het filter kan worden geleid.",
        en: "The technical setup combines an AquaForte DM-10000 Vario S pump with a three-chamber filter. A bypass has been built around the filter: an alternative route that lets the water be led past the filter.",
      },
      {
        nl: "Dat geeft mogelijkheden om de waterroute aan te passen wanneer aan het filter wordt gewerkt. Welke kranen daarbij open of dicht moeten staan, maakt deel uit van het gebruik van de installatie.",
        en: "That makes it possible to adjust the water route when work is being done on the filter. Which valves need to be open or closed for that is part of using the installation.",
      },
      {
        nl: "De afsluiters en regelkranen hebben verschillende taken. Schuifafsluiters bij de onderste filterafvoeren dienen voor het openen en sluiten van die afvoeren. Kogelkranen in de leidingen maken het mogelijk om de waterverdeling over de twee uitgaande takken bij te stellen.",
        en: "The valves have different jobs. Slide valves at the lower filter outlets are for opening and closing those outlets. Ball valves in the pipes make it possible to adjust the water distribution over the two outgoing branches.",
      },
      {
        nl: "Die functies zijn meegenomen in de inrichting. Zo krijgt onderhoud al tijdens de aanleg een plek en kan de waterverdeling na het aansluiten worden afgestemd.",
        en: "Those functions were built into the layout. That way maintenance has its place from the construction stage onwards, and the water distribution can be balanced once everything is connected.",
      },
    ],
    foto: "F05",
  },
  {
    id: "skimmer",
    kort: { nl: "De skimmer", en: "The skimmer" },
    kop: { nl: "Een skimmer voor het wateroppervlak", en: "A skimmer for the water surface" },
    alineas: [
      {
        nl: "Naast de filteropstelling is een skimmer opgenomen voor het opvangen van drijvend vuil, zoals bladeren en ander materiaal aan het wateroppervlak.",
        en: "Alongside the filter setup, a skimmer has been included to collect floating debris, such as leaves and other material on the water surface.",
      },
      {
        nl: "Daarmee krijgt ook het oppervlak van de vijver een plek in het technische plan. De skimmer vormt een extra onderdeel om bij het gebruik en onderhoud van het geheel rekening mee te houden.",
        en: "That gives the surface of the pond a place in the technical plan too. The skimmer is one more part to take into account in the use and maintenance of the whole.",
      },
    ],
    foto: "F06",
  },
  {
    id: "filterherstel",
    kort: { nl: "Filterherstel", en: "Filter repair" },
    kop: { nl: "Een beschadigd filter herstellen: een project binnen het project", en: "Repairing a damaged filter: a project within the project" },
    alineas: [
      {
        nl: "Een van de lastigere onderdelen was het herstellen van het beschadigde filter van polypropyleen, ook wel PP genoemd. Dat bleek in de praktijk geen eenvoudige reparatie.",
        en: "One of the trickier parts was repairing the damaged filter made of polypropylene, also called PP. In practice, that turned out to be no simple repair.",
      },
      {
        nl: "Voor het herstel is tweecomponentenlijm gebruikt. Daarmee was het werk nog niet afgerond: naderhand bleek aanvullende afdichting met RubberSeal nodig. De reparatie vroeg daardoor meer aandacht en uitzoekwerk dan vooraf voorzien.",
        en: "Two-component adhesive was used for the repair. That did not finish the job: afterwards, additional sealing with RubberSeal turned out to be needed. The repair therefore took more attention and research than foreseen.",
      },
      {
        nl: "Dit onderdeel laat goed zien wat renovatiewerk inhoudt. Bestaande materialen en beschadigingen brengen vragen met zich mee die pas tijdens de uitvoering volledig duidelijk worden. Hier moest de aanpak worden bijgesteld om het herstel verder uit te werken.",
        en: "This part shows well what renovation work involves. Existing materials and damage raise questions that only become fully clear during the work. Here the approach had to be adjusted to take the repair further.",
      },
      {
        nl: "Het repareren van het filter is daarmee ook onderdeel van de ervaring die in dit project is opgedaan: zorgvuldig kijken naar het materiaal, beoordelen wat een ingreep oplevert en verder zoeken wanneer de eerste aanpak nog niet voldoende is.",
        en: "Repairing the filter is therefore also part of the experience gained in this project: looking carefully at the material, judging what an intervention achieves, and searching further when the first approach is not yet enough.",
      },
    ],
    foto: "F07",
  },
  {
    id: "afwerking",
    kort: { nl: "Water naar tuin", en: "Water to garden" },
    kop: { nl: "De overgang van water naar tuin", en: "The transition from water to garden" },
    alineas: [
      {
        nl: "Naast het technische werk krijgt de natuurlijke afwerking veel aandacht. Rond circa twaalf meter waterlijn en zes meter beekrand ontmoeten water, steen en planten elkaar.",
        en: "Alongside the technical work, the natural finish gets a lot of attention. Along about twelve metres of waterline and six metres of stream edge, water, stone and plants meet.",
      },
      {
        nl: "Daar bepaalt de afwerking hoe de vijvers in de tuin liggen. De randen moeten aansluiten op de waterval en beekloop, terwijl er ruimte blijft voor beplanting. De droge grind- en steenzone van ongeveer drie vierkante meter maakt eveneens deel uit van die overgang.",
        en: "There, the finish determines how the ponds sit in the garden. The edges have to connect to the waterfall and stream, while leaving room for planting. The dry gravel and stone zone of about three square metres is also part of that transition.",
      },
      {
        nl: "Het aanvullen met teelaarde hoort bij de laatste werkzaamheden rondom het project. Daarna kan de verdere aanplant de aansluiting op de tuin versterken. Het beeld zal dus ook na de technische afronding nog veranderen: planten moeten zich ontwikkelen en hun plek tussen het water en de stenen gaan innemen.",
        en: "Topping up with topsoil is among the last jobs around the project. After that, further planting can strengthen the connection with the garden. So the picture will keep changing after the technical work is finished: plants need to develop and take their place between the water and the stones.",
      },
    ],
    foto: "F08",
  },
  {
    id: "beplanting",
    kort: { nl: "Beplanting", en: "Planting" },
    kop: { nl: "Elf plantmanden en zeven soorten in het oorspronkelijke plan", en: "Eleven planting baskets and seven species in the original plan" },
    alineas: [
      {
        nl: "Voor de waterlijn en beekrand is een beplantingsplan opgesteld met in totaal elf manden, elk met vier planten. Dat komt neer op 44 planten, verdeeld over zeven soorten.",
        en: "For the waterline and stream edge, a planting plan was drawn up with eleven baskets in total, each with four plants. That comes to 44 plants, spread over seven species.",
      },
      { nl: "De verdeling in het oorspronkelijke plan is:", en: "The distribution in the original plan is:" },
    ],
    planttabel: true,
    foto: "F09",
    video: "V02",
  },
  {
    id: "afronding",
    kort: { nl: "De afronding", en: "Finishing" },
    kop: { nl: "De afronding: opruimen, aanvullen en verder laten groeien", en: "Finishing: clearing up, topping up and letting it grow" },
    alineas: [
      {
        nl: "Het project bevindt zich in de laatste fase. Het resterende hout en puin moeten worden afgevoerd en de omliggende delen worden aangevuld met teelaarde. De beschadigde vijverplanten kunnen worden vervangen; de aanvullende aanplant volgt naar verwachting in het voorjaar.",
        en: "The project is in its last phase. The remaining wood and rubble have to be removed and the surrounding areas topped up with topsoil. The damaged pond plants can be replaced; the additional planting is expected to follow in spring.",
      },
      {
        nl: "Bij de afronding hoort ook aandacht voor het gebruik: de bediening van de kranen, de waterverdeling en de bereikbaarheid van de technische onderdelen. Een zorgvuldig aangelegd systeem moet voor de eigenaar ook begrijpelijk zijn.",
        en: "Finishing also means attention to use: operating the valves, the water distribution and the accessibility of the technical parts. A carefully built system must also make sense to its owner.",
      },
      {
        nl: "Het resultaat tot nu toe is een gereconstrueerde samenhang tussen twee vijvers, een waterval, een beekloop en de technische opstelling. De komende aanplant zal die basis verder verbinden met de tuin.",
        en: "The result so far is a reconstructed connection between two ponds, a waterfall, a stream and the technical setup. The coming planting will tie that foundation further into the garden.",
      },
    ],
  },
  {
    id: "eerste-project",
    kort: { nl: "Een eerste project", en: "A first project" },
    kop: { nl: "Een eerste project dat de basis legt voor GRØNN Studio", en: "A first project that lays the foundation for GRØNN Studio" },
    alineas: [
      {
        nl: "Deze vijverrenovatie heeft een bijzondere plek binnen GRØNN Studio. Het is een eerste project waarin ontwerp, techniek, uitvoering en beplanting op deze schaal samenkomen.",
        en: "This pond renovation has a special place within GRØNN Studio. It is a first project in which design, technology, construction and planting come together on this scale.",
      },
      {
        nl: "Het traject heeft veel geleerd over voorbereiding, materiaalgebruik, het herstellen van bestaande onderdelen en de tijd die nodig is om een bestaande situatie zorgvuldig aan te passen. Vooral het vertalen van een plan naar alle afzonderlijke aansluitingen en werkstappen heeft waardevolle ervaring opgeleverd.",
        en: "The project taught a lot about preparation, use of materials, repairing existing parts and the time it takes to adapt an existing situation carefully. Above all, translating a plan into every individual connection and work step has yielded valuable experience.",
      },
    ],
  },
]

/**
 * Begrippen in "Het project in cijfers" (element `Begrip`, eigenaar
 * 25 sep 2026). Daar staan de woorden ZONDER uitleg; in de hoofdstukken
 * staat de uitleg er direct naast, en een kaartje zou die zin alleen
 * herhalen. Daarom geen markering in de lopende tekst (review 25 sep).
 *
 * Regel: de uitleg komt LETTERLIJK uit hoofdstuk `bron` — alleen een
 * hoofdletter of punt aan de randen is aangepast. Legt de tekst een woord
 * niet zelf uit, dan staat het hier niet. `woord` is de vorm in CIJFERS;
 * alleen de eerste vermelding wordt gemarkeerd. begrip.spec.ts bewaakt
 * dat elke uitleg in `bron` staat en nooit naast het gemarkeerde woord.
 *
 * T-stuk, verloopstuk en PP staan er niet meer: die woorden komen op de
 * pagina alleen voor in de zin die ze uitlegt.
 */
export const BEGRIPPEN: { woord: L; term: L; uitleg: L; bron: Hoofdstuk["id"] }[] = [
  {
    // CIJFERS "Pvc-leidingwerk". Bron: "De toegepaste buis is gespecificeerd
    // tot een druk van 7,5 bar. Dat getal beschrijft …"
    woord: { nl: "7,5 bar", en: "7.5 bar" },
    term: { nl: "7,5 bar", en: "7.5 bar" },
    uitleg: {
      nl: "Dat getal beschrijft de drukvastheid van de buis; de werkdruk van de vijverinstallatie is hier niet mee vastgesteld.",
      en: "That figure describes the pressure rating of the pipe; it does not establish the working pressure of the pond installation.",
    },
    bron: "leidingwerk",
  },
  {
    // CIJFERS "Oppervlakteopvang". Bron: "… is een skimmer opgenomen voor
    // het opvangen van drijvend vuil, …"
    woord: { nl: "skimmer", en: "skimmer" },
    term: { nl: "Skimmer", en: "Skimmer" },
    uitleg: {
      nl: "Voor het opvangen van drijvend vuil, zoals bladeren en ander materiaal aan het wateroppervlak.",
      en: "To collect floating debris, such as leaves and other material on the water surface.",
    },
    bron: "skimmer",
  },
  {
    // CIJFERS "Filter". Bron: "Rond het filter is een bypass opgenomen: een
    // alternatieve route …"
    woord: { nl: "bypass", en: "bypass" },
    term: { nl: "Bypass", en: "Bypass" },
    uitleg: {
      nl: "Een alternatieve route waarmee het water langs het filter kan worden geleid.",
      en: "An alternative route that lets the water be led past the filter.",
    },
    bron: "filter",
  },
]

/** Na de planttabel, binnen "beplanting". */
export const NA_PLANTTABEL: L[] = [
  {
    nl: "De plantmanden bevatten naast de planten ook klei en substraat. Het plan maakt onderscheid tussen de waterlijn en de ondiepere beekrand, zodat de beplanting aansluit op de verschillende plekken in het systeem.",
    en: "Besides the plants, the planting baskets also contain clay and substrate. The plan distinguishes between the waterline and the shallower stream edge, so that the planting suits the different places in the system.",
  },
  {
    nl: "Tijdens het project hebben de aanwezige vissen een deel van de vijverplanten beschadigd. Die planten worden vervangen. Het onderstreept dat de inrichting van een vijver ook moet passen bij de dieren die er al leven. De plaatsing en eventuele bescherming van vervangende planten verdienen daarom aandacht.",
    en: "During the project, the fish already living there damaged some of the pond plants. Those plants will be replaced. It underlines that the layout of a pond also has to suit the animals that already live in it. The placement and possible protection of replacement plants therefore deserve attention.",
  },
  {
    nl: "De verdere aanplant rond het project is voorzien voor het voorjaar van 2027. Daarmee krijgt het groen een eigen vervolgstap na de afronding van het technische werk.",
    en: "Further planting around the project is planned for spring 2027. That gives the green its own next step after the technical work is finished.",
  },
]

export const PLANTTABEL = {
  rijen: [
    {
      zone: { nl: "Waterlijn", en: "Waterline" } as L,
      soorten: [
        { nl: "Gele lis", en: "Yellow flag iris" },
        { nl: "zwanenbloem", en: "flowering rush" },
        { nl: "egelskop", en: "bur-reed" },
        { nl: "holpijp", en: "water horsetail" },
      ] as L[],
      manden: 6,
      planten: 24,
    },
    {
      zone: { nl: "Beekrand", en: "Stream edge" } as L,
      soorten: [
        { nl: "Penningkruid", en: "Creeping Jenny" },
        { nl: "beekpunge", en: "brooklime" },
        { nl: "watermunt", en: "water mint" },
      ] as L[],
      manden: 5,
      planten: 20,
    },
  ],
  totaal: { soorten: { nl: "7 soorten", en: "7 species" } as L, manden: 11, planten: 44 },
}

export const CITAAT: { tekst: L; bron: string } = {
  tekst: {
    nl: "Ik heb ontzettend genoten van dit eerste project. Van het uitdenken van de waterstromen tot het moment waarop de onderdelen samenkomen. Het vertrouwen om dit te mogen maken was een belangrijke stap in het opbouwen van GRØNN Studio.",
    en: "I thoroughly enjoyed this first project. From thinking through the water flows to the moment the parts come together. Being trusted to build this was an important step in building GRØNN Studio.",
  },
  bron: "Nick Peters, GRØNN Studio",
}

export const NA_CITAAT: L = {
  nl: "Het uitgangspunt voor volgende projecten is daarmee verder aangescherpt: de werking van het watersysteem, het onderhoud en de inrichting van de tuin vanaf het begin samen bekijken. Met evenveel aandacht voor het zichtbare resultaat als voor de keuzes die achter de schermen nodig zijn.",
  en: "That has sharpened the starting point for future projects: looking at how the water system works, the maintenance and the layout of the garden together from the start. With as much attention for the visible result as for the choices needed behind the scenes.",
}

export const SLOT: { kop: L; alineas: L[]; oproep: L; foto: FotoId } = {
  kop: { nl: "Een vijver die weer past bij de tuin", en: "A pond that fits the garden again" },
  alineas: [
    {
      nl: "Heb je een bestaande vijver die aan renovatie toe is, of wil je onderzoeken hoe een waterval, beekloop en beplanting beter op elkaar kunnen aansluiten?",
      en: "Do you have an existing pond that is due for renovation, or would you like to explore how a waterfall, stream and planting could work better together?",
    },
    {
      nl: "GRØNN Studio bekijkt de bestaande situatie en denkt mee over de techniek, inrichting en uitvoering. Zo begint ieder project met een duidelijk beeld van wat er nodig is om water en tuin samen te laten werken.",
      en: "GRØNN Studio looks at the existing situation and thinks along about the technology, layout and construction. That way every project starts with a clear picture of what it takes to make water and garden work together.",
    },
  ],
  oproep: { nl: "Bespreek jouw vijverproject met GRØNN Studio.", en: "Discuss your pond project with GRØNN Studio." },
  foto: "F10",
}

/**
 * Het project in de vorm die de menu's en de zoekfunctie verwachten
 * (`Project` uit projects.ts). Geen `image`: zolang er geen echte foto is,
 * toont de uitgelichte kaart in het menu er ook geen. `location` blijft
 * leeg — de projecttekst noemt geen plaats, en er wordt er geen bedacht.
 */
export const VIJVER_ALS_PROJECT: Project = {
  slug: VIJVER_SLUG,
  title: { nl: VIJVER.titel, en: VIJVER.en.titel },
  location: "",
  category: "water",
  objective: { nl: VIJVER.kaarttekst, en: VIJVER.en.kaarttekst },
  intervention: { nl: VIJVER.ondertitel, en: VIJVER.en.ondertitel },
  status: { nl: VIJVER.status, en: VIJVER.en.status },
  imageId: 28,
  featured: true,
}
