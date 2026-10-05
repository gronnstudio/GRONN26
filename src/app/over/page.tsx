import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { Stappen } from "@/components/stappen"
import { Einde } from "@/components/over/einde"
import { PaginaKop } from "@/components/over/pagina-kop"
import { PORTRET } from "@/components/over/portret"
import { OVER_MIJ } from "@/lib/data/teksten"

// WF-022: Nicks eigen tekst, letterlijk; het portret blijft staan terwijl de
// tekst langs loopt (de ene sticky op deze pagina).
export const metadata: Metadata = {
  title: "Over mij",
  description: OVER_MIJ[0].nl,
}

export default function Over() {
  return (
    <div className="wrap">
      <PaginaKop label="Hovenier en ecologisch ontwerper" titel="Over mij" />

      <section aria-label="Het verhaal van Nick" className="mt-[clamp(48px,6vw,96px)] grid items-start gap-y-8 md:grid-cols-[5fr_1fr_6fr]">
        <figure className="m-0 flex w-3/4 flex-col gap-3 md:sticky md:top-6 md:w-auto">
          <Foto foto={PORTRET} priority sizes="(min-width: 768px) 40vw, 75vw" className="aspect-[4/5]" />
          <figcaption className="lbl text-gedempt">Nick Peters · GRØNN Studio</figcaption>
        </figure>
        <div className="md:col-start-3">
          {OVER_MIJ.map((alinea, i) => (
            <p
              key={i}
              className={`mt-0 mb-[1.2em] ${i === 0 ? "text-[clamp(20px,1.8vw,26px)] leading-[1.45]" : "text-[clamp(16px,1.2vw,18px)] leading-[1.7]"}`}
            >
              {alinea.nl}
            </p>
          ))}
        </div>
      </section>

      <section aria-labelledby="stappen-kop" className="sectie">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="stappen-kop" className="lbl m-0 font-normal text-gedempt">Zo werk ik</h2>
          <Link href="/" className="lnk">Ook op de voorpagina →</Link>
        </div>
        <Stappen />
      </section>

      <Einde />
    </div>
  )
}
