"use client"

import { T } from "@/components/taal"
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
        <p className="ar-lbl"><T t={{ nl: "Plan nu, dan begin ik in maart", en: "Plan now and I start in March" }} /></p>
        <h2 id="ar-slot" className="ar-slot-kop"><T t={{ nl: "Vertel wat je buiten wilt.", en: "Tell me what you want outside." }} /></h2>
        <div className="ar-knoppen">
          <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="slot" className="ar-knop ar-knop-oranje"><T t={{ nl: "Start een project", en: "Start a project" }} /></TelLink>
          <TelLink href={WHATSAPP} gebeurtenis="cta_whatsapp_foto" plek="slot" className="ar-knop ar-knop-lijn-licht"><T t={{ nl: "Stuur een foto", en: "Send a photo" }} /></TelLink>
        </div>
      </div>
    </section>
  )
}
