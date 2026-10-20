// Uitgesneden planten als versiering (eigenaar, 20 okt 2026: "green pexels
// photos with trees and flowers ... background remove ... tactically placed").
// Sfeerbeelden van Pexels, vrijgesteld en verkleind tot WebP in public/planten/;
// nooit bij een project, altijd decoratief (alt leeg, aria-hidden). De hangende
// takken zijn verticaal gespiegeld zodat ze uit de bovenhoek komen.
// Bronnen (pexels.com/photo/…): boomkruin 2267547, takken 11552979,
// bladtak 12847431.
const PLANTEN = {
  boomkruin: [484, 640],
  takken: [640, 640],
  bladtak: [600, 598],
} as const

export type PlantNaam = keyof typeof PLANTEN

/** De takken die van boven in een opening hangen, om en om per pagina. */
export const HANGERS: PlantNaam[] = ["bladtak", "boomkruin", "takken"]

export function Plant({ naam, className }: { naam: PlantNaam; className: string }) {
  const [w, h] = PLANTEN[naam]
  return (
    // eslint-disable-next-line @next/next/no-img-element -- al klein en vrijgesteld, geen optimalisatie nodig
    <img src={`/planten/${naam}.webp`} width={w} height={h} alt="" aria-hidden="true" loading="lazy" decoding="async" className={`plant ${className}`} />
  )
}
