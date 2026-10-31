"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { FileTextIcon, InboxIcon, ReceiptTextIcon, SearchIcon } from "lucide-react"

import { useFocusTrap } from "@/lib/use-focus-trap"
import { cn } from "@/lib/utils"

// The panel's search, in the shape the reference puts at the top of the
// page — and the shortcut chip beside it is not decoration: it is the
// only affordance saying the field can be reached without the mouse.
//
// Everything crossing into this component is a plain object. That is not
// a style preference; the first version of this panel handed a Client
// Component a lucide icon and took /dashboard down with a server
// error, because a function cannot cross that boundary. So a row names
// its kind with a string and the icon is chosen here.
//
// Searching is client-side over data the page already fetched. A studio
// of one will not reach the row count where that stops being true, and a
// round trip per keystroke would be slower than the list it replaces.

export type SearchKind = "intake" | "offerte" | "factuur"

export type SearchItem = {
  id: string
  label: string
  /** The second line: a client name, a reference, an amount. */
  sub: string
  href: string
  kind: SearchKind
}

const ICONS = {
  intake: InboxIcon,
  offerte: FileTextIcon,
  factuur: ReceiptTextIcon,
} as const

const KIND_LABEL: Record<SearchKind, string> = {
  intake: "Intake",
  offerte: "Offerte",
  factuur: "Factuur",
}

export function PanelSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const panel = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  // Reset on the action that closes it, not in an effect watching
  // `open` — setting state from an effect is a render the lint rightly
  // refuses, and the close is always something someone did.
  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setActive(0)
  }, [])

  useFocusTrap(panel, open, close)

  // Chorded, so it never steals a keystroke from someone typing a client
  // name into the builder next door.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items.slice(0, 8)
    return items
      .filter(
        (i) =>
          i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
      )
      .slice(0, 12)
  }, [items, query])

  const go = (item: SearchItem) => {
    close()
    router.push(item.href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line/15 bg-surface px-4 text-left text-[13px] text-muted transition-colors hover:border-line/30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
      >
        <SearchIcon size={15} aria-hidden className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">
          Zoek een aanvraag, offerte of factuur
        </span>
        {/* Not on a phone. It is `shrink-0` inside a field that shrinks,
            so on a 412px panel it pushed straight out through the
            button's own rounded border and came to rest under the
            avatar. It is also a keyboard shortcut being offered to a
            device with no keyboard. */}
        <kbd className="hidden shrink-0 rounded border border-line/20 px-1.5 py-px font-mono text-[10px] text-muted sm:block">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="doc-chrome fixed inset-0 z-[80] grid place-items-start justify-center bg-gronn-black/40 px-[12px] pt-[12vh] sm:px-0"
          onClick={close}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Zoeken in het paneel"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line/15 bg-background shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line/12 px-4 py-3">
              <SearchIcon size={16} aria-hidden className="shrink-0 text-muted" />
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setActive((i) => Math.min(i + 1, hits.length - 1))
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setActive((i) => Math.max(i - 1, 0))
                  } else if (e.key === "Enter" && hits[active]) {
                    e.preventDefault()
                    go(hits[active])
                  }
                }}
                placeholder="Naam, projectnaam of nummer"
                // 16px on a phone: iOS zooms the page in on a field
                // under 16px, and the whole panel is on the phone now.
                className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted/70 sm:text-sm"
              />
            </div>

            {hits.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-muted">
                Niets gevonden voor &ldquo;{query}&rdquo;.
              </p>
            ) : (
              <ul className="max-h-[52vh] overflow-y-auto py-1.5">
                {hits.map((item, i) => {
                  const Icon = ICONS[item.kind]
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => go(item)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          i === active ? "bg-surface" : "hover:bg-surface/60"
                        )}
                      >
                        <span
                          aria-hidden
                          className="grid size-8 shrink-0 place-items-center rounded-lg bg-gronn-green/12 text-accent"
                        >
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-foreground">
                            {item.label}
                          </span>
                          <span className="block truncate text-[11.5px] text-muted">
                            {item.sub}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                          {KIND_LABEL[item.kind]}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}
