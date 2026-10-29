"use client"

import { useLanguage } from "@/components/language-provider"
import type { Locale } from "@/lib/i18n"

/** Wisselt naar de andere taal op dezelfde pagina (de provider kent het pad). */
export function TaalKnop({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage()
  const ander: Locale = locale === "nl" ? "en" : "nl"
  return (
    <button
      type="button"
      onClick={() => setLocale(ander)}
      lang={ander}
      aria-label={ander === "en" ? "Read this page in English" : "Lees deze pagina in het Nederlands"}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-3 font-mono text-[12px] tracking-[0.12em] uppercase hover:text-[var(--ember-text)] ${className}`}
    >
      {ander}
    </button>
  )
}
