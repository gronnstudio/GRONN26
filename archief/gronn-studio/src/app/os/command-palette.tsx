"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRightIcon, CornerDownLeftIcon, SearchIcon, SparklesIcon } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import type { Locale } from "@/lib/i18n"
import { tr } from "@/lib/os/i18n"
import { useFocusTrap } from "@/lib/use-focus-trap"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// The command palette: the one place to go anywhere and ask anything.
//
// It is a combobox over a list, not a chat. Typing filters; ↑/↓ move;
// Enter runs; Esc closes. Every entry says what it does in plain words.
//
// Claude sits behind the "Ask" group. In phase 1 nothing is wired to a
// model, and the palette says so instead of pretending: an Ask command
// that has no deterministic answer yet shows which phase connects it.
// The ones that CAN be answered from the data already on screen (what to
// work on today, a summary of active projects) go there.

type Command = {
  id: string
  group: "Go to" | "Projects" | "Vijverklant" | "Ask"
  label: string
  hint?: string
  href?: string
  /** Shown instead of running, for what a later phase connects. */
  later?: string
  keywords?: string
}

const COMMANDS: Command[] = [
  { id: "core", group: "Go to", label: "Core", hint: "Today, projects, activity", href: "/os" },
  { id: "projects", group: "Go to", label: "Projects", href: "/os/projects" },
  { id: "pipeline", group: "Go to", label: "Pipeline", hint: "Leads and quotations", href: "/os/pipeline" },
  { id: "finance", group: "Go to", label: "Finance", hint: "Invoices, quotes, money owed", href: "/os/finance", keywords: "facturen offertes geld" },
  { id: "site", group: "Go to", label: "Owner panel", hint: "Invoices, intakes, documents", href: "/dashboard" },

  { id: "p-vijverklant", group: "Projects", label: "Open project Vijverklant", hint: "Pond renovation · Finalisation", href: "/os/projects/vijverklant", keywords: "pond vijver" },
  { id: "p-geulle", group: "Projects", label: "Open Geulle", hint: "Terrace · completed", href: "/os/projects", keywords: "terras terrace" },

  { id: "v-photos", group: "Vijverklant", label: "Vijverklant · photos", href: "/os/projects/vijverklant#photos", keywords: "foto" },
  { id: "v-tasks", group: "Vijverklant", label: "Vijverklant · open tasks", href: "/os/projects/vijverklant#tasks" },
  { id: "v-materials", group: "Vijverklant", label: "Vijverklant · materials", href: "/os/projects/vijverklant#materials", keywords: "pump filter pvc" },
  { id: "v-finance", group: "Vijverklant", label: "Vijverklant · finance", href: "/os/projects/vijverklant#finance", keywords: "money margin" },
  { id: "v-system", group: "Vijverklant", label: "Vijverklant · water system", href: "/os/projects/vijverklant#system", keywords: "waterroute pump" },

  { id: "a-today", group: "Ask", label: "What should I work on today?", href: "/os#today" },
  { id: "a-summary", group: "Ask", label: "Summarize all active projects", href: "/os/projects" },
  { id: "a-stale", group: "Ask", label: "Show stale leads", href: "/os/pipeline#stale" },
  { id: "a-invoices", group: "Ask", label: "Show unpaid invoices", href: "/os/finance#unpaid" },
  { id: "a-overdue", group: "Ask", label: "Show projects with overdue tasks", later: "Phase 2 stores tasks with due dates." },
  { id: "a-update", group: "Ask", label: "Create client update", later: "Phase 3: drafted by Claude from the project log." },
  { id: "a-hours", group: "Ask", label: "Show hours this month", later: "Phase 2: the hours module." },
  { id: "a-purchases", group: "Ask", label: "Show upcoming purchases", later: "Phase 2: procurement lists per project." },
  { id: "a-suppliers", group: "Ask", label: "Open supplier list", later: "Phase 2: the supplier database." },
  { id: "a-wienerberger", group: "Ask", label: "Find Wienerberger product 76030", later: "Phase 3: search across supplier catalogues." },
  { id: "a-reminder", group: "Ask", label: "Draft invoice reminder", later: "Phase 3: drafted by Claude, sent only after you confirm." },
  { id: "a-note", group: "Ask", label: "Create project note", later: "Phase 2: notes are stored per project." },
  { id: "a-docs", group: "Ask", label: "Search all GRØNN documentation", later: "Phase 3: natural-language search over documents." },
]

const GROUP_ORDER: Command["group"][] = ["Go to", "Projects", "Vijverklant", "Ask"]

const GROUP_NL: Record<string, string> = { "Go to": "Ga naar", Projects: "Projecten", Vijverklant: "Vijverklant", Ask: "Vraag" }

/** The Dutch face of each command, by id. Searching matches both languages. */
const NL_COMMANDS: Record<string, { label: string; hint?: string; later?: string }> = {
  core: { label: "Kern", hint: "Vandaag, projecten, activiteit" },
  projects: { label: "Projecten" },
  pipeline: { label: "Pijplijn", hint: "Leads en offertes" },
  finance: { label: "Financiën", hint: "Facturen, offertes, nog te ontvangen" },
  site: { label: "Eigenaarspaneel", hint: "Facturen, intakes, documenten" },
  "p-vijverklant": { label: "Project Vijverklant openen", hint: "Vijverrenovatie · Afronding" },
  "p-geulle": { label: "Geulle openen", hint: "Terras · afgerond" },
  "v-photos": { label: "Vijverklant · foto's" },
  "v-tasks": { label: "Vijverklant · open taken" },
  "v-materials": { label: "Vijverklant · materialen" },
  "v-finance": { label: "Vijverklant · financiën" },
  "v-system": { label: "Vijverklant · watersysteem" },
  "a-today": { label: "Waar werk ik vandaag aan?" },
  "a-summary": { label: "Alle actieve projecten samenvatten" },
  "a-stale": { label: "Stille leads tonen" },
  "a-invoices": { label: "Onbetaalde facturen tonen" },
  "a-overdue": { label: "Projecten met verlopen taken tonen", later: "Fase 2 slaat taken op met een deadline." },
  "a-update": { label: "Klantupdate maken", later: "Fase 3: door Claude opgesteld uit het projectlogboek." },
  "a-hours": { label: "Uren deze maand tonen", later: "Fase 2: de urenmodule." },
  "a-purchases": { label: "Komende inkopen tonen", later: "Fase 2: inkooplijsten per project." },
  "a-suppliers": { label: "Leverancierslijst openen", later: "Fase 2: de leveranciersdatabase." },
  "a-wienerberger": { label: "Wienerberger-product 76030 zoeken", later: "Fase 3: zoeken in de catalogi van leveranciers." },
  "a-reminder": { label: "Betalingsherinnering opstellen", later: "Fase 3: door Claude opgesteld, pas verstuurd na jouw akkoord." },
  "a-note": { label: "Projectnotitie maken", later: "Fase 2: notities worden per project opgeslagen." },
  "a-docs": { label: "Alle GRØNN-documentatie doorzoeken", later: "Fase 3: zoeken in gewone taal door documenten." },
}

function localise(c: Command, locale: Locale): Command & { english: string } {
  const nl = locale === "nl" ? NL_COMMANDS[c.id] : undefined
  return { ...c, ...nl, english: c.label }
}

function matches(c: Command, q: string) {
  if (!q) return true
  const english = "english" in c ? (c as { english: string }).english : ""
  const hay = `${c.label} ${english} ${c.hint ?? ""} ${c.keywords ?? ""} ${c.group}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word))
}

export function CommandPalette({
  open,
  initialQuery,
  onClose,
}: {
  open: boolean
  initialQuery: string
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && <PaletteDialog key="palette" initialQuery={initialQuery} onClose={onClose} />}
    </AnimatePresence>
  )
}

function PaletteDialog({ initialQuery, onClose }: { initialQuery: string; onClose: () => void }) {
  const router = useRouter()
  const { locale } = useLanguage()
  const tt = (en: string, nl: string) => tr(locale, en, nl)
  const reduced = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState(initialQuery)
  const [cursor, setCursor] = useState(0)
  const [note, setNote] = useState<{ label: string; text: string } | null>(null)

  useFocusTrap(panel, true, onClose)
  useEffect(() => input.current?.focus(), [])

  const results = useMemo(
    () => COMMANDS.map((c) => localise(c, locale)).filter((c) => matches(c, query)),
    [query, locale]
  )
  const grouped = GROUP_ORDER.map((g) => ({ group: g, items: results.filter((c) => c.group === g) })).filter(
    (g) => g.items.length > 0
  )
  const flat = grouped.flatMap((g) => g.items)
  const active = flat[Math.min(cursor, flat.length - 1)]

  const run = (c: Command | undefined) => {
    if (!c) return
    if (c.later) {
      setNote({ label: c.label, text: c.later })
      return
    }
    onClose()
    if (c.href) router.push(c.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setCursor((i) => (flat.length ? (i + 1) % flat.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setCursor((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      run(active)
    }
  }

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!active) return
    document.getElementById(`${listId}-${active.id}`)?.scrollIntoView({ block: "nearest" })
  }, [active, listId])

  const t = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-[16px] pt-[12vh]">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-os-ground/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={t}
        onClick={onClose}
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={tt("Search or command", "Zoeken of opdracht")}
        // The palette opens FROM the search button's side of the screen:
        // a short rise and scale, so it reads as the same object growing.
        initial={reduced ? false : { opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
        transition={t}
        className="relative w-full max-w-[640px] overflow-hidden rounded-[16px] border border-os-line bg-os-surface shadow-[0_24px_80px_rgb(0_0_0/0.5)]"
      >
        <div className="flex items-center gap-[12px] border-b border-os-line px-[18px]">
          <SearchIcon size={16} className="shrink-0 text-os-text-3" aria-hidden />
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCursor(0)
              setNote(null)
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
            aria-autocomplete="list"
            placeholder={tt("Open project Vijverklant, show stale leads, …", "Project Vijverklant openen, stille leads tonen, …")}
            className="h-[56px] w-full bg-transparent text-[15px] text-os-text placeholder:text-os-text-3 focus:outline-none focus-visible:outline-none"
          />
          <kbd className="shrink-0 rounded-full bg-os-raised px-[8px] py-[3px] font-mono text-[10px] text-os-text-3">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label={tt("Commands", "Opdrachten")} className="max-h-[min(56vh,480px)] overflow-y-auto py-[8px]">
          {grouped.map(({ group, items }) => (
            <li key={group} role="presentation">
              <p className="os-label px-[18px] pb-[6px] pt-[10px]" aria-hidden>
                {locale === "nl" ? GROUP_NL[group] : group}
              </p>
              <ul role="group" aria-label={locale === "nl" ? GROUP_NL[group] : group}>
                {items.map((c) => {
                  const on = c.id === active?.id
                  return (
                    <li
                      key={c.id}
                      id={`${listId}-${c.id}`}
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => setCursor(flat.indexOf(c))}
                      onClick={() => run(c)}
                      className={cn(
                        "mx-[8px] flex cursor-pointer items-center gap-[12px] rounded-[10px] px-[10px] py-[9px]",
                        on ? "bg-os-raised" : ""
                      )}
                    >
                      {c.group === "Ask" ? (
                        <SparklesIcon size={14} aria-hidden className={on ? "text-os-green" : "text-os-text-3"} />
                      ) : (
                        <ArrowRightIcon size={14} aria-hidden className={on ? "text-os-green" : "text-os-text-3"} />
                      )}
                      <span className={cn("text-[14px]", on ? "text-os-text" : "text-os-text-2")}>{c.label}</span>
                      {c.hint && <span className="truncate text-[12px] text-os-text-3">{c.hint}</span>}
                      <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-os-text-3">
                        {c.later ? tt("later", "later") : on ? <CornerDownLeftIcon size={12} aria-label="Enter" /> : null}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
          {flat.length === 0 && (
            <li className="px-[18px] py-[20px] text-[14px] text-os-text-3" role="presentation">
              {tt(
                `Nothing matches “${query}”. Search across documents and suppliers arrives with phase 3.`,
                `Niets gevonden voor “${query}”. Zoeken in documenten en leveranciers komt in fase 3.`
              )}
            </li>
          )}
        </ul>

        <div className="border-t border-os-line px-[18px] py-[12px]" aria-live="polite">
          {note ? (
            <p className="text-[13px] leading-[20px] text-os-text-2">
              <span className="text-os-text">{note.label}</span> {tt("is not connected yet.", "is nog niet gekoppeld.")} {note.text}
            </p>
          ) : (
            <p className="flex gap-[16px] font-mono text-[10px] uppercase tracking-[0.12em] text-os-text-3">
              <span>↑↓ {tt("move", "kiezen")}</span>
              <span>↵ {tt("run", "uitvoeren")}</span>
              <span>esc {tt("close", "sluiten")}</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
