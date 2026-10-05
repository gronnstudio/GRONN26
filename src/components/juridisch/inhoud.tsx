"use client"

import { useEffect, useRef } from "react"

// De inhoudsopgave (WF-033): vanaf 1024px altijd open en vast in beeld,
// daaronder een dichte regel die je open tikt.
export function Inhoud({ koppen }: { koppen: string[] }) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const mq = matchMedia("(min-width: 1024px)")
    const zet = () => {
      d.open = mq.matches
    }
    zet()
    mq.addEventListener("change", zet)
    return () => mq.removeEventListener("change", zet)
  }, [])
  return (
    <details
      ref={ref}
      id="inhoud"
      open
      className="group static max-h-none overflow-auto border-y border-lijn lg:sticky lg:top-6 lg:max-h-[calc(100vh-140px)] lg:border-0"
    >
      <summary
        className="lbl flex cursor-pointer list-none justify-between py-4 after:text-[16px] after:font-light after:text-gedempt after:content-['+'] group-open:after:content-['−'] lg:cursor-default lg:py-0 lg:after:content-none lg:group-open:after:content-none [&::-webkit-details-marker]:hidden"
        onClick={(e) => {
          if (matchMedia("(min-width: 1024px)").matches) e.preventDefault()
        }}
      >
        Inhoud
      </summary>
      <nav aria-label="Inhoud van de privacyverklaring">
        <ol className="mt-0 mb-4 list-none border-t border-lijn p-0 lg:mt-4 lg:mb-0">
          {koppen.map((kop, i) => (
            <li key={kop}>
              <a
                href={`#s${i + 1}`}
                className="grid grid-cols-[28px_minmax(0,1fr)] border-b border-lijn py-2 text-sm leading-[1.35] no-underline hover:underline"
              >
                <span className="pt-0.5 text-[11px] font-semibold text-gedempt tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {kop}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}
