import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { PanelGate } from "@/app/dashboard/owner-gate"
import type { OpenDocument } from "@/lib/analytics"
import { euroFull, euroShort } from "@/lib/os/data"
import type { Locale } from "@/lib/i18n"
import { days, tr } from "@/lib/os/i18n"
import { cn } from "@/lib/utils"
import { Reading, Zone } from "../ui"
import { canOpenOs } from "../access"
import { Problems } from "../problems"
import { readOsView } from "../read-view"
import { osLocale } from "../locale"

export const metadata: Metadata = { title: "Finance" }

// /os/finance — the money, read from the same archive as /dashboard and
// summed by the same function (`moneySummary` in lib/analytics.ts), so
// the two screens cannot disagree. Writing a quote or an invoice still
// happens in the dashboard's builder; every row links there.

function when(d: OpenDocument, locale: Locale): { text: string; late: boolean } {
  if (d.daysLeft === null) return { text: tr(locale, "No date", "Geen datum"), late: false }
  if (d.daysLeft < 0) return { text: tr(locale, `${days(locale, -d.daysLeft)} late`, `${days(locale, -d.daysLeft)} te laat`), late: true }
  if (d.daysLeft === 0) return { text: tr(locale, "Today", "Vandaag"), late: false }
  return { text: tr(locale, `in ${days(locale, d.daysLeft)}`, `over ${days(locale, d.daysLeft)}`), late: false }
}

function DocRows({ docs, empty, locale }: { docs: OpenDocument[]; empty: string; locale: Locale }) {
  if (docs.length === 0) return <p className="text-[14px] text-os-text-3">{empty}</p>
  return (
    <ul className="divide-y divide-os-line">
      {docs.map((d) => {
        const w = when(d, locale)
        return (
          <li key={d.id}>
            <Link
              href="/dashboard/offertes"
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-[16px] gap-y-[2px] rounded-[8px] py-[12px] transition-colors hover:bg-os-surface sm:grid-cols-[110px_minmax(0,1fr)_110px_120px]"
            >
              <span className="font-mono text-[12px] text-os-text-3">{d.number || "—"}</span>
              <span className="col-start-1 row-start-2 min-w-0 truncate text-[14px] text-os-text sm:col-start-auto sm:row-start-auto">
                {d.client || d.title || tr(locale, "Untitled", "Zonder titel")}
              </span>
              <span className="row-span-2 text-right font-mono text-[13px] text-os-text sm:row-span-1">{euroFull(d.value)}</span>
              <span className={cn("hidden text-right font-mono text-[12px] sm:block", w.late ? "text-os-attention" : "text-os-text-3")}>
                {w.text}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default async function FinancePage() {
  if (!(await canOpenOs())) return <PanelGate />
  const { locale, t, s: say } = await osLocale()
  const view = await readOsView(locale)
  const f = view.finance
  const preview = view.mode === "preview"
  const max = Math.max(1, ...f.months.map((m) => m.value))
  const quotesTotal = f.openQuotes.reduce((s, d) => s + d.value, 0)
  const monthName = (key: string) =>
    new Date(`${key}-15T12:00:00Z`).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { month: "short" }).replace(".", "")

  return (
    <div className="pt-[40px]">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <div>
          <p className="os-label flex items-center gap-[8px]">{say("Finance")}</p>
          <h1 className="mt-[8px] font-heading text-[32px] leading-[36px] text-os-text">{t("Money in, money owed", "Binnen en nog te ontvangen")}</h1>
        </div>
        <Link
          href="/dashboard/offertes"
          className="inline-flex items-center gap-[6px] rounded-full border border-os-line px-[14px] py-[8px] text-[13px] text-os-text-2 transition-colors hover:border-os-green hover:text-os-text"
        >
          {t("Write a quote or invoice", "Offerte of factuur schrijven")}
          <ArrowUpRightIcon size={13} aria-hidden />
        </Link>
      </div>
      <div className="os-rule mt-[20px]" aria-hidden />
      <div className="mt-[20px]">
        <Problems problems={view.problems} locale={locale} />
      </div>

      <dl className="mt-[12px] grid grid-cols-2 gap-[28px] md:grid-cols-4">
        <Reading label={t("Invoiced this year", "Gefactureerd dit jaar")} value={euroFull(f.invoicedThisYear)} />
        <Reading label={t("Still to receive", "Nog te ontvangen")} value={euroFull(f.owed)} />
        <Reading label={t("Overdue", "Over de vervaldatum")} value={<span className={f.overdueTotal > 0 ? "text-os-attention" : undefined}>{euroFull(f.overdueTotal)}</span>}>
          <span className="mt-[4px] block font-mono text-[11px] text-os-text-3">
            {f.overdue.length === 1 ? t("1 invoice", "1 factuur") : t(`${f.overdue.length} invoices`, `${f.overdue.length} facturen`)}
          </span>
        </Reading>
        <Reading label={t("Open quotes", "Open offertes")} value={euroFull(quotesTotal)}>
          <span className="mt-[4px] block font-mono text-[11px] text-os-text-3">
            {f.openQuotes.length === 1 ? t("1 quote", "1 offerte") : t(`${f.openQuotes.length} quotes`, `${f.openQuotes.length} offertes`)}
          </span>
        </Reading>
      </dl>

      <div className="mt-[48px] grid gap-[40px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-[48px]">
        <Zone id="unpaid" title={t("Unpaid invoices", "Onbetaalde facturen")}>
          <DocRows docs={f.unpaid} locale={locale} empty={t("Every invoice is paid.", "Elke factuur is betaald.")} />
        </Zone>
        <Zone id="quotes" title={t("Open quotes", "Open offertes")}>
          <DocRows docs={f.openQuotes} locale={locale} empty={t("No quotes waiting on a decision.", "Geen offertes die op een beslissing wachten.")} />
        </Zone>
      </div>

      <Zone title={t("Invoiced per month", "Gefactureerd per maand")} className="mt-[48px]" aside={<span className="font-mono text-[11px] text-os-text-3">{t("Last 12 months", "Laatste 12 maanden")}</span>}>
        <figure>
          <ol className="flex h-[180px] items-end gap-[6px] sm:gap-[10px]" aria-label={t("Invoiced per month, last 12 months", "Gefactureerd per maand, laatste 12 maanden")}>
            {f.months.map((m) => (
              <li key={m.key} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <span className="sr-only">
                  {monthName(m.key)}: {euroFull(m.value)}
                </span>
                <span
                  aria-hidden
                  title={`${monthName(m.key)} · ${euroFull(m.value)}`}
                  className={cn("block w-full rounded-t-[4px]", m.value > 0 ? "bg-os-green-2" : "bg-os-line")}
                  style={{ height: m.value > 0 ? `${Math.max((m.value / max) * 100, 3)}%` : "2px" }}
                />
                <span aria-hidden className="mt-[6px] text-center font-mono text-[10px] uppercase tracking-[0.08em] text-os-text-3">
                  {monthName(m.key)}
                </span>
              </li>
            ))}
          </ol>
          <figcaption className="mt-[12px] text-[12px] text-os-text-3">
            {t(
              `Paid and unpaid invoices by invoice date, excluding annexes. This month so far: ${euroShort(f.invoicedThisMonth)}.`,
              `Betaalde en onbetaalde facturen op factuurdatum, zonder bijlagen. Deze maand tot nu toe: ${euroShort(f.invoicedThisMonth)}.`
            )}
          </figcaption>
        </figure>
      </Zone>

      <p className="mt-[32px] text-[12px] text-os-text-3">
        {preview
          ? t(
              "This preview cannot read the books, so every figure is empty. Your invoices and quotes appear on gronn.studio/os once you are signed in.",
              "Deze preview kan de boekhouding niet lezen, dus elk cijfer is leeg. Je facturen en offertes verschijnen op gronn.studio/os zodra je bent ingelogd."
            )
          : t("Same archive and the same sums as the owner panel.", "Hetzelfde archief en dezelfde sommen als het eigenaarspaneel.")}
      </p>
    </div>
  )
}
