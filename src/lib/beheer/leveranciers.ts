// Leveranciers per materiaal, voor /dashboard/leveranciers (eigenaar, 20 okt
// 2026: "zet deze in dashboard, maak meerdere tabladen"). Opgezocht op 20 okt
// 2026. "zakelijk" zegt of je als hovenier een account of korting krijgt;
// "Vragen" = staat niet op de site, bel met je KvK-nummer. "account" is de
// stand van een account dat je al hebt (uit de mail, 7 okt 2026). Zo lokaal
// mogelijk (eigenaar, 20 okt 2026): elk tabblad staat op afstand vanaf Stein,
// online en merken achteraan.

export type Stand = "actief" | "wacht" | "uit"

// Stand van een leveranciersaccount (eigenaar, 7 okt 2026): groen vinkje,
// geel vraagteken, rood kruis. Het woord ernaast blijft voor wie geen kleur ziet.
export const STAND = {
  actief: { naam: "Actief", teken: "✓", bol: "bg-[#2f7d3b] text-white" },
  wacht: { naam: "In afwachting", teken: "?", bol: "bg-[#f2c230] text-[#202020]" },
  uit: { naam: "Niet actief", teken: "✕", bol: "bg-[#c0392b] text-white" },
} as const

export type Leverancier = {
  naam: string
  wat: string
  href: string
  plaats?: string
  /** Ongeveer, over de weg vanaf Stein. Leeg = online of merk. */
  km?: number
  zakelijk: string
  /** Stalen, catalogus of brochure aanvragen */
  stalen?: { tekst: string; href?: string }
  account?: Stand
}

export type Groep = { id: string; naam: string; leveranciers: Leverancier[] }

export const GROEPEN: Groep[] = [
  {
    id: "vijver",
    naam: "Vijver",
    leveranciers: [
      { naam: "Dirix", plaats: "Elsloo", km: 3, wat: "Kiezel, vijvergrind, waterplanten", href: "https://www.dirix.nl/tuin-en-bouw", zakelijk: "Vragen" },
      { naam: "Robert Knops Vijver en Aquarium", plaats: "Geleen", km: 8, wat: "Vijverspeciaalzaak van 5000 m²: pompen, filters, koi", href: "https://www.robertknops.nl", zakelijk: "Vragen" },
      { naam: "Biovijver", wat: "Vijverspullen", href: "https://biovijver.nl/", zakelijk: "Ja", account: "actief" },
      { naam: "Lupa Vijvercentrum Limburg", plaats: "Schimmert", km: 15, wat: "Pompen, filters, UV-C, folie", href: "https://www.vijvercentrumlimburg.nl", zakelijk: "Vragen", stalen: { tekst: "Vragen in de winkel" } },
      { naam: "VitalFish", plaats: "Maastricht", km: 20, wat: "Grote vijverwinkel: pompen, filters, planten", href: "https://vitalfish.nl/locaties/maastricht/", zakelijk: "Vragen" },
      { naam: "Oase", wat: "Merk: pompen, filters, verlichting (via dealer)", href: "https://www.oase.com/nl-NL/vijver-watertuin", zakelijk: "Via dealer", stalen: { tekst: "Catalogi downloaden", href: "https://www.oase.com/nl-NL/vijver-watertuin/support/brochure-downloads" } },
      { naam: "Velda", wat: "Merk: pompen, filters, vijverzorg (via dealer)", href: "https://www.velda.nl", zakelijk: "Dealer worden: dealer@velda.com", stalen: { tekst: "Vijvernieuws, maandelijks", href: "https://www.velda.nl/inschrijven-vijvernieuws/" } },
      { naam: "Tytane", wat: "EPDM-folie voor hoveniers", href: "https://www.tytane.nl/dakbedekking-voor-dakhelden/hoveniers", zakelijk: "Ja" },
      { naam: "Van der Velde Waterplanten", wat: "Inheemse water- en oeverplanten", href: "https://www.vdvelde.com/zakelijk/", zakelijk: "Ja, vooraf betalen via webshop" },
    ],
  },
  {
    id: "bestrating",
    naam: "Bestrating",
    leveranciers: [
      { naam: "Dirix", plaats: "Elsloo", km: 3, wat: "Tegels, klinkers, natuursteen, grind, zand; showroom, afhalen of laten leveren", href: "https://www.dirix.nl/tuin-en-bouw", zakelijk: "Vragen", stalen: { tekst: "Showroom, ma–vr 8–16 uur" } },
      { naam: "Steenrijk", plaats: "Sittard", km: 12, wat: "Sierbestrating, natuursteen, keramiek; showtuin altijd open", href: "https://steenrijk.info", zakelijk: "Ja", stalen: { tekst: "Stalen vragen aan de balie" } },
      { naam: "Wildkamp", wat: "Tuinmaterialen", href: "https://www.wildkamp.nl/", zakelijk: "Niet bevestigd", account: "wacht" },
      { naam: "Struyk Verwo", wat: "Betonbestrating, ook natuurlijke look", href: "https://struykverwoinfra.nl", zakelijk: "Via dealer", stalen: { tekst: "Gedrukte catalogi gratis", href: "https://struykverwoinfra.nl/publicaties-aanvragen.html" } },
    ],
  },
  {
    id: "grond",
    naam: "Grond & schors",
    leveranciers: [
      { naam: "Dirix", plaats: "Elsloo", km: 3, wat: "Teelaarde, compost, boomschors, zand; big bag of los gestort", href: "https://www.dirix.nl/tuin-en-bouw", zakelijk: "Vragen" },
      { naam: "Muysers Potgrond", plaats: "Reuver", km: 50, wat: "Dennenschors, Franse schors, compost, teelgrond, big bags", href: "https://www.muyserspotgrond.nl", zakelijk: "Ja, richt zich op hoveniers" },
      { naam: "Attero", plaats: "Maastricht", km: 20, wat: "Keurcompost, ook afhalen", href: "https://www.attero.nl/nl/producten-afnemen/bodemverbeteraars/", zakelijk: "Ja" },
    ],
  },
  {
    id: "planten",
    naam: "Planten",
    leveranciers: [
      { naam: "Tuincentrum Lemmens", plaats: "Munstergeleen", km: 12, wat: "Bomen, heesters, vaste planten; ook compost, schors en bestrating; hoveniers komen er al", href: "https://www.lemmensvof.nl", zakelijk: "Vragen" },
      { naam: "Marnis Kwekerij", plaats: "Bunde", km: 15, wat: "Eigen kweek zonder bestrijdingsmiddelen: vaste planten, schaduwplanten, inheemse soorten", href: "https://www.marnis.nl", zakelijk: "Vragen" },
      { naam: "Kwekerij Bastin", plaats: "Aalbeek", km: 20, wat: "Duurzaam gekweekte vaste planten, prairieplanten, kruiden", href: "https://www.bastin.nl", zakelijk: "Vragen" },
      { naam: "Directplant", wat: "Alle tuinplanten, gratis geleverd", href: "https://www.directplant.nl/customer/account/login/", zakelijk: "Ja, 20% korting", account: "actief" },
      { naam: "Bomenbezorgd", wat: "Bomen", href: "https://www.bomenbezorgdtobusiness.nl/inloggen", zakelijk: "Ja", account: "actief" },
      { naam: "Boomkwekerij H. Maessen", plaats: "Echt", km: 25, wat: "Bomen, hagen, heesters, vaste planten", href: "https://www.limburgplant.nl/home/", zakelijk: "Aangevraagd per mail, 20 okt", account: "wacht" },
      { naam: "Cruydt-Hoeck", wat: "Zaden van inheemse wilde planten", href: "https://www.cruydthoeck.nl", zakelijk: "Vragen", stalen: { tekst: "Gedrukte catalogus bestellen", href: "https://www.cruydthoeck.nl" } },
    ],
  },
  {
    id: "hout",
    naam: "Hout & hekwerk",
    leveranciers: [
      { naam: "Dirix", plaats: "Elsloo", km: 3, wat: "Hardhout, douglas, composiet voor vlonders en schuttingen", href: "https://www.dirix.nl/tuin-en-bouw", zakelijk: "Vragen" },
      { naam: "Houthandel Lemmens", plaats: "Schin op Geul", km: 25, wat: "Groothandel in tuinhout, terrasplanken", href: "https://www.houthandellemmens.nl", zakelijk: "Ja, groothandel" },
      { naam: "Van Engeland de Groot", plaats: "regio Sittard", km: 15, wat: "Tuinhout, timmerhout, plaatmateriaal", href: "https://www.vanengeland-degroot.nl/houthandel-sittard/", zakelijk: "Ja" },
      { naam: "Jongeneel", plaats: "Sittard", km: 12, wat: "Naaldhout, hardhout, bouwmaterialen", href: "https://www.jongeneel.nl/vestiging/jongeneel-sittard", zakelijk: "Ja, in de vestiging" },
      { naam: "Fenceweb", wat: "Hekwerk", href: "https://www.fenceweb.com/nl/customer/account/login/", zakelijk: "In controle", account: "wacht" },
    ],
  },
  {
    id: "gereedschap",
    naam: "Gereedschap",
    leveranciers: [
      { naam: "ToolMax", wat: "Gereedschap", href: "https://www.toolmax.nl/", zakelijk: "Ja", account: "actief" },
      { naam: "Wovar", wat: "IJzerwaren, B2B", href: "https://www.wovar.nl/Customer/Login/", zakelijk: "Ja", account: "actief" },
      { naam: "Dutch Paving Tools", wat: "Bestratingsgereedschap", href: "https://www.dutchpavingtools.com/my-account/", zakelijk: "Ja, nog geen account", account: "uit" },
    ],
  },
  {
    id: "vakbladen",
    naam: "Vakbladen",
    leveranciers: [
      { naam: "Tuin+Landschap", wat: "Vakblad voor hoveniers", href: "https://platform-groen.nl/abonnementen-tuinenlandschap/", zakelijk: "Vanaf € 351 per jaar", stalen: { tekst: "5 dagen gratis proberen", href: "https://platform-groen.nl/abonnementen-tuinenlandschap/" } },
      { naam: "De Hovenier", wat: "Vakblad en nieuwsbrief", href: "https://www.vakbladdehovenier.nl", zakelijk: "Digitaal ± € 85 per jaar", stalen: { tekst: "Nieuwsbrief gratis", href: "https://www.vakbladdehovenier.nl" } },
    ],
  },
]

/** De accounts die je al hebt, voor het overzicht op /dashboard. */
export const LEVERANCIERS = GROEPEN.flatMap((g) =>
  g.leveranciers.filter((l) => l.account).map((l) => ({ ...l, account: l.account as Stand })),
)
