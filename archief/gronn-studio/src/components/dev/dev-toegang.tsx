"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"

import { controleerSessie, useDevLaag, zetDevLaag } from "@/lib/dev-laag"
import { useFlag } from "@/lib/flags"

/**
 * De verborgen deur naar de DEV-laag: een klein "·" achter de voetnoot
 * op /stack. Opent een paneeltje dat de SERVER laat beslissen: geen
 * eigenaar-sessie → "Alleen voor de eigenaar" met de bestaande login;
 * wel → de schakelaar. Alle maten in px.
 */
export function DevToegang() {
  const [open, zetOpen] = useState(false)
  const [eigenaar, zetEigenaar] = useState<boolean | null>(null)
  const { aan } = useDevLaag()
  const winkel = useFlag("winkel")
  const titel = useId()
  const knop = useRef<HTMLButtonElement>(null)
  const paneel = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    let weg = false

    void controleerSessie(true).then((e) => !weg && zetEigenaar(e))
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        zetOpen(false)
        knop.current?.focus()
      }
    }
    window.addEventListener("keydown", esc)
    paneel.current?.focus()
    return () => {
      weg = true
      window.removeEventListener("keydown", esc)
    }
  }, [open])

  return (
    <span className="relative inline-block" data-flag-winkel={String(winkel)}>
      <button
        ref={knop}
        type="button"
        data-dev-toegang
        aria-label="Ontwikkelaarslaag"
        aria-expanded={open}
        onClick={() => {
          zetEigenaar(null)
          zetOpen((o) => !o)
        }}
        className="inline-flex size-[44px] items-center justify-center align-middle text-[16px] leading-none text-muted hover:text-foreground"
      >
        <span aria-hidden>·</span>
      </button>
      {open && (
        // Op de telefoon vast boven de dock, over de volle breedte: aan het
        // "·" gehangen stak het paneel rechts buiten beeld.
        <span
          ref={paneel}
          role="dialog"
          aria-labelledby={titel}
          tabIndex={-1}
          data-dev-toegang-paneel
          className="absolute bottom-[48px] left-0 max-sm:fixed max-sm:inset-x-[16px] max-sm:bottom-[88px] max-sm:z-[62] max-sm:w-auto block font-sans tracking-normal normal-case z-[40] w-[260px] rounded-[16px] border border-line/15 bg-surface p-[16px] text-[14px] leading-[20px] text-foreground shadow-[var(--shadow-dock)] outline-none"
        >
          <span id={titel} className="block font-mono text-[12px] tracking-[0.08em] uppercase text-muted">
            DEV
          </span>
          {eigenaar === null && <span className="mt-[8px] block text-muted">Controleren…</span>}
          {eigenaar === false && (
            <span data-dev-alleen-eigenaar className="mt-[8px] block">
              Alleen voor de eigenaar.{" "}
              <Link href="/editor" className="font-semibold text-[var(--ember-text)] underline underline-offset-4">
                Inloggen
              </Link>
            </span>
          )}
          {eigenaar === true && (
            <label className="mt-[8px] flex min-h-[44px] cursor-pointer items-center justify-between gap-[12px]">
              <span>DEV-laag aan/uit</span>
              <input
                type="checkbox"
                role="switch"
                data-dev-schakelaar
                checked={aan}
                onChange={(e) => zetDevLaag(e.target.checked)}
                className="size-[20px] accent-[var(--ember-text)]"
              />
            </label>
          )}
        </span>
      )}
    </span>
  )
}
