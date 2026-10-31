import type { Metadata } from "next"
import { cookies } from "next/headers"

import { LanguageProvider } from "@/components/language-provider"
import { OS_LANG_COOKIE, osLocaleFrom } from "@/lib/os/i18n"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { OPEN_OUTSIDE_PRODUCTION, canOpenOs } from "./access"
import { OsShell } from "./os-shell"
import "./os.css"

export const metadata: Metadata = {
  title: { default: "Command Center", template: "%s — GRØNN Command Center" },
  robots: { index: false, follow: false },
}

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  // See access.ts: every page asks again, because a layout alone does
  // not keep a page's markup out of the response.
  if (!(await canOpenOs())) return <PanelGate />

  const locale = osLocaleFrom((await cookies()).get(OS_LANG_COOKIE)?.value)

  return (
    // `bluehour` makes the site's own elements (logo, water route) take
    // their dark form inside the OS; `.os` then sets the OS palette.
    <LanguageProvider locale={locale}>
      <div className="bluehour" lang={locale}>
        <div className="os overflow-x-clip">
          <OsShell preview={OPEN_OUTSIDE_PRODUCTION}>{children}</OsShell>
        </div>
      </div>
    </LanguageProvider>
  )
}
