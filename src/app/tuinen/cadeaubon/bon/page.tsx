import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { Achterkant, BonKaart, Voorkant } from "@/components/cadeaubon/kaart"
import { Print } from "@/components/cadeaubon/print"
import { datumLang } from "@/lib/data/cadeaubon"
import { leesStand } from "@/lib/beheer/stand"
import { haalBetaling } from "@/lib/mollie"

export const metadata: Metadata = {
  title: "Je cadeaubon",
  robots: { index: false, follow: false },
}

// Hierheen stuurt Mollie de koper. Deze pagina ís de bon: het adres bevat een
// willekeurige id, dus alleen wie de link heeft, ziet hem. De status vragen we
// zelf aan Mollie, want de webhook kan net later zijn dan de koper.
export default async function Bon({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const id = (await searchParams).b
  const bon = id ? (await leesStand()).bonnen.find((x) => x.id === id) : undefined
  const betaling = bon?.mollie && bon.status !== "betaald" ? await haalBetaling(bon.mollie) : null
  const betaald = bon?.status === "betaald" || betaling?.status === "paid"
  const bezig = !betaald && betaling && ["open", "pending", "authorized"].includes(betaling.status)

  if (!bon || !betaald) {
    return (
      <>
        <Opening
          label={{ nl: "Cadeaubon", en: "Gift card" }}
          titel={bezig ? { nl: "Even wachten", en: "Hold on" } : { nl: "Niet betaald", en: "Not paid" }}
          zin={bezig ? "Je betaling wordt nog verwerkt. Ververs deze pagina over een minuut; dan staat je bon hier." : "De betaling is niet gelukt of afgebroken. Er is niets afgeschreven."}
        />
        <div className="wrap mt-[clamp(48px,6vw,96px)]">
          <Link href="/tuinen/cadeaubon" className="knop bg-oranje text-antraciet">{bezig ? "Naar de cadeaubon" : "Opnieuw proberen →"}</Link>
        </div>
      </>
    )
  }

  const gegevens = { bedrag: bon.bedrag, voor: bon.voor, van: bon.van, boodschap: bon.boodschap, nummer: bon.nummer, geldigTot: datumLang(bon.geldigTot) }
  return (
    <>
      <Opening
        label={{ nl: `Cadeaubon · ${bon.nummer}`, en: `Gift card · ${bon.nummer}` }}
        titel={{ nl: "Je bon is klaar!", en: "Your gift card is ready!" }}
        zin={`Dank je wel, ${bon.naam.split(" ")[0]}. Print hem, bewaar hem als pdf, of stuur de link van deze pagina door naar ${bon.voor}.`}
      />
      <div className="wrap mt-[clamp(48px,6vw,96px)] grid items-start gap-[clamp(40px,6vw,88px)] lg:grid-cols-[1.1fr_1fr]">
        <BonKaart {...gegevens} />
        <div className="grid gap-5">
          <p className="m-0 text-[17px] leading-[1.55]">
            Bonnummer <b className="tabular-nums">{bon.nummer}</b>, geldig tot en met {gegevens.geldigTot}. Bewaar deze pagina: de link is de bon.
          </p>
          <Print />
          <p className="m-0 text-[14px] leading-[1.55] text-gedempt">Inwisselen: app een foto van de vijver of tuin naar 06 18 11 80 14 en noem het bonnummer.</p>
        </div>
      </div>
      <div className="bk-print" aria-hidden="true">
        <div><Voorkant bedrag={bon.bedrag} voor={bon.voor} /></div>
        <div><Achterkant {...gegevens} /></div>
      </div>
    </>
  )
}
