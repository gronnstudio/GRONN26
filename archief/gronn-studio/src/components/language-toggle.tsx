"use client"

import { LanguageFlag } from "@/components/language-flag"
import { useLanguage, useT } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/i18n"

const LOCALES: { locale: Locale; name: string }[] = [
  { locale: "en", name: "English" },
  { locale: "nl", name: "Nederlands" },
]

// Segmented EN | NL pill. Switching navigates to the same page in the
// other locale tree (EN at the root, NL under /nl).
//
// `flags` is the phone panel's version (owner, 23 Sep 2026: "op mobiel
// twee vlaggen als op desktop met een toggle"): each segment carries the
// same round flag as the desktop header button plus its code, and fills
// the panel's width. Without it the pill stays the compact text version.
export function LanguageToggle({ flags = false }: { flags?: boolean }) {
  const { locale, setLocale } = useLanguage()
  const t = useT()

  return (
    <div
      role="group"
      aria-label={t({ en: "Language", nl: "Taal" })}
      className={cn(
        "flex items-center rounded-full border border-line/20",
        flags ? "w-full gap-[2px] p-[2px]" : "p-0.5"
      )}
    >
      {LOCALES.map((option) => {
        const actief = locale === option.locale
        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            aria-pressed={actief}
            // The full language name, not the code: "EN" read aloud is
            // two letters, and a flag is not a language.
            aria-label={option.name}
            className={cn(
              "rounded-full font-mono text-[11px] uppercase tracking-wider transition-colors",
              flags
                ? // A REAL 44px, in px, not an overhang: the two segments
                  // sit flush, and chrome does not grow with the text
                  // size (CLAUDE.md, telefoonnavigatie point 1).
                  "flex h-[44px] min-w-0 flex-1 items-center justify-center gap-[8px] px-[12px]"
                : // min-w-11 + tap-target = a 44×44 press per segment. The
                  // width is real rather than an overhang on purpose: two
                  // segments sit flush, so overhanging hit areas would
                  // overlap in the middle and make EN/NL a coin toss
                  // under a thumb. Type is untouched.
                  "tap-target min-w-11 px-2.5 py-1.5",
              actief
                ? "bg-gronn-green text-gronn-white"
                : "text-muted hover:text-foreground active:text-foreground"
            )}
          >
            {flags && <LanguageFlag locale={option.locale} size={20} />}
            {option.locale}
          </button>
        )
      })}
    </div>
  )
}
