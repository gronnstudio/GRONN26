// De Instagram-feed in /dashboard/social (eigenaar, 9 okt 2026: "een social media
// manager, vanaf de achterkant van de site"). The KNIGHT move: vijf tegels in
// een vaste volgorde. Op een raster van drie kolommen staat dezelfde tegel dan
// altijd een paardensprong verder. Nick post zelf; hier staan de beelden en
// captions klaar. Een post is gepost? Zet `gepost` op de datum.

export const TEGELS = {
  P: { emoji: "🟨", naam: "Persoonlijk", vorm: "Foto · Nick in beeld", kleur: "#F2C94C" },
  K: { emoji: "🟩", naam: "Kennis", vorm: "Carrousel", kleur: "#6FCF97" },
  R: { emoji: "🟧", naam: "Proces", vorm: "Reel", kleur: "#F2994A" },
  I: { emoji: "🟦", naam: "Inspiratie", vorm: "Quote (Engels)", kleur: "#7DB7F0" },
  C: { emoji: "🟥", naam: "Commercieel", vorm: "Carrousel · oranje knop", kleur: "#EB5757" },
} as const
export type Tegel = keyof typeof TEGELS

/** De volgorde van de KNIGHT move; post n krijgt VOLGORDE[(n - 1) % 5]. */
export const VOLGORDE: Tegel[] = ["P", "K", "R", "I", "C"]

export type Post = {
  /** Map onder /public/social met 1.jpg, 2.jpg, … */
  map?: string
  slides?: number
  /** Een reel: 1.jpg is de cover, reel.mp4 de video. */
  reel?: boolean
  titel: string
  caption?: string
  /** Wat er nog nodig is, als de post niet klaar is. */
  nodig?: string
  /** Datum waarop Nick hem postte, bv. "2026-10-12". */
  gepost?: string
}

export const VASTGEZET: Post[] = [
  {
    map: "vast-1",
    slides: 4,
    titel: "01 · Wie ik ben",
    caption:
      "Hoi, ik ben Nick, de man achter GRØNN.\n\nIk maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving. Water, planten en bodem zie ik als één systeem, zodat alles gezond blijft met weinig ingrijpen.\n\nJe spreekt mij, van de eerste foto tot de laatste plant. En je weet vooraf wat het kost.\n\nZeg gerust hoi in een DM.",
  },
  {
    map: "vast-2",
    slides: 5,
    titel: "02 · Echt werk",
    caption:
      "Twee vijvers, een waterval en een beekloop, verbonden tot één watersysteem.\n\nEerst lag hier een vijver onder een net, tegen een oude muur. Ik heb leidingen en een filter ingegraven, natuursteen gelegd en de beplanting gezet. Het plan telt 44 planten van 7 soorten. Het ging om zo’n 5.000 liter water en zo’n 120 uur werk.\n\nHet project is nog in afronding. In het voorjaar van 2027 komt de rest van de beplanting erbij. Het hele verhaal staat op gronn.studio.\n\nHeb jij ook zo’n vijver in gedachten? Stuur me een foto.",
  },
  {
    map: "vast-3",
    slides: 4,
    titel: "03 · Samenwerken",
    caption:
      "Zo werk ik, in vier stappen.\n\n1. Je stuurt een foto van je vijver of tuin.\n2. Ik kom kijken en we lopen samen door wat je wilt.\n3. Je krijgt vooraf een vaste prijs.\n4. Ik maak het, en houd het bij als je dat wilt.\n\nVijvers: renoveren, waterval, filter, beekloop, najaarsbeurt en onderhoud. Tuinen: aanleggen, omvormen, borderpakketten en onderhoud. Voor huiseigenaren in Stein en omgeving.\n\nStuur een WhatsApp naar 06 181 180 14 of een DM.",
  },
]

/** In de volgorde van posten: de eerste staat hier bovenaan. */
export const POSTS: Post[] = [
  {
    map: "01-persoonlijk-luisteren",
    slides: 1,
    titel: "Waarom ik dit werk doe",
    caption:
      "Waarom ik dit werk doe?\n\nHet vaderschap maakte voor mij nog duidelijker wat belangrijk is: aandacht geven, verantwoordelijkheid nemen en een omgeving creëren waarin iemand zich veilig voelt. Dat neem ik mee in mijn werk. Ik luister, kijk zorgvuldig en wil begrijpen wat een plek voor iemand moet betekenen.\n\nIk wil tuinen ontwerpen en aanleggen waarin mensen zich thuis voelen en waarin ook ruimte is voor ander leven. Dat begint bij de bodem, bij hoe water zijn weg vindt en bij planten die passen bij de plek.\n\nVertel me gerust over jouw plek.",
  },
  {
    map: "02-winterklaar-1",
    slides: 5,
    titel: "Winterklaar 1/5: stop met voeren",
    caption:
      "Hoe lang voer jij je vissen nog door?\n\nOnder 10 °C gaan ze in winterrust en valt hun spijsvertering bijna stil. Voer dat ze dan nog eten, blijft in hun darmen liggen. Wat ze laten liggen, rot op de bodem en wordt voeding voor de algen van volgend voorjaar.\n\nHang een thermometer op zo’n 50 cm diepte. Tussen 15 en 10 °C geef je weinig en licht verteerbaar voer, en onder 10 °C stop je. Ook op een zonnige winterdag.\n\nDit is deel 1 van 5 van Vijver winterklaar. Volgende keer: pomp en filter in de winter.",
  },
  {
    map: "03-beekloop",
    slides: 1,
    reel: true,
    titel: "Een beekloop bouwen",
    caption:
      "Een beekloop begint als een sleuf in de grond.\n\nFolie, grind en keien. Dan de rand, waar water en tuin elkaar raken. Oeverplanten tussen de stenen. En dan loopt het: van de waterval via de beekloop terug naar de vijver.\n\nHet hele project staat op gronn.studio.",
  },
  {
    map: "04-quote-op-gang",
    slides: 1,
    titel: "You don’t build a garden. You set it in motion.",
    caption:
      "Een tuin leg je niet aan, je zet hem op gang.\n\nIk zorg voor de bodem, het water en de juiste plant op de juiste plek. Daarna doet de tuin het meeste werk zelf, en wordt hij elk jaar mooier.",
  },
  {
    map: "05-borderpakketten",
    slides: 7,
    titel: "Borderpakketten",
    caption:
      "Een border die vanaf dag één klopt.\n\nJe staat in het tuincentrum, je kiest wat mooi bloeit, en een jaar later staat de helft op de verkeerde plek. Daarom heb ik acht borderpakketten gemaakt: voor zon, schaduw, de vijverrand of droge grond. Bij elk pakket hoort een plan van boven met elke plant, het aantal en de afstand.\n\nIk plant hem aan in Stein en omgeving, of je krijgt planten en plan thuisbezorgd. Past geen pakket? Dan stel ik er een op maat samen.\n\nStuur \"border\" in een DM en vertel waar hij komt.",
  },
  {
    map: "06-modder",
    slides: 5,
    titel: "Vaak ook modder",
    caption:
      "Thuis en in mijn werk zijn er altijd planten, ideeën en projecten. Vaak ook modder.\n\nMet mijn vader verbouwde ik huizen. Daar leerde ik werken met mijn handen, oplossingen zoeken en doorzetten wanneer iets anders loopt dan bedacht. Buiten de opdrachten moestuinier ik, in de eigen tuin en op een vakantiepark in Beringe.\n\nAls ik naar een tuin kijk, ben ik benieuwd naar wie er leeft. Waar drink je ’s ochtends je koffie? Waar spelen de kinderen? Met die aandacht werk ik ook aan jouw tuin.",
  },
  { titel: "Winterklaar 2/5: pomp en filter", nodig: "Wordt gemaakt." },
  {
    map: "08-plantmanden",
    slides: 1,
    reel: true,
    titel: "Waarom oeverplanten in een mand",
    caption:
      "Waarom zet ik oeverplanten in een mand?\n\n1. De wortels blijven waar ze horen.\n2. Er komt geen losse aarde in het water.\n3. Uitnemen en scheuren gaat makkelijk.\n\nHet plan voor deze vijver: 11 manden, 44 planten en 7 soorten. Volgend voorjaar plant ik verder aan.\n\nBewaar dit als je zelf een vijver beplant.",
  },
  {
    map: "09-quote-voed-de-bodem",
    slides: 1,
    titel: "Feed the soil, not the plant.",
    caption:
      "Voed de bodem, niet de plant.\n\nGezonde grond vol leven voedt je planten vanzelf. Daarom geen kunstmest, maar compost en mulch, en het blad mag in de borders blijven liggen. De bodem doet de rest, jaar na jaar.",
  },
  {
    map: "10-winterklaar-prijs",
    slides: 1,
    reel: true,
    titel: "Winterklaar met een vaste prijs",
    caption:
      "Wat kost het om je vijver winterklaar te maken? Dat weet je vooraf.\n\n1. Stuur één foto via WhatsApp.\n2. Je krijgt een vaste prijs: basis € 95, met bladnet ophalen € 135, met ijsvrijhouder € 150, alles € 185. Incl. btw.\n3. We prikken een datum en ik kom langs.\n\nWhatsApp: 06 181 180 14. Stein en omgeving.",
  },
  {
    map: "11-buiten",
    slides: 1,
    titel: "Buiten vond ik rust",
    caption:
      "Buiten vond ik rust: in tuinieren, dieren, observeren en bezig zijn. De natuur is altijd een plek geweest waar ik me thuis voel.\n\nDaarom maak ik tuinen waarin mensen zich thuis voelen, en waarin ook ruimte is voor ander leven.",
  },
  { titel: "Winterklaar 3/5: knippen of laten staan", nodig: "Wordt gemaakt." },
  {
    map: "13-terras",
    slides: 1,
    reel: true,
    titel: "Terras Geulle in twee dagen",
    caption:
      "24 m² betontegels in twee dagen, in Geulle.\n\nDag 1: ontgraven, ophogen en verdichten, zandbed afrijen, banden stellen en uitlijnen.\nDag 2: tegels van 60 × 60 × 4 cm leggen, op afschot richting het gras, en alles nog eens controleren.\n\nEen goed terras ziet er niet alleen waterpas uit. Het weet ook waar het water heen moet.",
  },
  { titel: "Leave the leaves.", nodig: "Wordt gemaakt." },
  {
    map: "15-bladnet",
    slides: 4,
    titel: "Bladnet met een vaste prijs",
    caption:
      "Blad in de vijver rot en wordt slib. Een net erover voorkomt dat. Het is de enige vijverklus met een deadline: vóór de bladval.\n\nVaste prijs, incl. btw:\nTot 15 m²: € 125\n15 tot 35 m²: € 175\nMeer dan 35 m²: € 250\n\nHet net wordt op maat gesneden en de randen om de 60–80 cm vastgezet. In december haal ik het er weer af; die datum plannen we meteen in.\n\nStuur een foto van je vijver via WhatsApp: 06 181 180 14. Stein en omgeving.",
  },
]

export const tegelVan = (n: number): Tegel => VOLGORDE[(n - 1) % VOLGORDE.length]
