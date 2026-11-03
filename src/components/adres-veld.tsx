"use client"

import { useEffect, useId, useRef, useState } from "react"

// Een adresveld (systeem en kennismakingsformulier) dat meezoekt in de Basisregistratie Adressen via de gratis
// Locatieserver van PDOK (geen sleutel nodig). Kies je een adres, dan komt er
// "Straat 1, 1234 AB Plaats" in te staan en vult het veld `plaats` in hetzelfde
// formulier zich mee. Vrij typen blijft gewoon werken.
type Treffer = { weergavenaam: string; straatnaam?: string; huis_nlt?: string; postcode?: string; woonplaatsnaam?: string }

const ZOEK = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest"

const netjes = (t: Treffer) =>
  t.straatnaam && t.huis_nlt && t.postcode && t.woonplaatsnaam
    ? `${t.straatnaam} ${t.huis_nlt}, ${t.postcode.slice(0, 4)} ${t.postcode.slice(4)} ${t.woonplaatsnaam}`
    : t.weergavenaam

export function AdresVeld({
  naam,
  label,
  waarde = "",
  className,
  labelClassName = "relative grid gap-1 text-[13px]",
  voorbeeld = "Begin met straat en huisnummer",
}: {
  naam: string
  label: React.ReactNode
  waarde?: string
  className: string
  labelClassName?: string
  voorbeeld?: string
}) {
  const [tekst, setTekst] = useState(waarde)
  const [treffers, setTreffers] = useState<Treffer[]>([])
  const [open, setOpen] = useState(false)
  const [actief, setActief] = useState(0)
  const zoeken = useRef(false)
  const veld = useRef<HTMLInputElement>(null)
  const lijst = useId()

  useEffect(() => {
    if (!zoeken.current || tekst.trim().length < 3) return
    const stop = new AbortController()
    const wacht = setTimeout(async () => {
      try {
        const q = new URLSearchParams({ q: tekst, fq: "type:adres", rows: "6", fl: "weergavenaam,straatnaam,huis_nlt,postcode,woonplaatsnaam" })
        const r = await fetch(`${ZOEK}?${q}`, { signal: stop.signal })
        const docs = ((await r.json()).response?.docs ?? []) as Treffer[]
        setTreffers(docs)
        setActief(0)
        setOpen(docs.length > 0)
      } catch {
        // geen verbinding of afgebroken: gewoon vrij typen
      }
    }, 250)
    return () => {
      clearTimeout(wacht)
      stop.abort()
    }
  }, [tekst])

  function kies(t: Treffer) {
    zoeken.current = false
    setTekst(netjes(t))
    setOpen(false)
    const plaats = veld.current?.form?.elements.namedItem("plaats")
    if (plaats instanceof HTMLInputElement && plaats !== veld.current && t.woonplaatsnaam) plaats.value = t.woonplaatsnaam
  }

  return (
    <label className={`relative ${labelClassName}`}>
      {label}
      <input
        ref={veld}
        name={naam}
        value={tekst}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={lijst}
        aria-autocomplete="list"
        placeholder={voorbeeld}
        className={className}
        onChange={(e) => {
          zoeken.current = true
          setTekst(e.target.value)
          if (e.target.value.trim().length < 3) setOpen(false)
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === "ArrowDown") { e.preventDefault(); setActief((a) => Math.min(a + 1, treffers.length - 1)) }
          if (e.key === "ArrowUp") { e.preventDefault(); setActief((a) => Math.max(a - 1, 0)) }
          if (e.key === "Enter") { e.preventDefault(); kies(treffers[actief]) }
          if (e.key === "Escape") setOpen(false)
        }}
      />
      {open && (
        <ul id={lijst} role="listbox" className="absolute top-full left-0 z-20 rounded-[12px] border border-lijn bg-veld w-max min-w-full max-w-[460px] m-0 mt-1 list-none overflow-hidden p-1 shadow-lg">
          {treffers.map((t, i) => (
            <li
              key={t.weergavenaam}
              role="option"
              aria-selected={i === actief}
              onMouseDown={(e) => { e.preventDefault(); kies(t) }}
              onMouseEnter={() => setActief(i)}
              className={`cursor-pointer rounded-[8px] px-3 py-2 text-[14px] ${i === actief ? "bg-grond" : ""}`}
            >
              {netjes(t)}
            </li>
          ))}
          <li aria-hidden className="px-3 pt-1 pb-1.5 text-[11px] text-gedempt">Adressen uit het Kadaster (PDOK)</li>
        </ul>
      )}
    </label>
  )
}
