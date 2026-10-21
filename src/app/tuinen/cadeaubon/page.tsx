import type { Metadata } from "next"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { BON_JAREN } from "@/lib/data/cadeaubon"
import { opslagAan } from "@/lib/beheer/stand"
import { mollieAan } from "@/lib/mollie"
import { BonFormulier } from "./formulier"

export const metadata: Metadata = {
  title: "Cadeaubon",
  description: "Een cadeaubon van GRØNN Studio voor een vijver, een tuin of een border in Stein en omgeving. Direct online te koop, met eigen bonnummer.",
  alternates: { canonical: "/tuinen/cadeaubon" },
}

// De cadeaubon in de shop (eigenaar, 21 okt 2026). Alleen in het Nederlands, net
// als de bon zelf: wie hem krijgt, woont in Stein en omgeving.
export default function Cadeaubon() {
  return (
    <>
      <Opening
        label={{ nl: "Shop · cadeaubon", en: "Shop · gift card" }}
        titel={{ nl: "Cadeaubon", en: "Gift card" }}
        zin={<T t={{ nl: "Geef een vijverbeurt, een voorjaarsbeurt of een nieuwe border cadeau. Kies het bedrag, zet erop voor wie en van wie, en draai de kaart om te zien wat je geeft.", en: "Give a pond service, a spring tidy-up or a new border. Choose the amount, add who it’s for and from, and turn the card to see what you give." }} />}
      />
      <div className="wrap mt-[clamp(48px,6vw,96px)]">
        <BonFormulier online={mollieAan() && opslagAan()} />
        <p className="mt-[clamp(48px,6vw,80px)] mb-0 max-w-[70ch] text-[14px] leading-[1.55] text-gedempt">
          Te besteden aan elk werk van GRØNN Studio in Stein en omgeving: vijveronderhoud, een voorjaars- of najaarsbeurt, een borderpakket of een ontwerp. {BON_JAREN} jaar geldig, niet in te wisselen voor geld. Is het werk duurder, dan betaal je het verschil bij.
        </p>
      </div>
    </>
  )
}
