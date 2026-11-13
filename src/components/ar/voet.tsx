import Link from "next/link"
import "./ar.css"
import { BUSINESS } from "@/lib/business"

// De voet van de nieuwe site: contact, pagina's en de bedrijfsgegevens. Geen
// adres (eigenaar, 11 nov 2026), wel KVK en BTW.
const KOLOMMEN: [string, [string, string][]][] = [
  ["Diensten", [["/vijvers", "Vijvers"], ["/tuinen", "Tuinen"], ["/tuinen/borderpakketten", "Borderpakketten"], ["/shop", "Shop"]]],
  ["Studio", [["/werk", "Werk"], ["/over", "Over mij"], ["/journaal", "Journaal"], ["/faq", "Vragen"]]],
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
      <div className="ar-raster ar-voet-onder">
        <p className="ar-lbl">© 2026 {BUSINESS.name} · Stein en omgeving</p>
        <p className="ar-lbl">KVK {BUSINESS.kvk} · BTW {BUSINESS.btw}</p>
      </div>
    </footer>
  )
}
