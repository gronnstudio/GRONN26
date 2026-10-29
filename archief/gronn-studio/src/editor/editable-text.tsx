"use client"

import { useT } from "@/components/language-provider"
import type { L } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { useEditableL, useEditor } from "./editor-context"

// Editable bilingual text. Outside edit mode this renders exactly what
// the page passed in — no wrapper cost beyond a fragment. In edit mode
// the current draft value renders instead, the text becomes clickable,
// and clicking opens the EN/NL popover (toolbar.tsx renders it).
export function EditableText({
  path,
  value,
  className,
  render,
}: {
  path: string
  value: L
  className?: string
  /** Custom renderer for the resolved string (e.g. line splitting). */
  render?: (text: string) => React.ReactNode
}) {
  const t = useT()
  const editor = useEditor()
  const current = useEditableL(path, value)
  const text = t(current)

  if (!editor?.editing) {
    return <>{render ? render(text) : text}</>
  }

  return (
    <span
      role="button"
      tabIndex={0}
      data-editor-field
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        editor.setActivePath(path)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          editor.setActivePath(path)
        }
      }}
      className={cn(
        "cursor-pointer rounded-sm outline-1 outline-dashed outline-offset-4 outline-gronn-ember/50 transition-[outline-color] hover:outline-gronn-ember",
        editor.dirty.has(path) && "outline-gronn-ember",
        className
      )}
    >
      {render ? render(text) : text}
    </span>
  )
}
