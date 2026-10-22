import type { Foto } from "./vijverrenovatie"
import { ARCHIEF } from "./journaal-archief"

// Het Journaal, de blog (eigenaar, 21 okt 2026: "schrijf elke maand 2 blogs", "Blogs in
// eigen menu"). Praktische stukken bij het seizoen, alleen in het Nederlands,
// alleen met eigen foto's (of geen foto). Een stuk komt hier pas bij als
// Nick de tekst heeft goedgekeurd. De oudere stukken staan in
// journaal-archief.ts. Nieuwste bovenaan.

export type Blok =
  | { soort: "alinea"; tekst: string }
  | { soort: "kop"; tekst: string }
  | { soort: "lijst"; regels: string[] }
  | { soort: "foto"; foto: Foto }

// Kennis per thema, niet per datum (eigenaar, 22 okt 2026, uit de VHG-lessen:
// "4, doen! meteen!"). Seizoen is voor stukken die over de hele tuin in een
// bepaalde tijd van het jaar gaan.
export const THEMAS = ["Vijver", "Tuin", "Seizoen"] as const
export type Thema = (typeof THEMAS)[number]

export type Stuk = {
  slug: string
  titel: string
  /** Voor zoekmachines en de lijst, rond 155 tekens. */
  beschrijving: string
  /** ISO-datum van publicatie. */
  datum: string
  leestijd: number
  /** Het thema: rubriek boven de titel en de groep op /journaal. */
  rubriek: Thema
  /** De foto voor de lijst en voor delen; zonder eigen foto blijft het een tekststuk. */
  beeld?: Foto
  blokken: Blok[]
  /** Bronnen in APA-stijl (eigenaar, 22 okt 2026), onder het stuk. */
  bronnen?: string[]
}

const BLADNET: Foto = {
  src: "/blog/vijver-onder-bladnet.jpg",
  width: 675,
  height: 1200,
  alt: "Een vijver met goudvissen onder een bladnet, vastgezet met houten paaltjes langs de natuurstenen rand",
  bijschrift: "Het net staat er al, vóór de bladval.",
}

const WATERVAL: Foto = {
  src: "/blog/waterval-na-herfstbeurt.jpg",
  width: 1600,
  height: 1200,
  alt: "Een kleine waterval van natuursteen met mos, helder water, en ernaast een canna met rode bloemen",
  bijschrift: "Na de herfstbeurt: filter schoon, waterval weer helder.",
}

// Staat al op de projectpagina van de vijverrenovatie; eigen werk.
const NICK_TUSSEN_DE_PLANTEN: Foto = {
  src: "/projecten/vijverrenovatie/F09-2.jpg",
  width: 1000,
  height: 1333,
  alt: "Nick Peters lachend tussen de oeverplanten, aan het werk in de vijver",
  bijschrift: "Aan het werk tussen de oeverplanten.",
}

const RECENT: Stuk[] = [
  {
    slug: "levende-tuin",
    titel: "Werken mét de natuur: wat een levende tuin is",
    beschrijving:
      "Een tuin die leeft, kost minder werk. Wat een levende tuin is, waarom bodem, water en planten samen horen, en hoe je begint.",
    datum: "2026-10-22",
    leestijd: 5,
    rubriek: "Tuin",
    beeld: NICK_TUSSEN_DE_PLANTEN,
    blokken: [
      { soort: "alinea", tekst: "Veel tuinen worden aangelegd alsof ze een kamer zijn. Strak, af, en dan zo houden. Elk blad dat valt is rommel, elk onkruid een fout, elke regenbui een plas op het terras. Het resultaat is een tuin die je het hele jaar door moet bijhouden, want hij werkt tegen je in." },
      { soort: "alinea", tekst: "Ik werk liever andersom: met de natuur mee." },
      { soort: "kop", tekst: "Wat is een levende tuin?" },
      { soort: "alinea", tekst: "Branchevereniging VHG, de vereniging van hoveniers en groenbedrijven, gebruikt er een mooi woord voor: de levende tuin. Een tuin die \u201caan alle kanten en overal leeft\u201d, waar je van kunt genieten en zelfs van kunt eten, en waar vlinders en egels ook hun voedsel vinden (VHG, z.d.). Zo'n tuin is nooit helemaal af. Hij groeit mee." },
      { soort: "alinea", tekst: "Dat klinkt groot, maar het is vooral een manier van kijken. In een levende tuin doet elk onderdeel meer dan één ding." },
      { soort: "kop", tekst: "Bodem, water en planten als één geheel" },
      {
        soort: "lijst",
        regels: [
          "De bodem is geen ondergrond, maar het begin van alles. Een levende bodem met wormen, schimmels en humus houdt water vast in droge zomers en laat het weglopen bij een bui. Daarom laat ik blad liggen in de borders en gebruik ik compost in plaats van kunstmest.",
          "Water hoort in de tuin te blijven. Regenwater van het dak kan een vijver of een wadi voeden, in plaats van het riool in te gaan (VHG, z.d.). Een vijver met een natuurlijke rand trekt kikkers, libellen en vogels aan, en die eten weer de muggen en slakken.",
          "Planten kies je op de plek, niet andersom. Een plant die past bij de grond en de zon hoeft niet elke week water. Inheemse planten en bloeiers door het hele seizoen geven voedsel aan bijen en vlinders.",
        ],
      },
      { soort: "alinea", tekst: "Als die drie kloppen, regelt de tuin veel zelf. Minder gieten, minder spuiten, minder wieden." },
      { soort: "kop", tekst: "Wat het jou oplevert" },
      { soort: "alinea", tekst: "Een levende tuin is niet alleen goed voor de natuur. Hij is koeler op een hete dag, omdat planten en bodem water verdampen waar tegels warmte vasthouden. Hij voert regenwater af zonder dat je kelder onderloopt. En hij is mooier in elk seizoen, ook in de winter, met zaadhoofden en grassen die blijven staan." },
      { soort: "alinea", tekst: "Alle tuinen van Nederland samen zijn volgens VHG tien keer zo groot als Nationaal Park De Hoge Veluwe (VHG, z.d.). Wat je in je eigen tuin doet, telt dus echt mee." },
      { soort: "kop", tekst: "Hoe begin je?" },
      { soort: "alinea", tekst: "Je hoeft niet alles om te gooien. Drie stappen die in elke tuin passen:" },
      {
        soort: "lijst",
        regels: [
          "Laat één hoek met rust. Blad, takken, een stapel stenen. Een schuilplek voor egels en kevers.",
          "Haal een paar tegels weg. Elke vierkante meter grond in plaats van steen vangt regen op en geeft ruimte aan planten.",
          "Plant voor het hele jaar. Iets dat in het voorjaar bloeit, iets in de zomer en iets in de herfst. Dan is er altijd eten voor insecten.",
        ],
      },
      { soort: "kop", tekst: "Zo werk ik" },
      { soort: "alinea", tekst: "Bij elke tuin of vijver die ik aanleg in Stein en omgeving kijk ik eerst naar de bodem, het water en de plek, en pas daarna naar de planten. Zo maak ik een tuin die gezond blijft met weinig ingrijpen, met een vaste prijs vooraf. Wil je weten wat dat voor jouw tuin betekent? Plan een kennismaking of stuur een foto via WhatsApp naar 06 181 180 14." },
    ],
    bronnen: [
      "VHG. (z.d.). Handleiding De Levende Tuin [Handboek]. Branchevereniging VHG. https://maken.wikiwijs.nl/bestanden/744938/VHG%20Handleiding%20'De%20levende%20tuin'.pdf",
    ],
  },
  {
    slug: "vijver-winterklaar-maken",
    titel: "Je vijver winterklaar maken in Zuid-Limburg",
    beschrijving:
      "Stoppen met voeren, pomp hoger, bladnet erop, wak openhouden. Zo komt je vijver gezond de winter door. Vijveronderhoud in Stein en omgeving.",
    datum: "2026-10-21",
    leestijd: 4,
    rubriek: "Vijver",
    beeld: WATERVAL,
    blokken: [
      { soort: "alinea", tekst: "In Zuid-Limburg vriest het meestal later en korter dan in de rest van het land. Dat maakt het verleidelijk om de vijver nog even te laten. Maar het werk dat telt, gebeurt nu: vóór de bladval en vóór de eerste nachtvorst. Wat je in oktober en november goed doet, scheelt je in april een groene soep." },
      { soort: "alinea", tekst: "Dit zijn de vijf dingen die ik bij elke vijver in Stein en omgeving nakijk." },
      { soort: "kop", tekst: "1. Stop met voeren onder de 10 °C" },
      { soort: "alinea", tekst: "Vissen worden trager als het water afkoelt. Onder de 10 °C verteren ze bijna niets meer. Voer blijft in hun darmen zitten of zakt naar de bodem, rot daar en voedt in het voorjaar de algen." },
      { soort: "alinea", tekst: "Meet de temperatuur op zo'n 50 cm diepte, niet aan het oppervlak. Tussen 15 en 10 °C geef je weinig en licht verteerbaar voer. Onder 10 °C stop je, ook als de zon op een mooie novemberdag nog schijnt." },
      { soort: "kop", tekst: "2. Het bladnet erop, vóór het blad valt" },
      { soort: "alinea", tekst: "Blad dat in het water valt, zinkt, rot en wordt slib. Dat slib is voeding voor algen en kost in de winter zuurstof. Een bladnet vangt het op voordat het in het water komt." },
      { soort: "foto", foto: BLADNET },
      { soort: "alinea", tekst: "Span het net een eindje boven het water, zodat het niet doorzakt, en zet de randen om de 60 tot 80 cm vast. Haal het blad er om de week af. In december, als de bomen kaal zijn, gaat het net er weer af: dan heeft het zijn werk gedaan en wil je dat vogels en egels weer bij het water kunnen." },
      { soort: "kop", tekst: "3. Filter schoon, pomp hoger, UV-lamp uit" },
      { soort: "alinea", tekst: "Maak het filter nog één keer goed schoon zolang het water niet te koud is, en laat het daarna met rust. Het bodemleven in het filter heeft de winter nodig om op gang te blijven." },
      { soort: "alinea", tekst: "Zitten er vissen in de vijver, laat de pomp dan draaien, maar hang hem hoger: zo'n 30 cm onder het wateroppervlak. Onderin blijft dan een laag warmer water staan, en daar overwinteren je vissen. Zonder vissen mag de pomp uit en droog in de schuur." },
      { soort: "alinea", tekst: "De UV-lamp doet in de winter niets. Zet hem uit en berg hem droog op; dan gaat de lamp ook langer mee." },
      { soort: "kop", tekst: "4. Knip slim, niet alles" },
      { soort: "alinea", tekst: "Je oeverplanten worden bruin, maar niet alles hoeft weg." },
      {
        soort: "lijst",
        regels: [
          "Laten staan: riet, lisdodde en biezen. Hun holle stengels brengen zuurstof naar de bodem en houden een opening in het ijs, zodat gassen uit het water kunnen. Die knip je pas in het voorjaar.",
          "Wel knippen: zacht blad dat in het water hangt, zoals van waterlelies en moerasplanten. Dat rot snel. Knip het een handbreedte boven het water af.",
        ],
      },
      { soort: "alinea", tekst: "Wat boven de rand blijft staan, is in de winter een schuilplek voor insecten en kikkers. Een beetje rommel aan de rand is goed voor het leven in en om je vijver." },
      { soort: "kop", tekst: "5. Houd een wak open als het vriest" },
      { soort: "alinea", tekst: "Als de vijver helemaal dichtvriest, kunnen de gassen uit het water niet meer weg. Dat is gevaarlijker voor je vissen dan de kou zelf. Een ijsvrijhouder (een drijver van piepschuim of een kleine luchtpomp met uitstroomsteen) houdt een gat open." },
      { soort: "alinea", tekst: "Hak het ijs nooit open. De klappen geven drukgolven onder water die je vissen in hun winterrust stressen. Is het toch dichtgevroren, zet dan een pan heet water op het ijs en laat dat er langzaam een gat in smelten." },
      { soort: "foto", foto: WATERVAL },
      { soort: "kop", tekst: "Waarom het in Zuid-Limburg net anders is" },
      { soort: "alinea", tekst: "Hier vriest het vaak pas laat, en dan kort. Dat klinkt gunstig, maar het betekent ook dat veel vijvers in november nog warm genoeg zijn voor algen, terwijl het blad er al in ligt. Daarom is het net en het slib ruimen hier belangrijker dan het ijs. En omdat het weer snel omslaat, kun je beter vóór half november klaar zijn dan wachten op het weerbericht." },
      { soort: "kop", tekst: "Liever niet zelf?" },
      { soort: "alinea", tekst: "Ik maak vijvers winterklaar in Stein en omgeving, met een vaste prijs vooraf, inclusief btw:" },
      { soort: "lijst", regels: ["Basis: € 95", "Met bladnet ophalen: € 135", "Met ijsvrijhouder: € 150", "Alles: € 185"] },
      { soort: "alinea", tekst: "Stuur een foto van je vijver via WhatsApp naar 06 181 180 14, dan zeg ik wat je vijver nodig heeft." },
    ],
  },
]

export const STUKKEN: Stuk[] = [...RECENT, ...ARCHIEF].sort((a, b) => b.datum.localeCompare(a.datum))

export const stukMet = (slug: string) => STUKKEN.find((s) => s.slug === slug)

/** Het volgnummer, zoals een tijdschriftnummer: het eerste stuk is Nr. 01. */
export const nummer = (s: Stuk) => String(STUKKEN.length - STUKKEN.indexOf(s)).padStart(2, "0")

export const datumTekst = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

/** "Herfst 2026": het seizoen van een datum, voor de kop van het Journaal. */
export function seizoen(d: string) {
  const t = new Date(d)
  const m = t.getMonth()
  const naam = m < 2 || m === 11 ? "Winter" : m < 5 ? "Lente" : m < 8 ? "Zomer" : "Herfst"
  return `${naam} ${t.getFullYear()}`
}
