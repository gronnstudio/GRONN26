/** De oranje komeet om de pil: één boog van vaste lengte die in tien seconden
 *  langs de rand rondloopt, even snel en even lang bij elke breedte. Puur
 *  versiering; stil bij minder beweging (globals.css). */
export function Komeet({ as: Tag = "span" }: { as?: "span" | "li" }) {
  return (
    <Tag aria-hidden className="komeet">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <rect x="0" y="0" width="100%" height="100%" rx="24" ry="24" pathLength="1" />
      </svg>
    </Tag>
  )
}
