// Uitgesneden planten als versiering (eigenaar, 20 okt 2026: "green pexels
// photos with trees and flowers ... background remove ... tactically placed").
// Sfeerbeelden van Pexels, vrijgesteld en verkleind tot WebP in public/planten/;
// nooit bij een project, altijd decoratief (alt leeg, aria-hidden). De hangende
// takken zijn verticaal gespiegeld zodat ze uit de bovenhoek komen.
// Bronnen (pexels.com/photo/…): boomkruin 2267547, takken 11552979,
// bladtak 12847431, klaproos 8208112, wit vingerhoedskruid 37443327 (verving
// de korenbloem, eigenaar 21 okt 2026: "de rechterzijde niet zo heel erg"),
// dagpauwoog 13515218. Bloemen en dieren alleen inheems (eigenaar, 20 okt 2026: "gebruik inheemse
// bloemen").
const PLANTEN = {
  boomkruin: [484, 640],
  takken: [640, 640],
  bladtak: [600, 598],
  klaproos: [348, 640],
  vingerhoed: [241, 640],
  dagpauwoog: [266, 320],
} as const

export type PlantNaam = keyof typeof PLANTEN

/** Waar de hommel kan landen, als fractie van het beeld (x, y): de bovenkant
 *  van de bloemen. hommel-scene.ts leest dit uit data-landing. */
const LANDING: Partial<Record<PlantNaam, string>> = {
  klaproos: "0.5,0.04;0.45,0.53",
  vingerhoed: "0.5,0.3;0.45,0.62",
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
