// De Instagram-feed in /dashboard/social (eigenaar, 9 okt 2026: "een social media
// manager, vanaf de achterkant van de site"). The KNIGHT move: vijf tegels in
// een vaste volgorde. Op een raster van drie kolommen staat dezelfde tegel dan
// altijd een paardensprong verder. Nick post zelf; hier staan de beelden en
// captions klaar. Een post is gepost? Zet `gepost` op de datum.

export const TEGELS = {
  P: { emoji: "🟨", naam: "Persoonlijk", vorm: "Foto · Nick in beeld", kleur: "#F2C94C" },
  K: { emoji: "🟩", naam: "Kennis", vorm: "Carrousel", kleur: "#6FCF97" },
  R: { emoji: "🟧", naam: "Proces", vorm: "Reel", kleur: "#F2994A" },
  I: { emoji: "🟦", naam: "Inspiratie", vorm: "Quote (Engels)", kleur: "#7DB7F0" },
  C: { emoji: "🟥", naam: "Commercieel", vorm: "Carrousel · oranje knop", kleur: "#EB5757" },
} as const
export type Tegel = keyof typeof TEGELS

/** De volgorde van de KNIGHT move; post n krijgt VOLGORDE[(n - 1) % 5]. */
export const VOLGORDE: Tegel[] = ["P", "K", "R", "I", "C"]

export type Post = {
  /** Map onder /public/social met 1.jpg, 2.jpg, … */
  map?: string
  slides?: number
  /** Een reel: 1.jpg is de cover, reel.mp4 de video. */
  reel?: boolean
  titel: string
  caption?: string
  /** Zoekwoorden voor de muziekbibliotheek van Instagram, instrumentaal. */
  muziek?: string
  /** Wat er nog nodig is, als de post niet klaar is. */
  nodig?: string
  /** Datum waarop Nick hem postte, bv. "2026-10-12". */
  gepost?: string
}

// Sinds 10 okt 2026 is 01 het espresso-portret; de oude 01 (Wie ik ben) is feedpost 1.
export const VASTGEZET: Post[] = [
  {
    map: "vast-1",
    slides: 1,
    titel: "01 · Waarom ik dit werk doe", muziek: "lofi piano",
    caption:
      "Waarom een hovenier eerst naar jou kijkt, en dan pas naar je tuin.\n\nHet vaderschap maakte voor mij nog duidelijker wat belangrijk is: aandacht geven, verantwoordelijkheid nemen en een omgeving creëren waarin iemand zich veilig voelt. Dat neem ik mee in mijn werk. Ik luister, kijk zorgvuldig en wil begrijpen wat een plek voor iemand moet betekenen.\n\nIk ben Nick van GRØNN. Ik maak en onderhoud vijvers en natuurlijke tuinen in Stein en omgeving. Dat begint bij de bodem, bij hoe water zijn weg vindt en bij planten die passen bij de plek.\n\nVertel me in een DM over jouw plek.",
  },
  {
    map: "vast-2",
    slides: 5,
    titel: "02 · Echt werk", muziek: "acoustic instrumental",
    caption:
      "Van een vijver onder een net naar één levend watersysteem.\n\nTwee vijvers, een waterval en een beekloop in één tuin. Ik heb leidingen en een filter ingegraven, natuursteen gelegd en de beplanting gezet: 44 planten van 7 soorten, zo’n 5.000 liter water en zo’n 120 uur werk.\n\nHet project is nog in afronding; in het voorjaar van 2027 komt de rest van de beplanting erbij. Het hele verhaal staat op gronn.studio.\n\nVijverrenovatie in Stein en omgeving? Stuur me een foto van je vijver.",
  },
  {
    map: "vast-3",
    slides: 4,
    titel: "03 · Samenwerken", muziek: "folk instrumental",
    caption:
      "Zo krijg je een vijver of tuin met een vaste prijs, in vier stappen.\n\n1. Je stuurt een foto van je vijver of tuin.\n2. Ik kom kijken en we lopen samen door wat je wilt.\n3. Je krijgt vooraf een vaste prijs.\n4. Ik maak het, en houd het bij als je dat wilt.\n\nVijvers: renoveren, waterval, filter, beekloop, najaarsbeurt en onderhoud. Tuinen: aanleggen, omvormen, borderpakketten en onderhoud. Voor huiseigenaren in Stein en omgeving.\n\nWhatsApp 06 181 180 14 of stuur een DM.",
  },
]

/** In de volgorde van posten: de eerste staat hier bovenaan. */
export const POSTS: Post[] = [
  {
    map: "01-hoi-ik-ben-nick",
    slides: 3,
    titel: "Hoi, ik ben Nick", muziek: "acoustic morning",
    caption:
      "Je belt mij, en ik sta ook in je tuin.\n\nIk ben Nick van GRØNN. Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving. Van de eerste foto die je stuurt tot de laatste plant die de grond in gaat, werk je met één persoon.\n\nVoordat ik begin, weet je wat het kost. Een vaste prijs, geen verrassingen achteraf.\n\nKen je iemand in de buurt die over zijn tuin of vijver twijfelt? Stuur dit even door.",
  },
  {
    map: "02-winterklaar-1-voeren",
    slides: 5,
    titel: "Winterklaar 1/5: stop met voeren", muziek: "calm piano",
    caption:
      "Je vissen zwemmen nog, maar je voert ze beter niet meer.\n\nZakt het vijverwater onder de 10 °C, dan gaan vissen in winterrust en verteren ze bijna niets meer. Voer blijft in hun darmen zitten of rot op de bodem, en daar groeien in het voorjaar de algen van.\n\nMeet op zo'n 50 cm diepte. Tussen 15 en 10 °C geef je weinig en licht verteerbaar voer. Onder 10 °C stop je, ook als de zon schijnt.\n\nDit is deel 1 van 5 van Vijver winterklaar. Bewaar de post, dan heb je hem bij de hand als het kouder wordt.",
  },
  {
    map: "03-beekloop",
    slides: 1,
    reel: true,
    titel: "Van sleuf tot stromend water", muziek: "cinematic instrumental",
    caption:
      "Een beekloop begint als een kale sleuf. Zo wordt het stromend water.\n\nFolie erin, grind en keien erop, en dan de rand: daar planten de oeverplanten zich tussen de stenen. Als de pomp aangaat, loopt het water van de waterval via de beek terug naar de vijver.\n\nEchte beelden van een vijverrenovatie in Stein.\n\nDroom je van stromend water in je eigen tuin? Stuur dit naar wie mee moet beslissen.",
  },
  {
    map: "04-quote-op-gang",
    slides: 1,
    titel: "You don't build a garden. You set it in motion.", muziek: "ambient nature",
    caption:
      "Een tuin is nooit af, en dat is precies goed.\n\nIk leg de basis: gezonde grond, water dat zijn weg vindt en planten die bij de plek passen. Daarna neemt de tuin het werk zelf over en wordt hij elk jaar voller.\n\nStuur dit naar iemand die elk weekend in zijn tuin loopt te zwoegen.",
  },
  {
    map: "05-borderpakketten",
    slides: 7,
    titel: "Borderpakketten", muziek: "upbeat acoustic",
    caption:
      "Waarom de helft van een nieuwe border na een jaar verkeerd staat.\n\nIn het tuincentrum kies je wat nu bloeit. Een jaar later is de ene plant de andere voorbij gegroeid en staat de helft in de verkeerde zon. Daarom heb ik acht borderpakketten samengesteld: voor zon, schaduw, de vijverrand of droge grond, elk met een plan van boven met soort, aantal en afstand.\n\nIk plant hem aan in Stein en omgeving, of je krijgt planten en plan thuisbezorgd. Past er geen? Dan maak ik er een op maat.\n\nStuur \"border\" in een DM en vertel waar hij moet komen.",
  },
  {
    map: "06-graafmachine",
    slides: 4,
    titel: "Elke steen leg ik zelf", muziek: "lofi chill",
    caption:
      "Eerst rijdt de minigraver je tuin in. Dan wordt het mooi.\n\nEen tuin omvormen ziet er een paar dagen uit als een bouwplaats. Grond eruit, nieuwe grond erin, leidingen in de sleuf. Daarna leg ik elke steen met de hand, tot het lijkt alsof hij er altijd lag.\n\nHet zware werk zie je straks niet meer. Wat blijft is een tuin in Stein en omgeving die klopt: water dat zijn weg vindt en planten op hun plek.\n\nPlan je zelf iets groots in je tuin? Stuur me een DM met een foto.",
  },
  {
    map: "07-winterklaar-2-pomp",
    slides: 5,
    titel: "Winterklaar 2/5: pomp en filter", muziek: "calm piano",
    caption:
      "Pomp uit in de winter? Dat hangt af van één vraag: zitten er vissen in?\n\nMaak het filter schoon voordat het koud wordt en laat het daarna met rust. Met vissen laat je de pomp draaien, maar hang hem hoger, zo'n 30 cm onder het wateroppervlak. Zo blijft het warmere water onderin staan, waar je vissen overwinteren.\n\nDe UV-lamp doet in de winter niets: uitzetten en droog wegzetten.\n\nDeel 2 van 5 van Vijver winterklaar. Stuur dit naar wie ook een vijver met vissen heeft.",
  },
  {
    map: "08-plantmanden",
    slides: 1,
    reel: true,
    titel: "Oeverplanten nooit los in de vijver", muziek: "soft acoustic",
    caption:
      "Zet oeverplanten nooit los in je vijver. Drie redenen.\n\n1. De wortels blijven waar ze horen.\n2. Er spoelt geen losse aarde in het water.\n3. Uitnemen en scheuren gaat in een paar minuten.\n\nMand, grind, plant. In deze vijver in Stein gingen er 11 manden in.\n\nBewaar dit voor als je je vijver gaat beplanten.",
  },
  {
    map: "09-quote-voed-de-bodem",
    slides: 1,
    titel: "Feed the soil, not the plant.", muziek: "ambient piano",
    caption:
      "Wie de bodem voedt, hoeft de plant niet te voeren.\n\nIn gezonde grond leeft van alles, en dat leven houdt je planten sterk. Daarom werk ik in de tuinen in Stein en omgeving zonder kunstmest, met compost en mulch.\n\nStuur dit naar wie elk voorjaar weer met de korrels in de weer is.",
  },
  {
    map: "10-winterklaar-prijs",
    slides: 1,
    reel: true,
    titel: "Winterklaar vanaf € 95", muziek: "lofi instrumental",
    caption:
      "Wat kost het om je vijver winterklaar te laten maken? Dat weet je vooraf.\n\n1. Stuur één foto via WhatsApp.\n2. Kies wat je nodig hebt: basis € 95, met bladnet ophalen € 135, met ijsvrijhouder € 150, alles € 185. Incl. btw.\n3. We prikken een datum en ik kom langs.\n\nVijveronderhoud in Stein en omgeving.\n\nApp je foto naar 06 181 180 14.",
  },
  {
    map: "11-buiten",
    slides: 1,
    titel: "Buiten vond ik altijd rust", muziek: "peaceful piano",
    caption:
      "Buiten vond ik altijd rust. Daar komt GRØNN vandaan.\n\nAls kind al zat ik tussen de planten en de dieren, kijken wat er gebeurt. Dat gevoel wil ik terugbrengen in de tuinen die ik maak in Stein en omgeving: een plek waar jij tot rust komt, en waar ook ruimte is voor vogels, insecten en kikkers.\n\nWaar kom jij tot rust? Vertel het in de reacties.",
  },
  {
    map: "12-winterklaar-3-knippen",
    slides: 5,
    titel: "Winterklaar 3/5: knippen of laten staan", muziek: "calm piano",
    caption:
      "Je oeverplanten worden bruin. Toch hoeft niet alles weg.\n\nRiet, lisdodde en biezen hebben holle stengels. Ze brengen zuurstof naar de bodem en houden bij ijs een opening voor gassen. Die knip je pas in het voorjaar.\n\nZacht blad dat in het water hangt, rot snel en wordt slib. Dat knip je een handbreedte boven het water af. Wat boven de rand blijft staan, is in de winter een schuilplek voor insecten.\n\nDeel 3 van 5 van Vijver winterklaar. Bewaar dit voor je volgende rondje langs de vijver.",
  },
  {
    map: "13-terras",
    slides: 1,
    reel: true,
    titel: "24 m² terras in twee dagen", muziek: "timelapse instrumental",
    caption:
      "Waterpas is niet genoeg voor een terras. Het moet ook weten waar het water heen moet.\n\nDag 1: ontgraven, ophogen, verdichten en het zandbed afrijen.\nDag 2: tegels van 60 × 60 leggen, op afschot richting het gras.\n\n24 m² terras in Geulle, in twee dagen. Terras aanleggen in Stein en omgeving.\n\nBewaar dit als je zelf een terras gaat leggen.",
  },
  {
    map: "14-quote-leave-the-leaves",
    slides: 1,
    titel: "Leave the leaves.", muziek: "autumn ambient",
    caption:
      "Laat het blad liggen. Het is de grond van volgend jaar.\n\nIn de borders is blad geen afval. Egels en insecten overwinteren eronder, en wat vergaat wordt humus. Alleen uit de vijver en van het gras haal je het weg.\n\nStuur dit naar wie dit weekend weer met de bladblazer klaarstaat.",
  },
  {
    map: "15-bladnet",
    slides: 4,
    titel: "Bladnet met een vaste prijs", muziek: "autumn lofi",
    caption:
      "Er is één vijverklus met een deadline: het net moet erop vóór de bladval.\n\nBlad dat in het water valt, zinkt, rot en voedt de algen. Een bladnet vangt het op.\n\nVaste prijs, incl. btw:\nTot 15 m²: € 125\n15 tot 35 m²: € 175\nMeer dan 35 m²: € 250\n\nOp maat gesneden, randen om de 60–80 cm vast, en in december haal ik het weer weg. Voor vijvers in Stein en omgeving.\n\nStuur een foto van je vijver via WhatsApp: 06 181 180 14.",
  },
]

export const tegelVan = (n: number): Tegel => VOLGORDE[(n - 1) % VOLGORDE.length]

// Wanneer posten (10 okt 2026). Gemiddelden uit onderzoek (Buffer, 9,6 mln posts;
// voor Nederland ligt de avondpiek rond 19–21 uur). Drie vaste momenten per week;
// Instagram Insights → Volgers → "Meest actieve tijden" gaat voor zodra er data is.
export const POSTTIJDEN = [
  { dag: "Di", tijd: "19:30", waarom: "Na het eten, op de bank" },
  { dag: "Do", tijd: "12:00", waarom: "Lunchpauze" },
  { dag: "Za", tijd: "09:30", waarom: "Koffie, tijd voor de tuin" },
]
