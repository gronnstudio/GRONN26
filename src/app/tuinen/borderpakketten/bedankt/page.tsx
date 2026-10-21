import type { Metadata } from "next"
import Link from "next/link"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { leesStand } from "@/lib/beheer/stand"
import { haalBetaling } from "@/lib/mollie"
import { priceLabel } from "@/lib/format"

export const metadata: Metadata = {
  title: "Bestelling",
  robots: { index: false, follow: false },
}

// Hierheen stuurt Mollie de bezoeker na het betalen. De status vragen we
// zelf aan Mollie, want de webhook kan net later zijn dan de bezoeker.
export default async function Bedankt({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const id = (await searchParams).b
  const bestelling = id ? (await leesStand()).bestellingen.find((x) => x.id === id) : undefined
  const betaling = bestelling?.mollie ? await haalBetaling(bestelling.mollie) : null
  const betaald = betaling?.status === "paid" || bestelling?.status === "betaald"
  const bezig = betaling && ["open", "pending", "authorized"].includes(betaling.status)
  const pakket = BORDERPAKKETTEN.find((p) => p.slug === bestelling?.pakket)
  return (
    <>
      <Opening
        label={{ nl: "Borderpakketten", en: "Border packages" }}
        titel={betaald ? { nl: "Bedankt!", en: "Thank you!" } : bezig ? { nl: "Even wachten", en: "Hold on" } : { nl: "Niet betaald", en: "Not paid" }}
        zin={
          <T
            t={
              betaald
                ? { nl: "Je betaling is binnen. Ik neem binnen twee werkdagen contact met je op over de levering of de plantdag.", en: "Your payment has arrived. I’ll be in touch within two working days about delivery or the planting day." }
                : bezig
                  ? { nl: "Je betaling wordt nog verwerkt. Zodra hij binnen is, hoor je van me.", en: "Your payment is still being processed. Once it arrives, you’ll hear from me." }
                  : { nl: "De betaling is niet gelukt of afgebroken. Er is niets afgeschreven.", en: "The payment didn’t go through or was cancelled. Nothing was charged." }
            }
          />
        }
      />
      <div className="wrap mt-[clamp(48px,6vw,96px)]">
        {bestelling && pakket && (
          <p className="m-0 text-[17px] tabular-nums">
            <T t={pakket.naam} /> · {bestelling.maat} m² · <T t={bestelling.soort === "aangeplant" ? { nl: "aangeplant", en: "planted" } : { nl: "opgestuurd", en: "shipped" }} /> · {priceLabel(bestelling.bedrag)}
          </p>
        )}
        <p className="mt-6 mb-0">
          {betaald || bezig ? (
            <Link href="/tuinen/borderpakketten" className="lnk"><T t={{ nl: "← Terug naar de borderpakketten", en: "← Back to the border packages" }} /></Link>
          ) : (
            <Link href={`/tuinen/borderpakketten/bestellen${pakket ? `?pakket=${pakket.slug}` : ""}`} className="knop bg-oranje text-antraciet">
              <T t={{ nl: "Opnieuw proberen →", en: "Try again →" }} />
            </Link>
          )}
        </p>
      </div>
    </>
  )
}
