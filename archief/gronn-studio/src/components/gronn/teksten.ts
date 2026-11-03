import type { L } from "@/lib/i18n"

// De teksten van de V5-site die Nick in zijn eigen stem spreekt.
//
// Ze staan in code en NIET in `content/site-content.json`: `getContent()`
// legt een gepubliceerd editor-document over die JSON en vervangt daarbij
// de blokken `studio` en `home` in hun geheel. Een tekst daar kan dus
// onzichtbaar blijven; een tekst hier staat er altijd.
//
// Stijl (Brand Guide p. 11 en Nicks eigen "Over mij"): ik-vorm, korte
// zinnen, concreet, de lezer is je/jij. Geen vakjargon, en niets wat niet
// te onderbouwen is.

/**
 * "Over mij" — Nicks eigen tekst, aangeleverd op 23 sep 2026 met de
 * opdracht: "letterlijk 1:1". Elke alinea is één string, tekens zoals
 * aangeleverd (’ in ’s ochtends). Niet redigeren, niet inkorten;
 * `waterroute.spec.ts` vergelijkt hem teken voor teken.
 *
 * Het Engels is een getrouwe vertaling, zonder iets toe te voegen of weg
 * te laten. Alleen die is niet letterlijk van Nick.
 */
export const OVER_MIJ: L[] = [
  {
    nl: "Ik ben Nick Peters. Vader van twee kinderen, hovenier, ecologisch ontwerper en de persoon achter GRØNN Studio.",
    en: "I’m Nick Peters. Father of two children, gardener, ecological designer and the person behind GRØNN Studio.",
  },
  {
    nl: "Ik denk in beelden, patronen en verbanden. Als ik naar een tuin kijk, zie ik hoe licht, water, materialen en beplanting elkaar beïnvloeden. Maar ik ben ook benieuwd naar wie er leeft. Waar drink je ’s ochtends je koffie? Waar spelen de kinderen? En waar kom je na een drukke dag tot rust? Juist die dagelijkse dingen geven richting aan wat ik maak.",
    en: "I think in images, patterns and connections. When I look at a garden, I see how light, water, materials and planting influence one another. But I’m also curious about who lives there. Where do you drink your coffee in the morning? Where do the children play? And where do you come to rest after a busy day? It’s exactly those everyday things that give direction to what I make.",
  },
  {
    nl: "Mijn liefde voor bouwen en zorgen kreeg ik van huis uit mee. Ik groeide op in een warm, praktisch gezin, waar aandacht en respect vanzelfsprekend waren. Mijn moeder liet me zien hoeveel het betekent om aanwezig te zijn. Met mijn vader verbouwde ik huizen. Daar leerde ik werken met mijn handen, oplossingen zoeken en doorzetten wanneer iets anders loopt dan bedacht.",
    en: "I got my love of building and caring from home. I grew up in a warm, practical family, where attention and respect were a given. My mother showed me how much it means to be present. With my father I renovated houses. That’s where I learned to work with my hands, to look for solutions and to keep going when something turns out differently than planned.",
  },
  {
    nl: "Mijn eigen weg verliep minder vanzelfsprekend. Binnen school en vaste systemen voelde ik me vaak niet op mijn plek. Later gaf de diagnose autisme woorden aan dingen die ik al langer ervoer. Buiten vond ik rust: in tuinieren, dieren, observeren en bezig zijn. De natuur is altijd een plek geweest waar ik me thuis voel.",
    en: "My own path was less straightforward. At school and within fixed systems I often felt out of place. Later, a diagnosis of autism put words to things I had experienced for a long time. Outside I found calm: in gardening, animals, observing and keeping busy. Nature has always been a place where I feel at home.",
  },
  {
    nl: "Het vaderschap maakte voor mij nog duidelijker wat belangrijk is: aandacht geven, verantwoordelijkheid nemen en een omgeving creëren waarin iemand zich veilig voelt. Dat neem ik mee in mijn werk. Ik luister, kijk zorgvuldig en wil begrijpen wat een plek voor iemand moet betekenen.",
    en: "Becoming a father made it even clearer to me what matters: giving attention, taking responsibility and creating an environment in which someone feels safe. I bring that into my work. I listen, look carefully and want to understand what a place needs to mean for someone.",
  },
  {
    nl: "In GRØNN Studio komen mijn manier van kijken en mijn plezier in maken samen. Ik wil tuinen ontwerpen en aanleggen waarin mensen zich thuis voelen en waarin ook ruimte is voor ander leven. Dat begint bij de bodem, bij hoe water zijn weg vindt en bij planten die passen bij de plek. Ik kijk daarbij ook vooruit: hoe groeit een tuin verder, hoe verandert hij met de seizoenen en welk onderhoud past bij de eigenaar?",
    en: "In GRØNN Studio, my way of looking and my joy in making come together. I want to design and build gardens in which people feel at home and in which there is also room for other life. That starts with the soil, with how water finds its way and with plants that suit the place. I also look ahead: how will a garden keep growing, how does it change with the seasons and what upkeep suits its owner?",
  },
  {
    nl: "Thuis en in mijn werk zijn er altijd planten, ideeën en projecten. Vaak ook modder. Ik blijf nieuwsgierig naar hoe dingen groeien en hoe ik ze beter kan maken.",
    en: "At home and in my work there are always plants, ideas and projects. Often mud, too. I stay curious about how things grow and how I can make them better.",
  },
  {
    nl: "Met die aandacht werk ik ook aan jouw tuin.",
    en: "That same attention is what I bring to your garden.",
  },
]

/** De werkwijze: dezelfde zes stappen als voorheen, in Nicks stem. */
export const WERKWIJZE_KOP: L = { nl: "Zo werk ik", en: "How I work" }
export const WERKWIJZE: { titel: L; tekst: L }[] = [
  {
    titel: { nl: "Eerst kijken", en: "Looking first" },
    tekst: {
      nl: "Ik kom langs en kijk hoe je tuin nu leeft: waar het licht valt, waar water blijft staan, wat er al groeit. En ik vraag hoe jij de tuin gebruikt.",
      en: "I come round and look at how your garden lives now: where the light falls, where water stays, what already grows. And I ask how you use the garden.",
    },
  },
  {
    titel: { nl: "Uitzoeken hoe het werkt", en: "Working out how it works" },
    tekst: {
      nl: "Ik breng in kaart wat de plek meebrengt: de bodem, het water, de schaduw. Wat kan hier, en wat niet?",
      en: "I map what the place brings with it: the soil, the water, the shade. What can work here, and what can’t?",
    },
  },
  {
    titel: { nl: "Verbanden leggen", en: "Making connections" },
    tekst: {
      nl: "Bodem, water, planten, dieren en jij. Ik kijk hoe die elkaar kunnen helpen in plaats van tegenwerken.",
      en: "Soil, water, plants, animals and you. I look at how they can help each other instead of working against each other.",
    },
  },
  {
    titel: { nl: "Ontwerpen", en: "Designing" },
    tekst: {
      nl: "Daar maak ik één helder plan van. Een plan dat je kunt lezen en begrijpen, ook als je geen tuinman bent.",
      en: "I turn that into one clear plan. A plan you can read and understand, even if you are not a gardener.",
    },
  },
  {
    titel: { nl: "Aanleggen", en: "Building" },
    tekst: {
      nl: "Ik leg de tuin aan, plant in en blijf meekijken terwijl hij zijn eerste seizoenen doormaakt.",
      en: "I build the garden, plant it and keep an eye on it as it goes through its first seasons.",
    },
  },
  {
    titel: { nl: "Laten groeien", en: "Letting it grow" },
    tekst: {
      nl: "Daarna krijgt de tuin tijd. Hij verandert met de seizoenen, en het onderhoud stemmen we af op wat bij jou past.",
      en: "Then the garden gets time. It changes with the seasons, and we match the upkeep to what suits you.",
    },
  },
]

/** Vijf uitgangspunten: dezelfde vijf als voorheen, in de ik-vorm. */
export const UITGANGSPUNTEN: L[] = [
  { nl: "Ik kijk naar de tuin als één geheel", en: "I look at the garden as one whole" },
  { nl: "Mooi en bruikbaar horen bij elkaar", en: "Beautiful and useful belong together" },
  { nl: "Ik begin bij de bodem en het water", en: "I start with the soil and the water" },
  { nl: "Wat ik aanleg, doet meer dan één ding", en: "What I build does more than one thing" },
  { nl: "Een goede tuin wordt elk jaar beter", en: "A good garden gets better every year" },
]

/**
 * Wat er na het contactformulier gebeurt. Eén keer geschreven: de
 * contactpagina zet het boven het formulier en /faq antwoordt ermee op
 * "Hoe begin ik?" — twee versies van dezelfde belofte lopen uit elkaar.
 */
export const CONTACT_UITNODIGING: L = {
  nl: "Een paar zinnen is genoeg. Ik lees mee, stel een vraag als dat nodig is, en we spreken af om samen te kijken.",
  en: "A few sentences is enough. I read along, ask a question if I need to, and we arrange to look together.",
}

/** De toezegging uit de metabeschrijving van /contact, en op /faq. */
export const KENNISMAKING_VRIJBLIJVEND: L = {
  nl: "Een kennismaking is vrijblijvend; je hoort meestal binnen twee werkdagen iets.",
  en: "An introduction is free of obligation; you usually hear back within two working days.",
}

/**
 * "Wat is je budget?" in het contactformulier. Verplicht, en bewust
 * zonder "weet ik niet" (Nick, 23 sep 2026: "absoluut geen weet ik
 * niet"). De checklist vooraf noemt dezelfde drie.
 */
export const CONTACT_BUDGETTEN: { id: string; label: L }[] = [
  { id: "tot-5000", label: { nl: "Tot € 5.000", en: "Up to €5,000" } },
  { id: "5000-15000", label: { nl: "€ 5.000–15.000", en: "€5,000–15,000" } },
  { id: "meer-dan-15000", label: { nl: "Meer dan € 15.000", en: "More than €15,000" } },
]

/**
 * De checklist vooraf: de weggever van de maillijst (src/lib/nieuwsbrief.ts).
 * Dezelfde naam en belofte op home, /faq, in de voet en op /checklist.
 */
export const CHECKLIST_NAAM: L = { nl: "Checklist vooraf", en: "Checklist before you start" }
export const CHECKLIST_BELOFTE: L = {
  nl: "Wat je kunt nakijken voordat je aan je tuin of vijver begint. Het zijn de dingen waar ik zelf naar kijk als ik langskom.",
  en: "What you can check before you start on your garden or pond. They are the things I look at myself when I come round.",
}
