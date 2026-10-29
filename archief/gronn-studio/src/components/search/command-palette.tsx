"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { useT, useLanguage } from "@/components/language-provider"
import { priceHint } from "@/lib/data/pricing"
import type { Article } from "@/lib/data/journal"
import type { Project } from "@/lib/data/projects"
import type { Service } from "@/lib/data/services"
import { priceLabel } from "@/lib/format"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { EASE_REVEAL } from "@/lib/motion"
import { SECTIONS } from "@/lib/nav"
import { antwoordTekst, vragen } from "@/components/gronn/vragen-lijst"
import { isTyping } from "@/lib/shortcuts"
import { useShortcutsPref } from "@/lib/use-a11y-prefs"
import { useFocusTrap } from "@/lib/use-focus-trap"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// Ported from the sister project's command palette (gronnstudio/g-eog,
// src/components/search/command-palette.tsx). The MECHANISM is the same —
// ⌘K, live prefix-then-substring suggestions grouped by kind, a keyboard
// cursor, recent searches kept on the device. The content is not: that
// site searches a knowledge base, this one searches eleven services, the
// projects, the journal and the five sections.
//
// Deliberately no search library. The whole corpus is a few hundred
// strings already in memory; a fuzzy-search dependency would ship
// kilobytes to do worse than indexOf on a list this size.

const RECENT_KEY = "gronn-recent-search"
const RECENT_LIMIT = 5

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : []
  } catch {
    return []
  }
}

function recordSearch(href: string) {
  try {
    const next = [href, ...readRecent().filter((h) => h !== href)].slice(0, RECENT_LIMIT)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // History is a convenience; losing it costs nothing.
  }
}

type Kind = "service" | "project" | "journal" | "vraag" | "page"

type Hit = {
  kind: Kind
  href: string
  title: string
  sub?: string
  /** The from-price, on services that have one. */
  price?: string
  matchField: "title" | "sub"
  matchStart: number
  matchLen: number
}

export type SearchCorpus = {
  services: Service[]
  projects: Project[]
  articles: Article[]
}

/**
 * Prefix beats substring beats summary. A title that STARTS with what you
 * typed is almost always what you meant.
 */
function build(
  query: string,
  corpus: SearchCorpus,
  locale: Locale,
  t: (v: L) => string
): Hit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored: { hit: Hit; score: number }[] = []

  const consider = (
    kind: Kind,
    href: string,
    title: string,
    sub?: string,
    price?: string
  ) => {
    const ti = title.toLowerCase().indexOf(q)
    if (ti === 0) {
      scored.push({
        score: 0,
        hit: { kind, href, title, sub, price, matchField: "title", matchStart: 0, matchLen: q.length },
      })
      return
    }
    if (ti > 0) {
      scored.push({
        score: 1,
        hit: { kind, href, title, sub, price, matchField: "title", matchStart: ti, matchLen: q.length },
      })
      return
    }
    if (sub) {
      const si = sub.toLowerCase().indexOf(q)
      if (si >= 0) {
        scored.push({
          score: 2,
          hit: { kind, href, title, sub, price, matchField: "sub", matchStart: si, matchLen: q.length },
        })
      }
    }
  }

  for (const s of corpus.services) {
    const hint = priceHint(s.slug)
    consider(
      "service",
      `/services/${s.slug}`,
      pick(s.title, locale),
      s.tagline ? pick(s.tagline, locale) : pick(s.summary, locale),
      hint
        ? hint.monthly
          ? `${priceLabel(hint.from)}${t({ en: "/mo", nl: "/mnd" })}`
          : `${t({ en: "from", nl: "vanaf" })} ${priceLabel(hint.from)}`
        : undefined
    )
  }
  for (const p of corpus.projects) {
    // Projects have no summary field: `objective` is the sentence that
    // says what the site had to become, which is what someone searching
    // for "vijver" or "wadi" is actually looking for. The location is
    // appended so a place name finds its project too.
    consider(
      "project",
      `/projects/${p.slug}`,
      pick(p.title, locale),
      `${pick(p.objective, locale)} · ${p.location}`
    )
  }
  for (const a of corpus.articles) {
    consider("journal", `/journal/${a.slug}`, pick(a.title, locale), pick(a.excerpt, locale))
  }
  // De veelgestelde vragen: "wat kost" of "Maastricht" vindt het
  // antwoord, en de link opent die ene vraag op /faq.
  for (const v of vragen(corpus.services, locale)) {
    consider("vraag", `/faq#${v.id}`, v.vraag, antwoordTekst(v))
  }
  for (const sec of SECTIONS) {
    consider("page", sec.href, pick(sec.label, locale), pick(sec.note, locale))
  }

  const byKind = (kind: Kind, take: number) =>
    scored
      .filter((r) => r.hit.kind === kind)
      .sort((x, y) => x.score - y.score || x.hit.title.localeCompare(y.hit.title))
      .slice(0, take)
      .map((r) => r.hit)

  return [
    ...byKind("service", 5),
    ...byKind("project", 3),
    ...byKind("journal", 3),
    ...byKind("vraag", 3),
    ...byKind("page", 2),
  ]
}

/** Ember on the matched run — the site's answer-to-interaction colour. */
function Marked({ text, start, len }: { text: string; start: number; len: number }) {
  if (len <= 0 || start < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-transparent font-semibold text-[color:var(--ember-text)]">
        {text.slice(start, start + len)}
      </mark>
      {text.slice(start + len)}
    </>
  )
}

type Ctx = { open: () => void }
const SearchContext = createContext<Ctx>({ open: () => {} })
export const useSearch = () => useContext(SearchContext)

export function SearchProvider({
  corpus,
  children,
}: {
  corpus: SearchCorpus
  children: React.ReactNode
}) {
  const t = useT()
  const { locale } = useLanguage()
  const router = useRouter()
  const reduced = useReducedMotion()
  const [isOpen, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setCursor(0)
  }, [])
  const open = useCallback(() => setOpen(true), [])

  const [shortcutsEnabled] = useShortcutsPref()

  useFocusTrap(panelRef, isOpen, close)

  // ⌘K always; "/" only while single-key shortcuts are switched on.
  //
  // The difference is WCAG 2.1.4 Character Key Shortcuts (Level A): a
  // shortcut that is a single character must be turn-off-able,
  // remappable, or confined to focus. "/" had none of the three — it
  // guarded against typing in a field, which is careful but is not one
  // of the three things the criterion asks for. ⌘K holds a modifier,
  // so the criterion does not cover it and it stays unconditional.
  //
  // The typing guard is now the shared one in lib/shortcuts, so the
  // palette and the g-sequences cannot disagree about what counts as
  // a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (
        e.key === "/" &&
        shortcutsEnabled &&
        !isTyping(e.target) &&
        !isOpen
      ) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, shortcutsEnabled])

  // rAF keeps the setState out of the effect's synchronous phase, which
  // react-hooks flags as a cascading render.
  useEffect(() => {
    if (!isOpen) return
    const id = requestAnimationFrame(() => {
      setRecent(readRecent())
      inputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  const hasQuery = query.trim().length > 0

  const items = useMemo<Hit[]>(() => {
    if (hasQuery) return build(query, corpus, locale, t)
    // Your own history beats anything we would guess.
    return recent
      .map((href): Hit | null => {
        const svc = corpus.services.find((s) => `/services/${s.slug}` === href)
        if (svc)
          return {
            kind: "service",
            href,
            title: pick(svc.title, locale),
            sub: svc.tagline ? pick(svc.tagline, locale) : undefined,
            matchField: "title",
            matchStart: -1,
            matchLen: 0,
          }
        const vraag = href.startsWith("/faq#")
          ? vragen(corpus.services, locale).find((v) => `/faq#${v.id}` === href)
          : undefined
        if (vraag)
          return {
            kind: "vraag",
            href,
            title: vraag.vraag,
            matchField: "title",
            matchStart: -1,
            matchLen: 0,
          }
        const sec = SECTIONS.find((s) => s.href === href)
        if (sec)
          return {
            kind: "page",
            href,
            title: pick(sec.label, locale),
            sub: pick(sec.note, locale),
            matchField: "title",
            matchStart: -1,
            matchLen: 0,
          }
        return null
      })
      .filter((h): h is Hit => h !== null)
  }, [hasQuery, query, corpus, locale, recent, t])

  const go = useCallback(
    (hit: Hit) => {
      recordSearch(hit.href)
      const target = localePath(locale, hit.href)
      const [pad, anker] = target.split("#")
      // Al op /faq en een vraag gekozen: een echte fragmentnavigatie, zodat
      // de browser (en VraagAnker) die vraag openklapt. De router zou
      // alleen scrollen.
      if (anker && window.location.pathname === pad) window.location.hash = anker
      else router.push(target)
      close()
    },
    [router, locale, close]
  )

  const KIND_LABEL: Record<Kind, string> = {
    service: t({ en: "Service", nl: "Dienst" }),
    project: t({ en: "Project", nl: "Project" }),
    journal: t({ en: "Journal", nl: "Journaal" }),
    vraag: t({ en: "Question", nl: "Vraag" }),
    page: t({ en: "Page", nl: "Pagina" }),
  }

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-gronn-black/60 px-4 pt-[10vh] backdrop-blur-sm"
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t({ en: "Search this site", nl: "Zoek op deze site" })}
              initial={reduced ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: EASE_REVEAL }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-xl border border-line/15 bg-background shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)]"
            >
              <div className="flex items-center gap-3 border-b border-line/10 px-5 py-4">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="shrink-0 text-gronn-green"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  <path d="m15.4 15.4 4.1 4.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setCursor(0)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault()
                      setCursor((c) => Math.min(c + 1, items.length - 1))
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault()
                      setCursor((c) => Math.max(c - 1, 0))
                    } else if (e.key === "Enter") {
                      const hit = items[cursor]
                      if (hit) go(hit)
                    }
                  }}
                  placeholder={t({
                    en: "Search services, projects, the journal…",
                    nl: "Zoek diensten, projecten, het journaal…",
                  })}
                  aria-label={t({ en: "Search", nl: "Zoeken" })}
                  className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted"
                />
                <kbd className="hidden shrink-0 rounded border border-line/20 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
                  ESC
                </kbd>
              </div>

              <div className="relative max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain">
                {items.length === 0 ? (
                  <p className="px-5 py-8 text-sm leading-relaxed text-muted">
                    {hasQuery
                      ? t({
                          en: "Nothing matches that yet. Try a service, a place, or a plant.",
                          nl: "Daar past nog niets bij. Probeer een dienst, een plaats of een plant.",
                        })
                      : t({
                          en: "Type to search — or press ⌘K from anywhere.",
                          nl: "Typ om te zoeken — of druk overal ⌘K.",
                        })}
                  </p>
                ) : (
                  <ul className="py-2">
                    {items.map((hit, i) => (
                      <li key={hit.href}>
                        <button
                          type="button"
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => go(hit)}
                          className={cn(
                            "flex w-full items-baseline gap-3 px-5 py-2.5 text-left transition-colors",
                            i === cursor && "bg-foreground/[0.06]"
                          )}
                        >
                          <span
                            aria-hidden
                            className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
                          >
                            {KIND_LABEL[hit.kind]}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                                {hit.matchField === "title" ? (
                                  <Marked text={hit.title} start={hit.matchStart} len={hit.matchLen} />
                                ) : (
                                  hit.title
                                )}
                              </span>
                              {hit.price && (
                                <span className="shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--ember-text)]">
                                  {hit.price}
                                </span>
                              )}
                            </span>
                            {hit.sub && (
                              <span className="mt-0.5 block truncate text-[13px] leading-relaxed text-muted">
                                {hit.matchField === "sub" ? (
                                  <Marked text={hit.sub} start={hit.matchStart} len={hit.matchLen} />
                                ) : (
                                  hit.sub
                                )}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-4 border-t border-line/10 bg-surface/50 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                <span>↑↓ {t({ en: "move", nl: "kiezen" })}</span>
                <span>↵ {t({ en: "open", nl: "openen" })}</span>
                <span className="ml-auto">{t({ en: "Search", nl: "Zoeken" })}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SearchContext.Provider>
  )
}
