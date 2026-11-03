"use client"

import { useEffect, useState } from "react"

import type { L } from "@/lib/i18n"

import { EDITOR_HINT_KEY, useEditor } from "./editor-context"
import { getAtPath } from "./paths"

// Editing chrome: the floating toolbar (publish / export / sign out) and
// the EN+NL popover for the active text field. Rendered only in edit
// mode — visitors never load any of this into view.
export function EditorToolbar() {
  const editor = useEditor()
  const [status, setStatus] = useState<"idle" | "published" | "error">("idle")

  useEffect(() => {
    if (status === "idle") return
    const timer = setTimeout(() => setStatus("idle"), 3500)
    return () => clearTimeout(timer)
  }, [status])

  if (!editor?.editing) return null

  const active = editor.activePath
  const activeValue = active
    ? ((getAtPath(editor.draft, active) as L | undefined) ?? { en: "", nl: "" })
    : null

  return (
    <>
      {/* Toolbar */}
      <div className="fixed bottom-4 right-4 z-[62] flex items-center gap-2 rounded-full border border-line/20 bg-surface/95 py-2 pl-4 pr-2 shadow-lg backdrop-blur">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {status === "published"
            ? "Published ✓ / Gepubliceerd ✓"
            : status === "error"
              ? "Publish failed / Mislukt"
              : `Editing / Bewerken · ${editor.dirty.size}`}
        </span>
        <button
          type="button"
          disabled={editor.publishing || editor.dirty.size === 0}
          onClick={async () => setStatus(await editor.publish())}
          className="rounded-full bg-gronn-ember-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-gronn-white transition-opacity disabled:opacity-40"
        >
          {editor.publishing ? "Publishing…" : "Publish / Publiceer"}
        </button>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([JSON.stringify(editor.draft, null, 2)], {
              type: "application/json",
            })
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = "site-content-backup.json"
            a.click()
            URL.revokeObjectURL(a.href)
          }}
          title="Download backup (JSON)"
          className="rounded-full border border-line/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition-colors hover:border-gronn-ember hover:text-foreground"
        >
          Backup
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(EDITOR_HINT_KEY)
            window.location.href = "/api/auth/signout"
          }}
          className="rounded-full border border-line/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition-colors hover:border-gronn-ember hover:text-foreground"
        >
          Exit
        </button>
      </div>

      {/* EN/NL popover for the active field */}
      {active && activeValue && (
        <div
          className="fixed inset-0 z-[75] flex items-end justify-center bg-gronn-black/40 p-4 sm:items-center"
          onClick={() => editor.setActivePath(null)}
        >
          <div
            role="dialog"
            aria-label="Edit text"
            className="w-full max-w-lg rounded-lg border border-line/15 bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {active}
            </p>
            {(["en", "nl"] as const).map((lang) => (
              <label key={lang} className="mt-4 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gronn-green">
                  {lang === "en" ? "English" : "Nederlands"}
                </span>
                <textarea
                  rows={3}
                  value={activeValue[lang]}
                  onChange={(e) =>
                    editor.updateAt(active, {
                      ...activeValue,
                      [lang]: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-md border border-line/20 bg-background p-3 text-sm leading-relaxed text-foreground outline-none focus:border-gronn-ember"
                />
              </label>
            ))}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => editor.setActivePath(null)}
                className="rounded-full bg-gronn-green px-5 py-2.5 text-sm text-gronn-white transition-colors hover:bg-gronn-green/90"
              >
                Done / Klaar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
