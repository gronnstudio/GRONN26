"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import { Kopieer } from "@/components/kopieer"
import { TelLink } from "@/components/handoff/klant"
import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"

// ContactInvitation en SiteFooter uit de bouwbrief (§10, beelden 12 en 23):
// één donker slot onderaan elke pagina met één hoofdactie naar de bestaande
// intake, de bestaande contactgegevens uit business.ts en daaronder de
// secundaire en juridische links. Geen adres (eigenaar, 11 nov 2026). Op de
// pagina's die zelf het formulier zijn staat alleen de voet.
const ZONDER_UITNODIGING = ["/kennismaken", "/start-een-project"]

const RIJEN: [string, L][][] = [
  [["/werk", { nl: "Werk", en: "Work" }], ["/vijvers", { nl: "Vijvers", en: "Ponds" }], ["/tuinen", { nl: "Tuinen", en: "Gardens" }]],
  [["/over", { nl: "Studio", en: "Studio" }], ["/tuinen/borderpakketten", { nl: "Zelf aan de slag", en: "Do it yourself" }], ["/journaal", { nl: "Journaal", en: "Journal" }], ["/faq", { nl: "Vragen", en: "Questions" }], ["/shop", { nl: "Shop", en: "Shop" }], ["/kennismaken", { nl: "Contact", en: "Contact" }]],
  [["/privacy", { nl: "Privacy", en: "Privacy" }], ["/voorwaarden", { nl: "Voorwaarden", en: "Terms" }], ["/herroeping", { nl: "Herroeping", en: "Withdrawal" }], ["/colofon", { nl: "Colofon", en: "Colophon" }], ["/merk", { nl: "Merk", en: "Brand" }]],
]

export function SiteVoet() {
  const pad = usePathname() ?? "/"
  const uitnodiging = !ZONDER_UITNODIGING.some((p) => pad === p || pad.startsWith(p + "/"))
  return (
    <footer className="ls ls-voet">
      {uitnodiging ? (
        <section className="ls-raster ls-uitnodiging" aria-labelledby="ls-uitnodiging">
          <div className="ls-uitnodiging-tekst">
            <p className="ls-label"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></p>
            <h2 id="ls-uitnodiging" className="ls-display"><T t={{ nl: "Vertel wat je buiten wilt.", en: "Tell me what you want outside." }} /></h2>
            <p className="ls-body ls-lees">
              <T t={{ nl: "Heb je een tuin of vijver die aandacht nodig heeft? Vertel kort wat er speelt en wat je graag zou veranderen.", en: "Do you have a garden or pond that needs attention? Tell me briefly what's going on and what you'd like to change." }} />
            </p>
            <div className="ls-knoppen">
              <TelLink href="/kennismaken" gebeurtenis="cta_kennismaken" plek="slot" className="ls-knop ls-knop-actie">
                <T t={{ nl: "Kennismaken", en: "Get in touch" }} /> <Pijl richting="ne" />
              </TelLink>
            </div>
          </div>
          <ul className="ls-uitnodiging-contact">
            <li><a href={BUSINESS.emailHref}>{BUSINESS.email}</a></li>
            <li><a href={BUSINESS.phoneHref} className="tabular-nums">{BUSINESS.phone}</a></li>
            <li><a href={BUSINESS.whatsapp}>WhatsApp</a></li>
            <li><T t={{ nl: "Stein en omgeving", en: "Stein and surroundings" }} /></li>
          </ul>
        </section>
      ) : null}

      <div className="ls-raster ls-voet-links">
        {RIJEN.map((rij, i) => (
          <ul key={i}>
            {rij.map(([href, naam]) => (
              <li key={href}><Link href={href}><T t={naam} /></Link></li>
            ))}
          </ul>
        ))}
      </div>

      <div className="ls-raster ls-voet-onder">
        <div className="ls-voet-kopie">
          <Kopieer label="KVK" waarde={BUSINESS.kvk} />
          <Kopieer label="BTW" waarde={BUSINESS.btw} />
          {/* ronde knoppen in de kleur van Instagram en LinkedIn (eigenaar, 22 nov 2026) */}
          <a href={BUSINESS.instagram} className="ls-voet-sociaal ls-voet-insta" aria-label="Instagram" title="Instagram">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
          </a>
          <a href={BUSINESS.linkedin} className="ls-voet-sociaal ls-voet-linkedin" aria-label="LinkedIn" title="LinkedIn">
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z" /></svg>
          </a>
          <a href="/dashboard" rel="nofollow" className="ls-voet-login"><T t={{ nl: "Inloggen eigenaar", en: "Owner log in" }} /></a>
        </div>
        <p className="ls-annotatie">© 2026 {BUSINESS.name} · <span lang="en">Designing Living Ecosystems</span></p>
      </div>
    </footer>
  )
}
