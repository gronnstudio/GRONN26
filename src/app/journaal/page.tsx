import type { Metadata } from "next"
import Link from "next/link"
import { Kruimelpad } from "@/components/kruimelpad"
import { Verder } from "@/components/wereld/verder"
import { Foto } from "@/components/foto"
import { STUKKEN, THEMAS, datumTekst, nummer, seizoen, type Stuk } from "@/lib/data/blog"

export const metadata: Metadata = {
  title: "Journaal",
  description: "Praktische stukken over vijvers en natuurlijke tuinen bij het seizoen, uit Stein en omgeving.",
  alternates: { canonical: "/journaal" },
}

const LINK = "group block text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt"
const TITEL_HOVER = "transition-colors group-hover:text-oranje-tekst"

function Meta({ s }: { s: Stuk }) {
  return (
    <p className="lbl m-0 text-gedempt">
      <time dateTime={s.datum}>{datumTekst(s.datum)}</time> · {s.leestijd} min lezen
    </p>
  )
}

// Het Journaal als tijdschrift (eigenaar, 22 okt 2026: "magazine waardig",
// naam gekozen: Journaal). Een naambord met seizoen, het nieuwste stuk als
// coververhaal, daaronder alle stukken per thema met nummers en "Direct
// naar"-ankers (kennis per thema, niet per datum). Alles in de breedte van
// de site.
export default function JournaalPagina() {
  const [cover] = STUKKEN
  const groepen = THEMAS.map((t) => ({ thema: t, stukken: STUKKEN.filter((s) => s.rubriek === t) })).filter((g) => g.stukken.length)
  const staand = cover ? cover.beeld.height > cover.beeld.width : false
  return (
    <>
      <header className="wrap pt-[clamp(120px,14vw,200px)]">
        <Kruimelpad />
        <div className="mt-[clamp(20px,2.5vw,36px)] flex flex-wrap justify-between gap-x-6 gap-y-1 border-t-2 border-inkt pt-3">
          <p className="lbl m-0">{cover ? seizoen(cover.datum) : null} · Stein en omgeving</p>
          <p className="lbl m-0 text-gedempt">Twee keer per maand</p>
        </div>
        <h1 id="pagina-titel" tabIndex={-1} className="syne m-0 mt-[clamp(8px,1.5vw,20px)] text-[clamp(60px,12.5vw,176px)] leading-[.88] tracking-[-.045em]">Journaal</h1>
        <div className="mt-[clamp(16px,2vw,28px)] grid gap-y-3 border-y border-lijn py-4 md:grid-cols-12 md:items-baseline md:gap-x-8">
          <p className="m-0 max-w-[52ch] text-[clamp(16px,1.3vw,19px)] leading-[1.5] md:col-span-8">
            Uit de vijver en de tuin: wat ik zie, wat ik doe en wat jij nu kunt doen. Met foto&apos;s van mijn eigen werk.
          </p>
          <p className="lbl m-0 text-gedempt md:col-span-4 md:text-right">Tekst en beeld: Nick Peters</p>
        </div>
      </header>

      {cover ? (
        <div className="wrap mt-[clamp(32px,4vw,64px)]">
          <Link href={`/journaal/${cover.slug}`} className={LINK}>
            {staand ? (
              // staande foto: zoals een omslag, titel links groot, beeld rechts
              <article className="grid gap-y-6 md:grid-cols-12 md:items-end md:gap-x-8">
                <div className="md:col-span-7 md:pb-2">
                  <p className="lbl m-0 text-oranje-tekst">Coververhaal · {cover.rubriek}</p>
                  <h2 className={`syne m-0 mt-4 text-[clamp(36px,5vw,76px)] leading-[1.02] tracking-[-.03em] ${TITEL_HOVER}`}>{cover.titel}</h2>
                  <p className="m-0 mt-5 max-w-[44ch] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-gedempt">{cover.beschrijving}</p>
                  <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                    <Meta s={cover} />
                    <p className="lbl m-0">Lees verder →</p>
                  </div>
                </div>
                <div className="aspect-[4/5] md:col-span-5">
                  <Foto foto={cover.beeld} priority sizes="(min-width: 1280px) 500px, (min-width: 768px) 40vw, 100vw" className="h-full w-full" />
                </div>
              </article>
            ) : (
              // liggende foto: breed beeld, daaronder titel en inleiding in kolommen
              <article>
                <div className="aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1]">
                  <Foto foto={cover.beeld} priority sizes="(min-width: 1280px) 1232px, 100vw" className="h-full w-full" />
                </div>
                <div className="mt-[clamp(20px,2.5vw,32px)] grid gap-y-4 md:grid-cols-12 md:gap-x-8">
                  <p className="lbl m-0 text-oranje-tekst md:col-span-3">Coververhaal · {cover.rubriek}</p>
                  <h2 className={`syne m-0 text-[clamp(32px,4.4vw,64px)] leading-[1.04] tracking-[-.03em] md:col-span-6 ${TITEL_HOVER}`}>{cover.titel}</h2>
                  <div className="md:col-span-3">
                    <p className="m-0 text-[17px] leading-[1.6] text-gedempt">{cover.beschrijving}</p>
                    <div className="mt-4"><Meta s={cover} /></div>
                    <p className="lbl m-0 mt-4">Lees verder →</p>
                  </div>
                </div>
              </article>
            )}
          </Link>
        </div>
      ) : null}

      {groepen.length ? (
        <nav aria-label="Thema's" className="wrap mt-[clamp(64px,8vw,120px)]">
          <p className="lbl m-0 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b-2 border-inkt pb-3">
            <span className="text-gedempt">Direct naar</span>
            {groepen.map((g) => (
              <a key={g.thema} href={`#${g.thema.toLowerCase()}`} className="text-inherit no-underline hover:text-oranje-tekst focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt">
                {g.thema} <span className="text-gedempt">({g.stukken.length})</span>
              </a>
            ))}
          </p>
        </nav>
      ) : null}

      {groepen.map((g) => (
        <section key={g.thema} id={g.thema.toLowerCase()} aria-labelledby={`kop-${g.thema.toLowerCase()}`} className="wrap mt-[clamp(40px,5vw,72px)] scroll-mt-8">
          <h2 id={`kop-${g.thema.toLowerCase()}`} className="syne m-0 border-b border-lijn pb-3 text-[clamp(28px,3vw,44px)] leading-[1.1] tracking-[-.02em]">{g.thema}</h2>
          <ol className="m-0 list-none p-0">
            {g.stukken.map((s) => (
              <li key={s.slug} className="border-b border-lijn">
                <Link href={`/journaal/${s.slug}`} className={`${LINK} grid grid-cols-[auto_1fr] items-start gap-x-5 py-[clamp(20px,2.5vw,32px)] md:grid-cols-12 md:items-center md:gap-x-8`}>
                  <span aria-hidden="true" className="syne text-[clamp(28px,3vw,48px)] leading-[1] tracking-[-.03em] text-gedempt md:col-span-1">{nummer(s)}</span>
                  <div className="md:col-span-7">
                    <h3 className={`syne m-0 text-[clamp(22px,2.4vw,34px)] leading-[1.12] tracking-[-.02em] ${TITEL_HOVER}`}>{s.titel}</h3>
                    <p className="m-0 mt-2 max-w-[60ch] text-[16px] leading-[1.6] text-gedempt max-sm:hidden">{s.beschrijving}</p>
                    <div className="mt-3 md:hidden"><Meta s={s} /></div>
                  </div>
                  <div className="max-md:hidden md:col-span-2"><Meta s={s} /></div>
                  <div className="aspect-[4/3] max-md:hidden md:col-span-2">
                    <Foto foto={s.beeld} sizes="200px" className="h-full w-full" />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Verder voor="Een vraag over" nadruk="jouw vijver" na="?" href="/kennismaken" label="Naar Kennismaken" />
    </>
  )
}
