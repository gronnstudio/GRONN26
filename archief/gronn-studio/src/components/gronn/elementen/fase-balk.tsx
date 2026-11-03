import { pick, type L, type Locale } from "@/lib/i18n"

import { StatusStip } from "./status"
import { gedempt, type Toon } from "./toon"

export type Fase = { label: L; noot?: L }

type Stand = "gedaan" | "nu" | "straks"

const STAND_TEKST: Record<Stand, L> = {
  gedaan: { nl: "afgerond", en: "completed" },
  nu: { nl: "huidige fase", en: "current phase" },
  straks: { nl: "nog niet begonnen", en: "not started yet" },
}

/**
 * Qi's "progress bar", zonder percentages: waar een project staat, in
 * fasen. Een `<ol>`; de huidige fase draagt `aria-current="step"` en de
 * oranje stip van `Status`. Vakken tot en met de huidige fase zijn gevuld.
 * `klaar`: alles gevuld en géén `aria-current` — er is geen fase meer "nu".
 *
 * Elk vak zegt zijn stand ook in tekst (`sr-only`), want een gevuld vlak
 * hoort een schermlezer niet. Onder 400px containerbreedte staan de
 * vakken 2 × 2, daarboven op één rij.
 *
 * `beweeg`: de vakken vullen na elkaar als de balk in beeld schuift
 * (view(), zie "FaseBalk" in globals.css). Boven de vouw `beweeg={false}`:
 * daar zou een half gevulde balk blijven staan tot iemand scrolt, en een
 * halve balk vertelt iets wat niet waar is.
 */
export function FaseBalk({
  fasen,
  huidig = 0,
  klaar = false,
  locale,
  toon = "grond",
  beweeg = true,
  className = "",
}: {
  fasen: Fase[]
  /** Index van de huidige fase; telt niet als `klaar`. */
  huidig?: number
  klaar?: boolean
  locale: Locale
  toon?: Toon
  beweeg?: boolean
  className?: string
}) {
  const t = (v: L) => pick(v, locale)
  const stand = (i: number): Stand => (klaar || i < huidig ? "gedaan" : i === huidig ? "nu" : "straks")
  const tekst = toon === "bos" ? "text-gronn-white" : "text-foreground"
  return (
    <div data-element="FaseBalk" className={`@container ${className}`}>
      <ol
        aria-label={t({ nl: "Projectfasen", en: "Project phases" })}
        data-fasebalk={klaar ? "klaar" : "bezig"}
        className={`g-fasebalk ${beweeg ? "g-fasebalk-beweeg" : ""} ${toon === "bos" ? "g-fasebalk-bos" : ""} grid grid-cols-2 gap-x-[12px] gap-y-[20px] @min-[400px]:grid-cols-4`}
      >
        {fasen.map((f, i) => {
          const s = stand(i)
          return (
            <li key={i} data-fase={s} aria-current={s === "nu" ? "step" : undefined} style={{ ["--i" as string]: i }} className="min-w-0">
              <span aria-hidden className="g-fase-spoor block h-[4px] overflow-hidden rounded-full">
                {s !== "straks" && <span className="g-fase-vul block h-full rounded-full" />}
              </span>
              <span className={`mt-[10px] flex items-center gap-[8px] tekst-annotatie ${s === "straks" ? gedempt(toon) : tekst} ${s === "nu" ? "font-semibold" : ""}`}>
                {s === "nu" && <StatusStip />}
                <span className="min-w-0 break-words">{t(f.label)}</span>
                <span className="sr-only">({t(STAND_TEKST[s])})</span>
              </span>
              {f.noot && <span className={`mt-[2px] block font-mono text-[12px] leading-[18px] ${gedempt(toon)}`}>{t(f.noot)}</span>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
