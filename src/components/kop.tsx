import Link from "next/link"

// Geen bovenbalk en geen logo bovenaan (eigenaar, 5 okt 2026: "haal die
// bovenbalk helemaal weg", "zet dat logo onderin bij de pil"). Het woordmerk
// en de regelaar zitten in de menupil (menu.tsx). Alleen op de telefoon staat
// Kennismaken rechtsboven op de donkere opening, want daar is onderin geen
// plek voor; vanaf 1024px zit die knop linksonder bij het menu.
export function Kop() {
  return (
    <div className="absolute top-6 right-[var(--goot)] z-50 lg:hidden">
      <Link
        href="/kennismaken"
        className="inline-flex h-9 items-center rounded-full bg-oranje px-3 text-[11px] font-bold tracking-[.06em] text-antraciet uppercase no-underline"
      >
        Kennismaken
      </Link>
    </div>
  )
}
