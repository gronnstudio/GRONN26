"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import type { SiteContent } from "@/lib/content-types"
import type { L } from "@/lib/i18n"
import { getAtPath, setAtPath } from "./paths"

// The editor's brain. For visitors this provider is inert: no session
// request, no draft, no UI — Editables render their children untouched.
// Edit mode arms only when the sign-in hint (set by /editor after a
// successful Google sign-in) is present AND the server confirms the
// session; the draft content document is then fetched once and every
// edit updates it locally until Publish ships it to Vercel Blob.
export const EDITOR_HINT_KEY = "gronn-editor-hint"

type EditorState = {
  editing: boolean
  dirty: Set<string>
  draft: SiteContent | null
  activePath: string | null
  setActivePath: (path: string | null) => void
  valueAt: (path: string) => unknown
  updateAt: (path: string, value: unknown) => void
  publish: () => Promise<"published" | "error">
  publishing: boolean
}

const EditorContext = createContext<EditorState | null>(null)

export function useEditor() {
  return useContext(EditorContext)
}

/** Draft-aware bilingual value: draft wins over the server-rendered prop. */
export function useEditableL(path: string, fallback: L): L {
  const editor = useEditor()
  if (!editor?.editing || !editor.draft) return fallback
  const value = getAtPath(editor.draft, path)
  return (value as L) ?? fallback
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [activePath, setActivePath] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    // Visitors bail here — zero network cost without the hint.
    if (localStorage.getItem(EDITOR_HINT_KEY) !== "1") return
    let cancelled = false
    fetch("/api/editor/content")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((content: SiteContent) => {
        if (!cancelled) setDraft(content)
      })
      .catch(() => {
        // Session expired or revoked — drop the hint so future visits
        // stay silent until the owner signs in again.
        localStorage.removeItem(EDITOR_HINT_KEY)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const valueAt = useCallback(
    (path: string) => (draft ? getAtPath(draft, path) : undefined),
    [draft]
  )

  const updateAt = useCallback((path: string, value: unknown) => {
    setDraft((prev) => (prev ? setAtPath(prev, path, value) : prev))
    setDirty((prev) => new Set(prev).add(path))
  }, [])

  const publish = useCallback(async () => {
    if (!draft) return "error" as const
    setPublishing(true)
    try {
      const res = await fetch("/api/editor/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      })
      if (!res.ok) return "error" as const
      setDirty(new Set())
      // Pull the freshly-published document through the server tree so
      // every list page and menu preview reflects the edit immediately.
      router.refresh()
      return "published" as const
    } catch {
      return "error" as const
    } finally {
      setPublishing(false)
    }
  }, [draft, router])

  const value = useMemo<EditorState>(
    () => ({
      editing: draft !== null,
      dirty,
      draft,
      activePath,
      setActivePath,
      valueAt,
      updateAt,
      publish,
      publishing,
    }),
    [draft, dirty, activePath, valueAt, updateAt, publish, publishing]
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
