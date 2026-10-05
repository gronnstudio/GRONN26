"use client"

import { useEffect, useState } from "react"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import type { L } from "@/lib/i18n"

// "Jouw bezoek" op /techniek: wat je eigen browser over dit bezoek weet, live.
// Alles wordt hier gelezen en hier getoond; er gaat niets naar een server.

type Feit = { label: L; waarde: string }

export function JouwBezoek() {
  const taal = useTaal()
  const [feiten, setFeiten] = useState<Feit[] | null>(null)

  useEffect(() => {
    const lees = () => {
      const html = document.documentElement
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
      const ms = nav ? Math.round(nav.domContentLoadedEventEnd) : null
      const con = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType
      const en = taal === "en"
      setFeiten([
        { label: { nl: "Scherm", en: "Screen" }, waarde: `${innerWidth} × ${innerHeight}` },
        { label: { nl: "Weergave", en: "Display" }, waarde: html.classList.contains("donker") ? (en ? "Dark" : "Donker") : en ? "Light" : "Licht" },
        { label: { nl: "Taal", en: "Language" }, waarde: en ? "English" : "Nederlands" },
        { label: { nl: "Beweging", en: "Motion" }, waarde: html.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches ? (en ? "Less" : "Minder") : en ? "Full" : "Volledig" },
        { label: { nl: "Pagina klaar in", en: "Page ready in" }, waarde: ms !== null ? `${ms} ms` : "–" },
        { label: { nl: "Verbinding", en: "Connection" }, waarde: con ? con.toUpperCase() : "–" },
        { label: { nl: "Als app", en: "As an app" }, waarde: matchMedia("(display-mode: standalone)").matches ? (en ? "Yes" : "Ja") : en ? "No" : "Nee" },
        { label: { nl: "Cookies van mij", en: "Cookies from me" }, waarde: "0" },
      ])
    }
    const t = setTimeout(lees, 0)
    addEventListener("resize", lees)
    const mo = new MutationObserver(lees)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => {
      clearTimeout(t)
      removeEventListener("resize", lees)
      mo.disconnect()
    }
  }, [taal])

  return (
    <div className="tk-bezoek">
      <div className="tk-bezoek-kop">
        <span className="tk-live" aria-hidden="true" />
        <span className="lbl">
          <T t={{ nl: "Live · alleen in jouw browser", en: "Live · only in your browser" }} />
        </span>
      </div>
      <dl className="tk-bezoek-lijst">
        {(feiten ?? []).map((f) => (
          <div key={f.label.nl}>
            <dt className="lbl">
              <T t={f.label} />
            </dt>
            <dd className="tk-bezoek-waarde">{f.waarde}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-[14px] leading-[1.6] opacity-70">
        <T t={{ nl: "Probeer het: draai je telefoon, of zet in Weergave Donker of Engels aan. Niets hiervan wordt opgeslagen of verstuurd.", en: "Try it: rotate your phone, or switch on Dark or English in Display. None of this is stored or sent." }} />
      </p>
    </div>
  )
}
