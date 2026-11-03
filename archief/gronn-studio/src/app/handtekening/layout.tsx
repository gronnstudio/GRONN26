import type { ReactNode } from "react"

import { LanguageProvider } from "@/components/language-provider"

// De handtekeningpagina staat buiten `[locale]`, net als /links:
// geen menu, dock of voet. Nederlands, dus hier dezelfde twee regels als
// in de `[locale]`-layout: de taalcontext, en `lang` op <html> tijdens het
// parsen, vóór er iets voorgelezen wordt.
export default function HandtekeningLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider locale="nl">
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="nl"` }} />
      {children}
    </LanguageProvider>
  )
}
