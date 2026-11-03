import type { Locale } from "@/lib/i18n"
import { tr } from "@/lib/os/i18n"

/** Sources that did not answer, said out loud instead of shown as zeros. */
export function Problems({ problems, locale }: { problems: string[]; locale: Locale }) {
  if (problems.length === 0) return null
  return (
    <div role="status" className="mb-[24px] rounded-[12px] border border-os-attention/50 bg-os-surface px-[16px] py-[12px] text-[14px] leading-[21px] text-os-text">
      {problems.join(" ")} {tr(locale, "Figures from it are missing below, not zero.", "Cijfers daaruit ontbreken hieronder; ze zijn niet nul.")}
    </div>
  )
}
