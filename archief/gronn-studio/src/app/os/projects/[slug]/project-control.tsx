"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, XIcon } from "lucide-react"

import type { Foto, Video } from "@/lib/data/vijverrenovatie"
import { useLanguage } from "@/components/language-provider"
import type { L, Locale } from "@/lib/i18n"
import { POND, POND_TASKS, euroFull } from "@/lib/os/data"
import { say, tr } from "@/lib/os/i18n"
import { useFocusTrap } from "@/lib/use-focus-trap"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// The interactive parts of the project control view.

/**
 * The zone index down the left. It follows the page: the zone you are
 * reading lights up, so on a long project you always know where you are.
 */
export function ZoneIndex({ zones }: { zones: { id: string; label: string }[] }) {
  const { locale } = useLanguage()
  const [current, setCurrent] = useState(zones[0]?.id)

  useEffect(() => {
    const els = zones.map((z) => document.getElementById(z.id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrent(visible[0].target.id)
      },
      // A band across the upper third: the zone crossing it is "current".
      { rootMargin: "-20% 0px -65% 0px" }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [zones])

  return (
    <nav aria-label={tr(locale, "Project zones", "Projectonderdelen")} className="hidden lg:block">
      <ol className="sticky top-[96px] space-y-[2px] border-l border-os-line">
        {zones.map((z, i) => {
          const on = z.id === current
          return (
            <li key={z.id}>
              <a
                href={`#${z.id}`}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "-ml-px flex items-baseline gap-[10px] border-l py-[6px] pl-[14px] text-[13px] transition-colors",
                  on ? "border-os-green text-os-text" : "border-transparent text-os-text-3 hover:text-os-text-2"
                )}
              >
                <span className="font-mono text-[10px] text-os-text-3">{String(i + 1).padStart(2, "0")}</span>
                {z.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

type Photo = Foto & { id: string }

/**
 * Photography as part of the system, not a file table: grouped by what
 * the photo shows (the situation before, the process, the construction),
 * with AI visualisations in a group of their own and a label on each, so
 * a visualisation can never be mistaken for work done.
 */
export function PhotoWall({ groups, videos }: { groups: { title: string; photos: Photo[] }[]; videos: Video[] }) {
  const { locale } = useLanguage()
  const all = groups.flatMap((g) => g.photos)
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-[32px]">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="os-label mb-[10px]">
            {g.title} <span className="text-os-text-3">· {g.photos.length}</span>
          </p>
          {/* A filmstrip per group at one height: portrait and landscape
              photos sit side by side without leaving holes. */}
          <ul className="flex gap-[10px] overflow-x-auto pb-[6px]">
            {g.photos.map((p) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen(all.indexOf(p))}
                  className="group relative block h-[260px] overflow-hidden rounded-[12px] bg-os-raised text-left"
                  style={{ aspectRatio: `${p.width} / ${p.height}` }}
                  aria-label={tr(locale, `Open photo: ${p.alt}`, `Foto openen: ${p.alt}`)}
                >
                  <Image
                    src={p.src}
                    alt=""
                    fill
                    sizes={`${Math.round((260 * p.width) / p.height)}px`}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <span aria-hidden className="photo-glass absolute inset-0" />
                  <span className="absolute left-[8px] top-[8px] rounded-full bg-os-ground/90 px-[8px] py-[1px] font-mono text-[10px] tracking-[0.08em] text-os-text-2">
                    {p.label ?? p.id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <p className="os-label mb-[10px]">Clips · {videos.length}</p>
        <ul className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
          {videos.map((v) => (
            <li key={v.src}>
              <video
                src={v.src}
                poster={v.poster}
                controls
                muted
                playsInline
                preload="none"
                aria-label={v.beschrijving}
                className="aspect-[9/16] w-full rounded-[12px] bg-os-raised object-cover"
              />
              {v.bijschrift && (
                <p lang="nl" className="mt-[6px] text-[12px] leading-[17px] text-os-text-3">
                  {v.bijschrift}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {open !== null && all[open] && (
          <Lightbox
            photos={all}
            index={open}
            onIndex={setOpen}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Photo[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const { locale } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useFocusTrap(ref, true, onClose)
  const p = photos[index]
  const go = (d: number) => onIndex((index + d + photos.length) % photos.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % photos.length)
      if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, photos.length, onIndex])

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-close]")?.focus()
  }, [])

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={tr(locale, "Photo", "Foto")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      className="fixed inset-0 z-50 grid grid-rows-[auto_1fr_auto] bg-os-ground/95"
    >
      <div className="flex items-center justify-between px-[24px] py-[16px]">
        <p className="font-mono text-[11px] tracking-[0.1em] text-os-text-3">
          {p.id} · {index + 1} / {photos.length}
          {p.fase ? ` · ${p.fase}` : ""}
        </p>
        <button
          type="button"
          data-close
          onClick={onClose}
          className="flex items-center gap-[6px] rounded-full border border-os-line px-[12px] py-[6px] text-[13px] text-os-text-2 hover:text-os-text"
        >
          <XIcon size={14} aria-hidden /> {tr(locale, "Close", "Sluiten")}
        </button>
      </div>
      <div className="relative mx-[24px] min-h-0">
        <Image src={p.src} alt={p.alt} fill sizes="100vw" className="object-contain" />
        {p.label && (
          <span className="absolute left-[12px] top-[12px] rounded-full bg-os-ground/90 px-[10px] py-[3px] font-mono text-[11px] uppercase tracking-[0.1em] text-os-text">
            {p.label}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-[16px] px-[24px] py-[16px]">
        <button type="button" onClick={() => go(-1)} className="flex items-center gap-[4px] rounded-full border border-os-line px-[12px] py-[6px] text-[13px] text-os-text-2 hover:text-os-text">
          <ChevronLeftIcon size={14} aria-hidden /> {tr(locale, "Previous", "Vorige")}
        </button>
        <p lang="nl" className="max-w-[720px] text-center text-[13px] leading-[20px] text-os-text-2">
          {p.bijschrift ?? p.alt}
        </p>
        <button type="button" onClick={() => go(1)} className="flex items-center gap-[4px] rounded-full border border-os-line px-[12px] py-[6px] text-[13px] text-os-text-2 hover:text-os-text">
          {tr(locale, "Next", "Volgende")} <ChevronRightIcon size={14} aria-hidden />
        </button>
      </div>
    </motion.div>
  )
}

// ── Contextual actions ────────────────────────────────────────────────

type Action = { id: string; label: L; phase?: L }

const ACTIONS: Action[] = [
  { id: "summary", label: { en: "Summarize project", nl: "Project samenvatten" } },
  { id: "next", label: { en: "Create next actions", nl: "Volgende acties maken" } },
  {
    id: "update",
    label: { en: "Generate client update", nl: "Klantupdate maken" },
    phase: { en: "Phase 3: Claude drafts it from the project log; you edit and send.", nl: "Fase 3: Claude schrijft een concept uit het projectlogboek; jij past aan en verstuurt." },
  },
  {
    id: "invoice",
    label: { en: "Create invoice draft", nl: "Conceptfactuur maken" },
    phase: {
      en: "Phase 3: drafted from hours and materials; nothing is sent or booked without your confirmation.",
      nl: "Fase 3: opgesteld uit uren en materialen; niets wordt verstuurd of geboekt zonder jouw akkoord.",
    },
  },
  {
    id: "profit",
    label: { en: "Analyse profitability", nl: "Rendement analyseren" },
    phase: { en: "Phase 2 needs the real invoices and purchases first.", nl: "Fase 2 heeft eerst de echte facturen en inkopen nodig." },
  },
  { id: "risks", label: { en: "Analyse project risks", nl: "Projectrisico's analyseren" }, phase: { en: "Phase 3.", nl: "Fase 3." } },
  {
    id: "page",
    label: { en: "Generate project page", nl: "Projectpagina maken" },
    phase: {
      en: "Already exists: gronn.studio/projects shows this pond. Phase 3 drafts pages for the next ones.",
      nl: "Bestaat al: gronn.studio/projects toont deze vijver. Fase 3 maakt concepten voor de volgende.",
    },
  },
]

/**
 * Claude's actions on this project, as verbs on the project itself, not
 * a chat box. Two can already be answered from the data on this page,
 * and are, deterministically, marked as such. The rest say which phase
 * connects them rather than pretending.
 */
export function AiActions() {
  const { locale } = useLanguage()
  const [picked, setPicked] = useState<Action | null>(null)

  return (
    <div className="grid gap-[20px] xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <ul className="space-y-[6px]">
        {ACTIONS.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setPicked(a)}
              aria-pressed={picked?.id === a.id}
              className={cn(
                "flex w-full items-center gap-[10px] rounded-full border px-[14px] py-[8px] text-left text-[13px] transition-colors",
                picked?.id === a.id ? "border-os-green bg-os-forest text-os-text" : "border-os-line text-os-text-2 hover:border-os-green-2 hover:text-os-text"
              )}
            >
              <SparklesIcon size={13} aria-hidden className={a.phase ? "text-os-text-3" : "text-os-green"} />
              {a.label[locale]}
              {a.phase && <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em] text-os-text-3">{tr(locale, "later", "later")}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div aria-live="polite" className="min-h-[200px] rounded-[16px] border border-os-line bg-os-surface p-[20px]">
        {!picked && (
          <p className="text-[14px] leading-[22px] text-os-text-3">
            {tr(
              locale,
              "Pick an action. The result appears here, and nothing is saved or sent from this panel.",
              "Kies een actie. Het resultaat verschijnt hier; vanuit dit paneel wordt niets opgeslagen of verstuurd."
            )}
          </p>
        )}
        {picked?.id === "summary" && <Summary locale={locale} />}
        {picked?.id === "next" && <NextActions locale={locale} />}
        {picked?.phase && (
          <>
            <p className="font-heading text-[16px] text-os-text">{picked.label[locale]}</p>
            <p className="mt-[8px] text-[14px] leading-[22px] text-os-text-2">
              {tr(locale, "Not connected yet.", "Nog niet gekoppeld.")} {picked.phase[locale]}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Source({ locale }: { locale: Locale }) {
  return (
    <p className="mt-[16px] font-mono text-[10px] uppercase tracking-[0.12em] text-os-text-3">
      {tr(locale, "Composed from this project's data · no model involved yet", "Samengesteld uit de gegevens van dit project · nog geen model gebruikt")}
    </p>
  )
}

function Summary({ locale }: { locale: Locale }) {
  const open = POND_TASKS.filter((t) => !t.done)
  if (locale === "nl") {
    return (
      <div className="text-[14px] leading-[23px] text-os-text-2">
        <p className="font-heading text-[16px] text-os-text">Vijverklant · vijverreconstructie</p>
        <p className="mt-[8px]">
          Twee vijvers, een waterval en een beekloop samengevoegd tot één watersysteem van ongeveer 5.000 liter. {POND.progress}% klaar, in
          de {say(locale, POND.status).toLowerCase()}, na ongeveer {POND.hours} uur inclusief voorbereiding. Projectwaarde {euroFull(POND.value)}.
        </p>
        <p className="mt-[8px]">
          Het technische werk is af: 50 mm druk-pvc, een driekamerfilter met bypass, twee regelbare takken en een gerepareerd
          PP-filter. Er staan nog {open.length} dingen open, het eerst het hout en puin afvoeren en aanvullen met teelaarde; verdere
          beplanting volgt in het voorjaar van 2027.
        </p>
        <p className="mt-[8px]">Let op: de vissen beschadigden nieuwe planten, dus de vervangers moeten beschermd worden.</p>
        <Source locale={locale} />
      </div>
    )
  }
  return (
    <div className="text-[14px] leading-[23px] text-os-text-2">
      <p className="font-heading text-[16px] text-os-text">Vijverklant · pond reconstruction</p>
      <p className="mt-[8px]">
        Two ponds, a waterfall and a stream joined into one water system of about 5,000 litres. {POND.progress}% done, in{" "}
        {POND.status.toLowerCase()}, after about {POND.hours} hours including preparation. Project value {euroFull(POND.value)}.
      </p>
      <p className="mt-[8px]">
        The technical work is complete: 50 mm pressure PVC, a three-chamber filter with bypass, two adjustable branches and a
        repaired PP filter. {open.length} things remain, the nearest being clearing wood and rubble and topping up with topsoil;
        further planting follows in spring 2027.
      </p>
      <p className="mt-[8px]">Watch: the fish damaged new plants, so the replacements need protecting.</p>
      <Source locale={locale} />
    </div>
  )
}

function NextActions({ locale }: { locale: Locale }) {
  const open = POND_TASKS.filter((t) => !t.done)
  return (
    <div>
      <p className="font-heading text-[16px] text-os-text">{tr(locale, "Next actions, in order", "Volgende acties, op volgorde")}</p>
      <ol className="mt-[10px] space-y-[8px]">
        {open.map((t, i) => (
          <li key={t.what} className="flex gap-[10px] text-[14px] leading-[21px] text-os-text-2">
            <span className="font-mono text-[11px] leading-[21px] text-os-text-3">{String(i + 1).padStart(2, "0")}</span>
            {say(locale, t.what)}
          </li>
        ))}
      </ol>
      <Source locale={locale} />
    </div>
  )
}
