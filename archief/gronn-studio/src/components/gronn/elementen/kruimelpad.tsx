import Link from "next/link"

import type { L, Locale } from "@/lib/i18n"
import { pick } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import type { Crumb } from "@/lib/nav"

/**
 * Het zichtbare kruimelpad. Leest dezelfde `trailFor()`-trail als de
 * BreadcrumbList-JSON-LD (`breadcrumbSchema`), met Home ervoor — zodat
 * wat een bezoeker ziet en wat een zoekmachine te horen krijgt naam voor
 * naam gelijk is (behaviors.spec.ts, "breadcrumbs"). De laatste stap is
 * de pagina zelf: tekst met aria-current, geen link.
 */
export function Kruimelpad({ trail, locale }: { trail: Crumb[]; locale: Locale }) {
  const stappen: Crumb[] = [{ label: { en: "Home", nl: "Home" } as L, path: "/" }, ...trail]
  return (
    <nav data-element="Kruimelpad" aria-label={locale === "nl" ? "Kruimelpad" : "Breadcrumb"} className="tekst-annotatie text-muted uppercase">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {stappen.map((s, i) => {
          const laatste = i === stappen.length - 1
          return (
            // Het scheidingsteken is CSS (::after), geen tekst: zo blijft de
            // tekst van elke stap precies de naam uit de JSON-LD.
            <li key={s.path} className="flex items-center gap-2 after:text-[var(--ember-text)] after:content-['/'] last:after:content-none">
              {laatste ? (
                <span aria-current="page" className="text-foreground/80 normal-case tracking-normal">{pick(s.label, locale)}</span>
              ) : (
                <Link href={localePath(locale, s.path)} className="inline-flex min-h-[24px] items-center underline-offset-4 hover:text-foreground hover:underline">
                  {pick(s.label, locale)}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
