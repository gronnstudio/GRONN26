import type { Metadata } from "next"
import { Foto } from "@/components/foto"
import { Verder } from "@/components/wereld/verder"
import { PORTRET } from "@/components/over/portret"
import { Werkwijze } from "@/components/voorpagina/werkwijze"
import "@/components/voorpagina/voorpagina.css"
import { Opening } from "@/components/wereld/opening"
import { Oplichten } from "@/components/wereld/oplichten"
import { OVER_MIJ } from "@/lib/data/teksten"

// Over mij in de taal van de voorpagina: donkere opening met het portret
// als groeiende foto, Nicks eigen tekst letterlijk (de eerste alinea licht
// op, de rest rustig leesbaar), Zo werk ik als het raster van de voorpagina
// en het bosgroene Kennismaken-vlak.
export const metadata: Metadata = {
  title: "Over mij",
  description: OVER_MIJ[0].nl,
}

export default function Over() {
  const [eerste, ...rest] = OVER_MIJ
  return (
    <>
      <Opening label="Hovenier en ecologisch ontwerper" titel="Over mij">
        {/* Het portret staat rechtop; daarom een eigen kader (3:2, op de
            telefoon 4:5) met het gezicht in beeld, in plaats van 16:9. */}
        <figure className="w-groei m-0" data-groei>
          <Foto
            foto={PORTRET}
            priority
            sizes="100vw"
            className="aspect-[4/5] md:aspect-[3/2] [&_img]:object-[50%_30%]"
          />
          <figcaption className="lbl mt-4 text-[#a9a8a3]">Nick Peters · GRØNN Studio</figcaption>
        </figure>
      </Opening>

      <section aria-labelledby="h-verhaal" className="wrap w-sectie">
        <div className="w-kopregel">
          <h2 id="h-verhaal" className="lbl m-0 font-normal">Nick Peters</h2>
          <span className="lbl text-gedempt">GRØNN Studio</span>
        </div>
        {/* het hele verhaal licht woord voor woord op (eigenaar, 5 okt 2026: "ga alle teksten na") */}
        <Oplichten tekst={eerste.nl} className="m-0" />
        <div className="mt-[clamp(40px,5vw,72px)] grid md:grid-cols-[5fr_7fr] md:gap-x-8">
          {/* de lege kolom krijgt een echte foto uit de moestuin (van de oude Studio-pagina) */}
          <figure className="m-0 mb-10 md:sticky md:top-[12vh] md:mb-0 md:self-start" data-zie>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/studio/moestuin/M01.jpg"
              alt="Nick gehurkt in de moestuin, lachend, met een handvol pas gerooide aardappels."
              loading="lazy"
              className="aspect-[4/5] w-full object-cover md:max-w-[440px]"
            />
            <figcaption className="lbl mt-3 text-gedempt">In de moestuin</figcaption>
          </figure>
          <div>
            {rest.map((alinea, i) => (
              <Oplichten key={i} tekst={alinea.nl} className="m-0 mb-[1.2em] text-[clamp(18px,1.5vw,24px)]" />
            ))}
          </div>
        </div>
      </section>

      <div className="vp-wortel">
        <Werkwijze />
      </div>

      <Verder voor="Zullen we" nadruk="kennismaken" na="?" href="/kennismaken" label="Naar Kennismaken" />
    </>
  )
}
