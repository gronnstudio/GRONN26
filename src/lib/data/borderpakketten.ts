import type { L } from "@/lib/i18n"

// Borderpakketten (eigenaar, 9 okt 2026: "zulke border pakketten wil ik ook
// gaan aanbieden, met een optie tot custom border pakketten"). Per pakket een
// plantlijst voor 5 m², een plan van boven en een doorsnede in
// public/borderpakketten/. De foto's zijn sfeerbeelden (Pexels) en dragen dat
// label: het is geen werk van GRØNN.
// De plantlijsten en aantallen komen uit teken-plannen.mjs (project-files/website/visuals).

export type BorderPakket = {
  slug: string
  naam: L
  tags: L[]
  zin: L
  alt: L
  /** Per 5 m²: naam, Latijnse naam, aantal. */
  planten: { naam: L; lat: string; aantal: number }[]
}

/** Prijs per m², incl. btw. Aangeplant = de prijs van Beplanting (pricing.ts). */
export const BORDER_PRIJS = { aangeplant: 75, opgestuurd: 30 } as const
export const BORDER_MATEN = [5, 10, 15] as const

export const BORDERPAKKETTEN: BorderPakket[] = [
  {
    slug: "vlinderborder",
    naam: { nl: "Vlinderborder", en: "Butterfly border" },
    tags: [{ nl: "Volle zon", en: "Full sun" }, { nl: "Normale tot droge grond", en: "Normal to dry soil" }, { nl: "Bloei juni–oktober", en: "Flowers June–October" }],
    zin: {
      nl: "Zonnehoed, salie en siergras in de stijl van een prairie. Vol leven voor bijen en vlinders, en in de winter blijven de zaaddozen staan.",
      en: "Coneflower, sage and fountain grass in a prairie style. Full of bees and butterflies, and the seed heads stand through winter.",
    },
    alt: { nl: "Een bloeiende border met roze zonnehoed, duizendknoop en kleine witte asters.", en: "A flowering border with pink coneflowers, knotweed and small white asters." },
    planten: [
      { naam: { nl: "Zonnehoed", en: "Coneflower" }, lat: "Echinacea purpurea", aantal: 6 },
      { naam: { nl: "Salie", en: "Sage" }, lat: "Salvia nemorosa ‘Caradonna’", aantal: 7 },
      { naam: { nl: "IJzerhard", en: "Purpletop vervain" }, lat: "Verbena bonariensis", aantal: 7 },
      { naam: { nl: "Siergras", en: "Fountain grass" }, lat: "Pennisetum alopecuroides", aantal: 5 },
      { naam: { nl: "Kattenkruid", en: "Catmint" }, lat: "Nepeta faassenii", aantal: 4 },
      { naam: { nl: "Ooievaarsbek", en: "Cranesbill" }, lat: "Geranium ‘Rozanne’", aantal: 5 },
    ],
  },
  {
    slug: "schaduwborder",
    naam: { nl: "Schaduwborder", en: "Shade border" },
    tags: [{ nl: "Halfschaduw tot schaduw", en: "Part to full shade" }, { nl: "Vochthoudende grond", en: "Moist soil" }, { nl: "Jaarrond groen", en: "Green all year" }],
    zin: {
      nl: "Varens, hosta en herfstanemoon voor de plek onder een boom of langs de noordgevel. Rustig groen dat licht brengt waar weinig zon komt.",
      en: "Ferns, hosta and Japanese anemone for the spot under a tree or along a north wall. Calm green that brings light where little sun reaches.",
    },
    alt: { nl: "Groot bont blad en varens in de schaduw langs een rand.", en: "Large variegated leaves and ferns in the shade along an edge." },
    planten: [
      { naam: { nl: "Mannetjesvaren", en: "Male fern" }, lat: "Dryopteris filix-mas", aantal: 7 },
      { naam: { nl: "Hosta", en: "Hosta" }, lat: "Hosta sieboldiana", aantal: 9 },
      { naam: { nl: "Herfstanemoon", en: "Japanese anemone" }, lat: "Anemone hupehensis", aantal: 5 },
      { naam: { nl: "Bosgras", en: "Greater woodrush" }, lat: "Luzula sylvatica", aantal: 8 },
      { naam: { nl: "Ooievaarsbek", en: "Cranesbill" }, lat: "Geranium macrorrhizum", aantal: 5 },
      { naam: { nl: "Krentenboom", en: "Juneberry" }, lat: "Amelanchier lamarckii", aantal: 1 },
    ],
  },
  {
    slug: "vijverrand",
    naam: { nl: "Vijverrand", en: "Pond edge" },
    tags: [{ nl: "Zon tot halfschaduw", en: "Sun to part shade" }, { nl: "Natte grond en ondiep water", en: "Wet soil and shallow water" }, { nl: "Bij elke vijver", en: "For any pond" }],
    zin: {
      nl: "De oever van droge rand tot ondiep water. Gele lis, kattenstaart en zegge maken de overgang zacht en geven kikkers en libellen een plek.",
      en: "The bank from dry edge to shallow water. Yellow iris, loosestrife and sedge soften the edge and give frogs and dragonflies a home.",
    },
    alt: { nl: "Een pol oeverplant in ondiep water, tussen kleine waterplanten.", en: "A clump of marginal plant in shallow water, among small water plants." },
    planten: [
      { naam: { nl: "Gele lis", en: "Yellow flag iris" }, lat: "Iris pseudacorus", aantal: 5 },
      { naam: { nl: "Kattenstaart", en: "Purple loosestrife" }, lat: "Lythrum salicaria", aantal: 9 },
      { naam: { nl: "Gele zegge", en: "Yellow sedge" }, lat: "Carex flava", aantal: 8 },
      { naam: { nl: "Moerasvergeet-mij-niet", en: "Water forget-me-not" }, lat: "Myosotis scorpioides", aantal: 8 },
      { naam: { nl: "Ooievaarsbek", en: "Cranesbill" }, lat: "Geranium ‘Rozanne’", aantal: 6 },
    ],
  },
  {
    slug: "droge-border",
    naam: { nl: "Droge border", en: "Dry border" },
    tags: [{ nl: "Volle zon", en: "Full sun" }, { nl: "Droge grond of grind", en: "Dry soil or gravel" }, { nl: "Weinig water nodig", en: "Little water needed" }],
    zin: {
      nl: "Lavendel, kruisdistel en vedergras tussen grind en keien. Gemaakt voor hete zomers en voor wie niet elke avond wil sproeien.",
      en: "Lavender, sea holly and feather grass between gravel and boulders. Made for hot summers and for anyone who doesn’t want to water every evening.",
    },
    alt: { nl: "Lavendel, zonnehoed en kruiden tussen grind en stenen in de zon.", en: "Lavender, coneflowers and herbs between gravel and stones in the sun." },
    planten: [
      { naam: { nl: "Lavendel", en: "Lavender" }, lat: "Lavandula angustifolia", aantal: 7 },
      { naam: { nl: "Kruisdistel", en: "Sea holly" }, lat: "Eryngium planum", aantal: 4 },
      { naam: { nl: "Vedergras", en: "Feather grass" }, lat: "Stipa tenuissima", aantal: 10 },
      { naam: { nl: "Hemelsleutel", en: "Ice plant" }, lat: "Hylotelephium spectabile", aantal: 4 },
      { naam: { nl: "Tijm", en: "Thyme" }, lat: "Thymus serpyllum", aantal: 6 },
    ],
  },
  {
    slug: "inheemse",
    naam: { nl: "Inheemse border", en: "Native border" },
    tags: [{ nl: "Volle zon", en: "Full sun" }, { nl: "Schrale tot normale grond", en: "Poor to normal soil" }, { nl: "Bloei mei–september", en: "Flowers May–September" }],
    zin: {
      nl: "Margriet, knoopkruid en beemdkroon: wilde planten die hier van nature horen. Insecten kennen ze al, en ze vragen bijna geen zorg.",
      en: "Ox-eye daisy, knapweed and scabious: wild plants that belong here. Insects already know them, and they need almost no care.",
    },
    alt: { nl: "Een wilde bloemenweide met blauwe korenbloemen.", en: "A wild flower meadow with blue cornflowers." },
    planten: [
      { naam: { nl: "Margriet", en: "Ox-eye daisy" }, lat: "Leucanthemum vulgare", aantal: 4 },
      { naam: { nl: "Knoopkruid", en: "Brown knapweed" }, lat: "Centaurea jacea", aantal: 5 },
      { naam: { nl: "Beemdkroon", en: "Field scabious" }, lat: "Knautia arvensis", aantal: 8 },
      { naam: { nl: "Wilde marjolein", en: "Wild marjoram" }, lat: "Origanum vulgare", aantal: 3 },
      { naam: { nl: "Muskuskaasjeskruid", en: "Musk mallow" }, lat: "Malva moschata", aantal: 6 },
      { naam: { nl: "Ruwe smele", en: "Tufted hair grass" }, lat: "Deschampsia cespitosa", aantal: 6 },
    ],
  },
  {
    slug: "plukborder",
    naam: { nl: "Plukborder", en: "Cutting border" },
    tags: [{ nl: "Volle zon", en: "Full sun" }, { nl: "Normale grond", en: "Normal soil" }, { nl: "Bloei juni–oktober", en: "Flowers June–October" }],
    zin: {
      nl: "Rudbeckia, vlambloem en kandelaarsbloem in rijen die je kunt plukken. Een bos bloemen uit eigen tuin, de hele zomer lang.",
      en: "Black-eyed Susan, phlox and Culver’s root in rows you can pick. A bunch of flowers from your own garden, all summer long.",
    },
    alt: { nl: "Een border met gele rudbeckia en paarse bloemen langs een wit hek.", en: "A border with yellow black-eyed Susans and purple flowers along a white fence." },
    planten: [
      { naam: { nl: "Kandelaarsbloem", en: "Culver’s root" }, lat: "Veronicastrum virginicum", aantal: 8 },
      { naam: { nl: "Vlambloem", en: "Garden phlox" }, lat: "Phlox paniculata", aantal: 8 },
      { naam: { nl: "Rudbeckia", en: "Black-eyed Susan" }, lat: "Rudbeckia fulgida", aantal: 5 },
      { naam: { nl: "Duizendblad", en: "Yarrow" }, lat: "Achillea millefolium", aantal: 4 },
      { naam: { nl: "Margriet", en: "Ox-eye daisy" }, lat: "Leucanthemum vulgare", aantal: 6 },
      { naam: { nl: "Vrouwenmantel", en: "Lady’s mantle" }, lat: "Alchemilla mollis", aantal: 5 },
    ],
  },
  {
    slug: "witte-border",
    naam: { nl: "Witte border", en: "White border" },
    tags: [{ nl: "Halfschaduw", en: "Part shade" }, { nl: "Vochthoudende grond", en: "Moist soil" }, { nl: "Licht in de avond", en: "Glows at dusk" }],
    zin: {
      nl: "Hortensia ‘Annabelle’, herfstanemoon en wit vingerhoedskruid tussen fris groen. Overdag rustig, en ’s avonds licht het op.",
      en: "Hydrangea ‘Annabelle’, Japanese anemone and white foxglove among fresh green. Calm by day, glowing at dusk.",
    },
    alt: { nl: "Een groene border met witte bloeiaren.", en: "A green border with white flower spikes." },
    planten: [
      { naam: { nl: "Herfstanemoon", en: "Japanese anemone" }, lat: "Anemone ‘Honorine Jobert’", aantal: 8 },
      { naam: { nl: "Vingerhoedskruid", en: "White foxglove" }, lat: "Digitalis purpurea ‘Alba’", aantal: 6 },
      { naam: { nl: "Zeeuws knoopje", en: "Masterwort" }, lat: "Astrantia major", aantal: 5 },
      { naam: { nl: "Ooievaarsbek", en: "Cranesbill" }, lat: "Geranium ‘White-Ness’", aantal: 5 },
      { naam: { nl: "Japans berggras", en: "Japanese forest grass" }, lat: "Hakonechloa macra", aantal: 5 },
      { naam: { nl: "Hortensia ‘Annabelle’", en: "Hydrangea ‘Annabelle’" }, lat: "Hydrangea arborescens", aantal: 2 },
    ],
  },
  {
    slug: "eetbare-border",
    naam: { nl: "Eetbare border", en: "Edible border" },
    tags: [{ nl: "Volle zon", en: "Full sun" }, { nl: "Normale grond", en: "Normal soil" }, { nl: "Oogst juni–september", en: "Harvest June–September" }],
    zin: {
      nl: "Rode bes, rabarber en keukenkruiden in een border die er ook mooi uitziet. Plukken voor de keuken, vlak bij de deur.",
      en: "Redcurrant, rhubarb and kitchen herbs in a border that also looks good. Pick for the kitchen, right by the door.",
    },
    alt: { nl: "Verse keukenkruiden zoals rozemarijn en peterselie op een houten plank.", en: "Fresh kitchen herbs such as rosemary and parsley on a wooden board." },
    planten: [
      { naam: { nl: "Echte salie", en: "Common sage" }, lat: "Salvia officinalis", aantal: 5 },
      { naam: { nl: "Wilde marjolein", en: "Wild marjoram" }, lat: "Origanum vulgare", aantal: 8 },
      { naam: { nl: "Bieslook", en: "Chives" }, lat: "Allium schoenoprasum", aantal: 5 },
      { naam: { nl: "Bosaardbei", en: "Wild strawberry" }, lat: "Fragaria vesca", aantal: 4 },
      { naam: { nl: "Rode bes", en: "Redcurrant" }, lat: "Ribes rubrum", aantal: 2 },
      { naam: { nl: "Rabarber", en: "Rhubarb" }, lat: "Rheum rhabarbarum", aantal: 1 },
    ],
  },
]

export function borderPakket(slug: string | null | undefined) {
  return BORDERPAKKETTEN.find((p) => p.slug === slug)
}
