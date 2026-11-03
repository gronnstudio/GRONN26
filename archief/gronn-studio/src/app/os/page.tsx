import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { PanelGate } from "@/app/dashboard/owner-gate"
import { PIPELINE_STAGES, STALE_AFTER_DAYS, euroShort } from "@/lib/os/data"
import { cn } from "@/lib/utils"
import { GronnCore } from "./core"
import { Greeting } from "./greeting"
import { ProgressLine, Zone } from "./ui"
import { canOpenOs } from "./access"
import { readOsView } from "./read-view"
import { osLocale } from "./locale"
import { Problems } from "./problems"

export const metadata: Metadata = { title: "Core" }

// /os — the Core.
//
// Not twelve identical cards. One centrepiece and five zones around it,
// each answering one of the brief's three questions:
//
//   WHAT IS HAPPENING?        the Core, Active projects, Recent activity
//   WHAT NEEDS MY ATTENTION?  Today, GRØNN insight, stale leads
//   WHAT SHOULD I DO NEXT?    Next, Next actions
//
// Desktop first (1440–1920px). Below xl the side columns fold under the
// Core instead of shrinking it.

export default async function CorePage() {
  if (!(await canOpenOs())) return <PanelGate />
  const { locale, t, s: say } = await osLocale()
  const view = await readOsView(locale)
  const { projects, leads, telemetry, today, activity, nextActions } = view
  const month = new Date().getMonth()
  const active = projects.filter((p) => p.stage !== "Completed" && p.stage !== "Archived")
  const stale = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").filter((l) => l.lastContactDays >= STALE_AFTER_DAYS)

  return (
    <div className="pt-[32px]">
      <h1 className="sr-only">{say("Core")}</h1>
      <Problems problems={view.problems} locale={locale} />

      <div className="grid gap-[40px] xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(300px,360px)] xl:gap-[48px]">
        {/* Left: the briefing */}
        <div className="order-2 space-y-[40px] xl:order-1 xl:pt-[24px]">
          <Zone id="today" title={t("Today", "Vandaag")}>
            <Greeting />
            <ul className="mt-[20px] grid grid-cols-2 gap-x-[16px] gap-y-[14px]">
              {today.counts.map((c) => {
                const body = (
                  <>
                    <span className={cn("font-heading text-[26px] leading-none", c.n > 0 ? "text-os-text" : "text-os-text-3")}>{c.n}</span>
                    <span className="text-[13px] leading-[17px] text-os-text-2">{say(c.label)}</span>
                  </>
                )
                return (
                  <li key={c.label}>
                    {c.href ? (
                      <Link href={c.href} className="flex items-baseline gap-[10px] rounded-[6px] hover:[&>span:last-child]:text-os-text">
                        {body}
                      </Link>
                    ) : (
                      <span className="flex items-baseline gap-[10px]">{body}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Zone>

          <Zone title={t("Coming up", "Binnenkort")}>
            {today.schedule.length === 0 && (
              <p className="text-[14px] leading-[21px] text-os-text-3">{t("No deadlines ahead. Your calendar joins this list in a later step.", "Geen deadlines in zicht. Je agenda komt in een latere stap bij deze lijst.")}</p>
            )}
            <ol className="relative space-y-[18px] pl-[18px]">
              <span aria-hidden className="absolute bottom-[6px] left-[3px] top-[6px] w-px bg-os-line" />
              {today.schedule.map((s, i) => (
                <li key={s.time + s.what} className="relative">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[18px] top-[5px] size-[7px] rounded-full border",
                      i === 0 ? "border-os-green bg-os-forest" : "border-os-text-3 bg-os-ground"
                    )}
                  />
                  <time className="block font-mono text-[12px] tracking-[0.06em] text-os-text-3">{s.time}</time>
                  <span className="mt-[2px] block text-[15px] text-os-text">{say(s.what)}</span>
                </li>
              ))}
            </ol>
          </Zone>
        </div>

        {/* Centre: the Core */}
        <div className="order-1 xl:order-2">
          <GronnCore projects={projects} leads={leads} telemetry={telemetry} month={month} locale={locale} />
          <p className="mx-auto mt-[4px] max-w-[520px] text-center text-[12px] leading-[18px] text-os-text-3">
            {t(
              "Projects sit on the orbit by stage, from Lead at the top clockwise to Completed. Inner rings: pipeline per lead, hours this month. Outer ring: the year.",
              "Projecten staan op de baan naar fase, van Lead bovenaan met de klok mee tot Afgerond. Binnenste ringen: pijplijn per lead, uren deze maand. Buitenste ring: het jaar."
            )}
          </p>
        </div>

        {/* Right: attention and next actions */}
        <div className="order-3 space-y-[40px] xl:pt-[24px]">
          <Zone title={t("GRØNN insight", "GRØNN-inzicht")}>
            <div className="rounded-[16px] border border-os-line bg-os-surface p-[18px]">
              <p className="text-[15px] leading-[23px] text-os-text">{say(today.insight.text)}</p>
              {today.insight.action && today.insight.href && (
              <>
              <p className="os-label mt-[16px]">{t("Suggested action", "Voorgestelde actie")}</p>
              <Link
                href={today.insight.href}
                className="mt-[8px] inline-flex items-center gap-[6px] rounded-full bg-os-forest px-[14px] py-[7px] text-[13px] text-os-text transition-colors hover:bg-os-green hover:text-os-ground"
              >
                {say(today.insight.action)}
                <ArrowUpRightIcon size={13} aria-hidden />
              </Link>
              </>
              )}
            </div>
          </Zone>

          <Zone title={t("Next actions", "Volgende acties")} aside={<span className="font-mono text-[11px] text-os-text-3">{nextActions.length} {t("open", "open")}</span>}>
            <ul className="divide-y divide-os-line">
              {nextActions.map((a) => (
                <li key={a.what + a.project} className="flex gap-[12px] py-[10px]">
                  <span aria-hidden className="mt-[7px] size-[5px] shrink-0 rounded-full bg-os-green-2" />
                  <div className="min-w-0">
                    <p className="text-[14px] leading-[20px] text-os-text">{say(a.what)}</p>
                    <p className="flex items-center gap-[8px] font-mono text-[11px] tracking-[0.06em] text-os-text-3">
                      {a.href ? (
                        <Link href={a.href} className="truncate hover:text-os-green">{a.project}</Link>
                      ) : (
                        <span className="truncate">{a.project}</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Zone>
        </div>
      </div>

      {/* Below the Core: the three wide zones */}
      <div className="mt-[56px] grid gap-[40px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] xl:gap-[48px]">
        <Zone title={t("Active projects", "Actieve projecten")} aside={<Link href="/os/projects" className="text-[12px] text-os-text-3 hover:text-os-green">{t("All projects", "Alle projecten")}</Link>}>
          {/* The project with photographs gets the photograph; the rest
              are rows until they have pictures of their own. */}
          <div className="grid gap-[20px] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {active
              .filter((p) => p.cover && p.hasControlView)
              .map((p) => (
                <Link key={p.slug} href={`/os/projects/${p.slug}`} className="group block rounded-[12px]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-os-raised">
                    <Image
                      src={p.cover!.src}
                      alt={p.cover!.alt}
                      fill
                      sizes="(min-width: 1280px) 22vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                    <span aria-hidden className="photo-glass absolute inset-0" />
                    <span className="absolute left-[10px] top-[10px] rounded-full bg-os-ground/90 px-[10px] py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] text-os-text-2">
                      {p.progress}% · {say(p.status)}
                    </span>
                  </div>
                  <p className="mt-[10px] flex items-center gap-[6px] font-heading text-[16px] text-os-text">
                    {p.name}
                    <ArrowUpRightIcon size={14} aria-hidden className="text-os-text-3 group-hover:text-os-green" />
                  </p>
                  <p className="text-[12px] text-os-text-2">{say(p.kind)}</p>
                  {p.progress !== null && <ProgressLine value={p.progress} className="mt-[10px]" />}
                </Link>
              ))}
            <ul className="divide-y divide-os-line self-start [&:not(:empty)]:border-y [&:not(:empty)]:border-os-line">
              {active
                .filter((p) => !(p.cover && p.hasControlView))
                .map((p) => (
                  <li key={p.slug} className="py-[12px]">
                    <p className="flex items-center justify-between gap-[8px]">
                      <span className="font-heading text-[15px] text-os-text">{p.name}</span>
                    </p>
                    <p className="mt-[2px] text-[12px] text-os-text-2">
                      {say(p.kind)} · {say(p.stage)} · {say(p.status)}
                    </p>
                    <p className="mt-[6px] flex items-start gap-[8px] text-[13px] leading-[19px] text-os-text-3">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[6px] size-[5px] shrink-0 rounded-full",
                          p.health === "attention" ? "bg-os-attention" : "bg-os-text-3"
                        )}
                      />
                      {say(p.note)}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </Zone>

        <Zone id="pipeline" title={say("Pipeline")} aside={<Link href="/os/pipeline" className="text-[12px] text-os-text-3 hover:text-os-green">{t("Open board", "Bord openen")}</Link>}>
          {leads.length === 0 && (
            <p className="mb-[14px] text-[14px] text-os-text-3">{t("No open leads.", "Geen open leads.")}</p>
          )}
          <ul className="space-y-[8px]">
            {PIPELINE_STAGES.filter((s) => s !== "Won" && s !== "Lost").map((stage) => {
              const here = leads.filter((l) => l.stage === stage)
              const value = here.reduce((s, l) => s + l.value, 0)
              const max = Math.max(1, ...leads.map((l) => l.value))
              return (
                <li key={stage} className="grid grid-cols-[104px_1fr_56px] items-center gap-[12px]">
                  <span className="text-[12px] text-os-text-2">{say(stage)}</span>
                  <span className="h-[6px] rounded-full bg-os-raised">
                    <span
                      className="block h-full rounded-full bg-os-green-2"
                      style={{ width: value ? `${Math.max((value / max) * 100, 4)}%` : 0 }}
                    />
                  </span>
                  <span className="text-right font-mono text-[11px] text-os-text-3">{value ? euroShort(value) : "—"}</span>
                </li>
              )
            })}
          </ul>
          {stale.length > 0 && (
            <Link href="/os/pipeline#stale" className="mt-[16px] flex items-center gap-[8px] text-[13px] text-os-text-2 hover:text-os-text">
              <span aria-hidden className="size-[6px] rounded-full bg-os-attention" />
              {t(`${stale.length === 1 ? "1 lead" : `${stale.length} leads`} without activity for ${STALE_AFTER_DAYS}+ days`, `${stale.length === 1 ? "1 lead" : `${stale.length} leads`} al ${STALE_AFTER_DAYS}+ dagen zonder activiteit`)}
            </Link>
          )}
        </Zone>

        <Zone title={t("Recent activity", "Recente activiteit")}>
          {activity.length === 0 && <p className="text-[14px] text-os-text-3">{t("Nothing recorded yet.", "Nog niets vastgelegd.")}</p>}
          <ol className="space-y-[12px]">
            {activity.map((a) => (
              <li key={a.time + a.what} className="grid grid-cols-[48px_1fr] gap-[12px]">
                <time className="font-mono text-[12px] leading-[20px] text-os-text-3">{a.time}</time>
                <p className="text-[14px] leading-[20px] text-os-text">
                  {say(a.what)}
                  {a.project && <span className="text-os-text-3"> · {a.project}</span>}
                </p>
              </li>
            ))}
          </ol>
        </Zone>
      </div>
    </div>
  )
}
