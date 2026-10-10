/** De emberkomeet om de pil, overgenomen van de oude site (gronn-studio,
 *  `orbit-ring`; eigenaar, 10 okt 2026: "look on the old site for the comet").
 *  Een dunne boog die de rand rondgaat; vorm en beweging in globals.css.
 *  Puur versiering; stil bij minder beweging. */
export function Komeet({ as: Tag = "span" }: { as?: "span" | "li" }) {
  return <Tag aria-hidden className="komeet" />
}
