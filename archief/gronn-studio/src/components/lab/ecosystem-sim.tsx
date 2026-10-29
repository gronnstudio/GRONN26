"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"
import type { L } from "@/lib/i18n"

// Field Lab experiment 01 — the ecosystem you can disturb. The same eight
// elements as the home diagram, but here removal cascades: take one out and
// every element that depended on it weakens, the web withers, and the
// system-balance meter drops. Restore it and the web knits back together.

type Key =
  | "soil"
  | "water"
  | "plants"
  | "fungi"
  | "wildlife"
  | "materials"
  | "climate"
  | "people"

const NODES: { key: Key; label: L; links: Key[] }[] = [
  { key: "soil", label: { en: "Soil", nl: "Bodem" }, links: ["water", "plants", "fungi", "materials"] },
  { key: "water", label: { en: "Water", nl: "Water" }, links: ["soil", "plants", "wildlife", "climate"] },
  { key: "plants", label: { en: "Plants", nl: "Planten" }, links: ["soil", "water", "fungi", "wildlife", "people", "climate"] },
  { key: "fungi", label: { en: "Fungi", nl: "Schimmels" }, links: ["soil", "plants"] },
  { key: "wildlife", label: { en: "Wildlife", nl: "Dieren" }, links: ["plants", "water", "climate"] },
  { key: "materials", label: { en: "Materials", nl: "Materialen" }, links: ["people", "soil"] },
  { key: "climate", label: { en: "Climate", nl: "Klimaat" }, links: ["water", "plants", "wildlife"] },
  { key: "people", label: { en: "People", nl: "Mensen" }, links: ["materials", "plants"] },
]

// Undirected unique edges derived once from the link lists.
const EDGES = NODES.flatMap((n) =>
  n.links
    .filter((target) => n.key < target)
    .map((target) => [n.key, target] as [Key, Key])
)

const R = 190
const CX = 250
const CY = 250

function nodePos(key: Key) {
  const i = NODES.findIndex((n) => n.key === key)
  const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
}

export function EcosystemSim() {
  const t = useT()
  const reduced = useReducedMotion()
  const [removed, setRemoved] = useState<ReadonlySet<Key>>(new Set())

  // Health: gone entirely when removed; otherwise the share of connections
  // still alive, floored so a weakened node stays visible.
  const health = (key: Key): number => {
    if (removed.has(key)) return 0
    const node = NODES.find((n) => n.key === key)!
    const alive = node.links.filter((l) => !removed.has(l)).length
    return 0.3 + 0.7 * (alive / node.links.length)
  }

  const balance = Math.round(
    (NODES.reduce((sum, n) => sum + (removed.has(n.key) ? 0 : health(n.key)), 0) /
      NODES.length) *
      100
  )

  const weakened = NODES.filter(
    (n) =>
      !removed.has(n.key) && n.links.some((l) => removed.has(l))
  )

  const toggle = (key: Key) => {
    setRemoved((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 120, damping: 16 }

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <svg viewBox="0 0 500 500" className="mx-auto w-full max-w-lg" role="group">
        <title>{t({ en: "Ecosystem disturbance simulation", nl: "Simulatie van verstoring in het ecosysteem" })}</title>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="var(--muted)"
          strokeOpacity="0.2"
          strokeDasharray="3 6"
        />
        {EDGES.map(([a, b]) => {
          const from = nodePos(a)
          const to = nodePos(b)
          const withered = removed.has(a) || removed.has(b)
          const strength = Math.min(health(a), health(b))
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={withered ? 1 : 1.5}
              strokeDasharray={withered ? "2 5" : "none"}
              animate={{ opacity: withered ? 0.25 : 0.25 + 0.55 * strength }}
              transition={reduced ? { duration: 0 } : { duration: 0.5 }}
              className={cn(
                "transition-[stroke] duration-500",
                withered ? "stroke-[var(--muted)]" : "stroke-gronn-green"
              )}
            />
          )
        })}
        {NODES.map((node) => {
          const { x, y } = nodePos(node.key)
          const gone = removed.has(node.key)
          const h = health(node.key)
          return (
            <g
              key={node.key}
              onClick={() => toggle(node.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggle(node.key)
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={gone}
              aria-label={t({
                en: `${t(node.label)} — ${gone ? "restore" : "remove"} this element`,
                nl: `${t(node.label)} — dit element ${gone ? "herstellen" : "weghalen"}`,
              })}
              className="cursor-pointer"
              data-cursor={gone ? "restore" : "remove"}
            >
              <motion.circle
                cx={x}
                cy={y}
                animate={{ r: gone ? 16 : 18 + 14 * h }}
                transition={spring}
                strokeWidth="1.5"
                strokeDasharray={gone ? "3 4" : "none"}
                className={cn(
                  "transition-[fill,stroke,fill-opacity,stroke-opacity] duration-500",
                  gone
                    ? "fill-[var(--background)] stroke-[var(--muted)] [stroke-opacity:0.7]"
                    : h > 0.85
                      ? "fill-gronn-green stroke-gronn-green"
                      : "fill-[var(--surface)] stroke-gronn-green [stroke-opacity:0.9]"
                )}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                className={cn(
                  "pointer-events-none select-none transition-[fill,opacity] duration-500",
                  gone
                    ? "fill-[var(--muted)] opacity-60"
                    : h > 0.85
                      ? "fill-gronn-white"
                      : "fill-[var(--accent)]"
                )}
              >
                {t(node.label)}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="min-h-56">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {t({ en: "System balance", nl: "Systeembalans" })}
        </p>
        <p
          className={cn(
            "mt-2 font-heading text-6xl font-semibold tracking-tight transition-colors duration-500",
            balance === 100 ? "text-gronn-green" : balance >= 70 ? "text-foreground" : "text-gronn-ember"
          )}
          aria-live="polite"
        >
          {balance}%
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={removed.size === 0 ? "intact" : [...removed].sort().join("-")}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            className="mt-6 max-w-lg"
          >
            {removed.size === 0 ? (
              <p className="text-lg leading-relaxed text-foreground/80">
                {t({
                  en: "Every element is connected. Tap one to remove it from the landscape and watch what its absence does to the rest of the system.",
                  nl: "Elk element is verbonden. Tik er één aan om het uit het landschap te halen en zie wat de afwezigheid met de rest van het systeem doet.",
                })}
              </p>
            ) : (
              <>
                <p className="text-lg leading-relaxed text-foreground/80">
                  {t({
                    en: "Removed: ",
                    nl: "Weggehaald: ",
                  })}
                  <span className="text-foreground">
                    {[...removed]
                      .map((k) => t(NODES.find((n) => n.key === k)!.label))
                      .join(" · ")}
                  </span>
                  {weakened.length > 0 && (
                    <>
                      {t({ en: " — weakened: ", nl: " — verzwakt: " })}
                      <span className="text-muted">
                        {weakened.map((n) => t(n.label)).join(" · ")}
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-4 text-muted">
                  {t({
                    en: "Nothing in a living system stands alone. This is why we design relationships first, and objects second.",
                    nl: "Niets in een levend systeem staat op zichzelf. Daarom ontwerpen we eerst relaties, en dan pas objecten.",
                  })}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {removed.size > 0 && (
          <button
            onClick={() => setRemoved(new Set())}
            className="mt-8 rounded-full border border-line/25 px-5 py-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:border-gronn-ember hover:text-gronn-ember"
          >
            {t({ en: "Restore the system", nl: "Herstel het systeem" })}
          </button>
        )}
      </div>
    </div>
  )
}
