"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useT } from "@/components/language-provider"
import { type DevOpdracht, useDevOpdracht } from "@/lib/dev-laag"
import { useResumePref } from "@/lib/use-a11y-prefs"
import { useHydrated } from "@/lib/use-hydrated"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/**
 * "Verder bij: <hoofdstuk>" — één stille regel bovenaan een lang
 * projectverhaal, voor wie eerder halverwege was.
 *
 * Een KEUZE in het palet (Weergave → Navigeren), standaard uit. Aan:
 * het laatste hoofdstuk waarvan de kop voorbij is gescrold wordt per
 * slug in localStorage bewaard. Niets gaat het toestel uit. Elke lees-
 * en schrijfactie staat in try/catch (privévenster, geblokkeerde
 * opslag): dan is er gewoon geen regel.
 */

const sleutel = (slug: string) => `gronn-verder:${slug}`
/** Onder de vaste kopbalk (80) plus wat lucht. */
const LIJN = 120

function lees(slug: string): string | null {
  try {
    return window.localStorage.getItem(sleutel(slug))
  } catch {
    return null
  }
}

function schrijf(slug: string, id: string) {
  try {
    window.localStorage.setItem(sleutel(slug), id)
  } catch {
    // Niet bewaard; de regel komt dan niet terug.
  }
}

export function VerderLezen({
  slug,
  hoofdstukken,
}: {
  slug: string
  hoofdstukken: { id: string; kort: string }[]
}) {
  const t = useT()
  const [aan] = useResumePref()
  const rustig = useReducedMotion()
  const hydrated = useHydrated()
  const [gesloten, zetGesloten] = useState(false)
  // DEV-laag (alleen geverifieerde eigenaar): de regel tonen met het
  // tweede hoofdstuk, zonder de voorkeur of de opslag aan te raken.
  const [devToon, zetDevToon] = useState(false)
  useDevOpdracht(
    useCallback((o: DevOpdracht) => {
      if (o.soort === "verder-lezen") {
        zetDevToon(true)
        zetGesloten(false)
      }
    }, []),
  )

  // Bij binnenkomst (of bij aanzetten): waar was je? Eén keer gelezen,
  // niet opnieuw bij elke veeg die het hoofdstuk bijwerkt.
  const bij = useMemo(() => {
    if (!hydrated || !aan) return null
    const id = lees(slug)
    return hoofdstukken.find((h) => h.id === id) ?? null
  }, [hydrated, aan, slug, hoofdstukken])

  // Tijdens het lezen: onthoud de laatste kop die voorbij is.
  useEffect(() => {
    if (!aan) return
    let vorige: string | null = null
    let frame = 0
    const meet = () => {
      frame = 0
      let laatste: string | null = null
      for (const h of hoofdstukken) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top < LIJN) laatste = h.id
      }
      if (laatste && laatste !== vorige) {
        vorige = laatste
        schrijf(slug, laatste)
      }
    }
    const opScroll = () => {
      if (!frame) frame = requestAnimationFrame(meet)
    }
    window.addEventListener("scroll", opScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", opScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [aan, slug, hoofdstukken])

  const dev = devToon ? (hoofdstukken[1] ?? hoofdstukken[0] ?? null) : null
  const toon = bij ?? dev
  if (gesloten || !toon || (!aan && !dev)) return null

  return (
    <div data-element="VerderLezen"
      data-verder-lezen
      className="mt-6 flex max-w-xl flex-wrap items-center gap-x-[12px] gap-y-[4px] border-y border-line/15 py-[8px] text-[15px]"
    >
      <p className="min-w-0 flex-1 text-foreground/80">
        <span className="tekst-annotatie uppercase text-muted">{t({ nl: "Verder bij", en: "Continue at" })}:</span>{" "}
        {toon.kort}
      </p>
      <button
        type="button"
        onClick={() => {
          document.getElementById(toon.id)?.scrollIntoView({ behavior: rustig ? "auto" : "smooth", block: "start" })
          zetGesloten(true)
        }}
        className="inline-flex min-h-[44px] items-center gap-[6px] font-semibold text-[var(--ember-text)] underline underline-offset-4"
      >
        {t({ nl: "Ga verder", en: "Go there" })} <span aria-hidden>↓</span>
      </button>
      <button
        type="button"
        onClick={() => zetGesloten(true)}
        aria-label={t({ nl: "Sluiten", en: "Close" })}
        className="inline-flex size-[44px] items-center justify-center rounded-full text-muted hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
