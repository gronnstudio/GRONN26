"use client"

import { useCallback, useEffect, useState } from "react"

import { useT } from "@/components/language-provider"
import { type DevOpdracht, useDevOpdracht } from "@/lib/dev-laag"

/**
 * Een stille melding als de verbinding wegvalt: wat je ziet komt dan
 * uit de cache van de service worker. Geen keuze in het palet — het
 * gebeurt zelden, en dan wil je het weten.
 *
 * Het `aria-live`-gebied staat er ALTIJD (leeg als je online bent);
 * een gebied dat pas verschijnt samen met zijn tekst wordt door
 * schermlezers vaak niet voorgelezen.
 *
 * Plaats: bovenaan, onder de kopbalk (80px) en de telefoonbalk
 * (12 + 56), dus nooit over de dock onderin of de balk bovenin.
 */
export function OfflineMelding() {
  const t = useT()
  const [echt, zetOffline] = useState(false)
  // DEV-laag (alleen geverifieerde eigenaar): een gesimuleerde offline-
  // stand voor DEZE melding, niet voor het echte netwerk.
  const [gesimuleerd, zetGesimuleerd] = useState(false)
  useDevOpdracht(
    useCallback((o: DevOpdracht) => {
      if (o.soort === "offline") zetGesimuleerd(o.aan)
    }, []),
  )
  const offline = echt || gesimuleerd

  useEffect(() => {
    const lees = () => zetOffline(!navigator.onLine)
    lees()
    window.addEventListener("offline", lees)
    window.addEventListener("online", lees)
    return () => {
      window.removeEventListener("offline", lees)
      window.removeEventListener("online", lees)
    }
  }, [])

  return (
    <div data-element="OfflineMelding"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-[16px] z-[59] flex justify-center"
      style={{ top: "calc(88px + env(safe-area-inset-top))" }}
    >
      {offline && (
        <p
          data-offline-melding
          className="pointer-events-auto rounded-full border border-line/15 bg-surface px-[14px] py-[6px] font-mono text-[12px] leading-[18px] text-foreground shadow-[var(--shadow-dock)]"
        >
          {t({
            nl: "Geen verbinding — je ziet een eerdere versie",
            en: "Offline — you're seeing an earlier version",
          })}
        </p>
      )}
    </div>
  )
}
