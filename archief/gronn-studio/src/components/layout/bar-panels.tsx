"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { ArrowRightIcon } from "lucide-react"

import { LocaleLink as Link } from "@/components/locale-link"
import { LetterFlip } from "@/components/motion/letter-flip"
import { Photo } from "@/components/photo"
import { PanelCard } from "@/components/layout/panel-card"
import { ColLabel, MenuGroups } from "@/components/layout/menu-rows"
import { ServicesPanel } from "@/components/layout/services-mega-menu"
import { useT } from "@/components/language-provider"
import { CHANNELS, DIRECT_CONTACT } from "@/components/layout/channel-icons"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"
import type { Article } from "@/lib/data/journal"
import type { Project } from "@/lib/data/projects"
import type { Service } from "@/lib/data/services"
import type { L } from "@/lib/i18n"
import {
  DASHBOARD,
  SECTIONS,
  menuFor,
  sectionById,
  type MenuContent,
  type SectionId,
} from "@/lib/nav"
import { cn } from "@/lib/utils"
import { UITGANGSPUNTEN } from "@/components/gronn/teksten"

// VARIANT A — every destination in the bar opens its own panel, the way
// GitHub's Platform / Solutions / Resources menus do (owner reference).
//
// One controller, not one hook per item. With per-item state, walking the
// mouse from Studio to Projecten leaves both open for the overlap between
// the 200 ms close and the 120 ms open — two cards on screen at once.
// A single `openId` makes that impossible by construction, and lets the
// card keep its position while only the contents change.
//
// Disclosure, not dialog: no focus trap. Tab walks the panel and then out
// of the bar, closing it; Escape closes and returns focus to its trigger.

const OPEN_DELAY = 120
const CLOSE_DELAY = 200

// The bar renders SECTIONS directly — the same five the phone sheet and
// the footer render. Aanpak is no longer a top-level word: it belongs to
// Studio, and it is in that panel. Contact takes the slot it left.
type PanelId = SectionId

/** A photo card — the shape the featured project and article share. */
function FeatureCard({
  href,
  eyebrow,
  title,
  summary,
  src,
}: {
  href: string
  eyebrow: string
  title: string
  summary?: string
  /** Zonder echte foto geen beeld: een plaatshouder hoort niet bij echt werk. */
  src?: string
}) {
  return (
    <div>
      <ColLabel>{eyebrow}</ColLabel>
      <Link
        href={href}
        className="group/feat mt-4 block overflow-hidden rounded-lg border border-line/10 transition-colors hover:border-gronn-ember/50"
      >
        {src && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Photo src={src} alt="" sizes="30vw" className="object-cover" />
            <div aria-hidden className="photo-glass absolute inset-0" />
          </div>
        )}
        <div className="p-4">
          <p className="font-heading text-base font-semibold leading-snug transition-colors group-hover/feat:text-gronn-ember">
            {title}
          </p>
          {summary && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
              {summary}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

/**
 * Het streepje onder een menu-item, naar uncoded.life (eigenaar, 3 okt
 * 2026: "voeg de animatie toe die uncoded.life ook heeft"): een haarlijn
 * in `--ember-text` die bij hover en focus vanuit het midden uitloopt en
 * onder de pagina waar je bent blijft staan. Bij minder beweging staat
 * hij er meteen.
 */
function NavStreep({ actief }: { actief: boolean }) {
  return (
    <span
      aria-hidden
      data-nav-streep={actief ? "actief" : ""}
      className={cn(
        "pointer-events-none absolute inset-x-0 -bottom-[6px] h-px origin-center bg-[color:var(--ember-text)] transition-transform duration-300 ease-out motion-reduce:transition-none",
        actief ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100 group-focus-visible/nav:scale-x-100"
      )}
    />
  )
}

export function BarPanels({
  content,
  services,
  featured,
  route,
}: {
  /**
   * Alles wat de menu's nodig hebben om zichzelf te vullen — dezelfde
   * vorm die de telefoonpil krijgt, zodat de twee niet uit elkaar kunnen
   * lopen.
   */
  content: MenuContent
  /**
   * Dezelfde diensten, maar volledig.
   *
   * `MenuContent` draagt bewust een versmalde dienst — slug, titel,
   * niveau, tagline — want meer heeft een menuregel niet nodig. De
   * uitgelichte kaart wél: `inSeasonNow()` leest de seizoensvensters en
   * de kaart zelf toont de samenvatting en de foto. Eén array, twee
   * uitzichten erop; dit is het uitzicht dat alles ziet.
   */
  services: Service[]
  featured: Project
  /** Niet meer gebruikt sinds V5 (geen journaal); blijft optioneel voor oude aanroepen. */
  latestArticle?: Article
  route: string
}) {
  const t = useT()
  // Wat er in elk paneel staat komt hiervandaan. De panelen houden hun
  // eigen MEUBILAIR — de zeven principes, de inlogknop, de kanalen, de
  // uitgelichte kaarten — want dat is wat een desktoppaneel van een
  // telefoonvel onderscheidt. Alleen de rijen zijn gedeeld.
  const menu = (id: SectionId) => menuFor(id, content)
  const pathname = usePathname()
  const [openId, setOpenId] = useState<PanelId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggers = useRef(new Map<PanelId, HTMLButtonElement>())
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Which panel the pointer opened, so the click that follows a hover
  // does not read as "already open, close it". Without this, moving the
  // mouse onto a trigger and clicking it — the single most ordinary
  // thing a visitor does — opened the panel and shut it again.
  const hoverOpened = useRef<PanelId | null>(null)

  // Close on navigation — the reset-on-prop-change pattern the rest of
  // the header already uses.
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setOpenId(null)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const schedule = (next: PanelId | null, delay: number) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenId(next), delay)
  }

  // Once one panel is open, moving along the bar swaps instantly — the
  // intent delay has already been paid and re-paying it on every
  // neighbour makes the row feel sticky.
  const onEnter = (id: PanelId) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    if (timer.current) clearTimeout(timer.current)
    hoverOpened.current = id
    if (openId) setOpenId(id)
    else schedule(id, OPEN_DELAY)
  }

  const FOOTERS: Record<PanelId, { href: string; label: L }> = {
    // "Over mij" is the panel's first row now, so the footer does not
    // repeat it; it offers the step after reading.
    studio: { href: "/contact", label: { en: "Book an introduction", nl: "Plan een kennismaking" } },
    services: { href: "/services", label: { en: "All services", nl: "Alle diensten" } },
    projects: { href: "/projects", label: { en: "All projects", nl: "Alle projecten" } },
    contact: { href: "/contact", label: { en: "Start here", nl: "Begin hier" } },
  }

  const PANELS: Record<PanelId, React.ReactNode> = {
    // Three columns, not two. The seven principles were sharing a
    // half-width column with a four-column grid inside them — four
    // columns in half the width, so every line broke after two words
    // while the left column sat half empty. The principles now get the
    // widest track and only two columns of their own; the two link lists
    // flank them.
    studio: (
            <div className="grid gap-x-10 gap-y-8 p-7 sm:p-9 lg:grid-cols-[0.85fr_1.5fr_0.95fr] lg:gap-x-12">
              <div>
                <ColLabel>{t({ en: "The practice", nl: "De praktijk" })}</ColLabel>
                <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
                  {t(sectionById("studio").note)}
                </p>
                <MenuGroups className="mt-3" groups={menu("studio").groups} />
              </div>
              <div className="border-t border-line/10 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <ColLabel>{t({ en: "What I pay attention to", nl: "Waar ik op let" })}</ColLabel>
              {/* No intro line here. It carried the STUDIO section's note
                  — "Wie er achter GRØNN zit" — which is both the wrong
                  sentence for a list of principles and the same sentence
                  already printed one column to the left. The heading says
                  what this is. */}
              {/* The same five points as the page (teksten.ts), in Nick's
                  voice. This column used to carry the old "seven things
                  we read" from the retired approach page. */}
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {UITGANGSPUNTEN.map((punt, i) => (
                  <li key={punt.nl} className="flex gap-3">
                    {/* Eén markeerkleur in het hele paneel: de cijfers in het oranje
                        van de pijlen ernaast (eigenaar, 28 sep 2026: "hou 1
                        kleur aan, COHESIE!"). */}
                    <span aria-hidden className="mt-[3px] shrink-0 font-mono text-[10px] leading-none text-[color:var(--ember-text)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 font-heading text-[15px] font-semibold tracking-tight text-foreground">
                      {t(punt)}
                    </span>
                  </li>
                ))}
              </ul>
              </div>
              <div className="border-t border-line/10 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                {/* Three rows became one button.
                    This column used to list a client portal, the site
                    editor and the panel, above a sentence explaining
                    which of the three was yours — "the last two are the
                    studio's own". A menu asking the reader to work out
                    which audience they belong to before they can pick a
                    link.
                    `/dashboard` answers that itself. Signed out it shows
                    two doors with a line saying who each is for; signed
                    in, `getPanelViewer()` renders the studio's panel or
                    a client's own dossier. The sorting happens behind
                    the door, so the menu can stop doing it.
                    Written in shadcn's token names — `bg-primary`,
                    `text-primary-foreground`, `ring` — which are aliased
                    onto this project's own tokens in globals.css. That
                    alias layer is what lets components copied from
                    21st.dev drop in without hand-translating colour, and
                    this button is the first thing built on it. */}
                <ColLabel>{t({ en: "Sign in", nl: "Inloggen" })}</ColLabel>
                <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                  {t({
                    en: "One door. It knows whether you are a client or the studio.",
                    nl: "Eén deur. Die weet zelf of je klant bent of de studio.",
                  })}
                </p>
                <Link
                  href={DASHBOARD.href}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-heading text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t(DASHBOARD.label)}
                  <ArrowRightIcon size={16} aria-hidden />
                </Link>
                <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  {t(DASHBOARD.note)}
                </p>
              </div>
            </div>
    ),
    services: (
            <ServicesPanel groups={menu("services").groups} services={services} />
    ),
    // Het werk zelf, en niet alleen een kop erboven.
    //
    // Dit paneel droeg een kop, één zin en één uitgelichte kaart — geen
    // enkel project om aan te klikken. Op de telefoon stonden er zes.
    // Zo ziet "drie navigaties die uit de pas lopen" er in de praktijk
    // uit: niemand klikt erop, dus niemand merkt het.
    //
    // De kop zegt niet "Projecten". Dat woord staat al in de balk waar
    // je net op klikte, en het Studio-paneel doet het net zo ("De
    // praktijk", niet "Studio").
    projects: (
            /* De lijst krijgt de breedte, de kaart een rail.
            
               Dit was `[1fr_1fr]`: de uitgelichte foto nam de halve kaart
               — 680px breed en 425px hoog — naast een kolom die niets
               droeg. Nu er wél zes projecten in staan is die verhouding
               omgekeerd verkeerd: de foto blijft het zwaarste element
               naast de inhoud waar je werkelijk voor komt. Dezelfde vorm
               als het dienstenpaneel: inhoud links, kaart rechts achter
               een scheidingslijn. */
            <div className="grid gap-x-10 gap-y-8 p-7 sm:p-9 md:grid-cols-[1.5fr_0.9fr]">
              <div>
                <ColLabel>{t({ en: "The work", nl: "Het werk" })}</ColLabel>
                <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
                  {t(sectionById("projects").note)}
                </p>
                <MenuGroups className="mt-3" compact groups={menu("projects").groups} />
              </div>
              <div className="border-t border-line/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <FeatureCard
                href={`/projects/${featured.slug}`}
                eyebrow={t({ en: "Featured project", nl: "Uitgelicht project" })}
                title={t(featured.title)}
                src={featured.image}
              />
              </div>
            </div>
    ),
    contact: (
      <div className="grid gap-x-12 gap-y-8 p-7 sm:p-9 md:grid-cols-2">
        <div>
          <ColLabel>{t({ en: "Two ways in", nl: "Twee ingangen" })}</ColLabel>
          <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
            {t(sectionById("contact").note)}
          </p>
          <MenuGroups className="mt-3" groups={menu("contact").groups} />
        </div>
        <div className="border-t border-line/10 pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
          <ColLabel>{t(DIRECT_CONTACT)}</ColLabel>
          <ul className="mt-4 flex flex-col gap-2.5">
            {CHANNELS.map((ch) => (
              <li key={ch.key}>
                <a
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(ch.aria)}
                  className="group/ch flex items-center gap-2.5 py-1 text-sm text-foreground/85 transition-colors hover:text-gronn-ember"
                >
                  <span
                    aria-hidden
                    className="shrink-0"
                    style={{ color: ch.color }}
                  >
                    {ch.icon}
                  </span>
                  <span className="underline-draw">{ch.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            {SERVICE_AREA_TOWNS.slice(0, 6).join(" · ")}
          </p>
        </div>
      </div>
    ),
  }

  return (
    <div
      ref={containerRef}
      // self-stretch is load-bearing, not cosmetic. The trigger row is
      // only as tall as its text, but the bar is h-20 and the card hangs
      // at top-20 — leaving a ~30px band that belongs to neither, wider
      // than the 200ms close delay is forgiving. Stretching the container
      // to the bar's full height makes its bottom edge exactly the card's
      // top edge, so walking down from a trigger never leaves the subtree
      // at all and no close is ever scheduled.
      // Desktop only, from lg up. Below that the tablet Menu button owns
      // the navigation and this bar is not in play at all: Diensten used
      // to hold the tablet band on its own, which put one section beside
      // a button that opens all five — two ways in, one of them a
      // sliver. The card hangs inside this container, so hiding it here
      // is enough; nothing below lg can open a panel.
      className="hidden h-20 items-center gap-5 lg:flex lg:gap-7"
      // Reaching into an open panel crosses a gap that belongs to
      // neither: the bar is 80px tall, the trigger row is only as tall as
      // its text, and the card hangs at top-20. The pointer leaves the
      // container there, which starts the close timer — and before this,
      // nothing cancelled that timer on the way back in, so the panel
      // shut itself under the cursor and nothing in it could be clicked.
      //
      // pointerenter fires again on the way in precisely BECAUSE the
      // pointer genuinely left the subtree in that gap; a transition
      // between descendants would not fire it.
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        if (timer.current) clearTimeout(timer.current)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        hoverOpened.current = null
        schedule(null, CLOSE_DELAY)
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && openId) {
          e.stopPropagation()
          triggers.current.get(openId)?.focus()
          setOpenId(null)
        }
      }}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpenId(null)
        }
      }}
    >
      {/* Contact has no trigger in the bar: the green CTA beside it goes
          to exactly that page, and two routes to one place in one row is
          the duplication this whole round has been removing. It keeps its
          place in the tree — the phone sheet and the footer still list
          it. */}
      {SECTIONS.filter((sec) => sec.id !== "contact").map(({ id, href, label }) => {
        const isOpen = openId === id
        return (
          <button
            key={id}
            ref={(el) => {
              if (el) triggers.current.set(id, el)
              else triggers.current.delete(id)
            }}
            type="button"
            aria-expanded={isOpen}
            aria-controls={`bar-panel-${id}`}
            onPointerEnter={onEnter(id)}
            onClick={() => {
              if (timer.current) clearTimeout(timer.current)
              // A click that merely confirms what hover already opened
              // keeps it open; a second click closes.
              const confirming = hoverOpened.current === id
              hoverOpened.current = null
              setOpenId((v) => (v === id && !confirming ? null : id))
            }}
            className={cn(
              // 15px medium in full foreground. These were 14px in
              // text-muted: the site's five main destinations rendered
              // as grey secondary text, which is why they read as
              // decoration. Active takes the brand green rather than
              // "less grey than the others".
              "group/nav relative flex items-center gap-1.5 text-[15px] font-medium tracking-wide transition-colors",
              // All five together, from lg. `hidden` first — a bare
              // `flex` here is what once leaked onto phones.
              "hidden lg:flex",
              route.startsWith(href)
                ? "text-gronn-green"
                : isOpen
                  ? // Oranje als tekst: `--ember-text`, niet pure ember
                    // (#DB6923 op gebroken wit is 2,99:1).
                    "text-[color:var(--ember-text)]"
                  : "text-foreground hover:text-gronn-green"
            )}
          >
            <span className="sr-only">{t(label)}</span>
            <LetterFlip text={t(label)} />
            <NavStreep actief={route.startsWith(href) || isOpen} />
            <svg
              aria-hidden
              width="11"
              height="7"
              viewBox="0 0 11 7"
              fill="none"
              className={cn(
                "shrink-0 text-gronn-green transition-transform duration-300",
                isOpen && "rotate-180 text-gronn-ember"
              )}
            >
              <path
                d="M1.4 1.6 5.5 5.4 9.6 1.6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )
      })}

      {/* ONE card with a changing key, not five conditional siblings.
          With five, `mode="wait"` holds the incoming panel until the
          outgoing one has exited and then never mounts it — walking from
          Diensten to Studio closed the first and opened nothing. A single
          child also matches what this menu is: the card stays put and its
          contents change. */}
      <AnimatePresence mode="wait">
        {openId && (
          <PanelCard
            key={openId}
            id={`bar-panel-${openId}`}
            footer={
              <Link
                href={FOOTERS[openId].href}
                className="group font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-gronn-ember"
              >
                <span className="underline-draw">{t(FOOTERS[openId].label)} →</span>
              </Link>
            }
          >
            {PANELS[openId]}
          </PanelCard>
        )}
      </AnimatePresence>
    </div>
  )
}
