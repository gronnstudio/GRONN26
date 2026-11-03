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
// De tekst is alleen in het Nederlands aangeleverd. De Engelse route
// toont dezelfde Nederlandse tekst met `lang="nl"` en een regel die dat
// zegt; een vertaling hoort door Nick gelezen te worden voor ze live gaat.

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
  F01: { src: "/projecten/vijverrenovatie/F01.jpg", width: 2000, height: 1500, alt: "Overzicht van de tuin tijdens de afronding: een klinkerpad, een treurwilg, ronde stapstenen in de vijver en borders met keien en jonge beplanting.", fase: "uitvoering" },
  F02: [
    { src: "/projecten/vijverrenovatie/F02-1.jpg", width: 1000, height: 1778, alt: "De bestaande vijver vóór de renovatie, afgedekt met een net, met een rand van natuursteen langs het klinkerpad.", fase: "bestaande situatie" },
    { src: "/projecten/vijverrenovatie/F02-2.jpg", width: 1000, height: 1778, alt: "De oude situatie: een vijver tegen een gemetselde muur onder een boom, met keien en beplanting langs het klinkerpad.", fase: "bestaande situatie" },
  ],
  F03: [
    { src: "/projecten/vijverrenovatie/F03-1.jpg", width: 1000, height: 1333, alt: "Een lange baan vijverfolie uitgerold over het gazon om hem op maat te meten.", fase: "proces" },
    { src: "/projecten/vijverrenovatie/F03-2.jpg", width: 1400, height: 1050, alt: "AI-visualisatie van het beoogde eindbeeld: twee vijvers met een waterval, stapstenen en beplanting in avondlicht. Geen foto.", bijschrift: "Visualisatie vooraf, geen foto van het resultaat.", label: "AI-visualisatie" },
    { src: "/projecten/vijverrenovatie/F03-3.jpg", width: 896, height: 1195, alt: "AI-visualisatie van de vijver met waterlelies en lissen tegen een gemetselde muur, omringd door grind, keien en beplanting. Geen foto.", bijschrift: "Visualisatie, geen foto van het resultaat.", label: "AI-visualisatie" },
  ],
  F04: [
    { src: "/projecten/vijverrenovatie/F04-1.jpg", width: 1000, height: 1333, alt: "Een gegraven sleuf langs de haag met twee grijze pvc-leidingen, op weg naar het filter naast de vijver.", fase: "uitvoering" },
    { src: "/projecten/vijverrenovatie/F04-2.jpg", width: 1000, height: 1333, alt: "Grijze drukvaste pvc-leidingen met twee blauwe kogelkranen tussen de keien bij de waterval.", fase: "uitvoering" },
  ],
  F05: { src: "/projecten/vijverrenovatie/F05.jpg", width: 1200, height: 1600, alt: "Een zwarte filterbak met drie kamers, rechtop gezet naast de haag tijdens de werkzaamheden.", fase: "uitvoering" },
  F07: [
    { src: "/projecten/vijverrenovatie/F07-1.jpg", width: 1400, height: 1050, alt: "De beschadigde filterbak van dichtbij, met een lijmpistool voor de reparatie en losse pvc-buizen eromheen.", fase: "proces" },
    { src: "/projecten/vijverrenovatie/F07-2.jpg", width: 1000, height: 1333, alt: "Een hand vol slib uit de filterbak, boven het troebele water in de kamer.", fase: "proces" },
  ],
  F08: [
    { src: "/projecten/vijverrenovatie/F08-1.jpg", width: 1000, height: 1333, alt: "Keien en natuursteen op de vijverfolie aan de rand bij het terras, waar het water overgaat in de tuin.", fase: "uitvoering" },
    { src: "/projecten/vijverrenovatie/F08-2.jpg", width: 1000, height: 1333, alt: "Nick gehurkt tussen de keien aan de vijverrand, lachend, met een zwart onderdeel in de hand en een geopende doos naast zich.", bijschrift: "Nick aan het werk, september.", fase: "uitvoering" },
  ],
  F09: [
    { src: "/projecten/vijverrenovatie/F09-1.jpg", width: 1000, height: 1333, alt: "Een hand zet een jong vijverplantje in een plantmand met grind, met het plantlabel ernaast.", fase: "uitvoering" },
    { src: "/projecten/vijverrenovatie/F09-2.jpg", width: 1000, height: 1333, alt: "Nick Peters lachend tussen de oeverplanten, aan het werk in de vijver.", bijschrift: "Nick aan het werk.", fase: "uitvoering" },
  ],
  F11: { src: "/projecten/vijverrenovatie/F11.jpg", width: 1000, height: 1333, alt: "Nick zit op de keien bij de beekloop in aanbouw, met vijverfolie, grind en een zwarte slang om hem heen.", bijschrift: "De beekloop in aanbouw, juli.", fase: "uitvoering" },
  F10: { src: "/projecten/vijverrenovatie/F10.jpg", width: 2000, height: 1500, alt: "De waterval stroomt over natuursteen de vijver in, met een rood bloeiende canna ervoor en de leidingen met een kogelkraan erachter.", fase: "uitvoering" },
}

export type VideoId = "V01" | "V02"

export type Video = {
  src: string
  poster: string
  width: number
  height: number
  /** Wat er te zien is, voor schermlezers (aria-label). */
  beschrijving: string
  bijschrift?: string
}

/** Korte clips zonder geluid, omgezet naar H.264 zonder metadata. */
export const VIDEOS: Record<VideoId, Video> = {
  V01: {
    src: "/projecten/vijverrenovatie/V01.mp4",
    poster: "/projecten/vijverrenovatie/V01-poster.jpg",
    width: 720,
    height: 1280,
    beschrijving: "Een telefoonstatiefje op een bemoste kei in de tuin in aanbouw, met zand en leidingen op de achtergrond.",
    bijschrift: "Het werk vastleggen onderweg, met een Ulanzi-statiefje op een kei.",
  },
  V02: {
    src: "/projecten/vijverrenovatie/V02.mp4",
    poster: "/projecten/vijverrenovatie/V02-poster.jpg",
    width: 720,
    height: 1280,
    beschrijving: "Nick ligt op zijn buik aan de waterkant en zet oeverplanten tussen de stenen, onder een treurwilg.",
    bijschrift: "Oeverplanten zetten aan de waterkant.",
  },
}

export const fotosVoor = (id: FotoId): Foto[] => {
  const f = FOTOS[id]
  return f ? (Array.isArray(f) ? f : [f]) : []
}

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
} as const

/** De vier uitgelichte cijfers uit het voorstel voor de pagina-opbouw. */
export const UITGELICHT: { waarde: string; eenheid: string; label: string }[] = [
  { waarde: "2", eenheid: "", label: "vijvers, één watersysteem" },
  { waarde: "5.000", eenheid: "l", label: "open water, circa" },
  { waarde: "120", eenheid: "uur", label: "werk, circa, incl. denkwerk" },
  { waarde: "50", eenheid: "mm", label: "druk-pvc leidingwerk" },
]

export const CIJFERS: [string, string][] = [
  ["Vijvers", "2, verbonden binnen één watersysteem"],
  ["Open water", "Circa 5.000 liter"],
  ["Waterlijn", "Circa 12 meter"],
  ["Beekrand", "Circa 6 meter"],
  ["Droge grind- en steenzone", "Circa 3 m²"],
  ["Pvc-leidingwerk", "50 mm druk-pvc; toegepaste buis gespecificeerd tot 7,5 bar"],
  ["Bochten", "2 tot maximaal 4 bochten van 90°; overige bochten 45°"],
  ["Oppervlakteopvang", "1 skimmer"],
  ["Onderhoudsaansluitingen", "Losneembare koppelingen met schroefdraad"],
  ["Filter", "3 kamers, met een bypass"],
  ["Regelbare waterverdeling", "2 takken: naar vijver A en naar de waterval"],
  ["Bestede tijd", "Circa 120 uur, inclusief voorbereiding en denkwerk"],
  ["Oorspronkelijk beplantingsplan", "11 manden, 44 planten en 7 soorten"],
  ["Projectstatus", "In afronding; verdere aanplant voorzien voor voorjaar 2027"],
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

export const CIJFERS_NOOT =
  "Afmetingen, waterinhoud en uren zijn benaderingen. De plantenaantallen beschrijven het oorspronkelijke plan."

export type Hoofdstuk = {
  id: string
  /** Korte naam voor de inhoudsopgave en de homepage-stapel. */
  kort: string
  kop: string
  alineas: string[]
  foto?: FotoId
  video?: VideoId
  /** Waar de waterroute-tekening staat. */
  schema?: boolean
  planttabel?: boolean
}

export const HOOFDSTUKKEN: Hoofdstuk[] = [
  {
    id: "opgave",
    kort: "De opgave",
    kop: "De opgave: ieder onderdeel op elkaar afstemmen",
    alineas: [
      "Een vijverrenovatie bestaat uit veel samenhangende keuzes. Waar stroomt het water heen? Hoe komt het terug? Hoe wordt het verdeeld tussen de waterval en de andere vijver? En hoe blijven het filter en de aansluitingen bereikbaar wanneer de randen eenmaal zijn afgewerkt?",
      "Bij dit project vraagt vooral de combinatie van twee vijvers, een waterval en een beekloop om een doordachte inrichting. Ze moeten technisch op elkaar aansluiten en in de tuin als één geheel aanvoelen. Dat betekent voortdurend schakelen tussen leidingen, waterverdeling, beplanting en de zichtbare afwerking.",
      "De bestaande situatie vormt daarbij het vertrekpunt. De reconstructie richt zich op het verbinden en afstemmen van de onderdelen, met aandacht voor de plekken waar techniek overgaat in water, steen en groen.",
    ],
    foto: "F02",
  },
  {
    id: "denkwerk",
    kort: "Het denkwerk",
    kop: "Het onzichtbare werk: meten, tekenen en blijven puzzelen",
    video: "V01",
    alineas: [
      "Een belangrijk deel van het werk gebeurt voordat een leiding wordt aangesloten. Het begint met kijken, meten en de route van het water stap voor stap doordenken.",
      "Waar kan een leiding lopen? Welke bochten en koppelingen zijn nodig? Op welke plek is een afsluiter nog bereikbaar? Hoe passen de aansluitingen op de pomp en het filter? En wat betekent een wijziging op één plek voor de rest van het systeem?",
      "Achter de schermen zijn de opstelling en aansluitingen steeds verder uitgewerkt. Daarbij zijn schema’s, materiaalkeuzes en de praktische mogelijkheden in de tuin naast elkaar gelegd. Tijdens de uitvoering vraagt de bestaande situatie soms opnieuw om afwegingen: een aansluiting komt anders uit, er is een extra bocht nodig of een kraan moet op een beter bereikbare plek worden gezet.",
      "Dat is het puzzelwerk dat straks grotendeels uit beeld verdwijnt. Het bepaalt wel hoe het systeem functioneert en hoe prettig eraan gewerkt kan worden wanneer onderhoud nodig is.",
      "De circa 120 bestede uren omvatten daarom zowel het zichtbare werk in de tuin als de voorbereiding, het uitzoeken en het uitdenken van het geheel. Omgerekend is dat ongeveer vijftien werkdagen van acht uur, verspreid over het traject.",
    ],
    foto: "F03",
  },
  {
    id: "waterroute",
    kort: "De waterroute",
    kop: "Hoe de twee vijvers samenwerken",
    foto: "F11",
    alineas: [
      "Voor de technische uitwerking zijn de vijvers aangeduid als vijver A en vijver B. Vijver B is het vertrekpunt van het opgepompte water.",
      "Vanuit vijver B gaat het water via de pomp naar het driekamerfilter. Na de filtratie wordt het verdeeld over twee takken: één richting vijver A en één richting de waterval. Het water van de waterval loopt via de beekloop terug naar vijver B. Vijver A voert via de afvoer- en overloopverbinding terug naar vijver B.",
      "Zo ontstaan twee routes binnen hetzelfde watersysteem. De verdeling is regelbaar, zodat de toevoer naar vijver A en naar de waterval op elkaar kan worden afgestemd.",
      "Het systeem is daarmee als geheel uitgedacht. De waterval, beekloop, vijvers en filteropstelling hebben ieder een eigen plek in de route van het water.",
    ],
    schema: true,
  },
  {
    id: "leidingwerk",
    kort: "Het leidingwerk",
    kop: "Drukvast pvc en een zorgvuldig gekozen leidingroute",
    alineas: [
      "Voor het vaste leidingwerk is gekozen voor druk-pvc met een diameter van 50 millimeter. De toegepaste buis is gespecificeerd tot een druk van 7,5 bar. Dat getal beschrijft de drukvastheid van de buis; de werkdruk van de vijverinstallatie is hier niet mee vastgesteld.",
      "Bij de leidingroute is bewust aandacht besteed aan de bochten. Het aantal bochten van 90 graden is beperkt gehouden tot twee à maximaal vier. De overige richtingsveranderingen worden met bochten van 45 graden gemaakt. Het doel is om het water zo geleidelijk mogelijk door de leidingen te laten stromen en onnodige weerstand te beperken.",
      "Daar gaat veel ruimtelijk puzzelwerk aan vooraf. Een leiding moet passen binnen de bestaande tuin, aansluiten op de apparatuur en voldoende ruimte laten om kranen en koppelingen te bedienen. Iedere bocht heeft daardoor een plaats in het ontwerp.",
      "Naast de buizen en bochten zijn T-stukken, verloopstukken, koppelingen en afsluiters verwerkt. Een T-stuk maakt een vertakking mogelijk; een verloopstuk verbindt onderdelen met verschillende aansluitmaten. Samen vormen die kleine onderdelen het complete leidingstelsel.",
      "Bij deze renovatie bleken meer van die onderdelen nodig dan vooraf was voorzien. Het is een van de lessen uit het project: een globale route op papier moet op locatie worden vertaald naar alle afzonderlijke aansluitingen.",
    ],
    foto: "F04",
  },
  {
    id: "onderhoud",
    kort: "Onderhoud",
    kop: "Losneembare aansluitingen voor onderhoud",
    alineas: [
      "Bij de technische opstelling zijn koppelingen met schroefdraad gebruikt om onderdelen te kunnen afkoppelen. Zo kan onder meer het filter worden losgenomen voor onderhoud of werkzaamheden aan de opstelling.",
      "Die keuze vraagt al tijdens de aanleg om vooruitdenken. Er moet ruimte zijn om een koppeling los te draaien, een kraan te bedienen en een onderdeel daadwerkelijk uit de opstelling te halen.",
      "De bereikbaarheid is daarom meegenomen in het leidingontwerp en de afwerking. Ook wanneer het project klaar is, moet er aan de installatie gewerkt kunnen worden.",
    ],
  },
  {
    id: "filter",
    kort: "Het filter",
    kop: "Drie filterkamers, twee regelbare takken en een bypass",
    alineas: [
      "De technische opstelling combineert een AquaForte DM-10000 Vario S-pomp met een driekamerfilter. Rond het filter is een bypass opgenomen: een alternatieve route waarmee het water langs het filter kan worden geleid.",
      "Dat geeft mogelijkheden om de waterroute aan te passen wanneer aan het filter wordt gewerkt. Welke kranen daarbij open of dicht moeten staan, maakt deel uit van het gebruik van de installatie.",
      "De afsluiters en regelkranen hebben verschillende taken. Schuifafsluiters bij de onderste filterafvoeren dienen voor het openen en sluiten van die afvoeren. Kogelkranen in de leidingen maken het mogelijk om de waterverdeling over de twee uitgaande takken bij te stellen.",
      "Die functies zijn meegenomen in de inrichting. Zo krijgt onderhoud al tijdens de aanleg een plek en kan de waterverdeling na het aansluiten worden afgestemd.",
    ],
    foto: "F05",
  },
  {
    id: "skimmer",
    kort: "De skimmer",
    kop: "Een skimmer voor het wateroppervlak",
    alineas: [
      "Naast de filteropstelling is een skimmer opgenomen voor het opvangen van drijvend vuil, zoals bladeren en ander materiaal aan het wateroppervlak.",
      "Daarmee krijgt ook het oppervlak van de vijver een plek in het technische plan. De skimmer vormt een extra onderdeel om bij het gebruik en onderhoud van het geheel rekening mee te houden.",
    ],
    foto: "F06",
  },
  {
    id: "filterherstel",
    kort: "Filterherstel",
    kop: "Een beschadigd filter herstellen: een project binnen het project",
    alineas: [
      "Een van de lastigere onderdelen was het herstellen van het beschadigde filter van polypropyleen, ook wel PP genoemd. Dat bleek in de praktijk geen eenvoudige reparatie.",
      "Voor het herstel is tweecomponentenlijm gebruikt. Daarmee was het werk nog niet afgerond: naderhand bleek aanvullende afdichting met RubberSeal nodig. De reparatie vroeg daardoor meer aandacht en uitzoekwerk dan vooraf voorzien.",
      "Dit onderdeel laat goed zien wat renovatiewerk inhoudt. Bestaande materialen en beschadigingen brengen vragen met zich mee die pas tijdens de uitvoering volledig duidelijk worden. Hier moest de aanpak worden bijgesteld om het herstel verder uit te werken.",
      "Het repareren van het filter is daarmee ook onderdeel van de ervaring die in dit project is opgedaan: zorgvuldig kijken naar het materiaal, beoordelen wat een ingreep oplevert en verder zoeken wanneer de eerste aanpak nog niet voldoende is.",
    ],
    foto: "F07",
  },
  {
    id: "afwerking",
    kort: "Water naar tuin",
    kop: "De overgang van water naar tuin",
    alineas: [
      "Naast het technische werk krijgt de natuurlijke afwerking veel aandacht. Rond circa twaalf meter waterlijn en zes meter beekrand ontmoeten water, steen en planten elkaar.",
      "Daar bepaalt de afwerking hoe de vijvers in de tuin liggen. De randen moeten aansluiten op de waterval en beekloop, terwijl er ruimte blijft voor beplanting. De droge grind- en steenzone van ongeveer drie vierkante meter maakt eveneens deel uit van die overgang.",
      "Het aanvullen met teelaarde hoort bij de laatste werkzaamheden rondom het project. Daarna kan de verdere aanplant de aansluiting op de tuin versterken. Het beeld zal dus ook na de technische afronding nog veranderen: planten moeten zich ontwikkelen en hun plek tussen het water en de stenen gaan innemen.",
    ],
    foto: "F08",
  },
  {
    id: "beplanting",
    kort: "Beplanting",
    kop: "Elf plantmanden en zeven soorten in het oorspronkelijke plan",
    alineas: [
      "Voor de waterlijn en beekrand is een beplantingsplan opgesteld met in totaal elf manden, elk met vier planten. Dat komt neer op 44 planten, verdeeld over zeven soorten.",
      "De verdeling in het oorspronkelijke plan is:",
    ],
    planttabel: true,
    foto: "F09",
    video: "V02",
  },
  {
    id: "afronding",
    kort: "De afronding",
    kop: "De afronding: opruimen, aanvullen en verder laten groeien",
    alineas: [
      "Het project bevindt zich in de laatste fase. Het resterende hout en puin moeten worden afgevoerd en de omliggende delen worden aangevuld met teelaarde. De beschadigde vijverplanten kunnen worden vervangen; de aanvullende aanplant volgt naar verwachting in het voorjaar.",
      "Bij de afronding hoort ook aandacht voor het gebruik: de bediening van de kranen, de waterverdeling en de bereikbaarheid van de technische onderdelen. Een zorgvuldig aangelegd systeem moet voor de eigenaar ook begrijpelijk zijn.",
      "Het resultaat tot nu toe is een gereconstrueerde samenhang tussen twee vijvers, een waterval, een beekloop en de technische opstelling. De komende aanplant zal die basis verder verbinden met de tuin.",
    ],
  },
  {
    id: "eerste-project",
    kort: "Een eerste project",
    kop: "Een eerste project dat de basis legt voor GRØNN Studio",
    alineas: [
      "Deze vijverrenovatie heeft een bijzondere plek binnen GRØNN Studio. Het is een eerste project waarin ontwerp, techniek, uitvoering en beplanting op deze schaal samenkomen.",
      "Het traject heeft veel geleerd over voorbereiding, materiaalgebruik, het herstellen van bestaande onderdelen en de tijd die nodig is om een bestaande situatie zorgvuldig aan te passen. Vooral het vertalen van een plan naar alle afzonderlijke aansluitingen en werkstappen heeft waardevolle ervaring opgeleverd.",
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
export const BEGRIPPEN: { woord: string; term: string; uitleg: string; bron: Hoofdstuk["id"] }[] = [
  {
    // CIJFERS "Pvc-leidingwerk". Bron: "De toegepaste buis is gespecificeerd
    // tot een druk van 7,5 bar. Dat getal beschrijft …"
    woord: "7,5 bar",
    term: "7,5 bar",
    uitleg: "Dat getal beschrijft de drukvastheid van de buis; de werkdruk van de vijverinstallatie is hier niet mee vastgesteld.",
    bron: "leidingwerk",
  },
  {
    // CIJFERS "Oppervlakteopvang". Bron: "… is een skimmer opgenomen voor
    // het opvangen van drijvend vuil, …"
    woord: "skimmer",
    term: "Skimmer",
    uitleg: "Voor het opvangen van drijvend vuil, zoals bladeren en ander materiaal aan het wateroppervlak.",
    bron: "skimmer",
  },
  {
    // CIJFERS "Filter". Bron: "Rond het filter is een bypass opgenomen: een
    // alternatieve route …"
    woord: "bypass",
    term: "Bypass",
    uitleg: "Een alternatieve route waarmee het water langs het filter kan worden geleid.",
    bron: "filter",
  },
]

/** Na de planttabel, binnen "beplanting". */
export const NA_PLANTTABEL = [
  "De plantmanden bevatten naast de planten ook klei en substraat. Het plan maakt onderscheid tussen de waterlijn en de ondiepere beekrand, zodat de beplanting aansluit op de verschillende plekken in het systeem.",
  "Tijdens het project hebben de aanwezige vissen een deel van de vijverplanten beschadigd. Die planten worden vervangen. Het onderstreept dat de inrichting van een vijver ook moet passen bij de dieren die er al leven. De plaatsing en eventuele bescherming van vervangende planten verdienen daarom aandacht.",
  "De verdere aanplant rond het project is voorzien voor het voorjaar van 2027. Daarmee krijgt het groen een eigen vervolgstap na de afronding van het technische werk.",
]

export const PLANTTABEL = {
  rijen: [
    {
      zone: "Waterlijn",
      soorten: ["Gele lis", "zwanenbloem", "egelskop", "holpijp"],
      manden: 6,
      planten: 24,
    },
    {
      zone: "Beekrand",
      soorten: ["Penningkruid", "beekpunge", "watermunt"],
      manden: 5,
      planten: 20,
    },
  ],
  totaal: { soorten: "7 soorten", manden: 11, planten: 44 },
}

export const CITAAT = {
  tekst:
    "Ik heb ontzettend genoten van dit eerste project. Van het uitdenken van de waterstromen tot het moment waarop de onderdelen samenkomen. Het vertrouwen om dit te mogen maken was een belangrijke stap in het opbouwen van GRØNN Studio.",
  bron: "Nick Peters, GRØNN Studio",
}

export const NA_CITAAT =
  "Het uitgangspunt voor volgende projecten is daarmee verder aangescherpt: de werking van het watersysteem, het onderhoud en de inrichting van de tuin vanaf het begin samen bekijken. Met evenveel aandacht voor het zichtbare resultaat als voor de keuzes die achter de schermen nodig zijn."

export const SLOT = {
  kop: "Een vijver die weer past bij de tuin",
  alineas: [
    "Heb je een bestaande vijver die aan renovatie toe is, of wil je onderzoeken hoe een waterval, beekloop en beplanting beter op elkaar kunnen aansluiten?",
    "GRØNN Studio bekijkt de bestaande situatie en denkt mee over de techniek, inrichting en uitvoering. Zo begint ieder project met een duidelijk beeld van wat er nodig is om water en tuin samen te laten werken.",
  ],
  oproep: "Bespreek jouw vijverproject met GRØNN Studio.",
  foto: "F10" as FotoId,
}

/**
 * Het project in de vorm die de menu's en de zoekfunctie verwachten
 * (`Project` uit projects.ts). Geen `image`: zolang er geen echte foto is,
 * toont de uitgelichte kaart in het menu er ook geen. `location` blijft
 * leeg — de projecttekst noemt geen plaats, en er wordt er geen bedacht.
 */
export const VIJVER_ALS_PROJECT: Project = {
  slug: VIJVER_SLUG,
  title: { nl: VIJVER.titel, en: VIJVER.titel },
  location: "",
  category: "water",
  objective: { nl: VIJVER.kaarttekst, en: VIJVER.kaarttekst },
  intervention: { nl: VIJVER.ondertitel, en: VIJVER.ondertitel },
  status: { nl: VIJVER.status, en: "Finishing" },
  imageId: 28,
  featured: true,
}
