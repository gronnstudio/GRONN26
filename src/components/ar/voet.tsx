import Link from "next/link"
import { T } from "@/components/taal"
import type { L } from "@/lib/i18n"
import "./ar.css"
import { BUSINESS } from "@/lib/business"
import { Kopieer } from "@/components/kopieer"

// De voet van de nieuwe site: contact, pagina's en de bedrijfsgegevens. Geen
// adres (eigenaar, 11 nov 2026), wel KVK en BTW.
const KOLOMMEN: [L, [string, L][]][] = [
  [{ nl: "Diensten", en: "Services" }, [["/vijvers", { nl: "Vijvers", en: "Ponds" }], ["/tuinen", { nl: "Tuinen", en: "Gardens" }], ["/tuinen/borderpakketten", { nl: "Borderpakketten", en: "Border packages" }], ["/tuinen/materialen", { nl: "Materialen", en: "Materials" }], ["/shop", { nl: "Shop", en: "Shop" }]]],
  [{ nl: "Studio", en: "Studio" }, [["/werk", { nl: "Projecten", en: "Projects" }], ["/over", { nl: "Over mij", en: "About me" }], ["/journaal", { nl: "Journaal", en: "Journal" }], ["/kennismaken", { nl: "Kennismaken", en: "Get in touch" }], ["/faq", { nl: "Vragen", en: "Questions" }]]],
  [{ nl: "Juridisch", en: "Legal" }, [["/voorwaarden", { nl: "Voorwaarden", en: "Terms" }], ["/privacy", { nl: "Privacy", en: "Privacy" }], ["/herroeping", { nl: "Herroeping", en: "Withdrawal" }], ["/colofon", { nl: "Colofon", en: "Colophon" }], ["/merk", { nl: "Merk", en: "Brand" }], ["/techniek", { nl: "Techniek", en: "Technology" }]]],
]

export function ArVoet() {
  return (
    <footer className="ar-voet">
      <div className="ar-raster ar-voet-boven">
        <div className="ar-voet-contact">
          <p className="ar-lbl">Contact</p>
          <a href={BUSINESS.emailHref} className="ar-voet-groot">{BUSINESS.email}</a>
          <a href={BUSINESS.phoneHref} className="ar-voet-groot tabular-nums">{BUSINESS.phone}</a>
          <div className="ar-voet-sociaal">
            <a href={BUSINESS.whatsapp}>WhatsApp</a>
            <a href={BUSINESS.instagram}>Instagram</a>
            <a href={BUSINESS.linkedin}>LinkedIn</a>
          </div>
        </div>
        <div className="ar-voet-links">
        {KOLOMMEN.map(([kop, links]) => (
          <div key={kop.nl} className="ar-voet-kolom">
            <p className="ar-lbl"><T t={kop} /></p>
            <ul>
              {links.map(([h, t]) => (
                <li key={h}><Link href={h}><T t={t} /></Link></li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>
      {/* kopieerbaar zoals op de huidige site: KVK, BTW en naam worden overgetypt, niet gelezen */}
      <div className="ar-raster ar-voet-onder">
        <div className="ar-voet-kopie">
          <Kopieer label="KVK" waarde={BUSINESS.kvk} />
          <Kopieer label="BTW" waarde={BUSINESS.btw} />
          <Kopieer label="Naam" waarde={BUSINESS.name} />
          {/* inloggen als vierde knop, met doorbroken rand zoals op de live site (eigenaar, 14 nov 2026) */}
          <a href="/dashboard" rel="nofollow" className="ar-voet-login">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <rect x="3" y="7" width="10" height="7" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            <span><T t={{ nl: "Inloggen", en: "Log in" }} /> <span className="ar-voet-login-wie"><T t={{ nl: "eigenaar", en: "owner" }} /></span></span>
          </a>
        </div>
        <div className="ar-voet-rechts">
          <p className="ar-lbl">© 2026 {BUSINESS.name} · <T t={{ nl: "Stein en omgeving", en: "Stein and surroundings" }} /></p>
        </div>
      </div>
      {/* het logo groot als afsluiter; het bestaande woordmerk, niet nagetekend */}
      <div className="ar-raster ar-voet-merk" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="ar-logo-licht" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair.svg" alt="" className="ar-logo-donker" />
      </div>
    </footer>
  )
}
