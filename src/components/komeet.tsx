// De staart in stukjes van gelijke lengte, van uitgedoofd naar fel. Ze liggen
// aaneen op de rand en schuiven samen op, dus de komeet is overal even lang
// en even snel, ook in een brede pil (een draaiend kegelverloop is dat niet).
const LENGTE = 0.14 // deel van de omtrek
const STUKJES = 14
const STUK = LENGTE / STUKJES

/** De emberkomeet om de pil: een felle oranje kop met een staart die
 *  uitdooft, in zes seconden langs de rand. Puur versiering; stil bij minder
 *  beweging (globals.css). `scherm`: dezelfde komeet om het hele scherm,
 *  sneller en dikker, tijdens de paginawissel. */
export function Komeet({ as: Tag = "span", scherm = false }: { as?: "span" | "li"; scherm?: boolean }) {
  return (
    <Tag aria-hidden className={scherm ? "komeet komeet-scherm" : "komeet"}>
      <svg width="100%" height="100%" preserveAspectRatio="none">
        {Array.from({ length: STUKJES }, (_, i) => (
          <rect key={i} x="0" y="0" width="100%" height="100%" pathLength="1"
            strokeOpacity={((i + 1) / STUKJES) ** 1.5}
            strokeDasharray={`0 ${i * STUK} ${STUK} ${1 - (i + 1) * STUK}`} />
        ))}
      </svg>
    </Tag>
  )
}
