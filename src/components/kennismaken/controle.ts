import { useCallback, useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react"
import { flushSync } from "react-dom"

import type { L } from "@/lib/i18n"
import type { Regel } from "./invulvelden"

// De veldcontrole van het contactformulier, letterlijk overgenomen uit de
// oude site (src/components/gronn/elementen/formulier.tsx).

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

