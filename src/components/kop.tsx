import Link from "next/link"
import { Logo } from "./logo"

// Geen bovenbalk (eigenaar, 5 okt 2026). Vanaf 1024px zit het woordmerk in
// de menupil en Kennismaken linksonder; op de telefoon is daar geen plek, dus
// staan het woordmerk (de weg naar huis) en Kennismaken bovenaan op de
// opening, los, en scrollen mee weg.
export function Kop() {
  return (
    <div className="absolute inset-x-0 top-0 z-50 lg:hidden">
      <div className="wrap flex items-center justify-between py-5">
        <Link href="/" aria-label="GRØNN Studio, naar de voorpagina">
          <Logo className="h-[18px] w-auto" />
        </Link>
        <Link
          href="/kennismaken"
          className="inline-flex h-9 items-center rounded-full bg-oranje px-3 text-[11px] font-bold tracking-[.06em] text-antraciet uppercase no-underline"
        >
          Kennismaken
        </Link>
      </div>
    </div>
  )
}
