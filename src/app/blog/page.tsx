import type { Metadata } from "next"
import Link from "next/link"
import { Kruimelpad } from "@/components/kruimelpad"
import { Verder } from "@/components/wereld/verder"
import { Foto } from "@/components/foto"
import { STUKKEN, type Stuk } from "@/lib/data/blog"

export const metadata: Metadata = {
  title: "Blog",
  description: "Praktische stukken over vijvers en natuurlijke tuinen bij het seizoen, uit Stein en omgeving.",
  alternates: { canonical: "/blog" },
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

function Meta({ s }: { s: Stuk }) {
  return (
    <p className="lbl m-0 text-gedempt">
      <time dateTime={s.datum}>{datum(s.datum)}</time> · {s.leestijd} min lezen
    </p>
  )
}

const LINK = "group block text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt"

// De blog als magazine (eigenaar, 22 okt 2026: "een beetje magazine stijl, en
// dezelfde breedte als rest van website"): een rustige kop in de breedte van
// de site, het nieuwste stuk groot, de rest in een raster eronder.
export default function BlogPagina() {
  const [nieuwste, ...rest] = STUKKEN
  return (
    <>
      <header className="wrap pt-[clamp(120px,14vw,200px)]">
        <Kruimelpad />
        <div className="mt-[clamp(20px,2.5vw,36px)] grid gap-y-4 border-b border-lijn pb-[clamp(24px,3vw,40px)] md:grid-cols-12 md:items-end md:gap-x-8">
          <h1 id="pagina-titel" tabIndex={-1} className="syne m-0 text-[clamp(44px,6vw,88px)] leading-[1] tracking-[-.03em] md:col-span-7">Blog</h1>
          <p className="m-0 max-w-[46ch] text-[clamp(17px,1.4vw,20px)] leading-[1.5] text-gedempt md:col-span-5">
            Uit de vijver en de tuin. Twee keer per maand een praktisch stuk bij het seizoen, met foto&apos;s van mijn eigen werk.
          </p>
        </div>
      </header>

      <div className="wrap mt-[clamp(32px,4vw,56px)]">
        {nieuwste ? (
          <Link href={`/blog/${nieuwste.slug}`} className={LINK}>
            <article className="grid gap-y-6 md:grid-cols-12 md:items-center md:gap-x-8">
              <div className="aspect-[4/3] md:col-span-7">
                <Foto foto={nieuwste.beeld} priority sizes="(min-width: 1280px) 720px, (min-width: 768px) 58vw, 100vw" className="h-full w-full" />
              </div>
              <div className="md:col-span-5">
                <p className="lbl m-0 mb-3 text-oranje-tekst">Nieuwste</p>
                <Meta s={nieuwste} />
                <h2 className="syne m-0 mt-3 text-[clamp(28px,3.2vw,48px)] leading-[1.1] tracking-[-.02em] transition-colors group-hover:text-oranje-tekst">{nieuwste.titel}</h2>
                <p className="m-0 mt-4 max-w-[46ch] text-[17px] leading-[1.6] text-gedempt">{nieuwste.beschrijving}</p>
                <p className="lbl m-0 mt-6">Lees verder →</p>
              </div>
            </article>
          </Link>
        ) : null}

        {rest.length ? (
          <ul className="m-0 mt-[clamp(56px,7vw,96px)] grid list-none gap-x-8 gap-y-12 border-t border-lijn p-0 pt-[clamp(32px,4vw,56px)] sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((s) => (
              <li key={s.slug}>
                <Link href={`/blog/${s.slug}`} className={LINK}>
                  <article>
                    <div className="aspect-[4/3]">
                      <Foto foto={s.beeld} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="h-full w-full" />
                    </div>
                    <div className="mt-4"><Meta s={s} /></div>
                    <h2 className="syne m-0 mt-2 text-[clamp(20px,1.8vw,26px)] leading-[1.2] tracking-[-.02em] transition-colors group-hover:text-oranje-tekst">{s.titel}</h2>
                    <p className="m-0 mt-2 text-[16px] leading-[1.6] text-gedempt">{s.beschrijving}</p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Verder voor="Een vraag over" nadruk="jouw vijver" na="?" href="/kennismaken" label="Naar Kennismaken" />
    </>
  )
}
