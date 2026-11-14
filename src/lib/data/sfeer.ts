import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"

// Sfeer bij "helder water" (Nick, 14 nov 2026). Geen tekst óp de beelden (Nick: "Laat sfeerbeeld weg"),
// ook op de voorpagina (Nick, 14 nov 2026). Webversies zonder metadata.
const sfeer = (src: string, width: number, height: number, alt: string, en: string): FotoData => ({ src: `/sfeer/${src}.jpg`, width, height, alt, en: { alt: en } })
export const SFEER = {
  waterval: sfeer("waterval-vijver", 1600, 1065, "Waterval die tussen grote keien in een vijver valt", "Waterfall dropping between boulders into a pond"),
  beek: sfeer("beekloop-stenen", 1063, 1600, "Beekloop over stenen met waterlelies", "Stream over stones with waterlilies"),
  koi: sfeer("vijver-koi", 1600, 1066, "Koi in helder vijverwater, van bovenaf", "Koi in clear pond water, from above"),
  blad: sfeer("vijver-blad", 1066, 1600, "Helder water met planten en gras langs de rand", "Clear water with plants and grass along the edge"),
  bloemen: sfeer("waterval-bloemen", 1600, 1067, "Kleine waterval tussen bloemen en varens", "Small waterfall between flowers and ferns"),
}

// voor de draaiende band op de voorpagina: beschrijvend, geen projectnaam
export const SFEER_BAND = [
  { foto: SFEER.waterval, titel: "Waterval en vijver", soort: "Helder water", href: "/vijvers" },
  { foto: SFEER.beek, titel: "Beekloop", soort: "Biofilter", href: "/vijvers" },
  { foto: SFEER.koi, titel: "Koivijver", soort: "Helder water", href: "/vijvers" },
  { foto: SFEER.bloemen, titel: "Waterval", soort: "Beplanting", href: "/vijvers" },
  { foto: SFEER.blad, titel: "Vijverrand", soort: "Planten", href: "/vijvers" },
]
