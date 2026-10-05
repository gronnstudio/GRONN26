import Link from "next/link"
import { Logo } from "./logo"
import { Weergave } from "./weergave"

export function Kop() {
  return (
    <header className="wrap flex items-center justify-between gap-3 py-6">
      <Link href="/" aria-label="GRØNN Studio, naar de voorpagina">
        <Logo />
      </Link>
      <span className="flex items-center gap-2.5">
        <Link
          href="/kennismaken"
          className="inline-flex h-9 items-center rounded-full bg-oranje px-3 text-[11px] font-semibold tracking-[.08em] text-antraciet no-underline md:hidden"
        >
          KENNISMAKEN
        </Link>
        <Weergave />
      </span>
    </header>
  )
}
