import type { L } from "@/lib/i18n"

// Megamenu's op desktop (eigenaar, 22 nov 2026: "maak mega menu groter, zet op
// allerhande links een interactief mega menu op desktop!"). Elke sectie in de
// dock klapt bij aanwijzen een groot paneel open: links de onderdelen, rechts
// een groot beeld dat meewisselt met het onderdeel onder de muis.
export type MegaLink = { href: string; naam: L; sub: L; beeld: string }
export type Mega = { titel: L; links: MegaLink[]; alles: { href: string; naam: L } }

export const MEGA: Record<string, Mega> = {
  "/werk": {
    titel: { nl: "Werk", en: "Work" },
    links: [
      { href: "/werk/vijverrenovatie", naam: { nl: "Vijverrenovatie", en: "Pond renovation" }, sub: { nl: "Twee vijvers, één systeem", en: "Two ponds, one system" }, beeld: "/projecten/vijverrenovatie/F01.jpg" },
      { href: "/werk/terras-geulle", naam: { nl: "Terras in Geulle", en: "Terrace in Geulle" }, sub: { nl: "Een nieuw terras onder de overkapping", en: "A new terrace under the canopy" }, beeld: "/projecten/terras-geulle/T01.jpg" },
      { href: "/werk", naam: { nl: "Alle projecten", en: "All projects" }, sub: { nl: "Echt werk uit Stein en omgeving", en: "Real work around Stein" }, beeld: "/projecten/vijverrenovatie/F10.jpg" },
    ],
    alles: { href: "/werk", naam: { nl: "Al het werk", en: "All work" } },
  },
  "/vijvers": {
    titel: { nl: "Vijvers", en: "Ponds" },
    links: [
      { href: "/vijvers/aanleggen", naam: { nl: "Nieuwe vijver", en: "New pond" }, sub: { nl: "Vanaf € 2.500", en: "From € 2,500" }, beeld: "/sfeer/waterval-vijver.jpg" },
      { href: "/vijvers/renoveren-en-onderhoud", naam: { nl: "Renovatie", en: "Renovation" }, sub: { nl: "Vanaf € 4.500", en: "From € 4,500" }, beeld: "/landschap/vijver-terras.jpg" },
      { href: "/vijvers/renoveren-en-onderhoud", naam: { nl: "Onderhoud", en: "Maintenance" }, sub: { nl: "€ 45 per maand, twee bezoeken per jaar", en: "€ 45 a month, two visits a year" }, beeld: "/sfeer/vijver-koi.jpg" },
      { href: "/vijvers/waterval-en-beekloop", naam: { nl: "Helder water", en: "Clear water" }, sub: { nl: "Zonder filter schoonmaken", en: "Without cleaning filters" }, beeld: "/sfeer/vijver-blad.jpg" },
    ],
    alles: { href: "/vijvers", naam: { nl: "Alles over vijvers", en: "All about ponds" } },
  },
  "/tuinen": {
    titel: { nl: "Tuinen", en: "Gardens" },
    links: [
      { href: "/tuinen#tuin-diensten", naam: { nl: "Ontwerp en aanleg", en: "Design and build" }, sub: { nl: "Van eerste blik tot aanleg", en: "From first look to build" }, beeld: "/landschap/tuin-voorbeeld.jpg" },
      { href: "/tuinen#tuin-elementen", naam: { nl: "Wat er kan", en: "What is possible" }, sub: { nl: "Poel, border, stapelmuur, haag", en: "Pool, border, dry wall, hedge" }, beeld: "/landschap/poel.jpg" },
      { href: "/tuinen/borderpakketten", naam: { nl: "Borderpakketten", en: "Border packages" }, sub: { nl: "Zelf aan de slag", en: "Do it yourself" }, beeld: "/borderpakketten/vlinderborder.jpg" },
      { href: "/tuinen/materialen", naam: { nl: "Materialen", en: "Materials" }, sub: { nl: "Steen, grind en hout", en: "Stone, gravel and wood" }, beeld: "/landschap/sfeer-materialen.jpg" },
    ],
    alles: { href: "/tuinen", naam: { nl: "Alles over tuinen", en: "All about gardens" } },
  },
  "/over": {
    titel: { nl: "Studio", en: "Studio" },
    links: [
      { href: "/over", naam: { nl: "Over Nick", en: "About Nick" }, sub: { nl: "Wie de tuin maakt", en: "Who builds the garden" }, beeld: "/nick/portret-espresso.jpg" },
      { href: "/over#h-verhaal", naam: { nl: "Waar ik vandaan kom", en: "Where I come from" }, sub: { nl: "Het verhaal achter GRØNN", en: "The story behind GRØNN" }, beeld: "/nick/zaagtafel-lach.jpg" },
      { href: "/techniek", naam: { nl: "Techniek", en: "Tools" }, sub: { nl: "Het gereedschap dat ik gebruik", en: "The tools I use" }, beeld: "/landschap/zitmuur.jpg" },
    ],
    alles: { href: "/kennismaken", naam: { nl: "Kennismaken", en: "Get in touch" } },
  },
  "/journaal": {
    titel: { nl: "Journaal", en: "Journal" },
    links: [
      { href: "/journaal/tuin-in-de-winter", naam: { nl: "Je tuin in de winter", en: "Your garden in winter" }, sub: { nl: "Wat je laat staan en wat je snoeit", en: "What to leave and what to prune" }, beeld: "/blog/winter-border-berijpt.jpg" },
      { href: "/journaal/paddenstoelen-in-de-tuin", naam: { nl: "Paddenstoelen", en: "Mushrooms" }, sub: { nl: "Goed teken of reden tot zorg?", en: "Good sign or cause for concern?" }, beeld: "/blog/paddenstoelen-op-mos.jpg" },
      { href: "/journaal/egelvriendelijke-tuin", naam: { nl: "Egelvriendelijke tuin", en: "Hedgehog-friendly garden" }, sub: { nl: "Help de egel de winter door", en: "Help hedgehogs through winter" }, beeld: "/blog/egel-close.jpg" },
      { href: "/journaal/vijver-winterklaar-maken", naam: { nl: "Vijver winterklaar", en: "Pond ready for winter" }, sub: { nl: "Zo kom je de vorst door", en: "Getting through the frost" }, beeld: "/blog/waterval-na-herfstbeurt.jpg" },
    ],
    alles: { href: "/journaal", naam: { nl: "Alle stukken", en: "All articles" } },
  },
  "/shop": {
    titel: { nl: "Shop", en: "Shop" },
    links: [
      { href: "/shop?soort=border#borders", naam: { nl: "Borderpakketten", en: "Border packages" }, sub: { nl: "Acht borders, opgestuurd of aangeplant", en: "Eight borders, shipped or planted" }, beeld: "/borderpakketten/vlinderborder.jpg" },
      { href: "/shop?soort=bodem#borders", naam: { nl: "Bodem", en: "Soil" }, sub: { nl: "Compost met schors", en: "Compost with bark" }, beeld: "/borderpakketten/compost-franse-schors.jpg" },
      { href: "/shop?soort=bodem#borders", naam: { nl: "Border op maat", en: "Custom border" }, sub: { nl: "Ik kom kijken en stel hem samen", en: "I come and look and put it together" }, beeld: "/borderpakketten/schaduwborder.jpg" },
      { href: "/shop#cadeau", naam: { nl: "Cadeaubon", en: "Gift card" }, sub: { nl: "Zelf het bedrag kiezen", en: "Choose the amount yourself" }, beeld: "/borderpakketten/plukborder.jpg" },
    ],
    alles: { href: "/shop", naam: { nl: "Alles in de shop", en: "Everything in the shop" } },
  },
}
