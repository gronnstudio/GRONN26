"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"

// De kop uit de handoff "Website 2027" (12 nov 2026): logo, vier links en
// één knop. Transparant bovenaan, na 48px linnen met een dunne lijn. Alleen
// vanaf 1024px; daaronder staat het dock (eigenaar, 13 nov 2026).

export const LINKS = [
  { href: "/#specialismen", label: "Specialismen" },
  { href: "/werk", label: "Projecten" },
  { href: "/#werkwijze", label: "Werkwijze" },
  { href: "/over", label: "Studio" },
]

export function HandoffKop() {
  const pad = usePathname()
  const [gevuld, setGevuld] = useState(false)

  useEffect(() => {
    const kijk = () => setGevuld(window.scrollY > 48)
    kijk()
    window.addEventListener("scroll", kijk, { passive: true })
    return () => window.removeEventListener("scroll", kijk)
  }, [])

  const actief = (href: string) => !href.includes("#") && pad.startsWith(href)

  return (
    <header className="ho-kop" data-gevuld={gevuld || undefined}>
      <a href="#inhoud" className="ho-skip">Naar de inhoud</a>
      <div className="ho-kop-binnen">
        <Link href="/" className="ho-kop-logo" aria-label="GRØNN Studio, naar de voorpagina">
          <Logo className="h-[22px] w-auto" />
        </Link>
        <nav aria-label="Hoofdmenu" className="ho-kop-nav">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={actief(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/start-een-project" className="ho-knop ho-knop-lijn ho-kop-cta">
          Start een project <span aria-hidden>↗</span>
        </Link>
      </div>
    </header>
  )
}
