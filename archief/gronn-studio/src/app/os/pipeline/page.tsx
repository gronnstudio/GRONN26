import type { Metadata } from "next"

import { PanelGate } from "@/app/dashboard/owner-gate"
import Link from "next/link"

import { PIPELINE_STAGES, STALE_AFTER_DAYS, euroShort } from "@/lib/os/data"
import { cn } from "@/lib/utils"
import { days } from "@/lib/os/i18n"
import { canOpenOs } from "../access"
import { Problems } from "../problems"
import { readOsView } from "../read-view"
import { osLocale } from "../locale"

export const metadata: Metadata = { title: "Pipeline" }

// /os/pipeline — the sales pipeline as a board, one column per stage.
//
// Each card carries the brief's seven fields. A lead without contact for
// STALE_AFTER_DAYS or more is stale: its card gets the one orange mark
// on the page, and it is listed again at the top, because a stale lead is
// the thing on this screen that needs you.

export default async function PipelinePage() {
  if (!(await canOpenOs())) return <PanelGate />
  const { locale, t, s: say } = await osLocale()
  const view = await readOsView(locale)
  const leads = view.leads
  const open = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost")
  const total = open.reduce((s, l) => s + l.value, 0)
  // Weighted only over leads with a chance somebody set; the rest are
  // left out rather than given an invented percentage.
  const chanced = open.filter((l) => l.probability !== null)
  const weighted = chanced.reduce((s, l) => s + (l.value * (l.probability ?? 0)) / 100, 0)
  const stale = open.filter((l) => l.lastContactDays >= STALE_AFTER_DAYS)

  return (
    <div className="pt-[40px]">
      <div className="flex flex-wrap items-end justify-between gap-[24px]">
        <div>
          <p className="os-label flex items-center gap-[8px]">
            {say("Pipeline")}
          </p>
          <h1 className="mt-[8px] font-heading text-[32px] leading-[36px] text-os-text">{t("Leads and quotations", "Leads en offertes")}</h1>
        </div>
        <dl className="flex gap-[40px]">
          <div>
            <dt className="os-label">{t("Open value", "Open waarde")}</dt>
            <dd className="mt-[6px] font-heading text-[24px] text-os-text">{euroShort(total)}</dd>
          </div>
          <div>
            <dt className="os-label">{t("Weighted", "Gewogen")}</dt>
            <dd className="mt-[6px] font-heading text-[24px] text-os-text">{chanced.length ? euroShort(weighted) : "—"}</dd>
          </div>
          <div>
            <dt className="os-label">{t("Stale", "Stil")}</dt>
            <dd className="mt-[6px] font-heading text-[24px] text-os-attention">{stale.length}</dd>
          </div>
        </dl>
      </div>
      <div className="os-rule mt-[20px]" aria-hidden />
      <div className="mt-[20px]">
        <Problems problems={view.problems} locale={locale} />
      </div>
      {open.length === 0 && (
        <p className="mt-[24px] text-[15px] text-os-text-2">{t("No open leads. New enquiries from the site form land here.", "Geen open leads. Nieuwe aanvragen via het formulier op de site komen hier binnen.")}</p>
      )}

      {stale.length > 0 && (
        <section id="stale" aria-labelledby="stale-title" className="mt-[24px] scroll-mt-[88px] rounded-[16px] border border-os-line bg-os-surface p-[18px]">
          <h2 id="stale-title" className="os-label text-os-text-2">
            {t(`Stale leads · no activity for ${STALE_AFTER_DAYS}+ days`, `Stille leads · ${STALE_AFTER_DAYS}+ dagen geen activiteit`)}
          </h2>
          <ul className="mt-[12px] grid gap-[12px] md:grid-cols-2">
            {stale.map((l) => (
              <li key={l.id} className="flex items-baseline gap-[12px]">
                <span aria-hidden className="size-[6px] shrink-0 translate-y-[-2px] rounded-full bg-os-attention" />
                <span className="text-[14px] text-os-text">{l.name}</span>
                <span className="text-[13px] text-os-text-3">
                  {days(locale, l.lastContactDays)} · {say(l.next)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* A board from md up; on a phone the stages stack, and the empty ones step aside. */}
      <div className="mt-[28px] pb-[12px] md:overflow-x-auto">
        <ol className="grid gap-[28px] md:min-w-[1280px] md:grid-cols-8 md:gap-[12px]">
          {PIPELINE_STAGES.map((stage) => {
            const here = leads.filter((l) => l.stage === stage)
            return (
              <li key={stage} aria-label={`${say(stage)}, ${here.length} leads`} className={here.length === 0 ? "hidden md:block" : undefined}>
                <p className="flex items-baseline justify-between border-b border-os-line pb-[8px]">
                  <span className="text-[13px] text-os-text-2">{say(stage)}</span>
                  <span className="font-mono text-[11px] text-os-text-3">{here.length}</span>
                </p>
                <ul className="mt-[10px] space-y-[10px]">
                  {here.map((l) => {
                    const isStale = l.lastContactDays >= STALE_AFTER_DAYS
                    return (
                      <li key={l.id} className={cn("rounded-[14px] border bg-os-surface p-[14px]", isStale ? "border-os-attention/60" : "border-os-line")}>
                        <p className="font-heading text-[15px] text-os-text">
                          {l.href ? (
                            <Link href={l.href} className="hover:text-os-green">{l.name}</Link>
                          ) : (
                            l.name
                          )}
                        </p>
                        <p className="text-[12px] text-os-text-2">
                          {say(l.kind)} · {l.place}
                        </p>
                        <dl className="mt-[12px] grid grid-cols-2 gap-[8px] font-mono text-[11px]">
                          <div>
                            <dt className="text-os-text-3">{t("Value", "Waarde")}</dt>
                            <dd className="text-os-text">{l.value ? euroShort(l.value) : "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-os-text-3">{t("Chance", "Kans")}</dt>
                            <dd className="text-os-text">{l.probability === null ? "—" : `${l.probability}%`}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-os-text-3">{t("Last activity", "Laatste activiteit")}</dt>
                            <dd className={isStale ? "text-os-attention" : "text-os-text"}>{l.lastContactDays === 0 ? t("Today", "Vandaag") : t(`${days(locale, l.lastContactDays)} ago`, `${days(locale, l.lastContactDays)} geleden`)}</dd>
                          </div>
                        </dl>
                        <p className="mt-[10px] border-t border-os-line pt-[8px] text-[12px] leading-[17px] text-os-text-2">
                          <span className="text-os-text-3">{t("Next", "Volgende")} · </span>
                          {say(l.next)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
