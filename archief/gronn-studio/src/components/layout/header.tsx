"use client"

import { useEffect, useState } from "react"
import { LocaleLink as Link } from "@/components/locale-link"
import { usePathname } from "next/navigation"

import { Logo } from "@/components/logo"
import { BREEDTE } from "@/components/gronn/elementen/breedte"
import { BarPanels } from "@/components/layout/bar-panels"
import { ConceptMenu } from "@/components/layout/concept-menu"
import { Komeet } from "@/components/layout/komeet"
import { TabletMenu } from "@/components/layout/tablet-menu"
import {
  ControlGroup,
  HoursSwitch,
  LanguageSwitch,
  SearchTrigger,
} from "@/components/layout/header-controls"
import { useT } from "@/components/language-provider"
import { stripLocale } from "@/lib/locale"
import { START_PROJECT } from "@/lib/nav"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"
import type { Article } from "@/lib/data/journal"
import type { Project } from "@/lib/data/projects"
import type { Service } from "@/lib/data/services"
import type { MenuContent } from "@/lib/nav"

export function Header({
  content,
  featured,
  latestArticle,
  services,
}: {
  /** Wat de menu's tekenen — één vorm voor tablet, balk en telefoon. */
  content: MenuContent
  featured: Project
  latestArticle?: Article
  /** Volledig, voor de uitgelichte seizoenskaart in het dienstenpaneel. */
  services: Service[]
}) {
  const pathname = usePathname()
  // Locale-stripped route for active states: a fresh load sits on the
  // middleware-rewritten "/en" (Dutch on "/nl/..."), so comparing the
  // raw pathname missed the current page until a client navigation.
  const route = stripLocale(pathname)
  const t = useT()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Phones: the logo comes and goes with scroll direction — reading
  // (scrolling down) drifts it out to the left, scrolling back up
  // glides it back in: the same horizontal fold language as the dock's
  // wings below, one motion system top and bottom (owner direction).
  // Small deltas are ignored so Lenis' easing tail and iOS
  // rubber-banding don't make it flutter. Desktop ignores this.
  const reduced = useReducedMotion()
  const [logoHidden, setLogoHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const dy = y - lastY
      lastY = y
      if (y < 80) setLogoHidden(false)
      else if (dy > 4) setLogoHidden(true)
      else if (dy < -4) setLogoHidden(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])


  // HOME: het menu als één zwevende glazen pil in het midden, over de
  // volle openingsfoto (eigenaar, 29 sep 2026: "het menu als dock
  // eroverheen", variant A). Dezelfde onderdelen als de balk hieronder —
  // logo, BarPanels, tabletmenu, de CTA en de vier schakelaars — in één
  // `nav-glass`-pil met één komeet, en dat blijft hij bij het scrollen.
  // Alleen op home, VOOR NU: de andere pagina's houden de balk op de
  // paginabreedte tot Nick zegt dat de pil overal mag. Op de telefoon
  // rendert dit niets; daar zijn de bovenbalk en de dock het menu.
  if (route === "/") {
    return (
      <header
        data-menu-pil=""
        className="pointer-events-none fixed inset-x-0 top-[16px] z-50 hidden justify-center px-[24px] md:flex"
      >
        {/* relative z-50: de pil boven de panelen die hij opent. Hoog
            60px; de panelen hangen op top-20 (80px), 4px eronder.
            Het glas is een EIGEN laag achter de inhoud, niet een klasse op
            de pil zelf: een backdrop-filter maakt van zijn element het
            ankerblok voor `fixed`, en dan hingen de megamenu's (PanelCard,
            `fixed inset-x-0 top-20`) aan de pil in plaats van aan het
            scherm — smal, verschoven en onder de actiemelding. */}
        <div
          data-pil=""
          className="pointer-events-auto relative z-50 flex h-[60px] items-center gap-[20px] rounded-full pr-[8px] pl-[24px] lg:gap-[28px]"
        >
          <span aria-hidden data-pil-glas="" className="nav-glass absolute inset-0 -z-10 rounded-full shadow-[var(--shadow-dock)]" />
          <Komeet />
          {/* 44px hoog: het raakvlak, niet het woordmerk (22px). */}
          <Link href="/" aria-label="GRØNN — Home" data-woordmerk="" className="group flex h-[44px] shrink-0 items-center">
            <Logo primair className="h-[22px] transition-transform duration-300 group-hover:scale-[1.03]" />
          </Link>
          {/* BarPanels is 80px hoog (h-20) voor de balk; in de pil 60. */}
          <div className="flex items-center [&>div]:h-[60px]">
            <BarPanels
              content={content}
              services={services}
              featured={featured}
              latestArticle={latestArticle}
              route={route}
            />
          </div>
          <TabletMenu content={content} />
          <div className="flex items-center gap-[2px]">
            <Link
              href="/contact"
              className="tap-target whitespace-nowrap rounded-full bg-gronn-green px-[18px] py-[10px] text-[14px] font-semibold text-gronn-white transition-colors hover:bg-gronn-ember-strong hover:text-gronn-white"
            >
              {t(START_PROJECT)}
            </Link>
            <span aria-hidden className="mx-[8px] h-[24px] w-px bg-foreground/15" />
            <SearchTrigger />
            <HoursSwitch />
            <LanguageSwitch />
            <ConceptMenu />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        // On phones the header is just the floating logo (no panel —
        // pointer events pass through the empty strip); the glass bar
        // and its panels are desktop chrome, from md up.
        "pointer-events-none fixed inset-x-0 top-0 z-50 transition-colors duration-500 md:pointer-events-auto",
        scrolled ? "md:glass" : "bg-transparent"
      )}
    >
      {/* relative z-50 keeps the bar above the panels it opens, so a
          panel can always be dismissed by its own trigger */}
      {/* Dezelfde breedte als elke sectie (BREEDTE: raster 1280px, marge
          24/64px): het logo staat op de linkerlijn van de pagina en de
          knoppenpil eindigt op de rechterlijn (eigenaar, 28 sep 2026:
          "waarom klopt de uitlijning van logo en dock bovenin niet met de
          breedte van de pagina?"). uitlijning.spec.ts meet het. */}
      <div className={cn("relative z-50 flex h-20 items-center justify-between", BREEDTE)}>
        <Link
          href="/"
          aria-label="GRØNN — Home"
          data-woordmerk=""
          className={cn(
            // `hidden md:block`: op de telefoon draagt de bovenbalk het
            // merk (`hoek-paneel.tsx`). Twee logo's over elkaar is geen
            // ontwerp, en dit zwevende exemplaar was er alleen omdat er
            // toen nog geen bovenbalk was.
            "group pointer-events-auto hidden shrink-0 md:block",
            reduced
              ? "transition-none"
              : "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            logoHidden &&
              "pointer-events-none -translate-x-12 opacity-0 blur-[2px] md:pointer-events-auto md:translate-x-0 md:opacity-100 md:blur-none"
          )}
        >
          <Logo primair className="h-7 transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>

        {/* THREE children under justify-between, not two. With the nav,
            the CTA and the control pill all inside one wrapper, every
            pixel of free space fell into the single gap between the logo
            and the nav, while the CTA and the switches were left with
            only their fixed gap. Three children lets the browser split
            the free space evenly — no computed margins, no magic
            numbers.

            pointer-events-auto is on both wrappers because the header is
            pointer-events-none on phones, so the empty strip stays
            clickable through to the page. */}
        <div className="pointer-events-auto flex min-w-0 items-center gap-2 lg:gap-3">
          <BarPanels
            content={content}
            services={services}
            featured={featured}
            latestArticle={latestArticle}
            route={route}
          />


          <Link
            href="/contact"
            className="tap-target hidden whitespace-nowrap rounded-full bg-gronn-green px-5 py-2.5 text-sm font-semibold text-gronn-white transition-colors hover:bg-gronn-ember-strong hover:text-gronn-white sm:inline-block"
          >
            {t(START_PROJECT)}
          </Link>

          {/* Tablet only. Between 768 and 1024 the bar shows Diensten and
              nothing else, and the dock is a phone surface — without this
              four of the five sections are unreachable. */}
          <TabletMenu content={content} />

          {/* One pill where the hamburger used to be. Search, light or
              dark, this language or the other, and everything else about
              how the site behaves — four jobs, one object, one ember
              comet. The five sections are places; these are settings,
              and grouping them is what says so. */}
        </div>

        <div className="pointer-events-auto flex items-center">
          <ControlGroup>
            <SearchTrigger />
            <HoursSwitch />
            <LanguageSwitch />
            <ConceptMenu />
          </ControlGroup>
        </div>
      </div>
    </header>
  )
}
