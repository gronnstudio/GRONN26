"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"

import { LocaleLink as Link } from "@/components/locale-link"
import { MenuGroups } from "@/components/layout/menu-rows"
import { PanelCard } from "@/components/layout/panel-card"
import { SectionIcon } from "@/components/layout/section-icons"
import { useT } from "@/components/language-provider"
import {
  SECTIONS,
  menuFor,
  sectionById,
  type MenuContent,
  type SectionId,
} from "@/lib/nav"
import { cn } from "@/lib/utils"

// The whole menu, for the band between 768 and 1024px.
//
// The bar starts at `lg` and the phone dock stops at `md`, so between
// them this button is the ONLY navigation — which is why it carries the
// entire tree and not just the five section headings. Before this the
// bar kept Diensten on its own down here, beside a button that opened
// all five: two ways in, one of them a sliver, and the eleven services
// reachable through neither.
//
// It exists ONLY in that band — `md:block lg:hidden`. Above it the bar
// carries the sections itself; below it the dock does.
//
// WAT ER IN STAAT KOMT UIT `menuFor()`. Dit las `SERVICE_GROUPS` voor de
// diensten en `section.children` voor de rest — en `children` is leeg
// voor Projecten en Journaal, dus die twee secties stonden hier als een
// kop zonder één regel eronder, terwijl de telefoon er zes projecten en
// de artikelen toonde. Dezelfde vijf koppen, verschillende inhoud: exact
// de scheefgroei die deze ronde wilde afschaffen.
//
// AND IT IS WHAT A PHONE SHOWS ROTATED. Every current phone in landscape
// is wider than 768px — a Pixel 7 is 915 × 412, an iPhone 14 is 844 × 390
// — so turning the device sideways swaps the dock for this card, in a
// viewport barely 400px tall. That was never measured. The two things the
// owner asked for on the portrait sheet apply here just as much, and
// this card now has both: `PanelCard` fades its bottom edge while the
// list carries on, and the price is folded into each service's own gloss
// instead of hanging in a column that is blank five rows out of six.

export function TabletMenu({ content }: { content: MenuContent }) {
  const t = useT()
  const menu = (id: SectionId) => menuFor(id, content)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setOpen(false)
  }

  // Above lg the bar shows every section itself, so a panel that stayed
  // open through a resize would be a second menu over the first.
  useEffect(() => {
    if (!open) return
    const mql = window.matchMedia("(min-width: 1024px)")
    const close = () => setOpen(false)
    mql.addEventListener("change", close)
    return () => mql.removeEventListener("change", close)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative hidden md:block lg:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
      // Disclosure, not dialog: Tab walks out of the panel and closes it
      // on the way, exactly as the bar's own panels do.
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="tablet-menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "tap-target glass flex h-11 items-center gap-2.5 rounded-full px-4 text-sm font-medium transition-colors",
          open ? "text-gronn-ember" : "text-foreground hover:text-gronn-green"
        )}
      >
        {/* The word stays — design rule 1. Three bare lines with no
            label is what went out in July; the hamburger is the mark
            beside the word, not instead of it. */}
        {t({ en: "Menu", nl: "Menu" })}
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          aria-hidden
          className={cn(
            "shrink-0 transition-colors",
            open ? "text-gronn-ember" : "text-gronn-green"
          )}
        >
          {/* Three lines that fold into a cross when the panel opens, so
              it reads as one control in two states rather than two icons
              swapping places. */}
          <path
            d={open ? "M2.5 2 13.5 10" : "M1.5 1.5h13"}
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M1.5 6h13"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            className={cn("transition-opacity duration-300", open && "opacity-0")}
          />
          <path
            d={open ? "M2.5 10 13.5 2" : "M1.5 10.5h13"}
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <PanelCard id="tablet-menu">
            <nav className="p-7 sm:p-9">
              {/* Diensten is far the tallest, so it takes a column of its
                  own and the other four share the second. */}
              <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                <Section id="services">
                  <MenuGroups className="mt-3" density="card" compact groups={menu("services").groups} />
                </Section>

                <div className="flex flex-col gap-7">
                  {SECTIONS.filter((s) => s.id !== "services").map((section) => (
                    <Section key={section.id} id={section.id}>
                      <MenuGroups className="mt-1" density="card" compact groups={menu(section.id).groups} />
                    </Section>
                  ))}
                </div>
              </div>
            </nav>
          </PanelCard>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * A section heading that IS the link to the section's page, with its
 * children underneath.
 *
 * The heading leads rather than sitting in a footer strip: this card has
 * no footer, and a section whose own page cannot be reached from its own
 * heading is the confusion the mega menu already had to fix once.
 */
function Section({
  id,
  children,
}: {
  id: SectionId
  children?: React.ReactNode
}) {
  const t = useT()
  const section = sectionById(id)
  return (
    <div>
      <Link
        href={section.href}
        className="group/head flex items-center gap-3 rounded-md"
      >
        <span className="shrink-0 text-muted transition-colors group-hover/head:text-gronn-ember">
          <SectionIcon id={id} size={20} />
        </span>
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground underline-draw transition-colors group-hover/head:text-gronn-ember">
          {t(section.label)}
        </span>
      </Link>
      <p className="mt-1 pl-8 text-[13px] leading-relaxed text-muted">
        {t(section.note)}
      </p>
      <div className="pl-6">{children}</div>
    </div>
  )
}
