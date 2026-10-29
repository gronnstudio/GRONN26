"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { IntakeFile } from "@/lib/intake-archive"
import { useFocusTrap } from "@/lib/use-focus-trap"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// What a client actually sent, opened at the size it was sent.
//
// The archive listed its attachments as a strip of 112px tiles that each
// opened a new browser tab. That is a file list, not a way to look at a
// garden: comparing two corners of the same pond meant two tabs and the
// back button, and a video did not render at all — it fell through the
// image branch and drew a broken picture.
//
// So the tiles now open in place, and the viewer knows what it is
// holding: a photograph fills the frame, a video plays with its
// controls, and anything else says what it is and offers itself for
// download. Arrow keys walk the set, because the whole point is
// comparing one shot with the next.

/** Where the bytes are: gated route for private, CDN for public. */
export function fileHref(file: IntakeFile): string {
  return file.access === "public" && file.url
    ? file.url
    : `/api/admin/intake-file/${file.pathname}`
}

export function isImage(file: IntakeFile): boolean {
  return file.contentType.startsWith("image/")
}

export function isVideo(file: IntakeFile): boolean {
  return file.contentType.startsWith("video/")
}

function readableSize(bytes: number): string {
  if (!bytes) return ""
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

function DocumentMark({ label }: { label: string }) {
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-background">
      <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden className="text-accent">
        <path
          d="M13 1H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-7-7Z"
          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        />
        <path d="M13 1v7h7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------- lightbox */

function Viewer({
  files,
  index,
  onClose,
  onMove,
  categoryLabel,
}: {
  files: IntakeFile[]
  index: number
  onClose: () => void
  onMove: (next: number) => void
  categoryLabel: (key: string) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useFocusTrap(ref, true, onClose)
  const file = files[index]

  // Arrows walk the set. Registered on the document rather than the
  // dialog so it works before the first tab lands anywhere inside it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onMove((index + 1) % files.length)
      if (e.key === "ArrowLeft") onMove((index - 1 + files.length) % files.length)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [index, files.length, onMove])

  if (!file) return null
  const href = fileHref(file)

  return (
    <div
      className={cn(
        "doc-chrome fixed inset-0 z-[80] flex flex-col bg-gronn-black/92 backdrop-blur-sm",
        // No entrance animation: this project has no animate-in utility,
        // and a viewer that fades in delays the thing you opened it for.
        reduced && "transition-none"
      )}
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={file.name}
        className="flex min-h-0 flex-1 flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head: what this is, and the way out. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <p className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gronn-white">
              {file.name}
            </span>
            <span className="mt-0.5 block font-mono text-[11px] text-gronn-white/60">
              {[
                categoryLabel(file.category),
                readableSize(file.size),
                `${index + 1} / ${files.length}`,
                file.access === "public" ? "openbaar opgeslagen" : "privé",
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </p>
          <a
            href={href}
            download={file.name}
            className="tap-target rounded-full border border-gronn-white/25 px-3.5 py-1.5 text-sm text-gronn-white transition-colors hover:border-gronn-ember hover:text-gronn-ember"
          >
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="tap-target rounded-full border border-gronn-white/25 px-3.5 py-1.5 text-sm text-gronn-white transition-colors hover:border-gronn-ember hover:text-gronn-ember"
          >
            Sluiten
          </button>
        </div>

        {/* The thing itself. */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-6">
          {isImage(file) ? (
            /* eslint-disable-next-line @next/next/no-img-element -- served
               from a session-gated route, not the image CDN; the optimiser
               cannot fetch it and should not try. */
            <img
              src={href}
              alt={file.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : isVideo(file) ? (
            <video
              src={href}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full bg-gronn-black"
            />
          ) : (
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gronn-white/60">
                {file.contentType === "application/pdf" ? "PDF" : "Bestand"}
              </p>
              <p className="mt-3 text-sm text-gronn-white/80">
                Dit bestand toont zichzelf niet hier.
              </p>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-gronn-green px-5 py-2.5 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong"
              >
                Openen in een tabblad
              </a>
            </div>
          )}

          {files.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onMove((index - 1 + files.length) % files.length)}
                aria-label="Vorige"
                className="tap-target absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-gronn-black/60 text-gronn-white transition-colors hover:bg-gronn-ember-strong sm:left-4"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => onMove((index + 1) % files.length)}
                aria-label="Volgende"
                className="tap-target absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-gronn-black/60 text-gronn-white transition-colors hover:bg-gronn-ember-strong sm:right-4"
              >
                →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- gallery */

export function MediaGallery({
  files,
  categoryLabel,
}: {
  files: IntakeFile[]
  categoryLabel: (key: string) => string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const move = useCallback((next: number) => setOpen(next), [])

  if (files.length === 0) return null

  return (
    <>
      <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(122px,1fr))] gap-2.5">
        {files.map((file, i) => (
          <li key={file.pathname}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-md border border-line/20 bg-background text-left transition-colors hover:border-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              <span className="relative block h-28 w-full">
                {isImage(file) ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- as above */
                  <img
                    src={fileHref(file)}
                    alt={file.name}
                    className="block h-28 w-full object-cover"
                  />
                ) : isVideo(file) ? (
                  <>
                    {/* metadata only: enough to paint a first frame
                        without pulling 150 MB into the page for a tile. */}
                    <video
                      src={fileHref(file)}
                      muted
                      playsInline
                      preload="metadata"
                      className="block h-28 w-full bg-gronn-black object-cover"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 grid place-items-center"
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-gronn-black/65 text-gronn-white transition-colors group-hover:bg-gronn-ember-strong">
                        ▶
                      </span>
                    </span>
                  </>
                ) : (
                  <DocumentMark
                    label={file.contentType === "application/pdf" ? "PDF" : "Bestand"}
                  />
                )}
              </span>
              <span className="block border-t border-line/20 px-2.5 py-2">
                <span className="block break-all font-mono text-[10px] leading-snug text-foreground/80">
                  {file.name}
                </span>
                <span className="mt-0.5 block font-mono text-[9.5px] text-muted">
                  {[categoryLabel(file.category), readableSize(file.size)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <Viewer
          files={files}
          index={open}
          onClose={() => setOpen(null)}
          onMove={move}
          categoryLabel={categoryLabel}
        />
      )}
    </>
  )
}
