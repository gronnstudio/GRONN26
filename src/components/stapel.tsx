import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react"

// Kaarten die bij het scrollen op elkaar stapelen (eigenaar, 18 okt 2026: "Maak
// deze stapelbaar"). Gedeeld: de voorpagina en de borderpakketten gebruiken het.
// Elk kind is een <li>; het krijgt zijn plek in de stapel als --i, de rest is
// CSS (.stapel in globals.css). Staan de kaarten naast elkaar, dan doet het niets.
export function Stapel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <ul className={`stapel ${className}`}>
      {Children.map(children, (kind, i) =>
        isValidElement<{ style?: CSSProperties }>(kind)
          ? cloneElement(kind as ReactElement<{ style?: CSSProperties }>, { style: { ...kind.props.style, "--i": i } as CSSProperties })
          : kind,
      )}
    </ul>
  )
}
