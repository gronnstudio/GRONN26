// Staart van kort naar lang: elke laag eindigt op dezelfde kop, dus waar ze
// allemaal overlappen is hij fel en naar achteren dooft hij uit.
const STAART = [0.02, 0.05, 0.09, 0.14, 0.2, 0.27]
const KOP = STAART[STAART.length - 1]

/** De oranje komeet om de pil: een felle kop met een uitdovende staart die in
 *  tien seconden langs de rand rondloopt, even snel en even lang bij elke
 *  breedte. Puur versiering; stil bij minder beweging (globals.css). */
export function Komeet({ as: Tag = "span" }: { as?: "span" | "li" }) {
  return (
    <Tag aria-hidden className="komeet">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        {STAART.map((l) => (
          <rect key={l} x="0" y="0" width="100%" height="100%" rx="24" ry="24" pathLength="1"
            strokeDasharray={`0 ${KOP - l} ${l} ${1 - KOP}`} />
        ))}
      </svg>
    </Tag>
  )
}
