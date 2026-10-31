import type { L } from "@/lib/i18n"

// The deep design intake, as data.
//
// This is the long form: the one you send someone a week before the
// first visit, not the one on `/contact`. That distinction is the whole
// reason it is a separate page — the four-step form on `/contact` is a
// two-minute front door that has to convert, and putting forty questions
// in front of everyone who picks "design" would cost enquiries. This is
// homework, and homework wants its own URL so it can be sent as a link.
//
// Everything lives here rather than in JSX because the form renders the
// same six shapes over and over — a question with a box under it, a
// picker of material swatches, a slider, a drop zone — and a component
// per section would be six hundred lines of near-identical markup that
// drift apart the first time one is edited.
//
// Section 08 is addressed to the studio, not the client. It stays on the
// same page because the page's other output is a printed sheet, and a
// survey you carry to the site with the client's answers already on it
// is the point. It is collapsed by default and says who it is for.

export type IntakeQuestion = {
  id: string
  q: L
  /** A clause the studio wants read twice. Rendered in the accent. */
  stress?: L
}

export type IntakeOption = {
  id: string
  label: L
  /** The dimension or the reason, in mono under the label. */
  note?: L
}

export type IntakeSlider = {
  id: string
  label: L
  low: L
  high: L
}

export type IntakeBlock =
  | {
      kind: "questions"
      id: string
      title?: L
      hint?: L
      /** Set off by an ember rule. For things that change the answer. */
      flag?: L
      items: IntakeQuestion[]
    }
  | {
      kind: "picker"
      id: string
      title: L
      hint?: L
      /**
       * One answer only, rather than as many as apply.
       *
       * A budget is not a set of budgets and a garden is not finished in
       * both one go and three phases. Where that is true the control has
       * to say so — picking a second option replaces the first, and the
       * group is announced as a radio group rather than a row of
       * independent toggles. Left off, a picker stays what it was: tick
       * everything that applies.
       */
      single?: boolean
      options: IntakeOption[]
    }
  | {
      kind: "photos"
      id: string
      title: L
      hint: L
      cta: L
      sub: L
      /**
       * What the tray takes. "images" is the default and is what the
       * four photograph trays want; "documents" also accepts PDFs,
       * because section 07 asks for earlier designs and drawings and
       * those arrive as PDFs far more often than as photographs.
       */
      accepts?: "images" | "documents"
      /** Questions that belong with the photographs, under the tray. */
      items?: IntakeQuestion[]
    }
  | { kind: "sliders"; id: string; sliders: IntakeSlider[]; items: IntakeQuestion[] }

export type IntakeSection = {
  id: string
  num: string
  kicker: L
  title: L
  intro?: L
  /** Marks the survey section: addressed to the studio, collapsed. */
  forStudio?: boolean
  blocks: IntakeBlock[]
}

/**
 * The six fields at the head of the sheet.
 *
 * `inputMode` and `autoComplete` are here because these six are the
 * first thing a visitor on a phone touches, and without them "Area ± m²"
 * opens a letter keyboard and nothing offers to fill in the address the
 * phone already knows. `postcode-check.tsx` has done this correctly for
 * a while; this is the same idea in the place it matters most.
 *
 * "Phone / email" deliberately gets neither `type="tel"` nor
 * `type="email"`: it accepts either, and a type that validates one would
 * reject the other. `inputMode="text"` with an email-ish autofill hint is
 * the honest middle — the browser offers, the field accepts anything.
 */
export type IntakeHeadField = {
  id: string
  label: L
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email"
  autoComplete?: string
}

export const INTAKE_HEAD: IntakeHeadField[] = [
  { id: "project", label: { en: "Project", nl: "Project" } },
  {
    id: "address",
    label: { en: "Address", nl: "Adres" },
    autoComplete: "street-address",
  },
  {
    id: "client",
    label: { en: "Client", nl: "Opdrachtgever" },
    autoComplete: "name",
  },
  {
    id: "contact",
    label: { en: "Phone / email", nl: "Telefoon / e-mail" },
    autoComplete: "email",
  },
  {
    id: "area",
    label: { en: "Area ± m²", nl: "Oppervlak ± m²" },
    inputMode: "numeric",
  },
  { id: "date", label: { en: "Date", nl: "Datum" } },
]

/** The one question the rest of the form exists to sharpen. */
export const INTAKE_HERO = {
  kicker: {
    en: "The only question that really matters",
    nl: "De enige vraag die er echt toe doet",
  },
  title: {
    en: "What do you want from this garden?",
    nl: "Wat wil je met deze tuin?",
  },
  intro: {
    en: "Describe a moment rather than a style. Where are you sitting, what are you doing, which season, which hour of the day, and who is with you? One paragraph is enough. Everything else in this form exists to sharpen this answer.",
    nl: "Beschrijf liever een moment dan een stijl. Waar zit je, wat doe je, welk seizoen, welk uur van de dag, en wie is erbij? Eén alinea is genoeg. Al het andere in dit formulier dient om dit antwoord scherper te krijgen.",
  },
  placeholder: {
    en: "For example: drinking coffee outside on a Saturday morning in May without the neighbours watching, while the children have something of their own to do…",
    nl: "Bijvoorbeeld: op een zaterdagochtend in mei buiten koffie drinken zonder dat de buren meekijken, terwijl de kinderen zelf iets te doen hebben…",
  },
} satisfies { kicker: L; title: L; intro: L; placeholder: L }

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: "photos",
    num: "01",
    kicker: { en: "Visual material", nl: "Beeldmateriaal" },
    title: {
      en: "Photographs say more than a moodboard",
      nl: "Foto's zeggen meer dan een moodboard",
    },
    intro: {
      en: "Four categories. The last is the most useful: what repels you tells us more than what you like.",
      nl: "Vier categorieën. De laatste is de belangrijkste: wat je afstoot vertelt ons meer dan wat je mooi vindt.",
    },
    blocks: [
      {
        kind: "photos",
        id: "current",
        title: { en: "As it is now", nl: "Huidige situatie" },
        hint: {
          en: "Stand in every corner and photograph towards the middle. Plus every window and door from the inside out, so we know the view from the house. Film if it moves — water, a draught, a puddle that will not drain says more in ten seconds than in four stills.",
          nl: "Ga in elke hoek staan en fotografeer naar het midden. Plus: elk raam en elke deur van binnen naar buiten, zodat we het zicht vanuit huis kennen. Film wat beweegt — water, tocht, een plas die niet wegtrekt zegt in tien seconden meer dan vier foto's.",
        },
        cta: {
          en: "Drag photographs or video here, or click to choose",
          nl: "Sleep foto's of video hierheen of klik om te kiezen",
        },
        sub: {
          en: "Corners towards the middle · the view from inside · problem spots · video welcome",
          nl: "Hoeken naar het midden · zicht vanuit binnen · probleemplekken · video mag",
        },
      },
      {
        kind: "photos",
        id: "materials",
        title: { en: "Material already on site", nl: "Materiaal dat er al is" },
        hint: {
          en: "Paving, tiles, brick pavers, kerbs, fence panels, stone in storage. Put something of a known size beside it — a tape measure, a hand, a sheet of A4 — so we can judge the format.",
          nl: "Bestrating, tegels, waaltjes, banden, schuttingdelen, stenen op voorraad. Leg er iets bij met een bekende maat — een meetlint, een hand, een A4 — dan kunnen we het formaat inschatten.",
        },
        cta: {
          en: "Photographs of material present or bought",
          nl: "Foto's van aanwezig of gekocht materiaal",
        },
        sub: {
          en: "Please include something for scale",
          nl: "Graag met een maatreferentie in beeld",
        },
      },
      {
        // What the two written questions here used to ask — "what is
        // there exactly, and how much" and "is it already paid for" —
        // and why they are gone.
        //
        // The first is answered better by the photograph than by a
        // sentence, which is what the scale reference in the hint above
        // is for; a visitor typing "ongeveer 30 m² waaltjes, roodbruin"
        // tells the studio less than one picture of them next to a tape
        // measure. The second has exactly four possible answers and was
        // costing a paragraph.
        kind: "picker",
        id: "material-status",
        single: true,
        title: { en: "Can it still be let go?", nl: "Kan er nog van worden afgezien?" },
        hint: {
          en: "This decides whether the material is a constraint or an option.",
          nl: "Dit bepaalt of het materiaal een gegeven is of een keuze.",
        },
        options: [
          {
            id: "paid",
            label: { en: "Bought and paid for", nl: "Gekocht en betaald" },
            note: { en: "It has to be used", nl: "Het moet gebruikt worden" },
          },
          {
            id: "returnable",
            label: { en: "Bought, could still go back", nl: "Gekocht, kan nog retour" },
          },
          {
            id: "free",
            label: { en: "It can go if something better fits", nl: "Mag weg als iets beter past" },
          },
          {
            id: "unknown",
            label: { en: "Not sure yet", nl: "Weet ik nog niet" },
          },
        ],
      },
      {
        kind: "photos",
        id: "attracts",
        title: { en: "What draws you in", nl: "Wat je aanspreekt" },
        hint: {
          en: "Gardens, plants, materials, atmospheres. From the internet or photographed yourself, it makes no difference. Write one line per image about what exactly attracts you — the form, the colour, the calm, the use.",
          nl: "Tuinen, planten, materialen, sferen. Van internet of zelf gefotografeerd, maakt niet uit. Schrijf er per beeld één zin bij over wat je er precies in aantrekt — de vorm, de kleur, de rust, het gebruik.",
        },
        cta: { en: "Inspiration images", nl: "Inspiratiebeelden" },
        sub: {
          en: "Preferably with a short note on why",
          nl: "Liefst met een korte notitie waarom",
        },
      },
      {
        // The written question this replaces said "the reason is more
        // usable than the image", and it was right — so the reason is
        // kept and only the typing is dropped. The hint above already
        // enumerates the answers ("the form, the colour, the calm, the
        // use"), which is the tell that this was a list pretending to be
        // an essay. More than one may be true.
        kind: "picker",
        id: "attracts-why",
        title: { en: "What draws you to them?", nl: "Wat trekt je erin aan?" },
        hint: {
          en: "The reason is more usable than the image.",
          nl: "De reden is bruikbaarder dan het beeld.",
        },
        options: [
          { id: "form", label: { en: "The form and the lines", nl: "De vorm en de lijnen" } },
          { id: "colour", label: { en: "The colour", nl: "De kleur" } },
          { id: "calm", label: { en: "The calm of it", nl: "De rust die het uitstraalt" } },
          { id: "abundance", label: { en: "The abundance", nl: "De overdaad" } },
          { id: "material", label: { en: "The materials", nl: "De materialen" } },
          { id: "planting", label: { en: "The planting", nl: "De beplanting" } },
          { id: "light", label: { en: "The light and shade", nl: "Het licht en de schaduw" } },
          { id: "use", label: { en: "How it is used", nl: "Hoe het gebruikt wordt" } },
        ],
      },
      {
        kind: "photos",
        id: "repels",
        title: { en: "What repels you", nl: "Wat je afstoot" },
        hint: {
          en: "This is the most valuable part of the whole intake. Gardens you find ugly, cold, dull or restless mark out the design more sharply than any wish can.",
          nl: "Dit is het waardevolste onderdeel van de hele intake. Tuinen die je lelijk, kil, saai of onrustig vindt bakenen het ontwerp scherper af dan welke wens dan ook.",
        },
        cta: {
          en: "Images of what you specifically do not want",
          nl: "Beelden van wat je juist níét wilt",
        },
        sub: { en: "Be impolite, it helps", nl: "Wees onbeleefd, dat helpt" },
        items: [
          {
            id: "absolute-no",
            q: {
              en: "Name three things that must absolutely not appear in this garden.",
              nl: "Noem drie dingen die absoluut niet in deze tuin mogen komen.",
            },
          },
        ],
      },
    ],
  },

  {
    id: "direction",
    num: "02",
    kicker: { en: "Direction", nl: "Richting" },
    title: {
      en: "Which atmosphere comes close?",
      nl: "Welke sfeer komt in de buurt?",
    },
    intro: {
      en: "Several may be chosen, including contradictory ones. A garden is often two atmospheres taking turns. Choose nothing at all if nothing fits.",
      nl: "Meerdere keuzes mogen, ook tegenstrijdige. Een tuin bestaat vaak uit twee sferen die elkaar afwisselen. Kies gerust ook niets als niets klopt.",
    },
    blocks: [
      {
        kind: "picker",
        id: "mood",
        title: { en: "Atmosphere", nl: "Sfeer" },
        options: [
          {
            id: "formal",
            label: { en: "Crisp and architectural", nl: "Strak en architectonisch" },
            note: { en: "straight lines", nl: "rechte lijnen" },
          },
          {
            id: "wild",
            label: { en: "Natural and rough", nl: "Natuurlijk en ruig" },
            note: { en: "loose masses", nl: "losse massa" },
          },
          {
            id: "spare",
            label: { en: "Calm and spare", nl: "Rustig en sober" },
            note: {
              en: "few species, much emptiness",
              nl: "weinig soorten, veel leegte",
            },
          },
          {
            id: "lush",
            label: { en: "Lush and romantic", nl: "Weelderig en romantisch" },
            note: { en: "much flowering", nl: "veel bloei" },
          },
          {
            id: "dry",
            label: { en: "Mediterranean and dry", nl: "Mediterraan en droog" },
            note: { en: "gravel, grey foliage", nl: "grind, grijs blad" },
          },
          {
            id: "woodland",
            label: { en: "Woodland and shaded", nl: "Bosachtig en schaduwrijk" },
            note: { en: "ferns, moss", nl: "varens, mos" },
          },
          {
            id: "productive",
            label: { en: "Productive", nl: "Productief" },
            note: { en: "kitchen garden, fruit", nl: "moestuin, fruit" },
          },
        ],
      },
      {
        kind: "picker",
        id: "planting",
        title: { en: "Planting picture", nl: "Beplantingsbeeld" },
        hint: {
          en: "This decides what the garden looks like in July, and whether it still has anything to offer in January.",
          nl: "Dit bepaalt hoe de tuin er in juli uitziet, en of hij in januari nog iets te bieden heeft.",
        },
        options: [
          {
            id: "grasses",
            label: { en: "Grasses and prairie", nl: "Grassen en prairie" },
            note: {
              en: "movement, winter silhouette",
              nl: "beweging, wintersilhouet",
            },
          },
          {
            id: "meadow",
            label: { en: "Flowering and herbal", nl: "Bloemrijk en kruidig" },
            note: { en: "changes month by month", nl: "wisselend per maand" },
          },
          {
            id: "evergreen",
            label: {
              en: "Evergreen and structural",
              nl: "Groenblijvend en structuur",
            },
            note: { en: "something in January too", nl: "ook in januari iets" },
          },
          {
            id: "shade",
            label: { en: "Ferns and shade plants", nl: "Varens en schaduwplanten" },
            note: { en: "cool and green", nl: "koel en groen" },
          },
          {
            id: "drought",
            label: { en: "Drought-tolerant", nl: "Droogteminnend" },
            note: { en: "grey foliage, little water", nl: "grijs blad, weinig water" },
          },
          {
            id: "thicket",
            label: { en: "Berrying thicket", nl: "Struweel met bes" },
            note: { en: "birds and nesting", nl: "vogels en nestgelegenheid" },
          },
        ],
      },
      {
        kind: "picker",
        id: "water",
        title: { en: "Water", nl: "Water" },
        hint: {
          en: "Water is the strongest ecological move per square metre. Even a basin of one square metre counts.",
          nl: "Water is de sterkste ecologische ingreep per vierkante meter. Ook een bak van één vierkante meter telt.",
        },
        options: [
          {
            id: "none",
            label: { en: "Rather no water", nl: "Liever geen water" },
          },
          {
            id: "pool",
            label: { en: "Natural pool", nl: "Natuurlijke poel" },
            note: {
              en: "shallow bank, no machinery",
              nl: "flauw talud, geen techniek",
            },
          },
          {
            id: "basin",
            label: { en: "Formal water basin", nl: "Formele waterbak" },
            note: { en: "crisp edge, reflecting", nl: "strakke rand, spiegelend" },
          },
          {
            id: "swale",
            label: { en: "Swale or rain garden", nl: "Wadi of regentuin" },
            note: { en: "catches rainwater", nl: "vangt hemelwater op" },
          },
          {
            id: "drinker",
            label: { en: "Just a drinking place", nl: "Alleen een drinkplaats" },
            note: { en: "small, for birds", nl: "klein, voor vogels" },
          },
        ],
      },
    ],
  },

  {
    id: "material",
    num: "03",
    kicker: { en: "Material", nl: "Materiaal" },
    title: {
      en: "What you walk on, what you sit against",
      nl: "Waar loop je op, waar zit je tegenaan",
    },
    intro: {
      en: "Select what appeals to you. Everything can still change — this gives direction, it is not an order.",
      nl: "Selecteer wat je aanspreekt. Alles kan later nog, dit is richting geven, geen bestelling.",
    },
    blocks: [
      {
        kind: "picker",
        id: "paving",
        title: { en: "Paving", nl: "Verharding" },
        hint: {
          en: "The less sealed paving, the better the garden absorbs water and the cooler it stays. Half-paving and open joints do a great deal for that.",
          nl: "Hoe minder dichte verharding, hoe beter de tuin water opneemt en hoe koeler hij blijft. Halfverharding en voegen met open ruimte doen daar veel voor.",
        },
        options: [
          {
            id: "waaltje",
            label: { en: "Fired brick paver", nl: "Gebakken waaltje" },
            note: { en: "approx. 200×50 mm", nl: "ca. 200×50 mm" },
          },
          {
            id: "dikformaat",
            label: { en: "Fired brick, thick format", nl: "Gebakken dikformaat" },
            note: { en: "approx. 210×70 mm", nl: "ca. 210×70 mm" },
          },
          {
            id: "herringbone",
            label: { en: "Brick in herringbone", nl: "Klinker in keperverband" },
            note: { en: "herringbone bond", nl: "visgraat" },
          },
          {
            id: "concrete",
            label: { en: "Concrete paver", nl: "Betonklinker" },
            note: { en: "grey, crisp", nl: "grijs, strak" },
          },
          {
            id: "ceramic",
            label: { en: "Ceramic slab", nl: "Keramische tegel" },
            note: { en: "60×60, smooth", nl: "60×60, glad" },
          },
          {
            id: "stone",
            label: { en: "Natural stone", nl: "Natuursteen" },
            note: { en: "irregular bond", nl: "onregelmatig verband" },
          },
          {
            id: "gravel",
            label: { en: "Gravel or grit", nl: "Grind of split" },
            note: { en: "water-permeable", nl: "waterdoorlatend" },
          },
          {
            id: "halfpaving",
            label: { en: "Half-paving", nl: "Halfverharding" },
            note: { en: "bound gravel", nl: "gebonden gravel" },
          },
          {
            id: "deck",
            label: { en: "Hardwood deck", nl: "Vlonder in hardhout" },
            note: { en: "warm underfoot", nl: "warm onder de voet" },
          },
          {
            id: "chips",
            label: { en: "Wood chips", nl: "Houtsnippers" },
            note: { en: "path through planting", nl: "pad door de beplanting" },
          },
          {
            id: "greenjoint",
            label: { en: "Paving with green joints", nl: "Bestrating met groene voeg" },
            note: { en: "open joints, moss", nl: "open voegen, mos" },
          },
          {
            id: "reuse",
            label: {
              en: "Reuse the existing paving",
              nl: "Bestaande verharding hergebruiken",
            },
          },
        ],
      },
      {
        kind: "picker",
        id: "edges",
        title: {
          en: "Edges and level changes",
          nl: "Randen en hoogteverschillen",
        },
        options: [
          {
            id: "corten",
            label: { en: "Corten steel", nl: "Cortenstaal" },
            note: { en: "crisp, rust brown", nl: "strak, roestbruin" },
          },
          {
            id: "hardwood",
            label: { en: "Hardwood edge", nl: "Hardhouten rand" },
            note: { en: "warm, temporary", nl: "warm, tijdelijk" },
          },
          {
            id: "brickwall",
            label: { en: "Brick wall", nl: "Gemetselde muur" },
            note: { en: "solid, you sit on it", nl: "massief, zit erop" },
          },
          {
            id: "drystone",
            label: { en: "Stacked natural stone", nl: "Gestapelde natuursteen" },
            note: { en: "cavities for animals", nl: "holtes voor dieren" },
          },
          {
            id: "kerb",
            label: { en: "Concrete kerb", nl: "Betonband" },
            note: { en: "plain and cheap", nl: "sober en goedkoop" },
          },
          {
            id: "noedge",
            label: {
              en: "Rather no visible edge",
              nl: "Liever geen zichtbare rand",
            },
            note: { en: "flowing transition", nl: "vloeiende overgang" },
          },
        ],
      },
      {
        kind: "picker",
        id: "boundary",
        title: { en: "Boundary", nl: "Erfafscheiding" },
        hint: {
          en: "A green boundary is nearly always cheaper over time than a wooden one, and it provides somewhere to nest.",
          nl: "Een groene grens is bijna altijd goedkoper op termijn dan een houten, en levert nestgelegenheid op.",
        },
        options: [
          {
            id: "fence",
            label: { en: "Wooden fence", nl: "Houten schutting" },
            note: { en: "privacy at once", nl: "directe privacy" },
          },
          {
            id: "wire",
            label: { en: "Wire with climbers", nl: "Gaas met klimplanten" },
            note: {
              en: "green wall, little depth",
              nl: "groene wand, weinig ruimte",
            },
          },
          {
            id: "hedge",
            label: { en: "Clipped hedge", nl: "Geschoren haag" },
            note: { en: "crisp and green, year round", nl: "strak en groen, jaarrond" },
          },
          {
            id: "mixed",
            label: { en: "Mixed thicket", nl: "Gemengd struweel" },
            note: {
              en: "flower, berry, nesting",
              nl: "bloei, bes, nestgelegenheid",
            },
          },
          {
            id: "keep",
            label: {
              en: "Existing boundary stays",
              nl: "Bestaande erfafscheiding blijft",
            },
          },
        ],
      },
    ],
  },

  {
    id: "use",
    num: "04",
    kicker: { en: "Use", nl: "Gebruik" },
    title: {
      en: "Who uses the garden, and for what",
      nl: "Wie de tuin gebruikt, en waarvoor",
    },
    blocks: [
      {
        kind: "picker",
        id: "functions",
        title: {
          en: "Functions that have to fit",
          nl: "Functies die er in moeten passen",
        },
        options: [
          {
            id: "dining",
            label: { en: "Eating outside", nl: "Buiten eten" },
            note: { en: "table for 6–8", nl: "tafel voor 6–8" },
          },
          {
            id: "lounging",
            label: { en: "Lounging and sun", nl: "Loungen en zonnen" },
          },
          {
            id: "fire",
            label: { en: "Outdoor kitchen or fire", nl: "Buitenkeuken of vuur" },
          },
          { id: "play", label: { en: "Room to play", nl: "Ruimte om te spelen" } },
          {
            id: "kitchengarden",
            label: { en: "Kitchen garden or greenhouse", nl: "Moestuin of kas" },
          },
          {
            id: "storage",
            label: { en: "Storage, bikes, bins", nl: "Berging, fietsen, kliko's" },
          },
          {
            id: "work",
            label: { en: "Working outside", nl: "Buiten werken" },
            note: { en: "power and shade", nl: "stroom en schaduw" },
          },
          {
            id: "wildlife",
            label: { en: "Room for wildlife", nl: "Ruimte voor dieren" },
            note: {
              en: "nest box, insect wall, brash pile",
              nl: "nestkast, insectenwand, takkenril",
            },
          },
          { id: "car", label: { en: "Car or driveway", nl: "Auto of oprit" } },
          {
            id: "lighting",
            label: { en: "Atmospheric lighting", nl: "Sfeerverlichting" },
          },
        ],
      },
      {
        // Five written questions stood here. Two of them decided
        // something in the design and are kept as ticks; three did not
        // survive their own justification.
        //
        // "Where do the bikes and bins go now" is answered by the
        // photographs in section 01 and by the "storage" tick above.
        // "Which part do you use least, and why not" is a good question
        // to ask standing in the garden and a hard one to answer in a
        // text box. Both belong at the survey, which is what section 08
        // is for.
        kind: "picker",
        id: "household",
        title: { en: "Who uses the garden", nl: "Wie de tuin gebruikt" },
        hint: {
          en: "Decisive the moment water enters the design.",
          nl: "Bepalend zodra er water in het ontwerp komt.",
        },
        options: [
          { id: "adults", label: { en: "Adults only", nl: "Alleen volwassenen" } },
          {
            id: "young",
            label: { en: "Young children", nl: "Jonge kinderen" },
            note: { en: "now or within five years", nl: "nu of binnen vijf jaar" },
          },
          { id: "older", label: { en: "Older children", nl: "Oudere kinderen" } },
          { id: "dog", label: { en: "A dog", nl: "Een hond" } },
          { id: "cat", label: { en: "A cat", nl: "Een kat" } },
          {
            id: "less-mobile",
            label: { en: "Someone less mobile", nl: "Iemand die slecht ter been is" },
            note: { en: "steps and surfaces matter", nl: "traptreden en ondergrond tellen" },
          },
          { id: "guests", label: { en: "Guests, regularly", nl: "Regelmatig gasten" } },
        ],
      },
      {
        kind: "picker",
        id: "table",
        single: true,
        title: {
          en: "At the table on a busy day",
          nl: "Aan tafel op een drukke dag",
        },
        hint: {
          en: "This sets the size of the terrace more than anything else does.",
          nl: "Dit bepaalt de maat van het terras meer dan wat ook.",
        },
        options: [
          { id: "t2", label: { en: "Two", nl: "Twee" } },
          { id: "t4", label: { en: "Three or four", nl: "Drie of vier" } },
          { id: "t6", label: { en: "Five or six", nl: "Vijf of zes" } },
          { id: "t10", label: { en: "Seven to ten", nl: "Zeven tot tien" } },
          { id: "t10plus", label: { en: "More than ten", nl: "Meer dan tien" } },
        ],
      },
    ],
  },

  {
    id: "sliders",
    num: "05",
    kicker: { en: "Sliders", nl: "Schuifregelaars" },
    title: {
      en: "Three choices that steer the design",
      nl: "Drie keuzes die het ontwerp sturen",
    },
    intro: {
      en: "Nothing here needs to be socially acceptable. An honestly low number produces a better garden than an optimistically high one.",
      nl: "Hier hoeft niets sociaal wenselijk. Een eerlijk laag getal levert een betere tuin op dan een optimistisch hoog getal.",
    },
    blocks: [
      {
        kind: "sliders",
        id: "dials",
        sliders: [
          {
            id: "maintenance",
            label: {
              en: "Maintenance you will genuinely put in",
              nl: "Onderhoud dat je er werkelijk in steekt",
            },
            low: {
              en: "Almost none, a few hours a year",
              nl: "Bijna niets, een paar uur per jaar",
            },
            high: { en: "Busy with it weekly", nl: "Wekelijks bezig" },
          },
          {
            id: "ecology",
            label: { en: "Ecological ambition", nl: "Ecologische ambitie" },
            low: {
              en: "Tidy and insect-friendly",
              nl: "Netjes en insectvriendelijk",
            },
            high: {
              en: "Maximal, even where it looks rougher",
              nl: "Maximaal, ook als het ruiger oogt",
            },
          },
          {
            id: "order",
            label: { en: "Ordered or natural", nl: "Ordelijk of natuurlijk" },
            low: {
              en: "Crisp, geometric, controllable",
              nl: "Strak, geometrisch, controleerbaar",
            },
            high: {
              en: "Loose, self-seeding, surprising",
              nl: "Los, uitzaaiend, verrassend",
            },
          },
        ],
        items: [],
      },
      {
        // Two of the three written questions here were the sliders
        // asked a second time in prose: "may planting stand through the
        // winter" is the ordered/natural slider, and "how do you feel
        // about leaf fall and insects" is the ecological-ambition
        // slider. Asking the same thing twice in two formats does not
        // produce a better answer, it produces a longer form.
        //
        // Who does the maintenance is genuinely separate — it is a fact
        // about the household, not a preference — so it stays, as one
        // tick.
        kind: "picker",
        id: "who-maintains",
        single: true,
        title: { en: "Who does the maintenance", nl: "Wie het onderhoud doet" },
        hint: {
          en: "The slider above says how much; this says by whose hands.",
          nl: "De schuif hierboven zegt hoeveel; dit zegt door wiens handen.",
        },
        options: [
          { id: "self", label: { en: "We do it ourselves", nl: "Dat doen we zelf" } },
          {
            id: "mixed",
            label: { en: "Ourselves, with help for the heavy work", nl: "Zelf, met hulp voor het zware werk" },
          },
          { id: "gardener", label: { en: "A gardener comes", nl: "Er komt een hovenier" } },
          { id: "unknown", label: { en: "Not decided yet", nl: "Nog niet besloten" } },
        ],
      },
    ],
  },

  {
    id: "frame",
    num: "06",
    kicker: { en: "Frame", nl: "Kaders" },
    title: {
      en: "Budget, planning and execution",
      nl: "Budget, planning en uitvoering",
    },
    blocks: [
      {
        kind: "questions",
        id: "frame-q",
        flag: {
          en: "Without a budget and a timeline every design is a guess. A range is enough; an exact figure is not needed.",
          nl: "Zonder budget en planning is elk ontwerp een gok. Een bandbreedte volstaat; een exact bedrag hoeft niet.",
        },
        items: [],
      },
      {
        // Budget was an empty text box, and an empty text box is what a
        // budget question usually stays. Nobody wants to be the first to
        // say a number, so the field that decides whether a design is
        // even possible is the one most often skipped. Bands ask for a
        // click instead of a confession, and the flag above already
        // promises that a range is enough.
        //
        // The bands are the studio's own, for a private garden in the
        // Netherlands, design and execution together.
        kind: "picker",
        id: "budget",
        single: true,
        title: {
          en: "Budget for design and execution together",
          nl: "Budget voor ontwerp én uitvoering samen",
        },
        options: [
          { id: "b15", label: { en: "Under €15,000", nl: "Minder dan € 15.000" } },
          { id: "b15-30", label: { en: "€15,000 – €30,000", nl: "€ 15.000 – € 30.000" } },
          { id: "b30-60", label: { en: "€30,000 – €60,000", nl: "€ 30.000 – € 60.000" } },
          { id: "b60", label: { en: "Over €60,000", nl: "Meer dan € 60.000" } },
          {
            id: "bunknown",
            label: { en: "No idea yet", nl: "Weet ik nog niet" },
            note: {
              en: "then we will work it out together",
              nl: "dan zoeken we het samen uit",
            },
          },
        ],
      },
      {
        kind: "picker",
        id: "phasing",
        single: true,
        title: { en: "All at once, or phased", nl: "In één keer, of gefaseerd" },
        options: [
          { id: "once", label: { en: "All at once", nl: "In één keer" } },
          {
            id: "phased",
            label: { en: "Phased over several years", nl: "Gefaseerd over meerdere jaren" },
          },
          { id: "open", label: { en: "Depends on the design", nl: "Hangt van het ontwerp af" } },
        ],
      },
      {
        kind: "picker",
        id: "when",
        single: true,
        title: { en: "When you want to use it", nl: "Wanneer je hem wilt gebruiken" },
        options: [
          { id: "asap", label: { en: "As soon as possible", nl: "Zo snel mogelijk" } },
          { id: "season", label: { en: "Coming season", nl: "Komend seizoen" } },
          { id: "year", label: { en: "Within a year", nl: "Binnen een jaar" } },
          { id: "later", label: { en: "No hurry", nl: "Geen haast" } },
          {
            id: "fixed",
            label: { en: "There is a fixed date", nl: "Er is een vaste datum" },
            note: {
              en: "a party, a move, a birth — say which when we speak",
              nl: "een feest, een verhuizing, een geboorte — welke hoor ik graag",
            },
          },
        ],
      },
      {
        kind: "picker",
        id: "contractor",
        single: true,
        title: { en: "Who carries it out", nl: "Wie het uitvoert" },
        options: [
          { id: "own", label: { en: "Our own landscaper", nl: "Onze vaste hovenier" } },
          { id: "self", label: { en: "We do it ourselves", nl: "Dat doen we zelf" } },
          { id: "looking", label: { en: "Still looking", nl: "Zoeken we nog" } },
          {
            id: "studio",
            label: { en: "We would like the studio to arrange it", nl: "Graag via de studio" },
          },
        ],
      },
    ],
  },

  {
    id: "existing",
    num: "07",
    kicker: { en: "What is already there", nl: "Wat er al is" },
    title: {
      en: "Existing situation and earlier plans",
      nl: "Bestaande situatie en eerdere plannen",
    },
    intro: {
      en: "Reuse is almost always cheaper and ecologically better than removing and buying new.",
      nl: "Hergebruik is vrijwel altijd goedkoper én ecologisch beter dan afvoeren en nieuw kopen.",
    },
    blocks: [
      {
        kind: "photos",
        id: "documents",
        accepts: "documents",
        title: { en: "Drawings and earlier plans", nl: "Tekeningen en eerdere plannen" },
        hint: {
          en: "Earlier designs, quotations, a planting list, a cadastral or building drawing. PDF is ideal; a photograph of a paper drawing is fine too — shoot it square on, in daylight, with all four corners in frame.",
          nl: "Eerdere ontwerpen, offertes, een beplantingslijst, een kadastrale of bouwtekening. Pdf is het handigst; een foto van een papieren tekening mag ook — recht van boven, bij daglicht, met alle vier de hoeken in beeld.",
        },
        cta: {
          en: "Drag PDFs or drawings here, or click to choose",
          nl: "Sleep pdf's of tekeningen hierheen of klik om te kiezen",
        },
        sub: {
          en: "PDF, JPG or PNG · up to 12 MB per file",
          nl: "Pdf, jpg of png · maximaal 12 MB per bestand",
        },
      },
      {
        // Seven written questions stood here — reuse, planting to keep,
        // services, water, neighbours, and two about earlier plans. They
        // were the longest stretch of typing in the form and they came
        // near the end, where people give up.
        //
        // Almost all of it is a yes/no about something that is either
        // there or not, which is a tick, not a paragraph. What a tick
        // cannot carry is the DETAIL — which tree, whose wall — and that
        // is measured at the survey anyway (section 08), standing in
        // front of it, which is the only way to get it right.
        kind: "picker",
        id: "keep",
        title: { en: "What has to stay", nl: "Wat moet blijven staan" },
        hint: {
          en: "Reuse is almost always cheaper and ecologically better than removing and buying new.",
          nl: "Hergebruik is vrijwel altijd goedkoper én ecologisch beter dan afvoeren en nieuw kopen.",
        },
        options: [
          { id: "paving", label: { en: "Existing paving", nl: "Bestaande verharding" } },
          { id: "walls", label: { en: "Walls or edges", nl: "Muren of randen" } },
          { id: "shed", label: { en: "A shed or structure", nl: "Een berging of bouwsel" } },
          {
            id: "tree",
            label: { en: "One or more trees", nl: "Een of meer bomen" },
            note: { en: "which ones, we will see on site", nl: "welke precies zien we ter plekke" },
          },
          { id: "hedge", label: { en: "A hedge", nl: "Een haag" } },
          { id: "climber", label: { en: "A climber", nl: "Een klimplant" } },
          {
            id: "sentimental",
            label: { en: "Something with sentimental value", nl: "Iets met emotionele waarde" },
          },
          { id: "fence", label: { en: "The boundary as it is", nl: "De erfafscheiding zoals hij is" } },
          { id: "nothing", label: { en: "Nothing has to stay", nl: "Niets hoeft te blijven" } },
        ],
      },
      {
        kind: "picker",
        id: "known-issues",
        title: { en: "Known problems", nl: "Bekende problemen" },
        hint: {
          en: "Tick what you have actually noticed. What you have not seen is not a gap — we measure it on site.",
          nl: "Vink aan wat je echt hebt gemerkt. Wat je niet weet is geen gemis — dat meten we ter plekke.",
        },
        options: [
          { id: "puddles", label: { en: "Puddles after rain", nl: "Plassen na regen" } },
          { id: "dry", label: { en: "Spots that dry out badly", nl: "Plekken die snel uitdrogen" } },
          { id: "height", label: { en: "Awkward changes in height", nl: "Lastige hoogteverschillen" } },
          { id: "shade", label: { en: "Too much shade", nl: "Te veel schaduw" } },
          { id: "wind", label: { en: "Wind", nl: "Wind" } },
          { id: "overlooked", label: { en: "Overlooked by neighbours", nl: "Inkijk van buren" } },
          {
            id: "services",
            label: { en: "Cables, pipes or chambers in the way", nl: "Kabels, leidingen of putten in de weg" },
          },
          {
            id: "agreements",
            label: { en: "Agreements with neighbours or the association", nl: "Afspraken met buren of de VvE" },
          },
          { id: "access", label: { en: "Hard to reach with machines", nl: "Slecht bereikbaar met materieel" } },
          { id: "none", label: { en: "None that I know of", nl: "Geen die ik ken" } },
        ],
      },
      {
        kind: "questions",
        id: "existing-q",
        items: [
          {
            // The one written question that survives this section, and
            // it is the one a list cannot hold: what somebody thought of
            // a plan they were shown. "Especially the second" is the
            // studio's own note and it is the reason this stays.
            id: "earlier-verdict",
            q: {
              en: "Anything else we should know about the drawings, or about an earlier plan — what appealed to you, and what did not?",
              nl: "Verder nog iets over die tekeningen, of over een eerder plan — wat sprak je aan, en wat niet?",
            },
            stress: { en: "Especially the second.", nl: "Vooral dat tweede." },
          },
        ],
      },
    ],
  },

  {
    id: "survey",
    num: "08",
    kicker: { en: "On site", nl: "Op locatie" },
    title: { en: "Filled in during the visit", nl: "In te vullen tijdens het bezoek" },
    intro: {
      en: "For GRØNN. As the client you can skip this part — it is here so the printed sheet carries your answers and the survey in one document.",
      nl: "Voor GRØNN. Dit deel kun je overslaan als opdrachtgever — het staat hier zodat het geprinte vel jouw antwoorden en de opname in één document draagt.",
    },
    forStudio: true,
    blocks: [
      {
        kind: "questions",
        id: "survey-q",
        flag: {
          en: "Always: one spade cut and one bucket of water. Soil type and infiltration decide the entire planting plan and cannot be guessed from photographs.",
          nl: "Altijd doen: één spadesteek en één emmer water. Grondsoort en infiltratie bepalen het hele beplantingsplan en zijn vanaf foto's niet te raden.",
        },
        items: [
          {
            id: "orientation",
            q: {
              en: "North, hours of sun per part of the day, shadow cast by buildings and trees.",
              nl: "Noordrichting, zonuren per dagdeel, slagschaduw van gebouwen en bomen.",
            },
          },
          {
            id: "dimensions",
            q: {
              en: "Boundaries, main dimensions, threshold levels and every change in height.",
              nl: "Erfgrenzen, hoofdmaten, dorpelpeilen en alle hoogteverschillen.",
            },
          },
          {
            id: "soil",
            q: {
              en: "Trial pit: soil type, layering, compaction, rubble, root picture, smell.",
              nl: "Profielkuil: grondsoort, laagopbouw, verdichting, puin, wortelbeeld, geur.",
            },
          },
          {
            id: "infiltration",
            q: {
              en: "Infiltration test: how fast does a bucket of water drain away?",
              nl: "Infiltratietest: hoe snel zakt een emmer water weg?",
            },
          },
          {
            id: "groundwater",
            q: {
              en: "Groundwater, seepage, rainwater discharge and connection to sewer or garden.",
              nl: "Grondwater, kwel, hemelwaterafvoer en aansluiting op riool of tuin.",
            },
          },
          {
            id: "structures",
            q: {
              en: "Walls and retaining walls: are they plumb, is there a footing, what is the remaining life?",
              nl: "Muren en keerwanden: staan ze recht, is er fundering, restlevensduur?",
            },
          },
          {
            id: "trees",
            q: {
              en: "Trees: species, trunk diameter, crown projection, condition, felling permit, root zones.",
              nl: "Bomen: soort, stamdiameter, kroonprojectie, conditie, kapvergunning, wortelzones.",
            },
          },
          {
            id: "nature",
            q: {
              en: "Nature value: nests, cavities, flowering ivy, rough ground, dead wood.",
              nl: "Natuurwaarde: nesten, holtes, bloeiende klimop, ruigte, dood hout.",
            },
            stress: {
              en: "Nature Conservation Act before anything is removed.",
              nl: "Wet natuurbescherming vóór er iets weg gaat.",
            },
          },
          {
            id: "invasive",
            q: {
              en: "Invasive species: Japanese knotweed, bamboo, horsetail.",
              nl: "Invasieve exoten: Japanse duizendknoop, bamboe, heermoes.",
            },
          },
          {
            id: "access",
            q: {
              en: "Access for delivery and removal: clear width, wheelbarrow, mini digger, crane.",
              nl: "Bereikbaarheid voor aan- en afvoer: doorgangsbreedte, kruiwagen, minigraver, kraan.",
            },
          },
          {
            id: "cables",
            q: {
              en: "Cables and pipes. Utility search needed? Nesting season runs mid-March to mid-July.",
              nl: "Kabels en leidingen. KLIC-melding nodig? Broedseizoen half maart tot half juli.",
            },
          },
          {
            id: "open",
            q: {
              en: "Open points, who supplies what, and by when.",
              nl: "Openstaande punten, wie levert wat aan, en per wanneer.",
            },
          },
        ],
      },
    ],
  },
]

/** Every question id in the form, for the export and the stored draft. */
export function intakeQuestions(): { id: string; label: L }[] {
  const out: { id: string; label: L }[] = []
  for (const section of INTAKE_SECTIONS) {
    for (const block of section.blocks) {
      if (block.kind === "picker") continue
      for (const item of block.items ?? []) out.push({ id: item.id, label: item.q })
    }
  }
  return out
}

export const INTAKE_SLIDER_DEFAULT = 3
