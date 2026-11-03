import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { PanelGate } from "@/app/dashboard/owner-gate"
import { euroFull } from "@/lib/os/data"
import { ProgressLine } from "../ui"
import { canOpenOs } from "../access"
import { Problems } from "../problems"
import { readOsView } from "../read-view"
import { osLocale } from "../locale"

export const metadata: Metadata = { title: "Projects" }

// /os/projects — every project as one row: photo, stage, progress,
// value, hours. A row with a control view opens it; the others say
// plainly that theirs arrives with real data.

export default async function ProjectsPage() {
  if (!(await canOpenOs())) return <PanelGate />
  const { locale, t, s: say } = await osLocale()
  const view = await readOsView(locale)
  const PROJECTS = view.projects
  return (
    <div className="pt-[40px]">
      <div className="flex items-end justify-between gap-[16px]">
        <div>
          <p className="os-label">{say("Projects")}</p>
          <h1 className="mt-[8px] font-heading text-[32px] leading-[36px] text-os-text">{t("All projects", "Alle projecten")}</h1>
        </div>
        <p className="font-mono text-[11px] text-os-text-3">{PROJECTS.length} {t("projects", "projecten")}</p>
      </div>
      <div className="os-rule mt-[20px]" aria-hidden />
      <div className="mt-[20px]">
        <Problems problems={view.problems} locale={locale} />
      </div>

      <ul className="divide-y divide-os-line">
        {PROJECTS.map((p) => {
          const row = (
            <div className="grid items-center gap-[20px] py-[18px] md:grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_80px_24px]">
              <div className="relative aspect-[4/3] w-[120px] overflow-hidden rounded-[10px] bg-os-raised">
                {p.cover ? (
                  <>
                    <Image src={p.cover.src} alt="" fill sizes="120px" className="object-cover" />
                    <span aria-hidden className="photo-glass absolute inset-0" />
                  </>
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-mono text-[9px] uppercase tracking-[0.12em] text-os-text-3">
                    {t("No photos", "Geen foto's")}
                  </span>
                )}
              </div>
              <div>
                <p className="flex items-center gap-[8px] font-heading text-[18px] text-os-text">
                  {p.name}
                </p>
                <p className="text-[13px] text-os-text-2">{say(p.kind)}</p>
              </div>
              <div>
                <p className="flex items-baseline gap-[8px] text-[13px]">
                  <span className="text-os-text">{say(p.stage)}</span>
                  <span className="text-os-text-3">· {say(p.status)}</span>
                </p>
                {p.progress !== null && (
                  <div className="mt-[8px] flex items-center gap-[10px]">
                    <ProgressLine value={p.progress} />
                    <span className="font-mono text-[11px] text-os-text-3">{p.progress}%</span>
                  </div>
                )}
              </div>
              <p className="font-mono text-[12px] text-os-text-2 md:text-right">{p.value !== null ? euroFull(p.value) : "—"}</p>
              <p className="font-mono text-[12px] text-os-text-2 md:text-right">{p.hours !== null ? `${p.hours}h` : "—"}</p>
              <span className="hidden text-os-text-3 group-hover:text-os-green md:block">
                {p.hasControlView && <ArrowUpRightIcon size={16} aria-hidden />}
              </span>
            </div>
          )
          return (
            <li key={p.slug}>
              {p.hasControlView ? (
                <Link href={`/os/projects/${p.slug}`} className="group block rounded-[12px] transition-colors hover:bg-os-surface">
                  {row}
                </Link>
              ) : (
                <div className="group" title={t("A control view needs this project's photos and tasks", "Een controleweergave vraagt om foto's en taken van dit project")}>
                  {row}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-[20px] text-[12px] text-os-text-3">
        {view.mode === "preview"
          ? t(
              "Vijverklant and Geulle come from the public site. The projects in the database appear on gronn.studio/os once you are signed in.",
              "Vijverklant en Geulle komen van de site. De projecten uit de database verschijnen op gronn.studio/os zodra je bent ingelogd."
            )
          : t(
              "Vijverklant and Geulle come from the public site. Every other row is a project in the database past the quote stage; leads live in the pipeline.",
              "Vijverklant en Geulle komen van de site. Elke andere regel is een project in de database voorbij de offertefase; leads staan in de pijplijn."
            )}
      </p>
    </div>
  )
}
