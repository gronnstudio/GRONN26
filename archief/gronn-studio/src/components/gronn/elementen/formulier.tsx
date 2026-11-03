"use client"

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from "react"
import { flushSync } from "react-dom"

import type { L } from "@/lib/i18n"
import type { Regel } from "@/lib/invulvelden"

// Formulierelementen: een veld met label erboven, en keuzes als pillen
// (echte radio's, visueel verborgen, zodat toetsenbord en schermlezer
// gewoon werken). Geen state in de elementen; het formulier houdt die,
// met `useVeldControle` hieronder.
//
// Invulvelden (eigenaar, 28 sep 2026: "voor invulvelden geef een licht
// gedrukt voorbeeld op en verbeter als het veld niet juist word
// ingevuld"):
//   · `voorbeeld` staat licht gedrukt in het lege veld (token
//     --placeholder: stiller dan muted, maar 4,5:1+ op de veldgrond). Het
//     is een voorbeeld, nooit het label: het label staat er altijd boven.
//   · `fout` staat direct onder het veld, links gelijk met het veld, in
//     --ember-text; het veld krijgt aria-invalid, een rand in dezelfde
//     kleur en aria-describedby naar de regel.
//   · `opmerking` zegt wat er is rechtgezet ("Genoteerd als 6171 AB."),
//     gedempt, ook via aria-describedby.
// De regels zelf (voorbeelden, foutteksten, rechtzetten) staan in
// src/lib/invulvelden.ts.
//
// Een verplichte keuze in `KeuzePillen` krijgt dezelfde foutregel onder de
// pillen, via aria-describedby aan elke radio gekoppeld, zodat een
// schermlezer hem voorleest zodra de focus daar landt.

// Alles in px (CLAUDE.md: tekst groeit, chroom niet). De foutrand is een
// inset-schaduw bovenop de rand van 1px: hij oogt 2px zonder dat het veld
// verspringt.
const VAK =
  "block w-full rounded-[8px] border bg-background px-[16px] py-[12px] text-[16px] outline-none transition-colors placeholder:text-placeholder focus:border-[var(--gronn-ember)] motion-reduce:transition-none"
const VAK_GOED = "border-line/25"
const VAK_FOUT = "border-[var(--ember-text)] shadow-[inset_0_0_0_1px_var(--ember-text)] focus:border-[var(--ember-text)]"

/** De regel onder een veld: een fout (oranje, vet) of een opmerking (gedempt). */
export function VeldMelding({ id, soort, children }: { id: string; soort: "fout" | "opmerking"; children: ReactNode }) {
  return (
    <p
      id={id}
      data-veld-melding={soort}
      className={`mt-[8px] text-[14px] leading-[20px] ${soort === "fout" ? "font-semibold text-[var(--ember-text)]" : "text-muted"}`}
    >
      {children}
    </p>
  )
}

export function Veld({
  label,
  naam,
  type = "text",
  verplicht = false,
  optioneel,
  autoComplete,
  inputMode,
  regels,
  voorbeeld,
  fout,
  opmerking,
  onBlur,
  onInput,
}: {
  label: ReactNode
  naam: string
  type?: string
  verplicht?: boolean
  /** Tekst achter het label, bijv. "(optioneel)". */
  optioneel?: string
  autoComplete?: string
  inputMode?: "text" | "email" | "tel" | "numeric"
  /** Aantal regels: maakt er een tekstvak van. */
  regels?: number
  /** Het licht gedrukte voorbeeld in het lege veld. Nooit het label. */
  voorbeeld?: string
  /** Wat er mis is en wat er wél verwacht wordt; alleen gezet bij een fout. */
  fout?: ReactNode
  /** Wat er is rechtgezet; alleen gezet als er iets is rechtgezet. */
  opmerking?: ReactNode
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onInput?: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) {
  const id = useId()
  const veldId = `${id}-veld`
  const meldingId = `${id}-melding`
  const gedeeld = {
    id: veldId,
    name: naam,
    required: verplicht,
    placeholder: voorbeeld,
    "aria-invalid": fout ? true : undefined,
    "aria-describedby": fout || opmerking ? meldingId : undefined,
    onBlur,
    onInput,
    className: `${VAK} ${fout ? VAK_FOUT : VAK_GOED}`,
  }
  return (
    <div data-element="Veld" data-veld={naam}>
      <label htmlFor={veldId} className="block text-[14px] font-semibold">
        {label}
        {optioneel && <span className="font-normal text-muted"> ({optioneel})</span>}
      </label>
      <div className="mt-[8px]">
        {regels ? (
          <textarea rows={regels} {...gedeeld} />
        ) : (
          <input type={type} autoComplete={autoComplete} inputMode={inputMode} {...gedeeld} />
        )}
      </div>
      {fout ? (
        <VeldMelding id={meldingId} soort="fout">
          {fout}
        </VeldMelding>
      ) : opmerking ? (
        <VeldMelding id={meldingId} soort="opmerking">
          {opmerking}
        </VeldMelding>
      ) : null}
    </div>
  )
}

type VeldStaat = { fout?: L; opmerking?: L }
type Invoer = HTMLInputElement | HTMLTextAreaElement

/**
 * De controle van een formulier met `Veld`en. Het ritme:
 *   · bij blur controleren, niet bij elke toets — en alleen als er in het
 *     veld getypt is (wie met Tab door een leeg veld loopt, krijgt nog
 *     geen fout; die komt bij versturen);
 *   · na een eerste fout bij elke invoer opnieuw, zodat de melding
 *     verdwijnt zodra het klopt;
 *   · bij blur kleine fouten rechtzetten (de waarde in het veld wordt de
 *     rechtgezette), met een opmerking die zegt wat er gebeurde;
 *   · bij versturen alles, waarna het formulier `focusEerste` aanroept.
 * Werkt op ongecontroleerde velden: de DOM houdt de waarde.
 */
export function useVeldControle<N extends string>(regels: Record<N, Regel>, t: (v: L) => string) {
  const [staat, setStaat] = useState<Partial<Record<N, VeldStaat>>>({})
  const aangeraakt = useRef(new Set<string>())

  // Een blur door een klik (op Verstuur, op een budgetpil) valt tussen
  // mousedown en click. Verscheen de melding meteen, dan schoof alles
  // eronder 28px op en landde de click naast de knop. Dus: is er een
  // wijzer ingedrukt, dan pas controleren nadat de klik voorbij is. Met
  // Tab blijft het meteen.
  const ingedrukt = useRef(false)
  useEffect(() => {
    const neer = () => (ingedrukt.current = true)
    const op = () => (ingedrukt.current = false)
    window.addEventListener("pointerdown", neer, true)
    window.addEventListener("pointerup", op, true)
    window.addEventListener("pointercancel", op, true)
    return () => {
      window.removeEventListener("pointerdown", neer, true)
      window.removeEventListener("pointerup", op, true)
      window.removeEventListener("pointercancel", op, true)
    }
  }, [])
  const naDeKlik = (doe: () => void) => {
    if (!ingedrukt.current) return doe()
    // pointerup, mouseup en click lopen in dezelfde taak; de timeout
    // valt daarna.
    window.addEventListener("pointerup", () => window.setTimeout(doe, 0), { once: true })
  }

  const toets = useCallback(
    (naam: N, el: Invoer, rechtzetten: boolean) => {
      const uit = regels[naam].controleer(el.value)
      if (rechtzetten && uit.waarde !== el.value) el.value = uit.waarde
      setStaat((oud) => ({
        ...oud,
        [naam]: {
          fout: uit.fout,
          // Bij blur: een eerdere opmerking blijft staan zolang het veld klopt.
          opmerking: rechtzetten ? (uit.opmerking ?? (uit.fout ? undefined : oud[naam]?.opmerking)) : undefined,
        },
      }))
    },
    [regels],
  )

  const veld = (naam: N) => {
    const s = staat[naam]
    return {
      naam,
      voorbeeld: t(regels[naam].voorbeeld),
      fout: s?.fout ? t(s.fout) : undefined,
      opmerking: s?.opmerking ? t(s.opmerking) : undefined,
      onBlur: (e: FocusEvent<Invoer>) => {
        if (!aangeraakt.current.has(naam) && !s?.fout) return
        const el = e.currentTarget
        naDeKlik(() => {
          // Is het formulier intussen verstuurd (en weg), dan niets meer.
          if (el.isConnected) toets(naam, el, true)
        })
      },
      onInput: (e: FormEvent<Invoer>) => {
        aangeraakt.current.add(naam)
        if (s?.fout) toets(naam, e.currentTarget, false)
        // De opmerking ging over de vorige waarde.
        else if (s?.opmerking) setStaat((oud) => ({ ...oud, [naam]: {} }))
      },
    }
  }

  /**
   * Controleert alle velden (en zet kleine fouten recht). Geeft de namen
   * terug die niet in orde zijn; het formulier voegt er eigen controles
   * aan toe en zet dan de focus met `focusEerste`.
   */
  const controleerAlles = (form: HTMLFormElement): Set<string> => {
    const fout = new Set<string>()
    const nieuw: Partial<Record<N, VeldStaat>> = {}
    for (const naam of Object.keys(regels) as N[]) {
      const el = form.elements.namedItem(naam)
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) continue
      const uit = regels[naam].controleer(el.value)
      if (uit.waarde !== el.value) el.value = uit.waarde
      // Een opmerking van de blur ervoor blijft staan zolang het veld klopt.
      nieuw[naam] = { fout: uit.fout, opmerking: uit.opmerking ?? (uit.fout ? undefined : staat[naam]?.opmerking) }
      if (uit.fout) fout.add(naam)
    }
    // Synchroon, zodat de foutregels al bestaan wanneer de focus landt en
    // een schermlezer ze via aria-describedby meeleest.
    flushSync(() => setStaat(nieuw))
    return fout
  }

  return { veld, controleerAlles }
}

/** Zet de focus op het eerste veld (in DOM-volgorde) waarvan de naam in `namen` staat. */
export function focusEerste(form: HTMLFormElement, namen: Set<string>) {
  for (const el of Array.from(form.elements)) {
    const naam = (el as HTMLInputElement).name
    if (naam && namen.has(naam) && el instanceof HTMLElement) {
      el.focus()
      return
    }
  }
}

export function KeuzePillen({
  legenda,
  naam,
  keuzes,
  gekozen,
  onKies,
  verplicht = false,
  fout,
  onOngeldig,
}: {
  legenda: ReactNode
  naam: string
  keuzes: { id: string; tekst: ReactNode }[]
  /** Het gekozen id; "" als er (nog) niets gekozen is. */
  gekozen: string
  onKies: (id: string) => void
  verplicht?: boolean
  /** De foutregel onder de pillen; alleen gezet als er iets mis is. */
  fout?: ReactNode
  /** De browser meldt dat de verplichte keuze ontbreekt. */
  onOngeldig?: () => void
}) {
  const foutId = `${naam}-fout`
  return (
    <fieldset data-element="KeuzePillen">
      <legend className="block text-[14px] font-semibold">{legenda}</legend>
      {/* Op de telefoon twee kolommen van gelijke breedte (eigenaar, 24 sep
          2026): een lange keuze breekt dan binnen zijn pil om in plaats van
          een eigen regel te nemen. Vanaf sm weer een rij die omloopt. */}
      <div className="mt-3 grid grid-cols-2 gap-[8px] sm:flex sm:flex-wrap">
        {keuzes.map((k) => (
          <label key={k.id} className="flex cursor-pointer sm:block">
            <input
              type="radio"
              name={naam}
              value={k.id}
              checked={gekozen === k.id}
              onChange={() => onKies(k.id)}
              required={verplicht}
              aria-describedby={fout ? foutId : undefined}
              onInvalid={onOngeldig}
              className="peer sr-only"
            />
            <span className="flex min-h-[44px] w-full items-center justify-center rounded-full border border-line/20 px-[14px] py-[8px] text-center text-[14px] leading-[1.3] transition-colors sm:inline-flex sm:w-auto sm:justify-start sm:px-[16px] sm:text-left peer-checked:border-gronn-forest peer-checked:bg-gronn-forest peer-checked:text-gronn-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)] dark:peer-checked:border-gronn-light dark:peer-checked:bg-gronn-light dark:peer-checked:text-gronn-forest">
              {k.tekst}
            </span>
          </label>
        ))}
      </div>
      {fout && (
        <p id={foutId} className="mt-[8px] text-[14px] font-semibold leading-[20px] text-[var(--ember-text)]">
          {fout}
        </p>
      )}
    </fieldset>
  )
}

/** Het verborgen honeypotveld: mensen zien het niet, bots vullen het in. */
export function Honingpot({ naam = "website" }: { naam?: string }) {
  return (
    <div aria-hidden className="absolute left-[-9999px]">
      <label>
        Website
        <input name={naam} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
