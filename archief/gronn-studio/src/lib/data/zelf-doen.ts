import type { L } from "@/lib/i18n"

// Drie dingen die een huiseigenaar in het najaar zelf kan doen, als korte
// how-to's (naar Langenegger Naturgärten; eigenaar, 2 okt 2026: "nee
// precies dat"). De tekst komt uit Nicks eigen Instagram-kennisposts van
// 30 sep en 10 okt 2026 (social/twee-weken/planning.md) en de story
// "Laat het blad liggen in de border"; niets erbij verzonnen.
export type ZelfDoen = { id: string; wanneer: L; titel: L; tekst: L }

export const ZELF_DOEN: ZelfDoen[] = [
  {
    id: "bladnet",
    wanneer: { nl: "Vóór half september", en: "Before mid-September" },
    titel: { nl: "Een bladnet werkt alleen op tijd.", en: "A leaf net only works in time." },
    tekst: {
      nl: "Half september begint de bladval, half november ligt het blad al op de bodem. Leg het net strak óver het water, niet erin: een net dat in de vijver hangt vangt niets. Het vangt wat van boven valt, niet wat er zijwaarts in waait.",
      en: "Leaves start falling in mid-September; by mid-November they are on the bottom. Stretch the net tight over the water, not in it: a net hanging in the pond catches nothing. It catches what falls from above, not what blows in from the side.",
    },
  },
  {
    id: "slib",
    wanneer: { nl: "September of oktober", en: "September or October" },
    titel: { nl: "Haal niet al het slib weg.", en: "Don't remove all the sludge." },
    tekst: {
      nl: "Bij een najaarsbeurt haal ik bewust maar 60 tot 70 % weg. Zuig je alles weg, dan gooi je de biologie weg. Spoel filtermedia in vijverwater, nooit onder de kraan, en het slib gaat de border in. Onder 10 °C zijn de vissen in winterrust.",
      en: "In an autumn service I deliberately remove only 60 to 70%. Vacuum out everything and you throw away the biology. Rinse filter media in pond water, never under the tap, and the sludge goes into the border. Below 10 °C the fish are in winter rest.",
    },
  },
  {
    id: "blad",
    wanneer: { nl: "Oktober", en: "October" },
    titel: { nl: "Laat het blad liggen in de border.", en: "Leave the leaves in the border." },
    tekst: {
      nl: "Het beschermt de bodem tegen de vorst en is voer en schuilplek voor wat er in je tuin leeft. Alleen uit de vijver moet het eruit.",
      en: "They protect the soil from frost and give food and shelter to what lives in your garden. Only the pond needs them out.",
    },
  },
]
