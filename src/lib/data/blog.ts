import type { Foto } from "./vijverrenovatie"

// De blog (eigenaar, 21 okt 2026: "schrijf elke maand 2 blogs", "Blogs in
// eigen menu"). Praktische stukken bij het seizoen, alleen in het Nederlands,
// alleen met eigen foto's. Een stuk komt hier pas bij als Nick de tekst
// heeft goedgekeurd. Nieuwste bovenaan.

export type Blok =
  | { soort: "alinea"; tekst: string }
  | { soort: "kop"; tekst: string }
  | { soort: "lijst"; regels: string[] }
  | { soort: "foto"; foto: Foto }

export type Stuk = {
  slug: string
  titel: string
  /** Voor zoekmachines en de lijst, rond 155 tekens. */
  beschrijving: string
  /** ISO-datum van publicatie. */
  datum: string
  leestijd: number
  /** De foto voor de lijst en voor delen. */
  beeld: Foto
  blokken: Blok[]
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

export const STUKKEN: Stuk[] = [
  {
    slug: "vijver-winterklaar-maken",
    titel: "Je vijver winterklaar maken in Zuid-Limburg",
    beschrijving:
      "Stoppen met voeren, pomp hoger, bladnet erop, wak openhouden. Zo komt je vijver gezond de winter door. Vijveronderhoud in Stein en omgeving.",
    datum: "2026-10-21",
    leestijd: 4,
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

export const stukMet = (slug: string) => STUKKEN.find((s) => s.slug === slug)
