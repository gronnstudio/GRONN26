"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { useEditor } from "./editor-context"

// Editable photograph. Outside edit mode: a plain <img> (same markup the
// site always rendered — the `photo-glass` screen etc. stay in the parent).
// In edit mode: click opens a file picker; the file uploads to Vercel
// Blob and the draft's image URL for `path` updates immediately.
export function EditableImage({
  path,
  src,
  alt,
  className,
  renderImage,
}: {
  path: string
  src: string
  alt: string
  className?: string
  /**
   * How to render the photograph when not editing — lets the host site
   * pass an optimizing component (next/image via <Photo/>) while the
   * editor keeps a plain <img> for freshly-uploaded drafts, which have
   * no optimized variants yet.
   */
  renderImage?: (props: {
    src: string
    alt: string
    className?: string
  }) => React.ReactNode
}) {
  const editor = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const draftSrc = editor?.editing
    ? ((editor.valueAt(path) as string | undefined) ?? src)
    : src

  const plainImg = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={draftSrc}
      alt={alt}
      loading="lazy"
      draggable={false}
      className={className}
    />
  )
  const img =
    !editor?.editing && renderImage
      ? renderImage({ src: draftSrc, alt, className })
      : plainImg

  if (!editor?.editing) return <>{img}</>

  return (
    <span className="relative block h-full w-full">
      {plainImg}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          inputRef.current?.click()
        }}
        className={cn(
          "absolute inset-0 z-10 flex items-end justify-start bg-transparent p-3 outline-1 outline-dashed -outline-offset-2 outline-gronn-ember/60 transition-colors hover:bg-gronn-ember/10",
          uploading && "pointer-events-none"
        )}
      >
        <span className="rounded-full bg-gronn-ember-strong px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gronn-white">
          {uploading ? "Uploading…" : "Replace photo / Vervang foto"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file || !editor) return
          setUploading(true)
          try {
            const res = await fetch(
              `/api/editor/upload?filename=${encodeURIComponent(file.name)}`,
              { method: "POST", body: file }
            )
            if (res.ok) {
              const { url } = (await res.json()) as { url: string }
              editor.updateAt(path, url)
            }
          } finally {
            setUploading(false)
            e.target.value = ""
          }
        }}
      />
    </span>
  )
}
