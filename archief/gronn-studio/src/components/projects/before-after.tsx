"use client"

import { useCallback, useRef, useState } from "react"

import { Photo } from "@/components/photo"
import { useT } from "@/components/language-provider"
import type { L } from "@/lib/i18n"

// Before/after comparison — the one "widget" a landscape studio cannot
// do without (idea audited from Qi Addons' catalogue, rebuilt natively:
// no library, ~zero weight). Drag the ember handle, or focus it and use
// the arrow keys, to sweep the finished landscape across the starting
// one. The divider is a survey line: ember, hairline, with a labelled
// stadium handle — design rule 1, the control explains itself.
//
// The after image is the base layer and the before image is clipped
// above it, so the reveal is a single clip-path update per frame — no
// re-layout, no repaint of either photo.
export function BeforeAfter({
  before,
  after,
  caption,
}: {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
  caption?: L
}) {
  const t = useT()
  const frame = useRef<HTMLDivElement>(null)
  // Percentage of the width at which the divider sits.
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect) return
    const next = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(96, Math.max(4, next)))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setFromClientX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromClientX(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4
    if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - step))
    else if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + step))
    else if (e.key === "Home") setPos(4)
    else if (e.key === "End") setPos(96)
    else return
    e.preventDefault()
  }

  const beforeLabel = t({ en: "Before", nl: "Voor" })
  const afterLabel = t({ en: "After", nl: "Na" })

  return (
    <figure>
      <div
        ref={frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative aspect-[4/3] touch-none select-none overflow-hidden rounded-lg sm:aspect-[16/9]"
      >
        <Photo
          src={after.src}
          alt={after.alt}
          sizes="(min-width: 1024px) 56rem, 100vw"
          className="object-cover"
        />
        {/* The starting state, clipped to the left of the divider. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Photo
            src={before.src}
            alt=""
            sizes="(min-width: 1024px) 56rem, 100vw"
            className="object-cover"
          />
        </div>
        {/* One glass screen over both halves — the shared treatment
            every photograph on the site carries. */}
        <div aria-hidden className="photo-glass absolute inset-0" />
        {/* Corner tags. Theme-invariant over the photograph, like every
            label the photo treatment carries. */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-gronn-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gronn-white/90">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-gronn-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gronn-white/90">
          {afterLabel}
        </span>
        {/* Survey line + handle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-px bg-gronn-ember"
          style={{ left: `${pos}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label={t({
            en: "Compare before and after",
            nl: "Vergelijk voor en na",
          })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${afterLabel} ${Math.round(100 - pos)}%`}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 flex h-9 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full bg-gronn-black/55 text-gronn-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/25 backdrop-blur-sm transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] active:scale-95"
          style={{ left: `${pos}%` }}
        >
          <svg aria-hidden width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path
              d="M5 1 1 6l4 5M13 1l4 5-4 5"
              stroke="var(--gronn-ember)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {caption && (
        <figcaption className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted">
          {t(caption)}
        </figcaption>
      )}
    </figure>
  )
}
