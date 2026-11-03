"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CommandIcon, EuroIcon, FolderOpenIcon, OrbitIcon, SearchIcon, SquareKanbanIcon, type LucideIcon } from "lucide-react"

import { Logo } from "@/components/logo"
import { useLanguage } from "@/components/language-provider"
import type { Locale } from "@/lib/i18n"
import { OS_LANG_COOKIE, say, tr } from "@/lib/os/i18n"
import { useKlok } from "@/lib/use-klok"
import { cn } from "@/lib/utils"
import { CommandPalette } from "./command-palette"

// The frame every /os screen wears: one top bar, no sidebar.
//
// The brief asked for "something more spatial and compact" than a giant
// rail. The whole OS fits in eight words, so the navigation is those
// eight words in a single row across the top, with the screen below left
// entirely to the work. Surfaces that do not exist yet stay in the row,
// dimmed and labelled "later", so the shape of the whole OS is visible
// from day one and nothing pretends to be a link.

//
// On a phone (below `md`) the row moves to a dock at the bottom, the way
// the public site does it: four sections, icon over a small label, 44px
// targets, sized in px so chrome does not grow with the text.

export type OsSection = { href: string; label: string; ready: boolean; icon?: LucideIcon }

export const SECTIONS: OsSection[] = [
  { href: "/os", label: "Core", ready: true, icon: OrbitIcon },
  { href: "/os/projects", label: "Projects", ready: true, icon: FolderOpenIcon },
  { href: "/os/pipeline", label: "Pipeline", ready: true, icon: SquareKanbanIcon },
  { href: "/os/finance", label: "Finance", ready: true, icon: EuroIcon },
  { href: "/os/planning", label: "Planning", ready: false },
  { href: "/os/files", label: "Files", ready: false },
  { href: "/os/suppliers", label: "Suppliers", ready: false },
  { href: "/os/website", label: "Website", ready: false },
]

const PaletteContext = createContext<{ open: (query?: string) => void }>({ open: () => {} })

/** Opens the command palette from anywhere inside the OS. */
export const useCommandPalette = () => useContext(PaletteContext)

function activeHref(pathname: string) {
  return SECTIONS.filter((s) => pathname === s.href || pathname.startsWith(`${s.href}/`)).sort(
    (a, b) => b.href.length - a.href.length
  )[0]?.href
}

function DateBlock({ locale }: { locale: Locale }) {
  const now = useKlok()
  if (!now) return <div className="h-[30px] w-[150px]" aria-hidden />
  const tag = locale === "nl" ? "nl-NL" : "en-GB"
  const day = now.toLocaleDateString(tag, { weekday: "long" })
  const date = now.toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" })
  const time = now.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" })
  return (
    <p className="text-right leading-none">
      <span className="block text-[13px] text-os-text">{day}</span>
      <span className="mt-[4px] block font-mono text-[11px] tracking-[0.06em] text-os-text-3">
        {date} · <time dateTime={now.toISOString()}>{time}</time>
      </span>
    </p>
  )
}

/**
 * EN | NL. The OS keeps its own cookie (see lib/os/i18n.ts), so this
 * never changes the language of the public site, and the server reads it
 * on the refresh that follows.
 */
function rememberLocale(next: Locale) {
  document.cookie = `${OS_LANG_COOKIE}=${next}; path=/os; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

function LanguageSwitch({ locale }: { locale: Locale }) {
  const router = useRouter()
  const choose = (next: Locale) => {
    if (next === locale) return
    rememberLocale(next)
    router.refresh()
  }
  return (
    <div role="group" aria-label={tr(locale, "Language", "Taal")} className="flex items-center rounded-full border border-os-line p-[2px]">
      {(
        [
          ["en", "English"],
          ["nl", "Nederlands"],
        ] as const
      ).map(([code, name]) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          aria-pressed={locale === code}
          aria-label={name}
          className={cn(
            "h-[32px] min-w-[40px] rounded-full px-[10px] font-mono text-[11px] uppercase tracking-[0.08em] transition-colors",
            locale === code ? "bg-os-raised text-os-text" : "text-os-text-3 hover:text-os-text"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

export function OsShell({ children, preview }: { children: React.ReactNode; preview: boolean }) {
  const { locale } = useLanguage()
  const pathname = usePathname()
  const current = activeHref(pathname)
  const [palette, setPalette] = useState<{ open: boolean; query: string }>({ open: false, query: "" })

  const open = useCallback((query = "") => setPalette({ open: true, query }), [])
  const close = useCallback(() => setPalette((p) => ({ ...p, open: false })), [])

  // ⌘K / Ctrl K anywhere in the OS. "/" too, the way most tools do it,
  // but never while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPalette((p) => ({ open: !p.open, query: "" }))
        return
      }
      const t = e.target as HTMLElement | null
      const typing = t?.closest("input, textarea, [contenteditable='true']")
      if (e.key === "/" && !typing) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <PaletteContext.Provider value={{ open }}>
      <a
        href="#os-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-[16px] focus:top-[16px] focus:z-50 focus:rounded-full focus:bg-os-raised focus:px-[16px] focus:py-[8px]"
      >
        {tr(locale, "Skip to content", "Naar de inhoud")}
      </a>

      <header className="sticky top-0 z-40 border-b border-os-line bg-os-ground/95">
        <div className="mx-auto flex h-[56px] max-w-[1840px] items-center gap-[16px] px-[16px] md:h-[64px] md:gap-[24px] md:px-[24px] xl:px-[40px]">
          <Link href="/os" className="flex shrink-0 items-center gap-[14px] rounded-full" aria-label="GRØNN Command Center, Core">
            <Logo className="h-[18px] w-auto" />
            <span className="os-label hidden border-l border-os-line pl-[14px] text-os-text-2 lg:block">
              Command Center
            </span>
          </Link>

          <nav aria-label="Command Center" className="hidden min-w-0 flex-1 md:block">
            <ul className="flex items-center gap-[2px]">
              {SECTIONS.filter((s) => s.ready).map((s) => {
                const on = s.href === current
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "relative block rounded-full px-[14px] py-[8px] text-[13px] transition-colors",
                        on ? "bg-os-raised text-os-text" : "text-os-text-2 hover:text-os-text"
                      )}
                    >
                      {on && (
                        <span aria-hidden className="absolute left-1/2 top-[3px] size-[3px] -translate-x-1/2 rounded-full bg-os-green" />
                      )}
                      {say(locale, s.label)}
                    </Link>
                  </li>
                )
              })}
              {/* The surfaces of later phases: named, dimmed, not links. */}
              <li className="ml-[10px] hidden items-center gap-[12px] border-l border-os-line pl-[16px] xl:flex">
                {SECTIONS.filter((s) => !s.ready).map((s) => (
                  <span key={s.href} className="text-[13px] text-os-text-3">
                    {say(locale, s.label)}
                  </span>
                ))}
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-os-text-3">{tr(locale, "later", "later")}</span>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-[10px] md:ml-0 md:gap-[20px]">
            <div className="hidden min-[1560px]:block">
              <DateBlock locale={locale} />
            </div>
            <button
              type="button"
              onClick={() => open()}
              aria-label={tr(locale, "Search or command", "Zoeken of opdracht")}
              className="flex size-[40px] items-center justify-center gap-[10px] rounded-full border border-os-line bg-os-surface text-[13px] text-os-text-2 transition-colors hover:border-os-green-2 hover:text-os-text md:h-[36px] md:w-auto md:justify-start md:pl-[14px] md:pr-[8px]"
            >
              <SearchIcon size={15} aria-hidden />
              <span aria-hidden className="hidden md:inline">
                {tr(locale, "Search or command", "Zoeken of opdracht")}
              </span>
              <kbd aria-hidden className="hidden items-center gap-[2px] rounded-full bg-os-raised px-[8px] py-[3px] font-mono text-[10px] text-os-text-3 md:flex">
                <CommandIcon size={10} aria-hidden />K
              </kbd>
            </button>
            <LanguageSwitch locale={locale} />
            <p className="hidden items-center gap-[8px] min-[1840px]:flex">
              <span aria-hidden className="size-[6px] rounded-full bg-os-green" />
              <span className="text-[13px] text-os-text-2">Nick</span>
              <span className="os-label">{preview ? tr(locale, "Preview", "Voorbeeld") : tr(locale, "Owner", "Eigenaar")}</span>
            </p>
          </div>
        </div>
      </header>

      {preview && (
        <p className="border-b border-os-line bg-os-surface px-[16px] py-[8px] text-center text-[12px] leading-[18px] text-os-text-2">
          {tr(
            locale,
            "Preview: no access to the books, so only the real site projects show. Your figures are on gronn.studio/os.",
            "Preview: geen toegang tot de boekhouding, dus alleen de echte projecten van de site. Je cijfers staan op gronn.studio/os."
          )}
        </p>
      )}

      <main id="os-main" className="mx-auto max-w-[1840px] px-[16px] pb-[112px] md:px-[24px] md:pb-[64px] xl:px-[40px]">
        {children}
      </main>

      {/* The phone's dock: the four sections that exist, thumb-high. */}
      <nav
        aria-label={tr(locale, "Command Center, sections", "Command Center, onderdelen")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-os-line bg-os-ground/95 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto grid h-[60px] max-w-[480px] grid-cols-4 px-[8px]">
          {SECTIONS.filter((s) => s.ready).map((s) => {
            const on = s.href === current
            const Icon = s.icon ?? OrbitIcon
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-[44px] flex-col items-center justify-center gap-[4px] rounded-[12px] transition-colors",
                    on ? "text-os-green" : "text-os-text-2 active:text-os-text"
                  )}
                >
                  <Icon size={20} strokeWidth={1.6} aria-hidden />
                  <span className="font-mono text-[9px] uppercase leading-[11px] tracking-[0.06em]">{say(locale, s.label)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <CommandPalette open={palette.open} initialQuery={palette.query} onClose={close} />
    </PaletteContext.Provider>
  )
}
