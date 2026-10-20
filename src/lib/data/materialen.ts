// Wat er aan steen en buitenmateriaal mogelijk is (eigenaar, 20 okt 2026: "een
// webpagina met alles wat steenrijk aanbiedt met korte beschrijving, zodat het
// voor klanten makkelijk inzicht geeft"). Het buitenassortiment van Steenrijk in
// Sittard, in soorten in plaats van merken; per soort één zin. Kunstgras staat
// er bewust niet in: het past niet bij natuurlijke tuinen.

type L = { nl: string; en: string }
export type Materiaal = { naam: L; zin: L }
export type MateriaalGroep = { id: string; kop: L; materialen: Materiaal[] }

export const MATERIAALGROEPEN: MateriaalGroep[] = [
  {
    id: "klinkers",
    kop: { nl: "Klinkers", en: "Pavers" },
    materialen: [
      { naam: { nl: "Gebakken klinkers", en: "Clay pavers" }, zin: { nl: "Gebakken klei in warme kleuren, die met de jaren mooier wordt. In waalformaat of dikformaat.", en: "Fired clay in warm colours that improves with age. In slim or thick format." } },
      { naam: { nl: "Getrommelde klinkers", en: "Tumbled pavers" }, zin: { nl: "Afgeronde randen en een geleefde look, alsof ze er altijd al lagen.", en: "Rounded edges and a weathered look, as if they were always there." } },
      { naam: { nl: "Kasseien en kinderkoppen", en: "Cobbles and setts" }, zin: { nl: "Bolle, oude straatstenen voor een landelijk pad of een erf.", en: "Domed old-style setts for a rural path or yard." } },
      { naam: { nl: "Natuurstenen klinkers", en: "Natural stone setts" }, zin: { nl: "Graniet, basalt of porfier: elke steen anders, gaat een leven lang mee.", en: "Granite, basalt or porphyry: every stone different, lasts a lifetime." } },
      { naam: { nl: "Betonklinkers", en: "Concrete pavers" }, zin: { nl: "Sterk en voordelig, in veel kleuren en formaten.", en: "Strong and affordable, in many colours and sizes." } },
      { naam: { nl: "Kleurechte betonklinkers", en: "Colourfast concrete pavers" }, zin: { nl: "De kleur zit door de hele steen en verbleekt niet in de zon.", en: "The colour runs through the whole stone and does not fade in the sun." } },
    ],
  },
  {
    id: "tegels",
    kop: { nl: "Terrastegels", en: "Patio tiles" },
    materialen: [
      { naam: { nl: "Keramische tegels, 2 cm", en: "Ceramic tiles, 2 cm" }, zin: { nl: "Vlekken en mos krijgen geen grip. In beton-, natuursteen- of houtlook; ook op tegeldragers.", en: "Stains and moss find no grip. In concrete, stone or wood look; also on pedestals." } },
      { naam: { nl: "Keramische tegels, 3 cm", en: "Ceramic tiles, 3 cm" }, zin: { nl: "Dikker en sterker, dus minder kans op breuk. Ook voor de oprit.", en: "Thicker and stronger, so less risk of cracking. Also for driveways." } },
      { naam: { nl: "Beton met keramiek", en: "Concrete with ceramic top" }, zin: { nl: "Een keramische toplaag op beton: zo makkelijk te leggen als een gewone tegel.", en: "A ceramic top on concrete: as easy to lay as a normal tile." } },
      { naam: { nl: "Betontegels", en: "Concrete tiles" }, zin: { nl: "Voordelig, in veel formaten, vaak met een laag tegen vlekken.", en: "Affordable, many sizes, often coated against stains." } },
      { naam: { nl: "Kleurechte betontegels", en: "Colourfast concrete tiles" }, zin: { nl: "Kleur door en door, met een strakke of juist ruwe bovenkant.", en: "Colour all the way through, with a smooth or rough top." } },
      { naam: { nl: "Natuursteen tegels", en: "Natural stone tiles" }, zin: { nl: "Echte steen, zoals hardsteen of leisteen. Geen tegel is hetzelfde.", en: "Real stone such as bluestone or slate. No two tiles alike." } },
      { naam: { nl: "Oud-Hollandse tegels", en: "Old Dutch tiles" }, zin: { nl: "Grijze tegels met een gebruikte look, passend bij een oud huis.", en: "Grey tiles with a used look, suited to an old house." } },
      { naam: { nl: "Tegels voor de oprit", en: "Driveway tiles" }, zin: { nl: "Extra dik, zodat ze een auto dragen zonder te breken.", en: "Extra thick, so they carry a car without breaking." } },
    ],
  },
  {
    id: "water",
    kop: { nl: "Regenwater en grind", en: "Rainwater and gravel" },
    materialen: [
      { naam: { nl: "Waterdoorlatende bestrating", en: "Permeable paving" }, zin: { nl: "Stenen waar regen doorheen zakt, de grond in in plaats van het riool.", en: "Pavers that let rain soak into the ground instead of the sewer." } },
      { naam: { nl: "Grind en split", en: "Gravel and chippings" }, zin: { nl: "Voor paden en plekken waar water moet wegzakken, in veel kleuren.", en: "For paths and spots where water should drain away, in many colours." } },
      { naam: { nl: "Grindplaten", en: "Gravel grids" }, zin: { nl: "Houden grind op zijn plek, zodat je er ook met een kruiwagen of fiets over kunt.", en: "Keep gravel in place, so you can cross it with a wheelbarrow or bike." } },
      { naam: { nl: "Keien en zwerfstenen", en: "Boulders" }, zin: { nl: "Voor een vijverrand, een droge beek of als rustplek voor insecten.", en: "For a pond edge, a dry stream bed or as a resting spot for insects." } },
      { naam: { nl: "Lijngoten", en: "Channel drains" }, zin: { nl: "Een smalle goot die regenwater van het terras afvoert.", en: "A narrow channel that carries rainwater off the patio." } },
    ],
  },
  {
    id: "muren",
    kop: { nl: "Muren, trappen en randen", en: "Walls, steps and edges" },
    materialen: [
      { naam: { nl: "Stapelblokken", en: "Walling blocks" }, zin: { nl: "Voor een muurtje of verhoogde border; gekliefd, strak of getrommeld.", en: "For a low wall or raised border; split, smooth or tumbled." } },
      { naam: { nl: "Natuurstenen muurstenen", en: "Natural walling stone" }, zin: { nl: "Losse stenen voor een stapelmuur, met plek voor planten in de kieren.", en: "Loose stones for a dry wall, with room for plants in the gaps." } },
      { naam: { nl: "Palissades en bielzen", en: "Palisades and sleepers" }, zin: { nl: "Rechtop gezette paaltjes of balken om hoogteverschil op te vangen.", en: "Upright posts or beams to hold a change in level." } },
      { naam: { nl: "L-elementen", en: "L-shaped retaining walls" }, zin: { nl: "Betonnen keerwanden voor een groot hoogteverschil.", en: "Concrete retaining walls for a large change in level." } },
      { naam: { nl: "Traptreden", en: "Steps" }, zin: { nl: "Massieve treden in beton of natuursteen.", en: "Solid steps in concrete or stone." } },
      { naam: { nl: "Steenkorven", en: "Gabions" }, zin: { nl: "Draadkorven vol steen: een muur die tegelijk schuilplek is voor egels en insecten.", en: "Wire baskets filled with stone: a wall that also shelters hedgehogs and insects." } },
      { naam: { nl: "Opsluitbanden en kantopsluiting", en: "Edging" }, zin: { nl: "Houden bestrating op zijn plek; in beton, natuursteen, cortenstaal of verzinkt staal.", en: "Keep paving in place; in concrete, stone, corten or galvanised steel." } },
      { naam: { nl: "Cortenstaal borders", en: "Corten steel edging" }, zin: { nl: "Een dunne roestbruine rand tussen gras en border.", en: "A thin rust-brown edge between lawn and border." } },
      { naam: { nl: "Plantenbakken", en: "Planters" }, zin: { nl: "Vaste of modulaire bakken, ook als keerwand te gebruiken.", en: "Fixed or modular planters, also usable as a retaining wall." } },
    ],
  },
  {
    id: "afwerking",
    kop: { nl: "Licht en afwerking", en: "Lighting and finishing" },
    materialen: [
      { naam: { nl: "Tuinverlichting", en: "Garden lighting" }, zin: { nl: "Spots, wandlampen en grondlampjes op laagspanning, veilig om zelf te verplaatsen.", en: "Spots, wall lights and deck lights on low voltage, safe to move yourself." } },
      { naam: { nl: "Voegzand en voegmiddel", en: "Jointing sand and mortar" }, zin: { nl: "Gewoon voegzand, of polymeer en epoxy waar geen onkruid meer doorheen komt.", en: "Plain jointing sand, or polymer and epoxy that weeds cannot get through." } },
      { naam: { nl: "Tegeldragers", en: "Tile pedestals" }, zin: { nl: "Stelpootjes om tegels op te leggen, bijvoorbeeld op een dak of boven leidingen.", en: "Adjustable pedestals for tiles, for example on a roof or over pipes." } },
      { naam: { nl: "Onderhoudsmiddelen", en: "Care products" }, zin: { nl: "Om tegels en steen schoon te houden en te beschermen.", en: "To clean and protect tiles and stone." } },
    ],
  },
]
