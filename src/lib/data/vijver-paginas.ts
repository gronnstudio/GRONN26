import type { L } from "@/lib/i18n"
import { FOTOS, type Foto } from "@/lib/data/vijverrenovatie"
import { SFEER } from "@/lib/data/sfeer"

// Eén pagina per vijverdienst (online strategie, 24 nov 2026): wie zoekt op
// "vijver aanleggen", "vijver renoveren" of "waterval vijver" vond tot nu toe
// alleen /vijvers, met als titel "Vijvers". Drie pagina's onder /vijvers, uit
// één sjabloon (src/app/vijvers/[dienst]/page.tsx). Alleen wat al op de site
// staat: prijzen uit pricing.ts en het menu, werkwijze uit de journaalstukken.

export type VijverPagina = {
  slug: string
  /** Paginatitel voor Google: dienst + regio. */
  seoTitel: string
  beschrijving: string
  label: L
  titel: L
  zin: L
  foto: Foto
  /** Wat ik doe: een paar alinea's. */
  tekst: L[]
  /** Kort: wat erbij hoort. */
  lijst: L[]
  feiten: { term: L; waarde: L }[]
  vragen: { vraag: L; antwoord: L }[]
  /** Verder lezen: journaal, project, andere vijverpagina's. */
  links: { href: string; naam: L }[]
}

const WERKGEBIED = { term: { nl: "Werkgebied", en: "Area" }, waarde: { nl: "Stein en omgeving, tot ongeveer 30 km", en: "Stein and surroundings, up to about 30 km" } }
const WIE = { term: { nl: "Wie", en: "Who" }, waarde: { nl: "Nick, van eerste gesprek tot oplevering", en: "Nick, from first talk to handover" } }

export const VIJVER_PAGINAS: VijverPagina[] = [
  {
    slug: "aanleggen",
    seoTitel: "Vijver aanleggen in Stein en omgeving",
    beschrijving:
      "Een vijver laten aanleggen in Stein en omgeving: natuurvijver, vijver met vissen of zwemvijver. Eén plan, een vaste prijs vooraf. Vanaf € 2.500.",
    label: { nl: "Vijver aanleggen", en: "Building a pond" },
    titel: { nl: "Een vijver laten aanleggen.", en: "Having a pond built." },
    zin: {
      nl: "Ik leg nieuwe vijvers aan voor huiseigenaren in Stein en omgeving: van natuurvijver tot vijver met vissen, met een vaste prijs vooraf.",
      en: "I build new ponds for homeowners in Stein and the surrounding area: from wildlife pond to fish pond, with a fixed price up front.",
    },
    foto: SFEER.waterval,
    tekst: [
      {
        nl: "Een vijver is het mooiste wat je in een tuin kunt maken. Binnen een paar weken komt er leven op af: libellen, kikkers, vogels die komen drinken. Of het een heldere vijver wordt of een groene bak, beslis je vóór de schop de grond in gaat.",
        en: "A pond is the best thing you can make in a garden. Within weeks, life arrives: dragonflies, frogs, birds coming to drink. Whether it becomes a clear pond or a green tub is decided before the spade goes in.",
      },
      {
        nl: "Daarom begin ik bij de plek: hoeveel zon, waar de bomen staan, waar het regenwater heen loopt en waar je de vijver vanuit huis ziet. Daarna pas de diepte, de folie, het filter en de rand. Je krijgt één plan en één prijs, en je spreekt de hele klus met mij.",
        en: "That is why I start with the place: how much sun, where the trees are, where the rainwater runs and where you see the pond from the house. Only then the depth, the liner, the filter and the edge. You get one plan and one price, and you deal with me for the whole job.",
      },
    ],
    lijst: [
      { nl: "De plek kiezen: zon, bomen, afwatering", en: "Choosing the spot: sun, trees, drainage" },
      { nl: "Diepte op maat: met vissen minstens 80 cm tot een meter", en: "Depth to suit: at least 80 cm to a metre with fish" },
      { nl: "EPDM-folie met beschermvlies eronder", en: "EPDM liner with protective fleece underneath" },
      { nl: "Filter en pomp waar nodig, op een buitenstopcontact met aardlekschakelaar", en: "Filter and pump where needed, on an outdoor socket with RCD" },
      { nl: "Een flauwe rand met keien, grind en oeverplanten", en: "A gentle edge with boulders, gravel and marginal plants" },
      { nl: "KLIC-melding vooraf, bij elke klus", en: "A KLIC cable check beforehand, on every job" },
    ],
    feiten: [
      { term: { nl: "Prijs", en: "Price" }, waarde: { nl: "Vanaf € 2.500, incl. btw", en: "From € 2,500, incl. VAT" } },
      WERKGEBIED,
      WIE,
      { term: { nl: "Eerste stap", en: "First step" }, waarde: { nl: "Stuur een foto van de plek", en: "Send a photo of the spot" } },
    ],
    vragen: [
      {
        vraag: { nl: "Wat kost een vijver laten aanleggen?", en: "What does having a pond built cost?" },
        antwoord: {
          nl: "Een nieuwe vijver begint bij € 2.500 inclusief btw. De prijs hangt af van de grootte, de diepte en of er een filter en een waterval bij komen. Na een foto of een bezoek krijg je een vaste prijs, voordat er iets gebeurt.",
          en: "A new pond starts at € 2,500 including VAT. The price depends on size, depth and whether a filter and a waterfall are added. After a photo or a visit you get a fixed price, before anything happens.",
        },
      },
      {
        vraag: { nl: "Heeft een vijver een filter nodig?", en: "Does a pond need a filter?" },
        antwoord: {
          nl: "Met vissen wel: vissen geven voeding aan algen. Een natuurvijver zonder vissen en met genoeg planten kan zonder filter helder blijven, als hij groot genoeg is.",
          en: "With fish, yes: fish feed the algae. A wildlife pond without fish and with enough plants can stay clear without a filter, if it is big enough.",
        },
      },
      {
        vraag: { nl: "Leg je ook zwemvijvers aan?", en: "Do you build swimming ponds too?" },
        antwoord: {
          nl: "Ja, een zwemvijver of natuurzwembad kan, eventueel samen met een collega die daarin gespecialiseerd is. Je houdt één aanspreekpunt: mij. Stuur een foto van je tuin, dan bekijken we wat er past.",
          en: "Yes, a swimming pond or natural pool is possible, if needed together with a colleague who specialises in it. You keep one point of contact: me. Send a photo of your garden and we will look at what fits.",
        },
      },
      {
        vraag: { nl: "Waar laat je de grond?", en: "Where does the soil go?" },
        antwoord: {
          nl: "Een vijver van een paar kuub geeft een paar kuub grond. We spreken vooraf af waar die heen gaat, bijvoorbeeld in een verhoogde border, of dat ik hem afvoer.",
          en: "A pond of a few cubic metres gives a few cubic metres of soil. We agree beforehand where it goes, for example into a raised border, or whether I take it away.",
        },
      },
    ],
    links: [
      { href: "/journaal/vijver-aanleggen-waar-begin-je", naam: { nl: "Een vijver aanleggen: waar begin je?", en: "Building a pond: where do you start?" } },
      { href: "/journaal/inheemse-waterplanten", naam: { nl: "Inheemse waterplanten", en: "Native water plants" } },
      { href: "/vijvers/waterval-en-beekloop", naam: { nl: "Een waterval of beekloop erbij", en: "Adding a waterfall or stream" } },
      { href: "/werk/vijverrenovatie", naam: { nl: "Project: vijverrenovatie in Elsloo", en: "Project: pond renovation in Elsloo" } },
    ],
  },
  {
    slug: "renoveren-en-onderhoud",
    seoTitel: "Vijver renoveren en onderhouden in Stein",
    beschrijving:
      "Groen water, lek of een filter dat niet werkt? Vijverrenovatie en vijveronderhoud in Stein en omgeving. Doorlichting € 195, onderhoud vanaf € 45 p/m.",
    label: { nl: "Renoveren en onderhoud", en: "Renovation and care" },
    titel: { nl: "Je vijver renoveren of onderhouden.", en: "Renovating or caring for your pond." },
    zin: {
      nl: "Voor een vijver die groen is, lekt of stinkt, en voor wie zijn vijver gezond wil houden: renovatie, schoonmaken en vast onderhoud in Stein en omgeving.",
      en: "For a pond that is green, leaks or smells, and for anyone who wants to keep their pond healthy: renovation, cleaning and regular care in Stein and the surrounding area.",
    },
    foto: FOTOS.F01 as Foto,
    tekst: [
      {
        nl: "Groen water is geen ziekte, het is een teken: te veel voeding, te weinig planten of een filter dat het niet bijhoudt. Ik meet eerst, met druppeltests in plaats van strips, en kijk naar de hele vijver: water, techniek en beplanting. Dan weet je waarom het misgaat en wat het kost om het op te lossen.",
        en: "Green water is not a disease, it is a sign: too many nutrients, too few plants or a filter that can’t keep up. I measure first, with drop tests rather than strips, and look at the whole pond: water, technology and planting. Then you know why it goes wrong and what it costs to fix.",
      },
      {
        nl: "Soms is een najaarsbeurt genoeg. Soms moet de vijver opnieuw: nieuwe folie, een ander filter, een betere rand. Zo ging het bij de vijverrenovatie in Elsloo: twee vijvers, een waterval en een beekloop, nu één systeem. Daarna houdt een onderhoudsabonnement hem in balans, met twee bezoeken per jaar.",
        en: "Sometimes an autumn service is enough. Sometimes the pond has to be redone: new liner, another filter, a better edge. That is how the pond renovation in Elsloo went: two ponds, a waterfall and a stream, now one system. After that, a maintenance plan keeps it in balance, with two visits a year.",
      },
    ],
    lijst: [
      { nl: "Vijverdoorlichting: water gemeten, verslag met drie scenario's (€ 195)", en: "Pond survey: water measured, report with three scenarios (€ 195)" },
      { nl: "Vijverrenovatie: folie, filter, rand en beplanting opnieuw (vanaf € 4.500)", en: "Pond renovation: liner, filter, edge and planting redone (from € 4,500)" },
      { nl: "Najaarsbeurt: slib eruit, filter gespoeld in vijverwater (vanaf € 250)", en: "Autumn service: silt out, filter rinsed in pond water (from € 250)" },
      { nl: "Bladnet over de vijver, in december weer eraf (vanaf € 125)", en: "Leaf net over the pond, off again in December (from € 125)" },
      { nl: "Winterklaar maken: techniek eruit, ijsvrijhouder erin (vanaf € 95)", en: "Winterising: technology out, ice-free keeper in (from € 95)" },
      { nl: "Onderhoudsabonnement: twee bezoeken per jaar (vanaf € 45 per maand)", en: "Maintenance plan: two visits a year (from € 45 a month)" },
    ],
    feiten: [
      { term: { nl: "Renovatie", en: "Renovation" }, waarde: { nl: "Vanaf € 4.500, incl. btw", en: "From € 4,500, incl. VAT" } },
      { term: { nl: "Onderhoud", en: "Care" }, waarde: { nl: "Vanaf € 45 per maand", en: "From € 45 a month" } },
      WERKGEBIED,
      WIE,
    ],
    vragen: [
      {
        vraag: { nl: "Mijn vijver is groen. Wat nu?", en: "My pond is green. What now?" },
        antwoord: {
          nl: "Niet meteen een algenmiddel kopen. Alg is het symptoom van te veel voeding. Met een doorlichting meet ik wat er in het water zit en waar het vandaan komt, en krijg je drie scenario's: zelf doen, gedeeltelijk of volledig.",
          en: "Don’t reach for an algae product straight away. Algae are the symptom of too many nutrients. With a survey I measure what is in the water and where it comes from, and you get three scenarios: do it yourself, partly, or fully.",
        },
      },
      {
        vraag: { nl: "Hoe vaak moet een vijver schoongemaakt worden?", en: "How often does a pond need cleaning?" },
        antwoord: {
          nl: "Eén keer per jaar, in het najaar, is voor de meeste vijvers genoeg. Ik haal bewust 60 tot 70 procent van het slib weg: wie alles wegzuigt, gooit de biologie weg en heeft volgend jaar meer algen.",
          en: "Once a year, in autumn, is enough for most ponds. I deliberately remove 60 to 70 percent of the silt: take it all and you throw away the biology and get more algae next year.",
        },
      },
      {
        vraag: { nl: "Kan ik alleen hulp met mijn vijver krijgen?", en: "Can I get help with just my pond?" },
        antwoord: {
          nl: "Ja. Elke vijverdienst kun je los vragen, ook als ik de vijver niet zelf heb aangelegd.",
          en: "Yes. You can ask for each pond service on its own, also if I didn’t build the pond.",
        },
      },
    ],
    links: [
      { href: "/werk/vijverrenovatie", naam: { nl: "Project: vijverrenovatie in Elsloo", en: "Project: pond renovation in Elsloo" } },
      { href: "/journaal/groen-water-in-het-voorjaar", naam: { nl: "Groen water in het voorjaar", en: "Green water in spring" } },
      { href: "/journaal/vijver-winterklaar-maken", naam: { nl: "Je vijver winterklaar maken", en: "Winterising your pond" } },
      { href: "/journaal/bladnet-vijver", naam: { nl: "Een bladnet op je vijver", en: "A leaf net on your pond" } },
      { href: "/vijvers#vijver-diensten", naam: { nl: "Alle vijverdiensten en prijzen", en: "All pond services and prices" } },
    ],
  },
  {
    slug: "waterval-en-beekloop",
    seoTitel: "Waterval of beekloop bij je vijver",
    beschrijving:
      "Een waterval of beekloop bij je vijver in Stein en omgeving. Pomp, filter bovenaan, leidingen, folie en natuursteen: stromend water dat helder blijft.",
    label: { nl: "Waterval en beekloop", en: "Waterfall and stream" },
    titel: { nl: "Een waterval of beekloop bij je vijver.", en: "A waterfall or stream by your pond." },
    zin: {
      nl: "Stromend water geeft geluid, zuurstof en beweging. Ik leg watervallen en beeklopen aan bij nieuwe en bestaande vijvers in Stein en omgeving.",
      en: "Moving water brings sound, oxygen and movement. I build waterfalls and streams for new and existing ponds in Stein and the surrounding area.",
    },
    foto: FOTOS.F10 as Foto,
    tekst: [
      {
        nl: "Een waterval of beekloop is meer dan mooi. Als het water eerst door het filter gaat en dan de beek af stroomt, werkt de beek zelf als extra filter: op de stenen groeien bacteriën die het water verder zuiveren. Zo krijg je helder water met minder schoonmaakwerk.",
        en: "A waterfall or stream is more than pretty. When the water passes the filter first and then runs down the stream, the stream itself works as an extra filter: bacteria on the stones clean the water further. That gives clear water with less cleaning.",
      },
      {
        nl: "Het is ook het deel van een vijver waar het vaakst iets misgaat. Het meeste water verdwijnt niet door een gat, maar over een rand die net te laag ligt. Daarom let ik op de pomp, de leidingen, de volgorde van de folie en de hoogte van elke rand.",
        en: "It is also the part of a pond where things most often go wrong. Most water is not lost through a hole, but over an edge that sits just too low. That is why I watch the pump, the pipes, the order of the liner and the height of every edge.",
      },
    ],
    lijst: [
      { nl: "Een pomp die rustig draait, geregeld met een kraan", en: "A pump that runs calmly, regulated with a valve" },
      { nl: "Het filter bovenaan, zodat schoon water naar beneden stroomt", en: "The filter at the top, so clean water flows down" },
      { nl: "Drukvaste leidingen met kogelkranen, in een sleuf", en: "Pressure-rated pipes with ball valves, in a trench" },
      { nl: "Folie met overlap als dakpannen, randen hoger dan het water komt", en: "Liner overlapping like roof tiles, edges higher than the water ever reaches" },
      { nl: "Grote platte stenen voor de val, keien en grind voor de rest", en: "Large flat stones for the fall, boulders and gravel for the rest" },
      { nl: "Ruimte in de vijver voor het water dat terugloopt als de pomp stopt", en: "Room in the pond for the water that runs back when the pump stops" },
    ],
    feiten: [
      { term: { nl: "Prijs", en: "Price" }, waarde: { nl: "Vaste prijs na een foto of bezoek", en: "Fixed price after a photo or visit" } },
      WERKGEBIED,
      WIE,
      { term: { nl: "Gemaakt", en: "Built" }, waarde: { nl: "Waterval en beekloop in Elsloo", en: "Waterfall and stream in Elsloo" } },
    ],
    vragen: [
      {
        vraag: { nl: "Kan er een waterval bij mijn bestaande vijver?", en: "Can a waterfall be added to my existing pond?" },
        antwoord: {
          nl: "Meestal wel. Ik kijk of de vijver het terugstromende water kan opvangen, waar het filter kan staan en waar de stroom vandaan komt. Stuur een foto, dan zeg ik wat er kan.",
          en: "Usually, yes. I check whether the pond can take the water that flows back, where the filter can go and where the power comes from. Send a photo and I will tell you what is possible.",
        },
      },
      {
        vraag: { nl: "Hoeveel stroom kost een pomp?", en: "How much power does a pump use?" },
        antwoord: {
          nl: "Dat hangt af van de pomp en hoe hoog het water moet. Ik kies liever een pomp die iets meer kan en rustig draait, dan een die op zijn tenen loopt: hij gaat dag en nacht mee.",
          en: "That depends on the pump and how high the water has to go. I would rather choose a pump that can do a bit more and runs calmly than one that runs flat out: it works day and night.",
        },
      },
    ],
    links: [
      { href: "/journaal/beekloop-of-waterval", naam: { nl: "Een beekloop of waterval: wat komt erbij kijken", en: "A stream or waterfall: what is involved" } },
      { href: "/werk/vijverrenovatie", naam: { nl: "Project: vijverrenovatie in Elsloo, met waterval en beekloop", en: "Project: pond renovation in Elsloo, with waterfall and stream" } },
      { href: "/vijvers/aanleggen", naam: { nl: "Een nieuwe vijver aanleggen", en: "Building a new pond" } },
    ],
  },
]

export const vijverPagina = (slug: string) => VIJVER_PAGINAS.find((p) => p.slug === slug)
