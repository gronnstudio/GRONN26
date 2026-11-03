import type { L } from "@/lib/i18n"

// Ideas that have not been built, kept where the built things are.
//
// The stack page says what this site runs on and how it got there. This
// is the other half of an honest answer: what somebody looked at the
// site and said was missing, before anybody agreed with them.
//
// It is published rather than filed because a list of intentions that
// only exists in private is a list nobody is accountable to. The same
// reason the Evolution section carries the rounds that went wrong.
//
// TWO RULES FOR THIS FILE.
//
// One: nothing here is a commitment. A concept is a proposal with a date
// and a source on it, and "we have not decided" is a legitimate state to
// publish.
//
// Two: a claim about this site gets CHECKED before it is repeated here.
// The teardown below was read against the codebase, and where its
// premise did not survive that reading it says so in `verdict` — in
// place, next to the claim, not in a footnote. Republishing somebody's
// wrong description of your own site, on your own site, is a strange way
// to be transparent.

export type ConceptTier = 1 | 2 | 3

export type ConceptPick = {
  name: string
  author: string
  href: string
  why: L
  /** The one recommended out of its group. */
  lead?: boolean
}

export type Concept = {
  id: string
  tier: ConceptTier
  title: L
  /** Which part of the site this is about. */
  where: L
  /** What is there today. */
  now: L
  /** What the teardown says is missing. */
  gap: L
  /**
   * What checking the codebase actually found.
   *
   * Present only where the reading changed the finding. Absent means the
   * premise held.
   */
  verdict?: L
  picks: ConceptPick[]
}

export const CONCEPT_SOURCE = {
  what: {
    en: "A UI teardown of gronn.studio against the 21st.dev component catalogue",
    nl: "Een UI-teardown van gronn.studio tegen de componentcatalogus van 21st.dev",
  },
  when: "2026-09-04",
  intro: {
    en: "Thirteen components, picked on one question: does this close a gap the site has today? Read against the codebase before it was published here — one of the three top findings did not survive that reading, and says so where it stands.",
    nl: "Dertien componenten, gekozen op één vraag: dicht dit een gat dat de site nú heeft? Nagelezen tegen de code voordat het hier kwam te staan — één van de drie hoofdbevindingen hield geen stand, en dat staat erbij.",
  },
} satisfies { what: L; when: string; intro: L }

export const CONCEPTS: Concept[] = [
  {
    id: "transformation",
    tier: 1,
    title: { en: "Before and after, draggable", nl: "Voor en na, sleepbaar" },
    where: { en: "Project pages", nl: "Projectpagina's" },
    now: {
      en: "Each project has one atmospheric photograph and a written description of its phases.",
      nl: "Elk project heeft één sfeerfoto en een geschreven beschrijving van de fasen.",
    },
    gap: {
      en: "No visual proof of transformation anywhere — the very thing somebody with a cloudy pond decides to call about.",
      nl: "Nergens visueel bewijs van transformatie — precies het ding waarop iemand met een troebele vijver besluit te bellen.",
    },
    verdict: {
      en: "This one is wrong as stated, and checking it was worth more than acting on it. The slider already exists: `before-after.tsx`, draggable, keyboard-operable, rendered on case-study pages. The real gap is content, not component — one project of six has a before/after pair filled in, because the rest are still placeholder photography. No package would have fixed that.",
      nl: "Deze klopt niet zoals hij er staat, en hem nakijken leverde meer op dan hem uitvoeren. De slider bestáát: `before-after.tsx`, sleepbaar, met toetsenbordbediening, en hij staat op de projectpagina's. Het echte gat is inhoud en geen component — één van de zes projecten heeft een voor/na-paar, de rest is nog plaatshouderfotografie. Geen enkel pakket had dat opgelost.",
    },
    picks: [
      {
        name: "Compare Reveal",
        author: "@rmahammad",
        href: "https://21st.dev/@rmahammad/components/compare-reveal",
        lead: true,
        why: {
          en: "Drag handle, keyboard control, an intro sweep that explains itself. Double-click recentres it.",
          nl: "Sleepgreep, toetsenbordbediening, een intro-sweep die zichzelf uitlegt. Dubbelklik zet hem terug in het midden.",
        },
      },
      {
        name: "Image Swiper",
        author: "@jahed",
        href: "https://21st.dev/@jahed/components/image-swiper",
        why: {
          en: "Photographs stacked as cards. Strong for the eight build phases of a project — one stack instead of a list.",
          nl: "Foto's als een stapel kaarten. Sterk voor de acht bouwfasen van een project — één stapel in plaats van een lijst.",
        },
      },
      {
        name: "Horizontal Feature Reveal",
        author: "@hyperiux",
        href: "https://21st.dev/@hyperiux/components/horizontal-feature-reveal",
        why: {
          en: "Vertical scroll drives a horizontal track with number, title and parallax image. Has a mobile fallback stack.",
          nl: "Verticaal scrollen stuurt een horizontaal spoor met nummer, titel en parallaxbeeld. Heeft een mobiele terugval.",
        },
      },
    ],
  },
  {
    id: "intake",
    tier: 1,
    title: {
      en: "An enquiry as a conversation, not a button",
      nl: "Een aanvraag als gesprek, niet als knop",
    },
    where: { en: "Start a project", nl: "Start een project" },
    now: {
      en: "One call to action leading to a form. All or nothing.",
      nl: "Eén oproep die naar een formulier leidt. Alles of niets.",
    },
    gap: {
      en: "No qualification: you learn at the intake conversation whether this is a balcony pond or half a hectare.",
      nl: "Geen kwalificatie: je hoort pas bij het intakegesprek of het om een balkonvijver of een halve hectare gaat.",
    },
    verdict: {
      en: "Half built since. The short form on /contact is four steps and asks what kind of project first; the long design intake behind the dashboard was cut from twenty-four written questions to two, with sixty-seven things to click instead. What is still true is the middle: nothing qualifies a first-time visitor before they choose between the two.",
      nl: "Inmiddels half gebouwd. Het korte formulier op /contact telt vier stappen en vraagt eerst wat voor project het is; de lange ontwerp-intake achter het dashboard ging van vierentwintig open vragen naar twee, met zevenenzestig dingen om aan te klikken. Wat wél blijft staan is het midden: niets kwalificeert een eerste bezoeker vóór hij tussen die twee kiest.",
    },
    picks: [
      {
        name: "Multi-step Wizard",
        author: "@dhileepkumargm",
        href: "https://21st.dev/@dhileepkumargm/components/multi-step-wizard",
        lead: true,
        why: {
          en: "Step indicator, validation per step. Four steps cover it: kind of space, area, water yes/no, budget range and postcode.",
          nl: "Stappenindicator, validatie per stap. Vier stappen dekken het: soort ruimte, oppervlakte, water ja/nee, budgetrange en postcode.",
        },
      },
      {
        name: "Contact Card",
        author: "@efferd",
        href: "https://21st.dev/@efferd/components/contact-card",
        why: {
          en: "Puts WhatsApp and email visually level with the form — which is how the studio actually prefers to be reached.",
          nl: "Zet WhatsApp en mail visueel op gelijke hoogte met het formulier — precies hoe de studio zelf bereikt wil worden.",
        },
      },
    ],
  },
  {
    id: "gallery",
    tier: 1,
    title: { en: "A gallery you can open", nl: "Een galerij die je kunt openen" },
    where: { en: "Selected projects", nl: "Geselecteerde projecten" },
    now: {
      en: "Six project cards with location, status and a sentence. Tidy, but the photographs stay small.",
      nl: "Zes projectkaarten met locatie, status en één zin. Netjes, maar de foto's blijven klein.",
    },
    gap: {
      en: "Planting detail, water line, biofilter — things you have to see close up, and nowhere can you.",
      nl: "Beplantingsdetail, waterlijn, biofilter — dingen die je van dichtbij moet zien, en dat kan nergens.",
    },
    picks: [
      {
        name: "Shared Element Gallery",
        author: "@jahed",
        href: "https://21st.dev/@jahed/components/shared-element-gallery",
        lead: true,
        why: {
          en: "Masonry that keeps the real aspect ratio. Planting photographs are rarely 16:9, and this is the only pick that respects that.",
          nl: "Masonry die de echte beeldverhouding behoudt. Beplantingsfoto's zijn zelden 16:9, en dit is de enige keuze die dat respecteert.",
        },
      },
      {
        name: "Focus Cards",
        author: "@manuarora700",
        href: "https://21st.dev/@manuarora700/components/focus-cards",
        why: {
          en: "Hover fades the other cards. A quiet effect that makes the grid read as a portfolio rather than a list.",
          nl: "Hover vervaagt de andere kaarten. Een rustig effect dat het raster als portfolio laat lezen in plaats van als lijst.",
        },
      },
    ],
  },
  {
    id: "faq",
    tier: 2,
    title: { en: "The FAQ that does not exist yet", nl: "De FAQ die er nog niet is" },
    where: { en: "New — under Services", nl: "Nieuw — onder Diensten" },
    now: {
      en: "Nine sections, no FAQ. Every piece of knowledge sits inside running prose.",
      nl: "Negen secties, geen FAQ. Alle kennis zit in lopende tekst.",
    },
    gap: {
      en: "\"Why is my pond cloudy\", \"what does a natural pond cost\", \"does it need a pump\" — those are the searches, and question-and-answer is the format that ranks for them.",
      nl: "\"Waarom is mijn vijver troebel\", \"wat kost een natuurvijver\", \"moet er een pomp in\" — dat zijn de zoekopdrachten, en vraag-en-antwoord is het formaat dat daarop rankt.",
    },
    verdict: {
      en: "Checked and true: no FAQ anywhere in the codebase. Of everything on this page, this is the one that is purely additive — it breaks nothing and competes with nothing.",
      nl: "Nagekeken en waar: nergens een FAQ in de code. Van alles op deze pagina is dit de enige die puur iets toevoegt — hij breekt niets en concurreert met niets.",
    },
    picks: [
      {
        name: "FAQ with Categories",
        author: "@kokonutd",
        href: "https://21st.dev/@kokonutd/components/faq-with-categories",
        lead: true,
        why: {
          en: "Accordion on shadcn primitives, with category badges matching the services. A Radix accordion also means the semantics are right.",
          nl: "Accordeon op shadcn-primitieven, met categoriebadges die samenvallen met de diensten. Een Radix-accordeon betekent ook dat de semantiek klopt.",
        },
      },
    ],
  },
  {
    id: "method",
    tier: 2,
    title: { en: "The method as movement", nl: "De methode als beweging" },
    where: { en: "Approach — the six steps", nl: "Aanpak — de zes stappen" },
    now: {
      en: "Six numbered steps as static columns.",
      nl: "Zes genummerde stappen als statische kolommen.",
    },
    gap: {
      en: "The content IS a sequence, so the numbering has earned it. A timeline that moves turns a list into a process.",
      nl: "De inhoud ís een volgorde, dus de nummering verdient het. Een tijdlijn die meebeweegt maakt van een opsomming een proces.",
    },
    picks: [
      {
        name: "Process Timeline",
        author: "@youcefbnm",
        href: "https://21st.dev/@youcefbnm/components/process-timeline",
        lead: true,
        why: {
          en: "Marks the active step from scroll position. Six steps without modification, and the accent can be the brand green.",
          nl: "Markeert de actieve stap op scrollpositie. Zes stappen zonder aanpassing, en het accent kan het merkgroen zijn.",
        },
      },
    ],
  },
  {
    id: "reach",
    tier: 2,
    title: { en: "The working area, literally", nl: "Het werkgebied, letterlijk" },
    where: { en: "New — footer or contact", nl: "Nieuw — voettekst of contact" },
    now: {
      en: "Projects are in Utrecht, Arnhem, Nijmegen, Zeist, Amersfoort and on the Veluwe. Nowhere does it say where the studio sits or how far it travels.",
      nl: "Projecten staan in Utrecht, Arnhem, Nijmegen, Zeist, Amersfoort en op de Veluwe. Nergens staat waar de studio zelf zit of hoe ver hij rijdt.",
    },
    gap: {
      en: "A local service with no sense of place. Somebody nearby cannot tell you are nearby; somebody far away books an intake that will not happen.",
      nl: "Een lokale dienst zonder plaatsbepaling. Iemand vlakbij weet niet dat je om de hoek zit; iemand ver weg boekt een intake die niet doorgaat.",
    },
    verdict: {
      en: "True, and sharper than the teardown knew: those six places are placeholder fiction awaiting real projects, while the studio is registered in Limburg. So the map would today be drawn from invented locations — which is the argument for real photography and real projects first, and the map after.",
      nl: "Waar, en scherper dan de teardown wist: die zes plaatsen zijn plaatshouderfictie in afwachting van echte projecten, terwijl de studio in Limburg staat ingeschreven. Een kaart zou vandaag dus uit verzonnen locaties getekend worden — wat het argument is om eerst echte foto's en echte projecten te hebben, en de kaart daarna.",
    },
    picks: [
      {
        name: "Location Map",
        author: "@Mazyar kawa",
        href: "https://21st.dev/@Mazyar%20kawa/components/location-map",
        lead: true,
        why: {
          en: "Animated map with pulsing markers. Home base plus the projects as points tells reach and portfolio in one image.",
          nl: "Geanimeerde kaart met pulserende markers. Thuisbasis plus de projecten als punten vertelt bereik en portfolio in één beeld.",
        },
      },
    ],
  },
  {
    id: "polish",
    tier: 3,
    title: { en: "Polish", nl: "Afwerking" },
    where: { en: "Services · testimonials · footer", nl: "Diensten · referenties · voettekst" },
    now: {
      en: "All of it works.",
      nl: "Het werkt allemaal.",
    },
    gap: {
      en: "None of these closes a gap — which is exactly why they come last.",
      nl: "Geen van deze dicht een gat — en dat is precies waarom ze als laatste komen.",
    },
    picks: [
      {
        name: "Editorial Testimonial",
        author: "@jatin-yadav05",
        href: "https://21st.dev/@jatin-yadav05/components/editorial-testimonial",
        why: {
          en: "Typographic, large, one quote at a time. Better for a studio with few but good references than a carousel hiding the emptiness.",
          nl: "Typografisch, groot, één quote tegelijk. Beter voor een studio met weinig maar goede referenties dan een carrousel die de leegte verbergt.",
        },
      },
      {
        name: "Count Up",
        author: "@unlumen",
        href: "https://21st.dev/@unlumen/components/count-up",
        why: {
          en: "Counts up when it comes into view. Only with real figures — square metres reshaped, litres of rainwater held. Invented numbers here are worse than none.",
          nl: "Telt op zodra het in beeld komt. Alleen met echte getallen — m² omgevormd, liters regenwater geborgen. Verzonnen cijfers zijn hier erger dan geen cijfers.",
        },
      },
      {
        name: "Progressive Blur",
        author: "@ibelick",
        href: "https://21st.dev/@ibelick/components/progressive-blur",
        why: {
          en: "Layered blur through gradient masks, so photographs dissolve into the ground instead of sitting on it as rectangles.",
          nl: "Gelaagde blur via gradiëntmaskers, zodat foto's oplossen in de ondergrond in plaats van er als rechthoek op te liggen.",
        },
      },
    ],
  },
]

/** What the teardown warned against, kept because it is right. */
export const CONCEPT_CAUTIONS: { title: L; body: L }[] = [
  {
    title: { en: "What not to take", nl: "Wat niet te nemen" },
    body: {
      en: "Liquid glass, neon buttons, shaders, chat widgets. They score highly in the catalogue and run straight against \"nature is infrastructure\". This site is credible because it is restrained.",
      nl: "Liquid glass, neonknoppen, shaders, chatwidgets. Ze scoren hoog in de catalogus en staan haaks op \"natuur is infrastructuur\". Deze site is geloofwaardig omdát hij terughoudend is.",
    },
  },
  {
    title: { en: "Watch the weight", nl: "Let op het gewicht" },
    body: {
      en: "There is already a lot of movement on the page. Every pick above adds more. At most one that draws the eye, per page.",
      nl: "Er staat al veel beweging op de pagina. Elke keuze hierboven voegt meer toe. Hooguit één die opvalt, per pagina.",
    },
  },
  {
    title: { en: "Reduced motion", nl: "Beperkte beweging" },
    body: {
      en: "Community components often do not honour it, and scroll-driven timelines and sweeps are exactly what people are troubled by. It gets added during the retokening, not after.",
      nl: "Community-componenten respecteren dat lang niet altijd, en scrollgestuurde tijdlijnen en sweeps zijn precies waar mensen last van hebben. Dat komt erbij tijdens het hertokenen, niet erna.",
    },
  },
  {
    title: { en: "Order", nl: "Volgorde" },
    body: {
      en: "One at a time, and measure before the next. Nothing on this list is worth two of them going in together.",
      nl: "Eén tegelijk, en meten voor de volgende. Niets op deze lijst is het waard om er twee tegelijk in te zetten.",
    },
  },
]
