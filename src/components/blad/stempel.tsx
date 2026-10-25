"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BUSINESS } from "@/lib/business"
import { T } from "@/components/taal"
import { LayoutWissel } from "@/components/weergave"
import { BLADEN, bladVan } from "./bladen"

// De voet als het stempelvak van een tekening (tuinplan, 24 okt 2026): wie
// ontwerpt en uitvoert, voor wie, waar, hoe je contact opneemt, de bladindex
// en de kleine lettertjes, in een raster van vakken met dunne lijnen.
export function Stempel() {
  const nu = bladVan(usePathname())
  const a = BUSINESS.address
  return (
    <footer className="stempel wrap" aria-label="Stempelvak">
      <div className="st-raster">
        <div className="st-vak st-merk">
          <p className="st-lbl"><T t={{ nl: "Ontwerp en uitvoering", en: "Design and build" }} /></p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt={BUSINESS.name} className="st-logo dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt={BUSINESS.name} className="st-logo hidden dark:block" />
          <p className="m-0">Nick Peters</p>
        </div>
        <div className="st-vak">
          <p className="st-lbl"><T t={{ nl: "Opdrachtgever", en: "Client" }} /></p>
          <p className="m-0"><T t={{ nl: "Huiseigenaren in Stein en omgeving (± 30 km)", en: "Homeowners in Stein and surroundings (± 30 km)" }} /></p>
        </div>
        <div className="st-vak">
          <p className="st-lbl">Studio</p>
          <p className="m-0">
            {a.street}
            <br />
            {a.postalCode} {a.city}
          </p>
        </div>
        <div className="st-vak">
          <p className="st-lbl">Contact</p>
          <a href={BUSINESS.emailHref} className="st-link [overflow-wrap:anywhere]">{BUSINESS.email}</a>
          <a href={BUSINESS.phoneHref} className="st-link tabular-nums">{BUSINESS.phone}</a>
          <a href={BUSINESS.whatsapp} className="st-link">WhatsApp</a>
          <a href={BUSINESS.instagram} className="st-link">Instagram</a>
        </div>
        <nav className="st-vak st-index" aria-label="Bladen">
          <p className="st-lbl"><T t={{ nl: "Bladen", en: "Sheets" }} /></p>
          <ol>
            {BLADEN.map((b) => (
              <li key={b.nr}>
                <Link href={b.href} className="st-link" aria-current={nu?.nr === b.nr ? "page" : undefined}>
                  <span className="st-nr">{b.nr}</span> <T t={b.titel} />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="st-vak st-klein">
          <p className="st-lbl"><T t={{ nl: "Kleine lettertjes", en: "Small print" }} /></p>
          {(
            [
              ["/privacy", "Privacy"],
              ["/voorwaarden", { nl: "Voorwaarden", en: "Terms" }],
              ["/faq", { nl: "Vragen", en: "FAQ" }],
              ["/colofon", { nl: "Colofon", en: "Colophon" }],
            ] as const
          ).map(([h, t]) => (
            <Link key={h} href={h} className="st-link"><T t={t} /></Link>
          ))}
          <a href="/dashboard" rel="nofollow" className="st-link"><T t={{ nl: "Inloggen (eigenaar)", en: "Log in (owner)" }} /></a>
          <LayoutWissel className="st-link st-wissel" />
        </div>
        <div className="st-vak st-meta">
          <p className="st-lbl">Blad</p>
          <p className="st-groot">{nu?.nr ?? "—"}</p>
        </div>
        <div className="st-vak st-meta">
          <p className="st-lbl"><T t={{ nl: "Schaal", en: "Scale" }} /></p>
          <p className="st-groot">1:1</p>
        </div>
        <div className="st-vak st-meta st-breed">
          <p className="st-lbl">KVK · BTW</p>
          <p className="m-0 tabular-nums">{BUSINESS.kvk} · {BUSINESS.btw}</p>
        </div>
      </div>
    </footer>
  )
}
