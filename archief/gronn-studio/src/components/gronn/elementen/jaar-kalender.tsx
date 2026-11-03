"use client"

import { SEIZOEN, type Maand } from "@/lib/data/seizoen"
import type { Locale } from "@/lib/i18n"
import { useKlok } from "@/lib/use-klok"
import { cn } from "@/lib/utils"

import { Status } from "./status"

const MAANDEN = Object.keys(SEIZOEN).map(Number) as Maand[]

/** "januari" → "Januari"; de maandnaam komt uit Intl, niet uit een eigen lijst. */
function maandNaam(m: Maand, locale: Locale) {
  const naam = new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, m - 1, 15))
  )
  return naam.charAt(0).toUpperCase() + naam.slice(1)
}

/** De regel zonder het maandvoorvoegsel ("sep · bollen planten" → "bollen planten"). */
function regel(m: Maand, locale: Locale) {
  const zin = SEIZOEN[m]?.[locale]
  if (!zin) return null
  const i = zin.indexOf(" · ")
  return i === -1 ? zin : zin.slice(i + 3)
}

/**
 * Het jaar van de tuinkalender: de twaalf regels uit `SEIZOEN`, één kaart
 * per maand (16px). De maand van de bezoeker (zijn eigen klok, `useKlok`)
 * krijgt het vlak, `aria-current="date"` en de oranje `Status` "Deze
 * maand" — het ene accent. De server kent die klok niet, dus de eerste
 * render heeft geen markering. Een maand op `null` toont een streepje.
 */
export function JaarKalender({ locale }: { locale: Locale }) {
  const nu = useKlok()
  const deze = nu ? ((nu.getMonth() + 1) as Maand) : null
  return (
    <ol data-element="JaarKalender" className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
      {MAANDEN.map((m) => {
        const huidig = m === deze
        return (
          <li
            key={m}
            data-maand={m}
            aria-current={huidig ? "date" : undefined}
            className={cn(
              "flex min-h-[132px] flex-col gap-[8px] rounded-[16px] border p-[20px]",
              huidig ? "border-line/40 bg-surface" : "border-line/15"
            )}
          >
            <div className="flex min-h-[18px] items-center justify-between gap-[12px]">
              <span aria-hidden className="tekst-annotatie tabular-nums text-muted">
                {String(m).padStart(2, "0")}
              </span>
              {huidig && (
                <span className="tekst-annotatie uppercase">
                  <Status>{locale === "nl" ? "Deze maand" : "This month"}</Status>
                </span>
              )}
            </div>
            <h3 className="tekst-h3">{maandNaam(m, locale)}</h3>
            <p className="tekst-body text-foreground/80">{regel(m, locale) ?? "—"}</p>
          </li>
        )
      })}
    </ol>
  )
}
