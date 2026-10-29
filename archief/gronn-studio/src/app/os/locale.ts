import "server-only"

import { cookies } from "next/headers"

import type { Locale } from "@/lib/i18n"
import { OS_LANG_COOKIE, osLocaleFrom, say, tr } from "@/lib/os/i18n"

/** The OS language for this request, and the two helpers bound to it. */
export async function osLocale(): Promise<{
  locale: Locale
  t: (en: string, nl: string) => string
  s: (text: string) => string
}> {
  const locale = osLocaleFrom((await cookies()).get(OS_LANG_COOKIE)?.value)
  return { locale, t: (en, nl) => tr(locale, en, nl), s: (text) => say(locale, text) }
}
