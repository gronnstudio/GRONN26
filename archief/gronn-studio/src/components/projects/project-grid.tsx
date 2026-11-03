"use client"

import { useState } from "react"

import { ProjectCard } from "@/components/project-card"
import { useT } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
} from "@/lib/data/projects"

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const t = useT()
  const [filter, setFilter] = useState<ProjectCategory | null>(null)
  const visible = filter
    ? projects.filter((p) => p.category === filter)
    : projects

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t({ en: "Filter projects", nl: "Filter projecten" })}
      >
        <button
          type="button"
          onClick={() => setFilter(null)}
          aria-pressed={filter === null}
          className={cn(
            "tap-target rounded-full border px-4 py-2 text-sm transition-colors",
            filter === null
              ? "border-gronn-green bg-gronn-green text-gronn-white"
              : "border-line/20 text-muted hover:border-gronn-green/60 hover:text-foreground"
          )}
        >
          {t({ en: "All", nl: "Alles" })}
        </button>
        {PROJECT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(filter === cat ? null : cat)}
            aria-pressed={filter === cat}
            className={cn(
              "tap-target rounded-full border px-4 py-2 text-sm transition-colors",
              filter === cat
                ? "border-gronn-green bg-gronn-green text-gronn-white"
                : "border-line/20 text-muted hover:border-gronn-green/60 hover:text-foreground"
            )}
          >
            {t(CATEGORY_LABELS[cat])}
          </button>
        ))}
      </div>

      {/* Filtering is visually obvious but silent to screen readers —
          announce the result count */}
      <p aria-live="polite" className="sr-only">
        {visible.length}{" "}
        {t({
          en: visible.length === 1 ? "project shown" : "projects shown",
          nl: visible.length === 1 ? "project getoond" : "projecten getoond",
        })}
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Strict grid, no drift: a filterable index reads as a tool, and
            per-card parallax here looked like misalignment, not intent. */}
        {visible.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            // The first row is the LCP on this page — measured 11.4s
            // before the image pipeline landed (docs/perf).
            priority={i < 2}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-12 text-muted">
          {t({
            en: "No projects in this category yet.",
            nl: "Nog geen projecten in deze categorie.",
          })}
        </p>
      )}
    </div>
  )
}
