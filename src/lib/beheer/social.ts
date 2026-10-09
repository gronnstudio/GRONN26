// De Instagram-feed in /beheer/social (eigenaar, 9 okt 2026: "een social media
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
  { titel: "Waarom ik dit werk doe", nodig: "Een paar zinnen van Nick; foto IMG_8150." },
  {
    map: "02-winterklaar-1",
    slides: 5,
    titel: "Winterklaar 1/5: stop met voeren",
    caption:
      "Hoe lang voer jij je vissen nog door?\n\nOnder 10 °C gaan ze in winterrust en valt hun spijsvertering bijna stil. Voer dat ze dan nog eten, blijft in hun darmen liggen. Wat ze laten liggen, rot op de bodem en wordt voeding voor de algen van volgend voorjaar.\n\nHang een thermometer op zo’n 50 cm diepte. Tussen 15 en 10 °C geef je weinig en licht verteerbaar voer, en onder 10 °C stop je. Ook op een zonnige winterdag.\n\nDit is deel 1 van 5 van Vijver winterklaar. Volgende keer: pomp en filter in de winter.",
  },
  { titel: "Een vijverrand leggen", nodig: "Clips IMG_2889 en IMG_2890 uit de beeldbank." },
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
  { titel: "Wat ik zelf eet uit mijn tuin", nodig: "Een paar zinnen van Nick; foto IMG_1779." },
  { titel: "Winterklaar 2/5: pomp en filter", nodig: "Wordt gemaakt." },
  { titel: "Wat er onder een vijver zit", nodig: "Wordt gemaakt." },
  {
    map: "09-quote-voed-de-bodem",
    slides: 1,
    titel: "Feed the soil, not the plant.",
    caption:
      "Voed de bodem, niet de plant.\n\nGezonde grond vol leven voedt je planten vanzelf. Daarom geen kunstmest, maar compost en mulch, en het blad mag in de borders blijven liggen. De bodem doet de rest, jaar na jaar.",
  },
  { titel: "Najaarsbeurt vijver", nodig: "Wordt gemaakt." },
  { titel: "Een dag in Geulle", nodig: "Een paar zinnen van Nick; foto IMG_3571." },
  { titel: "Winterklaar 3/5: knippen of laten staan", nodig: "Wordt gemaakt." },
  { titel: "Tussen keien en folie", nodig: "Clip IMG_2891 uit de beeldbank." },
  { titel: "Leave the leaves.", nodig: "Wordt gemaakt." },
  { titel: "Vijverdoorlichting € 195", nodig: "Wordt gemaakt." },
]

export const tegelVan = (n: number): Tegel => VOLGORDE[(n - 1) % VOLGORDE.length]
