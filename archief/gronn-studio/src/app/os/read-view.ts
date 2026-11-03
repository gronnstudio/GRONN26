import "server-only"

import { cache } from "react"

import type { Locale } from "@/lib/i18n"
import { liveView } from "@/lib/os/live"
import { previewView, type OsView } from "@/lib/os/view"
import { OPEN_OUTSIDE_PRODUCTION } from "./access"

/**
 * The view every /os page renders. Call it only AFTER `canOpenOs()`.
 *
 * Previews and development open without a sign-in, so they never read
 * the books; production is owner-only and gets the studio's own records.
 * One read per request, however many components ask.
 */
export const readOsView = cache(async (locale: Locale): Promise<OsView> => {
  const today = new Date()
  return OPEN_OUTSIDE_PRODUCTION ? previewView(locale) : liveView(today, locale)
})
