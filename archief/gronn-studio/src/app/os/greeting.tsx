"use client"

import { useLanguage } from "@/components/language-provider"
import { useKlok } from "@/lib/use-klok"

/** "Good morning" by the owner's own clock, not the server's. */
export function Greeting() {
  const { locale } = useLanguage()
  const now = useKlok()
  const h = now?.getHours()
  const part = h === undefined ? -1 : h < 12 ? 0 : h < 18 ? 1 : 2
  const text =
    part < 0
      ? " "
      : locale === "nl"
        ? `${["Goedemorgen", "Goedemiddag", "Goedenavond"][part]}, Nick.`
        : `Good ${["morning", "afternoon", "evening"][part]}, Nick.`
  return <p className="font-heading text-[26px] leading-[32px] text-os-text">{text}</p>
}
