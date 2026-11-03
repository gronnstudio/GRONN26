"use client"

import { useEffect, type ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import { LanguageProvider } from "@/components/language-provider"
import { ThemeModeProvider } from "@/components/theme-mode-provider"
import { applyA11yPrefs } from "@/lib/use-a11y-prefs"
import { ALL_THEME_NAMES, DAY_THEME } from "@/lib/themes"

export function Providers({ children }: { children: ReactNode }) {
  // ── DE VOORKEUREN OPNIEUW ZETTEN NA HYDRATIE ──────────────────────
  //
  // Dit repareert een fout die al op productie stond, en die niet te
  // zien was zonder hem te meten: de pre-paint-regel in `layout.tsx`
  // zet `data-motion`, `data-underline`, `data-text` en `data-contrast`
  // op <html> vóór de eerste verf — en ~100ms later haalde React ze er
  // bij de hydratie weer af. De server rendert <html> zonder die
  // attributen, dus verzoent React ze weg.
  //
  // Gemeten: op t=0 stonden alle vier erop, op t=100ms geen enkele. Dat
  // betekent dat "onderstreep elke link" en "minder beweging" bij élke
  // paginalading stilletjes uitgingen — precies de twee instellingen die
  // bestaan omdat de eigenaar zelf koppen niet van links kon
  // onderscheiden.
  //
  // `suppressHydrationWarning` op <html> lost dit NIET op; dat dempt de
  // waarschuwing, niet de verzoening. Next-themes heeft hetzelfde
  // probleem en lost het op dezelfde manier op: opnieuw zetten na mount.
  // De pre-paint-regel blijft nodig — zij voorkomt de flits, dit
  // voorkomt het terugdraaien.
  useEffect(() => {
    applyA11yPrefs()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      // Derived from the catalog, so adding a palette to a set cannot
      // leave the provider out of step with the switchers.
      themes={ALL_THEME_NAMES}
      // Only a fallback: the pre-paint script in layout.tsx has already
      // seeded storage from the visitor's clock, so this is what a
      // storage-less browser gets.
      defaultTheme={DAY_THEME}
      disableTransitionOnChange
    >
      <ThemeModeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeModeProvider>
    </ThemeProvider>
  )
}
