import Link from "next/link"
import { BUSINESS } from "@/lib/business"

// De voet uit de handoff (09 / Footer): merkzin, Ontdek, Studio, en de regel
// met jaar en regio. KVK en de juridische pagina's blijven erbij: die horen
// wettelijk op de site.
export function HandoffVoet() {
  return (
    <footer className="ho-voet" id="ho-voet">
      <div className="ho-kolom ho-voet-raster">
        <div>
          <p className="ho-lbl ho-voet-lbl">GRØNN Studio</p>
          <p className="ho-voet-zin">Natuurlijke buitenruimtes, met aandacht vernieuwd.</p>
          <Link href="/start-een-project" className="ho-knop ho-knop-porselein">
            Start een project <span aria-hidden>↗</span>
          </Link>
        </div>
        <nav aria-label="Ontdek">
          <p className="ho-lbl ho-voet-lbl">Ontdek</p>
          <ul>
            <li><Link href="/tuinen">Tuinrenovatie</Link></li>
            <li><Link href="/vijvers">Vijvers &amp; water</Link></li>
            <li><Link href="/#ontwerp-advies">Ontwerp &amp; advies</Link></li>
            <li><Link href="/werk">Projecten</Link></li>
          </ul>
        </nav>
        <nav aria-label="Studio">
          <p className="ho-lbl ho-voet-lbl">Studio</p>
          <ul>
            <li><Link href="/over">Over ons</Link></li>
            <li><Link href="/kennismaken">Contact</Link></li>
            <li><a href={BUSINESS.instagram}>Instagram</a></li>
            <li><Link href="/privacy">Privacyverklaring</Link></li>
          </ul>
        </nav>
      </div>
      <div className="ho-kolom ho-voet-onder">
        <p>© {BUSINESS.name} {new Date().getFullYear()} · Limburg, Nederland</p>
        <p>
          KVK {BUSINESS.kvk} · <Link href="/voorwaarden">Voorwaarden</Link> · <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>
        </p>
      </div>
    </footer>
  )
}
