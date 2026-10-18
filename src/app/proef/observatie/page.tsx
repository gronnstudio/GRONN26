import type { Metadata } from "next"
import { Opening } from "@/components/wereld/opening"
import { T } from "@/components/taal"
import { ObservatieFoto } from "@/components/observatie/observatie"
import { WATERVAL } from "@/lib/data/observaties"

// Proefpagina (18 okt 2026): de observatiekaders los bekeken, op een
// telefoon en op een groot scherm, voordat ze ergens op de site komen.
// Niet in de sitemap, niet in zoekmachines.
export const metadata: Metadata = {
  title: "Proef: observatiekaders",
  robots: { index: false, follow: false },
}

export default function ProefObservatie() {
  return (
    <>
      <Opening
        label={{ nl: "Proef", en: "Prototype" }}
        titel={{ nl: "Wat ik zie", en: "What I see" }}
        zin={
          <T
            t={{
              nl: "Een vijver vertelt veel, als je weet waar je moet kijken. Dit is wat mij opvalt bij de waterval van het eerste project.",
              en: "A pond tells you a lot, once you know where to look. This is what I notice at the waterfall of the first project.",
            }}
          />
        }
      />
      <div className="wrap max-w-[1000px] pb-20">
        <ObservatieFoto obs={WATERVAL} />
      </div>
    </>
  )
}
