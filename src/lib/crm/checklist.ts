// De checklist voor een tuinopname (eigenaar, 29 okt 2026: "maak die checklist
// in het dashboard beschikbaar"). Bron: /mnt/project-files/offertes/opname-checklist.md.
// Per tuin wordt bewaard welke punten zijn afgevinkt, op id; verander je de tekst
// van een punt, laat het id dan staan. Wat je niet kunt invullen wordt een stelpost.

export type ChecklistGroep = { id: string; naam: string; punten: { id: string; tekst: string }[] }

export const CHECKLIST: ChecklistGroep[] = [
  {
    id: "meenemen",
    naam: "Meenemen",
    punten: [
      { id: "meetwiel-of-rolmaat-30-m-duimstok-waterp", tekst: "Meetwiel of rolmaat (30 m), duimstok, waterpas" },
      { id: "telefoon-met-volle-batterij-voor-foto-s", tekst: "Telefoon met volle batterij voor foto's en video" },
      { id: "magazines-en-stalen-bestrating-kiezel-bl", tekst: "Magazines en stalen (bestrating, kiezel, blokken)" },
      { id: "het-ontwerp-of-de-schets-als-die-er-al-i", tekst: "Het ontwerp of de schets, als die er al is" },
    ],
  },
  {
    id: "de-klant",
    naam: "De klant",
    punten: [
      { id: "wie-beslist-er-is-iedereen-erbij-die-mee", tekst: "Wie beslist er? Is iedereen erbij die mee wil praten?" },
      { id: "hoe-gebruiken-ze-de-tuin-kinderen-hond-z", tekst: "Hoe gebruiken ze de tuin: kinderen, hond, zitten, eten, moestuin?" },
      { id: "welke-sfeer-willen-ze-laat-ze-2-of-3-voo", tekst: "Welke sfeer willen ze? Laat ze 2 of 3 voorbeelden aanwijzen." },
      { id: "hoeveel-onderhoud-willen-ze-zelf-doen", tekst: "Hoeveel onderhoud willen ze zelf doen?" },
      { id: "wat-moet-blijven-staan-bomen-terras-schu", tekst: "Wat moet blijven staan: bomen, terras, schuur, planten?" },
      { id: "budget-welk-bedrag-hebben-ze-in-hun-hoof", tekst: "Budget: welk bedrag hebben ze in hun hoofd?" },
      { id: "wanneer-willen-ze-het-af-hebben-zijn-er", tekst: "Wanneer willen ze het af hebben? Zijn er data waarop het niet kan?" },
    ],
  },
  {
    id: "meten",
    naam: "Meten",
    punten: [
      { id: "alle-vlakken-in-m2-bestrating-gazon-bord", tekst: "Alle vlakken in m²: bestrating, gazon, borders, grind" },
      { id: "strekkende-meters-hekwerk-kantopsluiting", tekst: "Strekkende meters: hekwerk, kantopsluiting, keermuur" },
      { id: "hoogtes-keerhoogte-van-muren-boven-1-m-i", tekst: "Hoogtes: keerhoogte van muren (boven 1 m is een berekening nodig), hoogte van het hekwerk" },
      { id: "hoogteverschil-in-de-tuin-en-de-afstand", tekst: "Hoogteverschil in de tuin en de afstand tot de dorpel van het huis" },
      { id: "maak-een-schets-met-de-maten-erop-en-een", tekst: "Maak een schets met de maten erop en een foto van elke hoek" },
    ],
  },
  {
    id: "bodem-en-water",
    naam: "Bodem en water",
    punten: [
      { id: "wat-voor-grond-klei-zand-loss-steek-een", tekst: "Wat voor grond: klei, zand, löss? Steek een schop in de grond." },
      { id: "blijft-er-water-staan-na-regen", tekst: "Blijft er water staan na regen?" },
      { id: "waar-zitten-de-regenpijpen-en-de-put", tekst: "Waar zitten de regenpijpen en de put?" },
      { id: "is-er-een-buitenkraan-en-stroom", tekst: "Is er een buitenkraan en stroom?" },
    ],
  },
  {
    id: "wat-er-onder-de-grond-kan-zitten",
    naam: "Wat er onder de grond kan zitten",
    punten: [
      { id: "kabels-en-leidingen-klic-melding-doen-vo", tekst: "Kabels en leidingen: KLIC-melding doen vóór het graafwerk" },
      { id: "oude-funderingen-beton-puin-wortels-of-e", tekst: "Oude funderingen, beton, puin, wortels of een oude vijver?" },
      { id: "bomen-in-de-buurt-waarvan-de-wortels-in", tekst: "Bomen in de buurt waarvan de wortels in de weg zitten" },
    ],
  },
  {
    id: "bereikbaarheid",
    naam: "Bereikbaarheid",
    punten: [
      { id: "hoe-breed-is-de-doorgang-naar-de-tuin-pa", tekst: "Hoe breed is de doorgang naar de tuin? Past er een minigraver of dumper door?" },
      { id: "waar-kan-een-container-staan-is-er-een-v", tekst: "Waar kan een container staan? Is er een vergunning voor de stoep nodig?" },
      { id: "waar-kan-materiaal-worden-gelost-en-opge", tekst: "Waar kan materiaal worden gelost en opgeslagen?" },
      { id: "parkeren-voor-de-bus", tekst: "Parkeren voor de bus" },
    ],
  },
  {
    id: "keuzes-en-materiaal",
    naam: "Keuzes en materiaal",
    punten: [
      { id: "bestrating-soort-kleur-legverband-en-een", tekst: "Bestrating: soort, kleur, legverband, en een tweede keus als het niet leverbaar is" },
      { id: "kiezel-blokken-randen-soort-en-kleur", tekst: "Kiezel, blokken, randen: soort en kleur" },
      { id: "hekwerk-soort-hoogte-kleur-poort-ja-of-n", tekst: "Hekwerk: soort, hoogte, kleur, poort ja of nee" },
      { id: "planten-sfeer-kleuren-bloeitijd-en-wat-z", tekst: "Planten: sfeer, kleuren, bloeitijd, en wat ze absoluut niet willen" },
    ],
  },
  {
    id: "buren-en-regels",
    naam: "Buren en regels",
    punten: [
      { id: "erfgrens-duidelijk-weten-de-buren-ervan", tekst: "Erfgrens duidelijk? Weten de buren ervan bij een hekwerk op de grens?" },
      { id: "is-er-een-vergunning-nodig-hoge-schuttin", tekst: "Is er een vergunning nodig (hoge schutting, bomen kappen)?" },
    ],
  },
  {
    id: "afspraken",
    naam: "Afspraken",
    punten: [
      { id: "wat-zit-er-wel-en-niet-in-de-prijs-benoe", tekst: "Wat zit er wel en niet in de prijs? Benoem de stelposten." },
      { id: "hoe-ze-betalen-aanbetaling-of-reserverin", tekst: "Hoe ze betalen: aanbetaling of reservering, termijnen" },
      { id: "wie-ruimt-wat-op-voor-de-start-spullen-p", tekst: "Wie ruimt wat op voor de start: spullen, planten, meubels" },
      { id: "wie-geeft-er-water-na-de-oplevering", tekst: "Wie geeft er water na de oplevering?" },
      { id: "wanneer-stuur-je-de-offerte", tekst: "Wanneer stuur je de offerte?" },
    ],
  },
]

export const CHECKLIST_IDS = new Set(CHECKLIST.flatMap((g) => g.punten.map((p) => p.id)))
