import Link from "next/link"

import { AppearanceMenu } from "@/components/AppearanceMenu"
import { KENNISMAKEN } from "@/data/site"

// Alleen wat nodig is: het woordmerk (naar home) en Weergave. Op de
// telefoon staat Kennismaken hier, omdat het menu onderaan dan de hele
// breedte voor de vier woorden nodig heeft. De kop scrollt mee weg; het
// menu onderaan is wat blijft.
export function SiteHeader() {
  return (
    <header className="site-header absolute inset-x-0 top-0 z-30 text-foreground">
      {/* Geen raster hier: op 320px moeten logo, Kennismaken en Weergave
          naast elkaar passen, dus een smallere goot dan de pagina. */}
      <div className="mx-auto flex h-[72px] max-w-[calc(1520px+var(--goot)*2)] items-center justify-between gap-[12px] px-[16px] min-[400px]:px-[var(--goot)] md:h-[88px]">
        <Link href="/" aria-label="GRØNN Studio, naar de voorpagina" className="w-[84px] shrink-0 min-[400px]:w-[104px] md:w-[128px]">
          <span className="woordmerk" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-[8px] md:gap-[24px]">
          <Link
            href={KENNISMAKEN.href}
            className="inline-flex h-[36px] items-center rounded-full bg-gronn-oranje px-[12px] text-[11px] min-[400px]:px-[14px] min-[400px]:text-[12px] font-semibold uppercase tracking-[0.08em] text-gronn-antraciet transition-colors hover:bg-gronn-wit sm:hidden"
          >
            {KENNISMAKEN.label}
          </Link>
          <AppearanceMenu />
        </div>
      </div>
    </header>
  )
}
