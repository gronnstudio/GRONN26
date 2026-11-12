"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Logo } from "@/components/logo"

// De kop uit de handoff "Website 2027" (12 nov 2026): logo, vier links en
// één knop. Transparant bovenaan, na 48px linnen met een dunne lijn. Op de
// telefoon een schermvullend menu; <dialog> geeft de focusval en Escape, de
// CSS zet het scrollen van de pagina eronder stil.

export const LINKS = [
  { href: "/#specialismen", label: "Specialismen" },
  { href: "/werk", label: "Projecten" },
  { href: "/#werkwijze", label: "Werkwijze" },
  { href: "/over", label: "Studio" },
]

export function HandoffKop() {
  const pad = usePathname()
  const [gevuld, setGevuld] = useState(false)
  const menu = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const kijk = () => setGevuld(window.scrollY > 48)
    kijk()
    window.addEventListener("scroll", kijk, { passive: true })
    return () => window.removeEventListener("scroll", kijk)
  }, [])

  // Een nieuwe pagina sluit het menu.
  useEffect(() => {
    menu.current?.close()
  }, [pad])

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
        <Link href="/start-een-project" className="ho-knop ho-knop-bos ho-kop-cta">
          Start een project <span aria-hidden>↗</span>
        </Link>
        <button type="button" className="ho-kop-menuknop" onClick={() => menu.current?.showModal()}>
          Menu
        </button>
      </div>

      <dialog ref={menu} className="ho-menu" aria-label="Menu">
        <div className="ho-menu-kop">
          <Logo className="h-[22px] w-auto" />
          <button type="button" className="ho-kop-menuknop" onClick={() => menu.current?.close()}>
            Sluiten
          </button>
        </div>
        <nav aria-label="Menu" className="ho-menu-nav">
          <Link href="/" onClick={() => menu.current?.close()}>Home</Link>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => menu.current?.close()}>
              {l.label}
            </Link>
          ))}
          <Link href="/kennismaken" onClick={() => menu.current?.close()}>Contact</Link>
        </nav>
        <Link href="/start-een-project" className="ho-knop ho-knop-bos ho-menu-cta" onClick={() => menu.current?.close()}>
          Start een project <span aria-hidden>↗</span>
        </Link>
      </dialog>
    </header>
  )
}
