import Link from "next/link"
import { Foto } from "@/components/foto"
import type { Foto as FotoData, Video as VideoData } from "@/lib/data/vijverrenovatie"
import { volgende } from "./projecten"

// De bouwstenen van een projectpagina (WF-021, WF-030): één keer hier, zodat
// de vijver en het terras hetzelfde systeem delen.

/** Het grote beeld bovenaan, bijna schermvullend, over de volle breedte. */
export function Held({ foto }: { foto: FotoData }) {
  return <Foto foto={foto} priority sizes="100vw" className="h-[clamp(420px,72vh,820px)] w-full" />
}

export function Titel({ label, titel, ondertitel }: { label: string; titel: string; ondertitel: string }) {
  return (
    <header className="grid grid-cols-1 gap-x-8 pt-[clamp(48px,6vw,96px)] md:grid-cols-[3fr_9fr]">
      <p className="lbl m-0 text-gedempt">{label}</p>
      <h1 className="syne mt-4 mb-0 text-[clamp(40px,6vw,88px)] leading-none tracking-[-.035em] [overflow-wrap:anywhere] md:col-start-2 md:mt-0">
        {titel}
      </h1>
      <p className="mt-6 mb-0 max-w-[40ch] text-[clamp(18px,1.6vw,22px)] leading-normal text-gedempt md:col-start-2">{ondertitel}</p>
    </header>
  )
}

/** De fiche: korte feiten als mono-labels onder een lijn. */
export function Fiche({ regels, kolommen }: { regels: [string, string][]; kolommen: string }) {
  return (
    <dl className={`lbl m-0 mt-[clamp(48px,6vw,80px)] grid grid-cols-2 gap-x-6 border-t border-lijn ${kolommen}`}>
      {regels.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 py-3">
          <dt className="text-gedempt">{k}</dt>
          <dd className="m-0">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** De leeskolom: smal in het midden (3/6/3), op de telefoon de volle breedte. */
export function Lees({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
        <p key={t.slice(0, 40)} className="m-0 mb-[1.1em] leading-[1.7]">
          {t}
        </p>
      ))}
    </>
  )
}

export function Citaat({ tekst, bron }: { tekst: string; bron: string }) {
  return (
    <Lees className="sectie">
      <figure className="m-0">
        <blockquote className="syne m-0 text-[clamp(24px,2.6vw,36px)] leading-[1.25] tracking-[-.015em]">
          <p className="m-0">“{tekst}”</p>
        </blockquote>
        <figcaption className="lbl mt-6 text-gedempt">{bron}</figcaption>
      </figure>
    </Lees>
  )
}

/** Bijschrift onder een beeld: fase en/of bijschrift uit de data. */
function Onderschrift({ foto }: { foto: FotoData }) {
  if (!foto.fase && !foto.bijschrift) return null
  return (
    <figcaption className="lbl mt-3 flex flex-wrap gap-x-3 normal-case text-gedempt">
      {foto.fase ? <span className="uppercase">{foto.fase}</span> : null}
      {foto.bijschrift ? <span>{foto.bijschrift}</span> : null}
    </figcaption>
  )
}

/**
 * Een reeks beelden uit één hoofdstuk. Eén liggend beeld staat breed, één
 * staand beeld half zo breed; een reeks staat naast elkaar. Nooit
 * bijgesneden: elke foto houdt zijn eigen verhouding.
 */
export function FotoReeks({ fotos }: { fotos: FotoData[] }) {
  if (fotos.length === 0) return null
  if (fotos.length === 1) {
    const f = fotos[0]
    const liggend = f.width > f.height
    return (
      <div className={liggend ? "w-full" : "w-full max-w-[560px]"}>
        <Figuur foto={f} sizes={liggend ? "(min-width: 1440px) 1328px, 100vw" : "(min-width: 768px) 560px, 100vw"} />
      </div>
    )
  }
  return (
    <div className={`grid grid-cols-2 items-start gap-3 md:gap-8 ${fotos.length === 3 ? "md:grid-cols-3" : ""}`}>
      {fotos.map((f, i) => (
        <Figuur
          key={f.src}
          foto={f}
          className={fotos.length === 3 && i === 2 ? "col-span-2 md:col-span-1" : ""}
          sizes={fotos.length === 3 ? "(min-width: 768px) 33vw, 50vw" : "50vw"}
        />
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
    <figure className={`m-0 w-full max-w-[360px] ${className}`}>
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
      {video.bijschrift ? <figcaption className="lbl mt-3 normal-case text-gedempt">{video.bijschrift}</figcaption> : null}
    </figure>
  )
}

/** Een cijfer als moment: groot getal links, wat het is rechts. */
export function Cijfer({ getal, wat, uitleg }: { getal: string; wat: string; uitleg: string }) {
  return (
    <section aria-label={`${getal} ${wat}`} className="sectie">
      <div className="grid grid-cols-1 items-end gap-x-8 border-t border-lijn pt-3.5 md:grid-cols-12">
        <p aria-hidden="true" className="syne m-0 text-[clamp(96px,18vw,260px)] leading-[.85] tracking-[-.06em] md:col-span-7">
          {getal}
        </p>
        <div className="mt-4 md:col-span-5 md:mt-0">
          <p className="lbl m-0">{wat}</p>
          <p className="mt-2 mb-0 text-gedempt">{uitleg}</p>
        </div>
      </div>
    </section>
  )
}

/** Slot: kop, tekst en de weg naar een kennismaking (als tekstlink, het oranje zit al in het menu). */
export function Slot({ kop, alineas, knop }: { kop: string; alineas: readonly string[]; knop: string }) {
  return (
    <section aria-labelledby="slot-kop" className="sectie">
      <h2 id="slot-kop" className="syne m-0 max-w-[16ch] text-[clamp(36px,5vw,72px)] leading-[1.02] tracking-[-.03em]">
        {kop}
      </h2>
      <Lees className="mt-[clamp(32px,4vw,56px)]">
        <Alineas teksten={alineas} />
        <Link href="/kennismaken" className="lnk mt-4 inline-block">
          {knop} →
        </Link>
      </Lees>
    </section>
  )
}

export function Volgende({ hier }: { hier: string }) {
  const p = volgende(hier)
  return (
    <Link
      href={p.href}
      className="mt-[clamp(96px,12vw,180px)] flex flex-wrap items-baseline justify-between gap-4 border-t border-lijn pt-4 no-underline"
    >
      <span className="lbl">Volgend project</span>
      <span className="syne text-[clamp(24px,3vw,40px)]">{p.naam} →</span>
    </Link>
  )
}
