import Link from "next/link"

import { Plaat } from "@/components/Plaat"
import { OVER_KORT, PORTRET } from "@/data/site"

// Nick, kort: het portret als plaat en één uitspraak in zijn eigen woorden.
export function AboutFragment() {
  return (
    <section aria-labelledby="over-kop" className="raster py-[var(--ruimte-sectie)]">
      <p className="tekst-label col-span-4 text-muted md:col-span-12">Over</p>
      <Plaat
        foto={{ ...PORTRET, bijschrift: "Nick Peters — GRØNN Studio" }}
        sizes="(min-width: 768px) 25vw, 70vw"
        className="col-span-3 mt-[40px] md:col-span-3 md:col-start-2 md:mt-[64px]"
      />
      <div className="col-span-4 mt-[56px] md:col-span-6 md:col-start-6 md:mt-[64px] md:self-center">
        <h2 id="over-kop" className="tekst-spread">
          <span className="scroll-regel onthul-regel"><span>{OVER_KORT.uitspraak}</span></span>
        </h2>
        <p className="tekst-groot mt-[40px] max-w-[30ch] text-muted">{OVER_KORT.zin}</p>
        <Link href="/over" className="group mt-[40px] inline-flex items-center gap-[12px] text-[12px] font-semibold uppercase tracking-[0.12em]">
          <span className="border-b border-line/30 pb-[4px] transition-colors group-hover:border-line">Meer over GRØNN</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
        </Link>
      </div>
    </section>
  )
}
