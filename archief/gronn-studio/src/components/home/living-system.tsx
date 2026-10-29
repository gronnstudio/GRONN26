"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useInCenter } from "@/lib/use-in-center"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"
import type { HomeContent } from "@/lib/content-types"
import type { L } from "@/lib/i18n"

// Interactive systems diagram (outline §06): eight landscape elements on a
// ring; selecting one highlights its strongest relationships and explains
// its role in the system. Node colors come from the theme tokens so the
// diagram flips with light/dark.

type ElementKey =
  | "soil"
  | "water"
  | "plants"
  | "fungi"
  | "wildlife"
  | "materials"
  | "climate"
  | "people"

const ELEMENTS: {
  key: ElementKey
  label: L
  links: ElementKey[]
  text: L
}[] = [
  {
    key: "soil",
    label: { en: "Soil", nl: "Bodem" },
    links: ["water", "plants", "fungi"],
    text: {
      en: "Living soil stores water, feeds roots and hosts the biology every other element depends on. We build it first: de-compaction, organic matter, permanent cover.",
      nl: "Levende bodem bergt water, voedt wortels en herbergt de biologie waar elk ander element van afhangt. We bouwen die eerst op: verdichting doorbreken, organische stof, permanente bedekking.",
    },
  },
  {
    key: "water",
    label: { en: "Water", nl: "Water" },
    links: ["soil", "plants", "wildlife"],
    text: {
      en: "Water can be retained, slowed, filtered and reused within the landscape. Downpipes feed planting, low points become rain gardens, ponds circulate through planted filters instead of machinery.",
      nl: "Water kan binnen het landschap worden vastgehouden, vertraagd, gefilterd en hergebruikt. Regenpijpen voeden beplanting, laagtes worden regentuinen, vijvers circuleren door beplante filters in plaats van door techniek.",
    },
  },
  {
    key: "plants",
    label: { en: "Plants", nl: "Planten" },
    links: ["soil", "fungi", "wildlife"],
    text: {
      en: "Plant communities — not specimens — occupy every layer and season. They shade soil, pump carbon into it, filter water and feed everything with wings or legs.",
      nl: "Plantengemeenschappen — geen solitairen — bezetten elke laag en elk seizoen. Ze beschaduwen de bodem, pompen er koolstof in, filteren water en voeden alles met vleugels of poten.",
    },
  },
  {
    key: "fungi",
    label: { en: "Fungi", nl: "Schimmels" },
    links: ["soil", "plants"],
    text: {
      en: "Mycorrhizal networks connect roots into one trading system, moving water and nutrients where they are needed. Undisturbed soil and woody mulch keep the network intact.",
      nl: "Mycorrhizanetwerken verbinden wortels tot één handelssysteem dat water en voedingsstoffen brengt waar ze nodig zijn. Ongestoorde bodem en houtige mulch houden het netwerk intact.",
    },
  },
  {
    key: "wildlife",
    label: { en: "Wildlife", nl: "Dieren" },
    links: ["plants", "water", "climate"],
    text: {
      en: "Insects, birds and amphibians are the workforce: pollination, pest control, decomposition. They stay when food, shelter, water and safe routes exist together.",
      nl: "Insecten, vogels en amfibieën zijn de werkkrachten: bestuiving, plaagbeheersing, afbraak. Ze blijven wanneer voedsel, beschutting, water en veilige routes samen aanwezig zijn.",
    },
  },
  {
    key: "materials",
    label: { en: "Materials", nl: "Materialen" },
    links: ["people", "soil"],
    text: {
      en: "Durable, repairable, low-impact — and preferably already on site. Excavated stone becomes spillways; old paving becomes footings; nothing leaves that can still work.",
      nl: "Duurzaam, repareerbaar, met lage impact — en het liefst al op de locatie aanwezig. Uitgegraven steen wordt een overloop; oude bestrating wordt fundering; niets vertrekt dat nog kan werken.",
    },
  },
  {
    key: "climate",
    label: { en: "Climate", nl: "Klimaat" },
    links: ["water", "plants", "wildlife"],
    text: {
      en: "Every design is stress-tested against cloudbursts and drought. Retained water, shaded soil and layered planting are the buffer that keeps the system stable as extremes sharpen.",
      nl: "Elk ontwerp wordt getest op hoosbuien en droogte. Vastgehouden water, beschaduwde bodem en gelaagde beplanting vormen de buffer die het systeem stabiel houdt terwijl de extremen scherper worden.",
    },
  },
  {
    key: "people",
    label: { en: "People", nl: "Mensen" },
    links: ["materials", "plants"],
    text: {
      en: "Landscapes must stay usable, understandable and maintainable. Paths, sightlines and seasonal rhythm are designed so people remain part of the system, not visitors to it.",
      nl: "Landschappen moeten bruikbaar, begrijpelijk en onderhoudbaar blijven. Paden, zichtlijnen en seizoensritme zijn zo ontworpen dat mensen deel van het systeem blijven, geen bezoekers ervan.",
    },
  },
]

const R = 190
const CX = 250
const CY = 250

function nodePos(i: number) {
  const angle = (i / ELEMENTS.length) * Math.PI * 2 - Math.PI / 2
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
}

export function LivingSystem({ home }: { home: HomeContent }) {
  const t = useT()
  const reduced = useReducedMotion()
  const [active, setActive] = useState<ElementKey>("water")

  // The diagram walks itself round the ring, so the system reads as alive
  // rather than waiting to be poked. It yields to the visitor completely:
  //
  //   · reduced motion   — never rotates at all;
  //   · off screen       — no timer runs (useInCenter gates it);
  //   · hover / focus    — pauses while it is being examined;
  //   · a deliberate pick — stops for good. Taking control of something
  //     and having it move under you a moment later is the whole reason
  //     carousels are disliked.
  //
  // The "select an element" hint doubles as the stop mechanism, and the
  // panel is not a live region, so a screen reader is never interrupted
  // by a rotation it did not ask for.
  const { ref: ringRef, inCenter } = useInCenter<HTMLDivElement>()
  const [taken, setTaken] = useState(false)
  const [held, setHeld] = useState(false)

  const rotating = !reduced && !taken && !held && inCenter

  useEffect(() => {
    if (!rotating) return
    const id = window.setInterval(() => {
      setActive((prev) => {
        const i = ELEMENTS.findIndex((e) => e.key === prev)
        return ELEMENTS[(i + 1) % ELEMENTS.length].key
      })
    }, 4500)
    return () => window.clearInterval(id)
  }, [rotating])

  // A pick is the visitor taking the wheel — the ring stops permanently.
  const choose = (key: ElementKey) => {
    setTaken(true)
    setActive(key)
  }
  // Structure (keys, links, ring positions) is code; label and
  // explanation of each element come from the content document.
  const elements = ELEMENTS.map((el, i) => ({
    ...el,
    label: home.systemElements[i]?.label ?? el.label,
    text: home.systemElements[i]?.text ?? el.text,
  }))
  const activeIndex = elements.findIndex((e) => e.key === active)
  const current = elements[activeIndex]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
      <SectionLabel index="02">
        {t({ en: "Relationships", nl: "Relaties" })}
      </SectionLabel>
      <h2 className="mt-6 max-w-2xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        <EditableText path="home.systemTitle" value={home.systemTitle} />
      </h2>
      <p className="mt-4 max-w-xl text-muted">
        <EditableText path="home.systemHint" value={home.systemHint} />
      </p>

      <div
        ref={ringRef}
        // React's focus events bubble, so the container hears a node being
        // tabbed to and holds the rotation while it is inspected.
        // Pointer events gated on a real mouse, NOT onMouseEnter: a touch
        // fires mouseenter and never fires mouseleave, so on a phone the
        // first tap latched this true and the ring never turned again.
        // Same sticky-hover trap the dock's ember states hit.
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHeld(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHeld(false)
        }}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
        className="mt-14 grid items-center gap-12 lg:grid-cols-2"
      >
        <svg viewBox="0 0 500 500" className="mx-auto w-full max-w-lg" role="group">
          <title>Living systems diagram</title>
          {/* Ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--muted)"
            strokeOpacity="0.25"
            strokeDasharray="3 6"
          />
          {/* Connections from the active node */}
          {current.links.map((target) => {
            const from = nodePos(ELEMENTS.findIndex((e) => e.key === active))
            const to = nodePos(ELEMENTS.findIndex((e) => e.key === target))
            return (
              <motion.line
                key={`${active}-${target}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#197b4f"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )
          })}
          {/* Nodes */}
          {elements.map((el, i) => {
            const { x, y } = nodePos(i)
            const isActive = el.key === active
            const isLinked = current.links.includes(el.key)
            return (
              <g
                key={el.key}
                onClick={() => choose(el.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    choose(el.key)
                  }
                }}
                tabIndex={0}
                className="cursor-pointer"
                role="button"
                aria-label={t(el.label)}
                aria-pressed={isActive}
              >
                {/* Colors live in CSS classes, not framer's style prop —
                    motion caches SVG style fills and never re-applies them
                    when the active node changes, leaving stale colors.
                    Framer animates only the radius. */}
                <motion.circle
                  cx={x}
                  cy={y}
                  // Active node breathes — the system is alive, not
                  // selected. Reduced motion: it simply grows and holds.
                  animate={{
                    r: isActive ? (reduced ? 35 : [34, 36.5, 34]) : 26,
                  }}
                  transition={
                    isActive && !reduced
                      ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      : { duration: reduced ? 0 : 0.3 }
                  }
                  strokeWidth="1.5"
                  className={cn(
                    "transition-[fill,stroke,stroke-opacity] duration-300",
                    isActive
                      ? "fill-gronn-green stroke-gronn-green [stroke-opacity:1]"
                      : isLinked
                        ? "fill-[var(--surface)] stroke-gronn-green [stroke-opacity:1]"
                        : "fill-[var(--background)] stroke-[var(--muted)] [stroke-opacity:0.5]"
                  )}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  className={cn(
                    "pointer-events-none select-none transition-[fill] duration-300",
                    isActive
                      ? "fill-gronn-white"
                      : isLinked
                        ? "fill-[var(--accent)]"
                        : "fill-[var(--muted)]"
                  )}
                >
                  {t(el.label)}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="min-h-48">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="font-heading text-3xl font-semibold text-accent">
                <EditableText
                  path={`home.systemElements.${activeIndex}.label`}
                  value={current.label}
                />
              </h3>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-foreground/80">
                <EditableText
                  path={`home.systemElements.${activeIndex}.text`}
                  value={current.text}
                />
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.22em] text-muted">
                {t({ en: "Connects with", nl: "Verbonden met" })}{" "}
                <span className="text-accent">
                  {current.links
                    .map((k) => t(elements.find((e) => e.key === k)!.label))
                    .join(" · ")}
                </span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
