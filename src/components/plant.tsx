import Image from "next/image"

// Uitgesneden planten als versiering (eigenaar, 20 okt 2026: "green pexels
// photos with trees and flowers ... background remove ... tactically placed").
// Sfeerbeelden van Pexels, vrijgesteld en verkleind tot WebP in public/planten/;
// nooit bij een project, altijd decoratief (alt leeg, aria-hidden). De hangende
// takken zijn verticaal gespiegeld zodat ze uit de bovenhoek komen.
// Bronnen (pexels.com/photo/…): boomkruin 2267547, takken 11552979,
// bladtak 12847431, dagpauwoog 13515218. Dieren alleen inheems (eigenaar, 20
// okt 2026). Sinds 22 okt 2026 geen bloemen meer (eigenaar: "haal de bloemen
// uit de footer"), en alleen groen dat ergens aan vastzit: de tak hangt van de
// bovenrand van de pagina (eigenaar: "wat moet dit voorstellen?"). Klimop is
// geprobeerd en afgewezen ("ovreselijk die klimop, weg!").
const PLANTEN = {
  boomkruin: [484, 640],
  takken: [640, 640],
  bladtak: [600, 598],
  dagpauwoog: [266, 320],
} as const

export type PlantNaam = keyof typeof PLANTEN

/** Waar de hommel kan landen, als fractie van het beeld (x, y): op een blad
 *  van de bladtak (bloemen staan er niet meer, eigenaar 22 okt 2026).
 *  hommel-scene.ts leest dit uit data-landing. */
const LANDING: Partial<Record<PlantNaam, string>> = {
  bladtak: "0.42,0.5;0.7,0.78",
}

/** De takken die van boven in een opening hangen, om en om per pagina. */
export const HANGERS: PlantNaam[] = ["bladtak", "boomkruin", "takken"]

export function Plant({ naam, className }: { naam: PlantNaam; className: string }) {
  const [w, h] = PLANTEN[naam]
  // Via next/image: AVIF en alleen zo breed als nodig. Een hangende tak is
  // hooguit 360 breed, de vlinder hooguit 64 (gemeten 21 okt 2026).
  const sizes = className.includes("plant-hang") ? "(min-width: 768px) 360px, 140px" : "64px"
  return (
    <Image src={`/planten/${naam}.webp`} width={w} height={h} sizes={sizes} alt="" aria-hidden="true" className={`plant ${className}`} data-landing={LANDING[naam]} />
  )
}
