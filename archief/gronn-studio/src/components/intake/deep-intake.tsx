"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"

import { safeReference } from "@/lib/intake-reference"
import { acceptAttribute, refusalText, refuse } from "@/lib/intake-uploads"

import { useLanguage, useT } from "@/components/language-provider"
import { hasSwatches, Swatch } from "@/components/intake/swatches"
import {
  INTAKE_HEAD,
  INTAKE_HERO,
  INTAKE_SECTIONS,
  INTAKE_SLIDER_DEFAULT,
  type IntakeBlock,
  type IntakeQuestion,
  type IntakeSection,
} from "@/lib/data/intake"
import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { cn } from "@/lib/utils"

// The long intake, rendered from `lib/data/intake.ts`.
//
// Six shapes repeated — a head field, a question with a box under it, a
// picker of material samples, a slider, a photo tray, a disclosure — and
// every section is an arrangement of those. Writing the eight sections
// as JSX would have been the same markup eight times, which is how two
// of them end up subtly different a month later.
//
// Three things this page does that the short form on /contact does not:
//
//  · It keeps a draft. Forty fields is an evening's work and nobody
//    finishes it in one sitting. The draft is visible — it says when it
//    was last kept and offers to throw it away — because silently
//    remembering what somebody typed about their house is not a thing
//    to do quietly.
//  · Photographs actually leave the browser, straight to Blob storage.
//  · It prints. The sheet is carried to the site, and section 08 is the
//    survey filled in there.

/**
 * Good enough to hand to a relay that will refuse anything else.
 *
 * Not validation of the visitor's input — they may write whatever they
 * like in "Phone / email" and it reaches the studio either way. This
 * only decides whether the string is safe to put in a field that
 * rejects the entire submission when it is not an address.
 */
function looksLikeEmail(value: string | undefined): boolean {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/**
 * Where the half-finished sheet is kept.
 *
 * Keyed by mode, because the studio's copy and a visitor's copy must not
 * be the same slot. A visitor fills this in once; the owner fills one in
 * per phone call, and a single shared key would have call number two
 * open on top of call number one's answers.
 */
function draftKey(mode: IntakeMode): string {
  return mode === "studio" ? "gronn-intake-draft-studio" : "gronn-intake-draft"
}

/**
 * Who is filling this in.
 *
 * "visitor" is the public form at /contact/intake: it minted its own
 * reference, uploads with a short-lived public token, and falls back to
 * e-mail and then to a mailto draft, because losing somebody's evening
 * is the worst outcome there.
 *
 * "studio" is the same questionnaire inside the owner panel, typed while
 * the client is on the phone. Everything about the NOTIFICATION half is
 * wrong there — see /api/admin/intake for the details — so this mode
 * writes to the archive and stops.
 */
export type IntakeMode = "visitor" | "studio"
const MAX_PHOTOS = 24

// The size ceilings and the accepted types come from
// `src/lib/intake-uploads.ts`, which the upload route imports too. They
// used to live here AND there, and disagree: this side took anything
// beginning `image/` or `video/`, that side held eleven fixed types. A
// GIF, an AVIF, a scanned TIFF or a Live Photo therefore passed the tray,
// survived forty questions, and was refused at the very end — with
// nothing saying which file or why.

type Photo = { id: string; name: string; url: string; file: File }
type Draft = {
  head: Record<string, string>
  answers: Record<string, string>
  picks: Record<string, string[]>
  sliders: Record<string, number>
  savedAt: number
}

/* ────────────────────────────────────────────────────────────────── */

/** A box that grows with what is typed into it. */
function Answer({
  value,
  onChange,
  placeholder,
  tone = "light",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  tone?: "light" | "dark"
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Height follows content. Reset to auto first or the box can only ever
  // grow — scrollHeight of an already-tall box never shrinks.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={cn(
        // `text-base` (16px) on a phone for the same reason as the head
        // fields: below 16px iOS zooms the page in on focus and leaves it
        // there. `sm:text-sm` keeps the 14px the sheet was designed at
        // everywhere a pointer is likely.
        "w-full resize-y rounded-md border px-3 py-2 text-base leading-relaxed transition-colors sm:text-sm",
        // The field on the green band is a LIGHT well, not a lightened
        // patch of the band. It used to be `bg-gronn-white/[0.07]`, and
        // seven percent of white is exactly enough to lift the ground
        // from #197b4f to #28845b — which drops its own white text from
        // 4.87:1 to 4.28:1, under the floor. The placeholder, at 40%,
        // measured 1.91:1: the example answer that shows a visitor what
        // to write was very nearly invisible.
        //
        // A translucent light fill on a mid-dark ground can only ever
        // work against the text it carries. Inverting it fixes all three
        // numbers at once and gives the control a real boundary, which a
        // 1.56:1 hairline border was not providing either:
        //
        //   white fill against the band   4.87:1  (a boundary needs 3)
        //   black text on the fill       19.43:1
        //   placeholder at 60%            5.64:1
        //   ember-strong focus border     4.64:1  (pure ember is 2.99)
        //
        // Theme-invariant brand constants, deliberately, because the band
        // itself is one — same reasoning as `photo-glass`.
        tone === "dark"
          ? "min-h-28 border-transparent bg-gronn-white text-gronn-black placeholder:text-gronn-black/60 focus:border-gronn-ember-strong"
          : "min-h-11 border-line/20 bg-surface text-foreground placeholder:text-muted focus:border-accent focus:bg-background"
      )}
    />
  )
}

/** One question and its box. */
function Question({
  item,
  value,
  onChange,
}: {
  item: IntakeQuestion
  value: string
  onChange: (v: string) => void
}) {
  const t = useT()
  return (
    <li className="border-b border-dotted border-line/20 py-3 last:border-b-0">
      <label className="block">
        <span className="mb-2 block text-[15px] leading-snug text-foreground/85">
          {t(item.q)}
          {item.stress && (
            <>
              {" "}
              <strong className="font-semibold text-[color:var(--ember-text)]">
                {t(item.stress)}
              </strong>
            </>
          )}
        </span>
        <Answer value={value} onChange={onChange} />
      </label>
    </li>
  )
}

/** A material sample you can switch on. */
function Chip({
  group,
  option,
  label,
  note,
  on,
  onToggle,
  plain = false,
  single = false,
}: {
  group: string
  option: string
  label: string
  note?: string
  on: boolean
  onToggle: () => void
  /** No drawing to show: render the words alone, compactly. */
  plain?: boolean
  /** One of the group, not as many as apply. */
  single?: boolean
}) {
  // A radio announces "one of five"; a pressed button announces "on".
  // Both are true of different pickers here and saying the wrong one
  // costs a screen-reader user the whole rule of the group.
  const role = single ? { role: "radio", "aria-checked": on } : { "aria-pressed": on }

  if (plain) {
    return (
      <button
        type="button"
        {...role}
        onClick={onToggle}
        data-chip={on ? "on" : "off"}
        className={cn(
          // `min-h-11` rather than `tap-target`: this control has no
          // spare room around it to borrow, and a 44px box drawn over a
          // neighbouring chip would swallow its taps. Here the drawn
          // height IS the touch height.
          "flex min-h-11 flex-col justify-center rounded-md border px-4 py-2.5 text-left transition-colors",
          on
            ? "border-gronn-ember ring-2 ring-inset ring-gronn-ember"
            : "border-line/20 hover:border-accent active:border-accent"
        )}
      >
        <span className="block text-[15px] font-semibold leading-tight text-foreground">
          {label}
        </span>
        {note && (
          <span className="mt-0.5 block font-mono text-[10.5px] tracking-[0.06em] text-muted">
            {note}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      {...role}
      onClick={onToggle}
      data-chip={on ? "on" : "off"}
      className={cn(
        // A flex column, not a block: cards in one row stretch to the
        // tallest of them, and under block layout that leftover height
        // landed on the sample rather than the caption — so identical
        // materials came out different sizes depending on how long the
        // name beside them was.
        "group relative flex flex-col overflow-hidden rounded-md border text-left transition-colors",
        on
          ? "border-gronn-ember ring-2 ring-inset ring-gronn-ember"
          : "border-line/20 hover:border-accent"
      )}
    >
      <span className="block aspect-[132/92] shrink-0">
        <Swatch group={group} option={option} />
      </span>
      {on && (
        <span
          aria-hidden
          className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-gronn-ember-strong"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 8.3l2.6 2.6L12 5.5"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <span className="flex flex-1 flex-col justify-start border-t border-line/20 bg-surface px-3 py-2.5">
        <span className="block text-[13.5px] font-semibold leading-tight text-foreground">
          {label}
        </span>
        {note && (
          <span className="mt-0.5 block font-mono text-[10px] tracking-[0.06em] text-muted">
            {note}
          </span>
        )}
      </span>
    </button>
  )
}

/** The tray of photographs for one category. */
function PhotoTray({
  photos,
  onAdd,
  onRemove,
  cta,
  sub,
  accepts = "images",
}: {
  photos: Photo[]
  onAdd: (files: FileList | null) => void
  onRemove: (id: string) => void
  cta: string
  sub: string
  accepts?: "images" | "documents"
}) {
  const t = useT()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  return (
    <>
      {/* A button, not a label wrapping a div: a drop zone that is also
          a click target has to be reachable by keyboard, and a label is
          not focusable. */}
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          onAdd(e.dataTransfer.files)
        }}
        data-print="hide"
        className={cn(
          "w-full rounded-md border border-dashed px-5 py-7 text-center transition-colors",
          over
            ? "border-gronn-ember bg-surface"
            : "border-line/35 bg-surface/50 hover:border-gronn-ember hover:bg-surface"
        )}
      >
        <span className="block font-heading text-[15px] font-semibold text-accent">
          {cta}
        </span>
        <span className="mt-1 block text-[13px] text-muted">{sub}</span>
      </button>
      <input
        ref={input}
        type="file"
        // From the shared list, so the picker offers exactly what the
        // upload will take.
        accept={acceptAttribute(accepts === "documents")}
        multiple
        // `sr-only` hides it from the eye but NOT from the accessibility
        // tree, so this is a real file input that a screen reader reaches
        // and, until now, announced with no name at all — on the one
        // control the whole enquiry depends on. axe rated it critical.
        //
        // The name is the same sentence the visible button carries, so
        // the two agree; `cta` is already resolved through `useT()` by
        // the caller, so it is in the visitor's language.
        aria-label={cta}
        className="sr-only"
        onChange={(e) => {
          onAdd(e.target.files)
          e.target.value = ""
        }}
      />
      {photos.length > 0 && (
        <ul className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2.5">
          {photos.map((p) => (
            <li
              key={p.id}
              className="relative overflow-hidden rounded-md border border-line/20 bg-surface"
            >
              {p.file.type === "application/pdf" ? (
                <span className="flex h-24 w-full flex-col items-center justify-center gap-1.5 bg-background">
                  <svg
                    width="22"
                    height="26"
                    viewBox="0 0 22 26"
                    fill="none"
                    aria-hidden
                    className="text-accent"
                  >
                    <path
                      d="M13 1H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-7-7Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 1v7h7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                    PDF
                  </span>
                </span>
              ) : p.file.type.startsWith("video/") ? (
                /* The first frame is the thumbnail, and it is free:
                   `preload="metadata"` fetches enough to paint one
                   without pulling a 90 MB file into the page. Muted and
                   playsInline so a tap previews it where it sits instead
                   of hijacking the phone into fullscreen. */
                <video
                  src={p.url}
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  className="block h-24 w-full bg-gronn-black object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element -- an
                   object URL for a file the visitor just picked; there is
                   nothing for the image optimiser to fetch. */
                <img
                  src={p.url}
                  alt={p.name}
                  className="block h-24 w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                data-print="hide"
                aria-label={t({ en: "Remove", nl: "Verwijder" }) + ` ${p.name}`}
                // Drawn at 24px because a bigger disc would cover the
                // photograph it sits on; pressed at 44px, because 24 is
                // the floor of WCAG 2.5.8 and a thumb is not a mouse.
                // `tap-target` is exactly this: a 44px box centred on the
                // control, out of flow, so nothing moves.
                className="tap-target absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-gronn-black/75 text-gronn-white transition-colors hover:bg-gronn-ember-strong active:bg-gronn-ember-strong"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <span className="block break-all px-2 py-1.5 font-mono text-[9.5px] leading-snug text-muted">
                {p.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/* ────────────────────────────────────────────────────────────────── */

export function DeepIntake({ mode = "visitor" }: { mode?: IntakeMode } = {}) {
  const t = useT()
  const { locale } = useLanguage()
  const studio = mode === "studio"
  const [head, setHead] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [picks, setPicks] = useState<Record<string, string[]>>({})
  const [sliders, setSliders] = useState<Record<string, number>>({})
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({})
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [status, setStatus] = useState<L | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  /** Files the visitor chose that never reached storage. */
  const [lost, setLost] = useState(0)
  const [company, setCompany] = useState("")
  /**
   * How the submission actually reached the studio.
   *
   * "archive" means it is in the owner panel. "email" means the archive
   * refused it and the mail relay is the only copy — a real difference,
   * because the success screen and the relay itself both used to claim
   * the full sheet was in the panel either way. It was not.
   */
  const [delivery, setDelivery] = useState<"archive" | "email">("archive")
  const restored = useRef(false)

  /* ── the draft ─────────────────────────────────────────────────── */

  // Restoring the draft after mount, which is the one shape of
  // setState-in-an-effect that is correct rather than lazy: this state
  // CANNOT be initialised where state normally is. `localStorage` does
  // not exist while the server renders, and seeding it in a lazy
  // initialiser would make the client's first render disagree with the
  // server's HTML — a hydration mismatch on every controlled input on
  // the page. It runs exactly once, and the ref below stops the save
  // effect from writing back over what it just read.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey(mode))
      if (raw) {
        const d = JSON.parse(raw) as Draft
        // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
        setHead(d.head ?? {})
        setAnswers(d.answers ?? {})
        setPicks(d.picks ?? {})
        setSliders(d.sliders ?? {})
        setSavedAt(d.savedAt ?? null)
      }
    } catch {
      // A corrupt or refused draft is not worth a message. The form
      // works empty, which is where it would have started anyway.
    }
    restored.current = true
    // `mode` picks the storage slot. It never changes for a mounted
    // form, but naming it is what stops the two modes sharing a draft if
    // that ever stops being true.
  }, [mode])

  useEffect(() => {
    // Never write on the render that restored: it would stamp a new
    // savedAt over the one just read, before anything was typed.
    if (!restored.current) return
    // Nothing typed yet, nothing to keep. Without this the page claimed
    // "kept on this device" the moment it loaded, which is both untrue
    // and the sort of untrue that makes someone wonder what else is
    // being stored about them.
    const anything =
      Object.values(head).some((v) => v.trim()) ||
      Object.values(answers).some((v) => v.trim()) ||
      Object.values(picks).some((v) => v.length) ||
      Object.keys(sliders).length > 0
    if (!anything) return

    const id = window.setTimeout(() => {
      const now = Date.now()
      try {
        // Photographs are deliberately NOT stored. A handful of phone
        // photographs as data URLs exceeds the localStorage quota on
        // its own, and the failure would take the text answers with it.
        window.localStorage.setItem(
          draftKey(mode),
          JSON.stringify({ head, answers, picks, sliders, savedAt: now })
        )
        setSavedAt(now)
      } catch {
        // Quota or a private window. The form keeps working.
      }
    }, 800)
    return () => window.clearTimeout(id)
  }, [head, answers, picks, sliders, mode])

  /* ── editing ───────────────────────────────────────────────────── */

  const setAnswer = useCallback(
    (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v })),
    []
  )

  const togglePick = useCallback(
    (group: string, option: string, single = false) => {
      setPicks((p) => {
        const on = p[group] ?? []
        const already = on.includes(option)
        // Single-choice groups still let you take the answer back — a
        // second tap on the one you chose clears it. A budget you can
        // set but never unset is a trap, not a shortcut, and the whole
        // point of these groups is that they are cheap to change.
        if (single) return { ...p, [group]: already ? [] : [option] }
        return {
          ...p,
          [group]: already ? on.filter((x) => x !== option) : [...on, option],
        }
      })
    },
    []
  )

  const addPhotos = useCallback(
    (key: string, files: FileList | null, accepts: "images" | "documents" = "images") => {
      if (!files) return
      // A tray takes what its own question asks for. The four photograph
      // trays stay photographs — a PDF dropped into "what repels you" is
      // almost certainly a mistake — while the drawings tray takes both,
      // because a paper plan reaches us as a phone photograph at least as
      // often as it reaches us as a PDF.
      //
      // Video is welcome in every tray that takes pictures. A pond that
      // is green in a still and a pond whose surface is moving are not
      // the same diagnosis, and ten seconds of footage says what four
      // photographs cannot.
      // A tray takes what the STUDIO can open, not what the browser is
      // willing to name — and the PDF question is the tray's own, since
      // a paper plan reaches us as a photograph at least as often.
      const chosen = Array.from(files).filter(
        (f) => accepts === "documents" || f.type !== "application/pdf"
      )
      const rejected: { file: File; reason: "type" | "size" }[] = []
      const ok: File[] = []
      for (const file of chosen) {
        const reason = refuse(file)
        if (reason) rejected.push({ file, reason })
        else ok.push(file)
      }

      setPhotos((prev) => {
        const room = MAX_PHOTOS - Object.values(prev).reduce((n, l) => n + l.length, 0)
        const taken = ok.slice(0, Math.max(0, room))
        if (taken.length < ok.length) {
          setStatus({
            en: `Only ${MAX_PHOTOS} photographs fit in one submission. Send the rest by email.`,
            nl: `Er passen ${MAX_PHOTOS} foto's in één inzending. Stuur de rest per mail na.`,
          })
        }
        return {
          ...prev,
          [key]: [
            ...(prev[key] ?? []),
            ...taken.map((file) => ({
              id: `${file.name}-${file.size}-${file.lastModified}`,
              name: file.name,
              url: URL.createObjectURL(file),
              file,
            })),
          ],
        }
      })

      if (rejected.length) {
        // Name the file and the reason. A count alone is what left a
        // visitor staring at "2 bestanden niet" with no idea which two,
        // and nothing they could do about it.
        const first = rejected[0]
        const why = refusalText(first.reason, first.file.type)
        const more = rejected.length - 1
        setStatus({
          en: `${first.file.name} was skipped — ${why.en}.${more > 0 ? ` And ${more} more.` : ""}`,
          nl: `${first.file.name} is overgeslagen — ${why.nl}.${more > 0 ? ` En nog ${more}.` : ""}`,
        })
      }
    },
    []
  )

  const removePhoto = useCallback((key: string, id: string) => {
    setPhotos((prev) => {
      const gone = (prev[key] ?? []).find((p) => p.id === id)
      // Object URLs are held by the document until revoked. Dropping the
      // reference is not enough; the blob stays in memory.
      if (gone) URL.revokeObjectURL(gone.url)
      return { ...prev, [key]: (prev[key] ?? []).filter((p) => p.id !== id) }
    })
  }, [])

  // Same reason, for everything still on screen when the page goes away.
  useEffect(() => {
    const held = photos
    return () => {
      for (const list of Object.values(held)) {
        for (const p of list) URL.revokeObjectURL(p.url)
      }
    }
    // Intentionally on unmount only: revoking on every change would
    // break the previews that are still rendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── what the studio reads ─────────────────────────────────────── */

  const transcript = useCallback(() => {
    const lines: string[] = [
      `# ${t({ en: "Garden design intake", nl: "Intake tuinontwerp" })} — GRØNN Studio`,
      "",
      ...INTAKE_HEAD.map((f) => `${t(f.label)}: ${head[f.id]?.trim() || "—"}`),
      "",
      `## ${t(INTAKE_HERO.title)}`,
      answers.hero?.trim() || "—",
      "",
    ]

    for (const section of INTAKE_SECTIONS) {
      const body: string[] = []
      for (const block of section.blocks) {
        if (block.kind === "picker") {
          const on = picks[block.id] ?? []
          if (!on.length) continue
          const names = block.options
            .filter((o) => on.includes(o.id))
            .map((o) => t(o.label))
          body.push(`- ${t(block.title)}: ${names.join(", ")}`)
          continue
        }
        if (block.kind === "sliders") {
          for (const s of block.sliders) {
            body.push(
              `- ${t(s.label)}: ${sliders[s.id] ?? INTAKE_SLIDER_DEFAULT}/5`
            )
          }
        }
        if (block.kind === "photos") {
          const list = photos[block.id] ?? []
          if (list.length) {
            body.push(
              `- ${t(block.title)}: ${list.length} ${t({ en: "photographs", nl: "foto's" })}`
            )
          }
        }
        for (const item of block.items ?? []) {
          const v = answers[item.id]?.trim()
          if (v) body.push(`\n**${t(item.q)}**\n${v}`)
        }
      }
      if (body.length) {
        lines.push(`## ${section.num} — ${t(section.title)}`, ...body, "")
      }
    }
    return lines.join("\n")
  }, [t, head, answers, picks, sliders, photos])

  /* ── sending ───────────────────────────────────────────────────── */

  async function handleSend() {
    if (sending) return
    // Honeypot: a bot that filled the hidden field gets a plausible
    // success and nothing is sent anywhere.
    if (company) {
      setSent(true)
      return
    }

    // Somewhere to write back to. Nothing was required before, so a
    // sheet could be archived, announced and thanked with no name and no
    // contact on it — forty answers about a garden the studio has no way
    // of replying to. One of the two is enough; which one is the
    // visitor's business.
    if (!head.client?.trim() && !head.contact?.trim()) {
      setStatus({
        en: "Add your name or a way to reach you at the top — otherwise we cannot answer.",
        nl: "Vul bovenaan je naam of een manier om je te bereiken in — anders kunnen we niet antwoorden.",
      })
      document.getElementById("intake-head")?.scrollIntoView({ block: "center" })
      return
    }
    setSending(true)
    setStatus({ en: "Sending…", nl: "Versturen…" })

    // The folder is named by the SERVER, not here.
    //
    // This line used to slug the visitor's own project name, and the
    // submission route then slugged it again with a slightly different
    // transform — collapsing repeated dashes, trimming the ends. Any
    // project name ending in punctuation ("Tuin!"), starting with it
    // ("'t Gooi"), or long enough to be cut at 40 characters on a dash
    // produced two different folder names: the photographs went to one,
    // the record to the other, and the route's prefix check then dropped
    // every file from the enquiry that described them. Five of nine
    // realistic project names hit it.
    //
    // Asking for a reference also means the folder is unguessable, which
    // is what stops the public upload endpoint being usable to write into
    // somebody else's dossier.
    let reference = ""
    try {
      const res = await fetch("/api/intake/start", { method: "POST" })
      if (res.ok) {
        const body = (await res.json()) as { reference?: unknown }
        if (typeof body.reference === "string") reference = body.reference
      }
    } catch {
      // Fall through to the local fallback below.
    }
    if (!reference) {
      // The server could not be reached. Rather than lose the whole
      // submission, fall back to a local name — and use `safeReference`,
      // the SAME function the server applies, so the two cannot disagree
      // the way they used to.
      reference = safeReference(
        `${new Date().toISOString().slice(0, 10)}-${head.project ?? "intake"}`
      )
    }

    let uploaded: {
      pathname: string
      access: "private" | "public"
      url?: string
      name: string
      category: string
      contentType: string
      size: number
    }[] = []
    // Counted, not swallowed. The old code set `uploaded = []` with a
    // comment claiming the visitor was told the photographs had not
    // gone — and nothing told them. They saw "Thank you" over an
    // enquiry that had lost every file it mentioned.
    let failed = 0
    /**
     * Why each file failed, in the words the SDK used.
     *
     * The count alone has now cost three rounds of guessing: a refused
     * upload looked identical whether the folder was wrong, the type was
     * wrong, the token was refused or the store said no. The reason
     * travels with the submission so the panel can say it, and so the
     * next failure is diagnosed instead of theorised about.
     */
    const failures: string[] = []
    try {
      // Photographs go from the browser STRAIGHT to Blob storage, not
      // through the route. A serverless function body is capped at
      // 4.5 MB on Vercel, which two phone photographs already exceed —
      // routing the files through it would fail on exactly the
      // submissions that matter most. The route only issues the token.
      const all = Object.entries(photos).flatMap(([key, list]) =>
        list.map((p) => ({ key, photo: p }))
      )
      for (const { key, photo } of all) {
        setStatus({
          en: `Uploading files… ${uploaded.length + failed + 1}/${all.length}`,
          nl: `Bestanden uploaden… ${uploaded.length + failed + 1}/${all.length}`,
        })
        const safe = photo.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-")
        const path = `intake/${reference}/${key}-${safe}`
        // Per file, not per batch. One refused upload used to abort the
        // loop and throw away everything already stored — so a single
        // oversized photograph cost the visitor all the others.
        try {
          // Private only. There used to be a public fallback here, but
          // the store is private (OPERATIONS.md) so it could never
          // succeed, and /privacy promises that intake files are never on
          // a public address. A refused file counts as failed below, and
          // the visitor is told to mail it instead.
          const blob = await upload(path, photo.file, {
            access: "private",
            handleUploadUrl: "/api/intake/photo",
            clientPayload: reference,
          })
          uploaded.push({
            pathname: blob.pathname,
            access: "private",
            url: undefined,
            name: photo.name,
            category: key,
            contentType: photo.file.type,
            size: photo.file.size,
          })
        } catch (error) {
          failed += 1
          const message =
            error instanceof Error ? error.message : String(error ?? "onbekend")
          // "Failed to retrieve the client token" is the SDK's sentence
          // for "the request for an upload token did not come back", and
          // it is the one this path actually produced. On its own it
          // reads like something about the file, so the studio spent
          // three rounds looking at file types and folder names.
          //
          // It is not about the file. It means the token endpoint
          // refused or could not answer — a studio-side setting, most
          // often a missing or unusable Blob store — and the real reason
          // is in the server log, which is where this points.
          const hint = /client token/i.test(message)
            ? " — de opslag gaf geen upload-token; dit ligt aan de instellingen van de studio, niet aan het bestand (de precieze reden staat in het serverlog)"
            : ""
          // Capped and de-duplicated: five identical messages say no more
          // than one, and this ends up in a stored record.
          const line = `${photo.name}: ${message}${hint}`.slice(0, 400)
          if (!failures.includes(line) && failures.length < 8) failures.push(line)
        }
      }
    } catch (error) {
      // The loop itself could not run at all.
      failed = Object.values(photos).reduce((n, l) => n + l.length, 0)
      uploaded = []
      failures.push(
        `alle bestanden: ${
          error instanceof Error ? error.message : String(error ?? "onbekend")
        }`.slice(0, 300)
      )
    }

    const body = transcript()
    const subject = `Intake — ${head.project?.trim() || reference}`

    /**
     * The doorbell, by email.
     *
     * Used two ways, and the difference matters. When the archive
     * succeeded but nothing is configured to announce it, this is a
     * notification and its failure costs nothing — the submission is
     * safe in the owner panel either way. When the archive FAILED, this
     * is the only copy of the visitor's evening, and its failure is the
     * one that has to reach a mailto draft.
     */
    async function ringByEmail(archived = true): Promise<boolean> {
      try {
        const res = await fetch("https://formsubmit.co/ajax/hello@gronn.studio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: subject,
            _template: "box",
            _captcha: "false",
            name: head.client || "—",
            // FormSubmit needs a deliverable address here — it is the
            // reply-to, and it REJECTS the whole submission when it is
            // not one. The head field is labelled "Phone / email", which
            // invites a phone number, and a phone number in this slot
            // failed every send and dropped the visitor into a mailto
            // draft. So the studio's own address goes here and the
            // visitor's contact, whatever shape it is, travels in the
            // body where it cannot break delivery.
            email: looksLikeEmail(head.contact) ? head.contact : "hello@gronn.studio",
            message: archived
              ? // The doorbell, and ONLY the doorbell.
                //
                // With no Slack webhook configured — today's setup — this
                // is the path every submission takes, and it used to ship
                // the first 12,000 characters of the sheet to FormSubmit:
                // the client's street, their phone number, and forty
                // answers about their home. A third party the privacy
                // page names as receiving "your name and contact".
                //
                // The archive already holds all of it. So this says that
                // something arrived and where to read it, and nothing
                // about the garden.
                `${t({ en: "A new intake has arrived.", nl: "Er is een nieuwe intake binnengekomen." })}\n\n` +
                `${t({ en: "Reference", nl: "Kenmerk" })}: ${reference}\n` +
                `${t({ en: "Files", nl: "Bestanden" })}: ${uploaded.length}${
                  failed ? ` (+${failed} ${t({ en: "failed", nl: "mislukt" })})` : ""
                }\n\n` +
                `${t({
                  en: "Read it in the owner panel under Intakes.",
                  nl: "Lees hem in het eigenaarspaneel onder Intakes.",
                })}`
              : // The archive refused it. Now this email IS the
                // submission, and withholding the answers would lose
                // them — so the sheet travels, and says why.
                `${t({
                  en: "THE ARCHIVE REFUSED THIS SUBMISSION — this email is the only copy.",
                  nl: "HET ARCHIEF WEIGERDE DEZE INZENDING — deze mail is de enige kopie.",
                })}\n\n` +
                `${t({ en: "Contact given", nl: "Opgegeven contact" })}: ${
                  head.contact?.trim() || "—"
                }\n\n` +
                body.slice(0, 12_000) +
                (body.length > 12_000
                  ? `\n\n… ${t({
                      en: "TRUNCATED — ask the sender for the rest.",
                      nl: "AFGEKAPT — vraag de afzender om de rest.",
                    })}`
                  : "") +
                (uploaded.length
                  ? `\n\n## ${t({ en: "Files", nl: "Bestanden" })}\n${uploaded.length} — ${t({
                      en: `uploaded, but no record points at them. In storage under: ${reference}`,
                      nl: `geüpload, maar geen dossier verwijst ernaar. In de opslag onder: ${reference}`,
                    })}`
                  : ""),
          }),
        })
        const r = (await res.json().catch(() => null)) as
          | { success?: string | boolean }
          | null
        return res.ok && (r?.success === true || r?.success === "true")
      } catch {
        return false
      }
    }

    try {
      // Two endpoints, one payload. The studio's writes to the same
      // archive under the same shape — /dashboard/intakes cannot tell
      // them apart, which is the point — but skips the notification half
      // entirely. With no Slack webhook configured, the visitor path
      // rings a FormSubmit doorbell; sending the owner an e-mail to
      // announce an intake they have just finished typing is noise, and
      // its archive-failed branch would put a client's address and every
      // answer through a third party the owner never chose.
      const res = await fetch(studio ? "/api/admin/intake" : "/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          name: head.client ?? "",
          contact: head.contact ?? "",
          project: head.project ?? "",
          transcript: body,
          files: uploaded,
          filesFailed: failed,
          filesFailedReasons: failures,
        }),
      })
      const result = (await res.json().catch(() => null)) as
        | { ok?: boolean; relay?: string }
        | null

      if (res.ok && result?.ok) {
        setDelivery("archive")
        clearDraft()
        // Archived. The submission is in the owner panel whatever
        // happens next, so the visitor is told it arrived — because it
        // did. `relay: "none"` only means nothing has rung a bell yet,
        // which is the studio's problem and not the visitor's, so the
        // email goes without them waiting on it.
        setLost(failed)
        setSent(true)
        setStatus(null)
        if (!studio && result.relay === "none") void ringByEmail()
        return
      }
      throw new Error("not_archived")
    } catch {
      // The studio gets neither fallback. A mailto would hijack the
      // panel into a mail client, and relaying a client's whole sheet
      // through FormSubmit to cover a failed write is a privacy decision
      // nobody made. The draft is still in localStorage, so the typing
      // is not gone — say so plainly and let them press send again.
      if (studio) {
        setStatus({
          en: "The archive refused this. Nothing was saved — your answers are still here, try again in a moment.",
          nl: "Het archief nam dit niet aan. Er is niets opgeslagen — je antwoorden staan er nog, probeer het zo opnieuw.",
        })
        return
      }
      // The archive did not take it. Now the words are at risk and the
      // email is not a courtesy — it is the copy.
      if (await ringByEmail(false)) {
        setDelivery("email")
        clearDraft()
        setLost(failed)
        setSent(true)
        setStatus(null)
      } else {
        // Nothing delivered it. Open a draft so the answers are not
        // lost — the same last resort the short form has.
        // `assign` rather than writing `location.href`: the same
        // navigation, but a method call instead of a mutation of a value
        // defined outside the component, which the hooks lint rightly
        // refuses.
        window.location.assign(
          `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
            subject
          )}&body=${encodeURIComponent(body.slice(0, 1800))}`
        )
        setStatus({
          en: "An email draft has been opened. The full text is on your clipboard if you use Copy.",
          nl: "Er is een conceptmail geopend. De volledige tekst staat op je klembord als je Kopieer gebruikt.",
        })
      }
    } finally {
      setSending(false)
    }
  }

  /**
   * Forget the draft once it has actually been delivered.
   *
   * It held the visitor's name, street, phone and every answer, and it
   * survived a successful send indefinitely — which on a shared or
   * library machine hands the next person the lot. Nothing needs it
   * after the submission has landed.
   */
  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey(mode))
    } catch {
      // Nothing was stored to begin with.
    }
  }

  async function handleCopy() {
    const text = transcript()
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ en: "Copied.", nl: "Gekopieerd." })
    } catch {
      setStatus({
        en: "Copying was refused — use Print instead.",
        nl: "Kopiëren werd geweigerd — gebruik Print.",
      })
    }
  }

  function handleClear() {
    for (const list of Object.values(photos)) {
      for (const p of list) URL.revokeObjectURL(p.url)
    }
    setHead({})
    setAnswers({})
    setPicks({})
    setSliders({})
    setPhotos({})
    try {
      window.localStorage.removeItem(draftKey(mode))
    } catch {
      // Nothing was stored to begin with.
    }
    setSavedAt(null)
    setStatus({ en: "Form emptied.", nl: "Formulier geleegd." })
  }

  useEffect(() => {
    if (!status) return
    // Never while sending. The upload sets this line once per file, and
    // a 40-second video meant it cleared four seconds in and the
    // paragraph below fell through to "je mag de pagina sluiten en
    // terugkomen" — said in an aria-live region, over an upload still
    // running, to someone on a phone who then switched apps.
    if (sending) return
    const id = window.setTimeout(() => setStatus(null), 4000)
    return () => window.clearTimeout(id)
  }, [status, sending])

  /* ── done ──────────────────────────────────────────────────────── */

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-10 text-center">
          <p className="font-heading text-3xl font-semibold text-accent">
            {t({ en: "Received. Thank you.", nl: "Binnen. Dank je." })}
          </p>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-foreground/75">
            {t({
              en: "We read it before the first visit, so the conversation starts where this form leaves off rather than at the beginning.",
              nl: "We lezen het vóór het eerste bezoek, zodat het gesprek begint waar dit formulier ophoudt en niet bij het begin.",
            })}
          </p>
          {/* It arrived, but not the usual way, and the difference is the
              visitor's to know. The archive refused it and the mail relay
              is the only copy — so if nothing comes back, they should
              chase it rather than assume it is being read. */}
          {delivery === "email" && (
            <p className="mx-auto mt-4 max-w-lg rounded-lg border border-gronn-ember px-4 py-3 text-sm leading-relaxed text-[color:var(--ember-text)]">
              {t({
                en: "It reached us by email rather than through our own system, which was briefly unavailable. Keep this page's answers until we reply — if you have heard nothing in two working days, send us a line.",
                nl: "Het bereikte ons per e-mail in plaats van via ons eigen systeem, dat even onbereikbaar was. Bewaar je antwoorden tot je van ons hoort — hoor je binnen twee werkdagen niets, stuur ons dan een berichtje.",
              })}
            </p>
          )}
          {/* Never a thank-you over a silent loss. If the files did not
              make it, the visitor is the only one who still has them,
              and they have to be told while they are still on the page
              rather than discover it never. */}
          {lost > 0 && (
            <p className="mx-auto mt-5 max-w-lg rounded-lg border border-gronn-ember bg-gronn-ember/5 p-4 text-sm leading-relaxed text-[color:var(--ember-text)]">
              {t({
                en: `Your answers arrived, but ${lost} file${lost === 1 ? "" : "s"} did not — the upload was refused. Please email them to ${BUSINESS.email}, with the project name in the subject.`,
                nl: `Je antwoorden zijn binnen, maar ${lost} bestand${lost === 1 ? "" : "en"} niet — de upload werd geweigerd. Stuur ze alsjeblieft per mail naar ${BUSINESS.email}, met de projectnaam in het onderwerp.`,
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  /* ── the sheet ─────────────────────────────────────────────────── */

  // A note on width. The sheet is max-w-5xl and centred, which does NOT
  // line up with the page heading above it (PageHero is max-w-7xl). That
  // is deliberate and it is not a preference: the floating contact rail
  // is fixed at the left edge below about 1472px, and a full-width sheet
  // puts the material samples underneath it. Alignment with the heading
  // is worth less than a picker you can actually click. Revisit when the
  // rail is fixed; the rail itself belongs to the UI/UX round, not here.
  return (
    <div className="pb-32">
      {/* Honeypot — off-screen, never focusable, filled only by bots.
          The name is deliberately meaningless: called "company" it was a
          field password managers and browser autofill recognise and fill
          on their own, and a tripped honeypot discards the submission
          behind a thank-you the visitor believes. A bot fills anything;
          autofill only fills what it recognises. */}
      <input
        type="text"
        name="hp-ref-2"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      {/* ── the head of the sheet ──────────────────────────────── */}
      <section id="intake-head" className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div
          data-intake-print="head"
          className="grid gap-x-8 gap-y-5 border-t border-line/20 pt-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INTAKE_HEAD.map((f) => (
            <label key={f.id} className="block">
              <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.13em] text-muted">
                {t(f.label)}
              </span>
              <input
                value={head[f.id] ?? ""}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                onChange={(e) =>
                  setHead((h) => ({ ...h, [f.id]: e.target.value }))
                }
                // 16px on a phone, 13px from `sm:` up — and that is a
                // functional number, not a taste. iOS Safari zooms the
                // whole page in when a field under 16px takes focus, and
                // it does not zoom back out on blur. Six of these are the
                // first thing a visitor touches, so the form used to
                // begin by throwing the reader's layout away.
                //
                // The other way to stop it is `maximum-scale=1` in the
                // viewport, and we are NOT doing that: it takes pinch
                // zoom away from everybody, permanently, to fix a
                // typographic choice.
                className="w-full border-0 border-b border-line/30 bg-transparent px-0 py-2.5 font-mono text-[16px] text-foreground focus:border-gronn-ember focus:outline-none sm:py-1.5 sm:text-[13px]"
              />
            </label>
          ))}
        </div>
      </section>

      {/* ── the one question ───────────────────────────────────── */}
      {/* `bg-gronn-green`, not `bg-accent`, and that is a repair.
          `--accent` is a PALE MINT on the five dark palettes — it is the
          colour that reads as emphasis ON a dark ground, which is the
          opposite of a ground that can carry white text. White on it
          measures 1.15:1 in Night, Forest, Nocturne, Blue Hour and
          Moonlight, and Blue Hour is half the Auto default: every
          visitor arriving after 19:00 local got this band, and the one
          question it asks, as white on near-white.
          Brand green is 4.87:1 under white and is one of only two fills
          `check-contrast` guarantees for it. */}
      <section
        data-intake-print="hero"
        className="mt-16 bg-gronn-green py-14 text-gronn-white sm:mt-20"
      >
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          {/* White, not ember. Ember on this ground is 1.63:1, and it
              was already failing at 2.46:1 on the old one — a failure
              that predates the fill and was never visible in Lighthouse,
              which only measures the resting state of pages it reaches.
              The mono treatment and the tracking carry the distinction
              that the colour was doing; per the brand rules ember
              answers interaction, and a kicker is a label. */}
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gronn-white">
            {t(INTAKE_HERO.kicker)}
          </p>
          <h2 className="mt-4 max-w-[20ch] font-heading text-[clamp(1.7rem,4.3vw,2.6rem)] font-semibold leading-[1.08] tracking-tight">
            {t(INTAKE_HERO.title)}
          </h2>
          {/* Full white: at 80% this is 3.72:1 on brand green, under the
              4.5 floor for body text. Hierarchy here comes from size,
              not from fading the one paragraph that explains what the
              form is for. */}
          <p className="mt-3.5 max-w-[58ch] leading-relaxed text-gronn-white">
            {t(INTAKE_HERO.intro)}
          </p>
          <div className="mt-6">
            <Answer
              tone="dark"
              value={answers.hero ?? ""}
              onChange={(v) => setAnswer("hero", v)}
              placeholder={t(INTAKE_HERO.placeholder)}
            />
          </div>
        </div>
      </section>

      {/* ── the eight sections ─────────────────────────────────── */}
      {INTAKE_SECTIONS.map((section) => (
        <Section
          key={section.id}
          section={section}
          answers={answers}
          picks={picks}
          sliders={sliders}
          photos={photos}
          setAnswer={setAnswer}
          togglePick={togglePick}
          setSlider={(id, v) => setSliders((s) => ({ ...s, [id]: v }))}
          addPhotos={addPhotos}
          removePhoto={removePhoto}
        />
      ))}

      {/* ── what you can do with it ────────────────────────────── */}
      <section className="mx-auto mt-16 w-full max-w-5xl px-4 sm:px-6">
        <div
          data-print="hide"
          // Stacked and full width on a phone, a row from `sm:` up.
          // Wrapped, these four made a ragged two-two block whose second
          // line began under the middle of the first — and "Empty the
          // form" ended up beside "Send", which is the one adjacency
          // this set should not have.
          className="flex flex-col items-stretch gap-3 border-t border-line/20 pt-8 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="rounded-full bg-gronn-green px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-gronn-white transition-colors enabled:hover:bg-gronn-ember-strong enabled:active:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70"
          >
            {sending
              ? t({ en: "Sending…", nl: "Versturen…" })
              : t({ en: "Send to the studio", nl: "Verstuur naar de studio" })}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-accent px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-accent transition-colors hover:bg-gronn-green hover:text-gronn-white active:bg-gronn-green active:text-gronn-white"
          >
            {t({ en: "Copy answers", nl: "Kopieer antwoorden" })}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-line/30 px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-accent active:border-accent active:text-accent"
          >
            {t({ en: "Print or save as PDF", nl: "Print of sla op als pdf" })}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full px-4 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-[color:var(--ember-text)] active:text-[color:var(--ember-text)]"
          >
            {t({ en: "Empty the form", nl: "Leeg het formulier" })}
          </button>
        </div>

        {/* AVG art. 13: zeg bij het verzamelen waar het heen gaat, zoals het
            contactformulier en de maillijst al doen. */}
        <p data-print="hide" data-intake-privacy="" className="mt-4 text-[13px] leading-relaxed text-muted">
          {t({
            nl: "Je antwoorden en bestanden worden bewaard in besloten opslag die alleen de studio kan lezen; een melding met je naam en e-mailadres gaat via FormSubmit naar de mailbox.",
            en: "Your answers and files are kept in closed storage that only the studio can read; a notice with your name and email reaches the inbox via FormSubmit.",
          })}{" "}
          <a href={localePath(locale, "/privacy")} className="inline-flex min-h-[24px] items-center underline underline-offset-4">
            {t({ nl: "Privacy", en: "Privacy" })}
          </a>
        </p>

        {/* The state is on the element, not only in the sentence: the
            sentence is translated and both versions of it legitimately
            mention this device, so prose is the wrong thing to assert
            against. */}
        <p
          data-print="hide"
          data-draft={savedAt ? "kept" : "none"}
          aria-live="polite"
          className="mt-5 font-mono text-[11.5px] leading-relaxed text-muted"
        >
          {status ? (
            <span className="text-[color:var(--ember-text)]">{t(status)}</span>
          ) : savedAt ? (
            t({
              en: "Kept on this device — you can close the page and come back. Photographs are not kept; add those in the sitting you send from.",
              nl: "Bewaard op dit apparaat — je mag de pagina sluiten en terugkomen. Foto's worden niet bewaard; voeg die toe in de sessie waarin je verstuurt.",
            })
          ) : (
            t({
              en: "Nothing leaves this page until you press Send.",
              nl: "Er gaat niets van deze pagina af tot je op Verstuur drukt.",
            })
          )}
        </p>
      </section>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */

function Section({
  section,
  answers,
  picks,
  sliders,
  photos,
  setAnswer,
  togglePick,
  setSlider,
  addPhotos,
  removePhoto,
}: {
  section: IntakeSection
  answers: Record<string, string>
  picks: Record<string, string[]>
  sliders: Record<string, number>
  photos: Record<string, Photo[]>
  setAnswer: (id: string, v: string) => void
  togglePick: (group: string, option: string, single?: boolean) => void
  setSlider: (id: string, v: number) => void
  addPhotos: (
    key: string,
    files: FileList | null,
    accepts?: "images" | "documents"
  ) => void
  removePhoto: (key: string, id: string) => void
}) {
  const t = useT()
  const body = (
    <div className="mt-8">
      {section.blocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          answers={answers}
          picks={picks}
          sliders={sliders}
          photos={photos}
          setAnswer={setAnswer}
          togglePick={togglePick}
          setSlider={setSlider}
          addPhotos={addPhotos}
          removePhoto={removePhoto}
        />
      ))}
    </div>
  )

  return (
    // The survey section is PRINT ONLY. It is addressed to the studio —
    // twelve questions about trial pits, root zones and utility searches
    // — and the client filling this in has no business reading them.
    //
    // It was a fold first, which was the wrong answer: folding hides the
    // questions but leaves a heading, an explanation of who it is for,
    // and a button, all of which the client still has to scroll past and
    // wonder about. "Why am I seeing this?" is the correct reaction to
    // that, and the honest fix is that they are not.
    //
    // It stays in the document rather than moving to a separate page
    // because the printed sheet is the point: one piece of paper that
    // carries the client's answers and the survey taken beside them.
    <section
      id={`intake-${section.id}`}
      data-intake-section={section.id}
      className={cn(
        "mx-auto mt-16 w-full max-w-5xl px-4 sm:mt-20 sm:px-6",
        section.forStudio && "hidden print:block"
      )}
    >
      <div className="border-t-2 border-accent pt-4">
        <span className="block font-mono text-[11.5px] uppercase tracking-[0.17em] text-[color:var(--ember-text)]">
          {section.num} — {t(section.kicker)}
        </span>
        <h2 className="mt-2.5 max-w-[26ch] font-heading text-[clamp(1.45rem,3.3vw,2.05rem)] font-semibold leading-tight tracking-tight text-accent">
          {t(section.title)}
        </h2>
        {section.intro && (
          <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-muted">
            {t(section.intro)}
          </p>
        )}
      </div>

      {body}
    </section>
  )
}

function Block({
  block,
  answers,
  picks,
  sliders,
  photos,
  setAnswer,
  togglePick,
  setSlider,
  addPhotos,
  removePhoto,
}: {
  block: IntakeBlock
  answers: Record<string, string>
  picks: Record<string, string[]>
  sliders: Record<string, number>
  photos: Record<string, Photo[]>
  setAnswer: (id: string, v: string) => void
  togglePick: (group: string, option: string, single?: boolean) => void
  setSlider: (id: string, v: number) => void
  addPhotos: (
    key: string,
    files: FileList | null,
    accepts?: "images" | "documents"
  ) => void
  removePhoto: (key: string, id: string) => void
}) {
  const t = useT()

  const heading =
    block.kind === "sliders" ? null : (
      <>
        {"title" in block && block.title && (
          <h3 className="font-heading text-[1.08rem] font-semibold text-accent">
            {t(block.title)}
          </h3>
        )}
        {"hint" in block && block.hint && (
          <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-muted">
            {t(block.hint)}
          </p>
        )}
      </>
    )

  return (
    <div className="border-t border-line/15 py-6 last:border-b last:border-line/15">
      {heading}
      {"flag" in block && block.flag && (
        <p className="my-4 max-w-[60ch] border-l-2 border-gronn-ember py-0.5 pl-4 text-[14.5px] leading-relaxed text-foreground/80">
          {t(block.flag)}
        </p>
      )}

      {block.kind === "picker" && (
        <div
          className={cn(
            "mt-4 grid gap-3",
            // Word chips are narrower than samples and should not be
            // stretched to a sample's width: a five-band budget row laid
            // out on a 132px minimum leaves four of them alone on a line.
            hasSwatches(block.id)
              ? "grid-cols-[repeat(auto-fill,minmax(132px,1fr))]"
              : "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
          )}
          {...(block.single
            ? { role: "radiogroup", "aria-label": t(block.title) }
            : {})}
        >
          {block.options.map((o) => (
            <Chip
              key={o.id}
              group={block.id}
              option={o.id}
              label={t(o.label)}
              note={o.note ? t(o.note) : undefined}
              plain={!hasSwatches(block.id)}
              single={block.single}
              on={(picks[block.id] ?? []).includes(o.id)}
              onToggle={() => togglePick(block.id, o.id, block.single)}
            />
          ))}
        </div>
      )}

      {block.kind === "photos" && (
        <div className="mt-4">
          <PhotoTray
            photos={photos[block.id] ?? []}
            onAdd={(files) => addPhotos(block.id, files, block.accepts)}
            onRemove={(id) => removePhoto(block.id, id)}
            cta={t(block.cta)}
            sub={t(block.sub)}
            accepts={block.accepts}
          />
        </div>
      )}

      {block.kind === "sliders" && (
        <div className="max-w-2xl">
          {block.sliders.map((s) => {
            const value = sliders[s.id] ?? INTAKE_SLIDER_DEFAULT
            return (
              <div key={s.id} className="mb-7 last:mb-4">
                <label
                  htmlFor={`slider-${s.id}`}
                  className="block text-[15px] text-foreground/85"
                >
                  {t(s.label)}
                  <span className="ml-2 font-mono text-xs tabular-nums text-accent">
                    {value}
                  </span>
                </label>
                <input
                  id={`slider-${s.id}`}
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={value}
                  onChange={(e) => setSlider(s.id, Number(e.target.value))}
                  // `intake-range` rather than `tap-target`: the pseudo
                  // element that utility draws does not extend a range
                  // input's DRAG surface, so a 44px box over a 17px
                  // track makes the control look reachable and behave
                  // exactly as before. The height has to be real, and
                  // the thumb with it — see globals.css.
                  className="intake-range mt-3 w-full accent-[var(--gronn-ember)]"
                />
                <div className="mt-1.5 flex justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
                  <span>{t(s.low)}</span>
                  <span className="text-right">{t(s.high)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* A picker has no questions of its own; every other block may.
          Narrowing on `kind` rather than testing for the property keeps
          the union honest — adding a fifth block type will fail here
          rather than silently render nothing. */}
      {block.kind !== "picker" && (block.items ?? []).length > 0 && (
        <ul
          className={cn(
            // Capped: the sections are as wide as the page heading, but a
            // line of prose 1200px long is not one anybody re-reads.
            "max-w-3xl list-none p-0",
            block.kind !== "questions" && "mt-4"
          )}
        >
          {(block.items ?? []).map((item) => (
            <Question
              key={item.id}
              item={item}
              value={answers[item.id] ?? ""}
              onChange={(v) => setAnswer(item.id, v)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
