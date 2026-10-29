// Lijniconen voor het bedrijfssysteem: één set, 20 × 20, lijn 1,6, in de
// kleur van de tekst. Zelf getekend in plaats van een iconenpakket (ADR 0003:
// geen nieuwe afhankelijkheden voor iets van een paar regels).
const PADEN = {
  vandaag: "M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4M10 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z",
  aanvragen: "M3 5.5h14v9H3zM3 6l7 5 7-5",
  klanten: "M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 17c0-2.8 2.2-5 5-5s5 2.2 5 5M13 3.3a3 3 0 0 1 0 5.4M14.5 12.2c1.8.6 3 2.4 3 4.8",
  planning: "M3.5 5h13v11.5h-13zM3.5 8.5h13M7 3v3.5M13 3v3.5M6.5 11.5h2M11.5 11.5h2M6.5 14h2",
  calculaties: "M5 2.5h10v15H5zM7.5 5.5h5M7.5 9h1M11.5 9h1M7.5 12h1M11.5 12h1M7.5 15h1M11.5 15h1",
  prijs: "M10 2.5v15M13.5 5.5H8.25a2.25 2.25 0 0 0 0 4.5h3.5a2.25 2.25 0 0 1 0 4.5H6",
  catalogus: "M3 4.5 10 2l7 2.5v11L10 18l-7-2.5zM3 4.5 10 7l7-2.5M10 7v11",
  leveranciers: "M2.5 13.5V6h9v7.5M11.5 9h3.2l2.8 2.8v1.7h-6M5.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM14.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  geld: "M2.5 5.5h15v9h-15zM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 8v4M15 8v4",
  uren: "M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM10 6v4.2l2.8 1.8",
  social: "M3 3h14v14H3zM3 13l4-4 3 3 2-2 5 5M13 7.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z",
  links: "M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8",
  zoek: "M9 15.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM13.7 13.7l3.8 3.8",
  plus: "M10 4v12M4 10h12",
  grønn: "M10 17.5c-4-1.5-6-4.5-6-8.5 3 0 5 1 6 3 1-2 3-3 6-3 0 4-2 7-6 8.5ZM10 12V3",
  inklappen: "M12.5 5 7.5 10l5 5",
  uitklappen: "M7.5 5l5 5-5 5",
  site: "M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM2.5 10h15M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5c-2-2-3-4.5-3-7.5s1-5.5 3-7.5Z",
  uit: "M8 3.5H4v13h4M12.5 6.5 16 10l-3.5 3.5M16 10H7.5",
  sluit: "M5 5l10 10M15 5 5 15",
  pijl: "M4 10h12M11 5l5 5-5 5",
} as const

export type Icoon = keyof typeof PADEN

export function Icoon({ naam, className = "size-[18px]" }: { naam: Icoon; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 ${className}`}>
      <path d={PADEN[naam]} />
    </svg>
  )
}
