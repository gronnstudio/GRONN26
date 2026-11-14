"use client"

import { usePathname } from "next/navigation"
import { TelLink } from "@/components/handoff/klant"
import { BUSINESS } from "@/lib/business"

// Eén vast slot onderaan elke pagina, hetzelfde als op de voorpagina
// (eigenaar, 14 nov 2026: "één actie per pagina"). Het vervangt "Snel geregeld"
// en de losse "Verder"-koppen. Niet op de pagina's die zelf al het formulier
// zijn, en niet achter de inlog.
const WHATSAPP = `${BUSINESS.whatsapp}?text=${encodeURIComponent("Hoi Nick, hier een foto van mijn tuin/vijver. Kun je even meekijken?")}`
const NIET = ["/kennismaken", "/start-een-project", "/dashboard", "/editor", "/os", "/clients", "/offerte", "/offertes", "/factuur", "/werkbon", "/handtekening", "/drukwerk", "/proef", "/wallet", "/offline", "/links", "/downloads"]

export function ArSlot() {
  const pad = usePathname() ?? "/"
  if (NIET.some((p) => pad === p || pad.startsWith(p + "/"))) return null
  return (
    <section className="ar-slot" aria-labelledby="ar-slot">
      <div className="ar-raster">
        <p className="ar-lbl">Plan nu, dan begin ik in maart</p>
        <h2 id="ar-slot" className="ar-slot-kop">Vertel wat je buiten wilt.</h2>
        <div className="ar-knoppen">
          <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="slot" className="ar-knop ar-knop-oranje">Start een project</TelLink>
          <TelLink href={WHATSAPP} gebeurtenis="cta_whatsapp_foto" plek="slot" className="ar-knop ar-knop-lijn-licht">Stuur een foto</TelLink>
        </div>
      </div>
    </section>
  )
}
