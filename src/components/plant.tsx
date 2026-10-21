// Uitgesneden planten als versiering (eigenaar, 20 okt 2026: "green pexels
// photos with trees and flowers ... background remove ... tactically placed").
// Sfeerbeelden van Pexels, vrijgesteld en verkleind tot WebP in public/planten/;
// nooit bij een project, altijd decoratief (alt leeg, aria-hidden). De hangende
// takken zijn verticaal gespiegeld zodat ze uit de bovenhoek komen.
// Bronnen (pexels.com/photo/…): boomkruin 2267547, takken 11552979,
// bladtak 12847431, klaproos 8208112, korenbloem 5557020 (met fluitenkruid
// en gras), dagpauwoog 13515218. Bloemen en dieren alleen inheems (eigenaar, 20 okt 2026: "gebruik inheemse
// bloemen").
const PLANTEN = {
  boomkruin: [484, 640],
  takken: [640, 640],
  bladtak: [600, 598],
  klaproos: [348, 640],
  korenbloem: [367, 640],
  dagpauwoog: [266, 320],
} as const

export type PlantNaam = keyof typeof PLANTEN

/** Waar de hommel kan landen, als fractie van het beeld (x, y): de bovenkant
 *  van de bloemen. hommel-scene.ts leest dit uit data-landing. */
const LANDING: Partial<Record<PlantNaam, string>> = {
  klaproos: "0.5,0.04;0.45,0.53",
  korenbloem: "0.34,0.72;0.66,0.47",
}

/** De takken die van boven in een opening hangen, om en om per pagina. */
export const HANGERS: PlantNaam[] = ["bladtak", "boomkruin", "takken"]

export function Plant({ naam, className }: { naam: PlantNaam; className: string }) {
  const [w, h] = PLANTEN[naam]
  return (
    // eslint-disable-next-line @next/next/no-img-element -- al klein en vrijgesteld, geen optimalisatie nodig
    <img src={`/planten/${naam}.webp`} width={w} height={h} alt="" aria-hidden="true" loading="lazy" decoding="async" className={`plant ${className}`} data-landing={LANDING[naam]} />
  )
}
