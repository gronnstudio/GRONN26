import { BUSINESS } from "@/data/business"

// Het colofon. Fase 1: alleen de gegevens die wettelijk horen te staan;
// juridische pagina's en de FAQ komen in fase 3.
export function SiteFooter() {
  const { address: a } = BUSINESS
  return (
    <footer className="raster regel mt-[var(--ruimte-sectie)] py-[48px] text-muted">
      <p className="tekst-label col-span-4 md:col-span-3">{BUSINESS.name}</p>
      <address className="tekst-label col-span-4 mt-[16px] not-italic md:col-span-3 md:mt-0">
        {a.street}
        <br />
        {a.postalCode} {a.city}
      </address>
      <p className="tekst-label col-span-4 mt-[16px] md:col-span-3 md:mt-0">
        <a href={BUSINESS.emailHref} className="hover:text-foreground">{BUSINESS.email}</a>
        <br />
        <a href={BUSINESS.phoneHref} className="hover:text-foreground">{BUSINESS.phone}</a>
      </p>
      <p className="tekst-label col-span-4 mt-[16px] md:col-span-3 md:mt-0 md:text-right">
        KVK {BUSINESS.kvk}
        <br />
        BTW {BUSINESS.btw}
      </p>
    </footer>
  )
}
