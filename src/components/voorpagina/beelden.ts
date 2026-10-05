import { TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { fotosVoor, type Foto, type FotoId } from "@/lib/data/vijverrenovatie"

// De foto's van de voorpagina, uit de projectdata maar zonder projectnaam of
// link: op de voorpagina staat geen werk (eigenaar, 4 okt 2026).
const v = (id: FotoId, n = 0): Foto => {
  const f = fotosVoor(id)[n]
  if (!f) throw new Error(`Foto ontbreekt: ${id}-${n + 1}`)
  return f
}

export const F01 = v("F01")
export const F04_2 = v("F04", 1)
export const F05 = v("F05")
export const F07_1 = v("F07", 0)
export const F07_2 = v("F07", 1)
export const F08_2 = v("F08", 1)
export const F10 = v("F10")
export const F11 = v("F11")
export const T01 = TERRAS_FOTOS.hoofd
export const T02 = TERRAS_FOTOS.reeks[0]

/**
 * Sfeerbeeld uit de Brand Guide 2026 (kopie van SFEER.weide in
 * src/lib/data/plekken.ts, dat nog imports uit de oude site mist). Geen werk:
 * het draagt altijd het label Sfeerbeeld.
 */
export const SFEER_WEIDE: Foto = {
  src: "/sfeer/weide-tegenlicht.jpg",
  width: 1600,
  height: 1200,
  alt: "Een hoge, wilde weide in laag tegenlicht, met kleine witte bloemen op de voorgrond.",
  label: "Sfeerbeeld",
}
