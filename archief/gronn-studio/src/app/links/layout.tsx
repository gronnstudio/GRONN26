import { cookies } from "next/headers"
import type { ReactNode } from "react"

import { LanguageMemory, LanguageProvider } from "@/components/language-provider"
import { linksTaal } from "@/components/gronn/links-taal"
import { LANG_COOKIE } from "@/lib/locale"

// De linkpagina staat buiten `[locale]` (zie src/components/gronn/links.tsx):
// geen menu, dock of voet. De taal komt uit dezelfde cookie als op de rest
// van de site (eigenaar, 28 sep 2026: "ik wil daar ook de language switch,
// met local storage zoals homepage"); zonder keuze Nederlands, want wie via
// de bio komt, leest Nederlands. `LanguageMemory` zet een verloren cookie
// terug uit localStorage, net als in de `[locale]`-layout, en `lang` op
// <html> staat er tijdens het parsen al.
export default async function LinksLayout({ children }: { children: ReactNode }) {
  const locale = linksTaal((await cookies()).get(LANG_COOKIE)?.value)
  return (
    <LanguageProvider locale={locale} vastPad>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      <LanguageMemory />
      {children}
    </LanguageProvider>
  )
}
