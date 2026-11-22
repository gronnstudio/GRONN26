"use client"

import Link from "next/link"
import { kies } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"

// Bovenaan alleen het logo. De navigatie is weer het dock van de live site
// onderin (eigenaar, 22 nov 2026: "Tevens wil ik dock van de live site"), in
// src/components/ar/kop.tsx; zijn Menu klapt groot uit.
function Logo() {
  return (
    <>
      {/* het bestaande woordmerk, nooit nagetekend: antraciet op licht, wit met de oranje P op donker */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="ls-logo-licht" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair.svg" alt="" className="ls-logo-donker" />
    </>
  )
}

export function SiteKop() {
  const taal = useTaal()
  return (
    <header className="ls-kop">
      <div className="ls-raster ls-kop-binnen">
        <Link href="/" className="ls-logo" aria-label={kies({ nl: "GRØNN Studio, naar de voorpagina", en: "GRØNN Studio, to the home page" }, taal)}>
          <Logo />
        </Link>
      </div>
    </header>
  )
}
