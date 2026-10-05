import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import type { Foto as FotoData, Video as VideoData } from "@/lib/data/vijverrenovatie"
import { volgende } from "./projecten"

// De bouwstenen van een projectpagina (WF-021, WF-030): één keer hier, zodat
// de vijver en het terras hetzelfde systeem delen. De opening is de gedeelde
// <Opening> uit src/components/wereld; hier staat wat daarna komt, in de taal
// van de voorpagina (kopregel, Syne-titels, blokken die zacht opkomen). De
// leeskolom zelf beweegt niet.

const volg = (n: number) => ({ "--i": n }) as CSSProperties

/** De fiche: korte feiten als labels onder een lijn. */
export function Fiche({ regels, kolommen }: { regels: [string, string][]; kolommen: string }) {
  return (
    <dl className={`m-0 mt-[clamp(48px,6vw,80px)] grid grid-cols-2 gap-x-6 border-t border-lijn ${kolommen}`}>
      {regels.map(([k, v], i) => (
        <div key={k} className="flex flex-col gap-1 py-3" data-zie style={volg(i % 6)}>
          <dt className="lbl text-gedempt">{k}</dt>
          <dd className="m-0 text-[15px] font-medium tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Sectiekop zoals op de voorpagina: lijn, label links, aantal rechts. */
export function Kopregel({ links, rechts, id }: { links: ReactNode; rechts?: ReactNode; id?: string }) {
  return (
    <div className="w-kopregel">
      <h2 id={id} className="lbl m-0">{links}</h2>
      {rechts ? <span className="lbl tabular-nums text-gedempt">{rechts}</span> : null}
    </div>
  )
}

/** De leeskolom: smal in het midden (3/6/3), op de telefoon de volle breedte. */
export function Lees({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-x-8 md:grid-cols-[3fr_6fr_3fr] ${className}`}>
      <div className="min-w-0 md:col-start-2">{children}</div>
    </div>
  )
}

export function Alineas({ teksten }: { teksten: readonly string[] }) {
  return (
    <>
      {teksten.map((t) => (
        <p key={t.slice(0, 40)} className="m-0 mb-[1.1em] text-[17px] leading-[1.7]">
          {t}
        </p>
      ))}
    </>
  )
}

export function Citaat({ tekst, bron }: { tekst: string; bron: string }) {
  return (
    <section aria-label="Citaat" className="w-sectie">
      <figure className="m-0 max-w-[1100px]" data-zie>
        <blockquote className="syne m-0 text-[clamp(30px,4.4vw,64px)] leading-[1.1] tracking-[-.03em]">
          <p className="m-0">“{tekst}”</p>
        </blockquote>
        <figcaption className="lbl mt-8 text-gedempt">{bron}</figcaption>
      </figure>
    </section>
  )
}

/** Bijschrift onder een beeld: fase en/of bijschrift uit de data. */
function Onderschrift({ foto }: { foto: FotoData }) {
  if (!foto.fase && !foto.bijschrift) return null
  return (
    <figcaption className="mt-3 flex flex-wrap gap-x-3 text-[13px] text-gedempt">
      {foto.fase ? <span className="lbl">{foto.fase}</span> : null}
      {foto.bijschrift ? <span>{foto.bijschrift}</span> : null}
    </figcaption>
  )
}

/**
 * Een foto in een vast vak waarin het beeld iets meebeweegt tijdens het
 * scrollen (parallax binnen het vak, dus nooit over de tekst heen). Het beeld
 * is 24 % hoger dan het vak; v=1 schuift het hooguit zo'n 12 %.
 */
export function Doorkijk({
  foto,
  sizes,
  className = "",
  v = 1,
  priority,
  eigen = true,
}: {
  foto: FotoData
  sizes: string
  className?: string
  v?: number
  priority?: boolean
  /** Het vak in de verhouding van de foto zelf; false = de className bepaalt de maat. */
  eigen?: boolean
}) {
  const vak = eigen ? { aspectRatio: `${foto.width} / ${foto.height}` } : undefined
  // Een beeld met label (AI-visualisatie) beweegt niet: het label moet altijd zichtbaar blijven.
  if (foto.label)
    return (
      <div className={className} style={vak}>
        <Foto foto={foto} sizes={sizes} priority={priority} className="h-full w-full" />
      </div>
    )
  return (
    <div className={`relative overflow-hidden bg-vlak ${className}`} style={vak}>
      <div className="absolute inset-x-0 -top-[12%] -bottom-[12%]" data-v={v}>
        <Foto foto={foto} sizes={sizes} priority={priority} className="h-full w-full" />
      </div>
    </div>
  )
}

/**
 * Een reeks beelden uit één hoofdstuk. Eén liggend beeld staat breed en
 * beweegt iets mee; één staand beeld half zo breed; een reeks staat naast
 * elkaar. Nooit bijgesneden: elke foto houdt zijn eigen verhouding (behalve
 * het brede parallaxbeeld, dat 24 % ruimte heeft om te bewegen).
 */
export function FotoReeks({ fotos }: { fotos: FotoData[] }) {
  if (fotos.length === 0) return null
  if (fotos.length === 1) {
    const f = fotos[0]
    const liggend = f.width > f.height
    if (liggend && !f.label) {
      return (
        <figure className="m-0" data-zie>
          <Doorkijk foto={f} sizes="(min-width: 1440px) 1328px, 100vw" className="w-full" v={1} />
          <Onderschrift foto={f} />
        </figure>
      )
    }
    return (
      <div className={liggend ? "w-full" : "w-full max-w-[560px]"} data-zie>
        <Figuur foto={f} sizes={liggend ? "(min-width: 1440px) 1328px, 100vw" : "(min-width: 768px) 560px, 100vw"} />
      </div>
    )
  }
  return (
    <div className={`grid grid-cols-2 items-start gap-3 md:gap-8 ${fotos.length === 3 ? "md:grid-cols-3" : ""}`}>
      {fotos.map((f, i) => (
        <div key={f.src} data-zie style={volg(i)} className={fotos.length === 3 && i === 2 ? "col-span-2 md:col-span-1" : ""}>
          <Figuur foto={f} sizes={fotos.length === 3 ? "(min-width: 768px) 33vw, 50vw" : "50vw"} />
        </div>
      ))}
    </div>
  )
}

/** Twee staande beelden verspringend naast elkaar, zoals de collage op de voorpagina. */
export function Paar({ fotos }: { fotos: FotoData[] }) {
  return (
    <div className="grid grid-cols-12 items-start gap-x-3 md:gap-x-8">
      {fotos.map((f, i) => (
        <figure
          key={f.src}
          className={`m-0 min-w-0 ${i % 2 === 0 ? "col-span-7 md:col-span-6 md:col-start-1" : "col-span-5 mt-[clamp(80px,16vw,280px)] md:col-span-5 md:col-start-8"}`}
          data-zie
          style={volg(i)}
        >
          <Doorkijk foto={f} sizes="(min-width: 768px) 45vw, 58vw" className="w-full" v={i % 2 === 0 ? 0.6 : 1.4} />
          <Onderschrift foto={f} />
        </figure>
      ))}
    </div>
  )
}

/** Eén beeld in zijn eigen verhouding, met bijschrift. */
export function Figuur({ foto, sizes, className = "" }: { foto: FotoData; sizes: string; className?: string }) {
  return (
    <figure className={`m-0 min-w-0 ${className}`}>
      <div style={{ aspectRatio: `${foto.width} / ${foto.height}` }}>
        <Foto foto={foto} sizes={sizes} className="h-full w-full" />
      </div>
      <Onderschrift foto={foto} />
    </figure>
  )
}

/**
 * Een korte clip zonder geluid. Speelt niet vanzelf: de bezoeker start hem
 * met de bediening. Zo is er geen beweging zonder vraag, en geen extra code.
 */
export function Clip({ video, className = "" }: { video: VideoData; className?: string }) {
  return (
    <figure className={`m-0 w-full max-w-[360px] ${className}`} data-zie>
      <video
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        aria-label={video.beschrijving}
        muted
        playsInline
        controls
        preload="none"
        className="block h-auto w-full bg-vlak"
      />
      {video.bijschrift ? <figcaption className="mt-3 text-[13px] text-gedempt">{video.bijschrift}</figcaption> : null}
    </figure>
  )
}

/** Een cijfer als moment: groot getal links, wat het is rechts. */
export function Cijfer({ getal, wat, uitleg }: { getal: string; wat: string; uitleg: string }) {
  return (
    <section aria-label={`${getal} ${wat}`} className="w-sectie">
      <div className="grid grid-cols-1 items-end gap-x-8 border-t border-lijn pt-3.5 md:grid-cols-12">
        <p aria-hidden="true" className="syne m-0 text-[clamp(120px,22vw,320px)] leading-[.85] tracking-[-.06em] tabular-nums md:col-span-7" data-zie>
          {getal}
        </p>
        <div className="mt-4 md:col-span-5 md:mt-0" data-zie style={volg(1)}>
          <p className="lbl m-0">{wat}</p>
          <p className="mt-2 mb-0 text-gedempt">{uitleg}</p>
        </div>
      </div>
    </section>
  )
}

/** Slot: kop, tekst en de weg naar een kennismaking als tekstlink. */
export function Slot({ kop, alineas, knop }: { kop: string; alineas: readonly string[]; knop: string }) {
  return (
    <section aria-labelledby="slot-kop" className="w-sectie">
      <div className="w-kopregel">
        <p className="lbl m-0">Tot slot</p>
      </div>
      <h2 id="slot-kop" className="w-titel syne max-w-[16ch]" data-zie>
        {kop}
      </h2>
      <Lees className="mt-[clamp(32px,4vw,56px)]">
        <Alineas teksten={alineas} />
        <Link href="/kennismaken" className="lnk w-lijnlink mt-4 inline-block">
          {knop} →
        </Link>
      </Lees>
    </section>
  )
}

/** Het volgende project, groot en met zijn beeld. */
export function Volgende({ hier }: { hier: string }) {
  const p = volgende(hier)
  return (
    <section aria-label="Volgend project" className="w-sectie">
      <div className="w-kopregel">
        <p className="lbl m-0">Volgend project</p>
        <span className="lbl tabular-nums text-gedempt">{p.code}</span>
      </div>
      <Link href={p.href} className="group grid grid-cols-1 items-end gap-x-8 gap-y-6 no-underline md:grid-cols-12" data-zie>
        <span className="syne min-w-0 text-[clamp(36px,5vw,72px)] leading-[1] tracking-[-.035em] [overflow-wrap:anywhere] md:col-span-7">
          <span className="w-lijnlink">{p.naam}</span> →
        </span>
        <Doorkijk foto={p.foto} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/3] w-full md:col-span-5" eigen={false} />
      </Link>
    </section>
  )
}
