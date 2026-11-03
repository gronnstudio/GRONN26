// Vertrouwen: wat anderen over het werk zeggen, en waar Nick bij hoort.
//
// LEEG TOT NICK HET AANLEVERT (24 sep 2026). Zolang beide lijsten leeg
// zijn, toont de home niets: geen kop, geen leeg vak, geen voorbeeld.
// Nooit zelf iets invullen — geen verzonnen reactie, geen lidmaatschap
// "dat hij vast heeft". Alleen wat Nick zelf aanlevert, woordelijk.
//
// Wat Nick moet aanleveren:
//
// REACTIES — een reactie van een klant, met toestemming van die klant:
//   - tekst: de reactie zelf, letterlijk (geen samenvatting, niet
//            "opgepoetst");
//   - naam:  alleen de voornaam of de initialen, zoals de klant dat wil
//            ("Marieke" of "M.J."). Nooit een achternaam of adres.
//   De eerste reactie in de lijst staat op de home, na het uitgelichte
//   project.
//
// LIDMAATSCHAPPEN — lidmaatschappen, diploma's of certificaten die Nick
// ECHT heeft (bijv. een brancheorganisatie of een vakopleiding):
//   - naam: de officiële naam, zoals op het bewijsstuk;
//   - link: optioneel, de openbare pagina waar het te controleren is.

export type Reactie = {
  /** De reactie van de klant, letterlijk. */
  tekst: string
  /** Voornaam of initialen, zoals de klant dat wil. */
  naam: string
  /** Taal van de reactie; standaard Nederlands. */
  taal?: "nl" | "en"
}

export type Lidmaatschap = {
  /** Officiële naam van het lidmaatschap, diploma of certificaat. */
  naam: string
  /** Openbare pagina om het te controleren (optioneel). */
  link?: string
}

export const REACTIES: Reactie[] = []

export const LIDMAATSCHAPPEN: Lidmaatschap[] = []
