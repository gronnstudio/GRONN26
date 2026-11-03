"use client"

import { LocaleLink as Link } from "@/components/locale-link"
import { useT } from "@/components/language-provider"
import type { Crumb } from "@/lib/nav"
import { cn } from "@/lib/utils"

// The trail a detail page hangs from, shown to the visitor.
//
// It was already being handed to Google: `breadcrumbSchema()` is emitted
// on all three detail routes and its own docstring promises "search
// results show the trail instead of a bare URL". A visitor who arrived
// on that result and clicked through found no trail anywhere on the
// page — three different ad-hoc back links instead, in three different
// places, in two different styles.
//
// So this takes the SAME array the JSON-LD does (`trailFor()`), which is
// the only reason the two cannot say different things about where a page
// lives. See the e2e test that reads both and compares them.

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const t = useT()
  const home: Crumb = { label: { en: "Home", nl: "Home" }, path: "/" }
  // Home is prepended here exactly as `breadcrumbSchema()` prepends it.
  const items = [home, ...trail]
  const lastIndex = items.length - 1

  return (
    <nav
      aria-label={t({ en: "Breadcrumb", nl: "Kruimelpad" })}
      className="text-[11px] uppercase tracking-[0.14em]"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
        {items.map((item, i) => {
          const current = i === lastIndex
          // On a phone the full path does not fit, and the section is the
          // only crumb that does anything there — so everything but the
          // section collapses away and it grows a ‹ to read as "up".
          const phone = i === items.length - 2
          return (
            <li
              key={item.path}
              className={cn(
                // The separator is drawn, not written: a "/" text node
                // would land in the accessible name of the row and in
                // any comparison of this list against the JSON-LD.
                i > 0 &&
                  "before:mr-2 before:hidden before:text-line/60 before:content-['/'] sm:before:inline",
                phone ? "flex items-center" : "hidden items-center sm:flex"
              )}
            >
              {current ? (
                // A crumb that links to the page you are on is the
                // clickability confusion this site already fixed once in
                // its menus. The last one is a label.
                <span aria-current="page" className="text-foreground">
                  {t(item.label)}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="tap-target inline-flex items-center gap-1.5 text-muted transition-colors hover:text-gronn-ember"
                >
                  {/* Drawn, not typed, for the same reason as the
                      separator: a text chevron would count as part of
                      this crumb's name. */}
                  {phone && (
                    <svg
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="none"
                      aria-hidden
                      className="shrink-0 text-gronn-ember sm:hidden"
                    >
                      <path
                        d="M5 1 1 5l4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {t(item.label)}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
