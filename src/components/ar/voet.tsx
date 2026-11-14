import Link from "next/link"
import "./ar.css"
import { BUSINESS } from "@/lib/business"
import { Kopieer } from "@/components/kopieer"

// De voet van de nieuwe site: contact, pagina's en de bedrijfsgegevens. Geen
// adres (eigenaar, 11 nov 2026), wel KVK en BTW.
const KOLOMMEN: [string, [string, string][]][] = [
  ["Diensten", [["/vijvers", "Vijvers"], ["/tuinen", "Tuinen"], ["/tuinen/borderpakketten", "Borderpakketten"], ["/shop", "Shop"]]],
  ["Studio", [["/werk", "Projecten"], ["/over", "Over mij"], ["/journaal", "Journaal"], ["/faq", "Vragen"]]],
  ["Juridisch", [["/voorwaarden", "Voorwaarden"], ["/privacy", "Privacy"], ["/herroeping", "Herroeping"], ["/colofon", "Colofon"]]],
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
          <div key={kop} className="ar-voet-kolom">
            <p className="ar-lbl">{kop}</p>
            <ul>
              {links.map(([h, t]) => (
                <li key={h}><Link href={h}>{t}</Link></li>
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
        </div>
        <div className="ar-voet-rechts">
          <a href="/dashboard" rel="nofollow" className="ar-lbl ar-voet-login">Inloggen · alleen eigenaar</a>
          <p className="ar-lbl">© 2026 {BUSINESS.name} · Stein en omgeving</p>
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
