import Link from "next/link"

import { BUSINESS } from "@/data/business"
import { KENNISMAKEN } from "@/data/site"

// Het einde van de voorpagina: één woord, groot, en de gegevens in mono.
export function ClosingInvite() {
  return (
    <section aria-label="Kennismaken" className="raster regel pt-[var(--ruimte-blok)]">
      <Link href={KENNISMAKEN.href} className="tekst-reus group col-span-4 flex items-baseline justify-between gap-[24px] md:col-span-12">
        <span className="transition-colors group-hover:text-ember-text">{KENNISMAKEN.label}</span>
        <span aria-hidden="true" className="hidden text-[0.6em] transition md:inline-transform duration-500 group-hover:translate-x-[12px]">→</span>
      </Link>
      <div className="tekst-label col-span-4 mt-[40px] flex flex-wrap gap-x-[40px] gap-y-[8px] text-muted md:col-span-12">
        <a href={BUSINESS.emailHref} className="hover:text-foreground">{BUSINESS.email}</a>
        <a href={BUSINESS.phoneHref} className="hover:text-foreground">{BUSINESS.phone}</a>
        <span>{BUSINESS.address.city} en omgeving</span>
      </div>
    </section>
  )
}
