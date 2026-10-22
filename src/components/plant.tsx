import Image from "next/image"

// Uitgesneden planten als versiering (eigenaar, 20 okt 2026: "green pexels
// photos with trees and flowers ... background remove ... tactically placed").
// Sfeerbeelden van Pexels, vrijgesteld en verkleind tot WebP in public/planten/;
// nooit bij een project, altijd decoratief (alt leeg, aria-hidden). De hangende
// takken zijn verticaal gespiegeld zodat ze uit de bovenhoek komen.
// Bronnen (pexels.com/photo/…): boomkruin 2267547, takken 11552979,
// bladtak 12847431, dagpauwoog 13515218, klimop 3826765 (twee ranken uit één
// foto, de linker gespiegeld). Dieren alleen inheems (eigenaar, 20 okt 2026).
// Sinds 22 okt 2026 alleen groen, geen bloemen meer (eigenaar: "voeg meer
// groene elementen toe ... haal de bloemen uit de footer"), en alleen groen dat
// ergens aan vastzit: een tak hangt van de bovenrand van de pagina, klimop
// groeit op vanaf de grond (eigenaar: "wat moet dit voorstellen?").
const PLANTEN = {
  boomkruin: [484, 640],
  takken: [640, 640],
  bladtak: [600, 598],
  dagpauwoog: [266, 320],
  "klimop-links": [560, 790],
  "klimop-rechts": [187, 900],
} as const

export type PlantNaam = keyof typeof PLANTEN

/** Waar de hommel kan landen, als fractie van het beeld (x, y): op een blad
 *  van de bladtak of de klimop (bloemen staan er niet meer, eigenaar 22 okt
 *  2026). hommel-scene.ts leest dit uit data-landing. */
const LANDING: Partial<Record<PlantNaam, string>> = {
  bladtak: "0.42,0.5;0.7,0.78",
  "klimop-links": "0.7,0.39;0.32,0.85",
  "klimop-rechts": "0.47,0.67",
}

/** De takken die van boven in een opening hangen, om en om per pagina. */
export const HANGERS: PlantNaam[] = ["bladtak", "boomkruin", "takken"]

export function Plant({ naam, className }: { naam: PlantNaam; className: string }) {
  const [w, h] = PLANTEN[naam]
  // Via next/image: AVIF en alleen zo breed als nodig. Een hangende tak is
  // hooguit 360 breed, de vlinder hooguit 64 (gemeten 21 okt 2026).
  const sizes = className.includes("plant-hang") ? "(min-width: 768px) 360px, 140px" : className.includes("plant-klim") ? "(min-width: 768px) 300px, 100px" : "64px"
  return (
    <Image src={`/planten/${naam}.webp`} width={w} height={h} sizes={sizes} alt="" aria-hidden="true" className={`plant ${className}`} data-landing={LANDING[naam]} />
  )
}
