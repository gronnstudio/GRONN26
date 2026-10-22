import type { Foto } from "./vijverrenovatie"
import type { Stuk } from "./blog"
import { blokkenUit, leestijdVan } from "./journaal-tekst"

// De oudere stukken van het Journaal (eigenaar, 22 okt 2026: "Maak 20 blog
// berichten zodat er iets staat, met terugwerkende kracht op datums uit
// verleden"). Praktische kennis bij het seizoen, januari tot oktober 2026.
// Alleen eigen foto's van echte projecten, en alleen waar ze bij het
// onderwerp passen; anders is het een tekststuk. Geen verzonnen klanten of
// voorvallen.

const VR = "/projecten/vijverrenovatie"

const FOLIE: Foto = { src: `${VR}/F03-1.jpg`, width: 1000, height: 1333, alt: "Een lange baan vijverfolie uitgerold over het gazon om hem op maat te meten.", bijschrift: "Folie op maat meten, vóór het graven." }
const FILTER: Foto = { src: `${VR}/F05.jpg`, width: 1200, height: 1600, alt: "Een zwarte filterbak met drie kamers, rechtop gezet naast de haag tijdens de werkzaamheden.", bijschrift: "Een filter met drie kamers." }
const SLIB: Foto = { src: `${VR}/F07-2.jpg`, width: 1000, height: 1333, alt: "Een hand vol slib uit de filterbak, boven het troebele water in de kamer.", bijschrift: "Slib uit het filter: voeding voor algen." }
const PLANTMAND: Foto = { src: `${VR}/F09-1.jpg`, width: 1000, height: 1333, alt: "Een hand zet een jong vijverplantje in een plantmand met grind, met het plantlabel ernaast.", bijschrift: "Een waterplant in een mand met grind." }
const BEEKLOOP: Foto = { src: `${VR}/F11.jpg`, width: 1000, height: 1333, alt: "Nick zit op de keien bij de beekloop in aanbouw, met vijverfolie, grind en een zwarte slang om hem heen.", bijschrift: "De beekloop in aanbouw." }
const TUIN: Foto = { src: `${VR}/F01.jpg`, width: 2000, height: 1500, alt: "Overzicht van de tuin tijdens de afronding: een klinkerpad, een treurwilg, ronde stapstenen in de vijver en borders met keien en jonge beplanting.", bijschrift: "Vijver met stapstenen en een treurwilg." }
const ONDER_NET: Foto = { src: `${VR}/F02-1.jpg`, width: 1000, height: 1778, alt: "Een vijver afgedekt met een net, met een rand van natuursteen langs het klinkerpad.", bijschrift: "Een vijver onder het net." }
const TERRAS: Foto = { src: "/projecten/terras-geulle/T01.jpg", width: 1000, height: 1333, alt: "Het nieuwe terras van lichte betontegels onder de overkapping, met de opsluitband langs de rand van het zandbed.", bijschrift: "Het terras in Geulle, augustus 2026." }

type Invoer = Omit<Stuk, "blokken" | "leestijd"> & { tekst: string }

const stuk = ({ tekst, ...rest }: Invoer): Stuk => ({ ...rest, blokken: blokkenUit(tekst), leestijd: leestijdVan(tekst) })

const SLOT = "Stuur een foto via WhatsApp naar 06 181 180 14, dan kijk ik mee. Met een vaste prijs vooraf."

export const ARCHIEF: Stuk[] = [
  stuk({
    slug: "vijver-bevroren",
    titel: "Je vijver is bevroren: wat je wel en niet doet",
    beschrijving: "IJs op de vijver is niet erg, een vijver die helemaal dichtzit wel. Hoe je een wak openhoudt en waarom je het ijs nooit openhakt.",
    datum: "2026-01-08",
    rubriek: "Vijver",
    tekst: `
Een paar nachten vorst en je vijver ligt dicht. Dat ziet er mooi uit, en voor de vijver zelf is het geen probleem. Waar het om gaat, is wat er onder het ijs gebeurt.

## Waarom een dichte vijver een risico is

Op de bodem van elke vijver liggen blad en slib. Dat rot langzaam, ook in de winter, en daarbij komen gassen vrij. Normaal ontsnappen die aan het oppervlak. Ligt er een dichte laag ijs op, dan blijven ze in het water hangen. Voor vissen is dat gevaarlijker dan de kou zelf.

## Houd één plek open

Een wak van een paar handbreedtes is genoeg. Dat kan op twee manieren:

- Een ijsvrijhouder: een drijver van piepschuim die je in het najaar al in het water legt. Onder de drijver vriest het minder snel dicht.
- Een kleine luchtpomp met een uitstroomsteen vlak onder het oppervlak. De bubbels houden het water in beweging, zodat het daar niet bevriest.

Riet, lisdodde en biezen helpen ook. Hun holle stengels steken door het ijs en laten gassen ontsnappen. Daarom knip je ze pas in het voorjaar.

## Hak het ijs nooit open

Een klap op het ijs geeft een drukgolf onder water. Vissen liggen in de winter stil op de bodem, in hun winterrust, en schrikken daar flink van. Ligt de vijver toch helemaal dicht, zet dan een pan met heet water op het ijs en laat er langzaam een gat in smelten. Herhaal dat als het nodig is.

## Pomp hoog, voer weg

Laat de pomp niet onderin het water rondpompen. Onderin is het water het warmst, rond de 4 °C, en daar overwinteren je vissen. Hang de pomp hoger, zo'n 30 cm onder het oppervlak, of zet hem uit als er geen vissen zijn. Voeren doe je niet: onder de 10 °C verteren vissen bijna niets.

## Sneeuw op het ijs

Een dikke laag sneeuw houdt het licht tegen. Waterplanten maken dan geen zuurstof meer. Veeg bij een lange vorstperiode een deel van het ijs sneeuwvrij, voorzichtig en zonder op het ijs te gaan staan.

## En daarna

Als het dooit, kijk je of er dode vissen of veel rottend materiaal in het water liggen. Haal dat weg. De rest wacht tot het voorjaar, als het water boven de 10 °C komt.

Twijfel je of je vijver de winter goed doorkomt? ${SLOT}
`,
  }),
  stuk({
    slug: "haag-planten-in-de-winter",
    titel: "Een haag planten in de winter: zo doe je dat met wortelgoed",
    beschrijving: "De winter is de beste tijd om een haag te planten. Wat wortelgoed is, hoeveel planten je per meter zet en hoe je ze goed laat aanslaan.",
    datum: "2026-01-22",
    rubriek: "Tuin",
    tekst: `
Een haag plant je niet in mei, maar nu. Zolang de grond niet bevroren is, kun je van november tot in maart planten. De plant staat in rust, de grond is vochtig, en in het voorjaar groeien de wortels meteen door.

## Wat is wortelgoed?

Wortelgoed zijn planten zonder pot of kluit: de wortels zijn kaal. Ze worden alleen in de winter verkocht, als de planten in rust zijn. Wortelgoed is veel goedkoper dan planten in een pot, en het slaat vaak beter aan, omdat de wortels meteen in je eigen grond groeien.

Het enige nadeel: de wortels mogen niet uitdrogen. Plant ze dezelfde dag, of sla ze in een hoopje vochtige grond in tot je tijd hebt.

## Welke haag?

Kies een haag die bij je tuin en de grond past, en het liefst een inheemse soort. Die geven vogels en insecten beschutting en eten.

- Haagbeuk: groeit op bijna elke grond, ook in de schaduw, en houdt in de winter een deel van zijn bruine blad vast.
- Beuk: lijkt op haagbeuk, maar wil een luchtige grond en kan niet tegen natte voeten.
- Veldesdoorn: sterk en snel, met mooie herfstkleuren.
- Meidoorn: bloeit in mei en heeft bessen voor vogels. Let op de doorns.
- Een gemengde haag: haagbeuk, veldesdoorn, meidoorn en hazelaar door elkaar. Rommeliger, maar het rijkst aan leven.

## Hoeveel per meter?

Voor haagbeuk en beuk zet je meestal vier tot vijf planten per meter in één rij. Wil je snel een dichte haag, plant dan in twee rijen, verspringend. Vraag bij aankoop wat er voor jouw soort en maat gebruikelijk is.

## Zo plant je

- Zet de wortels een paar uur in een emmer water voor je plant.
- Graaf een sleuf van een spade diep en ruim breed genoeg voor de wortels.
- Maak de bodem van de sleuf los en meng er wat compost door.
- Zet de planten op dezelfde diepte als ze in de kwekerij stonden. Dat zie je aan de kleur van de stam.
- Vul aan, druk de grond aan met je voet en geef water, ook in de winter.

Knip haagbeuk na het planten een derde terug. Dan vertakt hij van onderaf en wordt de haag dicht.

## Het eerste jaar

Het belangrijkste werk komt in het voorjaar. Valt er in april en mei weinig regen, geef dan elke week flink water. Een laag blad of houtsnippers onder de haag houdt de grond vochtig en onkruid weg.

Wil je een haag laten planten in Stein en omgeving? ${SLOT}
`,
  }),
  stuk({
    slug: "voedselbos-in-je-tuin",
    titel: "Een voedselbos in je tuin? Wat er wel en niet kan",
    beschrijving: "Een echt voedselbos is minstens een halve hectare, maar de ideeën erachter passen ook in een gewone tuin: plant in lagen en geef het tijd.",
    datum: "2026-02-05",
    rubriek: "Tuin",
    tekst: `
Voedselbossen zijn populair. Je leest erover in de krant en gemeenten planten ze aan. Past er ook een in je achtertuin? Het eerlijke antwoord: een voedselbos niet, maar wel bijna alles wat een voedselbos goed maakt.

## Wat een voedselbos is

In november 2017 tekenden zo'n twintig partijen in Lelystad de Green Deal Voedselbossen, waaronder drie ministeries en de Provincie Limburg. Daarin staat wat een voedselbos is: een door mensen ontworpen, productief ecosysteem naar het voorbeeld van een natuurlijk bos, met veel meerjarige en houtige soorten waarvan je delen kunt eten. Het heeft een kruinlaag van hoge bomen, minstens drie andere lagen daaronder, een rijk bodemleven, en het is minimaal een halve hectare groot.

Die laatste eis is de reden dat een achtertuin officieel geen voedselbos is. Wouter van Eck, die het oudste voedselbos van Nederland begon, zegt zelf dat de term aan inflatie onderhevig is: een bosje zonder één echte boom erin is geen voedselbos. Ik noem het in een tuin daarom liever anders: een tuin in lagen, of een eetbare rand.

## Wat je ervan kunt leren

Van Eck begon in 2009 bij Groesbeek, op een uitgeputte maïsakker van zo'n 2,4 hectare. Voedselbos Ketelbroek telt inmiddels honderden eetbare soorten. Een paar dingen uit zijn ervaring zijn ook in een tuin bruikbaar.

- Plant in lagen. Een bos heeft hoge bomen, lagere bomen, struiken, kruiden, bodembedekkers en klimplanten. In een tuin doe je dat op kleine schaal na: één boom, struiken eronder, vaste planten en een bodembedekker. Een walnoot wordt groot; in een kleine tuin is een lagere fruitboom de kruin.
- Zet elke plant waar hij van nature thuishoort. Aardbei groeit van nature op schaduwrijke bosbodems en werkt daarom als bodembedekker. Een zonnige plek is voor duindoorn en abrikoos, een schaduwrijke voor daslook.
- Ken je grond en je water. Bomen met een penwortel, zoals tamme kastanje en walnoot, willen hun wortels niet in het grondwater.
- Denk aan insecten. "Een insectenhotel is prima, maar veel belangrijker is een insectenrestaurant," zegt Van Eck. Vroeg in het jaar is er weinig te eten; gele kornoelje en amandel bloeien vroeg.

## Wat het oplevert

In voedselbos Haarzuilens telden onderzoekers van Naturalis en de Universiteit Leiden 18.572 insecten, tegen 3.379 in het kruidenrijke grasland ernaast: 5,5 keer zoveel. In Ketelbroek steeg het gehalte organische stof in de bodem in tien jaar van 2 naar 7 à 9 procent, omdat het blad van alle lagen de bodem voedt.

Tegelijk zegt Wageningen University & Research dat er nog weinig wetenschappelijk onderzoek naar voedselbossen is gedaan, en dat het zo'n tien jaar duurt voordat een voedselbos optimaal produceert. Wie begint, begint voor de lange termijn.

## Geduld, en een beetje rommel

Een tuin in lagen ziet er anders uit dan een gazon met een strak perk. Zeker in de winter oogt het rommelig. Dat hoort erbij: blad dat blijft liggen, wordt voeding. Van Eck zegt het kort: de schoffel en de bladblazer horen er niet thuis.

Planten doe je het best aan het begin van de winter, als je niet hoeft te sproeien. Komt er daarna een droge zomer, geef dan om de paar weken flink water in plaats van steeds een beetje.

## Hoe ik daarbij help

Beplanting in lagen, van bodembedekker tot boom, is een van de dingen die ik doe. Ik kijk naar wat er al staat, naar de grond en het licht, en kies planten die bij de plek passen. ${SLOT}
`,
    bronnen: [
      "Stichting Voedselbosbouw Nederland. (z.d.). Wat is een voedselbos? https://www.voedselbosbouw.org/wat-is-een-voedselbos/",
      "Green Deal Voedselbossen (C-219). (2017). https://edepot.wur.nl/429283",
      "IPLO. (z.d.). Voedselbossen [Factsheet]. https://iplo.nl/publish/pages/153742/c1-voedselbossen.pdf",
      "Stad + Groen. (2025). Interview met Wouter van Eck. Stad + Groen, 2025(1). https://www.stad-en-groen.nl/upload/artikelen/sg251_voedselbossen.pdf",
      "Stichting Voedselbosbouw Nederland. (2025). In voedselbos 5,5 keer meer insecten dan in aangrenzend kruidenrijk grasland. https://voedselbosbouw.org/in-voedselbos-55-keer-meer-insecten-dan-in-aangrenzend-kruidenrijk-grasland/",
      "Wageningen University & Research. (2021). Voedselbossen zijn hip. https://edepot.wur.nl/563870",
    ],
  }),
  stuk({
    slug: "snoeien-in-de-winter",
    titel: "Snoeien in de winter: wat wel, en wat beter niet",
    beschrijving: "Niet alles mag in de winter onder de schaar. Welke bomen en struiken je nu snoeit, welke je laat staan, en waarom je uitgebloeide planten laat staan.",
    datum: "2026-02-19",
    rubriek: "Seizoen",
    tekst: `
Februari kriebelt. De tuin ligt stil, en het is verleidelijk om alles kort te knippen. Maar niet elke plant wil nu gesnoeid worden. Dit is wat ik aanhoud.

## Wel nu

- Appel en peer. In de winter staat de boom in rust en zie je de vorm goed. Haal dood hout, kruisende takken en waterloten weg. Snoei niet op dagen dat het vriest.
- Zomerbloeiers als vlinderstruik en struikrozen. Die bloeien op hout van dit jaar. Snoei ze eind februari of begin maart, als het ergste vriesweer voorbij is.
- Wilgen en hazelaar. Knotten en terugzetten kan nu goed, zolang er nog geen vogels nesten.

## Beter niet nu

- Kers, pruim en andere steenvruchten. Die snoei je in de zomer, na de oogst. In de winter dringt de schimmel die loodglans veroorzaakt makkelijker in de wonden.
- Voorjaarsbloeiers als forsythia, sering en ribes. Die hebben hun knoppen al. Wie ze nu snoeit, knipt de bloei van dit jaar weg. Snoei ze direct na de bloei.
- Hortensia's met bolle bloemen. Laat de oude bloemen staan tot april; ze beschermen de nieuwe knoppen tegen vorst.

## Laat staan wat uitgebloeid is

Uitgebloeide vaste planten en grassen knip je pas in maart. In de holle stengels overwinteren bijen en andere insecten, en vogels eten de zaden. Een border met zaadhoofden en grassen in de rijp is in de winter ook gewoon mooi.

## Let op de vogels

Vanaf half maart beginnen veel vogels te broeden, vaak in hagen en struiken. Een nest dat in gebruik is, mag je niet verstoren. Doe het grote snoeiwerk aan hagen dus vóór die tijd, en kijk altijd eerst even goed.

## Goed gereedschap

Snoei met een scherpe, schone schaar. Een rafelige wond geneest slecht en laat ziektes binnen. Maak de schaar schoon tussen twee bomen, zeker als een van de twee ziek is. Wondafdekmiddel is niet nodig: een goede, schuine snede vlak boven een knop of zijtak geneest vanzelf.

Liever dat iemand anders de schaar pakt? ${SLOT}
`,
  }),
  stuk({
    slug: "groen-water-in-het-voorjaar",
    titel: "Groen water in het voorjaar: oorzaak en oplossing",
    beschrijving: "In maart en april kleurt veel vijverwater groen. Waarom dat gebeurt, waarom het vaak vanzelf overgaat en wat je wel en niet moet doen.",
    datum: "2026-03-05",
    rubriek: "Vijver",
    beeld: SLIB,
    tekst: `
Het eerste zonnetje, en een week later is je vijver groen als erwtensoep. Dat gebeurt in bijna elke vijver in het voorjaar. Schrik er niet van, maar kijk wel waar het vandaan komt.

## Waarom het water groen wordt

Groen water bestaat uit zweefalgen: piepkleine algen die in het water zweven. Ze hebben drie dingen nodig: licht, warmte en voedingsstoffen. In het voorjaar krijgen ze alle drie tegelijk.

- De zon schijnt weer, en het ondiepe water warmt snel op.
- In de winter is blad en slib op de bodem gaan rotten. Daarbij zijn voedingsstoffen vrijgekomen.
- De waterplanten slapen nog. Die zouden de voedingsstoffen opnemen, maar groeien pas later.
- Het filter komt traag op gang. De bacteriën erin werken pas goed als het water warmer is dan zo'n 12 °C.

Algen zijn dus sneller dan de rest van je vijver. Vaak klaart het water vanzelf op zodra de planten gaan groeien.

## Wat helpt

- De UV-lamp aan, met een nieuwe lamp. Een UV-lamp laat zweefalgen samenklonteren, zodat het filter ze opvangt. Na een seizoen geeft de lamp veel minder UV, ook al brandt hij nog.
- Slib weghalen. Haal een deel van het slib van de bodem, niet alles. Wat je eruit haalt, mag zo de border in.
- Niet te vroeg voeren. Voer dat de vissen niet eten, is voeding voor algen. Begin pas als het water boven de 10 °C is, en dan weinig.
- Planten erbij. Zuurstofplanten onder water en drijvende planten als waterlelies nemen voedingsstoffen op en geven schaduw. Een derde tot de helft van het wateroppervlak in de schaduw is een goed doel.

## Wat niet helpt

- Al het water verversen. Kraanwater bevat zelf voedingsstoffen, en je haalt het evenwicht dat er was ook weg. Binnen een paar weken is het weer groen.
- Middeltjes tegen algen. Ze werken even, maar de oorzaak blijft. De dode algen zakken naar de bodem en worden de voeding voor de volgende bloei.
- Het filter met kraanwater schoonspoelen. Het chloor doodt de bacteriën die je juist nodig hebt. Spoel filtermateriaal uit in een emmer vijverwater.

## Draadalg is iets anders

Lange groene slierten aan stenen en planten zijn draadalgen, geen zweefalgen. Een UV-lamp helpt daar niet tegen. Haal ze met de hand of een stok uit het water, en kijk ook hier naar de oorzaak: te veel voeding en te weinig planten.

Blijft je vijver groen, ook in de zomer? ${SLOT}
`,
  }),
  stuk({
    slug: "tegels-eruit",
    titel: "Tegels eruit, groen erin: zo pak je het aan",
    beschrijving: "Minder tegels betekent minder wateroverlast, een koelere tuin en meer leven. Hoeveel je eruit haalt, wat je ervoor in de plaats zet en waar je op let.",
    datum: "2026-03-19",
    rubriek: "Tuin",
    tekst: `
In veel tuinen in Zuid-Limburg ligt meer steen dan groen. Het is makkelijk, denken we. Tot de eerste zware bui, of de eerste hete week.

## Waarom minder tegels?

- Regen kan weg. Op tegels loopt regen naar het riool, en dat is niet gebouwd op al dat extra water. Straten en kelders lopen dan onder. In de grond zakt het weg en vult het het grondwater aan (Steenbreek, z.d.).
- Een koelere tuin. Steen houdt warmte vast tot diep in de avond. Planten en open grond verdampen water en koelen de lucht af.
- Meer leven. Onder een tegel woont niets. In open grond wel: wormen, kevers, en de vogels die ze eten.
- Minder werk dan je denkt. Een goed gekozen border met bodembedekkers houdt onkruid zelf tegen. Voegen schoonkrabben hoeft dan niet meer.

## Hoeveel haal je eruit?

Een vuistregel: niet meer dan een derde van je tuin verhard (Steenbreek, z.d.). Houd wat je echt gebruikt: een terras voor de tafel, een pad naar de schuur, een plek voor de kliko. De rest mag groen.

Twijfel je? Begin met de randen. Een strook van een halve meter langs de schutting is snel gedaan en maakt al verschil.

## Wat zet je ervoor in de plaats?

- Een border met vaste planten die bij je grond passen. Plant ze dicht op elkaar, dan blijft er geen ruimte voor onkruid.
- Grind of schors op het pad, in plaats van tegels. Regen zakt erdoorheen.
- Een wadi of regentuin: een laag stuk waar het regenwater van het dak naartoe loopt en langzaam wegzakt.
- Een boom, als er plek is. Niets koelt een tuin zo goed als schaduw.

## Waar je op let

- De grond onder de tegels is vaak zand en puin, platgedrukt en zonder leven. Spit het los en meng er compost door voor je plant.
- Kabels en leidingen. Graaf je dieper dan een schop, dan doe ik vooraf een KLIC-melding. Bij zelf graven: let op waar de leidingen het huis in gaan.
- De tegels zelf. Gooi ze niet weg. Veel gemeenten halen ze op of ruilen ze voor planten, en via Marktplaats ben je ze zo kwijt.

## Tegelwippen

Elk jaar loopt het NK Tegelwippen, van het voorjaar tot in het najaar. Gemeenten doen mee en tellen hoeveel tegels hun inwoners eruit halen (Steenbreek, z.d.). Vraag bij je gemeente of er dit jaar een tegelruilactie is.

## Hulp nodig?

Ik maak van betegelde tuinen in Stein en omgeving groene tuinen: tegels eruit, bodem verbeteren, planten erin. Met een vaste prijs vooraf. Stuur een foto van je tuin via WhatsApp naar 06 181 180 14, of kijk naar de borderpakketten als je zelf aan de slag wilt.
`,
    bronnen: ["Steenbreek. (z.d.). Plan van aanpak: Tegel eruit, plant erin. https://steenbreek.nl/plan-van-aanpak-tegelruilactie"],
  }),
  stuk({
    slug: "vijver-voorjaarsklaar",
    titel: "Je vijver voorjaarsklaar maken: pomp, filter en planten",
    beschrijving: "Als het water boven de 10 °C komt, wordt je vijver wakker. Wat je dan doet met de pomp, het filter, het slib en de planten, in de goede volgorde.",
    datum: "2026-04-02",
    rubriek: "Vijver",
    beeld: FILTER,
    tekst: `
In de winter heb je je vijver met rust gelaten. Nu het water warmer wordt, komt alles weer op gang: de vissen, de planten, de algen en het filter. Met een goede voorjaarsbeurt geef je de goede kant een voorsprong.

## Wanneer?

Wacht tot het water een paar dagen boven de 10 °C blijft. Meet op zo'n 50 cm diepte. In Zuid-Limburg is dat meestal eind maart of begin april. Begin je eerder, dan stoor je vissen die nog in winterrust zijn.

## 1. Kijk eerst wat er leeft

In maart en april zetten kikkers en padden hun eitjes af. Kijk goed voor je gaat scheppen, en laat dril en snoeren in het water.

## 2. Oude plantresten eruit

Knip riet, lisdodde en biezen nu terug tot net boven het water. Haal dood blad en afgestorven stengels uit het water, voordat ze verder rotten.

## 3. Slib: een deel, niet alles

Haal met een schepnet een deel van het slib van de bodem. Laat een dun laagje liggen: daar leven bacteriën en larven die bij een gezonde vijver horen. Het slib mag de border in.

## 4. Het filter

Zet het filter weer volledig aan als het in de winter uit stond. Spoel het filtermateriaal uit in een emmer vijverwater, nooit onder de kraan: het chloor doodt de bacteriën die het water schoon houden. Maak niet alles tegelijk schoon, maar om en om, dan blijft er altijd genoeg leven in.

## 5. De UV-lamp

Vervang de lamp van de UV-C ieder voorjaar. Na een seizoen brandt hij nog wel, maar geeft hij veel minder UV. Zet hem aan zodra het filter draait; zo houd je zweefalgen in het voorjaar de baas.

## 6. De pomp terug op zijn plek

Heb je de pomp in de winter hoger gehangen? Zet hem nu terug op zijn gewone plek. Kijk of de aanzuiging vrij is en of de leidingen niet lekken.

## 7. Planten erbij

April en mei zijn goede maanden om nieuwe waterplanten te zetten. Begin met zuurstofplanten en een paar oeverplanten. Die nemen voedingsstoffen op, en dat is precies wat de algen anders krijgen.

## 8. Voeren: rustig aan

Geef vissen boven de 10 °C weinig en licht verteerbaar voer, en alleen wat ze in een paar minuten opeten. Te veel voer zakt naar de bodem en is voeding voor algen.

## En de folie?

Loop de rand een keer rond. Staat het water lager dan in de herfst, zonder dat het warm is geweest? Dan kan er een lek zitten, vaak in de rand of bij een waterval.

Liever een voorjaarsbeurt door een vakman? ${SLOT}
`,
  }),
  stuk({
    slug: "regeneratief-tuinieren",
    titel: "Regeneratief tuinieren: begin bij de bodem",
    beschrijving: "Regeneratief tuinieren betekent je bodem beter maken in plaats van alleen bijhouden: minder spitten, de grond bedekt houden en wortels in de grond laten.",
    datum: "2026-04-16",
    rubriek: "Tuin",
    tekst: `
Regeneratief is een woord uit de landbouw. Het betekent dat je de bodem niet alleen in stand houdt, maar beter maakt. Boeren doen het omdat hun grond het anders niet meer volhoudt. In een tuin werkt het net zo, en het scheelt je ook nog werk.

De Vlaamse kennisorganisatie B3W vat het samen in vijf principes. Ik loop ze langs, vertaald naar de tuin.

## 1. Verstoor de bodem zo weinig mogelijk

De Engelse Royal Horticultural Society is er duidelijk over: spitten beschadigt de bodem. Je vernielt de gangen die wormen hebben gemaakt, je breekt schimmelnetwerken, en er komt koolstof vrij die in de grond zat.

Een nieuw bed maak je dan zo. Leg een dubbele laag karton op het gras of onkruid (geen glanzend bedrukt karton, en haal nietjes en plakband eraf) en schep er tien tot vijftien centimeter goed verteerd organisch materiaal op, zoals compost. Maak bedden van zo'n 1,2 meter breed, dan kun je er van twee kanten bij zonder erop te staan.

## 2. Houd de grond bedekt

Kale grond droogt uit, en zonlicht tast het bodemleven aan. Een bedekte bodem blijft koel, vochtig en levend, en onkruid krijgt minder kans. In een tuin betekent het: elk jaar zo'n vijf centimeter mulch, en zo min mogelijk kale plekken tussen de planten.

De makkelijkste mulch heb je al. Laat het blad in de border liggen: het beschermt de bodem tegen de vorst en is voer en schuilplek voor wat er in je tuin leeft.

## 3. Zorg voor variatie

Hoe meer verschillende planten, boven en onder de grond, hoe sterker het geheel. Verschillende wortels voeden verschillend bodemleven, en ziektes en plagen krijgen minder vat.

## 4. Laat er wortels in de grond

Levende wortels zijn de brandstof van de bodem. Planten geven via hun wortels suikers af aan het bodemleven, en dat bodemleven maakt weer voedingsstoffen vrij voor de plant. Vaste planten, struiken en bodembedekkers houden het hele jaar wortels in de grond; een bed dat de hele winter kaal ligt niet.

## 5. Laat het leven toe

Voor boeren gaat het vijfde principe over vee op het land. In een tuin komt het neer op ruimte laten voor wat vanzelf komt: wormen, kevers, vogels. Blad dat blijft liggen en een hoek die niet elke week wordt opgeruimd, helpen al.

## Waarom het hier extra telt

Löss komt in Nederland alleen in Zuid-Limburg voor. Het is een vruchtbare grond die water goed vasthoudt, maar zonder begroeiing spoelt hij weg, zeker op een helling, en hij verdicht makkelijk. Waterschap Limburg waarschuwt dat regenwater dat over Zuid-Limburgse hellingen afstroomt, erosie en modderoverlast kan veroorzaken. Een bedekte grond met wortels erin houdt water en aarde vast.

## Begin klein

Je hoeft niet alles tegelijk. Stop met spitten, laat het blad in de border liggen en tel de wormen in een kluit van dertig bij dertig centimeter en vijftien diep. Meer dan tien betekent een rijke grond.

Wil je hulp bij een nieuwe border? ${SLOT}
`,
    bronnen: [
      "B3W. (2024). Regeneratieve landbouw in de praktijk [Brochure]. https://www.b3w.vlaanderen.be/files/Kennispunt/Regeneratieve-en-Biologische-Landbouw/Regeneratieve-landbouw-in-de-praktijk-B3W-brochure.pdf",
      "Royal Horticultural Society. (z.d.). No-dig gardening. https://www.rhs.org.uk/soil-composts-mulches/no-dig-gardening",
      "Stal en Akker. (2021). Löss, grondsoort van het jaar 2021. https://www.stal-en-akker.nl/artikel/377371-loss-grondsoort-van-het-jaar-2021",
      "Waterschap Limburg. (z.d.). Erosie en niet-kerende grondbewerking. https://www.waterschaplimburg.nl/voor-agrariers/erosie-en-niet-kerende-grondbewerking/",
      "Leefmilieu Brussel. (2018). Mijn tuin in permacultuur. https://document.environnement.brussels/opac_css/elecfile/IF_Potager_Permaculture_Permacultuurmoestuin_NL",
    ],
  }),
  stuk({
    slug: "inheemse-waterplanten",
    titel: "Inheemse waterplanten voor een gezonde vijver",
    beschrijving: "Waterplanten houden je vijver helder. Welke inheemse planten je kiest voor de oever, het ondiepe en het diepe water, en welke exoten je beter niet plant.",
    datum: "2026-05-07",
    rubriek: "Vijver",
    beeld: PLANTMAND,
    tekst: `
Een vijver zonder planten is een bak water. Planten nemen voedingsstoffen op, geven zuurstof en schaduw, en bieden kikkers, libellen en vissen een plek. Mei is een goede maand om ze te zetten: het water is warm genoeg en de planten groeien meteen door.

## Plant per zone

Een vijver heeft verschillende dieptes, en elke diepte heeft zijn eigen planten.

- De moerasrand, van nat tot een paar centimeter water: dotterbloem, watermunt, kattenstaart en moerasvergeet-mij-nietje.
- Ondiep water, tot zo'n 30 cm: gele lis, zwanenbloem, grote boterbloem en mattenbies.
- Diep water: de witte waterlelie en de gele plomp. Die wortelen op de bodem en hun bladeren drijven. Let op: de witte waterlelie wordt groot en past alleen in een flinke vijver.
- Drijvend: kikkerbeet en krabbenscheer, die vrij in het water liggen.
- Onder water: zuurstofplanten als hoornblad en waterviolier. Die zie je nauwelijks, maar ze doen het meeste werk.

## Waarom inheems?

Inheemse planten horen bij de dieren die hier leven. Libellenlarven klimmen langs stengels van lis en mattenbies omhoog. Bijen en zweefvliegen komen op de dotterbloem en de watermunt af. En inheemse planten zijn gewend aan ons klimaat: ze komen elk jaar terug.

## Deze exoten niet

Sommige vijverplanten uit andere werelddelen woekeren zo hard dat ze sloten en beken dichtgroeien. Grote waternavel, waterteunisbloem en parelvederkruid staan op de Europese lijst van invasieve soorten: je mag ze niet meer kopen, verkopen of planten. Ook watercrassula is berucht. Twijfel je over een plant, kies dan een inheemse.

## Zo plant je

Zet waterplanten in een plantmand met schrale grond of grind, geen potgrond. Potgrond zit vol voeding, en die komt in het water terecht. Leg er een laag grind op, zodat de grond niet wegspoelt en vissen er niet in wroeten. Zet de mand op de goede diepte, zo nodig op een paar stenen.

## Hoeveel?

Een gezonde vijver is voor een derde tot de helft begroeid of beschaduwd. Begin niet met te veel; planten breiden zich vanzelf uit. Haal elk jaar in de herfst een deel weg, dan blijft er ruimte voor open water.

Wil je een vijverrand die vanzelf mooi blijft? ${SLOT}
`,
  }),
  stuk({
    slug: "permacultuur-in-een-gewone-tuin",
    titel: "Permacultuur in een gewone tuin: eerst kijken, dan pas graven",
    beschrijving: "Permacultuur is geen lijst trucjes maar een manier van ontwerpen: kijk eerst hoe je tuin werkt en laat de onderdelen elkaar helpen.",
    datum: "2026-05-21",
    rubriek: "Tuin",
    tekst: `
Het woord permacultuur klinkt groot. Alsof je eerst een moestuin, kippen en een regenton nodig hebt voordat je mee mag doen. Dat valt mee. Permacultuur is in de kern een manier van kijken en ontwerpen, en die werkt ook in een gewone achtertuin in Stein of Geleen.

## Waar het vandaan komt

Het woord is een samentrekking van permanente agricultuur en permanente cultuur. Twee Australische biologen, Bill Mollison en David Holmgren, bedachten het in de jaren zeventig. Ze keken hoe een bos zichzelf in stand houdt en maakten daar een methode van om zelf zulke systemen te ontwerpen. Eronder liggen drie uitgangspunten: zorg voor de aarde, zorg voor de mens, en deel wat er over is.

Wat ik er goed aan vind: het is geen stijl. Een permacultuurtuin ziet er niet op één manier uit. Elke plek heeft een andere bodem, ander licht en ander water, en het ontwerp volgt de plek.

## Begin met een seizoen kijken

Het eerste principe van Holmgren is observeren. De meeste tuinen worden andersom gemaakt: eerst een plan, dan de plek erbij zoeken. Loop een seizoen lang met andere ogen door je tuin. Waar staat de zon om tien uur, en waar om vier? Waar blijft water staan na een flinke bui, en waar is het altijd als eerste droog? Uit welke hoek waait het?

Kijk ook onder je voeten. Leefmilieu Brussel geeft een eenvoudige test: steek een kluit van dertig bij dertig centimeter en vijftien diep, en tel de regenwormen. Meer dan tien betekent een rijke grond. Vind je er één, dan zit er te weinig organische stof in.

Bij een tuinontwerp doe ik hetzelfde. Ik kijk eerst naar de bodem, het water en het licht, en naar hoe jij de tuin gebruikt. Pas daarna teken ik.

## Zet dingen waar je ze nodig hebt

Permacultuur deelt een terrein in zones. Zone één is wat je elke dag gebruikt: kruiden, wat pluksla. Hoe verder van huis, hoe minder aandacht iets nodig heeft. Een kruidenbak achter in de tuin gebruik je niet. En een hoek waar je nooit komt, hoef je ook niet bij te houden: die mag wild worden.

## Laat elk onderdeel meer dan één ding doen

Mollison gebruikte zelf de vijver als voorbeeld: hij vangt en bewaart water, er groeien planten en leven dieren, hij slaat warmte op en weerkaatst licht. Een vijver is dus nooit alleen een mooi plaatje.

Hetzelfde geldt voor de rand eromheen. Waar twee milieus elkaar raken, zoals water en land, is het extra rijk. Een vijver met een flauwe, begroeide oever heeft meer leven dan een bak met steile wanden.

## Sluit de kringloop in je eigen tuin

Wat de tuin maakt, blijft in de tuin. Het blad mag in de border blijven liggen. Het slib dat ik uit een vijver haal, gaat de border in en niet in een container. Je hoeft er niets voor te kopen; je moet het alleen niet weggooien.

## Klein en langzaam

Holmgren raadt kleine, langzame oplossingen aan. Begin met één plek: een stuk gras dat border wordt, een tegelpad dat smaller kan, een regenton bij de schuur. Kijk wat er gebeurt en zet daarna de volgende stap.

Wil je weten wat dit voor jouw tuin betekent? ${SLOT}
`,
    bronnen: [
      "Holmgren, D. (z.d.). Permaculture principles. https://permacultureprinciples.com/",
      "Leefmilieu Brussel. (2018). Mijn tuin in permacultuur. https://document.environnement.brussels/opac_css/elecfile/IF_Potager_Permaculture_Permacultuurmoestuin_NL",
      "Permacultuur Nederland. (z.d.). Permacultuur, ontwerpen met de natuur. https://www.permacultuurnederland.org/wp/permacultuur-ontwerpen-met-de-natuur/",
    ],
  }),
  stuk({
    slug: "vijver-aanleggen-waar-begin-je",
    titel: "Een vijver aanleggen: waar begin je?",
    beschrijving: "De plek, de diepte, de folie en de rand: vier keuzes die bepalen of je vijver helder en levendig wordt. Waar je op let voordat de schop de grond in gaat.",
    datum: "2026-06-04",
    rubriek: "Vijver",
    beeld: FOLIE,
    tekst: `
Een vijver is het mooiste wat je in een tuin kunt maken. Er komt binnen een paar weken leven op af: libellen, kikkers, vogels die komen drinken. Maar de keuzes vooraf bepalen of het een heldere vijver wordt, of een groene bak waar je elk jaar mee bezig bent.

## 1. De plek

- Zon, maar niet de hele dag. Zo'n vijf à zes uur zon is ideaal. Meer geeft snel algen, minder laat planten slecht groeien.
- Niet onder bomen. Blad dat in het water valt, wordt slib. Een boom in de buurt kan, maar niet erboven.
- Zichtbaar vanuit huis. Je wilt hem zien, ook in de winter.
- De laagste plek is niet altijd de beste. Daar loopt bij een bui al het water van de tuin naartoe, met grond en mest erin.

## 2. De diepte

Wil je vissen, dan moet een deel van de vijver minstens 80 cm tot een meter diep zijn. Daar bevriest het niet en overwinteren ze. Een natuurvijver zonder vissen mag ondieper, met veel ondiepe randen. Daar komen juist kikkers en libellen op af, want hun larven worden niet opgegeten.

## 3. De folie

Er zijn twee soorten: PVC en EPDM. EPDM is soepeler, gaat langer mee en kan beter tegen vorst en zon. Leg er altijd een beschermvlies onder, zodat stenen en wortels de folie niet doorprikken.

Hoeveel folie heb je nodig? Een vuistregel per richting: de lengte, plus twee keer de diepte, plus een halve meter rand aan elke kant. Meet de folie uit voordat je bestelt; een flauwe oever kost meer folie dan een steile wand.

## 4. De rand

De rand maakt de vijver. Een flauwe oever met keien, grind en planten laat dieren in en uit het water, en verbergt de folie. Laat de folie aan de rand iets omhoog lopen en werk hem weg achter stenen of in de grond. Dan zuigt de tuin het water niet weg.

## Voor je gaat graven

- Leidingen. Graaf je dieper dan een schop, doe dan een KLIC-melding. Die doe ik vooraf bij elke klus.
- Stroom. Een pomp en filter hebben stroom nodig. Een buitenstopcontact met een aardlekschakelaar hoort erbij.
- Grond. Een vijver van een paar kuub geeft een paar kuub grond. Bedenk vooraf waar die heen gaat, bijvoorbeeld in een verhoogde border.
- Kleine kinderen. Een vijver en peuters gaan slecht samen. Denk aan een rooster net onder het wateroppervlak, of wacht nog een paar jaar.

## Filter of niet?

Een vijver met vissen heeft een filter nodig. Vissen poepen, en dat is voeding voor algen. Een natuurvijver zonder vissen en met genoeg planten kan zonder filter helder blijven, als hij groot genoeg is.

Zelf beginnen of liever samen? Kijk hoe de vijverrenovatie in deze tuin verliep op de werkpagina. ${SLOT}
`,
  }),
  stuk({
    slug: "water-geven-in-de-zomer",
    titel: "Water geven in de zomer: minder vaak, maar goed",
    beschrijving: "Elke avond een beetje sproeien helpt je planten minder dan je denkt. Wanneer, hoeveel en waar je water geeft, en wat je kunt laten.",
    datum: "2026-06-18",
    rubriek: "Seizoen",
    tekst: `
Het is warm, de grond is droog, en elke avond sta je met de slang in de tuin. Toch hangen de planten de volgende middag weer slap. Dat ligt niet aan de hoeveelheid water, maar aan de manier.

## Minder vaak, maar flink

Elke dag een beetje water maakt de bovenste centimeters nat. De wortels blijven daardoor ondiep, en die laag droogt het eerst uit. Geef liever één of twee keer per week flink water: zo'n tien liter per vierkante meter. Dat zakt diep in de grond, en de wortels groeien erachteraan. Een plant met diepe wortels kan een droge week veel beter aan.

## 's Ochtends, aan de voet

Geef water vroeg in de ochtend. Dan verdampt er weinig, en de planten hebben het als de warmte komt. 's Avonds kan ook, maar natte bladeren 's nachts geven schimmels meer kans.

Geef water aan de voet van de plant, niet over het blad. Een gieter zonder broes of een slang op een zacht straaltje werkt het best.

## Wie heeft het nodig?

- Nieuwe aanplant: het hele eerste jaar, en zeker in de eerste zomer. De wortels zitten nog in de kluit.
- Potten en bakken: elke dag bij warm weer. Er zit weinig grond in, en die droogt snel uit.
- Groenten: regelmatig, anders schieten ze door of barsten de vruchten.
- Gevestigde borders en struiken: meestal niet, of alleen bij een lange droge periode. Ze hebben diepe wortels.
- Het gazon: niet. Gras wordt bruin in een droge zomer, maar het herstelt zodra het weer regent.

## Houd het water vast

- Mulch. Een laag compost, houtsnippers of blad op de grond houdt het vocht vast en de grond koel.
- Dicht planten. Waar de grond bedekt is met planten, verdampt minder.
- Regenwater. Een regenton bij de regenpijp geeft gratis water, en planten hebben het liever dan kraanwater.

## De juiste plant op de juiste plek

Wie elke zomer moet sproeien om een plant in leven te houden, heeft vaak de verkeerde plant op die plek. Lavendel, tijm, salie en siergrassen kunnen goed tegen droogte. Zet dorstige planten bij elkaar op de natste plek, dan hoef je maar op één plek te gieten.

Wil je een border die minder water vraagt? ${SLOT}
`,
  }),
  stuk({
    slug: "beekloop-of-waterval",
    titel: "Een beekloop of waterval bij je vijver: wat komt erbij kijken",
    beschrijving: "Stromend water geeft geluid, zuurstof en beweging. Waar je op let bij de pomp, de folie, de leidingen en de stenen van een beekloop of waterval.",
    datum: "2026-07-02",
    rubriek: "Vijver",
    beeld: BEEKLOOP,
    tekst: `
Een waterval of een beekloop maakt van een vijver iets dat je hoort. Het water krijgt beweging en zuurstof, en vogels komen erop af. Het is ook het deel van een vijver waar het vaakst iets misgaat. Dit zijn de dingen waar ik op let, ook bij de vijverrenovatie met twee vijvers, een waterval en een beekloop die je op de werkpagina ziet.

## De pomp

De pomp bepaalt hoeveel water er stroomt. Een bredere waterval en een grotere hoogte vragen een sterkere pomp. Kies er een die iets meer kan dan je denkt nodig te hebben, en regel de hoeveelheid met een kraan. Liever een pomp die rustig draait dan een die op zijn tenen loopt; hij gaat dag en nacht mee.

## Het filter bovenaan

Laat het water uit de vijver eerst door het filter gaan en pas daarna de beekloop af. Dan stroomt er schoon water naar beneden, en werkt de beekloop zelf als extra filter: op de stenen groeien bacteriën die het water verder zuiveren.

## Leidingen en kranen

Gebruik drukvaste leidingen en zet er kogelkranen in. Daarmee regel je de stroming, en kun je een deel afsluiten als je het filter schoonmaakt. Leg de leidingen in een sleuf, zodat je er later nog bij kunt en ze niet in het zicht liggen.

## Folie onder alles

De beekloop krijgt dezelfde folie als de vijver, met beschermvlies eronder. De folie loopt door tot in de vijver, met een ruime overlap op de goede volgorde: de bovenste baan ligt over de onderste, net als dakpannen. Zet de randen van de beek hoger dan het water ooit komt. Het meeste water verdwijnt niet door een gat, maar over een rand die net te laag ligt.

## Stenen

Leg eerst grote, platte stenen voor de val zelf. Daar bepaal je hoe het water valt: één brede sluier, of een paar kleinere stroompjes. Werk de rest af met keien en grind, en laat ruimte voor planten langs de oever. Klop stenen nooit met een harde hamer op de folie vast.

## Als de pomp stopt

Zet je de pomp uit, dan loopt het water uit de beek terug de vijver in. De vijver moet dat water kunnen opvangen zonder over te lopen. Houd daarom een paar centimeter ruimte onder de rand.

## Stroom

Een pomp hoort op een buitenstopcontact met een aardlekschakelaar. Leg de kabel in een mantelbuis en niet los door het gras.

Droom je van stromend water in je tuin? ${SLOT}
`,
  }),
  stuk({
    slug: "tuin-voor-bijen-en-vlinders",
    titel: "Een tuin voor bijen en vlinders: zo maak je dat",
    beschrijving: "Bijen en vlinders hebben het hele seizoen nectar nodig, en vlinders ook planten voor hun rupsen. Welke planten helpen, en waarom een rommelhoek telt.",
    datum: "2026-07-16",
    rubriek: "Tuin",
    tekst: `
Het is juli, en in een goede tuin zoemt het. Maar in veel tuinen is het stil. Niet omdat er geen bloemen staan, maar omdat het de verkeerde bloemen zijn, of omdat ze allemaal tegelijk bloeien.

## Bloei van maart tot oktober

Bijen en vlinders hebben het hele seizoen eten nodig. Een border die in juni prachtig bloeit en de rest van het jaar groen is, helpt ze maar een paar weken.

- Vroeg in het voorjaar: krokus, sneeuwklokje, wilg en sleedoorn. Hommelkoninginnen die uit hun winterslaap komen, hebben die meteen nodig.
- Voorjaar: fruitbomen, meidoorn, vergeet-mij-niet en look.
- Zomer: marjolein, kattenkruid, grote kattenstaart, koninginnenkruid en lavendel.
- Nazomer en herfst: hemelsleutel, asters en klimop. Klimop bloeit in september en oktober, als er bijna niets anders meer is.

## Enkelvoudige bloemen

Kies bloemen met een hart dat je kunt zien. Gevulde bloemen, zoals veel rozen en dahlia's uit de winkel, zien er vol uit, maar een bij komt niet bij de nectar.

## Vlinders hebben ook rupsen

Een vlinder legt haar eitjes op een waardplant: de plant waar de rups van eet. Zonder waardplant geen nieuwe vlinders. Dagpauwoog, kleine vos en atalanta leggen hun eitjes op brandnetels. Een hoek met brandnetels in de zon is voor vlinders meer waard dan nog een vlinderstruik.

## Een nest voor bijen

De meeste wilde bijen wonen niet in een bijenhotel, maar in de grond. Ze graven gangetjes in kale, zonnige plekken met zand of leem. Laat dus een stukje grond onbedekt, of een zandig randje langs het pad. Een bijenhotel helpt een paar soorten, zolang het in de zon hangt en de gaatjes glad zijn.

## Geen gif

Een insect dat je doodspuit, kan geen bloem meer bestuiven. Gebruik geen bestrijdingsmiddelen in de tuin. Bladluizen zijn eten voor lieveheersbeestjes, zweefvliegen en mezen, en die komen vanzelf als je ze de tijd geeft.

## Water

Een ondiep schaaltje water met een paar stenen erin, of een vijver met een flauwe rand, is een drinkplek voor bijen, vlinders en vogels.

Wil je een border die het hele jaar bloeit? Kijk dan naar de vlinderborder bij de borderpakketten. ${SLOT}
`,
  }),
  stuk({
    slug: "vijver-in-een-hittegolf",
    titel: "Je vijver in een hittegolf: zuurstof, schaduw en water bijvullen",
    beschrijving: "Warm water houdt minder zuurstof vast. Hoe je ziet dat je vissen het moeilijk hebben, en wat je doet met de pomp, het voer en het bijvullen.",
    datum: "2026-08-06",
    rubriek: "Vijver",
    beeld: TUIN,
    tekst: `
Een week boven de dertig graden is voor een vijver zwaar. Het water warmt op, er verdampt veel, en algen groeien als nooit tevoren. Het grootste gevaar zie je niet: zuurstof.

## Waarom zuurstof het probleem is

Hoe warmer het water, hoe minder zuurstof erin past. Tegelijk hebben vissen bij warmte juist meer zuurstof nodig, en verbruiken rottend materiaal en algen 's nachts ook zuurstof. Vroeg in de ochtend is het zuurstofgehalte daardoor het laagst.

Zie je vissen 's ochtends aan het oppervlak happen, of hangen ze bij de waterval? Dan is er te weinig zuurstof. Dat is een signaal om meteen iets te doen.

## Wat je doet

- Laat de pomp en de waterval dag en nacht draaien. Bewegend water neemt zuurstof op.
- Zet er een luchtpomp met een uitstroomsteen bij. Die is niet duur en helpt veel.
- Voer minder, of helemaal niet. Vissen eten bij hitte slecht, en voer dat blijft liggen, rot.
- Haal dode algen en rottend blad uit het water.

## Schaduw

Waterlelies, drijvende planten en een boom of schaduwdoek aan de zuidkant houden het water koeler. Een derde tot de helft van het wateroppervlak in de schaduw is een goed doel.

## Water bijvullen

Op een hete dag verdampt er al gauw een centimeter. Vul liefst bij met regenwater uit de ton. Gebruik je kraanwater, vul dan in kleine beetjes bij, liefst een paar keer per week een paar centimeter, en niet in één keer een flinke laag. Zo schrikt het leven in je vijver niet van de temperatuur of het chloor.

## Na de hitte

Na een hittegolf komt vaak een bui. Die koelt het water snel af, en dode algen zakken naar de bodem. Houd de vissen daarna nog een paar dagen in de gaten, en maak het filter schoon in vijverwater als het dichtgeslibd is.

## Ondiepe vijvers

Een vijver die nergens dieper is dan een halve meter warmt het snelst op. Overweeg bij een renovatie om een deel dieper te maken. Daar blijft het water in de zomer koeler en in de winter vorstvrij.

Hebben je vissen het moeilijk? ${SLOT}
`,
  }),
  stuk({
    slug: "regenwater-opvangen",
    titel: "Regenwater opvangen: regenton, wadi of vijver",
    beschrijving: "Een flinke bui op je dak is honderden liters water. Hoe je dat in je tuin houdt in plaats van in het riool, van regenton tot regentuin.",
    datum: "2026-08-20",
    rubriek: "Tuin",
    tekst: `
Tussen de droge weken door valt er in augustus vaak in één keer heel veel regen. Waar gaat dat water naartoe? In de meeste tuinen via de regenpijp het riool in. Zonde, want je tuin had het een week later goed kunnen gebruiken.

## Hoeveel water is het?

Een rekensom: elke millimeter regen is een liter water per vierkante meter. Een dak van 50 m² vangt bij een bui van 10 mm dus 500 liter op. Een gewone regenton van 200 liter is dan al na een paar millimeter vol.

## Regenton

De eenvoudigste stap. Zet een ton bij de regenpijp met een vulautomaat: die vult de ton en stuurt de rest weer naar de afvoer als hij vol is. Regenwater is zacht en zonder chloor, en planten hebben het liever dan kraanwater. Leeg de ton voor de vorst, anders kan hij kapot vriezen.

## Afkoppelen

Wil je verder gaan, dan koppel je de regenpijp los van het riool en laat je het water in je tuin wegzakken. Vraag eerst bij je gemeente wat er mag en of er een regeling voor is.

Laat het water nooit tegen de gevel of naar de buren lopen. Leid het een paar meter van het huis af, naar een plek waar het weg kan.

## Wadi of regentuin

Een wadi is een ondiepe laagte in de tuin, met planten die tegen zowel nat als droog kunnen. Na een bui staat er even water in, en binnen een dag is het weggezakt. Het ziet eruit als een gewone border die iets lager ligt.

## Vijver met overloop

Een vijver kan ook regenwater opvangen. Laat de regenpijp er via een strook grind of een beekje in uitkomen, en maak een overloop naar een wadi of grindkoffer voor als hij vol is. Let op: het eerste water van een bui spoelt vuil en stof van het dak mee. Een bladvanger in de regenpijp houdt het grootste deel tegen.

## Minder verharding

Het meeste water dat je tuin uit stroomt, komt van tegels, niet van het dak. Elke tegel die eruit gaat, is een stukje grond waar regen in kan zakken.

Wil je weten wat er in jouw tuin kan? ${SLOT}
`,
  }),
  stuk({
    slug: "terras-leggen-voorbereiding",
    titel: "Een terras leggen: de voorbereiding bepaalt het resultaat",
    beschrijving: "Een terras dat na een jaar nog strak ligt, begint onder de tegels. De stappen van ontgraven tot afschot, aan de hand van een terras in Geulle.",
    datum: "2026-09-03",
    rubriek: "Tuin",
    beeld: TERRAS,
    tekst: `
In augustus legde ik in Geulle een terras van 24 m² betontegels van 60 × 60 × 4 cm. Het leggen zelf kostte ongeveer acht uur. Met het grondwerk erbij waren het twee dagen. Die verhouding zegt genoeg: het meeste werk zit onder de tegels.

## 1. Ontgraven

Haal de bovengrond weg tot je op vaste grond zit. Teelaarde, wortels en los zand zakken in, en dan zakken de tegels mee. Hoe diep je gaat, hangt af van de grond en van wat er op het terras komt te staan.

## 2. Ophogen en verdichten

Breng de fundering aan in lagen en tril elke laag goed aan. Een goed verdichte ondergrond is het verschil tussen een terras dat jaren vlak ligt en een terras met kuilen na de eerste winter.

## 3. Het zandbed

Op de fundering komt een zandbed van een paar centimeter. Rij het af met een rei over twee geleiders, zodat het overal even dik is. Dit is het moment om het afschot te maken: niet in de tegels, maar al in het zand.

## 4. Banden stellen

Opsluitbanden langs de rand houden alles op zijn plek. Zet ze strak in een lijn en vast in de grond, op de goede hoogte. Ze zijn ook de maat voor de rest van het terras.

## 5. Aantrillen en controleren

Tril het zandbed aan en meet opnieuw. Kloppen de hoogte en het afschot nog? Dit is de laatste kans om het goed te krijgen zonder tegels op te pakken.

## 6. Leggen

Leg de tegels vanaf een rechte lijn, met gelijke voegen. Grote tegels van 60 × 60 cm zijn zwaar en vragen een vlak bed: een kleine oneffenheid zie je meteen aan een wiebelende tegel.

## 7. Afschot

Laat het terras licht aflopen, van het huis af. In Geulle loopt alles richting het gras, zodat de regen daar de grond in kan. Water dat naar de gevel loopt, of op het terras blijft staan, wil je niet.

## 8. Afwerken

Veeg de voegen in en loop alles na. Een terras is pas klaar als je er met een waterpas overheen kunt en niets wiebelt.

## Minder steen, meer tuin

Een terras is fijn, maar hoeft niet groot te zijn. Leg alleen wat je echt gebruikt, en laat de rest groen. Dan kan het regenwater ergens heen.

De hele klus zie je terug bij het terras in Geulle op de werkpagina. Wil je zelf een terras? ${SLOT}
`,
  }),
  stuk({
    slug: "planten-in-de-herfst",
    titel: "Planten in de herfst: waarom september en oktober de beste maanden zijn",
    beschrijving: "De grond is nog warm en het regent vaker. Wat je in de herfst plant, heeft in het voorjaar een voorsprong. Vaste planten, bollen en struiken.",
    datum: "2026-09-17",
    rubriek: "Seizoen",
    tekst: `
De meeste mensen kopen hun planten in het voorjaar, als de tuincentra vol staan. Maar de beste tijd om te planten is nu, in september en oktober.

## Waarom de herfst

- De grond is nog warm van de zomer. Wortels groeien gewoon door, ook als de plant boven de grond al stilstaat.
- Het regent vaker en het verdampt minder. Je hoeft bijna geen water te geven.
- De plant heeft de hele winter om wortels te maken. In het voorjaar kan hij meteen groeien, en de eerste droge zomer kan hij beter aan.

Een plant die in mei de grond in gaat, moet in juni al tegen de droogte op. Een plant die in oktober is geplant, heeft dan al een half jaar wortels gemaakt.

## Wat plant je nu?

- Vaste planten: tot half oktober, dan wortelen ze nog voor de vorst. Laat late soorten als asters en grassen liever tot het voorjaar wachten.
- Bloembollen: krokus, sneeuwklokje, narcis en tulp in oktober en november. Plant ze twee à drie keer zo diep als de bol hoog is.
- Struiken en bomen in pot: de hele herfst, zolang het niet vriest.
- Hagen en bomen als wortelgoed: vanaf november, als de planten in rust zijn.

## Zo plant je goed

- Maak het plantgat twee keer zo breed als de kluit, en maak de bodem los.
- Zet de plant even diep als hij in de pot stond.
- Meng wat compost door de grond, geen kunstmest. De plant moet nu wortels maken, geen blad.
- Druk aan en geef één keer flink water, ook als het regent. Zo sluit de grond om de wortels.
- Leg een laag blad of mulch over de grond. Dat houdt hem warm en vochtig.

## Delen en verplaatsen

De herfst is ook de tijd om vaste planten te delen die te groot zijn geworden of in het midden kaal worden. Steek de pol uit, verdeel hem met een spade in stukken en plant de beste delen terug. De rest geef je weg aan de buren.

Wil je een border die volgend jaar meteen goed staat? Kijk naar de borderpakketten of ${SLOT.charAt(0).toLowerCase()}${SLOT.slice(1)}
`,
  }),
  stuk({
    slug: "bladnet-vijver",
    titel: "Een bladnet op je vijver: wanneer erop, wanneer eraf",
    beschrijving: "Een bladnet houdt je vijver schoon in de herfst. Wanneer het erop moet, hoe je het spant, en wanneer het er weer af gaat.",
    datum: "2026-10-01",
    rubriek: "Vijver",
    beeld: ONDER_NET,
    tekst: `
Er is één vijverklus met een deadline: het net moet erop vóór het blad valt. Een week te laat en de eerste lading ligt al op de bodem.

## Waarom een net?

Blad dat in het water valt, drijft een paar dagen en zinkt dan. Op de bodem rot het. Daarbij verbruikt het zuurstof en komen er voedingsstoffen vrij. Die voedingsstoffen zijn in het voorjaar het eten van algen. Wie in april groen water heeft, heeft het in november vaak al binnengekregen.

Een net vangt het blad op voordat het in het water komt. Het is de goedkoopste manier om je vijver gezond te houden.

## Wanneer erop?

Zodra de bomen in de buurt beginnen te kleuren. In Zuid-Limburg is dat meestal half oktober. Staan er eiken in de buurt, die houden hun blad langer vast, dan kan het net er tot in december op moeten.

## Hoe span je het goed?

- Fijne maas: zo'n 1 tot 2 cm. Grover laat kleine blaadjes door, fijner raakt snel verstopt.
- Boven het water, niet erin: span het net over een paar paaltjes of een lat in het midden, zodat het een dakje vormt. Een net dat in het water hangt, wordt een zak vol rottend blad.
- Randen vast: om de 60 tot 80 cm een pen of een steen. Zo waait het niet weg en kunnen reigers er niet onder.
- Ruimte voor dieren: laat aan één kant een kleine opening bij de oever, of leg een plank als uitstapje. Kikkers en egels moeten eruit kunnen.

## Bijhouden

Haal het blad er om de week af. Een vol net zakt door, en dan ligt het blad toch in het water. Een bladhark of een bezem werkt het best; het blad mag zo de border of de composthoop in.

## Wanneer eraf?

Als de bomen kaal zijn, meestal in december. Laat het net niet de hele winter liggen: het verzamelt sneeuw, het scheurt bij vorst, en vogels kunnen niet bij het water. Spoel het af, laat het drogen en berg het op voor volgend jaar.

## Liever niet zelf?

Ik leg bladnetten in Stein en omgeving, op maat gesneden en met een vaste prijs vooraf, inclusief btw:

- Tot 15 m²: € 125
- 15 tot 35 m²: € 175
- Meer dan 35 m²: € 250

Stuur een foto van je vijver via WhatsApp naar 06 181 180 14.
`,
  }),
  stuk({
    slug: "blad-laten-liggen",
    titel: "Blad laten liggen: waarom je tuin het nodig heeft",
    beschrijving: "Herfstblad is geen afval. Het voedt je bodem en beschermt insecten en egels. Waar je het laat liggen, en waar beter niet.",
    datum: "2026-10-08",
    rubriek: "Seizoen",
    tekst: `
Elk jaar in de herfst hoor je de bladblazers weer. Gazon schoon, borders kaal, zakken vol naar de container. Het ziet er netjes uit. Maar je gooit precies weg wat je tuin de rest van het jaar mist.

## Blad is voedsel voor je bodem

Een blad dat op de grond valt, wordt binnen een paar maanden opgegeten. Regenwormen trekken het de grond in, pissebedden en schimmels breken het verder af. Wat overblijft is humus: donkere, kruimelige grond die water vasthoudt en planten voedt.

In een bos gaat dat al eeuwen zo, zonder kunstmest. In je tuin kan het ook. Blad dat je weghaalt, moet je in het voorjaar terugkopen als compost of potgrond.

## Blad is een winterjas voor dieren

Onder een laag blad is het in de winter een paar graden warmer en vochtiger dan erboven. Daar overwinteren pissebedden, duizendpoten, kevers en soms lieveheersbeestjes (Vlinderstichting, z.d.). Egels zoeken zo'n hoop op om in te slapen. Merels en roodborstjes scharrelen er de hele winter hun eten bij elkaar.

Dezelfde regel geldt voor uitgebloeide planten. Laat stengels en zaadhoofden staan tot het voorjaar. Er zitten eitjes, poppen en larven in, en vogels eten de zaden.

## Waar laat je het liggen?

Niet overal. Dit is wat ik in de tuinen in Stein en omgeving aanhoud:

- In borders en onder struiken: laten liggen. Een laag van een paar centimeter is genoeg. Te veel? Verdeel het over de andere borders.
- Onder de heg: laten liggen. Daar valt het toch, en het houdt de grond vochtig.
- Op het gazon: wegharken. Een dikke laag blad sluit het licht af en het gras gaat eronder dood. Hark het de border in, dan blijft het in je tuin.
- Op paden en terras: wegvegen. Nat blad is glad.
- In de vijver: zo min mogelijk. Blad dat in het water zinkt, rot en wordt slib. Een bladnet vangt het op.

## En de bladblazer?

Die mag in de schuur blijven. Een bladblazer blaast niet alleen blad weg, maar ook de insecten die erin zitten, en hij maakt veel lawaai. Een hark doet hetzelfde werk in een gewone tuin, en je hoort de vogels nog.

## Een rommelhoek is genoeg

Vind je een tuin vol blad te slordig? Begin dan met één hoek. Een hoop blad en takken achter in de tuin, onder een struik, is al een winterkwartier voor egels en kevers. Niemand ziet het, en de tuin doet er een jaar lang zijn voordeel mee.

## Hulp nodig?

Ik doe in Stein en omgeving een najaarsbeurt voor tuin en vijver: blad van gazon en paden de borders in, uitgebloeide planten laten staan waar het kan, en het bladnet over de vijver. Met een vaste prijs vooraf. Stuur een foto van je tuin via WhatsApp naar 06 181 180 14.
`,
    bronnen: [
      "Vlinderstichting. (z.d.). Tuinieren voor vlinders: tips voor de herfst en winter [Brochure]. https://nieuw.vlinderstichting.nl/app/uploads/docs/29d63789-a3a7-4b0e-97f4-862568cabcd7.pdf",
      "IVN Natuureducatie. (2023). Nieuwsbrief oktober 2023 [Nieuwsbrief]. https://www.ivn.nl/app/uploads/sites/15/2023/09/okt2023.pdf",
    ],
  }),
]
