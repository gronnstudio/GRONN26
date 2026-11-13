// Een getekende pijl in plaats van ↗ ↓ ↑ →: op iPhone viel het teken terug op
// het emoji-lettertype (eigenaar, 13 nov 2026: "mooie getekende pijlen, geen
// emojis"). Lijnt mee met de tekst en neemt de tekstkleur over.

const PADEN = {
  ne: "M5 11 11 5M6 5h5v5",
  n: "M8 13V3M4 7l4-4 4 4",
  s: "M8 3v10M4 9l4 4 4-4",
  e: "M3 8h10M9 4l4 4-4 4",
  w: "M13 8H3M7 4 3 8l4 4",
} as const

export function Pijl({ richting = "ne", className = "" }: { richting?: keyof typeof PADEN; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
    >
      <path d={PADEN[richting]} />
    </svg>
  )
}
