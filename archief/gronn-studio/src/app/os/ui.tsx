"use client"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/os/i18n"
import { cn } from "@/lib/utils"

// The OS's small vocabulary. Three pieces, used everywhere, so a zone on
// the Core and a zone on a project page are the same object.

/** A zone heading: mono label, optional aside, a surveyed hairline. */
export function Zone({
  id,
  title,
  aside,
  children,
  className,
}: {
  id?: string
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-[88px]", className)}>
      <div className="flex items-baseline justify-between gap-[12px]">
        <h2 id={headingId} className="os-label text-os-text-2">
          {title}
        </h2>
        {aside}
      </div>
      <div className="os-rule mt-[10px]" aria-hidden />
      <div className="mt-[16px]">{children}</div>
    </section>
  )
}

/** One telemetry reading: label over value. */
export function Reading({
  label,
  value,
  unit,
  children,
  className,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="os-label">{label}</dt>
      <dd className="mt-[8px]">
        <span className="font-heading text-[28px] leading-[32px] text-os-text">{value}</span>
        {unit && <span className="ml-[4px] font-mono text-[12px] text-os-text-3">{unit}</span>}
        {children}
      </dd>
    </div>
  )
}

export function ProgressLine({ value, className }: { value: number; className?: string }) {
  const { locale } = useLanguage()
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={tr(locale, "Progress", "Voortgang")}
      className={cn("h-[2px] w-full bg-os-line", className)}
    >
      <div className="h-full bg-os-green" style={{ width: `${value}%` }} />
    </div>
  )
}
