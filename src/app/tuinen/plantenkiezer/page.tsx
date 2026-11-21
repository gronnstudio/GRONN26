import type { Metadata } from "next"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Plantenkiezer } from "./kiezer"

export const metadata: Metadata = {
  title: "Plantenkiezer",
  description: "Vier vragen over je plek, en je ziet welke border past: de planten op jouw maat, wanneer ze bloeien en wat het kost. Stein en omgeving.",
  alternates: { canonical: "/tuinen/plantenkiezer" },
}

// Plantenkiezer (eigenaar, 21 nov 2026: "ik wil ook zon tool als hun!", na de
// beplantingstool van Tuindirigent). Regels en bloeimaanden in
// src/lib/data/plantenkiezer.ts; de planten komen uit de borderpakketten.
export default function PlantenkiezerPagina() {
  return (
    <>
      <Opening
        label={{ nl: "Tuinen · plantenkiezer", en: "Gardens · plant picker" }}
        titel={{ nl: "Planten-\nkiezer", en: "Plant\npicker" }}
        zin={
          <T
            t={{
              nl: "Vier vragen over je plek. Dan zie je welke border past, hoeveel planten je nodig hebt, wanneer ze bloeien en wat het kost.",
              en: "Four questions about your spot. Then you see which border fits, how many plants you need, when they flower and what it costs.",
            }}
          />
        }
      />
      <div className="wrap mt-[clamp(56px,7vw,112px)] mb-[clamp(72px,9vw,140px)]">
        <Plantenkiezer />
      </div>
    </>
  )
}
