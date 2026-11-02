"use client"

import { useEffect, useState } from "react"

// Korte melding midden op het scherm (Nick, 2 nov 2026), voor alles in het
// systeem: meldingen van formulieren (role="alert"/"status"), invoer die niet
// klopt (de browser-check van een veld) en meld("…") vanuit de code.
// De melding zelf staat er ook nog gewoon bij het veld.
const MELD = "gronn-meld"
export const meld = (tekst: string) => dispatchEvent(new CustomEvent(MELD, { detail: tekst }))

export function Melding() {
  const [tekst, setTekst] = useState("")

  useEffect(() => {
    let klok = 0
    const toon = (t: string) => {
      const schoon = t.trim()
      if (!schoon) return
      setTekst(schoon)
      clearTimeout(klok)
      klok = window.setTimeout(() => setTekst(""), 2600)
    }
    const eigen = (e: Event) => toon(String((e as CustomEvent).detail ?? ""))
    const fout = (e: Event) => {
      const v = e.target as HTMLInputElement
      if (v?.validationMessage) toon(`${v.labels?.[0]?.textContent?.trim() ? `${v.labels[0].textContent.trim()}: ` : ""}${v.validationMessage}`)
    }
    // Nieuwe of veranderde meldingen op de pagina.
    const kijk = new MutationObserver((lijst) => {
      for (const m of lijst) {
        const el = (m.target.nodeType === 1 ? m.target : m.target.parentElement) as Element | null
        const melding = el?.closest('[role="alert"],[role="status"]') ?? (m.addedNodes[0] as Element | undefined)?.closest?.('[role="alert"],[role="status"]')
        if (melding && !melding.hasAttribute("data-stil") && !melding.closest("[data-melding]")) toon(melding.textContent ?? "")
      }
    })
    kijk.observe(document.body, { subtree: true, childList: true, characterData: true })
    addEventListener(MELD, eigen)
    addEventListener("invalid", fout, true)
    return () => {
      kijk.disconnect()
      removeEventListener(MELD, eigen)
      removeEventListener("invalid", fout, true)
      clearTimeout(klok)
    }
  }, [])

  if (!tekst) return null
  return (
    <div data-melding aria-hidden className="pointer-events-none fixed inset-0 z-[100] grid place-items-center p-6 print:hidden">
      <p className="m-0 max-w-[420px] rounded-[16px] bg-inkt px-5 py-3 text-center text-[14px] font-semibold text-grond shadow-lg">{tekst}</p>
    </div>
  )
}
